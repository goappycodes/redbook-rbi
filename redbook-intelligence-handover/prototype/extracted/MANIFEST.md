# Asset and source manifest

`index.html` here is the same page as `../redbook-intelligence.html`, with every
base64 data URI, every `<style>` block and every `<script>` block pulled out into
the files below. Nothing else was changed.

The single file went from **2.2 MB to a 37 KB document** plus these assets, which
is the shape you want for a real build - the browser can cache them separately and
the CDN can serve them.

Two things worth knowing before you move files around:

- URLs inside the CSS are relative to `assets/css/`, so they read `../img/...`
  and `../fonts/...`. If you flatten this structure, rewrite them.
- The two shader blocks are still inline in `index.html` on purpose. The renderer
  reads them out of the DOM with `getElementById`, so they cannot become external
  files without changing that code. `flow.vert` and `flow.frag` are reference
  copies only.
- The scripts are loaded with `defer`, so they run in document order after parsing.
  In the original they were inline at the foot of the markup they act on, which is
  equivalent.

| Path | Size | What it is |
|---|---|---|
| `assets/css/01-foundation.css` | 9 KB | Tokens, reset, layout primitives, typography, buttons, the reveal system. |
| `assets/css/02-page.css` | 44 KB | Header, hero, and every section and component, followed by all four responsive bands. |
| `assets/css/03-rail.css` | 2 KB | The fixed bottom-right navigation rail. Injected separately in the original. |
| `assets/js/01-hero-flow.js` | 9 KB | The hero WebGL field: pointer spring, energy, heading, ripples, idle drift. |
| `assets/js/02-page.js` | 40 KB | The bulk: reveals, counters, section nav, report year switching, and the whole index module (chart, table, picker, region toggle). |
| `assets/js/03-nav-rail.js` | 2 KB | The rail: previous/next section and back to top. |
| `assets/js/04-reveal-settle.js` | 2 KB | Report year switching; settles reveals the observer never saw while their container was hidden; levels the card titles within a year. |
| `assets/js/05-pillar-flow.js` | 12 KB | One off-screen field, three plates as windows onto it. Includes the stacked/rotated mobile path. |
| `assets/js/06-request-dialog.js` | 1 KB | The Request full index modal. **No backend** - submitting only closes it. |
| `assets/js/07-email-validation.js` | 2 KB | One rule for every email field on the page, including inside the modal. |
| `assets/js/flow.frag` | 4 KB | Reference copy of the fragment shader (simplex noise, domain-warped fbm). Same note as above. |
| `assets/js/flow.vert` | 1 KB | Reference copy of the vertex shader. The live one stays inline in index.html - it is read from the DOM by id. |
| `assets/fonts/MinervaModern-Regular.otf` | 31 KB | Display serif. **Licence must be checked before launch** - a desktop licence does not usually permit web embedding. |
| `assets/img/footer-mark.png` | 19 KB | Footer monogram (`.wf-footer__mark`). Byte-identical to `rbi-logo.png` - can be one file. |
| `assets/img/newshub-news-and-lifestyle.jpg` | 134 KB | Newshub tile, News & Lifestyle |
| `assets/img/newshub-the-podcast.jpg` | 136 KB | Newshub tile, The podcast |
| `assets/img/rbi-logo.png` | 19 KB | Header wordmark. Used as a CSS mask on `.wf-logo`, so the mark takes its colour from `currentColor`. |
| `assets/img/report-2024-25-redbook-intelligence-report.jpg` | 94 KB | The single card for year 2024/25 |
| `assets/img/report-2025-26-01-welcome.jpg` | 62 KB | Chapter 01, year 2025/26 |
| `assets/img/report-2025-26-02-unwrapping-property-projects.jpg` | 69 KB | Chapter 02, year 2025/26 |
| `assets/img/report-2025-26-03-clients.jpg` | 105 KB | Chapter 03, year 2025/26 |
| `assets/img/report-2025-26-04-costs.jpg` | 49 KB | Chapter 04, year 2025/26 |
| `assets/img/report-2025-26-05-time.jpg` | 48 KB | Chapter 05, year 2025/26 |
| `assets/img/report-2025-26-06-planning-and-heritage.jpg` | 108 KB | Chapter 06, year 2025/26 |
| `assets/img/report-2025-26-07-what-do-clients-want.jpg` | 42 KB | Chapter 07, year 2025/26 |
| `assets/img/report-2025-26-08-our-predictions.jpg` | 82 KB | Chapter 08, year 2025/26 |
| `assets/img/report-2025-26-09-contributor-report.jpg` | 87 KB | Chapter 09, year 2025/26 - the locked card |
| `assets/img/report-2026-27-01-sentiment.jpg` | 169 KB | Report card 01, year 2026/27 |
| `assets/img/report-2026-27-02-costs.jpg` | 142 KB | Report card 02, year 2026/27 |
| `assets/img/report-2026-27-03-clients.jpg` | 162 KB | Report card 03, year 2026/27 |
