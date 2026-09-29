# Responsive spec

Four width bands, plus two capability queries. The exact rules are in
`prototype/extracted/assets/css/02-page.css`, in this order. This document says
what each band does and why, so you can tell a deliberate rule from an accident.

| Query | Rules | Purpose |
|---|---|---|
| `min-width: 700px` | 1 | Hero headline holds one line per clause |
| `min-width: 981px` | 1 | Container narrows 200px to clear the rail |
| `max-width: 1140px` | 2 | Report cards stop shrinking |
| `max-width: 1060px` | 7 | Tool boxes tighten |
| `max-width: 980px` | 65 + 6 | The main responsive band |
| `max-width: 620px` | 69 + 1 | Phone |
| `prefers-reduced-motion` | 3 | Motion off |
| `hover: none` | 8 | Touch |

The guiding decision throughout: **three-across layouts hold as long as the type
can be made to fit.** Boxes tighten rather than grids breaking. Everything falls
to its phone arrangement at 620, not before.

---

## ≥ 981 — container reserves the rail

```css
:root{ --container: min(1140px, 100vw - 200px); }
```

The 200px keeps the fixed navigation rail off the content. Below 981 the rail
shrinks and the container reverts to `1140px` with a 20px gutter.

Note the consequence: between 981 and 1140 the container is narrower than the
viewport minus gutters, so the page's content width **drops** by 200px as you
cross 1141 downward. That is intentional.

## ≥ 700 — hero headline

`.h-1--nowrap { white-space: nowrap; }` — below 700 the headline may wrap.

## ≤ 1140 — report cards stop shrinking

```css
#reports .cover{ aspect-ratio: auto; }
#reports .cover__plate{ flex: none; height: 220px; }
```

A 3:4 card takes its height from its width, so it shrank steadily as the window
narrowed. Below the widest container the plate holds 220px and the card height
becomes constant. Verified constant from 1100 down to 621.

## ≤ 1060 — tool boxes tighten

`.tools` gap 22px; `.tbox` padding 28/22/26/24; numeral 48px; title 21px; body
14/21; button 11px with 52px reserved for its ring; lock label 10px.

This replaced an earlier rule that dropped the tools to two columns here. Three
across is the requirement; the box gives way instead.

## ≤ 980 — the main band

65 rules. Grouped by what they touch.

**Section rhythm.** `.section` padding 92 → 66. `.g-12` gap 36/20.
`.pl-col` padding-left 0. `.about-row` gap 34/30. `.exchange__cta` margin-top 44.

**Generic grids.** `.g-3, .g-4` → two columns. Two exceptions follow, because
both need to stay at their full count.

**Figures** — stay four across:
```css
.figures{ grid-template-columns: repeat(4, minmax(0,1fr)); gap: 30px 18px; }
.figure__n{ font-size: clamp(24px, 5vw, 42px); }
.figure__l{ font-size: 11px; letter-spacing: 1.2px; }
```
At 621 the columns are 132px and nothing clips.

**Report cards** — stay three across:
```css
#reports .grid.g-3{ grid-template-columns: repeat(3, minmax(0,1fr)); gap: 18px; }
#reports .cover{ padding: 14px 14px 0; }
.cover__n{ font-size: 17px; }  .cover__t{ font-size: 17px; min-height: 2.5em; }
.cover__d{ font-size: 10px; letter-spacing: 1.6px; }
.cover__cap{ padding: 12px 0 14px; }
```
The `min-height: 2.5em` on the title is what keeps cards in a row the same
height. A three-line title defeats it.

**Tools** — stay three across, tightened again: gap 16; padding 22/16/20/18;
locked boxes `min-height: 180px`; numeral 38; title 18; body 13/19; button 10px
with 48px reserved; lock label 9px.

**Pillars** — stay three across: `.pgrid` gap 18; plate margin-bottom 16; body
14/20; foot padding-top 16; button 10px, 64px reserved, 38px tall.

**The index keeps chart and readings side by side.** This is the most involved
part of the band. The generic `span-*` collapse is overridden for this section
only, and the chart gives up width instead:

```css
.span-4,.span-5,.span-6,.span-7,.span-8{ grid-column: span 12; }
#index .span-7{ grid-column: span 7; }
#index .span-5{ grid-column: span 5; }
#index .pl-col{ padding-left: 18px; }
.chart{ height: 330px; margin-left: 30px; }
.chart__y{ left: -30px; width: 24px; font-size: 10px; }
.chart__x{ margin-left: 30px; font-size: 10px; letter-spacing: .6px; }
.chart__legend{ margin-left: 30px; font-size: 12px; gap: 8px 16px; }
.stat-head,.stat{ grid-template-columns: 1fr 52px 60px; column-gap: 8px; }
.stat--main .stat__num{ font-size: 34px; }
.stat__num--sub{ font-size: 24px; }
```

The y-axis margin drops 38 → 30 and the two change columns 74/84 → 52/60. That is
what buys the chart room to keep shrinking. The readings' notes open leftwards
here, because the mark sits at the right of its row.

Keep the numeral sizes apart. 34 against 24 is the same proportion as 44 against
32 at full width, and that difference is the hierarchy.

**Upcoming rows** — the date stays on the title's line rather than dropping below
it, and the description sits under the title in its own column:
```css
.row-item{ grid-template-columns: 40px minmax(0,1fr) auto; gap: 6px 24px; padding: 20px 0; }
.row-item > *:nth-child(1){ grid-column:1; grid-row:1; }   /* ordinal */
.row-item > *:nth-child(2){ grid-column:2; grid-row:1; }   /* title */
.row-item > *:nth-child(3){ grid-column:2; grid-row:2; }   /* description */
.row-item > *:nth-child(4){ grid-column:3; grid-row:1; }   /* due date */
.row-item__d{ max-width: 56ch; }
```

**Journal rows** collapse similarly: date, title and kind stack in column 1 with
the arrow spanning all three rows in column 2.

**Index actions** (`.spine-actions`) margin-top 22.

**Header** — the main nav hides, the logo moves left, a "Menu" label appears.
Section nav type 10px, and long labels swap for short.

**Rail** shrinks: buttons 36px, icons 17px, smaller gap and separator.

## ≤ 620 — phone

69 rules.

**Two across** for the values, figures, report cards and newshub tiles:
`.g-2, .g-3, .g-4` and `.figures` → `repeat(2, minmax(0,1fr))`, gap 26/16.

**Report cards** become full grid items, since the blurbs are hidden:
```css
#reports .grid.g-3{ grid-auto-rows: 1fr; }
#reports .grid.g-3 > div{ display: flex; flex-direction: column; }
#reports .cover{ aspect-ratio: auto; flex: 1; padding: 10px 10px 0; }
#reports .cover__plate{ height: auto; aspect-ratio: 3/4; }
.cover__t{ font-size: 16px; min-height: 2.5em; }
```
Every row is cut to the tallest and each card fills its row, so all cards in a
year are identical. The plate returns to 3:4 — a taller picture, which was an
explicit request.

**Upcoming rows** lose their description entirely; ordinal, title and date sit on
one line.

**Pillars** — a compact square plate with the text beside it, so all three fit
one screen:
```css
.pgrid{ grid-template-columns: 1fr; gap: 14px; }
.pcard{ display: grid; grid-template-columns: 78px minmax(0,1fr); column-gap: 14px; align-items: start; }
.pcard__media{ grid-column:1; grid-row:1 / span 3; align-self: stretch; aspect-ratio: auto; }
.pcard__cap{ display: none; }        /* the in-plate label */
.pcard__name{ display: block; }      /* the label beside it */
.pcard .pico{ width: 40%; }
```
`align-self: stretch` is required — the card aligns its items to the start, so
spanning the rows is not enough on its own. The plate ends level with the foot of
the link. Result at 375: three cards, 379px total.

**Tools** — the flagship spans the pair beneath it:
```css
.tools{ grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; }
.tools > *:nth-child(1){ grid-column: 1 / -1; grid-row: 1; }
.tools > *:nth-child(2){ grid-column: 1; grid-row: 2; }
.tools > *:nth-child(3){ grid-column: 2; grid-row: 2; }
.tbox--locked{ aspect-ratio: 1; min-height: 0; }
.tbox--live{ aspect-ratio: auto; }
```
Both row and column must be named. Auto-placement would otherwise put the first
locked box beside the flagship.

**Index controls share one row.** The region toggle and the picker button are cut
down until they fit: 9.5px type, 0 tracking, 9–11px padding, `flex-wrap: nowrap`.
At 375 they use 341 of 375px.

**Readings drop below the chart** — only here. `#index .span-7, #index .span-5`
return to `span 12`, the height pinning is switched off, and the chart drops to
210px so the values sit in the same screenful.

**Picker becomes a bottom sheet**, width measured in `vw` rather than left
against right — the viewport must set it, not whatever containing block the fixed
position resolves to.

**Hero button** goes full width. At 379px in a 350px column it was widening the
whole document.

**Inputs go to 16px.** iOS Safari zooms the page in on any focused field under
16px and will not zoom back out. All three contexts need naming, because two of
them set their own size at a higher specificity:
```css
.form-row input.ctrl,
.xch .form-row input.ctrl,
.dlg .form-row input.ctrl{ font-size: 16px; }
```

**Section nav** — seven labels on one line down to 375:
```css
.sec-nav a{ font-size: clamp(8.4px, 2.4vw, 9px); padding: 9px clamp(3px,1vw,6px); letter-spacing: 0; }
```
Measured: 341/375 at 375, 344/390 at 390, 328/360 at 360. `flex-wrap: wrap`
stays as the backstop below that.

**Mobile line breaks.** `.br-m` is `display:none` by default and `inline` here.
Used on "The / podcast" and "News & / Lifestyle" so the two tiles align, and it
is applied to both — the second wraps naturally around 478px, so breaking only
the first would misalign them between 478 and 620.

**Index actions stack** and take full width, so both rings land on one vertical.

## Capability queries

**`prefers-reduced-motion: reduce`** — reveals off, everything visible; hero
renders one static frame.

**`hover: none`** — the pillar plates and report covers hold their resting state,
because `:hover` latches after a tap on iOS. The card is a link, so tapping
works. Arrow rings still animate.

## Document overflow

`html` and `body` are `overflow-x: clip`. Do not remove it: an absolutely
positioned note that hangs past the edge otherwise makes the whole page draggable
sideways, which is how it behaved before.
