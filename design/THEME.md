# Theme pass — orange on black, from Figma

The second design pass on the DirectGPT revibe artifact. It replaces the grey
utility look of the first pass (`BRIEF.md`) with a designed interface adopted
wholesale from a Figma source, recoloured, and extended to cover the half of the
application a chat design has no vocabulary for.

**Source.** Figma file `zBlbjH4oVh3xD6TifUjzHj`, frame `2:2` — a dark chat
client with a 256px sidebar, a Jersey 10 wordmark, a centred 768px column and a
teal/cyan identity. Read with `get_design_context`. The file defines no Figma
variables, so every value below is a literal taken from the frame.

Unlike the first pass, this one is **not CSS-only**: the shell was rebuilt
around the design's sidebar, so `App.tsx` and four components changed too. What
did not change is any interaction: no handler, no control label, no sequence,
no empty/error/edge behaviour. See §5.

## 1. Recolouring

| | Design (teal) | Built (orange) |
|---|---|---|
| Page / sidebar ground | `#0e0e0e` / `#111` | unchanged |
| Lines | `#1a1a1a` `#1e1e1e` `#242424` `#272727` `#2a2a2a` | unchanged |
| Accent | `#00e5a0` | `#ff7a18` |
| D avatar | `linear-gradient(135deg,#00e5a0,#00b4d8)` | `linear-gradient(135deg,#ffb300,#ff3d00)` + glitch |
| User bubble | `#1a2e28`, border `rgba(0,229,160,.19)`, ink `#e0f8f0` | `#2a1a0e`, `rgba(255,122,24,.45)`, `#ffe9d6` |
| Code ink | `#a0f0d0` on `#0d0d0d` / inline `#1a1a1a` | `#ffd0a0`, grounds unchanged |
| Streaming caret `▍` | `#00e5a0` | `#ff7a18` |
| Composer | `#171717`, border `#272727`, r16, `0 0 0 1px #1a1a1a` | unchanged |

Geometry carried over verbatim: sidebar 256px; wordmark Jersey 10 40px / 24px
line-height / -0.16px tracking; radii 8 (buttons, sidebar rows, code blocks),
12 (send button), 16 (composer, bubbles) with the bubble's top-right corner cut
to 4; chat column `max-width: 768px`, `padding: 32px 16px`; 32px between turns,
16px avatar gutter, 32px avatar; body 14px on a 22.75px line; mono 12px on
19.2px; status dot 6px with a `0 0 6px` glow.

Two deliberate departures from the design's literals:

- **Radii.** The existing `--r-*` scale was retuned rather than kept, so the
  design's 8/12/16 land on `--r-sm` / `--r-lg` / `--r-xl`. `--r-md: 10px` and
  `--r-xs: 4px` survive from the first pass.
- **Secondary ink.** See §4.

## 2. Type

Self-hosted through `@fontsource` (5.3.0), imported in `main.tsx`. The app only
reaches the network for the OpenAI call and this keeps it that way.

- `--font-display: 'Jersey 10'` — wordmark, sidebar section labels, the avatar
  letter, the study timer, modal headings.
- `--font: 'Space Grotesk'` — everything else.
- `--mono: 'JetBrains Mono'` — code, inline code, the status line, the timer's
  progress line.

The design's fourth face, Outfit Bold (the `D` and `AJ` letters), is dropped;
Jersey 10 does that job and pays for itself.

**Syntax colours.** Prism ships a light blue/green theme that fought the palette
on both grounds. Its tokens are retinted into the warm family — twice, once for
the light document panel and once for the replica's dark code block — keeping
enough hue separation that highlighting still does its job, which §3.3 of the
paper names and the rubric checks. Every token colour holds AA on its ground.

## 3. The document panel

The one surface the Figma file has no answer for, because chat has no document.
`samples.ts` ships `fill="black"` line art and `study.ts` has eight hand-built
target SVGs in the same idiom; a dark panel erases them. So the theme stops at
the panel's edge and the panel is designed rather than defaulted:

- A warm off-white sheet (`--paper #faf8f5`, not `#fff`) on the `#0e0e0e`
  ground, 12px radius, hairline edge, and a lift
  (`0 1px 0 rgba(255,255,255,.04) inset, 0 18px 40px rgba(0,0,0,.5)`) so it
  reads as a sheet on a desk rather than a hole in the interface.
- 40px margins for text and code, so a passage sits in a measure.
- A 24px dot grid at low opacity behind the SVG canvas, so shapes sit on a
  surface instead of floating in white.
- Selection, pulse, change-highlight and the SVG overlay boxes take the
  paper-scoped orange. The stylesheet already routed all of these through paper
  tokens, so this was a token change, not a rewrite.

## 4. Contrast

The design's greys are below AA: `#3a3a3a` on `#111` is ~1.6:1, the `#2a2a2a`
disclaimer ~1.2:1, the `#4a4a4a` chip labels ~2.2:1. The stylesheet holds AA as
a rule and ships a `prefers-contrast: more` block, so the design's hues are kept
and only the luminance of secondary ink is lifted:

| Token | Design | Built | On `#111` |
|---|---|---|--:|
| `--ink-2` | `#5a5a5a` / `#6b7280` | `#a8a29e` | 7.49 |
| `--ink-3` | `#3a3a3a` / `#4a4a4a` | `#8b837d` | 5.07 |

Every token pair that carries text was checked numerically on both grounds; all
clear 4.5:1. `--paper-accent` moved from the planned `#c2560a` (4.28 on the warm
sheet) to `#b04e08` (5.03) for the same reason.

Hairlines (`--line`, `--line-strong`, `--paper-line`) stay at the design's
values and therefore below 3:1. They separate regions rather than bound
components or convey state, so 1.4.11 does not apply to them; the
`prefers-contrast: more` block lifts them to `#666` / `#7a7a7a` / `#948a7c` and
puts a visible border on every sidebar row.

## 5. Composition

`.header` is gone. Everything it held moved into two new components.

| Figma element | Became |
|---|---|
| `DIRECT GPT` wordmark | the same, with the glitch treatment |
| `+ New chat` | the `New` action, label unchanged, with the plus icon |
| `RECENT` + chat list | `Load study sample` — the seven samples grouped Text / Code / Image, replacing the dropdown; the active sample takes the `#1e1e1e` row |
| — | `Study session` — the four activities, plus "Leave the current session" while one runs |
| — | `Toolbar` — the tool rail, which keeps it to the left of the content |
| `AJ` + `alex@acme.io` + gear | API-key badge + `Settings` |
| model pill, status dot | the top bar, plus the DirectGPT / ChatGPT-replica switch |

The Toolbar is **pinned above the sidebar footer** rather than scrolled with the
lists above it. Placed at the end of the scrolling column it fell below the fold
once the samples and activities were listed, and TEST-G01 wants the region
reserved and visible. It scrolls internally, capped at 42% of the sidebar.

`PromptField` adopts the composer shell — `#171717`, `#272727` border, 16px
radius, an editor row above a control row, a 32px send button at 12px radius.
The design's `Code` / `Reason` chips have no counterpart here, so that row
carries the localization badge and its clear-selection control instead.

`ChatView` goes closest to 1:1: right-aligned user bubbles with the cut
top-right corner, assistant turns with the 32px gradient `D` avatar and no
bubble, the design's code block and inline-code chips, the orange `▍` caret. The
role label survives as visually-hidden text so the transcript keeps its
attribution for a screen reader.

Six icons (`plus`, `settings`, `chevron`, `code`, `brain`, `send`) came from the
design as asset URLs that expire in about seven days. The bytes were downloaded
and inlined in `src/icons.tsx` with their path geometry, viewBox and stroke
widths verbatim; only the hard-coded hexes became `currentColor`.

## 6. Glitch

`.wordmark` and `.avatar-d` carry `data-text`, with `::before` / `::after`
copies offset ±2px in `--glitch-a` and `--glitch-b` under `mix-blend-mode:
screen`, driven by stepped `clip-path: inset()` keyframes. It runs once on mount
over 600ms and resolves, and re-fires on `:hover` and `:focus-visible`.

The entry pass is carried by a class `useGlitchIn` drops when it is over
(`src/glitch.ts`), so the hover rule can restart it later without the mark
firing again every time the pointer leaves.

Bounded on purpose. This interface already uses motion to *mean* something — the
pulse says which object a prompt is acting on (§3.2.4), and the rubric grades
it. Ambient glitch would compete with that signal.

Under `prefers-reduced-motion: reduce` the animation is dropped and a static 1px
chromatic split remains, so the mark still reads as designed. Under
`prefers-contrast: more` the offset copies are hidden entirely.

## 7. What this pass did not do

No control label, handler, or interaction sequence changed; no sample, prompt
template or wire format changed; `FIDELITY.md` is untouched. `TextView.tsx`,
`SvgView.tsx`, `StudyPanel.tsx`, `Settings.tsx`, `EmptyState.tsx` and every
module under `src/` outside the shell are byte-identical, and all rubric class
hooks resolve as before.

No figure-pinned placement was traded: TEST-G01's four — Toolbar left, Undo
top-left, Redo top-right, prompt below the content — were each re-verified in a
driven browser after the rebuild.
