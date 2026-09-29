# RedBook Intelligence

The RedBook Intelligence page as a Next.js app, with its own CMS on Supabase.

- **`/`** – the public page, rebuilt from `redbook-intelligence-handover/prototype/`.
- **`/admin`** – the CMS: every piece of copy, the report cards, the index figures, and the form submissions.

The design handover is kept in [`redbook-intelligence-handover/`](redbook-intelligence-handover/README.md). Read it before changing the page.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Data, auth, media | Supabase – Postgres with RLS, email + password auth, Storage bucket `rbi` |
| Email | Resend HTTP API (optional) for form notifications |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill it in - see below
npm run db:setup             # tables, RLS, bucket policies, and the prototype's content
npm run dev
```

### Environment

| Variable | |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_…`). `NEXT_PUBLIC_SUPABASE_ANON_KEY` works in its place. |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | `rbi` |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional. Only used to insert form submissions; the app works without it. **Server only.** |
| `DATABASE_URL` | Postgres URL for `npm run db:*`. Use the **session pooler** (`aws-0-<region>.pooler.supabase.com:5432`, user `postgres.<ref>`) because the direct `db.<ref>.supabase.co` host is IPv6-only. URL-encode the password. |
| `NEXT_PUBLIC_BASE_PATH` | `/redbook-intelligence` when served under redbookagency.com (see `08-build-notes.md`). Empty for the root. |
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL, used for share metadata. |
| `RESEND_API_KEY`, `NOTIFY_FROM` | Notification email. Without a key, submissions are still stored and visible in the CMS. `NOTIFY_FROM` must be on a domain verified in Resend. |
| `NOTIFY_TO`, `NOTIFY_TO_REQUEST_INDEX` | Recipients, comma-separated. They default to `index@` for all forms, plus `vihaan@` for "Request full index". |

### Giving someone edit access

Editors are Supabase Auth users whose email is on the `admins` allowlist. RLS checks that list on every write.

1. Supabase Dashboard → **Authentication → Users → Add user**. Tick *Auto Confirm User*.
2. `npm run db:admin -- someone@redbookagency.com`

They sign in at `/admin/login`. Forgotten passwords use Supabase's reset email. For the link to work, add `https://<site>/admin/auth/callback` (and `http://localhost:3000/admin/auth/callback`) under **Authentication → URL Configuration → Redirect URLs**.

**Turn off public sign-ups:** **Authentication → Sign In / Providers → Allow new users to sign up**. Editors are only ever added by hand. Keep **Confirm email** on too, because the allowlist only trusts confirmed addresses.

## How it is put together

```
src/
  app/
    (site)/            public page: one root layout, the page, and /preview/index/[id]
    (cms)/admin/       the CMS (its own root layout, so none of the site CSS/JS leaks in)
    api/forms/         the four capture points -> form_submissions + email
  components/site/     the prototype's markup as server components
  lib/
    content/           types, the prototype's copy as defaults, loading from Supabase
    cms/schema.ts      one declaration per section: drives the editor forms and server-side sanitising
    index-data.ts      index payload: JSON Schema + cross-field validation, CSV import
  proxy.ts             keeps the editor session fresh, bounces signed-out visitors from /admin
public/assets/         the prototype's CSS, fonts, images and scripts
supabase/migrations/   schema, RLS, storage policies
scripts/db.mjs         migrate / seed / admin
```

**The page is the prototype's own code.** The markup is reproduced class for class, and the prototype's CSS and scripts are served unchanged, with three exceptions:

- `02-page.js` reads the index payload from the page (`#rbIndexData`) instead of hard-coded figures. It builds the regions, axis, readings, locked series and selection limit from `meta` (see `02-index-data.md`), and derives `v`/`y`/`b` from `a`. It also implements **Export your graph**: one click saves the chart as a PNG and the table as a CSV.
- `06-request-dialog.js` and `07-email-validation.js` post to `/api/forms`. The dialog also traps focus now.

The scripts are injected after React hydrates (`LegacyScripts`), because they rewrite parts of the DOM that React would otherwise treat as a hydration mismatch.

**Publishing.** `/` is statically generated. Saving a section in the CMS revalidates it at once, and it also revalidates every 5 minutes regardless. If Supabase is unreachable, the page falls back field by field to the prototype copy in `lib/content/defaults.ts` rather than rendering empty.

**Index data** goes through a stricter path, as the handover asks. Upload JSON or CSV → it's validated before anything is saved → it's saved as a draft → you preview the whole page with it → you publish. Only one dataset is published at a time.

**Forms.** All four write to `form_submissions`. Visitors may insert but never read. Spam protection is a honeypot field plus a minimum fill time, and both fail silently. There is also a per-instance rate limit. Email validation uses the handover's rule, on the client and again on the server.

**History.** Every save keeps the version it replaced (`site_content_revisions`), and any section can be restored from its page in the CMS.

## Content ownership

`01-content-model.md` asks for the rule to be written down, so here it is: **everything on this page is owned by this CMS**. That covers the header, footer and journal entries too, which the handover suggested might come from WordPress. A report card's link can point at a PDF hosted anywhere, WordPress included. If the header, footer or journal later move to WordPress, remove their sections from `lib/cms/schema.ts` and update this paragraph.

## Placeholders still on the page

Per `09-decisions.md`:

- Every index figure is invented. The seeded dataset is the prototype's London/Country placeholder. Upload the filled `index-template.json` (Country/International, three years) under **Index data**.
- The About figures and every report date are placeholders.
- Most links are `#`. Set them in the CMS.

## Hosting notes (from `08-build-notes.md`)

- Serving under `redbookagency.com/redbook-intelligence` needs `NEXT_PUBLIC_BASE_PATH`, not only a proxy rewrite.
- Vercel Hobby doesn't permit commercial use, so use Pro. Supabase free projects pause after a week idle. The page survives that on its defaults, but the CMS doesn't.
- Make sure the CDN in front of WordPress doesn't also cache this app's HTML.
- Analytics needs a UK cookie banner. Neither is built yet.

## Scripts

| | |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` | Type-check |
| `npm run db:setup` | Migrate + seed (seeding never overwrites existing rows) |
| `npm run db:migrate` | Apply new files in `supabase/migrations/` |
| `npm run db:admin -- <email>` | Add an editor |
