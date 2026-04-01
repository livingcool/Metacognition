# Mirror — Research Corpus Management
*Instructions for adding and maintaining our research foundation.*

---

## Workflow for Adding Papers

Mirror's AI is only as good as the research in its vector database. Follow this process to expand the corpus:

1. **Search** — Use Google Scholar, Semantic Scholar, or academic databases for peer-reviewed papers on cognitive bias/metacognition.
2. **Download** — Get the PDF (where freely available).
3. **Rename** — Format the filename: `{author_lastname}_{year}_{first_word_of_title}.pdf` (e.g. `kahneman_2011_thinking.pdf`).
4. **Manifest** — Add a new row to `corpus/manifest.csv` with all columns filled.
5. **Taxonomy** — Use only the IDs defined in `corpus/taxonomy.md`.

## Metadata Standards

- `quality_rating` (1–5):
  - 5 = Landmark paper, highly cited, foundation of a concept.
  - 4 = High-quality empirical study or systematic review.
  - 3 = Solid research with narrow focus.
  - 2 = Limited sample size or marginal relevance.
  - 1 = Pop-science, not peer-reviewed (try to avoid).

## Sources

- [Semantic Scholar](https://www.semanticscholar.org/)
- [JSTOR](https://www.jstor.org/)
- [Google Scholar](https://scholar.google.com/)

---
*RootedAI - Metacognition AI Corpus Management*
