# Interaction spec

Behaviour you cannot see by reading the markup. Written as requirements — the
prototype's implementation is one way to meet them, not the only way.

Source files are under `prototype/extracted/assets/js/`.

---

## Reveal on scroll — `02-page.js`

60 elements carry `data-reveal`. They start at `opacity:0` with a small
`translateY`, and gain `.is-in` when they enter the viewport, transitioning over
0.9s on the project easing curve. A `--i` custom property staggers siblings by
90ms each.

**Reversible.** Leaving the viewport removes `.is-in`, so scrolling back up
replays it. The observer uses a `-12%` bottom margin, so things reveal slightly
before they are fully in view.

`prefers-reduced-motion: reduce` disables this — everything is visible at once.
Honour that.

**The trap:** an element inside a `hidden` container is never observed, so it
stays invisible when that container is later shown. `04-reveal-settle.js` exists
solely to mark those as revealed when a hidden year is switched on. Any
conditional container needs the same treatment.

## Counters — `02-page.js`

The four figures count from 0 to their target when the section reveals, over
about 1.6s, easing out. `data-count`, `data-prefix` and `data-suffix` carry the
target and its decoration. 2800 renders as `2,800`.

## Section navigation — `02-page.js`

A fixed bar that slides down once the hero is out of view and tracks the section
in view, underlining the current one. Clicking scrolls to the anchor.

Below 980 it swaps long labels for short ones and shrinks its type. Its height is
the top boundary for anything else that floats — see the guard below.

## Navigation rail — `03-nav-rail.js`

Fixed bottom right: back to top, then previous and next section, separated by a
rule. Above 980 the page's container narrows by 200px so the rail never sits over
content.

`--container: min(1140px, 100vw - 200px)` above 980. That is the whole mechanism.

## Report year switching — `02-page.js`

A `<select>` toggles visibility of every element carrying `data-repyear`. The
card grid, and the "Future reports" heading and list, all carry it, so a past
year hides the forthcoming list automatically.

After switching, the newly shown reveals are settled (see above).

## The Data section

The largest piece of state on the page. Data rules are in `02-index-data.md`;
this is the interaction.

### Chart drawing

Lines draw in with `stroke-dasharray` / `stroke-dashoffset` when the tile
reveals. The stroke uses `vector-effect: non-scaling-stroke`, which means the
dash length is measured in **screen** space, not the SVG's user units — get this
wrong and the dash is wildly out of scale.

Painting is incremental. Selecting a series animates in only the new line;
lines already on screen stay exactly where they are; a deselected line fades out
over 0.32s. Do not redraw the whole chart on every change — the prototype did
originally and it was rejected.

### The picker panel

Fixed position, placed by script. It must:

1. Open below the "Customise your view" button, aligned to its right edge.
2. Stay **entirely on screen**, riding up over its own button if there is no room
   below. That is what the close control is for.
3. Stay within the parchment card. It may reach the card's top and bottom and no
   further, so it never floats over a neighbouring section. Clamp against the
   card's **whole** rectangle, not its visible part, or it jumps as the card
   scrolls away.
4. Never overlap the section navigation or the site header. It is painted under
   them (`z-index: 90` against their 99 and 100) **and** kept clear of whichever
   is on screen.
5. Cap its height to the room available and scroll its list, with the note
   pinned at the top and "Clear all" at the bottom.

Below 620 it becomes a bottom sheet instead, full width less 16px either side,
and locks page scrolling while open.

It re-places on scroll and on resize while open.

### The (i) notes

Fixed position, placed by script, at every width. Fixed because they must escape
the picker's own scroll container, which would otherwise clip them.

- Beside the mark where there is room, vertically centred on it.
- A mark inside the picker measures from the **panel**, so the note clears the
  list it is describing rather than covering it.
- Otherwise below the mark, centred, flipping above it near the bottom of the
  screen.
- Always clamped 12px clear of every edge, and below the top bars.

They reposition on scroll — including the picker list's own scrolling — and on
resize.

### Readings column alignment

Above 620 the readings sit beside the chart and their column is pinned to the
chart's height by script. Below 620 they drop underneath and the pinning is
switched off. The breakpoint is read with `matchMedia` so the script and the
stylesheet cannot drift apart.

## Scroll lock — `02-page.js`

Reference-counted, because two popups can both want it. Sets `overflow:hidden` on
both `html` and `body`, **and** cancels `touchmove` outside the open panel — iOS
keeps scrolling through `overflow:hidden` alone. The picker's own list is
exempted so it still scrolls.

The Request full index modal locks at every width. The picker locks on phones
only, where it is a sheet.

## Forms — `07-email-validation.js`

One rule for every email field, including inside the modal. Listens on the
**capture** phase so a bad address stops the modal closing. See
`07-forms-and-capture.md`.

## Hero field — `01-hero-flow.js` + shaders

A full-viewport WebGL canvas: simplex noise through a domain-warped fbm, in the
brand reds.

Uniforms: resolution, time, pointer, heading, energy, presence, and four ripple
positions with ages.

The pointer drives a **critically damped spring**, not the raw position. Speed
feeds an energy value that both quickens the clock and sharpens the flow.
Heading is the smoothed direction of travel. Pointer down emits a ripple.

When the pointer is idle or gone, a drift is **blended in** over about a second
rather than switched to — switching makes it lurch.

Frame-rate independent: it eases with `1 - exp(-dt/tau)`, not a fixed step.

Pauses when off screen, and renders a single static frame under
`prefers-reduced-motion`.

## Intelligence Hub plates — `05-pillar-flow.js`

**One** off-screen field at viewport size, drawn once per frame, with the three
plates as 2D canvases copying windows out of it. Not three separate animations —
pushing the flow in one plate moves it in all three, because there is only one.

Needs `preserveDrawingBuffer: true` so the plates can read it back after the draw.
Device pixel ratio capped at 1.5.

**Side by side** (above 620): the plates share one horizontal band of the field,
each taking its own share by x position.

**Stacked** (below 620): they would all resolve to the same window, because they
share a left edge. Instead they take a slice of the field turned a quarter
**anticlockwise**, sharing its length a third each, each cropped to the largest
rectangle of its own shape that fits — so the pattern is never stretched.

Layout is detected by whether the first and last plate share a left edge, not by
a breakpoint, so it cannot drift out of step with the CSS.

The pointer maps into the exact rectangle being drawn, rotation included, so a
touch pushes the flow where it was touched.

A 34% plum wash sits over each plate. The field's highlights are bright enough to
swallow white type without it.

## Touch — `@media (hover:none)`

`:hover` latches after a tap on iOS and will not let go. Under `hover:none` the
plates and the report covers hold their resting state, and the card answers to
the tap itself. The arrow rings still animate on interaction.

## Newshub field alignment — `02-page.js`

The email field's foot is aligned to the foot of the two images beside it, at
every width.

Measured with an `offsetTop` chain, **not** `getBoundingClientRect()` — the
reveal animation puts a transform on these elements, and a rect taken mid-reveal
is 26px out. A `ResizeObserver` re-runs it when the images or the column change.
