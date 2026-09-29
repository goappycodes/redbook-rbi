# RedBook Intelligence — developer handover

Everything needed to rebuild this page as a CMS-driven Next.js app.

## What's here

| | |
|---|---|
| `prototype/` | The finished page. Start here. |
| `01-content-model.md` | Every editable field, and which system should own it |
| `02-index-data.md` | The chart payload: schema, rules, worked example |
| `03-interaction-spec.md` | Behaviour that isn't visible in the markup |
| `04-responsive-spec.md` | All four breakpoints, rule by rule |
| `05-design-tokens.md` | Colour, type, spacing, motion |
| `06-components.md` | The reusable pieces |
| `07-forms-and-capture.md` | The four capture points |
| `08-build-notes.md` | SSR, hosting, performance, accessibility |
| `09-decisions.md` | What RedBook has settled, and the two items still open |
| `10-qa-checklist.md` | Sign-off list |
| `data/` | The index template to fill, plus schema, example and design tokens |

## Read in this order

1. Open `prototype/extracted/index.html` from a local server and use the page.
   Resize it. It behaves differently at 1140, 1060, 980 and 620.
2. `09-decisions.md` — shortest, and tells you what has been settled.
3. `01-content-model.md` — shapes the database.
4. `03-interaction-spec.md` and `04-responsive-spec.md` while building.

## For RedBook to fill

`data/index-template.json` — the index figures, Country and International across
2024/25, 2025/26 and 2026/27. Only the `a` arrays need values.
`data/index-template.csv` is the same thing as a spreadsheet if that is easier.

## Running it

```
cd prototype/extracted
python3 -m http.server 8000
```

Then open `http://localhost:8000`. It needs a server, not `file://` — the WebGL
canvas reads its shaders from the DOM and the fonts are same-origin.

`prototype/redbook-intelligence.html` is the same page as one self-contained
2.2 MB file. It opens with a double-click and is useful for showing people.
`prototype/extracted/` is the version to build from: a 37 KB document plus real
CSS, JS, font and image files. `prototype/VERIFICATION.md` records the
measurements proving the two render identically.

## The short version

- The page is one document, eight sections, no routing.
- Two WebGL surfaces: the hero, and one off-screen field windowed into the three
  Intelligence Hub plates. Both are client-only and need care under SSR.
- The Data section is the only genuinely stateful part. Everything else is
  content plus reveal-on-scroll.
- Four email capture points, none of which currently submit anywhere. Their
  destinations are confirmed in `07-forms-and-capture.md`.
- Every figure in the Data section is invented. RedBook will fill
  `data/index-template.json`. Note that the live data is Country/International
  across three years where the prototype shows London/Country across four —
  see `02-index-data.md`.
