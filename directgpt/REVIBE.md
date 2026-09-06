# Revibe report — DirectGPT

A reimplementation of **DirectGPT: A Direct Manipulation Interface to Interact
with Large Language Models** (Masson, Malacria, Casiez, Vogel — CHI '24,
`10.1145/3613904.3642462`), built from the paper alone under the `revibe`
protocol.

The artifact lives in this directory. `README.md` launches it, `DEVELOPER.md`
explains its structure, `DECISIONS.md` records every question the paper left
open and the default taken, and `FIDELITY.md` is the specification ledger.

---

## 1. Scores

Revibeability is `(2·|full| + 1·|partial| + 0·|fail|) / (2·|all|)` over a
68-test rubric derived from the paper's system sections, scored by
`revibeability.py`.

| Round | Version | Full | Partial | Failure | Revibeability |
|---|---|--:|--:|--:|--:|
| Unaided | v0 → v1 | 55 | 12 | 1 | **0.897** |
| Aided 1 | v2 | 64 | 4 | 0 | **0.971** |
| **Aided 2** | **v3** | **67** | **1** | **0** | **0.993** |
| Post-design | v3d | 68 | 0 | 0 | **1.000** |
| Post-theme | v3e | — | — | — | *not graded* |

`v3e` is the orange/black theme pass (`../design/THEME.md`). No fresh-grader
round was run against it — see §6 for what was verified instead, and why the
number is left blank rather than carried forward.

**The headline revibeability of this artifact is 0.993** (aided round 2). That
is the number the protocol reports, and it describes the paper-faithful build
before any design work. The 1.000 that follows the design pass is reported for
completeness, not as the result — see §5 on why it should not be read as "the
last defect was fixed".

Rounds saturated as the paper's N=2 protocol expects. The unaided round left 13
tests short of Full; aided round 1 cleared **all 13**, and aided round 2 cleared
all four of the ones round 2's grader newly downgraded. The score still moved
between rounds only because each fresh grader probed harder than the last, not
because features were still missing — see §2. No further aided round was run.

## 2. Per-test grid

`F` = Full Success, `P` = Partial Success, `—` = Failure.

| Test | Unaided | Aided 1 | Aided 2 | Post-design |
|---|:--:|:--:|:--:|:--:|
| TEST-G01 | F | F | F | F |
| TEST-G02 | F | F | F | F |
| TEST-G03 | F | F | F | F |
| TEST-G04 | F | F | F | F |
| TEST-G05 | F | F | F | F |
| TEST-G06 | F | F | F | F |
| TEST-T01 | P | F | F | F |
| TEST-T02 | P | F | F | F |
| TEST-T03 | F | F | F | F |
| TEST-T04 | F | F | F | F |
| TEST-T05 | F | F | F | F |
| TEST-T06 | P | F | F | F |
| TEST-T07 | F | F | F | F |
| TEST-T08 | P | F | F | F |
| TEST-T09 | F | F | F | F |
| TEST-C01 | F | F | F | F |
| TEST-C02 | F | F | F | F |
| TEST-C03 | F | F | F | F |
| TEST-C04 | F | F | F | F |
| TEST-C05 | P | F | P | F |
| TEST-I01 | F | F | F | F |
| TEST-I02 | F | F | F | F |
| TEST-I03 | F | F | F | F |
| TEST-I04 | P | F | F | F |
| TEST-I05 | F | F | F | F |
| TEST-I06 | F | F | F | F |
| TEST-I07 | F | F | F | F |
| TEST-I08 | F | F | F | F |
| TEST-I09 | F | F | F | F |
| TEST-TB01 | F | F | F | F |
| TEST-TB02 | P | F | F | F |
| TEST-TB03 | F | F | F | F |
| TEST-TB04 | F | F | F | F |
| TEST-TB05 | F | F | F | F |
| TEST-TB06 | F | F | F | F |
| TEST-TB07 | F | F | F | F |
| TEST-TB08 | F | F | F | F |
| TEST-FB01 | F | F | F | F |
| TEST-FB02 | F | F | F | F |
| TEST-FB03 | F | F | F | F |
| TEST-FB04 | F | F | F | F |
| TEST-FB05 | F | F | F | F |
| TEST-U01 | F | F | F | F |
| TEST-U02 | F | F | F | F |
| TEST-U03 | F | F | F | F |
| TEST-U04 | F | F | F | F |
| TEST-U05 | F | P | F | F |
| TEST-U06 | F | F | F | F |
| TEST-S01 | — | F | F | F |
| TEST-S02 | P | F | F | F |
| TEST-S03 | F | F | F | F |
| TEST-INT01 | P | F | F | F |
| TEST-INT02 | F | F | F | F |
| TEST-INT03 | P | F | F | F |
| TEST-INT04 | F | F | F | F |
| TEST-INT05 | F | P | F | F |
| TEST-EC01 | F | F | F | F |
| TEST-EC02 | F | P | F | F |
| TEST-EC03 | F | F | F | F |
| TEST-EC04 | F | F | F | F |
| TEST-EC05 | P | F | F | F |
| TEST-EC06 | F | P | F | F |
| TEST-EC07 | P | F | F | F |
| TEST-EC08 | F | F | F | F |
| TEST-EC09 | F | F | F | F |
| TEST-EC10 | F | F | F | F |
| TEST-EC11 | F | F | F | F |
| TEST-EC12 | F | F | F | F |

### Tests that moved backwards between rounds

Five cells go the wrong way. None of them is a code regression; each is a
different grader exercising the same build harder than the last.

| Test | Move | What actually happened |
|---|---|---|
| TEST-U05 | F → P (r1→r2) | Round 1 checked the buttons in an empty session; round 2 also checked them after loading content, and found loading occupied an undo slot. Fixed in v3. |
| TEST-INT05 | F → P (r1→r2) | Round 2 dragged an object into the prompt *and then* undid the edit, exposing a stale chip thumbnail round 1 never triggered. Fixed in v3. |
| TEST-EC02 | F → P (r1→r2) | Round 1 used the mock's default reply; round 2 forced a pathological one wrapped in quotes. Fixed in v3. |
| TEST-EC06 | F → P (r1→r2) | Round 1 saw the toast; round 2 waited past its seven-second auto-dismiss and after the API library's retries, and found the failure effectively silent. Fixed in v3. |
| TEST-C05 | F → P (r2→r3) | The mock does not implement "add a comment", so the model returned nothing to insert. The rubric's own Partial criterion covers "interface sent a correct reference but model erred". Not a defect, and not fixed. |

This is the clearest single caveat on these numbers: **the third decimal place is
inside grader variance.** Four tests changed verdict between rounds on an
unchanged behaviour. Treat 0.99 and 0.97 as the same measurement.

## 3. Fidelity ledger

Reproduced from `FIDELITY.md`. Severity: exact / equivalent / degraded / absent.

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

### The row that matters

There is exactly one **degraded** row, and it is worth stating plainly:

> **ChatGPT-replica system prompt.** §4 says the study baseline used a system
> prompt "identical to the one used in ChatGPT". The paper never prints it, so
> it could not be reproduced; the builder wrote one.

This affects **the baseline arm of the paper's study, not DirectGPT itself.**
No row touching DirectGPT's actual contribution — the five direct-manipulation
principles, the three engineered prompts in Appendix A.1, the toolbar, the
localization and reference mechanisms, undo — is degraded or absent. Under the
`FIDELITY.md` blocking rule, the artifact is therefore valid as an A-B baseline
for DirectGPT, and **is not valid for any claim about how DirectGPT compares to
ChatGPT**, because this artifact's ChatGPT is not the paper's ChatGPT.

One row is time-limited rather than degraded: the paper's `gpt-3.5-turbo` is
still served and is what the build calls, but OpenAI lists a shutdown date of
**2026-10-23** for that alias. After that date this artifact stops being an
exact reproduction and the model override in Settings becomes the only path —
at which point a new fidelity row is owed.

## 4. Deviations from the paper

Beyond the ledger, these are departures a reader must know about.

**Object-to-object manipulation is absent — deliberately.** §3.2.2 states the
authors did not implement direct object-to-object actions, so neither did this
build. Its absence is fidelity, not a gap.

**Prompts the paper never printed.** Appendix A.1 prints three engineered
prompts (localizing text, referring to text objects, referring to SVG objects)
and those are reproduced verbatim and asserted on the wire. The paper prints no
prompt for localizing on SVG elements, for global prompts on existing content,
or for the first generation. Those three are the builder's, documented in
`DECISIONS.md` §2, §3, §4 and logged as `equivalent`.

**The study apparatus is reconstructed, not reproduced.** §4.2's task panel,
per-task content reset, three-minute limit and 5-point closeness rating are all
implemented, but the eight target images were redrawn by eye from Figure 5, and
ratings are kept in memory rather than logged to a server. This artifact can run
the paper's task structure; it is not the paper's data-collection instrument.

**The API key is entered in the browser.** The paper implies a server-side key.
Here the user pastes their own OpenAI key into Settings and it is stored in
`localStorage`, at the request of whoever commissioned this build. This changes
the threat model — the key is exposed to the page and travels from the browser
directly to `api.openai.com` — and it is why the app is a local dev-server
artifact rather than something to deploy.

## 5. Deviations from the revibe protocol

**Strict-fidelity construction prompt.** The skill's default, replacing the
paper's "roughly equivalent APIs" latitude. Substitutions were escalated and
logged rather than chosen by the builder. To reproduce the paper's own numbers,
restore the verbatim bullet.

**Agent grading, not a human tester.** The paper's tester is a human, and should
be for a publishable score. Every rubric here was graded by a fresh agent
driving a real headless Chromium, forbidden from reading `src/`, the paper, or
any other rubric copy. That isolation held, but agent graders are the main
source of the round-to-round variance in §2.

**A mocked OpenAI endpoint.** All four rounds were graded against a
deterministic route-level mock of `api.openai.com`, so that 68 tests were
repeatable and so the grader could assert the *exact wire text* against Appendix
A.1. The cost is that the mock is not a language model:

- It implements the three appendix prompt shapes, a synonym dictionary, and a
  set of SVG edits. It does **not** implement "add a comment", "summarize",
  "swap the bodies", or arbitrary instructions.
- Six verdicts in the post-design round therefore rest on inspecting the request
  payload plus confirming that only the referenced region changed, rather than
  on a correct model answer: **TEST-S03, TEST-C04, TEST-C05, TEST-INT03,
  TEST-EC02, TEST-EC07, TEST-EC11.** Each says so in its rubric note.
- Two paths could not be induced at all because the mock never produces them:
  verbose-prose trimming (TEST-EC02) and invalid-SVG recovery (TEST-EC07). Both
  were verified against forced replies in earlier rounds, but not in 3d.

**This is why the post-design 1.000 must not be read as a perfect artifact.**
It is 68 tests passing against a cooperative model. A round graded against the
live `gpt-3.5-turbo` would score lower and mean more.

**Two harness limits, not app limits.** Real clipboard keystrokes are inert in
headless Chromium for any content, so chip copy/paste (TEST-T08) was exercised
with synthetic `ClipboardEvent`s. Playwright's synthetic `modifiers: ["Control"]`
click is not seen by the app; a real `keyboard.down("Control")` works, and
multi-select is fine.

**One sanctioned prompt addition.** `PROMPTS.md` §5 permits adding *consider the
definitions of success, partial success, and failure in the rubric* when the
agent has mistaken a Partial for a Failure, and requires noting it. It was added
to the aided round 2 prompt.

**Design-pass tooling substituted.** `DESIGN-PASS.md` calls for `/design` and
the `frontend-design` skill; neither is installed in this environment. The pass
used `apple-design`, which `DESIGN-PASS.md` names for gesture- and motion-heavy
systems. No design canvas was drafted or reconciled with a user first, so step 3
of that procedure was skipped.

**A second design pass, ungraded.** The artifact carries a further theme pass
(v3e) that the protocol does not provide for: the shell was rebuilt from a Figma
source rather than restyled (`../design/THEME.md`). Two consequences worth
stating plainly:

- Unlike the first pass, it is **not CSS-only**, so "no line of markup changed"
  is no longer the guarantee that behaviour is frozen. What backs that claim now
  is a driven-browser run — 34 behavioural checks over the paper's mechanisms
  and 25 assertions against the rubric tests whose surfaces moved (TEST-G01,
  G03, G06, INT04, EC01, EC12, TB07, TB08, S03), all passing.
- **No fresh-grader round was run against v3e.** A legitimate round needs an
  agent that has not read `src/`, and the builder of this pass had. The headline
  number the protocol reports is therefore unchanged at **0.993**, and the
  1.000 belongs to v3d. Anyone wanting a score for v3e should run the round.

**A pre-existing defect found while verifying, and left alone.** After a word is
dragged out of the panel and dropped in the prompt, the next click inside the
panel is swallowed: `TextView`'s `draggingOut` flag is only cleared by a later
`mouseup` *inside* the view, and the drag ends over the prompt field. It
reproduces identically at the v3d commit, so it is not a regression, and fixing
it would be a behaviour change outside a design pass — it is recorded here
rather than patched. No rubric test exercises a click immediately after a drag,
which is why four graded rounds did not surface it.

## 6. The design passes

### Round 1 — the grey utility pass (v3d)

Run after aided round 2, per protocol. Before/after screenshots are in
`../design/before/` and `../design/after/`; the surface inventory and frozen list
are in `../design/INVENTORY.md` and `../design/BRIEF.md`.

**It was CSS-only.** Not one line of markup, no handler, no control label, and
no interaction sequence changed — `src/styles.css` is the entire diff. That is
the cheapest available guarantee that behaviour stayed frozen, and it is why no
behavioural test regressed.

What changed: a design-token system replacing ad-hoc colours, with a
dark-scheme pair and a `prefers-contrast: more` pair; a separation of "chrome"
(the shell, which follows the viewer's scheme) from "paper" (the object of
interest, which stays a light document ground in both schemes, because the
paper's figures show a light document and the sample SVGs are black line art);
a real type scale with size-specific tracking; a 4px spacing rhythm; focus-visible
rings throughout; press feedback on pointer-down; hover, disabled, loading and
error states; and responsive behaviour down to a laptop viewport.

Under `prefers-reduced-motion` the pulses are slowed and softened rather than
removed, because the pulse is how the interface says which object a prompt is
acting on (§3.2.4) — removing it would remove a feature the rubric grades.

**No figure-pinned placement was traded.** TEST-G01 is the only test that pins
layout to the paper's figures, and all four of its placements — toolbar left,
Undo top-left, Redo top-right, prompt below the content — are unchanged.

Two notes against the pass itself. The header was left opaque rather than
translucent: `backdrop-filter` would make it a containing block for the
`position: fixed` drag-ghost and tool-cursor and re-anchor them, which would
break drag feedback. And the first attempt gave the DirectGPT/ChatGPT-replica
switch a raised white pill for the active mode, which made the current mode
genuinely unreadable; it was reverted to a solid accent fill before grading.

### Round 2 — the orange/black theme pass (v3e)

Not part of the protocol. The first pass had deliberately frozen layout and
opened only colour, type and states, and the result read as a competent grey
utility. This pass adopts a real interface — a Figma frame
(`zBlbjH4oVh3xD6TifUjzHj`, `2:2`), a dark chat client with a 256px sidebar and a
centred 768px column — recoloured from teal to orange on black, and extends it
to cover the DirectGPT half of the app, which a chat design has no vocabulary
for. `../design/THEME.md` records the whole pass.

**It was not CSS-only.** `.header` was dismantled into a `Sidebar` and a
`TopBar`; the Toolbar became a pinned section of that sidebar rather than its
own column; `PromptField` took the design's composer shell; `ChatView` went
close to 1:1 with the design. Everything under `src/` outside the shell —
`TextView`, `SvgView`, `StudyPanel`, `Settings`, `EmptyState`, and every
non-component module — is byte-identical.

**No figure-pinned placement was traded.** TEST-G01's four placements survive,
and each was re-measured in a driven browser after the rebuild: Undo top-left
and Redo top-right above the content, the prompt below it, and the Toolbar to
the left — hosted inside the design's own left sidebar, and pinned above the
sidebar footer so the region stays visible however long the sample and activity
lists grow. Placing it at the end of the scrolling column, as the first draft
did, pushed it below the fold; that would have been the one placement this pass
cost, and it was fixed rather than paid for.

**Contrast is a departure from the source, on purpose.** The Figma greys are
well below AA (`#3a3a3a` on `#111` is ~1.6:1). The design's hues are kept and
only the luminance of secondary ink is lifted, to `--ink-2 #a8a29e` (7.49:1) and
`--ink-3 #8b837d` (5.07:1). Every token pair carrying text was checked
numerically on both grounds. Hairlines stay at the design's values and below
3:1; they separate regions rather than bound components, and the
`prefers-contrast: more` block lifts them.

**Motion stays subordinate to meaning.** The wordmark and the assistant avatar
glitch once on entry over 600ms and resolve, re-firing on hover and focus, and
never looping — because the pulse that says which object a prompt is acting on
(§3.2.4) is a graded signal and ambient motion would compete with it. Under
`prefers-reduced-motion` the glitch becomes a static 1px chromatic split and the
pulse survives, slowed, exactly as in round 1.

## 7. What this baseline must not be used to claim

- **Not "DirectGPT beats ChatGPT".** The ChatGPT replica's system prompt is
  invented (§3). Any A-B result against this artifact's baseline arm measures
  the builder's prompt, not ChatGPT.
- **Not a replication of the paper's user study.** The apparatus is
  reconstructed, the target images are redrawn by eye, and no data is logged.
  Task *structure* is reproducible; the paper's measurements are not.
- **Not "the implementation is defect-free".** 1.000 was scored against a
  deterministic mock that answers cooperatively. Seven verdicts rest on request
  inspection rather than model output, and two error paths could not be induced
  at all (§5). A defect no round caught is recorded in §5: after a drag out of
  the content panel, the next click inside it is swallowed.
- **Not a score for what the app looks like now.** Every number here was graded
  against v3 or v3d. The artifact in this tree is v3e, the theme pass (§6), and
  it has not been through a fresh-grader round.
- **Not a claim about model quality.** Every judgement here is about interface
  behaviour — what was sent, what was replaced, what was highlighted. The rubric
  deliberately never grades the model's creativity.
- **Not a deployable application.** The user's API key lives in `localStorage`
  and is used directly from the browser (§4).
- **Not valid past 2026-10-23** as an exact reproduction, when `gpt-3.5-turbo`
  is scheduled for shutdown (§3).

## 8. Sources consulted

`directgpt/paper/` only — eight markdown chunks and seven figures extracted from
the PDF. The original DirectGPT repository, its demo video, and any other
write-up were deliberately not consulted, by any of the build, rubric, or
grading agents. One external fact was checked outside the paper: that
`gpt-3.5-turbo` is still served and its shutdown date, which is recorded in
`FIDELITY.md`.
