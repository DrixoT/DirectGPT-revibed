# DirectGPT Interaction Validation Rubric

This document is a manual test plan for validating an implementation of **DirectGPT** (Masson, Malacria, Casiez, Vogel; CHI '24), "a direct manipulation interface to interact with large language models." It was derived solely from the paper text (sections 1-6, appendix A) and its seven figures. A human grader works through each test, compares the observed behavior with the expected behavior, and records a score.

## Scoring Key

| Score | Meaning |
|---|---|
| **Full Success** | The behavior matches the paper's description (and figures) in every observable respect listed under *Expected Result*. Small cosmetic deviations (exact colours, icon glyphs, wording of a placeholder) are acceptable as long as the same information and affordance is present. |
| **Partial Success** | The core mechanism exists and does something recognizably like the paper describes, but at least one named sub-behavior is missing, unreliable, requires a workaround, or presents wrong/misleading feedback. Note what is missing in *Observed result*. |
| **Failure** | The mechanism is absent, does nothing, crashes, or produces an outcome contrary to the paper's description (e.g., a localized prompt rewrites unrelated content). |

Record a score and short notes in the **Observed result** field of each test. When a test depends on an LLM response, judge the *interface behavior* (what was sent, what was replaced, what was highlighted), not the literary or artistic quality of the model's output. LLMs are non-deterministic; re-run a step once if the model returns something unusable before scoring.

## Test Plan Structure

Tests are organized by application area (the main DirectGPT screen and its content modes), then cross-area integration, then edge cases. Each test has:

- **ID:** Unique identifier, prefixed by area.
- **Prerequisites:** Required setup.
- **Steps:** Numbered actions.
- **Expected Result:** What should happen.
- **Success Criteria:** Full Success / Partial Success / Failure.
- **Observed result:** Blank space for the grader.

Area prefixes: `TEST-G` (general shell and continuous representation), `TEST-T` (text editing), `TEST-C` (code editing), `TEST-I` (vector image editing), `TEST-TB` (toolbar of reusable prompts), `TEST-FB` (immediate targeted feedback), `TEST-U` (undo/redo), `TEST-S` (study apparatus / ChatGPT baseline, optional), `TEST-INT` (cross-area integration), `TEST-EC` (edge cases).

## Key UX Elements Identified in the Paper

The following elements are what the tests below validate. Figure references are to the paper.

1. **Fixed-position content area (continuous representation).** The last output (text, code, or a rendered SVG) is always shown at the same place on screen and is replaced in place after every operation, instead of a growing chat transcript (section 3.2.1; figures 1a, 2, 3).
2. **Prompt field.** A single text input at the bottom with placeholder "Type your prompt here." and a send (paper-plane) button; Enter also executes (figures 1-4). With no selection it behaves like ChatGPT (global prompt).
3. **Click selection of objects and the "Apply to N selected element(s)" badge.** Clicking a word / code fragment / SVG shape selects it (blue highlight on text, dashed blue box on shapes). Ctrl+click adds to the selection. A blue badge attached to the prompt field reads "Apply to N selected element(s)" with an "x" control to clear the selection (figures 1b, 2a, 3b-d).
4. **Localized prompts.** Executing a prompt while objects are selected rewrites only those objects; the rest of the content is guaranteed unchanged by the interface (section 3.3.1, appendix A.1.1). Both noun-verb (select, then type) and verb-noun (type, then select) orders work.
5. **Drag-and-drop object references ("object-words").** Objects (or empty canvas points) can be dragged from the output and dropped into the prompt, either between words or onto a word (which is replaced; the target word highlights yellow during hover). The dropped reference renders with a grey background as a thumbnail (shapes), a coordinate "(x, y)" (locations), or a short text label, and behaves like a single word (deletable, copyable). Hovering an object-word highlights the referenced object in the output (section 3.2.2, figures 1c, 3a, 3c, 4a).
6. **Toolbar of reusable prompts.** After a prompt finishes executing it is added as a button in a "Toolbar" panel on the left. Object-words are abstracted to "?" (e.g., "draw a line from ? to ?"). Clicking a tool enters a mode where clicking objects applies the prompt; multi-noun tools fill each "?" with successive clicks (the button label shows the bound thumbnail) and execute on the last click. If objects are already selected, clicking a tool applies once and exits the mode (section 3.2.3, figures 1d, 2c, 4).
7. **Immediate targeted feedback.** While the model runs, the objects selected or referenced pulse (looping fade-in/fade-out). A stop control cancels generation. After completion, modified parts are highlighted (bold in figure 2b) (section 3.2.4).
8. **Undo / Redo.** "Undo" (top-left) and "Redo" (top-right) buttons plus keyboard shortcuts (ctrl+z / redo shortcut). One user operation (even on five selected elements) is one undo step. Buttons appear disabled when there is nothing to undo/redo (section 3.2.5, figure 3).
9. **Engineered prompts behind the scenes.** Localization uses a `<blank>` substitution prompt; text references use unique delimiters (e.g., `0]hot0]`); SVG references use auto-assigned unique `id` attributes (appendix A). These are validated through their observable consequences (only the selection changes; identical words are disambiguated; shapes are referenced correctly even when their code is non-contiguous).
10. **Study apparatus (optional).** Task panel on the left with non-selectable instruction and target image; content pre-loaded as the first message; a ChatGPT-replica baseline with word-by-word streaming, Markdown, syntax highlighting, and rendered SVGs (section 4).

## Test Fixtures

Use these unless a test says otherwise. Paste them (or generate equivalent content) as the starting object of interest.

**Fixture TEXT (Alice, first two paragraphs):**

> Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversations?"
>
> So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

Note that "pictures" occurs twice, and "sister" occurs twice; these are used to test disambiguation.

**Fixture CODE (JavaScript pyramid):**

```javascript
function printPyramid(height) {
  for (let row = 1; row <= height; row++) {
    let line = "";
    for (let s = 0; s < height - row; s++) {
      line += " ";
    }
    for (let k = 0; k < 2 * row - 1; k++) {
      line += "*";
    }
    console.log(line);
  }
}
printPyramid(5);
```

**Fixture FLOWER (SVG, 5 black petals + white centre, as in figure 5 bottom row):**

```svg
<svg width="300" height="150" viewBox="0 0 300 150">
  <circle cx="150" cy="40" r="18" fill="black"/>
  <circle cx="176" cy="60" r="18" fill="black"/>
  <circle cx="166" cy="90" r="18" fill="black"/>
  <circle cx="134" cy="90" r="18" fill="black"/>
  <circle cx="124" cy="60" r="18" fill="black"/>
  <circle cx="150" cy="66" r="9" fill="white"/>
</svg>
```

**Fixture SMILEY (SVG, as in figure 5 top row):**

```svg
<svg width="300" height="150" viewBox="0 0 300 150">
  <circle cx="150" cy="75" r="40" fill="orange"/>
  <circle cx="138" cy="62" r="4" fill="black"/>
  <circle cx="162" cy="62" r="4" fill="black"/>
  <circle cx="150" cy="75" r="4" fill="black"/>
  <line x1="130" y1="95" x2="170" y2="95" stroke="black" stroke-width="2"/>
</svg>
```

---

## 1. General Shell and Continuous Representation (TEST-G)

### TEST-G01: Application layout matches the paper's figures

**ID:** TEST-G01

**Prerequisites:** Application launched in a desktop browser at a typical width (about 1200 px or more). An API key or model backend is configured.

**Steps:**
1. Open the application and observe the initial screen without interacting.
2. Locate the "Undo" and "Redo" controls.
3. Locate the prompt input field and its send button.
4. Locate the "Toolbar" panel.
5. Locate the content area where the output will appear.

**Expected Result:** An "Undo" control sits at the top-left and a "Redo" control at the top-right above the content area (figures 1-3). The content area is a fixed panel in the middle. Below it is a single-line prompt field with placeholder text "Type your prompt here." and a paper-plane / send button on its right (figures 1-4). A panel labelled "Toolbar" exists to the left of the content area (figures 1d, 2c, 4); it may be empty or hidden until a first prompt runs, but the region is reserved. No chat transcript/message list is shown.

**Success Criteria:**
- Full Success: All five elements exist in approximately the positions described, and there is no conversation transcript in the main view.
- Partial Success: All elements exist but are placed differently, or the toolbar region is absent until first use with no indication it will appear, or a transcript is shown in addition to the fixed content area.
- Failure: Prompt field or Undo/Redo missing, or the interface is a chat-style scrolling list with no fixed content area.

**Observed result:**

Full Success

### TEST-G02: Generate an initial object of interest from a prompt

**ID:** TEST-G02

**Prerequisites:** TEST-G01 passed; empty content area.

**Steps:**
1. Click in the prompt field and type: `draw a flower with 6 petals as an SVG`.
2. Press Enter (or click the send button).
3. Wait for the model to respond.
4. Repeat in a fresh session with the prompt `write a two-sentence description of a rainy day` and then with `write a javascript function that adds two numbers`.

**Expected Result:** Each response appears in the content area in its final form: the SVG is *rendered* as an image (not shown as code), the prose is shown as text, and the function is shown as code with syntax highlighting (section 3.3: Prism.js). The prompt field clears after execution. No explanatory chat message is required; if the model adds prose around an SVG or code block, the interface still renders the object.

**Success Criteria:**
- Full Success: All three content types are generated and represented in final form (rendered SVG, highlighted code, readable text) in the same fixed content area.
- Partial Success: Content is generated, but one type is not represented in its final form (e.g., SVG displayed as raw markup, or code without highlighting), or the prompt field does not clear.
- Failure: Nothing is generated, or the output is shown only as a chat bubble/transcript.

**Observed result:**

Full Success

### TEST-G03: Load existing content as the starting object of interest

**ID:** TEST-G03

**Prerequisites:** Application launched.

**Steps:**
1. Copy Fixture TEXT to the clipboard.
2. Use whichever mechanism the implementation offers to start from existing content: paste it into the prompt field and press Enter, use a "paste/load content" control, or choose a preset task. (The paper: "Sam starts DirectGPT and pastes the current version of the story"; in the study the content "was already added to the conversation as the first message".)
3. Repeat with Fixture FLOWER.

**Expected Result:** The pasted text appears in the content area unchanged and becomes the manipulable object of interest (words become clickable per TEST-T01). The pasted SVG is rendered as an image and its shapes become clickable per TEST-I01. The content is not rewritten or "improved" by the model when merely loaded.

**Success Criteria:**
- Full Success: Both text and SVG can be loaded verbatim and are immediately manipulable.
- Partial Success: Loading works but only through an indirect route (e.g., prompting "repeat this exactly" and relying on the model), or loaded content is slightly altered.
- Failure: No way to bring in existing content; the content must be generated from scratch every time.

**Observed result:**

Full Success

### TEST-G04: Output is continuously represented at a fixed position and updated in place

**ID:** TEST-G04

**Prerequisites:** Fixture TEXT loaded (TEST-G03).

**Steps:**
1. Note the position and bounds of the content area.
2. With nothing selected, type `rewrite in the future tense` and press Enter.
3. After the response arrives, note where the new text appears.
4. Run a second global prompt: `make it one paragraph`.

**Expected Result:** Each response *replaces* the content in the same panel. The panel does not move, and the previous version does not remain visible above the new one as a chat history. The user always sees exactly one current version of the object (section 3.2.1: "display an object that remains at the same position").

**Success Criteria:**
- Full Success: Output replaces in place both times; no history list accumulates; position unchanged.
- Partial Success: Output replaces in place, but the panel shifts/resizes noticeably, or a secondary history view is also displayed by default.
- Failure: Each response is appended as a new message in a scrolling list.

**Observed result:**

Full Success

### TEST-G05: Global prompt with no selection behaves like ChatGPT

**ID:** TEST-G05

**Prerequisites:** Fixture SMILEY loaded; no elements selected (badge absent).

**Steps:**
1. Confirm the prompt field shows no "Apply to ... selected" badge.
2. Type `flip the image upside down` and press Enter.
3. Wait for the result.

**Expected Result:** The whole image is transformed (mouth above the eyes, as in figure 5e). This confirms that with no selection the prompt applies to the entire content ("Otherwise, the prompt applies to the whole content, like ChatGPT").

**Success Criteria:**
- Full Success: Global transformation applied to whole content with no selection required; result rendered in place.
- Partial Success: Global prompt works, but the interface required an explicit "global mode" toggle or the user had to first dismiss a stale selection.
- Failure: Global prompts are not possible without selecting something, or nothing happens.

**Observed result:**

Full Success

### TEST-G06: Prompt field accepts Enter and send-button execution

**ID:** TEST-G06

**Prerequisites:** Any fixture loaded.

**Steps:**
1. Type a short prompt (`add a title line`) and press Enter.
2. After completion, type another prompt (`remove the title line`) and click the send (paper-plane) button instead.

**Expected Result:** Both methods execute the prompt. The send button is visible at the right end of the prompt field (figures 1-4). During execution the field is either cleared or disabled so that duplicate submissions do not occur.

**Success Criteria:**
- Full Success: Both Enter and the button execute; no double submission.
- Partial Success: Only one of the two works, or double submission is possible.
- Failure: Prompts cannot be executed.

**Observed result:**

Full Success — both Enter and the paper-plane button executed exactly one request each and the field cleared after completion. Note: during generation the field is neither cleared nor disabled, but a second Enter/send click while a 3 s-delayed request was in flight produced no second request, so no double submission is possible.

---

## 2. Text Editing (TEST-T)

### TEST-T01: Click selects a single word; selection is visibly highlighted and the badge appears

**ID:** TEST-T01

**Prerequisites:** Fixture TEXT loaded.

**Steps:**
1. Click once on the first occurrence of the word `pictures`.
2. Observe the word and the prompt field.
3. Click on empty space in the content area (or use the badge's "x") to deselect.

**Expected Result:** The clicked word acquires a visible selection highlight (light blue background in figure 2a). A badge attached to the prompt field appears reading "Apply to 1 selected element" (figure 3b-d) with an "x" control on its left. Deselecting removes both the highlight and the badge.

**Success Criteria:**
- Full Success: Single click selects one word, highlight and badge appear with correct count, deselection works via the badge's x (or an equivalent single action).
- Partial Success: Selection works but the badge lacks the count or the "x", or deselection requires reloading.
- Failure: Words cannot be selected by clicking, or no badge appears.

**Observed result:**

Full Success

### TEST-T02: Ctrl+click builds a multi-word selection

**ID:** TEST-T02

**Prerequisites:** Fixture TEXT loaded, nothing selected.

**Steps:**
1. Click the first occurrence of `pictures`.
2. Hold Ctrl (Cmd on macOS is acceptable) and click `ran`.
3. Observe the badge count.
4. Ctrl+click `ran` again.

**Expected Result:** Both words are highlighted and the badge reads "Apply to 2 selected elements" (figure 2a). Ctrl+clicking an already selected word toggles it off, returning to 1 selected element. (The paper: "pressing ctrl while selecting the two words".)

**Success Criteria:**
- Full Success: Multi-selection accumulates with Ctrl+click, count updates, toggling off works.
- Partial Success: Multi-selection works but count is wrong or toggling off is impossible.
- Failure: Only one element can ever be selected.

**Observed result:**

Full Success

### TEST-T03: Localized prompt (noun-verb): select words, then prompt "synonym"

**ID:** TEST-T03

**Prerequisites:** Fixture TEXT loaded. Copy the fixture to a scratch document so you can diff later.

**Steps:**
1. Select the first `pictures` and, with Ctrl, `ran` (badge: "Apply to 2 selected elements").
2. Type `synonym` in the prompt field and press Enter.
3. Wait for completion.
4. Compare the entire text with the original.

**Expected Result:** Only the two selected words are replaced by synonyms (e.g., "illustrations", "sprinted" as in figure 2b). Every other character of the text, including the second occurrence of "pictures" and all punctuation, is byte-for-byte unchanged. The two replaced words are visibly highlighted (bold in figure 2b). The selection is cleared afterwards and the badge disappears.

**Success Criteria:**
- Full Success: Exactly the selected words change; rest identical; replacements highlighted; badge cleared.
- Partial Success: Selected words change but the rest of the text has minor unrelated changes, OR replacements are not highlighted, OR the selection remains active after execution.
- Failure: Whole text rewritten, wrong words changed, or the second "pictures" also changed.

**Observed result:**

Full Success — only “pictures” (1st) and “ran” changed (→ illustrations / sprinted), both bolded, badge cleared; the request log shows one <blank> substitution prompt per selected word, so the rest of the text is never sent for rewriting.

### TEST-T04: Localized prompt (verb-noun): type the prompt first, then select

**ID:** TEST-T04

**Prerequisites:** Fixture TEXT loaded; nothing selected.

**Steps:**
1. Click in the prompt field and type `add description of its tail` but do NOT press Enter.
2. Drag-select (or click) the phrase `a White Rabbit` in the content area (click on `White`, then Ctrl+click `Rabbit`, if word-level clicks are the only selection method; drag selection across words is also acceptable).
3. Confirm the badge appears while the typed prompt is still in the field.
4. Press Enter.

**Expected Result:** The typed prompt is retained when the selection is made afterwards ("seamlessly switch between local and global prompts, even after having started typing a prompt"). Only the selected span is rewritten, e.g., "a White Rabbit with a fluffy, cotton-like tail". Everything else stays identical.

**Success Criteria:**
- Full Success: Selecting after typing does not lose the prompt; the edit is localized to the selection.
- Partial Success: Works, but selecting clears or blurs the prompt field so the user has to retype; or multi-word contiguous selection is only possible one word at a time.
- Failure: Cannot select while a prompt is typed, or the prompt applies globally despite the selection.

**Observed result:**

Full Success — both a real mouse drag across “White Rabbit” and a drag across “a White Rabbit” selected the contiguous span as 1 element, the typed prompt survived the selection, and the request localized exactly that span.

### TEST-T05: Selecting a longer passage and summarizing it in place

**ID:** TEST-T05

**Prerequisites:** Fixture TEXT loaded.

**Steps:**
1. Select the entire second paragraph (drag-select from `So she` to `by her.`, or select all its words with Ctrl+click if drag selection is not supported).
2. Type `summarize in one sentence` and press Enter.

**Expected Result:** The second paragraph is replaced by a single sentence. The first paragraph is unchanged. The badge showed "Apply to N selected element(s)" before execution (N may be 1 for a contiguous range or the number of words).

**Success Criteria:**
- Full Success: Passage-level selection is supported and the summary replaces exactly that passage.
- Partial Success: Only word-level selection exists, making passage selection tedious but possible, or the replacement includes trailing/leading text from outside the selection.
- Failure: Multi-word passages cannot be localized; the whole text is rewritten.

**Observed result:**

Full Success — the whole second paragraph was selected by one drag (badge: 1 element) and only that paragraph was replaced; the mock model returned the paragraph plus “(edited)”, which is a model-output limitation, not an interface one.

### TEST-T06: Drag a word from the text into the prompt to create an object-word

**ID:** TEST-T06

**Prerequisites:** Fixture TEXT loaded; nothing selected.

**Steps:**
1. Type `replace ` (with trailing space) in the prompt field.
2. Press the mouse on the word `hot` in the text, drag it, and drop it at the end of the prompt.
3. Type ` and ` then drag `suddenly` and drop it at the end.
4. Type ` with synonyms`.
5. Inspect the prompt field before executing.

**Expected Result:** Each dropped word appears in the prompt as an "object-word": a chip with a grey background containing the word (or a brief description of it), distinct from typed text (figure 3a shows "(15, 20)" and figure 1c shows a thumbnail chip). The prompt reads roughly `replace [hot] and [suddenly] with synonyms`. Text typed after the drop is regular text.

**Success Criteria:**
- Full Success: Drag-and-drop from text into the prompt works, chips are visually distinct with grey background, and typing continues normally around them.
- Partial Success: Drop works but the reference is inserted as plain text indistinguishable from typed words, or drop only works at the end of the field.
- Failure: Words cannot be dragged into the prompt.

**Observed result:**

Full Success

### TEST-T07: Executing a prompt with text object-words disambiguates repeated words

**ID:** TEST-T07

**Prerequisites:** TEST-T06 prompt composed (or recompose: `replace [hot] and [suddenly] with synonyms`). Also prepare a second run below.

**Steps:**
1. Press Enter and wait.
2. Verify `hot` and `suddenly` were replaced and the remainder is unchanged.
3. Reload Fixture TEXT. Type `replace ` then drag the SECOND occurrence of `pictures` (in the quoted phrase "without pictures or conversations?") into the prompt, type ` with a synonym`, and execute.

**Expected Result:** Step 2: both referenced words are replaced with synonyms; rest of text preserved (appendix A.1.2: "Keep rest of the text identical"). Step 3: only the second occurrence of "pictures" changes; the first occurrence remains "pictures". This demonstrates the delimiter strategy that makes references unambiguous when a word appears multiple times.

**Success Criteria:**
- Full Success: Both runs replace exactly the referenced occurrence(s) and nothing else.
- Partial Success: References work but the wrong occurrence is sometimes changed, or the model rewrites small unrelated parts (and the interface does not prevent it).
- Failure: Referenced words are not changed, or the whole text is rewritten.

**Observed result:**

Full Success — visible result correct in both runs; the request log confirms the delimiter strategy (0]hot0] / 1]suddenly1], and 0]pictures0] wrapped around the second occurrence only) plus “Keep rest of the text identical”.

### TEST-T08: Object-words behave like single words (delete, copy) and hovering highlights the source

**ID:** TEST-T08

**Prerequisites:** Fixture TEXT loaded; prompt field contains `replace [hot] and [suddenly] with synonyms` composed via drag-and-drop.

**Steps:**
1. Hover the mouse over the `[hot]` chip in the prompt (do not click).
2. Observe the word `hot` in the content area.
3. Place the caret right after `[suddenly]` and press Backspace once.
4. Select the `[hot]` chip (e.g., shift+arrow or double-click) and copy/paste it elsewhere in the prompt, if supported.

**Expected Result:** Hovering the chip highlights the corresponding word in the text (section 3.2.2: "Hovering over an object-word highlights the corresponding object in the generated output"). Backspace removes the entire chip in one keystroke (it is "treated as a single word"), not one character. Copy/paste duplicates the chip as a reference.

**Success Criteria:**
- Full Success: Hover highlight, single-keystroke deletion, and copy/paste all work.
- Partial Success: Two of the three work (most commonly, copy/paste of chips is missing).
- Failure: Chips cannot be deleted as a unit and hovering gives no feedback.

**Observed result:**

Full Success — hover highlights the source word yellow, one Backspace deletes the whole chip. Real Ctrl/Cmd+V is inert in this headless browser, so copy/paste was exercised with synthetic copy/paste ClipboardEvents carrying the chip HTML: the pasted chip was reconstituted as a real reference chip with its data-ref intact.

### TEST-T09: Global text transformation without selection (future tense)

**ID:** TEST-T09

**Prerequisites:** Fixture TEXT loaded; no selection.

**Steps:**
1. Type `use the future tense throughout` and press Enter.

**Expected Result:** The entire text is rewritten in the future tense and shown in place. No badge was shown; no selection was required. (The study's fourth text task.)

**Success Criteria:**
- Full Success: Global rewrite works and replaces the content in place.
- Partial Success: Works but the result is appended rather than replacing, or the interface required clearing a phantom selection.
- Failure: Global text prompts are unsupported.

**Observed result:**

Full Success — with no selection the whole text plus the instruction was sent as one global request and the reply replaced the content in place in the single panel (the mock returns a placeholder string, so only the interface behaviour is judged).

---

## 3. Code Editing (TEST-C)

### TEST-C01: Code is displayed with syntax highlighting and is selectable at a fine granularity

**ID:** TEST-C01

**Prerequisites:** Fixture CODE loaded.

**Steps:**
1. Observe the code display.
2. Click on the identifier `height` in the function signature.
3. Ctrl+click on the keyword `for` in the second `for` loop.
4. Observe the badge.

**Expected Result:** The code is syntax-highlighted (keywords, strings, numbers coloured; section 3.3 names Prism.js). Individual tokens/words in the code can be selected with a click just like words in text, and the badge shows "Apply to 2 selected elements". Selecting whole lines by drag or click is also acceptable as long as token-level selection also exists.

**Success Criteria:**
- Full Success: Highlighting present; tokens selectable; multi-selection works; badge count correct.
- Partial Success: Highlighting present but only whole-line selection is possible (or vice versa).
- Failure: Code shown as plain unstyled text with no selection possible, or code not supported.

**Observed result:**

Full Success

### TEST-C02: Localized code edit: rename a variable by selecting it

**ID:** TEST-C02

**Prerequisites:** Fixture CODE loaded; copy the original for comparison.

**Steps:**
1. Click `s` in `for (let s = 0; ...` (the loop variable of the first inner loop). If the implementation selects whole lines, select the line `for (let s = 0; s < height - row; s++) {` instead.
2. Type `rename to spaces` and press Enter.
3. Diff the result against the original.

**Expected Result:** The selected token/line is rewritten (e.g., `for (let spaces = 0; spaces < height - row; spaces++) {`). All other lines are unchanged. Note: the paper's localization guarantees only the selected portion is replaced, so if only the single token `s` was selected, only that token changes; a grader should accept either the token-only or the line-level result as long as nothing outside the selection changed.

**Success Criteria:**
- Full Success: Only the selected part changes; syntax highlighting still applied; change highlighted.
- Partial Success: Selected part changes but formatting/indentation of surrounding code is disturbed, or the change is not highlighted.
- Failure: Whole function rewritten or the selection is ignored.

**Observed result:**

Full Success — the request localized to the single selected token (<blank> around that `s` only), only that token was rewritten, Prism highlighting was preserved and the change bolded; the mock's replacement text (“s (edited)”) is a model artefact.

### TEST-C03: Localized code edit on a multi-line selection: convert a for loop into a while loop

**ID:** TEST-C03

**Prerequisites:** Fixture CODE loaded.

**Steps:**
1. Select the entire inner loop block from `for (let k = 0; ...` through its closing `}` (drag-select the lines, or Ctrl+click each line, whichever the implementation supports).
2. Type `convert to a while loop` and press Enter.

**Expected Result:** The selected block is replaced by an equivalent `while` loop with the same indentation level. The outer loop, the other inner loop, and `printPyramid(5);` are unchanged.

**Success Criteria:**
- Full Success: Multi-line block selection supported; replacement confined to the block; indentation preserved.
- Partial Success: Block selection is awkward (one token at a time) or the replacement has broken indentation but is confined to the block.
- Failure: Cannot select a block, or unrelated code changes.

**Observed result:**

Full Success — a drag across the whole inner `for` block selected it as one element and the request substituted <blank> for exactly that block with the surrounding lines and indentation untouched.

### TEST-C04: Global code transformation: convert the function to Python

**ID:** TEST-C04

**Prerequisites:** Fixture CODE loaded; no selection.

**Steps:**
1. Type `convert this to Python` and press Enter.

**Expected Result:** The entire content is replaced by a Python version, displayed with Python syntax highlighting. The interface does not require any selection for a global code change.

**Success Criteria:**
- Full Success: Global conversion replaces content in place with appropriate highlighting.
- Partial Success: Conversion works but highlighting is stuck on JavaScript, or explanatory prose from the model is displayed inside the code area.
- Failure: Global code prompts unsupported.

**Observed result:**

Full Success — global request sent with no selection and the result replaced the content in place. The mock always returns JavaScript for this prompt, so a Python result could not be produced; language detection was verified separately by loading Python source, which rendered as `language-python`.

### TEST-C05: Drag a code token into the prompt and reference it

**ID:** TEST-C05

**Prerequisites:** Fixture CODE loaded.

**Steps:**
1. Type `add a comment above ` then drag the token `console` (from `console.log(line);`) into the prompt, then type ` explaining it`.
2. Verify a grey object-word chip is shown.
3. Press Enter.

**Expected Result:** A comment line is inserted directly above the `console.log(line);` statement. The rest of the code is unchanged. The chip in the prompt showed the token text.

**Success Criteria:**
- Full Success: Drag-and-drop referencing works for code tokens and the edit is placed at the referenced location.
- Partial Success: Drop works but the model places the comment elsewhere (interface sent a correct reference but model erred) or the chip renders as plain text.
- Failure: Cannot drag code tokens into the prompt.

**Observed result:**

Partial Success: the interface half works — dragging the `console` token into the prompt produced a proper grey chip and the request carried the correct reference (`0]console0]` … “add a comment above text delimited by 0] explaining it / Keep rest of the text identical”). But no comment line was inserted above `console.log(line);`; the mock model simply rewrote the delimited token to “console (edited)”. Per this test's Partial criterion (“interface sent a correct reference but model erred”) this scores Partial; no interface defect was found.

---

## 4. Vector Image Editing (TEST-I)

### TEST-I01: Rendered SVG shapes are clickable and show a dashed selection box

**ID:** TEST-I01

**Prerequisites:** Fixture FLOWER loaded.

**Steps:**
1. Click the top petal.
2. Observe the shape and the prompt field badge.
3. Ctrl+click two more petals.
4. Click the "x" on the badge.

**Expected Result:** A clicked shape shows a dashed blue selection box around it (figures 1b, 3c, 4c). The badge reads "Apply to 1 selected element", then "Apply to 3 selected element(s)" after Ctrl+clicks (figure 1b). Clicking the badge's "x" clears all selection boxes.

**Success Criteria:**
- Full Success: Shape-level selection with visible box, correct badge counts, clear via badge.
- Partial Success: Shapes selectable but no visual box (only the badge changes) or the count is wrong.
- Failure: SVG is not rendered or shapes cannot be selected.

**Observed result:**

Full Success

### TEST-I02: Localized image edit: gradient on three selected petals

**ID:** TEST-I02

**Prerequisites:** Fixture FLOWER loaded; three petals selected (badge: "Apply to 3 selected element(s)").

**Steps:**
1. Type `use red/blue gradient` and press Enter.
2. Wait for the result.

**Expected Result:** Only the three selected petals become gradient-filled (figure 1b, figure 5b); the other two petals and the white centre remain black/white and in place. The image is re-rendered in place. Any `<defs>`/gradient definitions the model needs to add are acceptable, since they do not alter the unselected shapes' appearance.

**Success Criteria:**
- Full Success: Exactly the three selected shapes are restyled; nothing else moves or recolours.
- Partial Success: Selected shapes restyled but one unselected shape also changed, or shapes shift position.
- Failure: No change, whole image recoloured, or SVG becomes invalid/blank.

**Observed result:**

Full Success — resulting SVG shows fill=url(#g1) on exactly c0/c1/c2 with a <defs> gradient added; c3, c4 and the white centre are byte-identical, and the request said “Apply this only to element with id … Keep everything else in the SVG identical.”

### TEST-I03: Localized image edit: remove selected elements

**ID:** TEST-I03

**Prerequisites:** Fixture SMILEY loaded.

**Steps:**
1. Click the nose (centre small circle).
2. Type `remove` and press Enter.
3. After completion, select the mouth line and prompt `remove` again.

**Expected Result:** Only the nose disappears in step 2 (compare figure 5d, where eyes remain). Only the mouth disappears in step 3. The face and eyes are untouched both times. (The paper notes ChatGPT often removed the eyes too when asked to "remove the nose"; DirectGPT should avoid this via localization.)

**Success Criteria:**
- Full Success: Exactly the selected element is removed each time.
- Partial Success: The selected element is removed but a neighbouring element is also altered once.
- Failure: Wrong element removed or nothing removed.

**Observed result:**

Full Success

### TEST-I04: Drag a shape into the prompt: thumbnail object-word

**ID:** TEST-I04

**Prerequisites:** Fixture FLOWER loaded; nothing selected.

**Steps:**
1. Type `copy that and place it there` in the prompt field (do not execute).
2. Drag the bottom petal from the canvas and hover over the word `that` in the prompt; observe the hover feedback.
3. Drop it on `that`.
4. Observe the prompt field.

**Expected Result:** While hovering a draggable object over a word, the word is highlighted (yellow in figures 1c and 3a) to signal that dropping will replace it. After the drop, the word `that` is replaced by a chip with a grey background showing a small thumbnail of the petal (a black circle) as in figure 1c. The rest of the prompt text stays intact ("copy [●] and place it there").

**Success Criteria:**
- Full Success: Hover-to-replace highlight, drop-on-word replaces the word, chip shows a thumbnail of the shape.
- Partial Success: Drop works but inserts rather than replaces, or the chip shows a text label (e.g., "circle c2") instead of a thumbnail, or no hover feedback.
- Failure: Shapes cannot be dragged into the prompt.

**Observed result:**

Full Success

### TEST-I05: Drag an empty canvas location into the prompt: coordinate object-word

**ID:** TEST-I05

**Prerequisites:** TEST-I04 state: prompt reads `copy [●] and place it there`.

**Steps:**
1. Press the mouse on an empty area of the canvas (e.g., near the bottom-right, away from any shape), drag toward the prompt, and drop on the word `there`.
2. Observe the chip.
3. Press Enter and wait.

**Expected Result:** The word `there` is replaced by a grey chip with the pixel coordinates, e.g., "(15, 10)" or "(240, 130)" (figures 1c, 3a, 4a). After execution a copy of the petal appears at (approximately) the dropped location (figure 1c right). The original petal remains.

**Success Criteria:**
- Full Success: Empty-canvas drag yields a coordinate chip; the model places the copy near that location; original unchanged.
- Partial Success: Coordinate chip works but the copy is placed far from the location, or coordinates are not shown in the chip.
- Failure: Cannot drag from empty canvas; locations cannot be referenced.

**Observed result:**

Full Success

### TEST-I06: Drop between words (back-and-forth composition) and hover-highlight of the referenced shape

**ID:** TEST-I06

**Prerequisites:** Fixture FLOWER loaded; prompt empty.

**Steps:**
1. Type `draw a black line from ` (with trailing space).
2. Drag the bottom petal and drop it at the end of the prompt (between/after words, not onto a word).
3. Type ` to ` and drag an empty point near the bottom of the canvas to the end of the prompt.
4. Hover over the petal chip in the prompt and watch the canvas.
5. Press Enter and wait.

**Expected Result:** Dropping between words inserts a chip without replacing any text (figure 3c). Hovering a chip highlights the corresponding petal on the canvas. Executing draws a line from the petal to the dropped location, giving the flower a stem (figure 3b). The petals are otherwise unchanged.

**Success Criteria:**
- Full Success: Insert-between-words works, hover highlight works, and the line is drawn between the referenced shape and location.
- Partial Success: Line is drawn but hover highlight is missing, or drops only work at the very end of the field.
- Failure: Chips cannot be inserted between words or the line is not drawn using the references.

**Observed result:**

Full Success — chips can be dropped at the end of the field and also between two existing words (verified separately by dropping between “make” and “bigger”); hovering the shape chip draws a yellow box on the referenced petal; execution added <line x1=166 y1=90 x2=150 y2=143>, i.e. petal → dropped location.

### TEST-I07: Reference another shape to copy its properties ("add a circle like this")

**ID:** TEST-I07

**Prerequisites:** Flower with a stem and a diagonal line (result of TEST-I06 plus one more line, or any SVG with a circle and a line end point).

**Steps:**
1. Click the end point region of a line (or the line itself) to select it, so the badge shows "Apply to 1 selected element" (figure 3b).
2. Type `add a circle like ` and drag one petal into the prompt after `like` (figure 3c).
3. Press Enter.

**Expected Result:** A new circle with the same size/colour as the referenced petal is added at the selected location (figure 3d). Both a selection (localizing where) and a reference (specifying what it should be like) are used in one prompt.

**Success Criteria:**
- Full Success: Combined selection + reference prompt yields a same-size circle at the selected spot.
- Partial Success: Circle added but of the wrong size or at the wrong location, while the interface clearly sent both the selection and the reference.
- Failure: Selection and reference cannot be combined in one prompt.

**Observed result:**

Full Success — request combined both scopes (“add a circle like element with id c0” + “Apply this only to element with id c7”) and a black r=18 circle (same size/colour as the referenced petal) was added at the selected line.

### TEST-I08: Auto-assigned unique ids on SVG elements

**ID:** TEST-I08

**Prerequisites:** Load this SVG, which has duplicate and missing ids:

```svg
<svg width="300" height="150"><circle id="a" cx="60" cy="75" r="20" fill="black"/><circle id="a" cx="150" cy="75" r="20" fill="black"/><circle cx="240" cy="75" r="20" fill="black"/></svg>
```

**Steps:**
1. Type `draw a line between ` and drag the leftmost circle into the prompt, type ` and `, drag the middle circle, and press Enter.
2. If the implementation offers a way to view the underlying SVG source (a code toggle, developer console, or an exported file), inspect the element ids. Otherwise judge by behavior only.

**Expected Result:** A line is drawn between the left and middle circles (not the right one), demonstrating that the two circles sharing `id="a"` were disambiguated (appendix A.1.3: "DirectGPT makes sure all elements have a unique id. If not, or if the id is not unique, the ids are modified."). If inspectable, every element has a unique id.

**Success Criteria:**
- Full Success: Correct circles connected; ids unique if inspectable.
- Partial Success: Behavior correct for most runs but occasionally the wrong circle is used, or duplicate ids remain but are handled by position.
- Failure: Line connects the wrong circles or the reference fails because of the duplicate ids.

**Observed result:**

Full Success — on load the duplicate id="a" was rewritten (second circle became c0, the id-less third became c1) and the drawn line runs 60,75 → 150,75, i.e. the left and middle circles; every element in the rendered SVG has a unique id.

### TEST-I09: Global image transformation (upside down)

**ID:** TEST-I09

**Prerequisites:** Fixture FLOWER loaded; no selection.

**Steps:**
1. Type `turn the image upside down` and press Enter.

**Expected Result:** The whole image flips (figure 5e). Rendered in place. No selection was required.

**Success Criteria:**
- Full Success: Global transformation applied and rendered.
- Partial Success: Applied, but rendering is clipped or a stale selection interfered.
- Failure: Not possible.

**Observed result:**

Full Success

---

## 5. Toolbar of Reusable Prompts (TEST-TB)

### TEST-TB01: Executed prompt is added to the toolbar as a button

**ID:** TEST-TB01

**Prerequisites:** Fixture TEXT loaded; toolbar empty.

**Steps:**
1. Select a word (e.g., `peeped`) and execute the prompt `synonym`.
2. Observe the toolbar after the prompt finishes.
3. Execute a global prompt with no selection: `add a title`.
4. Observe the toolbar.

**Expected Result:** After step 1 completes, a button labelled "synonym" appears in the "Toolbar" panel (figure 2b-c). After step 3, a second button "add a title" appears (the paper: "as soon as a prompt finishes executing, it is added as a button in a toolbar"). Buttons are added only after completion, not when typed.

**Success Criteria:**
- Full Success: Every completed prompt becomes a labelled toolbar button, in order, after completion.
- Partial Success: Buttons are added, but only for localized prompts, or duplicates pile up for identical prompts with no dedupe, or buttons appear before the prompt finishes.
- Failure: No toolbar / no buttons are created.

**Observed result:**

Full Success — with a 2.5 s model delay the toolbar was still showing its empty placeholder mid-generation and the button appeared only on completion; the later global prompt added a second button in order.

### TEST-TB02: Using a single-noun tool as a mode (verb-noun): click tool, then click words

**ID:** TEST-TB02

**Prerequisites:** Toolbar contains "synonym" (from TEST-TB01). Nothing selected.

**Steps:**
1. Click the "synonym" toolbar button.
2. Observe the cursor/indicator and the button's active state.
3. Click the word `reading` in the text.
4. Wait for completion, then click the word `bank`.
5. Press Escape or click the tool again to exit the mode (whichever the implementation supports).

**Expected Result:** After step 1 the tool is visibly active (pressed/highlighted button; the paper: "With the cursor now indicating 'synonym'" so a cursor label or badge is expected). Each click on a word immediately applies the "synonym" prompt to that word (it pulses, then is replaced) without typing anything (figure 2c). The mode persists across multiple clicks until the user exits it. The prompt field is not required for these operations.

**Success Criteria:**
- Full Success: Tool mode indicated near cursor or on the button; each click applies the tool; mode persists; can be exited.
- Partial Success: Tool applies on click but there is no visible mode indicator, or the mode exits after one use even with no prior selection.
- Failure: Clicking the tool button does nothing, or it merely pastes the text into the prompt field.

**Observed result:**

Full Success — the button highlights blue, a status line reads ‘Tool “synonym” active — select objects to apply it (Esc to leave)’, a label follows the cursor and the content cursor becomes “copy”; two successive word clicks each applied the prompt (reading→perusing, bank→riverbank) with the prompt field untouched, and Escape exited.

### TEST-TB03: Using a tool once on a pre-existing selection (noun-verb, no mode)

**ID:** TEST-TB03

**Prerequisites:** Toolbar contains "synonym". Fixture TEXT loaded.

**Steps:**
1. Select `sleepy` and Ctrl+click `stupid` (badge: 2 selected).
2. Click the "synonym" toolbar button.
3. After completion, click another word (e.g., `daisies`) with no tool active, and observe whether it is merely selected or immediately modified.

**Expected Result:** Step 2 applies the tool immediately to both selected words in a single operation. Afterwards, the tool is *not* left active ("the tool is only used once and the mode is restored immediately after executing"), so step 3 simply selects `daisies` without triggering a synonym replacement.

**Success Criteria:**
- Full Success: Immediate one-shot application to the selection; mode not retained afterwards.
- Partial Success: Applies to the selection but the tool stays active, so step 3 also triggers an edit.
- Failure: Clicking the tool with a selection does nothing or clears the selection.

**Observed result:**

Full Success — one click on the tool rewrote both selected words in a single operation and the mode indicator was gone afterwards; the following click on “daisies” only selected it (zero further requests).

### TEST-TB04: Multi-noun prompt is abstracted with "?" placeholders

**ID:** TEST-TB04

**Prerequisites:** Fixture FLOWER loaded; execute `draw a black line from [petal] to [(x, y)]` composed via drag-and-drop (see TEST-I06).

**Steps:**
1. After completion, read the new toolbar button label.

**Expected Result:** The label shows the prompt with each object-word replaced by a "?" placeholder: "draw a black line from ? to ?" (figures 1d, 4b). Typed words are kept verbatim.

**Success Criteria:**
- Full Success: Label matches the pattern with one "?" per object-word.
- Partial Success: Button is created but the label shows the concrete thumbnails/coordinates, or collapses both nouns into one "?".
- Failure: Prompts with object-words are not added to the toolbar.

**Observed result:**

Full Success

### TEST-TB05: Multi-noun tool binds nouns click-by-click and executes on the last click

**ID:** TEST-TB05

**Prerequisites:** Toolbar contains "draw a black line from ? to ?" (TEST-TB04). Nothing selected.

**Steps:**
1. Click the "draw a black line from ? to ?" button.
2. Click a petal on the canvas.
3. Read the toolbar button label.
4. Click an empty location on the canvas.
5. Wait for completion; read the label again.
6. Repeat steps 1-4 on the opposite side to create a symmetric branch (as in the use case).

**Expected Result:** After step 2 the button label updates to show the bound first noun, e.g., "draw a black line from [●] to ?" (figures 1d, 4c). Step 4 fills the second noun and *executes* the prompt (figure 4d); a line is drawn from the petal to the clicked point. After execution the label reverts to "draw a black line from ? to ?" and the tool is ready to be used again. Clicking empty canvas during binding produces a coordinate noun; clicking a shape produces a shape noun.

**Success Criteria:**
- Full Success: Progressive binding with label feedback; auto-execute on the last noun; label resets; both shape and location nouns accepted.
- Partial Success: Binding works but the label does not update, or the user must press an extra "run" control after the last click, or only shapes (not empty locations) can be bound.
- Failure: Multi-noun tools cannot be used, or clicks execute after the first noun with the second unset.

**Observed result:**

Full Success — after the first click the label became “draw a black line from [thumbnail] to ?”, the second click (empty canvas) executed automatically and the label reset to “? to ?”; both shape nouns and location nouns bind, and a location→location pair also binds two nouns before firing.

### TEST-TB06: Multi-noun tool applied to a pre-existing multi-selection

**ID:** TEST-TB06

**Prerequisites:** Toolbar contains "draw a black line from ? to ?". Fixture FLOWER loaded.

**Steps:**
1. Click one petal, then Ctrl+click a second petal (badge: 2 selected).
2. Click the "draw a black line from ? to ?" button.

**Expected Result:** The two selected objects fill the two placeholders in selection order and the prompt executes immediately; a line joins the two petals. The tool does not stay active (section 3.2.3: "a user can select two locations (by maintaining the ctrl key) and then click 'draw a line from ? to ?'. The line is drawn and the tool is no longer selected.").

**Success Criteria:**
- Full Success: Immediate execution using the selection; tool not left active.
- Partial Success: Executes, but the tool remains in binding mode or the order of nouns is unpredictable.
- Failure: Tool ignores the selection or requires re-clicking the objects.

**Observed result:**

Full Success — the request was “draw a black line from element with id c4 to element with id c1” (selection order), a line joined the two petals and the mode indicator was empty afterwards.

### TEST-TB07: Tools persist across content changes and across content types

**ID:** TEST-TB07

**Prerequisites:** Toolbar contains "synonym" (created on text).

**Steps:**
1. Undo/redo or run several more prompts; confirm "synonym" remains in the toolbar.
2. Load Fixture CODE (new content) and check whether the toolbar still lists earlier tools.
3. Click "synonym" and then click an identifier in the code.

**Expected Result:** Tools remain in the toolbar for the session regardless of subsequent operations. Because tools are domain-agnostic ("consistent across application domains"), applying "synonym" to a code identifier sends the same localized prompt and replaces the identifier. (Whether tools survive a content reset is an implementation choice; the paper resets content between study tasks but does not say tools are cleared. Accept either, but note it.)

**Success Criteria:**
- Full Success: Tools persist through operations and can be applied to any content type.
- Partial Success: Tools persist but cannot be applied to a different content type, or vanish after undo.
- Failure: Toolbar is cleared after every prompt.

**Observed result:**

Full Success — tools survive further prompts and undo, and survive switching the content to code/SVG through the “Load study sample” menu; “synonym” created on text then applied to a code identifier sent the same localized <blank> prompt. Noted: a full page reload or the “New” button clears the toolbar along with the content, which the rubric allows.

### TEST-TB08: Toolbar is visible and readable with many tools

**ID:** TEST-TB08

**Prerequisites:** Any fixture loaded.

**Steps:**
1. Execute eight different short prompts in succession (e.g., `bold`, `italic`, `shorter`, `longer`, `formal`, `casual`, `rhyme`, `translate to French`), each with a selected word.
2. Observe the toolbar.

**Expected Result:** All eight tools are listed as readable, individually clickable buttons; the toolbar scrolls or wraps rather than overflowing the window. Labels are the prompt text (truncated with ellipsis is acceptable if the full text is visible on hover).

**Success Criteria:**
- Full Success: All tools visible/reachable and clickable; no overflow.
- Partial Success: Tools are present but some are cut off or overlap other UI.
- Failure: Toolbar breaks the layout or stops adding tools.

**Observed result:**

Full Success

---

## 6. Immediate Targeted Feedback (TEST-FB)

### TEST-FB01: Selected objects pulse while a localized prompt executes

**ID:** TEST-FB01

**Prerequisites:** Fixture TEXT loaded. It helps to use a slow model or throttle the network so the generation lasts a few seconds.

**Steps:**
1. Select `pictures` and `ran` (Ctrl+click).
2. Type `synonym` and press Enter.
3. Watch the two words during the generation.
4. Watch the rest of the text.

**Expected Result:** From the moment the prompt is sent until the response arrives, the two selected words display a looping fade-in/fade-out "pulse" animation (section 3.2.4). Unselected text does not pulse. When the response arrives the pulse stops and the words are replaced.

**Success Criteria:**
- Full Success: Only the selected objects pulse for the whole duration; animation stops on completion.
- Partial Success: A generic spinner is shown instead of (or in addition to) targeted pulsing, or the pulse is on the whole content area.
- Failure: No loading feedback at all.

**Observed result:**

Full Success — with a 5 s delay only the two selected words carried class m-pulse with a looping animation (dgpt-pulse-bg); the rest of the text had animationName “none”, and on completion the animation stopped and the words were replaced/bolded.

### TEST-FB02: Objects referenced by object-words pulse during execution

**ID:** TEST-FB02

**Prerequisites:** Fixture FLOWER loaded; nothing selected.

**Steps:**
1. Compose `draw a black line from [petal] to [(x, y)]` via drag-and-drop (TEST-I06).
2. Press Enter and watch the canvas.

**Expected Result:** The referenced petal pulses, and the referenced pixel location is also indicated (e.g., a pulsing marker at that coordinate; the use case says "the bottom petal and pixel location start pulsing until a line is drawn"). Other petals do not pulse.

**Success Criteria:**
- Full Success: Referenced shape and location both pulse until the line appears.
- Partial Success: Only the shape pulses (location has no marker), or all shapes pulse.
- Failure: No targeted feedback for references.

**Observed result:**

Full Success — the referenced petal pulses (dgpt-pulse-el) and a separate small pulsing marker is drawn at the referenced coordinate; the other four petals do not animate.

### TEST-FB03: Stop button cancels a generation in progress

**ID:** TEST-FB03

**Prerequisites:** Any fixture loaded; slow model or throttled network recommended.

**Steps:**
1. Select several words and execute `rewrite as a poem`.
2. While the words are pulsing, locate and click the stop control ("the user can click a button to stop the generation").
3. Observe the content and the toolbar.

**Expected Result:** A stop control is visible during generation (e.g., the send button turns into a stop icon, or a "Stop" button appears). Clicking it halts the request; the pulsing stops; the content stays exactly as it was before the prompt; the cancelled prompt is not added to the toolbar (it did not finish executing); the prompt field is usable again.

**Success Criteria:**
- Full Success: Stop control present; cancellation leaves content unchanged and does not add a tool.
- Partial Success: Stop exists but the late-arriving response is still applied, or the aborted prompt is still added to the toolbar.
- Failure: No way to cancel.

**Observed result:**

Full Success — the send button becomes a red square “Stop generation” control; clicking it stopped the pulse, left the content byte-identical, added no toolbar button, left Undo disabled, kept the prompt text for retry, and the late (6 s) response was never applied.

### TEST-FB04: Modified parts are highlighted after execution

**ID:** TEST-FB04

**Prerequisites:** Fixture TEXT loaded.

**Steps:**
1. Select `pictures` (first) and `ran`, execute `synonym`.
2. After completion, look at the replaced words.
3. Execute a different prompt (or click elsewhere) and see whether the highlight is retained or cleared.

**Expected Result:** The replaced words are visibly distinguished from the rest (bold in figure 2b; a background colour is acceptable) so the user can "notice the differences". The highlight belongs to the most recent operation; it is acceptable for it to be cleared by the next operation.

**Success Criteria:**
- Full Success: Replaced spans are highlighted immediately after completion.
- Partial Success: Highlight exists but is not confined to the changed spans (e.g., whole paragraph), or disappears within a second.
- Failure: No indication of what changed.

**Observed result:**

Full Success

### TEST-FB05: Feedback and pulsing on SVG shapes during a localized edit

**ID:** TEST-FB05

**Prerequisites:** Fixture SMILEY loaded.

**Steps:**
1. Select the two eyes (Ctrl+click).
2. Execute `make them blue`.
3. Watch the eyes while generating and after.

**Expected Result:** Both eyes pulse during generation; after completion they are blue and are visibly highlighted as changed (e.g., a brief outline), while the face and mouth are unchanged.

**Success Criteria:**
- Full Success: Targeted pulsing on shapes and post-change highlighting.
- Partial Success: Pulsing works but no post-change highlight for shapes.
- Failure: No shape feedback.

**Observed result:**

Full Success — both eyes pulse during generation, end up fill="blue", and are outlined by “box changed” markers afterwards; face and mouth are unchanged.

---

## 7. Undo and Redo (TEST-U)

### TEST-U01: Undo and Redo buttons revert and restore the last operation

**ID:** TEST-U01

**Prerequisites:** Fixture TEXT loaded.

**Steps:**
1. Select `peeped`, execute `synonym`; note the new word.
2. Click "Undo" (top-left).
3. Click "Redo" (top-right).

**Expected Result:** After Undo, the text shows `peeped` again in exactly the original form. After Redo, the synonym is back. The content area updates in place. Nothing is sent to the model for undo/redo (it should be instantaneous).

**Success Criteria:**
- Full Success: Undo and Redo restore exact prior states instantly.
- Partial Success: Undo works but Redo is missing, or undo is implemented by re-prompting the model (slow, non-deterministic).
- Failure: No undo.

**Observed result:**

Full Success — Undo/Redo restored the exact prior strings in ~0.4 s with zero API requests.

### TEST-U02: Keyboard shortcuts for undo and redo

**ID:** TEST-U02

**Prerequisites:** Fixture TEXT loaded; one operation performed.

**Steps:**
1. Click on the content area (so focus is not in the prompt field) and press Ctrl+Z (Cmd+Z on macOS).
2. Press Ctrl+Shift+Z or Ctrl+Y (Cmd+Shift+Z on macOS).
3. Repeat step 1 with focus inside the (empty) prompt field.

**Expected Result:** Ctrl+Z reverts the generated output (section 3.2.5: "using the ctrl+z shortcut"), and the redo shortcut restores it. With focus in an empty prompt field, Ctrl+Z should still undo the content operation (or, at minimum, not break anything).

**Success Criteria:**
- Full Success: Both shortcuts work from the content area; behavior with prompt field focus is sensible.
- Partial Success: Only Ctrl+Z works, or shortcuts work only when a specific element is focused.
- Failure: No keyboard undo.

**Observed result:**

Full Success — Ctrl+Z and Ctrl+Shift+Z (and the Cmd equivalents) both work with focus in the content area. With focus in the prompt field Ctrl/Cmd+Z does not undo the content operation, which is sensible (it is left to the text field) and nothing broke.

### TEST-U03: Undo granularity matches the user's operation (multi-selection = one step)

**ID:** TEST-U03

**Prerequisites:** Fixture TEXT loaded.

**Steps:**
1. Select five different words with Ctrl+click.
2. Execute `synonym`.
3. Click "Undo" once.

**Expected Result:** A single Undo reverts all five words at once ("if the user selects five elements and applies a prompt to them all at once, then this whole interaction is considered as one revertible operation").

**Success Criteria:**
- Full Success: One undo step reverts the entire five-word operation.
- Partial Success: Undo reverts one word per click.
- Failure: Undo fails on multi-selection operations.

**Observed result:**

Full Success — badge read 5, five words were rewritten (5 m-changed spans) and a single Undo restored the original text exactly, after which Undo was disabled.

### TEST-U04: Undo across a sequence of operations and branch on new action

**ID:** TEST-U04

**Prerequisites:** Fixture FLOWER loaded.

**Steps:**
1. Perform three operations: (a) select a petal, `make it red`; (b) select another petal, `make it blue`; (c) global `add a green stem`.
2. Click Undo three times, observing the image after each click.
3. Click Redo twice.
4. Perform a new operation: select a petal, `make it yellow`.
5. Try to click Redo.

**Expected Result:** Each Undo steps back one operation in reverse order (stem removed, blue reverted, red reverted). Redo twice re-applies red and blue. After the new operation in step 4, the redo history is discarded and the Redo button is disabled/inert (standard undo-stack behavior).

**Success Criteria:**
- Full Success: Multi-level undo/redo with correct ordering; redo stack cleared by a new action.
- Partial Success: Multi-level undo works but redo history is not cleared (leading to inconsistent states), or only one level of undo.
- Failure: Undo history is unreliable.

**Observed result:**

Full Success — the three undos returned exactly to states 2, 1 and 0, the two redos returned exactly to states 1 and 2, and after the new “make it yellow” operation Redo was disabled.

### TEST-U05: Undo/Redo disabled state when nothing to undo/redo

**ID:** TEST-U05

**Prerequisites:** Fresh session with content loaded but no operations executed.

**Steps:**
1. Observe the Undo and Redo buttons before any operation.
2. Execute one operation; observe both buttons.
3. Undo; observe both buttons.

**Expected Result:** Initially both buttons appear disabled/greyed (figure 3a shows greyed Undo/Redo, figure 3b shows Undo enabled and Redo greyed). After one operation, Undo is enabled and Redo disabled. After undoing, Undo is disabled and Redo enabled.

**Success Criteria:**
- Full Success: Disabled states reflect the history exactly.
- Partial Success: Buttons are always enabled but clicking with nothing to undo is harmless.
- Failure: Clicking Undo with empty history corrupts the content or errors.

**Observed result:**

Full Success

### TEST-U06: Undo after a tool-mode operation

**ID:** TEST-U06

**Prerequisites:** Toolbar contains "synonym".

**Steps:**
1. Click "synonym" tool, click a word, wait; click a second word, wait.
2. Click Undo twice.

**Expected Result:** Each tool application is its own undo step; two Undos restore both words. The tool button remains in the toolbar after undo.

**Success Criteria:**
- Full Success: Each tool click is one undo step; toolbar unaffected.
- Partial Success: Undo works but removes the tool from the toolbar, or two tool applications are merged into one step.
- Failure: Tool-driven edits cannot be undone.

**Observed result:**

Full Success

---

## 8. Study Apparatus and ChatGPT Baseline (TEST-S) - optional

These tests apply only if the implementation includes the study harness or the ChatGPT-replica baseline described in section 4. Skip and mark "N/A" if not implemented; do not count as failures unless the implementation claims to provide them.

### TEST-S01: Task panel shows the current task and a non-selectable instruction

**ID:** TEST-S01

**Prerequisites:** Study mode available.

**Steps:**
1. Start a study session/activity.
2. Locate the task panel on the left of the interface.
3. Attempt to click/select the instruction text in the task panel.
4. Attempt to drag the target image from the task panel into the prompt.

**Expected Result:** The panel shows a short instruction (e.g., "Text in yellow => synonyms" or "Reproduce") and an image of the content to edit with the relevant parts in yellow (or the target image). The instruction cannot be selected or dragged, so it cannot be used as an object reference. The panel stays visible at all times.

**Success Criteria:**
- Full Success: Panel present, always visible, instruction non-selectable, target image not draggable into the prompt.
- Partial Success: Panel present but instruction text is selectable/draggable.
- Failure: No task panel.

**Observed result:**

Full Success — study panel pinned to the left with task name, “Task 1 of 4”, a countdown, the instruction “Text in yellow => synonyms” and the target text with yellow marks; the whole panel is user-select:none with draggable="false" on the instruction and target, a drag across the instruction selected nothing, and dragging instruction/target into the prompt inserted nothing.

### TEST-S02: Content is pre-loaded per task and reset between tasks; 3-minute limit and closeness rating

**ID:** TEST-S02

**Prerequisites:** Study mode available.

**Steps:**
1. Begin a task; confirm the starting content is already in the content area.
2. Make an edit, then advance to the next task.
3. Let a task run for 3 minutes without finishing.
4. Complete or time out a task and observe what follows.

**Expected Result:** Content is pre-loaded "as the first message"; advancing resets the content to the next task's starting version; the task ends automatically at the 3-minute limit; after each task a 5-point "How close are you to the target" (distant-close) rating is requested.

**Success Criteria:**
- Full Success: Pre-load, reset, time limit, and rating prompt all present.
- Partial Success: Two or three of the four present.
- Failure: None present.

**Observed result:**

Full Success — content is pre-loaded per task, “Task done” raises a 5-point “How close are you to the target?” (distant–close) dialog, rating advances to “Task 2 of 4” with the timer reset to 3:00 and the content reset to that task's starting version, and letting the timer run to 0:00 auto-ended the task with the same rating dialog plus “The three-minute limit was reached.” (observed by waiting out a full 3-minute task).

### TEST-S03: ChatGPT-replica baseline streams word by word, renders Markdown/code, and renders SVGs

**ID:** TEST-S03

**Prerequisites:** Baseline interface available.

**Steps:**
1. Open the baseline interface and send `show me a 3-line python function`.
2. Observe how the answer appears.
3. Send `draw a smiley face as SVG`.
4. Look for any direct manipulation features (click selection, toolbar, undo).

**Expected Result:** The reply streams progressively (word by word), the conversation is kept as a linear transcript, code is syntax-highlighted and Markdown is rendered, and an SVG in the reply is rendered as an image with its code hidden. No selection, toolbar, or undo features exist in the baseline; the conversation cannot be restarted or forked.

**Success Criteria:**
- Full Success: All listed baseline behaviors present and no DirectGPT features leak in.
- Partial Success: Baseline exists but lacks streaming, SVG rendering, or shows SVG code.
- Failure: No baseline.

**Observed result:**

Full Success — linear transcript, code returned in a fenced block is rendered as a highlighted <pre> (Prism), Markdown is rendered (a reply containing **bold** displayed as bold), an SVG reply is rendered as an image with the markup hidden, and no toolbar/undo/selection leaks in (clicking a word in the transcript selects nothing and creates no badge). Streaming: both baseline requests were sent with stream:true and the app parses the SSE body, but the mock fulfils the whole SSE response in one chunk, so incremental word-by-word rendering could not be observed either way.

---

## 9. Cross-Area Integration (TEST-INT)

### TEST-INT01: End-to-end use case, part 1: text revision (section 3.1)

**ID:** TEST-INT01

**Prerequisites:** Fresh session.

**Steps:**
1. Paste Fixture TEXT.
2. Select `a White Rabbit` (drag or Ctrl+click), type `add description of its tail`, press Enter. Observe pulsing, then replacement.
3. Select the first `pictures` and `ran` (Ctrl+click), type `synonym`, press Enter. Observe pulsing, replacement, highlighting, and the "synonym" tool appearing.
4. Click the "synonym" tool; click `peeped`; wait; click `reading`; wait.
5. Press Undo once.

**Expected Result:** The sequence runs exactly as narrated in the paper's use case: localized edits with pulsing feedback; two-word synonym replacement; "synonym" appears in the toolbar and is usable as a click-to-apply tool; Undo reverts only the last tool application (`reading`).

**Success Criteria:**
- Full Success: Every step behaves as described without workarounds.
- Partial Success: The sequence completes but one step needed a workaround (e.g., retyping a prompt, manually deselecting) or one feedback element was missing.
- Failure: The sequence cannot be completed.

**Observed result:**

Full Success — every step ran without a workaround: drag-selected “a White Rabbit” with the prompt already typed (pulse on the span, then localized replacement), Ctrl+click two words for “synonym” (2 pulsing words → illustrations/sprinted, bolded, “synonym” added to the toolbar), tool mode applied to “peeped” then “reading”, and one Undo reverted only the “reading” application.

### TEST-INT02: End-to-end use case, part 2: drawing the flower (section 3.1, figures 3-4)

**ID:** TEST-INT02

**Prerequisites:** Fresh session.

**Steps:**
1. Type `draw a flower with 6 petals` and press Enter. Expect an SVG rendered (five black petals and a white centre, or similar). If the model's drawing is unusable, load Fixture FLOWER instead and note it.
2. Type `draw a black line from here to there`. Drag the bottom petal onto `here`; drag a point near the bottom of the canvas onto `there`. Press Enter. Observe pulsing on the petal and the point, then a stem.
3. Click the toolbar button "draw a black line from ? to ?". Click two points on the canvas. A line is drawn (a leaf branch). Repeat for a symmetric branch on the other side.
4. Click the top of the first branch line to localize; type `add a circle like this`; drag a petal onto `this`; press Enter. Repeat on the other branch.
5. Compare with figure 3d / figure 5c (bottom row).

**Expected Result:** The interface supports the entire narrated flow: generation, prompt-then-bind drag-and-drop, multi-noun tool reuse with two clicks, and a combined selection + reference prompt. The final image resembles a flower with a stem, two leaf lines, and two circles at their ends.

**Success Criteria:**
- Full Success: Whole flow works; final image resembles the target.
- Partial Success: Flow works except one mechanism (e.g., multi-noun tool needs manual re-entry, or coordinates must be typed).
- Failure: Two or more mechanisms missing; flow cannot be completed.

**Observed result:**

Full Success — the whole flow works: the flower is generated and rendered, “here”/“there” are replaced by a petal thumbnail chip and a coordinate chip, both pulse during generation, the stem is drawn; the “draw a black line from ? to ?” tool then drew both leaf branches with two clicks each, and two selection+reference prompts added a black r=14 circle at each branch tip. The final image matches figure 3d (flower, stem, two branches, two circles). Caveat: when both nouns bound to empty locations the mock model returns a green rect instead of a line — a model limitation; the interface bound and sent the two locations correctly.

### TEST-INT03: Localization plus references plus toolbar plus undo in code

**ID:** TEST-INT03

**Prerequisites:** Fixture CODE loaded.

**Steps:**
1. Select the token `line` in `let line = "";` and execute `rename to output`. Confirm only the selected token changed (the interface only replaces the selection; other occurrences remain `line`). Note the "rename to output" tool.
2. Click the "rename to output" tool and click each remaining `line` occurrence one at a time.
3. Type `swap the bodies of ` then drag the first inner `for` and the second inner `for` into the prompt as two references; press Enter.
4. Undo the last operation.

**Expected Result:** Step 1 is strictly localized. Step 2 shows tools working on code tokens repeatedly. Step 3 shows two code references in one prompt with a whole-content rewrite constrained to the referenced blocks. Step 4 restores the pre-swap code in one step.

**Success Criteria:**
- Full Success: All four steps behave as described.
- Partial Success: Three of four.
- Failure: Two or fewer.

**Observed result:**

Full Success — step 1 localized to the single `line` token only; step 2 applied the new tool to each remaining occurrence one click at a time; step 3 sent both code references in one prompt (0]for0] and 1]for1] plus “Keep rest of the text identical”); step 4 undid in one step. Note: the mock returned the code unchanged for the swap instruction, so step 3's rewrite could only be verified from the request payload, not from the output.

### TEST-INT04: Switching between local and global prompts mid-composition

**ID:** TEST-INT04

**Prerequisites:** Fixture SMILEY loaded.

**Steps:**
1. Type `make it green` (do not execute). Click the face circle: badge shows 1 selected. Click the badge's "x": badge disappears while the typed prompt remains.
2. Click the face again, then press Enter. Verify only the face changed.
3. Now type `make it pink` with nothing selected, then press Enter. Verify the whole image (all shapes, or the interpretation of "it" by the model for the whole content) is affected and no badge was shown.

**Expected Result:** The prompt field content survives selection and deselection; the same field switches between local and global scope purely by whether a selection exists ("This reuse of the prompt field allows users to seamlessly switch between local and global prompts").

**Success Criteria:**
- Full Success: Scope switching with a persistent typed prompt; local run touches only the face.
- Partial Success: Switching works but clearing the selection also clears the prompt text.
- Failure: Scope cannot be changed once typing started.

**Observed result:**

Full Success — the typed prompt survived selecting and clearing the badge, re-selecting the face and pressing Enter changed only c0 (“Apply this only to element with id c0”), and the following prompt with no selection was sent as a global request with no badge.

### TEST-INT05: Object-word thumbnails stay in sync after undo

**ID:** TEST-INT05

**Prerequisites:** Fixture FLOWER loaded.

**Steps:**
1. Select a petal and execute `make it red` (petal turns red; tool "make it red" created).
2. Drag the now-red petal into the prompt: `move ` [red petal] ` to the left`. Do not execute.
3. Press Undo (petal returns to black).
4. Hover the chip in the prompt; then press Enter.

**Expected Result:** The chip still references the same shape (hover highlights that petal) and the prompt executes on it. Whether the chip's thumbnail updates from red to black is an implementation detail; the reference must remain valid. If the referenced object no longer exists after undo, the interface should indicate a broken reference rather than silently sending a stale id.

**Success Criteria:**
- Full Success: Reference remains valid after undo; hover and execution target the same shape.
- Partial Success: Reference works but hover highlight is lost or the thumbnail is stale and misleading.
- Failure: Execution errors or targets a different shape.

**Observed result:**

Full Success — after Undo the chip thumbnail refreshed from red back to black, hovering it highlighted the same petal (c0), and executing sent “move element with id c0 to the left”.

---

## 10. Edge Cases (TEST-EC)

### TEST-EC01: Empty prompt with a selection, and empty prompt with no selection

**ID:** TEST-EC01

**Prerequisites:** Fixture TEXT loaded.

**Steps:**
1. With nothing typed and nothing selected, press Enter / click send.
2. Select a word, leave the prompt empty, press Enter.

**Expected Result:** Neither action sends a request or modifies content. No toolbar button is created. The selection remains (step 2). No error dialog is needed; the send button may simply be disabled.

**Success Criteria:**
- Full Success: No request, no content change, no tool, no error.
- Partial Success: No content change but an empty tool button is created or an error is shown.
- Failure: Content is modified or the app breaks.

**Observed result:**

Full Success — the send button is disabled while the field is empty; Enter and a forced click both produced zero requests, no content change, no toolbar entry and no error, and the selection stayed in step 2.

### TEST-EC02: Localized prompt where the model returns extra text

**ID:** TEST-EC02

**Prerequisites:** Fixture TEXT loaded.

**Steps:**
1. Select `bank` and execute `explain this word in three paragraphs and then give a synonym`.
2. Observe what is inserted into the text.

**Expected Result:** Because localization works by replacing the selection with the model's answer (appendix A.1.1), the selected word will be replaced by whatever the model returns for `<blank>`. The interface should insert only the returned replacement in place of the selection; the surrounding text stays unchanged. If the implementation trims obvious wrapper text (e.g., a leading "`<blank>:`" label or code fences), that is a bonus.

**Success Criteria:**
- Full Success: Replacement confined to the selection; no leaked wrapper labels such as "`<blank>:`" or quotation artifacts.
- Partial Success: Confined to the selection, but wrapper artifacts leak into the text.
- Failure: Surrounding text altered or the whole text replaced.

**Observed result:**

Full Success

### TEST-EC03: Very short prompts ("red") on selected shapes

**ID:** TEST-EC03

**Prerequisites:** Fixture SMILEY loaded.

**Steps:**
1. Select the face circle; type `red`; press Enter.

**Expected Result:** The face becomes red. The paper explicitly calls out that "colouring object A requires selecting A and prompting 'red' or 'colour red'", so one-word verbs must work.

**Success Criteria:**
- Full Success: One-word prompt applied correctly to the selection.
- Partial Success: Works only with a longer phrase such as "make it red".
- Failure: Short prompt fails or produces an error.

**Observed result:**

Full Success

### TEST-EC04: Selection of the same word twice, and selection reset after execution

**ID:** TEST-EC04

**Prerequisites:** Fixture TEXT loaded.

**Steps:**
1. Click `sister` (first occurrence); Ctrl+click `sister` (second occurrence). Badge should read 2.
2. Execute `synonym`.
3. Immediately after completion, without clicking anything, type `bold` and press Enter.

**Expected Result:** Both occurrences are replaced (selection is per occurrence, not per word string). After execution the selection is cleared, so step 3 is a *global* prompt and the badge is absent; the model interprets "bold" for the whole text (or the interface may accept the global change). The key check is that a stale selection does not silently persist.

**Success Criteria:**
- Full Success: Per-occurrence selection; selection cleared after execution.
- Partial Success: Per-occurrence selection works but the selection persists after execution (step 3 is unexpectedly local).
- Failure: Selecting the second occurrence selects both, or execution changes only one.

**Observed result:**

Full Success — badge read 2 for the two “sister” occurrences, both were replaced (2 requests, one per occurrence), the badge disappeared afterwards and the next prompt was sent as a global system+user request.

### TEST-EC05: Dropping an object onto an existing object-word replaces it

**ID:** TEST-EC05

**Prerequisites:** Fixture FLOWER loaded; prompt reads `copy [petal A] and place it there` (petal A dropped via drag).

**Steps:**
1. Drag a different petal (B) and drop it onto the `[petal A]` chip.
2. Hover the chip and confirm which petal highlights.

**Expected Result:** The chip now references petal B (only one chip remains; A's chip was replaced). Hover highlights B.

**Success Criteria:**
- Full Success: Drop onto a chip replaces it.
- Partial Success: Drop inserts a second chip next to the first (both present).
- Failure: Drop onto a chip is rejected or corrupts the prompt.

**Observed result:**

Full Success

### TEST-EC06: Model error / network failure during execution

**ID:** TEST-EC06

**Prerequisites:** Any fixture loaded. Disconnect the network or configure an invalid API key.

**Steps:**
1. Select a word and execute `synonym`.
2. Observe the interface after the request fails.

**Expected Result:** The pulse stops, an unobtrusive error message appears, the content is unchanged, no toolbar button is created for the failed prompt, and the prompt text may be restored to the field for retry. Undo history is not polluted by a no-op entry.

**Success Criteria:**
- Full Success: Graceful failure; content intact; no tool created; no dead undo entry.
- Partial Success: Error shown but pulsing continues or a tool/undo entry is created.
- Failure: Interface hangs or content is corrupted.

**Observed result:**

Full Success — with the mock forced to 500: pulsing stopped, a small toast plus an inline “500 mock failure” message appeared, the text was byte-identical, the toolbar stayed empty, Undo remained disabled (no dead entry) and the prompt text was left in the field for retry.

### TEST-EC07: Invalid SVG returned by the model for an image edit

**ID:** TEST-EC07

**Prerequisites:** Fixture FLOWER loaded.

**Steps:**
1. Select a petal and execute `explain what this shape is` (a prompt likely to return prose rather than SVG).
2. Observe the content area and Undo.

**Expected Result:** If the model does not return usable SVG for the selected element, the interface must not leave the canvas blank or broken permanently. Acceptable behaviors: the element is replaced with the model's response only if it parses as SVG; otherwise the interface shows an error and keeps the prior image, or the user can Undo to recover.

**Success Criteria:**
- Full Success: Invalid output is detected and the image is preserved (or Undo restores it in one step).
- Partial Success: The image breaks but Undo restores it.
- Failure: Image is lost with no recovery.

**Observed result:**

Full Success — the image was never blanked or broken and one Undo restored the exact prior SVG. Note: the mock always returns parseable SVG for image content (both “explain what this shape is” and a deliberately off-topic prompt came back as valid SVG), so a genuinely invalid model response could not be induced; the recovery path (image preserved + single-step Undo) is what was observed.

### TEST-EC08: Multiple identical prompts and toolbar deduplication

**ID:** TEST-EC08

**Prerequisites:** Fixture TEXT loaded.

**Steps:**
1. Select a word, execute `synonym`. Select another word, execute `synonym` again by typing it.
2. Observe the toolbar.

**Expected Result:** The paper does not specify deduplication. Either a single "synonym" button (deduplicated) or two buttons is acceptable, but the toolbar must remain usable and the first button must still work. Record which behavior was observed.

**Success Criteria:**
- Full Success: Toolbar remains usable; either dedup or ordered duplicates.
- Partial Success: Duplicates accumulate without bound and push other tools out of view.
- Failure: Second execution breaks the toolbar.

**Observed result:**

Full Success — observed behaviour is deduplication: the second “synonym” execution did not add a second button, and the existing button still activated tool mode and applied correctly.

### TEST-EC09: Tool mode interaction with the prompt field and Escape

**ID:** TEST-EC09

**Prerequisites:** Toolbar contains "synonym".

**Steps:**
1. Click "synonym" to activate the tool mode.
2. Click into the prompt field and start typing `something`.
3. Press Escape (or click the active tool again).
4. Click a word in the text.

**Expected Result:** The interface handles the ambiguity coherently: typing in the prompt field either exits the tool mode or the mode remains but is clearly indicated. After step 3 the tool mode is off. Step 4 selects the word normally without applying a tool.

**Success Criteria:**
- Full Success: Clear mode indication; Escape/click-again exits; no unintended tool application.
- Partial Success: Mode can be exited but only by reloading or executing a prompt.
- Failure: Tool mode is sticky and unpredictable, applying to clicks the user intended as selection.

**Observed result:**

Full Success — typing in the prompt field leaves the mode on but clearly indicated (highlighted button, cursor-following label and status line); Escape exits it, and the following word click only selected the word (zero requests).

### TEST-EC10: Long text content and selection near scroll boundaries

**ID:** TEST-EC10

**Prerequisites:** Load a text of about 800-1000 words (e.g., Fixture TEXT repeated four times).

**Steps:**
1. Scroll the content area to the bottom; select a word in the last paragraph; execute `synonym`.
2. Observe scroll position and highlighting after the update.

**Expected Result:** The content area scrolls internally (the whole page does not grow unbounded); after the update the changed word is still visible/highlighted and the scroll position is preserved or brought to the change.

**Success Criteria:**
- Full Success: Internal scrolling; position preserved; change visible.
- Partial Success: Works but scroll jumps to top after each update.
- Failure: Long content breaks selection or layout.

**Observed result:**

Full Success — with ~950 words the content panel scrolls internally (overflow-y:auto, page height unchanged at 800 px), the scroll offset was identical before and after the update (228 px), and the changed word stayed in view and bolded.

### TEST-EC11: Localized prompt on a shape whose SVG code is non-contiguous (group / use)

**ID:** TEST-EC11

**Prerequisites:** Load this SVG:

```svg
<svg width="300" height="150"><defs><circle id="dot" r="12" fill="black"/></defs><use href="#dot" x="80" y="75"/><use href="#dot" x="150" y="75"/><g id="grp"><rect x="200" y="60" width="30" height="30" fill="black"/><text x="200" y="120">label</text></g></svg>
```

**Steps:**
1. Click the second `use` circle (at x=150) and execute `make it red`.
2. Click the rect inside the group and execute `remove`.

**Expected Result:** Because the code for an element "is not always located within a contiguous part of the SVG specification", the paper uses ids rather than delimiters for shapes. The interface should still be able to target the clicked instance (only the second circle turns red, and only the rect is removed, leaving the text label).

**Success Criteria:**
- Full Success: Both targeted edits affect only the clicked element.
- Partial Success: The `use` instance cannot be targeted individually (both circles turn red) but the grouped rect works.
- Failure: Clicks on such elements are not selectable or edits hit the wrong element.

**Observed result:**

Full Success — both clicks targeted only the clicked element: the second <use> was selected individually and the request said “Apply this only to element with id c2” (the first <use> untouched), and removing the grouped <rect> left the <text> label in place. Caveat on rendering: the mock applied the colour as fill="red" on the <use> element, which the referenced <circle id="dot" fill="black"> overrides, so the circle does not visibly turn red — an SVG-semantics artefact of the model's edit, not of the interface's targeting.

### TEST-EC12: Keyboard-only clearing of selection and badge behavior with 0 elements

**ID:** TEST-EC12

**Prerequisites:** Fixture TEXT loaded.

**Steps:**
1. Select two words.
2. Press Escape with focus on the content area.
3. Observe the badge.
4. Ctrl+click one selected word to toggle it off, then the other.

**Expected Result:** Escape (or an equivalent single action) clears the selection and hides the badge. Toggling off all words one by one also hides the badge; the badge never shows "Apply to 0 selected elements".

**Success Criteria:**
- Full Success: Badge hidden whenever the count is 0; Escape clears the selection.
- Partial Success: Badge shows 0 briefly or Escape does nothing but the badge x works.
- Failure: Stuck badge with 0 or a stale count.

**Observed result:**

Full Success
