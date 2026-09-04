# DECISIONS.md — questions I would otherwise have asked, with the default taken

Each entry lists the question, the alternatives, and the default that is implemented.

## 1. Localized text prompt with several selected spans

The paper prints the A.1.1 prompt for a single selection (`<blank>`), yet the scenario applies "synonym" to two selected words at once and undo treats this as one operation.

- (a) One A.1.1 prompt per selected span, sent in parallel, results spliced back into the text, pushed as a single undo entry. **(default)**
- (b) One prompt with numbered blanks (`<blank0>`, `<blank1>`) and a parsed multi-line answer.
- (c) Sequential prompts, each seeing the previous result.

Default (a) keeps the printed prompt verbatim and the outcome deterministic; (b) would invent a prompt format the paper does not show.

## 2. Localizing a prompt on SVG elements / locations

Appendix A.1.1 covers text. For "Apply to N selected elements" on a vector image the paper only says the prompt is forced to apply to those objects.

- (a) Reuse the A.1.3 form and append a constraint: `Return modified SVG code to <instruction>` + `Apply this only to element with id "c0" and location (15, 20). Keep everything else in the SVG identical.` **(default)**
- (b) Replace each selected element's markup with `<blank>` as in A.1.1 and ask for the element only (cannot add gradients/defs, cannot target a location).
- (c) Treat selected elements as implicit object-words appended to the instruction.

## 3. Global prompt (no selection, no object-words) on existing text/code

Not printed in the paper ("the prompt applies to the whole content, like ChatGPT").

- (a) Single user message `<content>\n\n<instruction>` plus a short system message asking for the complete modified text/code only, no explanation. **(default)**
- (b) Send the content as a previous assistant turn and the instruction as the user turn (ChatGPT-like history).
- (c) No system message; rely on extraction heuristics.

For SVG the A.1.3 form `Return modified SVG code to <instruction>` is used as-is.

## 4. First generation (no object of interest yet)

- (a) User prompt with a short system message steering drawings to SVG code and code to fenced blocks. **(default)**
- (b) Bare user prompt, no system message.

The paper's scenario starts with "draw a flower with 6 petals" producing an SVG; without (a) gpt-3.5-turbo sometimes answers with ASCII art.

## 5. Conversation history

- (a) Every DirectGPT operation is a standalone request on the current object; history is the undo stack. **(default)**
- (b) Keep a running chat history like the baseline.

The engineered prompts in the appendix are self-contained, and undo/redo would be inconsistent with a growing history.

## 6. Selection after dropping an object into the prompt

- (a) A dropped object leaves the selection (it is now referred to, not a localization target), matching fig. 1c/3a where no "Apply to…" indicator is shown. **(default)**
- (b) Keep it selected, making the prompt both localized and referring.

Objects selected but not dropped stay selected (fig. 3c: location selected + petal dropped).

## 7. Tool mode details

- A tool with no "?" applies to each selection completed without Ctrl/Cmd; Ctrl/Cmd-selections accumulate and are applied by clicking the tool (noun-verb, §3.2.3). **(default)** Alternative: apply on every selection.
- A tool with "?" slots stays active after executing (slots reset), until Esc or clicking it again. **(default)** Alternative: leave the mode after one execution.
- Identical templates are not added twice; tools are appended in execution order and can be removed with the small ✕.

## 8. Model parameters

The paper names only the model. Temperature, max tokens and other parameters are left at the API defaults. Model name defaults to `gpt-3.5-turbo` and can be changed in Settings.

## 9. ChatGPT replica (study baseline)

- System prompt: the 2023 ChatGPT system prompt (`You are ChatGPT, a large language model trained by OpenAI, based on the GPT-3.5 architecture. Knowledge cutoff: 2021-09. Current date: …`). The paper says it was "identical to the one used in ChatGPT" but does not print it. **(default)**
- Markdown rendering library: `marked` (the paper does not name one). Code highlighting: Prism.js. SVGs in the conversation are rendered and their code hidden, as in the study.

## 10. Change highlighting

The paper shows modified words in bold (fig. 2b). Text/code changes are computed with a word-level LCS diff on the client and shown in bold; changed or new SVG elements get a fading dotted outline.

## 11. Library versions

The paper names TypeScript, ReactJS, Prism.js and the official OpenAI library without versions. Current versions are used: React 18.3, `openai` 4.104 (v4 line, browser mode with the user's key), Prism.js 1.30, TypeScript 5.9, Vite 6.
