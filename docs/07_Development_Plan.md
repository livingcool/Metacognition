# Mirror — Complete Development Plan
*Stage-by-Stage Build Guide · Metacognition AI · v1.0*

---

## 0. How to Read This Document

This development plan is the execution blueprint for Mirror. It translates the architecture docs, SDLC, tech stack, UX/UI spec, and product strategy into a sequence of concrete builds — what you build, in what order, why that order matters, and what "done" looks like at every stage.

The plan is split across 5 stages mirroring the SDLC phases. Each stage has: goals, a task-by-task breakdown, what to test before moving forward, and what NOT to build yet (scope boundaries matter as much as scope inclusions).

Total estimated timeline: **24 weeks from zero to public launch.**

---

## Stage 0 — Ground Work (Weeks 1–4)
*Before a single line of product code is written*

The temptation at this stage is to start building. Resist it. Every week spent here saves three weeks of expensive rework later. This stage defines what Mirror is, who it is for, and what the machine underneath it needs to do.

### 0.1 Research Corpus Foundation

The research corpus is Mirror's intellectual backbone. Without it, Mirror has no grounding — it is just another chatbot. This work runs in parallel with technical setup and must start on Day 1.

**Tasks:**
- Source 200+ primary metacognition and decision science papers from Google Scholar, Semantic Scholar, PsycINFO, and JSTOR
- Build a simple tagging taxonomy: each paper gets `concept_tags[]` and `bias_categories[]` labels manually assigned
- Categories to seed the taxonomy: overconfidence, certainty surge, confirmation bias, urgency compression, availability heuristic, sunk cost, system 1 overreach, planning fallacy, anchoring, Dunning-Kruger
- For each paper, extract: title, author(s), year, key finding (1–2 sentences), which bias categories it covers
- Store in a spreadsheet first — this becomes the ingestion manifest later
- Target: 200 papers minimum. Ideal: 350+ before ingestion

**Deliverable:** A structured CSV with columns: `filename`, `author`, `year`, `key_finding`, `concept_tags`, `bias_categories` — ready to feed the paper ingestion pipeline in Stage 1.

### 0.2 System Prompt Research and Drafting

The Mirror system prompt is not just a prompt — it is the product's voice, personality, and operating rules. Draft it before any code exists.

**Tasks:**
- Define Mirror's voice in writing: research-grounded, precise, never patronising, never cheerful, always honest
- Draft the first system prompt (Mirror_v0.1): include Mirror's role, output format rules, citation rules, the "one question only" rule, the DNA scoring rubric, the choice card generation rules
- Create 30 "test inputs" — real things a user might say in a Mirror session — that cover a range of complexity, emotion, and cognitive pattern types
- Manually evaluate your prompt draft against these 30 inputs: does Mirror respond the way you want?
- Iterate prompt until you are satisfied with 25+ of 30 test inputs

**Deliverable:** `prompt_v0.1.md` in version control. 30 golden test inputs with expected outputs documented. This becomes the regression test suite foundation.

### 0.3 User Archetype Interviews

Even with one founder/engineer, conduct at least 5–10 structured interviews before building.

**Tasks:**
- Identify 10–15 potential users (founders, senior managers, coaches, knowledge workers)
- Run 45-minute structured interviews: "Tell me about the last big decision you made. What happened? What would have helped you think about it differently?"
- Extract: their current reflection habits, what tools they use, what fails, what a "thinking mirror" would need to do to earn their daily use
- Synthesise into 3–5 user archetypes with their dominant cognitive patterns documented

**Deliverable:** User archetype document. Directly feeds the onboarding flow design and which cognitive patterns Mirror should prioritise surfacing first.

### 0.4 Architecture Decision Locks

Every major system decision must be written down and signed off before Stage 1 begins. These are the decisions that cost the most to reverse later.

**Locked decisions needed:**
- Backend: Express.js (Node.js) — confirmed
- Frontend: Next.js 14 with App Router — confirmed
- Database: Supabase (pgvector) — confirmed
- Auth: Clerk (free tier) — confirmed
- Hosting: Render + Vercel (free) — confirmed
- LLM execution: Claude Sonnet 4 via LiteLLM JS — confirmed
- LLM reasoning: o3 or Claude 3.7 with extended thinking — confirmed
- Embeddings: text-embedding-3-large — confirmed
- Agentic framework: LangChain.js + LangGraph.js — confirmed
- Monorepo tool: pnpm workspaces — confirmed

**Deliverable:** ADR document (Architecture Decision Record) — one page, one decision per row, rationale documented for each.

---

## Stage 1 — Infrastructure and Engine (Weeks 5–10)
*The foundation that no user will see — and that everything depends on*

This stage is all plumbing: no UI, no chat interface, no clever prompts visible to users. Just the scaffolding that makes Mirror possible. By the end of Stage 1, you should be able to make a single API call and get a structured MirrorResponse JSON back. That's the entire goal.

### 1.1 Monorepo Setup and Dev Environment (Week 5, Days 1–3)

**Tasks:**
- Initialise pnpm monorepo: `pnpm init` in root, create `apps/api`, `apps/web`, `packages/types`, `packages/ai`, `packages/db`
- Install Node.js 20 LTS, configure TypeScript 5.x strict mode across all packages
- Set up ESLint + Prettier with shared config across both apps
- Configure `pnpm dev` to run API on port 3001 and web on port 3000 concurrently
- Initialise local Supabase via Docker using `supabase init` and `supabase start`
- Create GitHub repository, set up branch protection on `main` (require PR + tests to merge)

**Done when:** `pnpm dev` runs both apps locally. Supabase Studio is accessible at localhost:54323.

### 1.2 Supabase Schema and Database Foundation (Week 5, Days 4–5 + Week 6)

**Tasks:**
- Enable pgvector extension on Supabase: `CREATE EXTENSION IF NOT EXISTS vector`
- Write the initial schema migration (`20260301_001_initial_schema.sql`) covering:
  - `users` table (id, clerk_user_id, email, created_at, tier)
  - `sessions` table (id, user_id, module_type, started_at, ended_at, summary_text, pattern_surfaced, dna_scores JSONB)
  - `cognitive_profiles` table (user_id FK, dominant_patterns[], calibration_score, bias_fingerprint JSONB, growth_timeline JSONB, schema_version)
  - `research_chunks` table (id, content, embedding VECTOR(1536), author, year, concept_tags[], bias_categories[])
  - `session_chunks` table (id, session_id FK, user_id FK, content, embedding VECTOR(1536), pattern_surfaced, dna_scores JSONB)
- Create vector indices: `ivfflat` on both `research_chunks.embedding` and `session_chunks.embedding`
- Enable Row-Level Security (RLS) on `session_chunks` and `cognitive_profiles`
- Write RLS policies: users can only read/write their own rows
- Create the `packages/db` package: typed Supabase client, typed query helpers for all tables
- Write Zod schemas for all database input/output shapes

**Done when:** Schema migrations run clean. RLS is active. You can insert and query a row from each table via the Supabase client in a test script.

### 1.3 Express.js API Scaffold (Week 6)

**Tasks:**
- Initialise `apps/api`: Express.js with TypeScript, Zod for validation, Helmet.js for security headers
- Set up middleware chain: `cors`, `helmet`, `express.json`, `pino` logger, `express-rate-limit`
- Integrate Clerk Express SDK: `clerkMiddleware()` on all authenticated routes
- Set up route structure (empty handlers to start):
  - `POST /api/session/start`
  - `POST /api/session/:id/message`
  - `POST /api/session/:id/choice`
  - `POST /api/session/:id/end`
  - `GET /api/session/:id`
  - `GET /api/sessions`
  - `GET /api/profile/:userId`
  - `POST /api/rag/ingest` (admin only)
- Set up Sentry integration: `Sentry.init()` in API entry point, Sentry error handler middleware at the bottom
- Set up Langfuse client: `Langfuse` constructor with API keys from env vars
- Configure environment variables via `dotenv`, document all required env vars in `env.example`
- Deploy to Render: connect GitHub repo, set env vars in dashboard, confirm auto-deploy works

**Done when:** `POST /api/session/start` returns a 200 with a mock session object. Clerk auth is enforced — unauthenticated requests return 401.

### 1.4 Research Corpus Ingestion Pipeline — RAG Store A (Week 7)

This is one of the two most critical pieces of Stage 1. The quality of the RAG retrieval determines whether Mirror sounds grounded or generic.

**Tasks:**
- Build the paper ingestion script (`packages/ai/scripts/ingest-papers.ts`):
  - Input: directory of PDFs or the CSV manifest from Stage 0.1
  - Step 1: Extract text from each PDF (use `pdf-parse` or `pdfjs-dist`)
  - Step 2: Chunk each paper: 512-token chunks, 64-token overlap (use `@langchain/textsplitters` `RecursiveCharacterTextSplitter`)
  - Step 3: For each chunk, call OpenAI Embeddings API (`text-embedding-3-large`) to get the 1536-dimension vector
  - Step 4: Insert into `research_chunks` table: content, embedding, author, year, concept_tags[], bias_categories[]
  - Step 5: Batch embeds in groups of 100 to avoid rate limiting
- Run the ingestion pipeline on your 200+ paper corpus
- Build a test query script: given a text query, retrieve top-5 chunks by cosine similarity
- Evaluate retrieval quality manually: for 10 known queries (e.g. "overconfidence in decision making"), do the top-5 chunks look correct?
- Adjust chunk size or overlap if retrieval quality is poor

**Done when:** 200+ papers are ingested. A test query returns correctly relevant chunks. Precision@5 is measured as a baseline.

### 1.5 ModelAdapter and LLM Integration (Week 8)

**Tasks:**
- Build `packages/ai/model-adapter.ts`: wraps LiteLLM JS with a unified interface
- Implement `stream()` method: takes messages array, returns `AsyncIterable<string>`
- Implement `complete()` method: non-streaming, returns full response string
- Add Langfuse tracing: every LLM call is wrapped with `langfuse.trace()` — logs model, tokens, cost, latency
- Integrate Claude Sonnet 4 as default execution model
- Integrate GPT-4o-mini as orchestrator model
- Write the Layer 2 Orchestrator function: takes `ContextPackage`, calls GPT-4o-mini, returns `RoutingDirective`
- Write the Layer 4 Execution function: takes routing directive + RAG context + system prompt, calls Claude Sonnet 4, streams response

**Done when:** You can call `processMessage(contextPackage)` and receive a streaming `MirrorResponse` JSON with real pattern detection, a question, and 4 choice cards.

### 1.6 Session Handler and RAG Retrieval (Week 9)

**Tasks:**
- Build the parallel RAG retrieval function:
  - `retrieveResearch(queryTerms, topK=5)`: queries Store A, cosine sim, returns top-5 chunks
  - `retrieveUserHistory(userId, queryTerms, topK=3)`: queries Store B, cosine sim, returns top-3 past moments
  - Run both in parallel (Promise.all)
  - Format results as XML blocks: `<research>...</research>` and `<history>...</history>`
- Build the `ContextPackage` assembler in the session/message Express route:
  - Fetch user's cognitive profile from Supabase
  - Fetch last 3 session turns from session state
  - Detect `isChoiceReply` flag
  - Assemble the full package
- Implement session start handler: creates session row in Supabase, initialises `ConversationBufferMemory` in LangChain.js
- Implement session message handler: builds ContextPackage → RAG parallel query → Layer 2 routing → Layer 4 execution → SSE stream back to client

**Done when:** End-to-end: POST to `/api/session/start`, then POST to `/api/session/:id/message` with a text input, and receive a streaming MirrorResponse with research citations from the actual corpus.

### 1.7 Layer 6 — Memory and Profile Write-back (Week 10)

**Tasks:**
- Implement session close handler (`POST /api/session/:id/end`):
  - Compress session to ~400 tokens using LangChain.js summarisation chain
  - Embed the summary using text-embedding-3-large
  - Write to `session_chunks` table (Store B)
  - Update `cognitive_profiles` table: merge new patterns, update calibration_score, update bias_fingerprint
- Implement profile initialisation on first session (triggered by Clerk webhook `user.created`)
- Implement `loadAndMigrateProfile()`: versioned migration function, handles schema_version checks
- Write the profile update logic:
  - `dominant_patterns[]`: merge new pattern, decay old patterns by 10% per session without appearance
  - `calibration_score`: Bayesian update based on session DNA scores
  - `bias_fingerprint{bias: number}`: increment frequency counters

**Done when:** After 3 test sessions end, the cognitive profile JSON shows measurably different values for pattern frequency and calibration score. Memory persists across API restarts.

**Stage 1 Exit Criteria:**
- Full end-to-end pipeline works: text in → streaming Mirror response out with real citations
- Session memory persists: session 2 receives session 1 summary in its RAG query
- Cognitive profile updates correctly after session close
- CI/CD: GitHub Actions runs tests on every PR, Render auto-deploys on merge to main
- Cost per session is measured and below $0.01 in testing

---

## Stage 2 — Frontend and Alpha Product (Weeks 11–18)
*The product that 10 internal users will actually use*

Stage 2 is where Mirror becomes a real product. The API from Stage 1 is the engine — now build the car around it. This is the most design-intensive stage. Refer to `02_UX_UI_Design.md` constantly.

### 2.1 Next.js Frontend Foundation (Week 11)

**Tasks:**
- Initialise `apps/web` with Next.js 14 (App Router), TypeScript strict, Tailwind CSS (or vanilla CSS — per design spec)
- Install and configure: Clerk Next.js SDK (`@clerk/nextjs`), Framer Motion for animations, GSAP for cinematic sequences
- Set up Clerk: `<ClerkProvider>` in root layout, middleware for protected routes, sign-in and sign-up pages
- Set up shared fonts: Playfair Display, DM Sans, JetBrains Mono (all via next/font/google)
- Create the global CSS design tokens (all the `--aurora`, `--void`, etc. from the design spec)
- Build the living background canvas component: particle field, nebula drift, neural connection lines — runs as a fixed position canvas behind all content
- Deploy to Vercel: connect GitHub repo, confirm preview deploys on PRs work

**Done when:** Opening the app shows the animated dark background with particle field. Clerk auth flow works. Protected routes redirect to sign-in.

### 2.2 Session UI — Core Interaction (Weeks 12–13)

This is the most important UI work in the entire project. Get it right before building anything else.

**Tasks:**
- Build `InputField` component: glass floating bar at bottom of viewport, text area with auto-resize, voice input button (Web Speech API), send button with aurora glow animation
- Build `MirrorResponse` component wrapper: the 3D glass card that receives streamed content
- Build `PatternDetectedBanner`: left-border glass card, aurora wipe animation on reveal, pattern name + citation
- Build `ThoughtDNA` component: 5 animated bars (width animates from 0 to value on mount with stagger), labels in JetBrains Mono
- Build `ChoiceCards` component: 2×2 grid of glass cards, liquid fill on hover, selection animation, POST to `/api/session/:id/choice`
- Implement SSE streaming connection: read from `/api/stream` route, display reflection text character-by-character
- Wire up session flow: InputField submit → POST to API → open SSE connection → render streaming response into MirrorResponse
- Build session history scroll: previous turns fade as user scrolls, new response always visible

**Done when:** A human can type into the field, wait 1–2 seconds, and see a streaming Mirror response with pattern, DNA bars, reflection, question, and 4 choices. Selecting a choice sends it as the next message.

### 2.3 The 3D Mirror Orb (Week 13)

**Tasks:**
- Install `@react-three/fiber` and `@react-three/drei` (React wrappers for Three.js)
- Build `MirrorOrb` component:
  - `MeshPhysicalMaterial` with roughness 0, metalness 1, iridescence 0.6
  - Custom HDR environment using `<Environment>` with aurora/teal gradient preset
  - Idle rotation animation via `useFrame`
  - Breathing scale animation (1.0 → 1.02 → 1.0, 4s cycle)
  - Hover state: rotation acceleration via pointer events
- Add CSS fallback for browsers without WebGL: `border-radius: 50%` sphere with gradient shimmer animation
- Place orb in hero area for unauthenticated home page
- When session starts: GSAP FLIP animation drops orb from hero to 40px icon in top-left navbar

**Done when:** Orb renders, rotates, responds to hover, and transitions to navbar on session start.

### 2.4 Home Page and Session Feed (Week 14)

**Tasks:**
- Build the home page layout: living background canvas, hero orb, greeting with personalised context, session feed cards
- Build `SessionFeedCard` component: date, module type chip, dominant pattern name, session duration, glass styling
- Fetch session feed: `GET /api/sessions` → display sorted by date
- Build module selector modal: 3 glass cards (Canvas, X-ray, Devil's Advocate), each with description and Start button
- Implement "New Session" flow: select module → POST to `/api/session/start` → navigate to `/session/:id`
- Build the cinematic onboarding for first-time users: The Void → Emergence → The Introduction sequence (refer to UX spec Section 8.1)

**Done when:** A new user lands, sees the cinematic onboarding, can start their first session from the home page, and the session feed shows past sessions.

### 2.5 Cognitive Profile Page (Week 15)

**Tasks:**
- Build profile page layout: personalised ambient background based on dominant bias, Calibration Orb with score
- Build `BiasFingerprint` radar chart: Three.js radar with 5 axes, draws on mount, breathing animation
- Build `GrowthTimeline` line chart: SVG with animated path drawing (stroke-dashoffset), data point hover tooltips
- Build `DominantPatterns` cards: 3 pattern cards with sparkline and aurora glow intensity
- Fetch data: `GET /api/profile/:userId` → populate all charts
- Handle empty states: "Your profile builds after session 3" for new users

**Done when:** Profile page renders with real data from at least 3 completed sessions. All charts animate on mount.

### 2.6 Cognitive Profile — Choice Card Memory Loop (Week 16)

**Tasks:**
- Implement the choice card write-back route (`POST /api/session/:id/choice`):
  - Write choice to `confirmed_choice_signals[]` in cognitive profile (confidence: 0.9)
  - Trigger an async partial profile update (do not wait for response)
- Modify the session message handler: when `isChoiceReply === true`, inject the choice signal into the ContextPackage before RAG retrieval
- Validate the feedback loop: after selecting a choice, does the NEXT Mirror response demonstrably acknowledge or build on that choice? Test with 5 manual sessions.
- Implement choice reply visual: selected choice auto-appears in the input field (briefly visible), then sends

**Done when:** After 2 sessions with consistent choice selections, the cognitive profile shows `confirmedChoiceSignals[]` entries and the next session response is detectably more specific to the user.

### 2.7 Session Archive and Weekly Deep Review (Weeks 17–18)

**Tasks:**
- Build session archive page: grid of session cards, filter by module and pattern, search by content (simple Supabase full-text search)
- Build session detail view: full transcript, DNA scores, patterns surfaced, choice cards selected
- Implement the weekly review LangGraph.js pipeline (5-node StateGraph):
  - Node 1: Retrieval agent (vector_search + fetch_profile + rag_query)
  - Node 2: Reasoning agent (o3 or Claude 3.7 with extended thinking, async)
  - Node 3: Planning agent (GPT-4o-mini, converts WeeklyAnalysis → SessionPlan)
  - Node 4: Execution agent (Claude Sonnet 4, streams review to frontend)
  - Node 5: Memory write-back (compress + embed + update profile)
- Build the weekly review UI: "Mirror is preparing your review..." loading state with constellation animation, then streamed review rendered as a special session card
- Wire up the weekly review trigger: button on home page or profile page

**Done when:** 10 internal users have used Mirror for at least 2 weeks each. Weekly review generates and streams correctly. Session archive shows historical data with correct patterns.

**Stage 2 Exit Criteria (Alpha gates — zero exceptions):**
- End-to-end loop works: input → output → choice → improved output
- Memory persists: session 2 receives session 1 context in RAG
- Cognitive profile changes measurably after 3 sessions
- 10 internal users, minimum 2 weeks each, without being prompted to use it
- First-token latency under 2 seconds (p95)
- Zero PII in any log or monitoring trace
- 3D orb renders. DNA chart animates. Choice cards liquid-fill on hover. Background canvas runs.

---

## Stage 3 — Beta Hardening (Weeks 19–24)
*50–100 real external users who will break everything you didn't think of*

### 3.1 Observability Stack (Week 19)

**Tasks:**
- Audit all Langfuse traces: is every LLM call being traced? Is cost being captured?
- Build the admin cost dashboard route (`GET /api/admin/cost-dashboard`): per-user, per-session LLM cost from Langfuse
- Build the pattern accuracy scoring pipeline: after each session, store `pattern_surfaced` and prompt for user accuracy rating (simple thumbs up/down)
- Set up Sentry alert rules: alert on any Layer 3 timeout, any RAG retrieval returning zero results, any LLM API error
- Set up uptime monitoring: BetterUptime or UptimeRobot (free tier) — ping /api/health every 60 seconds
- Write a session analytics summary script: sessions/week, active users, most common patterns surfaced, avg latency

**Done when:** You can open the admin dashboard and see real cost per user, error rates, and pattern distribution.

### 3.2 Beta Onboarding and User Management (Week 20)

**Tasks:**
- Build the beta invite flow: Clerk invitation links, custom onboarding screens for beta users
- Implement the guided first session: gentle floating prompts, special first-session pacing (slower stream speed)
- Build in-app feedback collection: after each session, a small feedback prompt ("Did Mirror surface the right pattern? 👍 👎")
- Build the prediction tracking feature (P2 from product scope): user logs a prediction, Mirror creates a follow-up reminder at 30 days
- Set up a Notion database or Airtable to capture all beta user feedback manually in the first 2 weeks

**Done when:** 20 beta users have been onboarded. Each has completed at least 2 sessions. Feedback is flowing.

### 3.3 Prompt Refinement Cycle (Weeks 21–22)

**Tasks:**
- Review all Langfuse traces from the first 2 weeks of beta — look for sessions where the pattern detected seems wrong
- Run the full 50-test golden example suite against the current prompt — document the score
- Identify the 3 weakest pattern categories (where Mirror is least accurate) and rewrite the system prompt sections that handle them
- A/B test the new prompt: route 50% of beta users to each prompt variant, compare accuracy ratings after 1 week
- Deploy the winning prompt as the new production prompt, document the change in the prompt versioning system
- Repeat this cycle every 2 weeks for the duration of beta

**Done when:** Prompt accuracy rating improves from baseline by at least 10% on the 50 golden examples.

### 3.4 Performance and Scale Testing (Weeks 22–23)

**Tasks:**
- Load test `/api/session/:id/message` with 100 concurrent simulated requests using k6 or Artillery (free)
- Identify bottlenecks: is it the RAG query? The LLM call? The SSE streaming? The Supabase write?
- Add database connection pooling (Supabase already handles this, but tuning may help)
- Add in-memory caching for cognitive profiles: profile is read on every session message — cache it for 30 seconds using a Map (not Redis yet, free tier)
- Test edge cases: 5-word inputs, multi-language inputs, inputs that are questions rather than statements, 1000-word essays
- Test the 20-session user scenario: create a synthetic user with 20 sessions of data, verify RAG retrieval quality and profile accuracy hold up

**Done when:** 100 concurrent sessions complete without error. p95 latency stays under 2 seconds.

### 3.5 Security Audit and Privacy (Week 24)

**Tasks:**
- PII audit: scan all Langfuse traces, Sentry events, and Render/Railway logs for any user session content (there should be none — only metadata)
- Review all Express routes: confirm Zod validation on every input, Helmet headers on every response, rate limiting active
- Review Supabase RLS policies with a different engineer (or AI model): try to access another user's session_chunks via a direct Supabase query — should be blocked
- Implement data deletion: `DELETE /api/account` route that removes all user data from Supabase (sessions, profiles, session_chunks, cognitive_profile) and revokes Clerk user — completes within 60 seconds
- Implement data export: `GET /api/account/export` that bundles all the user's data as a JSON file and returns it for download
- Document privacy policy and data handling in plain language — post to a `/privacy` page in the Next.js app

**Done when:** PII audit finds zero content in logs. RLS blocks cross-user data access. Data deletion and export both work.

**Stage 3 Beta Success Gate:**
- 50+ external users using Mirror for 4+ weeks
- Pattern accuracy user rating: 75%+ "that felt right"
- 30-day retention: 50%+
- Choice card selection rate: 60%+ of sessions
- LLM cost per session: under $0.02
- Zero security incidents in PII audit
- NPS score collected from beta users: above 50

---

## Stage 4 — Launch (Week 25+)
*Production. Real subscriptions. Real accountability.*

### 4.1 Stripe Payments Integration (Week 25)

**Tasks:**
- Install Stripe Node.js SDK in `apps/api`
- Create Stripe products: Mirror ($19/mo), Mirror Pro ($49/mo), Teams ($29/user/mo)
- Build checkout flow:
  - POST `/api/billing/checkout` → creates Stripe checkout session → redirects to Stripe hosted page
  - Stripe webhook handler: `customer.subscription.created` → update user tier in Clerk metadata + Supabase users table
  - `customer.subscription.deleted` → downgrade user to free tier
- Implement tier-based access control in Express middleware: check user tier on session message endpoint — enforce free tier session limits (5/month)
- Build the billing page in Next.js: current plan, usage, upgrade CTA, cancel subscription

**Done when:** A user can pay $19/month, gain access to unlimited sessions, and their tier updates instantly without manual intervention.

### 4.2 Production Hardening (Week 25)

**Tasks:**
- Upgrade Render to Starter plan ($7/month) — no more sleeping on inactivity
- Set up Cloudflare free tier as DNS and CDN in front of both Render and Vercel
- Enable Vercel Analytics (free) for frontend performance data
- Configure Supabase daily automated backups (available on free tier)
- Set up monthly cost alert in both OpenAI and Anthropic dashboards: alert at $200/month
- Set up Langfuse cost alert: alert if any single user exceeds $5 in LLM cost in one day (anomaly detection)
- Final end-to-end smoke test: create a new account, complete 3 sessions, check profile, trigger weekly review, upgrade to Mirror tier, cancel subscription, delete account

**Done when:** All production readiness checklist items are checked. Smoke test passes.

### 4.3 Launch Execution (Week 26)

**Tasks:**
- Product Hunt submission: schedule for a Tuesday or Wednesday (highest traffic days), line up all beta users to upvote on launch day
- Hacker News Show HN post: draft and post on launch morning
- LinkedIn essay: publish the "Why we built Mirror" piece that has been drafted during beta
- Set up referral tracking: generate unique referral links per user (simple UUID in URL, tracked in Supabase)
- Monitor Sentry, Render metrics, Langfuse cost in real time on launch day
- Have a war room: someone watching for errors, someone watching for support messages, someone tracking signups

**Done when:** Mirror is live. Real strangers are paying for it.

---

## Post-Launch: The Permanent Sprint Loop (Week 27+)

### Every Two Weeks, Forever

Every sprint after launch contains these three mandatory items:

**1. Prompt improvement cycle:**
- Review Langfuse traces from the past 2 weeks
- Identify the pattern category with the worst user accuracy ratings
- Rewrite that section of the system prompt
- Run the 50-golden-example regression suite
- If improvement confirmed, deploy. If not, iterate more.

**2. Corpus expansion:**
- Source and ingest 10–20 new research papers
- Focus on the bias categories with the weakest RAG precision (review retrieval analytics)
- Quality-check new chunks: do they return in the right queries? Are the metadata tags correct?

**3. One product feature from the roadmap:**
- P2 features (prediction tracking, session export) now become the current work
- P3 features (team features, custom modules) begin planning in the sprint where P2 is winding down

---

## Development Summary Table

```
+----------+-------------------------------+------------------+--------------------------+
| Stage    | Focus Area                    | Duration         | Key Outcome              |
+----------+-------------------------------+------------------+--------------------------+
| Stage 0  | Research, corpus, ADRs,       | Weeks 1-4        | 200+ papers sourced,     |
|          | prompt v0.1, user interviews  | (4 weeks)        | ADR locked, prompt ready |
+----------+-------------------------------+------------------+--------------------------+
| Stage 1  | Monorepo, DB schema, Express  | Weeks 5-10       | Single API call returns  |
|          | API, RAG ingestion, LLM layer, | (6 weeks)        | real MirrorResponse JSON |
|          | memory system                 |                  | with citations           |
+----------+-------------------------------+------------------+--------------------------+
| Stage 2  | Next.js frontend, 3D orb,     | Weeks 11-18      | Full product used by     |
|          | session UI, animations, home   | (8 weeks)        | 10 internal users for   |
|          | page, profile page, loop       |                  | 2+ weeks each            |
+----------+-------------------------------+------------------+--------------------------+
| Stage 3  | Observability, beta users,    | Weeks 19-24      | 50+ paid beta users,     |
|          | prompt cycles, load testing,  | (6 weeks)        | 75%+ accuracy rating,    |
|          | security, privacy             |                  | 50%+ 30-day retention    |
+----------+-------------------------------+------------------+--------------------------+
| Stage 4  | Stripe billing, production    | Weeks 25-26      | Public launch. Real      |
|          | hardening, launch execution   | (2 weeks)        | paying customers.        |
+----------+-------------------------------+------------------+--------------------------+
| Ongoing  | Prompt cycles, corpus growth, | Weeks 27+        | Compounding product      |
|          | feature roadmap               | (forever)        | and research moat        |
+----------+-------------------------------+------------------+--------------------------+
```

---

## What NOT to Build (Until Told Otherwise)

Scope discipline is as important as scope itself. The following are explicitly out of scope until post-launch:

- Mobile native apps (iOS / Android) — PWA first, native after $50K ARR
- Social or sharing features — Mirror is private by design
- Real-time collaboration or shared sessions
- Third-party integrations (Notion, Slack, calendar) — post-v1.0
- Self-hosted option for privacy tier — after enterprise demand is proven
- Any clinical or therapeutic features — permanently excluded
- Custom branding or white-labelling — only if a B2B deal demands it

---

*Mirror · Complete Development Plan · v1.0 · March 2026*
*RootedAI — Metacognition AI · 26 weeks from zero to launch*
