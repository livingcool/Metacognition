# Mirror — System Architecture and Data Migration Plan
*Full Technical Blueprint · v1.0*

---

## 0. Architecture Overview

Mirror is a six-layer AI system built on a JavaScript-first monorepo stack. The architecture is designed for three properties above all others:

1. **Model-agnosticism** — the LLM at Layer 4 can be swapped with one config change
2. **Memory depth** — three tiers of memory (session, compressed mid-term, long-term profile) make Mirror improve with every session
3. **Free-tier viability** — the full system runs on free-tier services until real revenue justifies paid infra

```
+----------------------------------------------------------------------+
|                     MIRROR SYSTEM ARCHITECTURE                        |
+----------------------------------------------------------------------+
|                                                                      |
|  USER                                                                |
|   |                                                                  |
|   v                                                                  |
|  [Next.js Frontend / Vercel]                                         |
|   |  - Session UI, visualisations, streaming response display        |
|   |  - Clerk auth session token in every request                     |
|   |                                                                  |
|   v                                                                  |
|  [Express.js API / Render or Railway]                                |
|   |  - Auth verification (Clerk middleware)                          |
|   |  - Session lifecycle management                                  |
|   |  - Routes to AI orchestration layer                              |
|   |                                                                  |
|   v                                                                  |
|  [AI Orchestration — LangChain.js / LangGraph.js]                   |
|   |                                                                  |
|   +-- Layer 2: Orchestrator (~200ms routing decision)                |
|   +-- Layer 3: Reasoning Engine (o3 / Claude 3.7 — async, surgical) |
|   +-- Layer 4: Execution Model (Claude Sonnet 4 — streaming)        |
|   +-- Layer 5: RAG Layer (Supabase pgvector, parallel queries)       |
|   +-- Layer 6: Memory (Supabase, 3-tier persistence)                |
|                                                                      |
|  [Supabase — Postgres + pgvector + Storage]                          |
|   - All relational data                                              |
|   - Store A: Research corpus vectors                                 |
|   - Store B: User cognitive history vectors                          |
|   - Cognitive profile JSON (long-term memory)                        |
|                                                                      |
|  [LLM Providers — via LiteLLM JS adapter]                            |
|   - Anthropic (Claude Sonnet 4, Claude 3.7)                         |
|   - OpenAI (o3, o4-mini, GPT-4o-mini, text-embedding-3-large)       |
|   - Groq (Llama 70B — privacy tier)                                 |
|                                                                      |
+----------------------------------------------------------------------+
```

---

## 1. The Six-Layer Architecture — Technical Detail

### Layer 1 — Application Interface (Next.js + Express.js)

**Role:** The front door and the voice. Listens, packages, renders. Never generates anything.

**What it does:**
- Receives raw user input (text or voice transcript from browser Web Speech API)
- Reads the active module flag from session state (Canvas / X-ray / Devil's Advocate)
- Attaches session ID, user ID, timestamp, and subscription tier
- Fetches the user's latest Cognitive Profile JSON from Supabase
- Packages everything into a typed `ContextPackage` object

```typescript
// ContextPackage type (shared types package)
interface ContextPackage {
  input: string
  sessionId: string
  userId: string
  module: 'canvas' | 'xray' | 'devils_advocate'
  profile: CognitiveProfile
  lastThreeTurns: Turn[]
  isChoiceReply: boolean
  choiceSelected?: ChoiceCard
  tier: 'free' | 'mirror' | 'mirror_pro' | 'teams'
  timestamp: string
}
```

**Critical detection:** Layer 1 detects whether the input is a new text entry or a Choice Card reply (set `isChoiceReply: true`). This is the entry point for the feedback loop.

**On the response side:** Layer 1 receives the final structured JSON from Layer 4, renders the Mirror response component (Pattern detected block, Thought DNA bars, reflection text, single question, 4 choice cards), and streams the reflection text character-by-character via Server-Sent Events.

---

### Layer 2 — Orchestrator (GPT-4o-mini, ~200ms)

**Role:** The brain. Reads, decides, delegates. Never generates user-facing text.

**Implementation:** A single fast LLM call (GPT-4o-mini via LiteLLM JS) that returns a JSON routing directive.

```typescript
interface RoutingDirective {
  executionModel: 'claude-sonnet-4' | 'gpt-4o' | 'llama-70b' | 'gemini-1.5-pro'
  requiresReasoningEngine: boolean    // triggers Layer 3
  ragStoreA: { enabled: boolean; queryTerms: string[] }
  ragStoreB: { enabled: boolean; queryTerms: string[] }
  outputIncludesChoices: boolean
  urgencyLevel: 'realtime' | 'async'
}
```

**Decision criteria:**
1. Task complexity (simple conversational turn vs. deep synthesis)
2. Privacy tier (cloud vs. self-hosted required)
3. Whether extended reasoning is needed (pattern archaeology, weekly review)
4. Whether choices should be generated (default: yes for all standard turns)

The orchestrator adds ~200ms to total latency — acceptable given it runs the fast GPT-4o-mini model.

---

### Layer 3 — Reasoning Engine (o3 / Claude 3.7 + extended thinking — async, surgical)

**Role:** The philosopher. Only activated for complex tasks. Never for real-time turns.

**When it runs:**
- Weekly deep review (triggered by user request or scheduled)
- Pattern archaeology (connect patterns across 10+ sessions)
- Calibration analysis (calculate long-term accuracy of user predictions)

**Implementation:**

```typescript
// Reasoning engine call via LiteLLM JS
const reasoningResponse = await litellm.completion({
  model: 'o3',                    // or 'claude-3-7-sonnet-20250219'
  messages: reasoningMessages,
  thinking: { type: 'enabled', budget_tokens: 8000 },  // Claude 3.7 extended thinking
  temperature: 1                   // required for extended thinking
})

// Output: structured JSON plan, never user-facing prose
interface ReasoningOutput {
  patternSurfaced: string
  citation: { author: string; year: number; finding: string }
  confidence: number
  questionToAsk: string
  choices: ChoiceCard[]
  weeklyInsights?: WeeklyAnalysis  // only for weekly review
}
```

**Runs async** — user sees "Mirror is preparing your weekly review..." while Layer 3 runs for 10–25 seconds in the background.

---

### Layer 4 — Execution Model (Claude Sonnet 4 — streaming)

**Role:** The voice. Writes Mirror's actual words. Plan executor.

**What it receives:**
```
System prompt (Mirror_v2, ~3K tokens)
+ Cognitive Profile JSON (~2K tokens)
+ Last 3 session turns (~4K tokens)
+ RAG chunks injected as XML blocks (~6K tokens)
+ Reasoning plan from Layer 3 (if available) (~1K tokens)
+ User's current input
= Total: ~16K tokens (well within 200K context limit)
```

**Swappability via ModelAdapter:**

```typescript
class ModelAdapter {
  private model: string

  constructor(config: { executionModel: string }) {
    this.model = config.executionModel  // one config value
  }

  async stream(messages: Message[]): AsyncIterable<string> {
    return litellm.completionStream({
      model: this.model,
      messages,
      stream: true
    })
  }
}

// Swap from Claude to GPT-4o: change one value in config.ts
// The orchestrator, RAG layer, and memory system are untouched
```

**Output:**

```typescript
interface MirrorResponse {
  patternDetected: { name: string; citation: string; description: string }
  dnaScores: {
    assumptionLoad: number        // 0–100
    emotionalSignal: number
    evidenceCited: number
    alternativesConsidered: number
    uncertaintyTolerance: number
  }
  reflection: string              // streamed character by character
  question: string                // exactly one, always
  choices: ChoiceCard[]           // exactly 4, always
}
```

---

### Layer 5 — RAG Knowledge Layer (Supabase pgvector)

**Role:** The library. Two stores, queried in parallel on every session turn.

**Store A — Research Corpus (shared across all users):**

```sql
-- Supabase table for research corpus
CREATE TABLE research_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536),     -- text-embedding-3-large output
  author TEXT,
  year INTEGER,
  concept_tags TEXT[],
  bias_categories TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON research_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

**Store B — User Cognitive History (per user):**

```sql
-- Per-user session history for RAG
CREATE TABLE session_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES sessions(id),
  content TEXT NOT NULL,              -- compressed session summary
  embedding VECTOR(1536),
  pattern_surfaced TEXT,
  dna_scores JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only see their own chunks
ALTER TABLE session_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own chunks" ON session_chunks
  FOR ALL USING (auth.uid() = user_id);
```

**Retrieval pipeline:**

```
Input message
    |
    v
Intent extraction (fast classifier: topic tags, bias hint, decision type)
    |
    +---------------------------+
    |                           |
    v                           v
Store A query               Store B query
Top-20 by cosine sim        Top-10 by cosine sim
    |                           |
    v                           v
Cross-encoder re-rank       Cross-encoder re-rank
Top-5 paper chunks          Top-3 history moments
    |                           |
    +---------------------------+
                |
                v
    Inject as XML blocks into Layer 4 context
    <research>{{top-5 chunks}}</research>
    <history>{{top-3 moments}}</history>
```

---

### Layer 6 — Memory and Persistence (Supabase, 3-tier)

**Role:** The mirror's memory. What Mirror knows about this person across all sessions.

**Tier 1 — Short-term (in-context):**
- Current session turns stored in the LangChain.js `ConversationBufferMemory`
- Last 3 turns injected into every Layer 4 call as full transcript
- Cleared when session ends

**Tier 2 — Mid-term (vector store):**
- At session close: LangChain.js compression chain summarises the session to ~400 tokens
- Summary embedded and written to Store B (user's vector store in Supabase)
- Enables "this is the same pattern from 6 weeks ago"

**Tier 3 — Long-term (Cognitive Profile JSON):**

```typescript
interface CognitiveProfile {
  userId: string
  dominantPatterns: Array<{ name: string; frequency: number; lastSeen: string }>
  calibrationScore: number                    // 0.0–1.0
  biaserprint: {
    confirmationBias: number                  // 0.0–1.0 frequency score
    certaintySurge: number
    urgencyCompression: number
    [bias: string]: number
  }
  predictionHistory: Array<{
    context: string
    confidenceLevel: 'certain' | 'likely' | 'uncertain'
    accuracyTracked: boolean
    accuracy?: number
  }>
  growthTimeline: Array<{
    week: string
    calibrationScore: number
    dominantPattern: string
  }>
  confirmedChoiceSignals: Array<{
    choice: string
    context: string
    confidence: number                        // 0.9 for confirmed choices
    timestamp: string
  }>
  updatedAt: string
}
```

**Profile update logic:**
```
Session ends
    |
    v
Layer 6 write-back agent
    |
    +-- Compress session to ~400 tokens -> embed -> write to Store B
    +-- Update dominant_patterns[] (merge new patterns, decay old ones)
    +-- Update calibration_score (Bayesian update from session data)
    +-- Update bias_fingerprint (increment bias category frequencies)
    +-- If choice card selected: write to confirmed_choice_signals[] (weight: 0.9)
    +-- Append growth_timeline entry
    +-- Write updated CognitiveProfile JSON to Supabase
```

---

## 2. The Feedback Loop — Technical Flow

```
+----------------------------------------------------------+
|                    THE MIRROR FEEDBACK LOOP               |
+----------------------------------------------------------+
|                                                          |
|  User types                                              |
|     |                                                    |
|     v                                                    |
|  Layer 1: ContextPackage assembled                       |
|     |                                                    |
|     v                                                    |
|  Layer 2: Orchestrator routes (200ms)                    |
|     |                                                    |
|     +----> Layer 5: RAG parallel query                   |
|     |       (Store A: top-5 paper chunks)                |
|     |       (Store B: top-3 history moments)             |
|     |                                                    |
|     v                                                    |
|  Layer 4: Execution Model generates response             |
|     (streams to frontend via SSE)                        |
|     |                                                    |
|     v                                                    |
|  User sees: Pattern + DNA + Reflection + Question        |
|     + 4 Choice Cards                                     |
|     |                                                    |
|     v                                                    |
|  User selects a Choice Card                              |
|     |                                                    |
|     v                                                    |
|  Layer 1: isChoiceReply = true, choiceSelected attached  |
|     |                                                    |
|     v                                                    |
|  Layer 6: Choice written to confirmedChoiceSignals[]     |
|     (confidence: 0.9 — stronger than inferred signals)  |
|     |                                                    |
|     v                                                    |
|  Loop: new ContextPackage with updated profile           |
|     -> next response is MORE PRECISE                     |
|                                                          |
|  After 10 sessions: Mirror's model of this person is    |
|  built on confirmed signals, not just inference          |
+----------------------------------------------------------+
```

---

## 3. The Agentic Pipeline — Weekly Deep Review

```
TRIGGER: User requests weekly review (or scheduled Sunday night)
    |
    v
LangGraph.js StateGraph initialised
    |
    v
[Node 1] Retrieval Agent
  - vector_search(Store B, days=7)    -> last 7 days of sessions
  - fetch_profile(userId)             -> current CognitiveProfile JSON
  - rag_query(Store A, themes=[])     -> relevant research for this week's patterns
    |
    v
[Node 2] Reasoning Agent (o3 / Claude 3.7 extended thinking)
  - Input: retrieved sessions + profile + research chunks
  - Extended thinking: budget_tokens = 8,000
  - Runtime: 10–25 seconds (async)
  - Output: WeeklyAnalysis JSON
    {
      strongestPatternThisWeek: string,
      calibrationDrift: number,
      crossSessionInsight: string,
      recommendedFocusModule: string,
      topResearchCitation: Citation
    }
    |
    v
[Node 3] Planning Agent (GPT-4o-mini)
  - Converts WeeklyAnalysis -> SessionPlan JSON
    {
      openingQuestion: string,
      priorityPattern: string,
      moduleRecommended: string,
      fiveReflectionPrompts: string[]
    }
    |
    v
[Node 4] Execution Agent (Claude Sonnet 4)
  - Generates weekly review text from SessionPlan
  - Streamed to frontend
    |
    v
[Node 5] Memory Write-back
  - write_summary(sessionId)      -> compress + embed + Store B
  - update_profile(userId, delta) -> update CognitiveProfile JSON
  - index_moments()               -> re-embed any pattern changes
```

---

## 4. Infrastructure Diagram

```
+---------------------------------------------------------------+
|                    MIRROR INFRASTRUCTURE                       |
+---------------------------------------------------------------+
|                                                               |
|  USER BROWSER                                                 |
|  +-----------+                                                |
|  | Next.js   | <-- Vercel (free tier, CDN-distributed)       |
|  | Frontend  |                                                |
|  +-----------+                                                |
|       |                                                       |
|       | HTTPS (Clerk JWT in Authorization header)             |
|       v                                                       |
|  +-----------+                                                |
|  | Express   | <-- Render or Railway (free tier)             |
|  | API       |     Auto-deploys from GitHub Actions          |
|  +-----------+                                                |
|       |              |                    |                   |
|       |              |                    |                   |
|       v              v                    v                   |
|  +---------+   +---------+         +-----------+             |
|  |Supabase |   | Clerk   |         | LLM APIs  |             |
|  |Postgres |   | Auth    |         | Anthropic |             |
|  |pgvector |   |(free    |         | OpenAI    |             |
|  |(free    |   | tier)   |         | Groq      |             |
|  | tier)   |   +---------+         +-----------+             |
|  +---------+                                                  |
|       |                                                       |
|       v                                                       |
|  +-----------+   +-----------+                               |
|  | Langfuse  |   | Sentry    |                               |
|  | (LLM obs) |   | (errors)  |                               |
|  |(free/self)|   |(free tier)|                               |
|  +-----------+   +-----------+                               |
+---------------------------------------------------------------+
```

---

## 5. Data Migration Plan

### 5.1 Migration Scenarios

Mirror will encounter two distinct migration scenarios:

**Scenario A: Alpha → Beta (internal to external users)**
Data created by 10 internal alpha users must persist correctly into the beta environment without loss or profile corruption.

**Scenario B: Schema Evolution (as the product evolves)**
The Cognitive Profile JSON schema and database tables will evolve as new features are added. Every schema change requires a safe, reversible migration.

### 5.2 Supabase Migration Strategy

Supabase uses Postgres migrations via the Supabase CLI. All schema changes are versioned SQL files committed to the repository.

```
/supabase
  /migrations
    20260301_001_initial_schema.sql
    20260315_002_add_growth_timeline.sql
    20260320_003_add_prediction_tracking.sql
    20260401_004_add_team_features.sql
```

**Migration rules:**
1. **Always additive first:** New columns default to `NULL` or a safe default. Never remove a column directly — deprecate first, remove in a later migration.
2. **Test on staging before production:** Every migration runs on a Supabase staging project (free separate project) before touching production.
3. **Rollback scripts:** Every migration file has a corresponding `DOWN` script documented in a comment block.

### 5.3 Cognitive Profile JSON Schema Evolution

The Cognitive Profile JSON is stored as a `JSONB` column in Supabase, which gives schema flexibility. However, the application code must handle both old and new profile shapes — use versioned profile migration functions:

```typescript
// Profile migration function example
function migrateCognitiveProfileV1ToV2(profile: CognitiveProfileV1): CognitiveProfileV2 {
  return {
    ...profile,
    // V2 adds growthTimeline (not in V1)
    growthTimeline: [],
    // V2 renames bias_fingerprint -> biasFingerprint
    biasFingerprint: profile.bias_fingerprint ?? {},
    schemaVersion: 2
  }
}

// Run at session start: detect version, migrate in-memory, save updated
async function loadAndMigrateProfile(userId: string): Promise<CognitiveProfile> {
  const raw = await supabase.from('cognitive_profiles').select('*').eq('user_id', userId)
  const profile = raw.data[0]
  if (profile.schemaVersion < CURRENT_VERSION) {
    return migrateToLatest(profile)
  }
  return profile
}
```

### 5.4 Vector Store Migration (Re-embedding)

When the embedding model changes (e.g. from `text-embedding-3-small` to `text-embedding-3-large`), all existing vectors must be re-embedded:

```
Migration plan for embedding model upgrade:
  Step 1: Add a new column: embedding_v2 VECTOR(1536)
  Step 2: Run background job to re-embed all chunks in batches of 100
  Step 3: Dual-read period: query both embedding columns, return best result
  Step 4: Once all rows have embedding_v2: update query logic to use only v2
  Step 5: Drop embedding_v1 column in a later migration
```

**Estimated re-embedding time:** 500 papers × ~10 chunks/paper = 5,000 chunks. At OpenAI batch embedding speed: approximately 10–15 minutes. User history Store B: proportional to user count.

### 5.5 Alpha → Beta Data Migration Checklist

```
Pre-migration:
  [ ] Full Supabase backup (export to CSV + pg_dump)
  [ ] Document all user IDs and their session counts
  [ ] Verify cognitive profile integrity for all alpha users
  [ ] Run migration scripts in dry-run mode against a copy

Migration:
  [ ] Apply pending schema migrations to production
  [ ] Migrate Cognitive Profile JSON schemas for existing profiles
  [ ] Verify vector indices are valid after any schema changes
  [ ] Run integrity checks: session count matches vector chunk count per user

Post-migration:
  [ ] Run full RAG query test for each alpha user's profile
  [ ] Verify streaming response works end-to-end
  [ ] Monitor Sentry for 24 hours: zero new errors from migration
  [ ] Notify alpha users: "Your session history and profile are fully intact."
```

---

## 6. Security Architecture

```
+--------------------------------------------------------------------+
|                    SECURITY LAYERS                                  |
+--------------------------------------------------------------------+
|                                                                    |
|  Layer             | Mechanism                    | Free Tool      |
|--------------------+------------------------------+----------------|
|  Auth              | Clerk JWT verification       | Clerk free     |
|  API Auth          | Express middleware validates | Clerk SDK      |
|                    | JWT on every request         |                |
|  DB Isolation      | Supabase Row-Level Security  | Supabase free  |
|                    | (users see only their data)  |                |
|  Rate Limiting     | express-rate-limit           | Open source    |
|                    | 60 req/min per user          |                |
|  Input Validation  | Zod schemas on all inputs    | Open source    |
|  Security Headers  | Helmet.js on Express         | Open source    |
|  Secret Management | Render/Railway env vars      | Free built-in  |
|  Logging           | No user content in any log   | Policy         |
|  Encryption        | TLS in transit (Render/Vercel)| Free built-in  |
|  At rest           | Supabase encrypted storage   | Free built-in  |
+--------------------------------------------------------------------+
```

---

## 7. Scalability — When Free Runs Out

The architecture is designed so that the transition from free tier to paid is a configuration change, not a rebuild:

```
At 1,000 users:
  Supabase free (500MB) may limit -> Upgrade to Supabase Pro ($25/mo)
  Render free (sleeps) -> Upgrade to Render Starter ($7/mo)
  Langfuse free tier -> Self-host on Render ($7/mo) or Langfuse Cloud

At 10,000 users:
  Add read replicas on Supabase for RAG query load
  Move to Pinecone for Store A (research corpus) if Supabase pgvector
    struggles with search latency at 5M+ vectors
  Add Redis caching layer (Upstash free tier) for cognitive profiles
    that are read on every session start

At 100,000 users:
  Kubernetes on AWS/GCP for Express.js API
  Dedicated Pinecone environment for vector stores
  Supabase Enterprise or self-hosted Postgres
  CDN for static assets: Cloudflare (free tier already handles this)
```

---

*Mirror · System Architecture and Data Migration Plan · v1.0 · March 2026*
*RootedAI — Metacognition AI · Express.js + Next.js + Supabase + Free-First Infrastructure*
