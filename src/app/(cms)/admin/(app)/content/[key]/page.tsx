import { notFound } from 'next/navigation'
import { requireEditor } from '@/lib/cms/auth'
import { sectionByKey } from '@/lib/cms/schema'
import { withDefaults } from '@/lib/content/load'
import type { ContentKey } from '@/lib/content/types'
import { BASE_PATH } from '@/lib/supabase/env'
import SectionEditor from './SectionEditor'

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  return { title: sectionByKey(key)?.title ?? 'Section' }
}

export default async function EditSection({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const section = sectionByKey(key)
  if (!section) notFound()
  const { supabase } = await requireEditor()

  const [{ data: row }, { data: revisions }] = await Promise.all([
    supabase.from('site_content').select('data, updated_at').eq('key', key).maybeSingle(),
    supabase.from('site_content_revisions').select('id, saved_at').eq('key', key).order('id', { ascending: false }).limit(15),
  ])

  return (
    <>
      <div className="head">
        <div>
          <h1>{section.title}</h1>
          <p>{section.description}</p>
        </div>
        <div className="head__actions">
          <a className="btn" href={`${BASE_PATH}/${section.anchor ? `#${section.anchor}` : ''}`} target="_blank" rel="noopener">
            View page ↗
          </a>
        </div>
      </div>
      <SectionEditor
        contentKey={key}
        initial={withDefaults(key as ContentKey, row?.data) as unknown as Record<string, unknown>}
        updatedAt={row?.updated_at ?? null}
        revisions={revisions ?? []}
      />
    </>
  )
}
