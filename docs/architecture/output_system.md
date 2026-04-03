# Mirror — Six-Layer Architecture & Output System
*Full Specification · Based on Feb 18 Notes*

---

## Overview

**Core Logic (from notes):**
Papers → Identify patterns → User Query Input → Identify patterns of thinking → Correlate → HTML output with choices → Choices become new input → Loop

---

## Layer 1 — Input Reception & Profile Packaging

**Role:** The front door. Listens, packages, never thinks.

**What it receives:**
- Raw text input, voice transcript
- Active module flag (Canvas, X-ray, Devil's Advocate, etc.)
- Session ID, timestamp, user tier

**What it outputs:**
A structured ContextPackage JSON:
```json
{
  "input": "I think I should quit...",
  "module": "canvas",
  "profile": {"dominant_patterns": ["overconfidence"], "calibration_score": 0.61},
  "is_choice_reply": false
}
```

**Key intelligence:** Detects if input is new text OR a Choice Card reply — critical for the feedback loop.

---

## Layer 2 — Orchestrator & Task Router

**Role:** The brain. Reads, decides, delegates. Never generates text.

**Decisions made per request (~180ms):**
1. Which model to use (Sonnet / o3 / Llama 70B)
2. Single-shot response or multi-step agentic pipeline
3. Which RAG stores to query and with what terms
4. Output mode: reflection only or reflection + Choice Cards

**Output:** JSON routing directive, not prose.

---

## Layer 3 — Reasoning Engine & Pattern Decoder

**Role:** The philosopher. Decodes patterns. Used surgically.

**What it does:**
- Receives RAG research chunks + user input + history simultaneously
- Asks: "what pattern in the literature does this behaviour match?"
- Outputs a structured analysis plan (not user-facing text)

**Models:** o3, o4-mini, Claude 3.7 with extended thinking. 10–25s async. Never for real-time turns.

**Output:**
```json
{
  "pattern": "Certainty surge + urgency compression",
  "cite": "Kahneman, 2011 — System 1 overreach",
  "confidence": 0.87,
  "question_to_ask": "What would have to be true for this to fail?",
  "choices": [4 Choice Card objects]
}
```

---

## Layer 4 — Execution Model & Response Writer (Swappable)

**Role:** The voice. Writes Mirror's actual words. Plan-executor.

**Receives:**
System prompt + analysis plan + user profile + RAG chunks (XML-tagged) + last 3 turns

**Generates:**
```json
{
  "reflection": "Four weeks ago you said something structurally identical...",
  "question": "What would have to be true for this to fail?",
  "pattern_surfaced": "Certainty surge + urgency compression",
  "dna": {"assumption_load": 82, "emotional_signal": 74, "evidence_cited": 12},
  "choices": [4 Choice Card objects]
}
```

**Swappable models:** Claude Sonnet 4 (default) → GPT-4o → Gemini 1.5 Pro → Llama 70B.
One config value. Zero code changes above this layer.

---

## Layer 5 — RAG: Research Corpus + User History

**Role:** The library. Two stores, queried in parallel on every call.

**Store A — Research corpus (shared):**
- 500+ metacognition paper chunks
- Chunk: 512 tokens, 64-token overlap
- Metadata: author, year, concept_tags[], bias_categories[]
- Embedding: text-embedding-3-large
- Index: HNSW (Pinecone / pgvector)

**Store B — User history (per-user):**
- Every session summary, decision log, surfaced pattern, prediction record
- Enables: "this is the same pattern from 6 weeks ago"
- Enables: "your prediction accuracy on 'certain' decisions is 42%"

**Retrieval:** Top-5 (Store A) + top-3 (Store B). Cross-encoder re-ranked. Injected as XML blocks.

---

## Layer 6 — Memory, Persistence & Cognitive Profile

**Role:** The mirror's memory. Three tiers.

- **Short-term:** Current session in context window
- **Mid-term:** Compressed ~400-token session summary written at session close → stored in Store B
- **Long-term:** Cognitive Profile JSON — updated every session

**Cognitive Profile JSON structure:**
```json
{
  "dominant_patterns": ["overconfidence", "urgency_bias"],
  "calibration_score": 0.61,
  "bias_fingerprint": {"confirmation": 0.78, "certainty_surge": 0.82},
  "prediction_history": [{"context": "career_decision", "confidence": "certain", "accuracy": 0.42}],
  "growth_timeline": [],
  "confirmed_choice_signals": []
}
```

**Key role in feedback loop:** When user selects a Choice Card, that selection is written as a confirmed signal (weight: 0.9) — stronger than inferred patterns from text.

---

## The Output Format

**What the user sees (HTML object):**

1. **Pattern detected block** — name, research citation, description
2. **Thought DNA profile** — bar chart of assumption load, emotional signal, evidence cited, alternatives considered, uncertainty tolerance
3. **Mirror reflection** — research-grounded, personalised, in Mirror's voice
4. **The single question** — one question only, never multiple
5. **Choice Cards** — 4 structured next-step options

---

## The Feedback Loop

```
User types → System decodes patterns → HTML output rendered →
User selects a choice → Choice written to Layer 6 memory →
New HTML generated (more precise) → User selects next choice →
↺ loop continues, each iteration more accurate than the last
```

**Why choices are more powerful than typed text:**
- Inferred pattern from text: confidence ~0.6
- User-confirmed choice: confidence ~0.9
- After 10 sessions: Mirror's model of this person is built on confirmed signals, not just inference

---

*Mirror · Full Architecture Specification · v1.0*
*Based on Feb 18 handwritten notes — Metacognition AI · Output & Logic*
