# Content model

Every editable thing on the page, in document order, with the constraints that
matter. "Owner" is a recommendation, not a decision — see the note at the end.

Section ids are the anchors the navigation uses: `hero`, `about`, `pillars`,
`reports`, `index`, `tools`, `exchange`, `newsletter`.

---

## Site header

Sits above the page and is presumably the existing RedBook header. Six links
(About Us, Services, Our Team, RedBook Intelligence, News, Contact) plus the
wordmark and a "Menu" label that appears below 980. **Owner: WordPress**, if this
is to stay consistent with the rest of redbookagency.com.

## Section navigation

Seven items. Each has a **long** and a **short** label; the long one shows above
980, the short below. Both are needed.

| Anchor | Long | Short |
|---|---|---|
| `#about` | What we stand for | About |
| `#pillars` | The Three Pillars | Pillars |
| `#reports` | Research | Research |
| `#index` | Data | Data |
| `#tools` | Tools | Tools |
| `#exchange` | Contribute/Contact | Contribute/Contact |
| `#newsletter` | Newshub | Newshub |

Seven short labels have to fit one line at 375px. The type scales to hold that.
Adding an eighth section, or a longer short label, will wrap it — check at 375
before shipping any change here. **Owner: Supabase.**

---

## 1. Hero

| Field | Type | Current value | Notes |
|---|---|---|---|
| Eyebrow | text | RedBook Intelligence | |
| Headline | rich, 3 lines | Research, / data / & tools | Editable. Line breaks are authored, not automatic — the type is tuned to three lines, so check the result after editing. |
| Standfirst | text | The intelligence hub for luxury residential projects – built for you. | En dash, not a hyphen |
| Button label | text | Explore RedBook Intelligence | |
| Button target | anchor | `#pillars` | |

The background is generated, not an image. Nothing to edit.

## 2. About

| Field | Type | Current value |
|---|---|---|
| Eyebrow | text | What we stand for |
| Headline | text | Data tells you what's happened to costs. Intelligence tells you what to do about it. |
| Body | long text | RedBook Intelligence exists to turn industry data into valuable insights… |
| Figures | 4 × {number, suffix, prefix, label} | see below |
| Footnote | text | * RBi Statistics 26/27 |

The headline is measured to sit on one line per clause above 700px. A materially
longer headline changes the section's proportions.

The body is justified above 620 and left-aligned below. It runs the full
container width — don't reintroduce a max-width.

### Figures

| Count | Prefix | Suffix | Label (two lines) |
|---|---|---|---|
| 200 | | + | Contributing / practices |
| 2800 | | | Projects / logged |
| 14 | £ | B+ | Project / value |
| 350 | | k+ | Data / points |

Each label is deliberately two lines with an authored break. Each carries a
trailing asterisk pointing at the footnote. The numbers count up when the
section scrolls into view — store the target, not the animation.

**Owner: Supabase.**

## 3. Intelligence Hub (pillars)

| Field | Type | Current value |
|---|---|---|
| Eyebrow | text | The intelligence hub |
| Headline | text | RedBook Intelligence |
| Cards | 3 × below | |

Each card: **label** (Research / Data / Tools), **body**, **link label**, **target
anchor**, and an **icon**. The icons are inline SVG line drawings, not image
files — a page under a lens, a rising plot, a calculator. Treat them as fixed
assets unless you want them editable, in which case they need an SVG upload
field with a sanitiser.

The card label appears twice in the markup: once inside the plate (desktop) and
once beside it (phone). One value, two slots.

**Owner: Supabase.**

## 4. Reports

| Field | Type | Current value |
|---|---|---|
| Eyebrow | text | Research |
| Headline | text | REDBOOK INTELLIGENCE REPORTS |
| Standfirst | text | Annual industry data reports with key findings and insights from RBi data. |
| Year selector | enum | 2026/27, 2025/26, 2024/25 |

### Report cards — one collection

Fields per card: **year** (groups them), **label** (the fixed "RBi Report" line,
or an ordinal like 01), **title**, **published date** (displayed `Published MM/YY`),
**blurb** (hidden below 620), **cover image**, **link**, **locked** (boolean).

Current contents:

- **2026/27** — three cards, all labelled "RBi Report": Sentiment (01/26),
  Costs (03/26), Clients (05/26). Each has a blurb.
- **2025/26** — nine chapters numbered 01–09, all published 10/25, no blurbs:
  Welcome, Unwrapping Property Projects, Clients, Costs, Time,
  Planning & Heritage, What Do Clients Want?, Our Predictions,
  Contributor Report. The last is **locked**.
- **2024/25** — one card, "RedBook Intelligence Report", published 10/24, no
  number and no blurb.

A locked card renders as a `div` rather than a link, carries a lock badge, and
has its hover lift and "Click to read" hint suppressed.

Cards in a year are cut to a uniform height. On phones the grid does it; above
that, every title in the year on show is raised to the height of the tallest,
by script. Titles are therefore **not length-capped** — a longer one simply
raises the row. The CSS floor is two lines, which is what applies if the script
does not run.

### Future reports — a second collection

Fields: **ordinal**, **title**, **description**, **due date** (displayed
`Coming MM/YY`). Five entries, 04–08. Tied to a year and hidden for past years.
The description is hidden below 620.

Heading above it: "Future reports".

**Owner: card metadata in Supabase; the PDFs themselves in WordPress** — see
`09-open-decisions.md`, because this split is not yet agreed.

## 5. The RedBook Index (data)

| Field | Type | Current value |
|---|---|---|
| Eyebrow | text | Data |
| Headline | text | The RedBook Index |
| Standfirst | text | Tracking the change in key metrics across luxury residential project costs. |
| Region toggle | fixed | London / Country |
| Picker note | text | Select up to four. The overall index is always shown. |
| Picker note when full | text | Three selected. Turn one off to choose another. |
| Clear label | text | Clear all |
| Column headings | text | From '25 / From base |
| Action 1 | label + behaviour | Export your graph |
| Action 2 | label + behaviour | Request full index → opens the modal |

Everything numeric comes from one payload. **See `02-index-data.md`.**

**Owner: Supabase, one row per year holding the JSON.**

## 6. Tools

| Field | Type | Current value |
|---|---|---|
| Eyebrow | text | Tools |
| Headline | text | REDBOOK INTELLIGENCE TOOLS |
| Standfirst | text | Where the data stops being something to read and becomes something you can run against your own scheme. |
| Tools | 3 × below | |

Per tool: **ordinal**, **title** (two authored lines), **body**, **state**
(live or locked), **link label**, **target**. A locked tool shows a padlock and
"In development" instead of a link, and carries no body.

The standfirst runs the full width of the three boxes. Tool 01 is live; 02 and 03
are locked and have no content beyond their ordinal.

**Owner: Supabase.**

## 7. Contribute / Contact

Two columns sharing a rule. Each has **eyebrow**, **heading** (two authored
lines), **standfirst**, **instruction**, **field placeholder**, **button label**.

| | Left | Right |
|---|---|---|
| Eyebrow | Collective knowledge | Contact us |
| Heading | Are you a design or delivery / professional in this industry? | Interested in acquiring / RedBook data? |
| Standfirst | Contribute to the report in exchange for your data. | Tailored data for your project or development. |
| Instruction | Register your interest in participation for 27/28 | Tell us what you are working on |
| Button | Register | Get in touch |

Above 980 the two columns share grid rows, so the headings, standfirsts,
instructions and fields line up across the divide. Keep the two sides
structurally parallel or that alignment breaks.

**Owner: Supabase.**

## 8. Newshub

| Field | Type | Current value |
|---|---|---|
| Eyebrow | text | Monthly |
| Headline | text | The RBi Newshub |
| Instruction | text | Top insights and the compounding index data, once a month. *(removed — see notes)* |
| Button | text | Subscribe |
| Tiles | 2 × {image, label, body} | The podcast / News & Lifestyle |
| Journal | 5 × {date, title, kind, link} | |

Both tile labels carry a phone-only line break so they stay aligned when the
column narrows. Journal entries: date (`MMM YYYY`), title, kind (Journal or
Article), and a link.

The email field's foot is aligned to the foot of the two images by script. See
`03-interaction-spec.md`.

**Owner: journal entries in WordPress if they are real articles; everything else
Supabase.**

## 9. Footer

Tagline, three link groups (RedBook Intelligence / Follow / legal), and the
company line: "The Red Book Agency Limited Trading As RedBook, No. 07534026".
**Owner: WordPress**, to match the rest of the site.

## Modal — Request full index

Title, standfirst, five fields (First name, Last name, Company name, Position,
Email), submit label "Send request".

---

## A note on ownership

The recommendation above assumes: **WordPress owns anything that already exists
elsewhere on redbookagency.com** (header, footer, the report PDFs, real
articles), and **Supabase owns everything specific to this page**. The value of
picking a rule like that is an editor never has to guess. If you split it
differently, write the rule down and keep to it.
