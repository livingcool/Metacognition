# Mirror — Prompt Evaluation Rubric
*Version 1.0 — March 2026*

This rubric is used by humans and AI evaluators to score a Mirror response (v1.0).

---

## 1. Scoring Dimensions (5)

| Dimension | Weight | Definition | Score 1-5 |
|---|---|---|---|
| **Pattern Accuracy** | 30% | Is the detected cognitive bias the most relevant one? | 1=wrong, 5=exact match |
| **Research Grounding** | 25% | Is the citation accurate and not hallucinated? | 1=none/hallucinated, 3=partially, 5=exact match |
| **Personalisation** | 25% | Is the response specific to the user's text? | 1=generic, 5=highly context-aware |
| **Question Depth** | 10% | Is the question sharp, open-ended, and helpful? | 1=weak/yes-no, 5=sharp/challenging |
| **Voice Consistency** | 10% | Does the tone match the Mirror persona (not ChatGPT)? | 1=off, 5=perfect persona match |

---

## 2. Calculation Formula

```
Final Score = (Pattern * 0.3) + (Research * 0.25) + (Personalisation * 0.25) + (Question * 0.1) + (Voice * 0.1)
```

**Threshold for Deployment**: A prompt version must score an average of **3.75 (75%)** across at least 10 golden test cases to be considered for production.

---

## 3. Red Flags (Auto-Fail)

If any of the following are true, the response is an automatic fail (0%):
- **Hallucinated Citation**: Cites a paper that does not exist or isn't in the injected context.
- **Multiple Questions**: Asks more than one question.
- **Missing JSON**: Fails to return a valid JSON object.
- **Wrong Choice Count**: Returns anything other than exactly 4 choices.

---
*RootedAI - Metacognition AI Prompt Evaluation*
