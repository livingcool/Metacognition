# Mirror — Cognitive Bias & Concept Taxonomy
*Version 1.0 — March 2026*

This taxonomy defines the official labels used across the entire Mirror ecosystem (manifest, RAG metadata, system prompts, and UI).

---

## 1. Bias Categories (15)

These are the primary labels for cognitive patterns surfaced by Mirror. Every paper in the manifest must map to one or more of these.

| ID | Name | Description | Example |
|---|---|---|---|
| `overconfidence` | Overconfidence | Overestimating one's knowledge or ability relative to reality. | "I'm 100% sure this will work." |
| `certainty_surge` | Certainty Surge | A sudden, unjustified jump in conviction, often under pressure. | "I was unsure, but now I know it's right." |
| `confirmation_bias` | Confirmation Bias | Seeking or interpreting info that confirms existing beliefs. | "This data proves exactly what I thought." |
| `urgency_compression` | Urgency Compression | Reducing thinking time due to perceived (often false) urgency. | "We need to decide *now* or we lose it." |
| `availability_heuristic` | Availability Heuristic | Overestimating the importance of info that is easy to recall. | "I just saw a news story about this, it's a huge risk." |
| `sunk_cost_fallacy` | Sunk Cost Fallacy | Continuing a course of action due to previous investment. | "We've already spent $50k on this, we can't stop." |
| `system_1_overreach` | System 1 Overreach | Allowing fast, intuitive thinking to dominate complex decisions. | "My gut says this is the one." |
| `planning_fallacy` | Planning Fallacy | Underestimating the time or resources needed for a task. | "This will take two days." (Actually takes two weeks) |
| `anchoring_bias` | Anchoring Bias | Over-relying on the first piece of information offered. | "The initial quote was $5k, so $6k is too much." |
| `dunning_kruger_effect` | Dunning-Kruger | Low ability leading to overestimating competence. | "I just started, but I think I'm an expert." |
| `hindsight_bias` | Hindsight Bias | Seeing an event as predictable after it has occurred. | "I knew that was going to happen." |
| `status_quo_bias` | Status Quo Bias | Preperence for the current state of affairs. | "Why change? It's working fine." |
| `framing_effect` | Framing Effect | Drawing different conclusions from the same info based on how it's presented. | "90% success rate" vs "10% failure rate" |
| `loss_aversion` | Loss Aversion | Stronger preference for avoiding losses over acquiring gains. | "I'd rather not lose $100 than gain $150." |
| `narrative_fallacy` | Narrative Fallacy | Creating a flawed story to explain a sequence of events. | "It was all part of my master plan." |

---

## 2. Concept Tags (14)

These are secondary labels for identifying the research domain or focus area of a paper.

| ID | Concept |
|---|---|
| `decision_making` | Decision Processes |
| `metacognition` | Thinking About Thinking |
| `self_awareness` | Understanding Own State |
| `cognitive_load` | Mental Resource Usage |
| `reasoning_under_pressure` | Stress & Decision Making |
| `pattern_recognition` | Signal vs Noise |
| `calibration` | Accuracy of Confidence |
| `belief_updating` | Responding to New Data |
| `heuristics` | Mental Shortcuts |
| `dual_process_theory` | System 1 vs System 2 |
| `bounded_rationality` | Rationality Limits |
| `judgment` | Evaluation of Outcomes |
| `forecasting` | Predict Future Events |
| `feedback_loops` | Learning from Outcomes |

---

## 3. Usage Rules

- Every paper added to `manifest.csv` must use only these IDs (no freeform tags).
- Use `pipe-delimited` format for multiple tags: `overconfidence|certainty_surge`.
- Maintain a single source of truth in this file. If a new pattern is required, update this taxonomy first.
