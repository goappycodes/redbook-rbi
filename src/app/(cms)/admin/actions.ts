'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { problems, sanitize, sectionByKey } from '@/lib/cms/schema'
import { requireEditor } from '@/lib/cms/auth'
import { csvToIndex, DEFAULT_INDEX, validateIndex, type IndexPayload } from '@/lib/index-data'

export type ActionResult = { ok: boolean; message?: string; errors?: string[]; warnings?: string[] }

/* Every published change rebuilds the page straight away. */
function refreshSite() {
  revalidatePath('/', 'layout')
}

export async function saveSection(key: string, data: unknown): Promise<ActionResult> {
  const section = sectionByKey(key)
  if (!section) return { ok: false, message: 'Unknown section.' }
  const { supabase } = await requireEditor()

  const clean = sanitize(section.fields, data)
  const issues = problems(section.fields, clean)
  if (issues.length) return { ok: false, message: 'Not saved - fix these first:', errors: issues }

  const { error } = await supabase.from('site_content').upsert({ key, data: clean })
  if (error) return { ok: false, message: error.message }
  refreshSite()
  return { ok: true, message: 'Saved and published.' }
}

export async function restoreRevision(key: string, revisionId: number): Promise<ActionResult> {
  const { supabase } = await requireEditor()
  const { data: rev, error } = await supabase
    .from('site_content_revisions').select('data').eq('id', revisionId).eq('key', key).single()
  if (error || !rev) return { ok: false, message: error?.message ?? 'Revision not found.' }
  const res = await supabase.from('site_content').update({ data: rev.data }).eq('key', key)
  if (res.error) return { ok: false, message: res.error.message }
  refreshSite()
  return { ok: true, message: 'Restored and published.' }
}

/* ---------- index datasets ---------- */

async function publishedPayload(supabase: Awaited<ReturnType<typeof requireEditor>>['supabase']) {
  const { data } = await supabase.from('index_datasets').select('payload').eq('status', 'published').maybeSingle()
  return (data?.payload as IndexPayload | undefined) ?? DEFAULT_INDEX
}

export async function uploadIndex(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const { supabase } = await requireEditor()
  const file = form.get('file')
  const pasted = String(form.get('pasted') ?? '').trim()
  const label = String(form.get('label') ?? '').trim().slice(0, 120) || null

  let text = pasted
  let name = 'pasted'
  if (file instanceof File && file.size > 0) {
    if (file.size > 2_000_000) return { ok: false, message: 'That file is over 2 MB - it cannot be an index payload.' }
    text = await file.text()
    name = file.name
  }
  if (!text) return { ok: false, message: 'Choose a .json or .csv file, or paste the JSON.' }

  let payload: unknown
  const isCsv = /\.csv$/i.test(name) || (!text.startsWith('{') && text.includes(','))
  if (isCsv) {
    const res = csvToIndex(text, await publishedPayload(supabase))
    if (!res.payload) return { ok: false, message: 'The CSV could not be read:', errors: res.errors }
    payload = res.payload
  } else {
    try {
      payload = JSON.parse(text)
    } catch (e) {
      return { ok: false, message: `That is not valid JSON: ${(e as Error).message}` }
    }
  }
  if (payload && typeof payload === 'object') delete (payload as Record<string, unknown>)._readme

  const check = validateIndex(payload)
  if (!check.ok) return { ok: false, message: 'Not saved - the file has problems:', errors: check.errors, warnings: check.warnings }

  const p = payload as IndexPayload
  const { error } = await supabase.from('index_datasets').insert({ year: p.meta.year, label: label ?? name, payload: p, status: 'draft' })
  if (error) return { ok: false, message: error.message }
  revalidatePath('/admin/index-data')
  return {
    ok: true,
    message: `Saved as a draft (${p.meta.year}, ${Object.keys(p.series).length} series × ${p.meta.readings.length} readings). Preview it, then publish.`,
    warnings: check.warnings,
  }
}

export async function publishIndex(id: string): Promise<ActionResult> {
  const { supabase } = await requireEditor()
  const { data } = await supabase.from('index_datasets').select('payload').eq('id', id).single()
  if (!data || !validateIndex(data.payload).ok) return { ok: false, message: 'That dataset no longer validates.' }
  const { error } = await supabase.rpc('publish_index_dataset', { dataset_id: id })
  if (error) return { ok: false, message: error.message }
  refreshSite()
  revalidatePath('/admin/index-data')
  return { ok: true, message: 'Published. The page now shows these figures.' }
}

export async function deleteIndex(id: string): Promise<ActionResult> {
  const { supabase } = await requireEditor()
  const { error } = await supabase.from('index_datasets').delete().eq('id', id).neq('status', 'published')
  if (error) return { ok: false, message: error.message }
  revalidatePath('/admin/index-data')
  return { ok: true }
}

/* ---------- submissions ---------- */

export async function deleteSubmission(id: number): Promise<ActionResult> {
  const { supabase } = await requireEditor()
  const { error } = await supabase.from('form_submissions').delete().eq('id', id)
  if (error) return { ok: false, message: error.message }
  revalidatePath('/admin/submissions')
  return { ok: true }
}

export async function signOut() {
  const { supabase } = await requireEditor()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
