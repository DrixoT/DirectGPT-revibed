# Design-pass inventory (step 8)

Built before the pass, from the running app and the rubric. Two columns matter:
what may change (surface) and what may not (the tests below each surface).

## Surfaces

### S1a — Sidebar (`Sidebar.tsx`, 256px)
Split out of the old `.header` by the theme pass (see THEME.md §5).
Elements: wordmark; "New"; "Load study sample" as a grouped list (Text / Code /
Image) replacing the dropdown; "Study session" as a list of the four activities
plus "Leave the current session"; the Toolbar rail (S2), pinned above the
footer; API-key badge + "Settings".
States: key set / key missing; a sample active; a session running; DirectGPT
mode (Toolbar shown) / replica mode (hidden); lists scrolled.
Tests touching it: TEST-G01, TEST-G03, TEST-S03, TEST-TB07.

### S1b — Top bar (`TopBar.tsx`)
Elements: model pill (opens Settings); DirectGPT / ChatGPT-replica segmented
switch; connection status dot — `online` when a key is set, `no key` in
`--danger` when not, replacing the old "No API key set" span.
States: key set / key missing; DirectGPT mode / replica mode.
Tests touching it: TEST-G01, TEST-S03.

### S2 — Toolbar rail (`Toolbar.tsx`)
Now a pinned section of S1a rather than its own column, which keeps it to the
left of the content area as figures 1d/2c/4 place it.
Elements: "Toolbar" heading; empty-state copy; one button per executed prompt,
with `?` slots rendered inline; active-tool highlight.
States: empty; 1-3 tools; many tools (overflow/scroll); a tool armed as a mode;
a multi-noun tool part-way through binding its slots.
Tests: TEST-TB01..TB08, TEST-U06, TEST-EC08, TEST-EC09, TEST-INT03.

### S3 — History bar (`.history-bar`)
Elements: Undo (left), Redo (right).
States: both disabled; undo only; both enabled.
Tests: TEST-U01, TEST-U02, TEST-U05, TEST-INT05.

### S4 — Content panel — text (`TextView.tsx`)
Elements: the document at a fixed position; word-level hit targets; selection
highlight; change highlight after execution; pulse during execution.
States: idle; selection of 1..n words; executing (pulse); post-execution
highlight; long content with scroll.
Tests: TEST-G04, TEST-T01..T09, TEST-FB01, TEST-FB02, TEST-FB04, TEST-EC01..EC04, TEST-EC10, TEST-EC12, TEST-INT01, TEST-INT04.

### S5 — Content panel — code (`prism.ts` + TextView)
Elements: syntax-highlighted block; token-level selection; same highlight/pulse
vocabulary as S4.
States: as S4.
Tests: TEST-C01..C05, TEST-INT03.

### S6 — Content panel — SVG (`SvgView.tsx`)
Elements: rendered SVG; dashed selection box per shape; pulse; empty-canvas
click target.
States: idle; shape(s) selected; executing; invalid-SVG error.
Tests: TEST-I01..I09, TEST-FB05, TEST-EC03, TEST-EC07, TEST-EC11, TEST-INT02.

### S7 — Prompt field (`PromptField.tsx`)
Elements: the design's composer shell — a contenteditable row with placeholder
"Type your prompt here." above a control row; inline object-word chips (text,
code token, SVG thumbnail, coordinate); the localization badge and its
clear-selection control, moved into that row; send button; stop button while
generating.
States: empty/placeholder; typing; containing chips; generating (stop shown);
disabled (no key).
Tests: TEST-G06, TEST-T06, TEST-T07, TEST-T08, TEST-I04, TEST-I05, TEST-I06,
TEST-FB03, TEST-EC01, TEST-EC05, TEST-EC09.

### S8 — Study panel (`StudyPanel.tsx`, `.tasks-hint`)
Elements: "Study tasks for this sample" strip; active-task banner; timer;
closeness rating at task end.
States: no session; task running; time expired; rating.
Tests: TEST-S01, TEST-S02.

### S9 — ChatGPT replica (`ChatView.tsx`)
Elements: message list; streaming word-by-word output; Markdown and fenced-code
rendering; inline SVG rendering; composer.
States: empty; streaming; complete; error.
Tests: TEST-S03, TEST-G05.

### S10 — Settings (`Settings.tsx`)
Elements: API key input; model field; save/close.
States: unset; set; invalid key rejected.
Tests: TEST-G01 (indirectly), TEST-EC06.

### S11 — Transient layers
`.tool-cursor` (armed tool follows pointer), `.drag-ghost` (chips under the
cursor while dragging), `.toast` (error), `EmptyState.tsx`.
Tests: TEST-EC06, TEST-EC09, TEST-G02.

## Frozen (quoted from DESIGN-PASS.md, applied here)

- Control labels exactly as they are: `DirectGPT`, `ChatGPT replica`,
  `Load study sample`, `Study session`, `New`, `Settings`, `Undo`, `Redo`,
  `Toolbar`, placeholder `Type your prompt here.` (The theme pass renders the
  section headings uppercase in CSS; the DOM text is unchanged.)
- Which surface each element lives on, and the document/shape topology.
- Every interaction sequence: click-to-select, ctrl+click to extend, drag into
  the prompt, tool-as-mode click order, undo granularity.
- Empty, error and edge behaviour wherever a test asserts it.

## Negotiable (figure-pinned placement)

Only TEST-G01 pins layout to the paper's figures (toolbar left, undo/redo above
the content, prompt below). Default: keep all four. Any move is paid for in
REVIBE.md with the test ID it cost.

## Open

Round 1 (`BRIEF.md`): type scale, spacing rhythm, colour tokens + dark pair, all interaction states
(hover / focus-visible / active / disabled / loading / empty / error), motion
under `prefers-reduced-motion`, keyboard and screen-reader access, responsive
down to a laptop viewport, copy.

## Round 2 — the theme pass (`THEME.md`)

Opened beyond round 1: the shell's composition. The sidebar, top bar, composer
shell and chat surface were rebuilt from the Figma source, so `App.tsx`,
`Sidebar.tsx`, `TopBar.tsx`, `Toolbar.tsx`, `PromptField.tsx` and `ChatView.tsx`
changed as well as the stylesheet.

Still frozen, and verified in a driven browser after the rebuild: every control
label, every interaction sequence, all four of TEST-G01's figure-pinned
placements, and every rubric class hook. `TextView.tsx`, `SvgView.tsx`,
`StudyPanel.tsx`, `Settings.tsx`, `EmptyState.tsx` and everything else under
`src/` outside the shell are byte-identical.
