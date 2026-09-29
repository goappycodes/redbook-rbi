# Build notes

Things likely to cost time if they are found late.

## Server rendering

Two WebGL surfaces and a lot of measurement. Under SSR:

- Mount both canvases **client-only**. They touch `window`, `document` and
  `getBoundingClientRect` on the first frame.
- Cancel the animation frame loop and release the GL context on unmount. Browsers
  cap live WebGL contexts (commonly 16); a page that remounts without cleaning up
  will eventually stop rendering.
- Everything measured with `getBoundingClientRect` runs after layout. In React,
  `useLayoutEffect` for anything that positions, or the first paint flashes in
  the wrong place. The picker panel, the note popovers and the readings-column
  alignment are all in this category.
- The reveal system needs `IntersectionObserver`, which is client-only. The page
  must be readable without it — don't ship content that only appears on reveal.

## Hosting under a path

`redbookagency.com/redbook-intelligence` means Next.js needs `basePath` set, not
just a proxy rewrite. Without it, asset URLs, router links and the image loader
all resolve at the domain root and 404 behind the proxy.

Also check:

- Whatever cache or CDN sits in front of WordPress does not also cache the app's
  HTML, or CMS edits will appear only after a purge.
- Cookie scope, if the app ever sets one, does not collide with WordPress.
- Trailing-slash behaviour matches on both sides.

## Hosting tiers

Two things in the plan as sent will not hold:

- **Vercel's free tier is Hobby**, and its terms do not permit commercial use. A
  client-facing page on an agency's own domain is commercial. Pro is about $20 a
  month.
- **Supabase free projects pause after a week of inactivity.** On a low-traffic
  marketing page that means the first visitor after a quiet spell meets a cold or
  dead database.

Neither is expensive. Both are cheaper to resolve now than after launch.

## Assets and first paint

The prototype inlines everything as base64, which is why it is 2.2 MB.
`prototype/extracted/` has it as a 37 KB document plus real files. Build from
that.

- The report covers are 640×853 JPEGs, 42–172 KB each, and 16 of them load. Run
  them through the image pipeline and serve AVIF or WebP with sizes.
- `rbi-logo.png` and `footer-mark.png` are byte-identical. One file.
- The wordmark is a PNG used as a CSS mask. An SVG would be sharper and smaller,
  and would keep the `currentColor` behaviour.
- Barlow comes from Google Fonts. Self-host it to drop a third-party connection.
- MinervaModern is a 30 KB OTF. Subset it and convert to WOFF2 — but first, see
  the licence note in `09-open-decisions.md`.

## Accessibility

Already in place, worth not losing:

- `prefers-reduced-motion: reduce` disables reveals and renders the hero static.
- Every canvas is `aria-hidden` — they are decoration.
- The (i) marks are focusable and their notes open on focus as well as hover.
- The year selector has a visually hidden label.
- The modal returns focus to its trigger on close and answers Escape.

Not done, and worth doing:

- No skip link.
- The modal does not trap focus.
- Colour contrast has not been audited. `--mute` on `--parch-1` is around 3.5:1 —
  under AA for body text, though it is used for labels and captions.
- The chart has no text alternative. The table beside it largely serves as one,
  but it is not wired up as such.

## Browser support

Uses `clamp()`, CSS custom properties, `aspect-ratio`, `:focus-within`, `:has()`
is **not** used, `overflow: clip`, `display: contents`, `IntersectionObserver`,
`ResizeObserver`, `matchMedia`, WebGL 1.

Safari 15.4+, Chrome/Edge 105+, Firefox 103+. `overflow: clip` is the newest of
these. Without WebGL the page still works — the canvases stay empty and the
plates show their red ground.

## Performance

- Two animation loops. Both pause off-screen. Keep that.
- The pillar field reads the GL buffer back each frame, which needs
  `preserveDrawingBuffer: true` and is the more expensive of the two. It is
  capped at 1.5× device pixel ratio for that reason.
- The chart redraws only what changed. Do not simplify that to a full redraw.
- 60 reveal observers is fine; one shared observer, as now, not 60 separate ones.
