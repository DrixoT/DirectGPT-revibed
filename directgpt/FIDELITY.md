# Implementation fidelity ledger — DirectGPT

Inventory of what the paper (Masson et al., CHI '24, "DirectGPT") specifies, taken from Sections 3.3, 4, and Appendix A.1, and what the revibe was built with. Severity: exact / equivalent / degraded / absent.

| Paper specifies | Built with | Why | Severity | Tests affected |
|---|---|---|---|---|
| Model `gpt-3.5-turbo` via the OpenAI Chat API (§3.3, §4, App. A) | `gpt-3.5-turbo` (default model; user can override in UI) | Still served as of 2026-09-04; OpenAI lists a shutdown date of 2026-10-23 for the `gpt-3.5-turbo` alias. After that date the UI's model override is the only path. | exact (time-limited) | all LLM-dependent tests |
| TypeScript + ReactJS for the interface (§3.3) | TypeScript + React | — | exact | — |
| Prism.js for code syntax highlighting (§3.3) | Prism.js | — | exact | code activity tests |
| Official OpenAI API library (§3.3) | `openai` npm package, called from the browser with the user's key | — | exact | — |
| Localizing prompt: whole passage with selection replaced by `<blank>`, then `<blank>: …`, `INSTRUCTION: …`, `Rewrite <blank>. Follow INSTRUCTION`, `<blank>:` (App. A.1.1) | verbatim | — | exact | localize tests |
| Referring to text objects: `0]word0]` / `1]word1]` delimiters and `replace text delimited by 0] and text delimited by 1] with synonyms` + `Keep rest of the text identical` (App. A.1.2) | verbatim | — | exact | object-word tests |
| Referring to SVG objects: unique `id` per element, `Return modified SVG code to …` with `element with id "c0"` (App. A.1.3) | verbatim | — | exact | image tests |
| ChatGPT replica system prompt "identical to the one used in ChatGPT" (§4) | not printed in the paper; builder's choice | The paper never prints the system prompt | degraded (baseline replica only, not DirectGPT's contribution) | none in rubric |
| Streaming, word-by-word answers (§4) | streaming via Chat Completions `stream: true` | — | exact | feedback tests |
| API key supplied server-side (implied by paper) | user enters their own OpenAI key in the browser UI, stored in localStorage | user requirement for this revibe | equivalent | none |
