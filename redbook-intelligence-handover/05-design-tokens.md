# Design tokens

`data/tokens.css` and `data/tokens.json` are generated from the prototype's
`:root` block. Drop the CSS file in as-is, or feed the JSON to a Tailwind config.

## Colour

| Token | Value | Used for |
|---|---|---|
| `--plum` | `#2B0815` | Headings, the dark footer ground |
| `--plum-80` / `--plum-55` | rgba | Scrims over imagery |
| `--red` | `#6F2123` | The brand red. Eyebrows, hover states, the locked index line, plates |
| `--red-deep` | `#6F2023` | |
| `--ink` | `#212529` | Body |
| `--ink-70` | `#5A5559` | Secondary body |
| `--mute` | `#8B857F` | Labels, captions, axis type |
| `--paper` | `#FFFFFF` | Page ground |
| `--warm` / `--parch-1` | `#F5F3F0` | Alternate section ground |
| `--parch-2` | `#EDE9E3` | Report cards; the pillar plate on hover |
| `--parch-3` | `#E3DED6` | Report card on hover |
| `--parch-4` | `#D6D0C7` | The active half of the region toggle |
| `--line` | `#E2DDD8` | Hairlines |
| `--line-warm` | `#D8D2CC` | Field and control borders |
| `--grey-box` | `#EDEAE7` | Locked tool boxes |
| `--onDark` / `-70` / `-45` | white + alphas | Type on the dark footer |
| `--line-dark` | `rgba(255,255,255,.2)` | Hairlines on dark |

The chart's three secondary colours are **not** tokens — they live in the script
as `SLOTS = ['#7F7D62', '#CB5255', '#DE9194']`, taken from the RedBook swatch.
Move them into tokens if you like, but keep the order: it is the selection order.

## Type

Two families. **MinervaModern** (display serif, one weight) and **Barlow**
(300/400/500/600, from Google Fonts).

| Class | Size | Line height | Notes |
|---|---|---|---|
| `.h-display` | `clamp(44px, 7.4vw, 104px)` | 1.02 | Hero only |
| `.h-1` | `clamp(30px, 3.9vw, 54px)` | 1.12 | Section headlines |
| `.h-2` | `clamp(24px, 2.6vw, 34px)` | 1.15 | Column headings |
| `.lede` | 18px | 32px | Standfirsts |
| body | 16px | 24px | |
| `.small` | 14px | 21px | |
| `.eyebrow` | 12px | — | Uppercase, 3px tracking |
| `.tracked` | 14px | 21px | Uppercase, 3px tracking |

Most display sizes are fluid via `clamp()`. The headline classes are tuned so
section headlines hold one line above 700px — check that if you change them.

`.figure__l` carries `line-height: 1.35` explicitly. It sets two words on two
lines and would otherwise inherit the body's 24px, which throws them apart.

## Spacing

- `--container: 1140px`, narrowing to `min(1140px, 100vw - 200px)` above 980 to
  clear the navigation rail.
- `--gutter: 20px`.
- Section padding `92px 0`, dropping to `66px` at 980 and `64px` at 620.
- Grid gaps: `.g-2/3/4` 30px, `.g-12` 0 20px, `.pgrid` 34px, `.tools` 30px.

There is no spacing scale as such — values are chosen per component. Take them
from the CSS rather than inventing a scale and rounding to it.

## Motion

| Token | Value |
|---|---|
| `--ease` | `cubic-bezier(.16, 1, .3, 1)` |
| `--ease-out` | `cubic-bezier(.22, .61, .36, 1)` |

`--ease` does nearly all the work. Durations in use:

| Duration | Where |
|---|---|
| 0.25s | Note popovers |
| 0.3–0.4s | Colour and border transitions |
| 0.32s | A deselected chart line fading out |
| 0.45–0.55s | Plate backgrounds, card lifts, the section nav sliding in |
| 0.65s | Report card hover lift |
| 0.75s | An arrow ring drawing in |
| 0.9s | Reveal on scroll |
| 1.4s | Report cover image scale on hover |
| ~1.6s | The figure counters |

Reveal stagger is 90ms per `--i` step.

## Iconography

All inline SVG, no icon font and no sprite. 1.25–1.4px strokes, round caps and
joins, on a 48×48 or 24×24 viewbox. The three hub icons, the padlock, the close
cross, the rail arrows and the button arrows are all drawn this way and inherit
`currentColor`.

The RBi wordmark is a PNG used as a **CSS mask**, so it takes its colour from
`currentColor` too. An SVG would be better in the rebuild.
