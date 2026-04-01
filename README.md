# Mirror — Metacognition AI

Mirror is a professional-grade metacognition AI designed to help knowledge workers, founders, and creators identify their cognitive patterns, biases, and blind spots. It uses an agentic RAG pipeline to ground its reflections in peer-reviewed cognitive science.

## Project Structure

- `apps/` — Monorepo applications (Stage 1+)
- `packages/` — Shared logic (AI, DB, Types) (Stage 1+)
- `docs/` — Architecture and development documentation
- `corpus/` — Research corpus storage and manifest
- `prompts/` — System prompts and evaluation suite
- `research/` — User research and archetypes

## Development Stages

1. **Stage 0: Ground Work** (Current) — Research, corpus sourcing, system prompt v0.1
2. **Stage 1: Infrastructure & Engine** — API, Supabase, RAG pipeline
3. **Stage 2: Frontend & Alpha Product** — Next.js, 3D Mirror Orb, Session UI
4. **Stage 3: Beta Hardening** — Observability, performance, scale
5. **Stage 4: Launch**

## Quick Start (Stage 0)

1. Clone the repository.
2. Build the research corpus:
   - Browse `corpus/manifest.csv`.
   - Use Google Scholar/Semantic Scholar to download PDFs.
   - Store in `corpus/papers/` (gitignored).
3. Review the system prompt in `prompts/mirror_v0.1.md`.

## Key Documents

- [SDLC](file:///docs/01_SDLC.md)
- [UX/UI Design](file:///docs/02_UX_UI_Design.md)
- [Tech Stack](file:///docs/03_Tech_Stack.md)
- [System Architecture](file:///docs/05_System_Architecture_Data_Migration.md)
- [Development Plan](file:///docs/07_Development_Plan.md)

---
*RootedAI - Metacognition AI Project*
