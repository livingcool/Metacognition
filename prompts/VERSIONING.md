# Mirror — Prompt Version Control
*Rules for evolving Mirror's voice.*

---

## 1. Versioning Scheme

- **Major (v1.0)**: Structural changes to the system message or JSON schema.
- **Minor (v1.1)**: Wording changes, tone refinement, or rubric updates.
- **Hotfix (v1.1.1)**: Urgent fixes for hallucination or error rates.

---

## 2. Release Process

1. **PROPOSE** — Create a new file (e.g. `mirror_v0.2.md`).
2. **TEST** — Run the proposed prompt against the `golden_tests.json` dataset.
3. **EVALUATE** — Score at least 10 responses using the `evaluation_rubric.md`.
4. **COMPARE** — Ensure the new version scores higher (or equal) to the current version.
5. **LOCK** — Update the `active` pointer in `config.ts` (Stage 1).
6. **ARCHIVE** — Keep all old `mirror_vX.Y.md` files in the `prompts/` directory.

---

## 3. History Log

| Version | Date | Status | Change Summary |
|---|---|---|---|
| **v0.1** | 2026-03-31 | Current | Initial persona, schema v1.0, 7 mandatory sections. |

---
*RootedAI - Metacognition AI Prompt Versioning*
