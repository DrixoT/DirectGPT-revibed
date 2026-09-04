# DEVELOPER.md — DirectGPT walkthrough

## Requirements

- Node.js ≥ 18 (developed with Node 26.4, npm 11).
- A modern Chromium/Firefox/Safari; the UI relies on `contenteditable`, pointer events, `caretPositionFromPoint`/`caretRangeFromPoint`, `ResizeObserver`, `DOMParser`/`XMLSerializer` and `SVGGraphicsElement.getBBox()`.
- An OpenAI API key, entered in the UI (no server, no `.env`).

```bash
npm install          # installs React 18, openai 4.x, prismjs, marked, vite, typescript
npm run dev          # Vite dev server on http://localhost:5173
npm run typecheck    # tsc --noEmit
npm run build        # typecheck + production bundle in dist/
npm run preview      # serve dist/ on :5173
```

The stack follows §3.3 of the paper: TypeScript + React for the interface, Prism.js for code highlighting, the official `openai` npm library (v4, `dangerouslyAllowBrowser: true`) calling the Chat Completions API with `gpt-3.5-turbo` and `stream: true`. There is no backend: the browser talks to `api.openai.com` directly with the user's key (stored under `localStorage["directgpt.settings"]`).

## Source layout

```
index.html                 Vite entry
src/main.tsx               React root
src/App.tsx                State + orchestration: history, selection, tools, execution, drag manager
src/types.ts               Content, ObjectRef (text span / SVG element / location), PromptPart, Tool
src/prompts.ts             Engineered prompts (Appendix A.1.1–A.1.3, verbatim) + the few prompts the paper leaves open
src/extract.ts             Model answer -> object of interest (SVG / fenced code / text); localized answer cleanup
src/openai.ts              streamChat(): streaming Chat Completions call with AbortSignal
src/svg.ts                 SVG normalization (unique ids, sanitizing), thumbnails, coordinate conversion, change detection
src/diff.ts                Word-level LCS diff to highlight changes after a rewrite
src/chip.ts                Object-word ("chip") markup shared by prompt field, toolbar and drag ghost
src/dnd.ts                 Click-vs-drag threshold helper
src/prism.ts               Prism setup + tokenizer flattening
src/samples.ts             Study contents (§4.3) and their tasks
src/settings.ts            localStorage settings (API key, model; default gpt-3.5-turbo)
src/useHistory.ts          Linear undo/redo stack
src/components/TextView.tsx    Text/code representation: selection, marks, drag from selection
src/components/SvgView.tsx     Rendered SVG: element/location selection, overlays, drag
src/components/PromptField.tsx contenteditable prompt with object-word chips, drop targets, "Apply to N selected"
src/components/Toolbar.tsx     Reusable prompts (tools) with "?" slots
src/components/EmptyState.tsx  Paste content or pick a sample
src/components/Settings.tsx    API key / model dialog
src/components/ChatView.tsx    ChatGPT replica (baseline of §4)
src/styles.css
```

## Core model

- `Content = { kind: 'text' | 'code' | 'svg', value, language? }` is the *object of interest* (§3.2.1). It lives in a linear history (`useHistory`); the current entry is what the panel renders. SVG content is always stored **normalized**: parsed, scripts/handlers stripped, and every element given a unique `id` (`c0`, `c1`, … for missing or duplicate ids), as required by Appendix A.1.3.
- `ObjectRef` identifies something the user pointed at:
  - `TextRef { start, end, text }` — character offsets into `content.value` (plus the text, so stale offsets can be re-located after edits);
  - `ElementRef { id, thumb, label }` — an SVG element by id, with a standalone SVG thumbnail used as the chip;
  - `LocationRef { x, y }` — a point in SVG user coordinates.
- A prompt is `PromptPart[]`: typed text interleaved with `{ type: 'object', ref }` object-words.
- A `Tool` is a prompt template where object-words became `slot`s (`?`).

## Execution pipeline (`App.execute`)

1. Re-validate `TextRef`s against the current content (`refreshTextRef`), since offsets may have moved.
2. `buildPrompts(content, parts, targets)` (`prompts.ts`) chooses the engineered prompt:
   - no content → first generation (user prompt + short system message);
   - **SVG**: `<svg…>\n\nReturn modified SVG code to <instruction>` where object-words are `element with id "c0"` / `location (x, y)` (A.1.3). With a selection, a constraint line is appended (see DECISIONS.md §2);
   - **text/code with a selection** (localized, A.1.1): one prompt per selected span — the passage with the span replaced by `<blank>`, then `<blank>: …`, `INSTRUCTION: …`, `Rewrite <blank>. Follow INSTRUCTION`, `<blank>:`. Referred words in the same prompt are delimited as in A.1.2;
   - **text/code with object-words** (A.1.2): the passage with `0]word0]`, `1]word1]` delimiters, the instruction with `text delimited by 0]`, and `Keep rest of the text identical`;
   - **global**: content + instruction with a system message asking for the full modified text/code.
3. All requests run in parallel through `streamChat` with a shared `AbortController` (Stop button). While pending, `pending.targets` (selection ∪ referred objects) are rendered with the pulse animation (§3.2.4).
4. The answer is applied: localized answers (`extractLocalized`) are spliced into the spans; whole answers go through `extractObject`, which takes the SVG if there is one, else the first fenced code block (language from the fence), else the text. Kind can change (e.g. "convert to Python" keeps `code` but switches `language`; "draw…" on text yields `svg`).
5. The new content is pushed to history (one entry per user operation), changes are highlighted (`diff.changedRanges` for text/code, `svg.changedSvgIds` for SVG), the selection is cleared, and the prompt is added to the toolbar as a tool (deduplicated by template).

## Selection and feedback

- `TextView` renders the content as spans that preserve every character (Prism leaf tokens split further at mark boundaries), so DOM positions map to offsets with a `Range` (`offsetOf`). On `mouseup` the native selection is converted to a `TextRef`, trimmed of whitespace, and cleared (`removeAllRanges`) so the app's own highlight is what the user sees. Ctrl/Cmd adds or toggles spans. Marks: `m-sel`, `m-pulse`, `m-changed` (bold), `m-hover` (yellow, from hovering a chip), `m-slot`.
- `SvgView` injects the normalized SVG with `innerHTML` and draws overlays (dashed boxes for elements, small squares for locations) computed from `getBoundingClientRect` / `getScreenCTM`. Elements inside `defs`, gradients, etc. are not selectable (`isSelectableSvgElement`). Pulsing adds a class to the SVG elements themselves.
- After any selection completes, the prompt field is focused with the caret inside it, so "select, then type" works without clicking the field.

## Drag and drop

Custom pointer-based DnD (no HTML5 DnD, which does not work for SVG elements):

1. `beginPotentialDrag` (`dnd.ts`) is called on `pointerdown` — inside a selected text span in `TextView`, or on any SVG element/empty spot in `SvgView`. It distinguishes a click (select) from a drag (> 4 px).
2. `App.startDrag` renders a ghost chip following the pointer and calls `PromptField.dragOver(x, y)` on every move. The field computes the drop target from `caretPositionFromPoint`: inside a word → *replace that word* (yellow highlight); otherwise → *insert at caret* (blue bar).
3. On release over the field, `PromptField.drop(refs)` inserts chips (`createChipElement`, `contenteditable=false`, `data-ref` JSON) with spaces around them so they behave like single words; dropped objects are removed from the selection.

`readParts` serializes the editor DOM back into `PromptPart[]` on submit. Backspace/Delete next to a chip removes it; copy/paste of chips is supported through the `text/html` clipboard flavour.

## Tools (§3.2.3)

`partsToTemplate` turns the executed prompt into a template. Clicking a tool:
- with objects already selected → runs once (noun-verb): a 0-slot tool is localized to the selection; a k-slot tool consumes the first k selected objects;
- otherwise enters a mode: `activeTool = { id, filled: [] }`. While a mode is active, `App` tracks the pointer and renders `.tool-cursor`, a label showing the template with filled slots (§3.1).
 In `handleSelectionComplete`, 0-slot tools run on each completed (non-additive) selection; k-slot tools fill slots on each click and run when full, then reset their slots and stay active. Ctrl/Cmd-selections accumulate instead, and clicking the (already active) tool applies it to them once and leaves the mode. Esc leaves the mode.

## ChatGPT replica (`ChatView`)

Conversation kept client-side and re-sent whole on every turn with the 2023 ChatGPT system prompt, streamed answers, `marked` Markdown, Prism highlighting, and `<svg>` code blocks replaced by the rendered image (code hidden, as in the study). A study sample can be seeded as the first assistant message.

## Testing without spending tokens

The API call is isolated in `openai.ts`; during development the flows were verified in headless Chrome over the DevTools protocol with `Fetch` interception answering `api.openai.com` requests with canned SSE streams. Any such harness only needs to fulfil `POST https://api.openai.com/v1/chat/completions` with `text/event-stream` chunks of the form `data: {"choices":[{"delta":{"content":"…"}}]}` followed by `data: [DONE]`.

## Known limitations

- `gpt-3.5-turbo` is used as named by the paper; if OpenAI stops serving it, change the model name in Settings.
- Text object-words are matched by offsets, then by first occurrence of their text if the content changed underneath (e.g. after undo). If the text no longer exists an error toast is shown.
- Thumbnails of SVG elements ignore ancestor transforms (they show the element in its own coordinate system).
- Only the first fenced block of a model answer is used as the object; explanations around it are discarded, as DirectGPT "does less telling and more showing".
