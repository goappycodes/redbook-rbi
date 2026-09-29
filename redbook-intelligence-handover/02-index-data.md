# The index payload

The Data section is driven entirely by one JSON document per year.

| File | What it is |
|---|---|
| `data/index-template.json` | **Empty template to fill.** Country and International, three years. |
| `data/index-template.csv` | The same thing as a spreadsheet, if that's easier to fill |
| `data/index-schema.json` | JSON Schema, draft 2020-12 |
| `data/index-example.json` | The prototype's current placeholder data, for shape reference |

**Validate every upload against the schema before it is written.** A malformed
file does not fail loudly: the chart renders empty and the table shows nothing,
which reads as a broken page rather than a bad file.

## ⚠ The template and the prototype differ

RedBook have confirmed the live data will be **Country and International across
2024/25, 2025/26 and 2026/27**. The prototype currently shows **London and
Country across four years** starting 2023/24.

So two things must change when the real data lands:

1. The region toggle's two labels.
2. The chart draws three points rather than four, and the x-axis carries three
   labels.

Neither is difficult — both are driven from `meta` — but build it from `meta`
rather than hard-coding two regions and four readings, or this will need
revisiting again.

## Shape

```json
{
  "meta": {
    "year": "2026/27",
    "base_year": "2024/25",
    "readings": ["2024/25", "2025/26", "2026/27"],
    "axis": { "foot": 100, "head": 150 },
    "regions": [
      { "key": "country",       "label": "Country" },
      { "key": "international", "label": "International" }
    ],
    "locked": "overall",
    "max_selected": 4
  },
  "order": ["overall", "labour", "materials", "…"],
  "series": {
    "overall": {
      "label": "Overall Luxury Projects Index",
      "note":  "The headline measure. What it costs to deliver…",
      "country":       { "a": [100.0, 112.6, 128.6] },
      "international": { "a": [100.0, 110.6, 124.1] }
    }
  }
}
```

### Per region

| Key | Meaning | Required |
|---|---|---|
| `a` | The readings, oldest first. Length must equal `meta.readings.length`. | yes |
| `v` | Headline value. **Derived from the last entry of `a`** when absent. | no |
| `y` | Change across the final segment — the right-hand "From" column. Derived when absent. | no |
| `b` | Change from the first reading — the "From base" column. Derived when absent. | no |

Deriving `v`, `y` and `b` rather than requiring them is deliberate: it is three
fewer numbers per region per index to get wrong, and they are only ever
restatements of `a`. Accept an override if an editorial figure is rounded
differently, but default to computing them.

The two table column headings come from `meta.readings` too — the prototype's
"From '25" is the penultimate reading, not a fixed string.

## The eleven series

In display order, which `order` fixes:

`overall`, `labour`, `materials`, `rawbuild`, `construction`, `fees`, `ohp`,
`prelims`, `landscaping`, `ffe`, `allin`.

Labels and notes are already filled in the template — they do not need rewriting.
`overall` is the locked one.

## Rules the UI enforces

1. **`meta.locked` is always plotted and cannot be deselected.** Its checkbox
   shows ticked and inert, and it is excluded from the picker list.
2. **At most `meta.max_selected` at once**, the locked one included — so three
   more. When full, the remaining rows dim and stop responding, and the picker
   note swaps to "Three selected. Turn one off to choose another."
3. **The axis is fixed at `foot`–`head`**, not fitted. If new data would exceed
   `head`, raise it in the payload or the line is clipped.
4. **Colour.** The locked series is always `#6F2123`. The other three take, in
   order of selection, `#7F7D62`, `#CB5255`, `#DE9194`. A colour is **held**
   while a series stays selected, so deselecting one does not reshuffle the rest.
5. **Line weight.** Locked 2.2px, others 1.7px. Straight segments, butt caps,
   mitre joins — deliberately not smoothed.
6. **Default view is the locked series alone.** Generate the checkboxes with
   `autocomplete="off"` or the browser restores the previous session and
   overrides it.
7. **Region** switches every series at once.

## Table

One row per selected series, the locked one **last** — new selections appear
above it. Each row: value, the two change figures, label, and an (i) note. The
locked row is red, the others plum. Its numeral is 44px against 32px (34 against
24 below 980). That size difference is the hierarchy.

## Chart interactions

- Hovering a line names it in a tooltip.
- Hovering **anywhere in a table row** brings that line forward and drops the
  others to 15% opacity. The table itself does not change.
- Hovering the final change column highlights **only the last segment**.

## Filling the file

RedBook will fill `index-template.json` — only the `a` arrays need values.
`index-template.csv` is the same data as 22 rows if a spreadsheet is easier;
converting it to the JSON is a few lines.

Since the file is authored by hand each year, two things are worth building:

- Validate on upload and show the errors, rather than accepting silently.
- Render a preview from the uploaded file before it goes live.

## Export

Both outputs are wanted, **open, with no capture in front of either**:

- **Chart image** — the chart as drawn. Render the SVG to PNG client-side.
- **CSV of the table data** — the readings and both change columns for whatever
  is currently selected, for the current region.
