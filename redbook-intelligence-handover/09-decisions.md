# Decisions

Settled with RedBook. Anything still open is at the bottom.

---

## Content

**Index figures are placeholder.** Every number in the Data section was invented
for the prototype. RedBook will fill `data/index-template.json` when the real
data is ready. See `02-index-data.md` — note that the template is Country and
International across three years, where the prototype shows London and Country
across four.

**About figures are placeholder.** 200+, 2,800, £14B+, 350k+.

**Report dates are placeholder.** Every "Published" and "Coming" date.

**All text is editable in the CMS.** Including the hero headline — it is
authored as three lines and is tuned to sit that way, so the field should accept
line breaks and whoever edits it should check the result.

**Links** — the eighteen `href="#"` placeholders are the developer's to wire up;
he knows what sits behind each.

## Behaviour

**Chart data arrives as JSON.** As proposed. Validate on upload and preview
before publish — the file is hand-authored annually and a malformed one renders
an empty chart rather than an error.

**Export produces two things, both open, neither gated:** a chart image, and a
CSV of the table data.

**The Contributor Report lock is decorative.** The report is only ever sent
directly by email, so there is no access control behind the padlock and no auth
to build.

**Report cards: raise the card minimum.** Titles are not capped. Implemented as
a runtime levelling rather than a fixed reserve — every title in the year on show
is raised to the tallest of them, so cards stay level whatever the lengths.
Reserving three lines up front was tried first and looked wrong: it left dead
space under every current title and took 28px off the picture. See
`06-components.md`.

## Build

**Forms** — Supabase table plus notification email. Addresses in
`07-forms-and-capture.md`. No double opt-in.

**Font licence is fine.** The developer has the licensed fonts.

**Content ownership split is the developer's call.** The recommendation in
`01-content-model.md` stands as a starting point, but he decides. The one thing
worth holding to: whatever the split, write it down, so an editor never has to
guess which system owns a given field.

**Analytics: yes**, which means a cookie consent banner in the UK.

**Staging environment: yes**, for the feedback week.

**Code ownership and post-launch support** — covered by the existing
relationship, not a contractual concern.

---

## Still open

Only two, both for the developer rather than RedBook.

1. **The region and reading change.** The live data is Country/International over
   three years; the prototype is London/Country over four. Build the toggle and
   the axis from `meta` rather than hard-coding, and this resolves itself when
   the real file lands.

2. **Spam protection on the four forms.** Not yet specified. A honeypot and a
   timing check is the low-friction option.

## Worth not losing

- **"RBi" must not be uppercased.** The eyebrow style uppercases, so the mark is
  wrapped in a span that opts out. Preserve that wherever the name appears in a
  tracked label.
- **The section navigation holds seven labels on one line down to 375px.** An
  eighth section, or a longer short label, wraps it.
