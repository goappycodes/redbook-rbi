import 'server-only'
import { createPublicClient } from '@/lib/supabase/server'
import { DEFAULT_INDEX, validateIndex, type IndexPayload } from '@/lib/index-data'
import { DEFAULT_CONTENT } from './defaults'
import type { ContentKey, SiteContent } from './types'

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
