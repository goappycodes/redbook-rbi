# Components

The reusable pieces, with the details that are easy to lose.

---

## `rb-btn` — arrow link

A label with a circular ring and an arrow to its right. The ring draws itself in
on hover using `stroke-dasharray` / `stroke-dashoffset` over 0.75s.

- Ring is 44px; `stroke-dasharray: 131.95` is its circumference. **In viewBox
  units** — the dash is not in pixels. Changing the viewBox without recomputing
  this draws a stray arc.
- The label reserves space for the ring with `padding-right`, which varies by
  context: 70px default, 78px in a pillar card, 52–56px in a tool box, 60–64px at
  narrow widths. Too little and the ring sits on the text.
- Variants: `--boxed` (outlined button, used in the hero), `--light` (on dark),
  `--red`.
- The ring answers a hover **anywhere on its parent card**, not just on the link.

Where several sit in a row or column, the button is `width: 100%` so the rings
align on one vertical. Applies to the pillar links and, on phones, the index
actions.

## `cover` — report card

Parchment card: picture plate, then label, title, published date. Hovering lifts
it 5px, deepens the ground, scales the image 1.05 over 1.4s, and fades in a
"Click to read" scrim.

- Above 1140: 3:4 card, the plate taking what the caption leaves.
- Below 1140: plate fixed at 220px, so the card stops shrinking.
- Below 620: plate is 3:4 and the caption sits under it, so the card runs long.
- `.cover__t` carries `min-height: 2.5em` as a floor. On top of that,
  `levelCardTitles()` raises every title in the year on show to the tallest of
  them, so a longer title lifts the whole row rather than making one card taller.
  It runs on load, on year change, once webfonts have swapped in, and on resize.
  Reserving three lines up front was tried and rejected: it left dead space under
  every current title and cost the picture 28px.
- `.cover__n` is either an ordinal or, with `--label`, the fixed "RBi Report"
  line set as a small tracked label.
- `--locked`: renders as a `div`, carries a padlock badge top right, and has its
  lift, image scale and hint suppressed.

## `pcard` — Intelligence Hub card

A plate with the flow field behind it, an icon and a label, then body copy and an
arrow link. The whole card is the link.

- Plate is `var(--red)` with a 34% plum scrim over the canvas. Hovering takes the
  plate to `--parch-2`, lifts the scrim, hides the flow, and turns the icon and
  label red.
- The label exists twice: `.pcard__cap` inside the plate, `.pcard__name` beside
  it. One shows per layout.
- `.pgrid` uses `minmax(0, 1fr)`, not `1fr` — a plain `1fr` track cannot shrink
  below its content, and the longest link label was making its column wider than
  the other two.
- The link label is allowed to wrap (`white-space: normal`), which the base
  button style would not permit.

## `tbox` — tool box

- `--live`: red ground, ordinal, two-line title, body, arrow link.
- `--locked`: grey ground, ordinal, padlock and "In development". No body.
- Hover lifts 7px with a shadow and shifts the ground.
- `overflow: hidden`, so anything that overruns is clipped rather than escaping —
  which is why the button's reserved space matters here.

## `row-item` — upcoming report

Four cells: ordinal, title, description, due date. Four columns at full width;
three at ≤980 with the description under the title and the date holding the
title's line; three at ≤620 with the description gone.

## `stat` — index reading

Value, "From '25", "From base", label with an (i) note. `--main` is the locked
series: red, and a larger numeral. Sub-rows carry `.stat__num--sub`.

Size the sub-rows by **class**, not by an inline style. They were inline
originally, which meant no breakpoint could reach them and the hierarchy
collapsed at narrow widths.

## `form-row` — field and button as one control

The input has `border-right: 0` and the button `border-left: 0`, so together they
read as a single outlined box. Two consequences:

- The focus ring must be applied by the **row** (`:focus-within`), or only three
  of the four sides light up.
- Same for the invalid state.
- The modal restores the input's right border at a higher specificity, so both
  states have to be restated there.

Inputs go to 16px below 620. See `04-responsive-spec.md`.

## `info` — the (i) note

A 15px circle with a note popover. Dimmed with a **translucent colour**, not
`opacity` — opacity would apply to the note inside it as well, and would trap the
note's `z-index` inside the mark's own stacking context.

Position is set by script at every width. See `03-interaction-spec.md`.

## `seg` — region toggle

Two halves sharing a border. Active half is `--parch-4`. Cut down below 620 so it
shares a row with the picker button.

## `cx` — customise panel

Header with the note and a close control, a scrolling list, a pinned "Clear all"
foot. A flex column so the head and foot hold while only the list moves.

`display: flex` on the panel outranks the browser's own rule for the `hidden`
attribute, so `[hidden]` has to be restated or the panel never closes.

## `dlg` — modal

Full-screen scrim, centred panel, close control top right, fields, submit. Locks
page scroll while open. Escape closes it. Clicking the scrim closes it.

`z-index: 120` — above the section nav, deliberately, because it is a modal with
its own backdrop.

## Layer order

| Layer | z-index |
|---|---|
| Scroll progress bar | 120 |
| Request modal | 120 |
| Site header | 100 |
| Section navigation | 99 |
| Customise panel | 90 |
| Navigation rail | 60 |
| Note popovers | 60 |
| Chart tooltip | 6 |

Nothing but the modal may paint over the two top bars. The customise panel sits
below them **and** is kept clear of whichever is on screen.
