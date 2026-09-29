# QA checklist

Check the rebuild against `prototype/extracted/index.html` side by side, at each
width. The prototype is the spec.

## Widths to test

**1440, 1280, 1140, 1060, 980, 900, 700, 621, 620, 430, 390, 375.**

The pairs matter: 1141/1140, 981/980, 621/620 each cross a breakpoint and should
change in a specific way, not merely reflow.

## Layout

- [ ] ≥981: container is `100vw - 200px`, capped at 1140. The rail never overlaps content.
- [ ] 1141 → 1140: report cards stop shrinking. Plate holds 220px from here down to 621.
- [ ] 1060: tool boxes tighten but stay three across.
- [ ] 980: figures still four across; report cards, tools and pillars still three across.
- [ ] 980 → 621: chart and readings stay side by side; the chart gives up width.
- [ ] 621 → 620: readings drop below the chart; pillars go to the compact side-by-side layout; tools to flagship-over-pair; figures and report cards to two across.
- [ ] 375: seven nav labels on one line. No horizontal scroll at any width.

## Type

- [ ] Section headlines hold one line per clause above 700px.
- [ ] Two-line figure labels sit tight — 1.35 leading, not the body's 24px.
- [ ] Index numerals: 44 / 32 above 980, 34 / 24 below. The difference is the hierarchy.
- [ ] Inputs are 16px below 620. Tapping a field on a real iPhone must not zoom the page.
- [ ] "RBi" never renders as "RBI".

## Alignment

- [ ] The three pillar arrow rings land on the right edge of the plate above them.
- [ ] Below 620, the pillar plate's foot is level with the foot of its link.
- [ ] Report cards within a year are all the same height, in every year.
- [ ] Give one report a three-line title: every title in that year grows with it and the cards stay level. Shorten it again and the space goes back.
- [ ] The About paragraph starts and ends on the same lines as the headline above and the figures below.
- [ ] The tools standfirst runs the full width of the three boxes.
- [ ] Contribute and Contact line up across the divide above 980.
- [ ] The Newshub email field's foot is level with the foot of the two images, at every width.
- [ ] Below 620, "The podcast" and "News & Lifestyle" are both two lines and their blurbs start level.

## The Data section

- [ ] Loads showing the overall index alone, even after a reload — check `autocomplete="off"` on the checkboxes.
- [ ] At most four at once; when full, the rest dim and the note changes wording.
- [ ] The overall index cannot be deselected, and is always red.
- [ ] Colours hold: deselecting one series does not reshuffle the others.
- [ ] New selections appear **above** the overall index in the table.
- [ ] Selecting animates in only the new line. Existing lines do not redraw.
- [ ] Deselecting fades out over ~0.3s.
- [ ] Region toggle switches every series.
- [ ] Hovering a line names it.
- [ ] Hovering anywhere in a table row brings that line forward; the table does not change.
- [ ] Hovering "From '25" highlights only the last segment.
- [ ] Axis stays 100–150 regardless of selection.

## The customise panel

- [ ] Opens below its button, right-aligned to it.
- [ ] Rides up over its own button rather than running off the bottom.
- [ ] Never paints over the section navigation or the site header.
- [ ] Stays within the parchment card; travels with it and does not jump.
- [ ] Does not close itself on scroll.
- [ ] Note pinned top, "Clear all" pinned bottom, only the list scrolls, and only vertically.
- [ ] Below 620: a bottom sheet, and page scroll is locked while it is open.
- [ ] Closes on the X, on an outside click, and returns focus to its button.

## Notes and modals

- [ ] An (i) note opens attached to its mark, at every width.
- [ ] It is never clipped by the picker's list and never runs off an edge.
- [ ] It flips above the mark near the bottom of the screen.
- [ ] Inside the picker it clears the panel rather than covering the list.
- [ ] The modal locks page scroll at every width; Escape and the scrim close it; focus returns to the trigger.

## Forms

- [ ] A bad address blocks submission in all four places, modal included.
- [ ] The invalid outline goes round the **whole** control, not three sides.
- [ ] Same for the focus ring, modal included.

## Motion

- [ ] Reveals replay when scrolling back up.
- [ ] Counters run once the About section appears.
- [ ] Arrow rings draw in on hover, and on a phone.
- [ ] `prefers-reduced-motion: reduce`: no reveals, hero static, everything visible.

## The animated fields

- [ ] Hero answers the pointer, drifts when left alone, ripples on click.
- [ ] Above 620 the three plates are windows onto **one** field — pushing the flow in one moves it in all three.
- [ ] Below 620 each plate shows a different part of the rotated slice. They must not be identical.
- [ ] Both pause off screen.
- [ ] On a touch device, tapping a card does not leave it stuck in its hover colours.

## Cross-browser

- [ ] Safari on a real iPhone. Not the simulator — the input-zoom and sticky-hover behaviour are the things most likely to differ.
- [ ] Safari on macOS.
- [ ] Chrome and Firefox.
- [ ] With WebGL disabled the page still reads.

## Before launch

- [ ] Placeholder figures replaced.
- [ ] Eighteen links pointed somewhere.
- [ ] Forms delivering, with notification and spam protection.
- [ ] Font licence confirmed.
- [ ] `basePath` correct under `/redbook-intelligence`.
- [ ] Hosting tiers commercially licensed and not pausing on inactivity.
- [ ] Metadata, Open Graph image, canonical URL.
