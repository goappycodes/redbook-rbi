import 'server-only'
import { createPublicClient } from '@/lib/supabase/server'
import { DEFAULT_INDEX, validateIndex, type IndexPayload } from '@/lib/index-data'
import { DEFAULT_CONTENT } from './defaults'
import type { ContentKey, JournalEntry, SiteContent } from './types'

/* The parent site runs on WordPress; the journal can be driven live from its
   `press` custom post type instead of the CMS list (see the Newshub toggle). */
const WP_API_BASE = process.env.WORDPRESS_API_BASE || 'https://redbookagency.com/wp-json'
const WP_JOURNAL_COUNT = 5

const decodeEntities = (s: string) =>
  s
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&(?:#0?39|apos|lsquo|rsquo);/g, "'")
    .replace(/&nbsp;/g, ' ')

type WpTerm = { name?: string }
type WpPost = {
  date?: string
  link?: string
  title?: { rendered?: string }
  _embedded?: { 'wp:term'?: (WpTerm[] | undefined)[] }
}

/* Remap a category label to the wording the page uses. */
const KIND_LABELS: Record<string, string> = { blog: 'Article' }

/* The post's category (the `press-cat` term), used as the row's kind label. The
   terms are prefixed "RedBook " (e.g. "REDBOOK JOURNAL"); drop it for the compact
   single-word label the design uses. */
const kindFromPost = (p: WpPost) => {
  for (const group of p._embedded?.['wp:term'] ?? [])
    for (const term of group ?? [])
      if (term?.name) {
        const name = decodeEntities(term.name).trim()
        const label = name.replace(/^redbook\s+/i, '').trim() || name
        return KIND_LABELS[label.toLowerCase()] ?? label
      }
  return 'Press'
}

/* Three-letter months, to match the CMS entries ("Sep 2026") rather than the
   locale's "Sept". The row's CSS uppercases it on the page. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const journalDate = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** The latest `press` posts as journal entries. Throws so the caller can fall back. */
async function journalFromWordPress(): Promise<JournalEntry[]> {
  const url = `${WP_API_BASE}/wp/v2/press?per_page=${WP_JOURNAL_COUNT}&orderby=date&order=desc&_embed=wp:term&_fields=date,link,title,_links,_embedded`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`WordPress press ${res.status}`)
  const posts = (await res.json()) as WpPost[]
  return posts.map((p) => ({
    date: journalDate(p.date),
    title: decodeEntities((p.title?.rendered ?? '').trim()),
    kind: kindFromPost(p),
    href: p.link ?? '',
  }))
}

/* A missing or unreadable row falls back to the prototype copy, field by field,
   so a half-filled section or a paused database never blanks the page. */
export function withDefaults<K extends ContentKey>(key: K, data: unknown): SiteContent[K] {
  const base = DEFAULT_CONTENT[key]
  if (!data || typeof data !== 'object' || Array.isArray(data)) return base
  return { ...base, ...(data as object) } as SiteContent[K]
}

export async function getSiteContent(): Promise<SiteContent> {
  const out = { ...DEFAULT_CONTENT }
  try {
    const { data, error } = await createPublicClient().from('site_content').select('key, data')
    if (error) throw error
    for (const row of data ?? []) {
      if (row.key in out) {
        const key = row.key as ContentKey
        ;(out as Record<ContentKey, unknown>)[key] = withDefaults(key, row.data)
      }
    }
  } catch (e) {
    console.error('[content] falling back to defaults:', e)
  }
  if (out.newshub.journalFromWordpress) {
    try {
      const journal = await journalFromWordPress()
      if (journal.length) out.newshub = { ...out.newshub, journal }
    } catch (e) {
      console.error('[newshub] WordPress journal unavailable, using CMS entries:', e)
    }
  }
  return out
}

export async function getPublishedIndex(): Promise<IndexPayload> {
  try {
    const { data, error } = await createPublicClient()
      .from('index_datasets')
      .select('payload')
      .eq('status', 'published')
      .maybeSingle()
    if (error) throw error
    if (data && validateIndex(data.payload).ok) return data.payload as IndexPayload
  } catch (e) {
    console.error('[index] falling back to the placeholder payload:', e)
  }
  return DEFAULT_INDEX
}
