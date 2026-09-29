import { BASE_PATH, STORAGE_BUCKET, SUPABASE_URL } from '@/lib/supabase/env'

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c])

/**
 * Editor text to HTML. Escapes everything, turns an authored newline into a
 * break (a phone-only one with `mobileBreaks`), and wraps "RBi" so the tracked
 * uppercase styles cannot turn it into "RBI" (09-decisions.md).
 */
export function rt(text: string | undefined | null, opts: { mobileBreaks?: boolean } = {}): string {
  /* a phone-only break still needs its space on wider screens, where it is hidden */
  const br = opts.mobileBreaks ? ' <br class="br-m">' : '<br>'
  return esc((text ?? '').trim())
    .replace(/\bRBi\b/g, '<span class="brand">RBi</span>')
    .replace(/ *\r?\n */g, br)
}

/** Local asset path, Supabase Storage path, or full URL -> something an <img> can load. */
export function mediaUrl(src: string | undefined | null): string {
  const s = (src ?? '').trim()
  if (!s) return ''
  if (/^(https?:)?\/\//.test(s) || s.startsWith('data:')) return s
  if (s.startsWith('/')) return BASE_PATH + s
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${s.replace(/^\/+/, '')}`
}

export const asset = (p: string) => BASE_PATH + p

/** "#pillars" stays a page anchor; anything else is a link out. Empty means no link. */
export const isExternal = (href: string) => /^https?:\/\//.test(href)
