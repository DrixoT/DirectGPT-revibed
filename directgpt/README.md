# DirectGPT

A reimplementation of **DirectGPT: A Direct Manipulation Interface to Interact with Large Language Models** (Masson, Malacria, Casiez, Vogel — CHI 2024). DirectGPT is a user-interface layer on top of an LLM (`gpt-3.5-turbo`) that turns direct-manipulation actions into engineered prompts: the generated text, code or SVG image stays on screen, you select parts of it to localize a prompt, drag parts of it into the prompt to refer to them, reuse executed prompts from a toolbar, and undo/redo every operation.

The app runs entirely in the browser: you paste your own OpenAI API key in *Settings* (it is kept in `localStorage` and sent only to `api.openai.com`).

## Launch

Requirements: Node.js 18 or newer (tested with Node 26) and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. For a production build use `npm run build` and serve `dist/` (`npm run preview` serves it on the same port).

First thing to do: click **Settings** (top right), paste an OpenAI API key, and save. The model defaults to `gpt-3.5-turbo`, the one used in the paper; it can be changed in the same dialog.

## Using DirectGPT

### 1. Get an object of interest

Either type a prompt in the field at the bottom (e.g. *draw a flower with 6 petals*, *write a haiku about rain*, *write a JS function that prints a pyramid*), or paste text / code / SVG markup into the empty panel and click **Use this content**, or pick one of the study samples (Alice, Frankenstein, two JavaScript functions, the flower and the smiley) from **Load study sample**.

The result is shown in the central panel and stays there: text as prose, code with syntax highlighting, SVG rendered as an image. Every later operation updates this same panel and highlights what changed (bold words in text/code, a fading outline on changed SVG elements).

### 2. Prompt the whole object (like ChatGPT)

With nothing selected, a prompt applies to the whole content: *use the future tense*, *convert to Python*, *flip the image upside down*.

### 3. Localize a prompt: select, then type

- **Text and code**: select a span with the mouse (double-click selects a word). Hold **Ctrl/Cmd** while selecting to add more spans.
- **SVG**: click an element to select it; Ctrl/Cmd-click to add more; click an empty spot to select a pixel location.

The prompt field shows **Apply to N selected elements**. Now type only the verb — *synonym*, *add description of its tail*, *use red/blue gradient*, *rename to size* — and press Enter. Only the selected objects are rewritten; they pulse while the model works. Click the ✕ on the indicator or press Esc to deselect.

### 4. Refer to objects: drag them into the prompt

Drag a selected span of text, an SVG element, or an empty spot of the image and drop it **onto a word** of the prompt (the word turns yellow and is replaced) or **between words** (a blue caret shows the insertion point). The object becomes an *object-word*: a grey chip showing the word, a thumbnail of the shape, or `(x, y)` for a location. Chips can be deleted with Backspace/Delete and copied/pasted like words. Hovering a chip highlights the object in the output.

Examples: type *add a line from here to there*, then drop two locations on *here* and *there*; type *replace this and that with synonyms* and drop two words; select a location, type *add a circle like this* and drop a petal on *this*.

Dropping several selected objects at once inserts one chip per object.

### 5. Reuse prompts from the toolbar

Every executed prompt becomes a button in the left **Toolbar**, with its object-words replaced by **?** (e.g. *add a line from ? to ?*).

While a tool is active, its label follows the mouse cursor (showing slots already filled, e.g. *add a line from (100, 60) to ?*) so you can see the active tool where you are pointing.

- **Verb then noun (mode)**: click a tool. For a tool without `?`, every selection you now make is immediately rewritten with that prompt (e.g. the *synonym* tool). For a tool with `?`, each click on an object fills the next `?` (the button shows it) and the prompt runs when all slots are filled. The mode stays active until you press **Esc** or click the tool again.
- **Noun then verb (no mode)**: select objects first, then click the tool; the prompt runs once and no mode is entered.

Clicking an active tool while objects are selected applies it to them right away; clicking it with nothing selected leaves the mode.

Tools can be removed with the ✕ that appears on hover.

### 6. Feedback, stop, undo

While a prompt runs, selected and referred objects pulse (for a prompt targeting no particular object, the panel border pulses instead) and the send button becomes a **Stop** button that cancels the request without changing anything. **Undo**/**Redo** (or Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl+Y) step through the history; an operation applied to several objects at once is a single undo step. **New** clears the content and the toolbar.

## ChatGPT replica

The header switch **ChatGPT replica** shows the conversational baseline used in the paper's study: streamed answers, Markdown rendering with code highlighting, SVGs rendered inline, and the same content samples loadable as the first message of the conversation. It uses the same API key and model.

## Study tasks

After loading a study sample, the tasks used in the paper's user study for that content are listed under the panel (e.g. *replace 5 words by synonyms*, *convert two for loops into while loops*, *add a stem and two leaves*).

## Notes

- `gpt-3.5-turbo` answers are non-deterministic; a localized rewrite occasionally comes back with extra words. Undo and retry.
- The app calls the OpenAI API from the browser. Keep the key private and clear it from Settings on shared machines.
- See `DEVELOPER.md` for the architecture and `DECISIONS.md` for design choices the paper leaves open.
