# Mirror — Architecture Decision Records (ADR)
*Status — Confirmed v1.0 — March 2026*

This document tracks every major architectural decision made for the Mirror AI project.

---

## ADR-001: Backend Language + Framework
- **Decision**: Express.js (Node.js) with TypeScript.
- **Context**: Project requires high-performance streaming (Server-Sent Events) and tight integration with the AI ecosystem (liteLLM, LangChain.js).
- **Rationale**: Unified JavaScript/TypeScript stack from frontend to backend.
- **Status**: **ACCEPTED**

## ADR-002: Frontend Framework
- **Decision**: Next.js 14 (App Router).
- **Context**: Need for modern, high-performance UI with React Server Components (RSC).
- **Rationale**: Best-in-class support for streaming AI responses and Vercel-native features.
- **Status**: **ACCEPTED**

## ADR-003: Database + Vector Store
- **Decision**: Supabase (PostgreSQL) with `pgvector` extension.
- **Context**: Mirror needs traditional relational storage (users, sessions) and vector storage (RAG).
- **Rationale**: PostgreSQL is reliable; `pgvector` allows for combined SQL and Semantic queries in a single DB.
- **Status**: **ACCEPTED**

## ADR-004: Auth Provider
- **Decision**: Clerk.
- **Context**: Need for secure, modern user management without custom backend heavy lifting.
- **Rationale**: Clerk is Vercel/Next.js native, handles webhooks easily (Stage 1), and covers the Alpha/Beta free tier.
- **Status**: **ACCEPTED**

## ADR-005: LLM Abstraction Layer
- **Decision**: liteLLM JS.
- **Context**: We want to be model-agnostic (Claude, GPT, Gemini).
- **Rationale**: liteLLM maps any LLM to a unified format.
- **Status**: **ACCEPTED**

## ADR-006: Agentic Framework
- **Decision**: LangChain.js + LangGraph.js.
- **Context**: Complex multi-stage AI reasoning required for Weekly Reviews (Stage 2).
- **Rationale**: LangGraph allows for stateful, cyclical agent logic.
- **Status**: **ACCEPTED**

## ADR-007: Execution Model (Layer 4)
- **Decision**: Claude 3.5 Sonnet / Claude 3.7.
- **Context**: Requires high instruction following and a specific tone (Mirror).
- **Rationale**: Anthropic models are currently the gold standard for long-form reflective prose and complex instruction adhering.
- **Status**: **ACCEPTED**

## ADR-008: Reasoning Model (Layer 3)
- **Decision**: Claude 3.7 Extended Thinking or OpenAI o3.
- **Context**: Used for complex reasoning (pattern synthesis) that doesn't need immediate streaming.
- **Rationale**: These "thinking" models are better for synthetic insight than fast conversation.
- **Status**: **ACCEPTED**

## ADR-009: Embedding Model
- **Decision**: `text-embedding-3-large` (OpenAI).
- **Context**: 1536-dimensional semantic representation.
- **Rationale**: Industry-standard for document RAG pipelines.
- **Status**: **ACCEPTED**

## ADR-010: Hosting
- **Decision**: Render (API) + Vercel (Frontend).
- **Context**: Free-for-Alpha infrastructure needed.
- **Rationale**: Proven, zero-ops deployment for Node.js and Next.js.
- **Status**: **ACCEPTED**

## ADR-011: Observability
- **Decision**: Langfuse + Sentry.
- **Context**: Tracking LLM cost, latency, and standard code errors.
- **Rationale**: Langfuse is dedicated to AI traces; Sentry is best for codebase errors.
- **Status**: **ACCEPTED**

---
*RootedAI - Metacognition AI Architecture Decisions*
