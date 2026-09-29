# Is the extracted build the same page?

Yes. Both were loaded from a local server and measured with the same probe.

## Identical at 1280 x 900

| Measurement | `redbook-intelligence.html` | `extracted/index.html` |
|---|---|---|
| About container | 1080 x 511 | 1080 x 511 |
| Section headline size | 54px | 54px |
| Pillar grid | `324px 324px 324px` | `324px 324px 324px` |
| Pillar plate | 324 x 203 | 324 x 203 |
| Pillar button padding-right | 78px | 78px |
| Report cover | 327 x 436 | 327 x 436 |
| Report cover plate | 287 x 276 | 287 x 276 |
| Chart | 560 x 400 | 560 x 400 |
| Overall index numeral | 44px | 44px |
| Tools grid | `326.656px 326.672px 326.656px` | same |
| Tool box | 327 x 394 | 327 x 394 |
| Figures grid | `237.5px` x 4 | `237.5px` x 4 |
| Figure label leading | 17.55px | 17.55px |
| About paragraph | 1040 x 63 | 1040 x 63 |
| Upcoming row columns | `56px 313.75px 448.25px 132px` | same |
| Section nav type | 9.728px | 9.728px |
| Reveal targets / covers / locked | 60 / 13 / 1 | 60 / 13 / 1 |

## Behaviour checked on the extracted build

- 4 canvases present, hero field painting, no JavaScript errors.
- All 16 images load across all three report years.
- Both fonts load; the header mark renders through its CSS mask.
- Picker, request modal, navigation rail and section nav all present and working.
- At 375 x 812: pillars in the compact grid layout with 78 x 117 plates, figures
  and tools two across, chart 210 tall, nav type 9px, inputs 16px, mobile line
  breaks active.

## One thing that broke in the split, and was fixed

Moving the CSS out of the document changed what its relative URLs resolve
against. `assets/img/rbi-logo.png` became `assets/css/assets/img/rbi-logo.png`
and 404'd, taking the header mark and the display font with it. The URLs inside
the CSS now read `../img/` and `../fonts/`. Worth remembering if you restructure
these folders.
