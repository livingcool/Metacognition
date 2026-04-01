# Mirror — Software Development Life Cycle (SDLC)
*Complete Engineering Lifecycle · Metacognition AI · v1.0*

---

## 0. Executive Brief

Mirror is not a chat tool. It is a metacognition engine — a system that reads thinking patterns, surfaces cognitive biases grounded in research, and builds a long-term model of how each user thinks over time. This distinction shapes every decision in our SDLC: we are building a precision instrument, not a product that ships fast and iterates on vibes.

The SDLC described here governs how Mirror moves from idea to production, how it is maintained, how it evolves, and how a team of humans builds something that ultimately makes other humans think better. Every decision — from sprint length to test coverage to corpus curation — is made in service of a single principle: Mirror only ships when it genuinely helps someone understand their own mind better.

---

## 1. SDLC Model: Adaptive Iterative Delivery

Mirror uses an **Adaptive Iterative Delivery** model — a hybrid that combines the discipline of phased milestones with the flexibility of two-week sprints inside each phase.

```
+--------------------------------------------------------------------------+
|                     MIRROR SDLC — HIGH-LEVEL VIEW                        |
+--------------------------------------------------------------------------+
|                                                                          |
|  PHASE 0         PHASE 1         PHASE 2         PHASE 3         PHASE 4 |
|  Discovery   ->  Foundation  ->  Alpha       ->  Beta        ->  Launch  |
|  (4 weeks)       (6 weeks)       (8 weeks)       (6 weeks)     (ongoing) |
|                                                                          |
|  Each phase contains 2-week sprints with defined goals and exit criteria |
+--------------------------------------------------------------------------+
```

We chose this model because:

| Concern | Decision |
|---|---|
| AI behaviour is uncertain | Short sprints allow fast re-calibration of prompts and pipeline |
| Research corpus must be curated | Phased approach allows corpus work in parallel with code |
| MVP must be useful, not just functional | Alpha phase = internal dogfooding before any external user touches it |
| LLM costs scale with every user added | Budget gates at each phase prevent runaway cost surprises |
| Prompt quality is as important as code quality | Dedicated prompt evaluation cycles built into every sprint |

---

## 2. Phase 0 — Discovery and Definition (Weeks 1–4)

**Goal:** Know exactly what we are building before writing a single line of production code.

### 2.1 Discovery Flow

```
Research        Problem          User              Data
Synthesis   ->  Framing      ->  Interviews    ->  Audit
    |               |                |               |
    v               v                v               v
Literature     "What is a       20 interviews     What
review of      metacognition    with target       papers
200+ papers    mirror?"         users             exist?
```

**Research synthesis:** Review 200+ metacognition and cognitive bias papers. Identify which cognitive patterns are most frequent, most impactful, and most amenable to surfacing via AI. This becomes the seed corpus for the RAG system and informs which biases Mirror will surface first.

**Problem framing:** Document the exact problem statement. Not "people think badly" but: "When people are in high-stakes decision moments, they cannot see the pattern in their own reasoning that is causing them to make the same mistake repeatedly. There is no tool that builds a personalised model of how you think and surfaces that model back to you grounded in research."

**User interviews (20 sessions, 60 minutes each):**
- Target: knowledge workers, founders, managers — people who make consequential decisions regularly
- Questions focus on: how they currently reflect, what tools they use, what fails, what a "mirror for thinking" would need to do to earn daily use
- Deliverable: 5 core user archetypes, each with their dominant cognitive blind spots documented

**Data audit:** Catalogue all available metacognition and decision science research. Assess quality, relevance, and licensing for each paper source. Identify gaps. Commission additional sourcing from academic databases.

### 2.2 Discovery Deliverables

| Deliverable | Owner | Exit Criteria |
|---|---|---|
| Problem Statement Document | Product Lead | Signed off by all founders |
| 5 User Archetypes | UX Research | Interview data validated and synthesised |
| Research Corpus Seed Set | ML Lead | 200+ papers identified, licensed, and prepped for ingestion |
| Feature Hypothesis List | Product | Ranked by user value and technical risk |
| Architecture ADR v0.1 | Tech Lead | Six-layer model agreed, alternatives documented |

### 2.3 Phase 0 Exit Gate

- [ ] All 20 user interviews complete and synthesised
- [ ] Research corpus seed: minimum 200 papers identified and acquired
- [ ] Architecture decision record signed off by engineering lead
- [ ] The question "Which Layer 4 model do we start with?" is answered with a rationale
- [ ] Monetisation model is documented (freemium / subscription tiers sketched)

---

## 3. Phase 1 — Foundation (Weeks 5–10)

**Goal:** Build the infrastructure, data pipeline, and baseline intelligence. No user-facing product yet — only the engine.

### 3.1 Sprint Structure

```
Sprint 1 (Weeks 5–6): Infrastructure and Environment
  +-- Supabase project set up (free tier: Postgres + pgvector + auth fallback)
  +-- CI/CD pipeline: GitHub Actions -> Render / Railway auto-deploy on push
  +-- Database schema v1: users, sessions, profiles, patterns (Supabase migrations)
  +-- Auth layer via Clerk (free tier, 10K MAU)
  +-- Vector extension enabled in Supabase: pgvector for embeddings
  +-- Environment isolation: dev (local) / staging (Render preview) / prod (Render)

Sprint 2 (Weeks 7–8): RAG Foundation — Research Corpus (Store A)
  +-- Paper ingestion pipeline: PDF -> chunked text -> embeddings
  +-- Chunk strategy implemented: 512 tokens, 64-token overlap
  +-- text-embedding-3-large embeddings generated for all papers
  +-- HNSW index built, queryable, and benchmarked
  +-- Metadata schema: author, year, concept_tags[], bias_categories[]
  +-- Retrieval accuracy baseline measured (precision@5 target set)

Sprint 3 (Weeks 9–10): Layer 4 Execution Model + Prompt Foundation
  +-- ModelAdapter abstraction class built
  +-- Claude Sonnet 4 integrated via LiteLLM
  +-- Mirror system prompt v0.1 written, evaluated against 20 test inputs
  +-- Basic session handler: start -> input -> response -> end
  +-- Output structure defined: reflection, question, pattern, DNA, choices
  +-- Prompt versioning system: all prompt versions stored in version control
```

### 3.2 Architecture Decision Log (ADR — Phase 1 Locks)

During Phase 1, the following architectural decisions must be finalised and documented. Changing them after Phase 1 ends carries significant refactoring cost:

```
+------------------+------------------------------+------------------------+
| Decision         | Choice                       | Rationale              |
+------------------+------------------------------+------------------------+
| Primary Vector DB| Supabase (pgvector, free tier)| Free managed Postgres  |
|                  | (Pinecone if scale demands)  | with vector support,   |
|                  |                              | zero ops overhead      |
+------------------+------------------------------+------------------------+
| LLM Adapter      | LiteLLM                      | Provider-agnostic,     |
|                  |                              | 100+ models unified    |
+------------------+------------------------------+------------------------+
| Agentic Layer    | LangChain.js / LangGraph.js  | Node-native, stateful  |
|                  |                              | multi-agent graphs     |
+------------------+------------------------------+------------------------+
| Backend          | Express.js (Node.js)         | Lightweight, fast,     |
|                  |                              | same language as front,|
|                  |                              | great AI lib support   |
+------------------+------------------------------+------------------------+
| Frontend         | Next.js 14 (App Router)      | SSR, streaming, RSC    |
|                  |                              | for rich AI UIs        |
+------------------+------------------------------+------------------------+
| Auth             | Clerk (free tier)            | User management,       |
|                  |                              | 10K MAU free           |
+------------------+------------------------------+------------------------+
| Hosting          | Render (free) / Railway      | Free tier hosting for  |
|                  | (free $5 credit)             | Express + Next.js apps |
+------------------+------------------------------+------------------------+
| Payments         | Stripe                       | Subscription billing,  |
|                  |                              | usage metering support |
+------------------+------------------------------+------------------------+
```

### 3.3 Definition of Done — Phase 1

- RAG system returns relevant paper chunks (precision@5 > 0.75) for a given cognitive pattern query
- A single conversational turn produces a correctly structured JSON output (reflection, question, DNA scores, choices)
- Unit tests for all Layer 2–4 logic (Jest / Vitest); integration test for full RAG-to-response pipeline
- LLM cost per turn measured, within budget model ($0.005 ceiling per session)
- Deployed and running on free-tier hosting (Render or Railway) — no paid infra during Foundation phase

---

## 4. Phase 2 — Alpha (Weeks 11–18)

**Goal:** Build the full product for internal dogfooding. 10 internal users. Break everything before any external user sees it.

### 4.1 What Alpha Means for Mirror

Alpha is not "it mostly works." Alpha for Mirror means:

- The feedback loop runs end-to-end: user types → Mirror responds → user selects choice card → loop improves
- Memory persists across sessions: Mirror genuinely remembers session 1 behaviour when responding in session 5
- Cognitive profile builds over time and actively influences the specificity of responses
- The Thought DNA visualisation reflects real session data — not static mocked values

### 4.2 Alpha Sprint Breakdown

```
Sprint 4 (Weeks 11–12): Cognitive Profile + Memory System (Layer 6)
  +-- Cognitive Profile JSON schema v1:
  |   {dominant_patterns, calibration_score, bias_fingerprint,
  |    prediction_history, growth_timeline, confirmed_choice_signals}
  +-- Session summary compression: 400-token summaries written at session close
  +-- User vector store (Store B): per-user session history indexed
  +-- Profile injected at every session start (~2K tokens)
  +-- Profile delta written and merged after every session close

Sprint 5 (Weeks 13–14): Feedback Loop + Choice Card System
  +-- Choice Card generation added to Layer 3 reasoning output (4 cards)
  +-- Choice Card UI component built in frontend
  +-- Choice selection event: written to Layer 6 memory (confidence weight: 0.9)
  +-- "Choice reply" detection added to Layer 1 input handler
  +-- Validation test: selecting a choice makes next Mirror response more precise

Sprint 6 (Weeks 15–16): Visual Output System
  +-- Thought DNA bar chart (5 dimensions):
  |   assumption_load, emotional_signal, evidence_cited,
  |   alternatives_considered, uncertainty_tolerance
  +-- Pattern detected block: name, research citation, description
  +-- Session summary view: end-of-session summary card
  +-- Cognitive profile growth timeline: week-over-week chart

Sprint 7 (Weeks 17–18): Module System
  +-- 3 core modules built: Canvas, X-ray, Devil's Advocate
  +-- Module flag passed in ContextPackage and handled by Orchestrator
  +-- Module-specific system prompt variants for each module
  +-- Module switching supported within an active session
```

### 4.3 Alpha Quality Gates

```
+------------------------------------------------------------------+
|                    ALPHA QUALITY GATE                             |
|                                                                   |
|  [x]  End-to-end loop: input -> output -> choice -> improved     |
|  [x]  Memory persists: same pattern re-surfaced in session 2     |
|  [x]  Cognitive profile: score changes measurably after 3 sessions|
|  [x]  10 internal users, 2+ weeks each, without being prompted   |
|  [x]  Latency: Layer 4 response under 2s first token (p95)       |
|  [x]  Zero PII in any log, trace, or monitoring output           |
+------------------------------------------------------------------+
```

If any gate fails, the sprint continues until it passes. No timeline pressure overrides this gate.

---

## 5. Phase 3 — Beta (Weeks 19–24)

**Goal:** 50–100 external users. Real feedback. Real edge cases. Real cost data.

### 5.1 Beta Cohort Selection

Not open signup. Curated, invited cohort only:
- 30 knowledge workers and founders (primary target archetype)
- 10 coaches and therapists (professional metacognition practitioners)
- 10 researchers and academics (will stress-test citation accuracy hard)
- Onboarding: 1-on-1 call plus first session conducted together with the team

### 5.2 Beta Sprint Focus Areas

```
Week 19–20: Observability and Analytics
  +-- Session logging: anonymised, pattern-level — never raw content
  +-- Pattern accuracy scoring pipeline: did Mirror surface the right pattern?
  +-- LLM cost dashboard: per user, per session, monthly projection
  +-- Error rate monitoring by layer (with Sentry or equivalent)
  +-- LLM observability: Langfuse for token usage, cost, latency per call

Week 21–22: Prompt Refinement Cycle
  +-- Weekly prompt evaluation against real anonymised sessions
  +-- A/B test: two system prompt variants on same session input set
  +-- Evaluation rubric applied: accuracy, depth, personalisation, voice
  +-- Prompt regression suite running on every prompt change in CI

Week 23–24: Scale, Performance, Edge Cases
  +-- Load test: 100 concurrent sessions without degradation
  +-- Edge cases: very short inputs, multi-language text, adversarial inputs
  +-- Long-term memory stress test: 20-session user history full cycle
  +-- Graceful degradation scenarios: Layer 3 timeout, vector DB slowdown
```

### 5.3 Beta Success Metrics

| Metric | Target |
|---|---|
| Sessions per user per week | 2 or more |
| User-reported pattern accuracy | 75% "that felt right or very right" |
| First-token latency (p95) | Under 2 seconds |
| Choice card selection rate | 60% or more of sessions |
| 30-day user retention | 50% or more |
| LLM cost per session | Under $0.02 |
| Net Promoter Score | Above 50 |
| Research citation accuracy | 90% (manual spot-check of 200 citations) |

---

## 6. Phase 4 — Launch and Continuous Delivery (Week 25+)

### 6.1 Launch Readiness Checklist

```
SECURITY
  [ ] Penetration test completed by external party
  [ ] PII audit: no user content in any production log
  [ ] API key rotation policy in place (30-day cycle)
  [ ] Rate limiting on all API endpoints
  [ ] GDPR and DPDP compliance review: data deletion and export working

RELIABILITY
  [ ] Uptime SLA target defined: 99.5%
  [ ] Failover: if Layer 4 model is down, fallback model auto-triggers
  [ ] Database: automated daily backups, point-in-time recovery
  [ ] Oncall rotation: who gets paged at 3am and how?

COST CONTROLS
  [ ] Per-user cost caps implemented by tier
  [ ] Tier-based model routing: free tier uses lighter model
  [ ] Monthly burn alert at 80% of budget cap

OBSERVABILITY
  [ ] Error tracking: Sentry
  [ ] App performance monitoring: Datadog or Grafana
  [ ] LLM observability: Langfuse (token usage, cost, latency per call)
```

### 6.2 CI/CD Pipeline

```
Developer  ->  GitHub PR  ->  Automated Tests  ->  Staging       ->  Prod
                               (GitHub Actions)     (Render Preview    (Render / Railway
                                     |               or Railway PR      free tier)
                     +---------------+---------------+  preview)
                     |               |               |
                 Unit tests   Integration tests  Prompt
                 (Jest/Vitest)(mock LLM calls)   regression
                                                  suite
```

### 6.3 Post-Launch Sprint Cadence

Every two-week sprint mandates three permanent items:
1. **Prompt improvement cycle** — evaluate last 2 weeks of sessions, improve weakest pattern area, A/B test the improvement
2. **Corpus expansion** — 10–20 new papers added to Store A, embedded, indexed, and quality-checked
3. **Product feature** — driven by user feedback, retention data, and session analytics

---

## 7. Testing Strategy

### 7.1 Test Pyramid for an AI Product

```
                  +----------+
                  |  Manual  |   <- Product and prompt evaluation (qualitative)
                  |  Evals   |
               +--+----------+--+
               |  AI Evaluation  |  <- LLM-as-judge: does response match rubric?
               |  (automated)    |
            +--+-----------------+--+
            |   Integration Tests    |  <- Full pipeline: input -> output JSON
            +------------------------+
            |      Unit Tests        |  <- Layer logic, memory writes, utilities
            +------------------------+
```

### 7.2 The Prompt Regression Suite

Every system prompt version must pass the regression suite before deployment:
- 50 "golden examples" — known inputs where the expected pattern, question, and DNA scores are documented
- Run automatically on every prompt change via CI
- If more than 10% of golden examples degrade in any quality dimension, the prompt is blocked

### 7.3 Evaluation Rubric

| Dimension | Description | Weight |
|---|---|---|
| Pattern Accuracy | Did Mirror surface the correct cognitive pattern? | 30% |
| Research Grounding | Is the pattern cited to a real, relevant paper? | 25% |
| Personalisation | Does the response reflect this specific user's history? | 25% |
| Question Depth | Is the single question the sharpest possible ask? | 10% |
| Voice Consistency | Does it sound like Mirror, not a generic chatbot? | 10% |

---

## 8. Engineering Team Structure

```
              +----------------+
              |   Tech Lead    |   Architecture, decisions, ADRs
              +-------+--------+
                      |
        +-------------+---------------+
        |             |               |
    AI/ML         Backend          Frontend
    Engineer      Engineer         Engineer
    (Layers 2–5)  (API, DB,        (Next.js,
                  memory)          visualisations)

  Supporting roles:
  +-- Research Curator: corpus quality, paper sourcing, bias taxonomy
  +-- Prompt Engineer: system prompt management, evaluation cycles
  +-- Part-time: Security review, DevOps/infra
```

### Minimum Viable Team (MVP Stage)
- 1 Full-stack JavaScript engineer (Express.js backend + Next.js frontend)
- 1 AI/ML engineer (RAG pipeline, LangChain.js, LangGraph.js, prompt management)
- 1 Product and Research lead (user research, corpus curation, strategy)

---

## 9. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| LLM hallucination in paper citations | High | High | Cross-encoder re-ranking plus citation verification step |
| User data privacy breach | Low | Critical | E2E encryption, no PII in logs, GDPR and DPDP compliance |
| LLM API outage (Anthropic) | Medium | High | Fallback model routing in ModelAdapter |
| RAG retrieval quality degrades at scale | Medium | High | Regular retrieval audits, re-index quarterly |
| User disengages after session 1 | High | High | Choice card loop plus weekly review for re-engagement |
| Corpus quality issues (wrong or outdated papers) | Medium | Medium | Human curator reviews all new paper additions |
| Layer 3 cost overrun | Medium | Medium | Cap: max 1 expensive deep synthesis call per user per week |

---

## 10. Release Versioning Strategy

Mirror uses four parallel version tracks — all logged with every session record:

```
Product Version:   v1.2.0            Major.Minor.Patch
AI System Version: Mirror-v2         Referenced in system prompt, tracked in config
Corpus Version:    corpus-2024-q4    Updated quarterly after new paper batches
Prompt Version:    prompt-v1.3.2     Per-module, per-change tracking
```

This makes it possible to diagnose exactly which version combination was responsible for a quality change in Mirror's responses.

---

## 11. SDLC Summary Timeline

```
WEEK  1---4   PHASE 0: Discovery
              User interviews, paper audit, problem framing, architecture ADR

WEEK  5---10  PHASE 1: Foundation
              Infrastructure, RAG pipeline, Layer 4 integration, prompt v0.1

WEEK 11---18  PHASE 2: Alpha
              Full product, 10 internal users, feedback loop live, Thought DNA

WEEK 19---24  PHASE 3: Beta
              50-100 external users, prompt refinement, scale and cost testing

WEEK 25+      PHASE 4: Launch and Continuous Delivery
              Production, fortnightly sprints, corpus grows, product improves
```

---

*Mirror · SDLC Documentation · v1.0 · March 2026*
*RootedAI — Metacognition AI · Built for thinkers who want to think better*
