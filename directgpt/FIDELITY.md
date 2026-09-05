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
| Localizing a prompt on SVG elements/locations (§3.2.2, no prompt printed) | A.1.3 form plus `Apply this only to element with id "c0" … Keep everything else in the SVG identical.` | The paper prints the localized prompt for text only (see DECISIONS.md §2) | equivalent | image localize tests |
| Global prompt on text/code with no selection (§3.2.2, no prompt printed) | `content\n\ninstruction` with a short system message asking for the full modified text/code | Not printed in the paper (DECISIONS.md §3) | equivalent | global tasks |
| Markdown rendering in the ChatGPT replica (§4, library not named) | `marked` | Paper names no Markdown library | equivalent | none in rubric |
| Object-word thumbnails (§3.2.2) | Standalone SVG of the element's bbox, or truncated text, or `(x, y)` | — | exact | refer tests |
| Change highlighting after generation (fig. 2b, bold words) | Client-side word LCS diff → bold; SVG changed ids → fading outline | — | exact | feedback tests |
| Cursor indicating the active tool (§3.1, appearance not shown) | Label pinned to the cursor with the tool template and its filled slots, plus a `copy` cursor over the panel | Paper shows no cursor design (DECISIONS.md §7b) | equivalent | tool tests |
| Loading feedback when a prompt targets no object (§3.2.4 covers targeted pulses only) | Pulsing panel border + streaming status | Not specified for global prompts (DECISIONS.md §7d) | equivalent | feedback tests |
| Study task panel: short non-selectable instruction + content/target image, always visible (§4.2) | Left panel with instruction, yellow-highlighted starting content or target SVG, `user-select: none`, drag suppressed | — | exact | TEST-S01 |
| Content pre-loaded per task and reset between tasks (§4.2) | `startTask` reloads the content and resets the undo history | — | exact | TEST-S02 |
| Three-minute task limit (§4.2) | 180 s countdown in the task panel, auto-finishes the task | — | exact | TEST-S02 |
| 5-point "How close are you to the target" rating after each task (§4.2) | Modal with distant→close 1-5 scale, results shown in an end-of-activity summary | Kept in memory; the paper logged to a server | equivalent | TEST-S02 |
| Study targets for the image activity (fig. 5) | Hand-built target SVGs for the four flower and four smiley tasks | Redrawn from the figure | equivalent | TEST-S01 |
| Undo/Redo greyed until an operation exists (fig. 3a) | Loading content resets the history; only prompts create undo steps | — | exact | TEST-U05 |
| Localized answer is the rewritten selection only (App. A.1.1) | Strips a `<blank>:` label and quotes wrapping the replacement, keeping quotes that belong to the selection | Quoting is a habit of the model, not content (DECISIONS.md §7k) | exact | TEST-EC02 |
| Object-word rendered as a thumbnail of the object (§3.2.2) | Thumbnails re-render from the live image after every change; a vanished object marks the chip broken and blocks execution | Paper does not cover references invalidated by undo (DECISIONS.md §7l) | exact | TEST-INT05 |
| Behaviour on a failed request (not covered by the paper) | Content, toolbar and history untouched; prompt and selection kept; message under the prompt field and in a dismissable toast | — | equivalent | TEST-EC06 |
