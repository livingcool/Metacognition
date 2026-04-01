# Mirror — Technology Stack
*Full Stack Specification · Metacognition AI · v1.0*

---

## 0. Stack Philosophy

Mirror's tech stack is chosen on three principles:

1. **Free where possible, paid where it matters.** The infrastructure must cost zero (or near-zero) during pre-revenue stages. We use free tiers aggressively — Supabase, Render, Railway, Clerk, Langfuse — and only pay when a limit is genuinely hit by real user growth.

2. **JavaScript end-to-end.** Express.js on the backend + Next.js on the frontend means one language, one ecosystem, shared types, and a team that can move fluidly across the stack. No context-switching between Python and TypeScript.

3. **AI components are modular and swappable.** Every AI dependency (the LLM, the vector store, the embedding model) sits behind an abstraction. Swapping providers requires a config change, not a code rewrite.

---

## 1. Stack Overview

```
+------------------------------------------------------------------+
|                     MIRROR — FULL STACK                          |
+------------------------------------------------------------------+
|  LAYER              | TECHNOLOGY          | TIER / COST          |
+---------------------+---------------------+----------------------+
|  Frontend           | Next.js 14          | Free (Vercel free)   |
|  Backend API        | Express.js (Node)   | Free (Render / Rail) |
|  Database           | Supabase (Postgres) | Free (500MB)         |
|  Vector Store       | Supabase pgvector   | Free (bundled)       |
|  Auth               | Clerk               | Free (10K MAU)       |
|  LLM - Execution    | Claude Sonnet 4     | Pay per token        |
|  LLM - Reasoning    | o3 / Claude 3.7     | Pay per token        |
|  LLM Adapter        | LiteLLM (JS)        | Open source / free   |
|  Agentic Framework  | LangChain.js        | Open source / free   |
|  Embeddings         | OpenAI ada-3-large  | Pay per token        |
|  LLM Observability  | Langfuse            | Free (self-host)     |
|  Error Tracking     | Sentry              | Free (5K events/mo)  |
|  Payments           | Stripe              | 2.9% + 30c per txn   |
|  CI/CD              | GitHub Actions      | Free (2K min/mo)     |
|  Hosting (API)      | Render              | Free tier            |
|  Hosting (Frontend) | Vercel              | Free tier            |
+---------------------+---------------------+----------------------+
```

---

## 2. Frontend — Next.js 14

### Why Next.js 14 (App Router)

Next.js is the natural choice for Mirror's frontend because:
- **Server-side rendering** — the initial session page renders on the server; critical for perceived performance when loading a user's cognitive profile
- **React Server Components (RSC)** — visualisations like the Thought DNA chart and growth timeline can be rendered server-side, streamed to the client
- **Streaming responses** — Next.js natively handles server-sent events, allowing Mirror's reflections to stream character-by-character from the LLM
- **File-based routing** — clean route structure for sessions, profile, modules, archive, settings

### Directory Structure

```
/app
  /page.tsx              -> Home (session feed)
  /session
    /[id]/page.tsx       -> Active session view
  /profile/page.tsx      -> Cognitive profile page
  /modules/page.tsx      -> Module selector
  /archive/page.tsx      -> Session archive and search
  /settings/page.tsx     -> Account, billing, privacy
  /api
    /session/route.ts    -> Proxies to Express API
    /stream/route.ts     -> SSE streaming endpoint

/components
  /session
    MirrorResponse.tsx   -> Pattern + DNA + reflection + choices
    ThoughtDNA.tsx       -> Bar chart (5 dimensions)
    ChoiceCards.tsx      -> 2x2 grid of choices
    InputField.tsx       -> Text + voice input
  /profile
    BiasFingerprint.tsx  -> Radar chart
    GrowthTimeline.tsx   -> Line chart
    CalibrationScore.tsx -> Animated score display
  /ui
    PatternBadge.tsx     -> Pattern name + citation pill
    ModuleChip.tsx       -> Canvas / X-ray / Devil's Advocate
```

### Hosting: Vercel (Free Tier)

- Free tier: unlimited deployments, 100GB bandwidth/month, serverless functions
- Auto-deploy on push to main branch
- Preview deployments on every PR — essential for UI review
- Custom domain support on free tier

---

## 3. Backend API — Express.js (Node.js)

### Why Express.js

Express.js is the right backend choice for Mirror for several reasons:

- **Same language as frontend** — one language (TypeScript) across the entire stack, shared types and interfaces
- **Lightweight and composable** — Mirror's backend is primarily a routing and orchestration layer; Express's minimal footprint is ideal
- **Excellent AI library support** — LangChain.js, OpenAI Node SDK, Anthropic Node SDK, Supabase JS client — all are first-class Node.js libraries
- **Streaming support** — Express handles Server-Sent Events (SSE) and streaming responses natively, critical for Mirror's real-time LLM output
- **Large ecosystem** — middleware for auth verification (Clerk SDK), rate limiting (express-rate-limit), logging (Pino), and validation (Zod)

### API Structure

```
/api
  /session
    POST   /session/start          -> Creates new session, loads user profile
    POST   /session/:id/message    -> Processes user input, streams Mirror response
    POST   /session/:id/choice     -> Records choice card selection to Layer 6
    POST   /session/:id/end        -> Closes session, compresses summary, writes memory
    GET    /session/:id            -> Returns full session transcript
    GET    /sessions               -> Returns session feed for homepage

  /profile
    GET    /profile/:userId        -> Returns full cognitive profile JSON
    GET    /profile/:userId/growth -> Returns growth timeline data

  /modules
    GET    /modules                -> Returns available modules list

  /rag
    POST   /rag/query              -> Internal: RAG retrieval (called by Orchestrator)
    POST   /rag/ingest             -> Admin: ingests new research papers

  /admin
    GET    /admin/cost-dashboard   -> LLM cost per user per session
    GET    /admin/pattern-accuracy -> Pattern accuracy metrics
```

### Middleware Stack

```
Request -> [Auth Verification] -> [Rate Limiting] -> [Validation (Zod)]
        -> [Route Handler] -> [LLM Orchestration] -> [Response / Stream]
                                     |
                         [Langfuse Observability]
                         [Sentry Error Tracking]
```

### Hosting: Render (Free Tier)

- Free tier: Express.js web service, 750 hours/month (enough for one always-on service)
- Auto-deploy on GitHub push
- Environment variables managed in Render dashboard
- Free PostgreSQL database (90 days, then use Supabase instead)
- **Limitation:** Free tier sleeps after 15 minutes of inactivity — acceptable for alpha/beta; upgrade to Render Starter ($7/mo) for production

**Alternative: Railway**
- Free $5 credit monthly — runs Express.js + background workers
- Better for services that need to stay awake
- One-click GitHub deploy, built-in PostgreSQL

---

## 4. Database — Supabase (Free Tier)

### Why Supabase

Supabase bundles everything Mirror needs in a single free-tier service:
- **PostgreSQL** — relational database for users, sessions, profiles
- **pgvector extension** — vector store for RAG (both Store A and Store B) built directly into Postgres
- **Row-Level Security (RLS)** — user data isolation enforced at the database level
- **Realtime subscriptions** — optional for future live session features
- **Storage** — for any uploaded documents or session exports
- **Auto-generated REST and GraphQL APIs** — optional, Mirror uses the Node.js client directly

### Free Tier Limits

| Resource | Free Tier Limit | Mirror Usage Estimate |
|---|---|---|
| Database size | 500MB | Sufficient for ~10K users with full profiles |
| Vector dimensions | 1536 (text-embedding-3-large) | Matches embedding model |
| Monthly active users | Unlimited | No MAU restriction on DB |
| API requests | Unlimited | No rate limit on DB queries |
| Bandwidth | 5GB/month | Sufficient for alpha/beta stage |

### Schema Overview

```
users                    sessions                 cognitive_profiles
-------                  --------                 ------------------
id (uuid)                id (uuid)                user_id (uuid, FK)
clerk_user_id            user_id (uuid, FK)       dominant_patterns[]
email                    module_type              calibration_score
created_at               started_at               bias_fingerprint (jsonb)
tier                     ended_at                 prediction_history (jsonb)
                         summary_text             growth_timeline (jsonb)
                         pattern_surfaced         updated_at
                         dna_scores (jsonb)

session_chunks (vector store B)   research_chunks (vector store A)
---------------------------------  ---------------------------------
id (uuid)                          id (uuid)
session_id (uuid, FK)              embedding vector(1536)
user_id (uuid, FK)                 content text
embedding vector(1536)             author text
content text                       year int
metadata (jsonb)                   concept_tags text[]
created_at                         bias_categories text[]
```

---

## 5. AI and LLM Layer

### 5.1 LiteLLM (JavaScript)

LiteLLM JS provides a unified interface for calling any LLM provider. Mirror's ModelAdapter is built on top of it.

```javascript
// One config change to swap the execution model
const modelConfig = {
  execution: 'claude-sonnet-4',   // or 'gpt-4o', 'gemini-1.5-pro', 'ollama/llama3.1'
  reasoning: 'o3',                // or 'claude-3-7-sonnet-extended'
  orchestrator: 'gpt-4o-mini'    // always fast, always cheap
}
```

### 5.2 LangChain.js and LangGraph.js

LangChain.js handles:
- RAG pipeline (retrieval, re-ranking, injection)
- Prompt template management
- Memory compression chains

LangGraph.js handles:
- The 5-step agentic pipeline (weekly review)
- Stateful multi-agent graphs with conditional routing
- Agent-to-agent communication via typed state objects

### 5.3 Model Matrix

| Model | Role in Mirror | Cost per call |
|---|---|---|
| Claude Sonnet 4 | Layer 4 execution — all real-time turns | ~$0.003/session |
| GPT-4o-mini | Layer 2 orchestrator — routing decision | ~$0.0001/call |
| o3 / o4-mini | Layer 3 reasoning — deep synthesis, weekly review | ~$0.04-0.12/review |
| Claude 3.7 + thinking | Layer 3 alternative — extended reasoning | ~$0.06-0.15/review |
| text-embedding-3-large | Embeddings for RAG corpus and user history | ~$0.0001/1K tokens |
| Llama 3.1 70B (Groq) | Privacy tier — self-hosted or Groq API | $0.00 (Groq free tier) |

---

## 6. Auth — Clerk (Free Tier)

Clerk handles all authentication and user management:

- **Free tier:** 10,000 Monthly Active Users — more than sufficient through launch
- **Features:** Email/password, Google OAuth, magic links
- **Session tokens** verified in Express middleware via Clerk Node.js SDK
- **Webhooks:** user.created event triggers cognitive profile initialisation in Supabase
- **Subscription tier** management: custom metadata on Clerk user object stores Mirror plan tier

---

## 7. LLM Observability — Langfuse (Free / Self-hosted)

Langfuse provides full observability into every LLM call:

- **Cost tracking:** token usage and cost per session, per user, per model
- **Latency tracking:** end-to-end response time, time-to-first-token
- **Trace viewer:** full request trace showing each layer's inputs and outputs
- **Prompt versioning:** all prompt versions tracked, A/B experiment support
- **Free cloud tier:** 50K observations/month — sufficient for alpha and beta
- **Self-hostable:** deploy on Render or Railway free tier for unlimited observations

---

## 8. Error Tracking — Sentry (Free Tier)

- **Free tier:** 5,000 errors/month, 10,000 performance transactions
- Integrated into both Next.js frontend and Express.js backend
- Alert rules: any Layer 3 timeout, any RAG retrieval error, any LLM API error
- Source maps for production debugging

---

## 9. Hosting Summary — 100% Free at Alpha/Beta

```
+----------------------+------------------+----------------------------+
| Service              | Provider         | Free Tier Limit            |
+----------------------+------------------+----------------------------+
| Frontend (Next.js)   | Vercel           | 100GB bandwidth, unlimited |
|                      |                  | deployments                |
+----------------------+------------------+----------------------------+
| Backend (Express.js) | Render           | 750hrs/month, auto-deploy  |
|                      | or Railway       | $5 free credit/month       |
+----------------------+------------------+----------------------------+
| Database + Vectors   | Supabase         | 500MB storage, unlimited   |
|                      |                  | API requests               |
+----------------------+------------------+----------------------------+
| Auth                 | Clerk            | 10,000 MAU free            |
+----------------------+------------------+----------------------------+
| LLM Observability    | Langfuse         | 50K observations/month     |
|                      |                  | or free self-host          |
+----------------------+------------------+----------------------------+
| Error Tracking       | Sentry           | 5K errors/month free       |
+----------------------+------------------+----------------------------+
| CI/CD                | GitHub Actions   | 2,000 minutes/month free   |
+----------------------+------------------+----------------------------+
| Domain               | Cloudflare       | Free DNS, free CDN         |
+----------------------+------------------+----------------------------+
```

**Total infrastructure cost at alpha: $0/month** (excluding LLM API costs which scale with usage)

---

## 10. Development Environment

```
Node.js 20 LTS
TypeScript 5.x (strict mode)
pnpm (package manager — faster than npm, monorepo support)

Monorepo structure:
/
  /apps
    /web      -> Next.js frontend
    /api      -> Express.js backend
  /packages
    /types    -> Shared TypeScript types (Zod schemas)
    /ai       -> LLM adapter, RAG pipeline, LangChain.js wrappers
    /db       -> Supabase client, database queries, migrations

Local dev:
  pnpm dev --filter=api     -> Express on localhost:3001
  pnpm dev --filter=web     -> Next.js on localhost:3000
  supabase start            -> Local Supabase via Docker
```

---

## 11. Security Practices

- All secrets in environment variables (never in code)
- Supabase Row-Level Security (RLS) enforced on all user tables
- JWT verification on every Express route via Clerk middleware
- express-rate-limit: 60 requests/minute per user, 5 requests/minute per session message
- Helmet.js: security headers on all Express responses
- Input sanitisation: Zod schemas validate all incoming request bodies
- No user content in logs (pattern surfaced, DNA scores — yes; raw session text — never)

---

## 12. Upgrade Path (When to Leave Free Tier)

| Trigger | Upgrade |
|---|---|
| Render sleeping causes user complaints | Render Starter: $7/month |
| Supabase 500MB hit (~10K users) | Supabase Pro: $25/month |
| Clerk 10K MAU hit | Clerk Pro: $25/month |
| Langfuse 50K observations/month hit | Self-host on Render ($7) or Langfuse Cloud ($49) |
| Vercel bandwidth limits hit | Vercel Pro: $20/month |

**Total paid infra cost at 10K MAU:** approximately $57-$82/month — easily covered by subscription revenue at that scale.

---

*Mirror · Technology Stack · v1.0 · March 2026*
*RootedAI — Metacognition AI · Express.js + Next.js + Supabase · Free-first infrastructure*
