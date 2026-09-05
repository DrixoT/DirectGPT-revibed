# Design-pass brief

Observations from the pre-pass screenshots (`design/before/`), which are the
"before" half of the pair REVIBE.md carries. Behaviour stays frozen; see
INVENTORY.md for what that means per surface.

## What is wrong now

1. **No visual system.** Everything is the browser default: system font at one
   size, one grey, native `<select>`, buttons of identical weight. Nothing tells
   the eye what matters.
2. **The empty state wastes the canvas.** Copy, textarea and sample chips sit
   crammed at the top of a ~600px bordered box; the lower two-thirds is dead.
   The seven samples wrap over three ragged rows with no grouping by type.
3. **The header is a flat row of six equal controls.** The DirectGPT/ChatGPT
   switch is the only coloured element, so it reads as the primary action when
   it is really a mode.
4. **The toolbar rail looks vestigial** when empty — a thin grey column with two
   lines of small grey text — rather than a place tools will accumulate.
5. **The send button is pale blue on near-white**, below AA contrast, and the
   `Use this content` button has the same problem.
6. **No dark mode, and no `prefers-reduced-motion` handling** for the pulse and
   highlight animations, which are central to the paper's feedback principle.
7. **States are thin.** Hover and focus-visible are largely absent; disabled is
   conveyed by opacity alone; there is no considered loading or error styling
   beyond what round 3 just added.

## What the pass will do

Type scale, spacing rhythm, colour tokens with a dark pair at AA, a full set of
interaction states, motion that honours `prefers-reduced-motion`, keyboard and
screen-reader access, responsive down to a laptop viewport, and copy that reads
like a person wrote it.

## What it will not do

Move, rename, or re-wire any control; change what appears on which surface;
change any interaction sequence; or alter empty/error/edge behaviour a test
asserts. The four figure-pinned placements from TEST-G01 — toolbar left,
undo top-left, redo top-right, prompt below the content — are kept as they are.

## Tooling deviation

DESIGN-PASS.md calls for `/design` and the `frontend-design` skill; neither is
installed in this environment. `apple-design` is, and DESIGN-PASS.md names it
for gesture- and motion-heavy systems, which DirectGPT is. Recorded in
REVIBE.md as a departure from the protocol.
