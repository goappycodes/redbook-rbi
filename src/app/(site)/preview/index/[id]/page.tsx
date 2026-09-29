import { notFound, redirect } from 'next/navigation'
import SitePage from '@/components/site/SitePage'
import { getSiteContent } from '@/lib/content/load'
import { validateIndex, type IndexPayload } from '@/lib/index-data'
import { createSessionClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Preview · RedBook Intelligence', robots: { index: false } }

/* The live page with an unpublished index payload in place of the published
   one - "render a preview from the uploaded file before it goes live". */
export default async function PreviewIndex({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSessionClient()
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) redirect(`/admin/login?next=/preview/index/${id}`)

  const { data } = await supabase.from('index_datasets').select('year, label, status, payload').eq('id', id).maybeSingle()
  if (!data) notFound()
  const check = validateIndex(data.payload)
  if (!check.ok) notFound()

  const content = await getSiteContent()
  const banner = (
    <div style={{ position: 'fixed', left: 12, bottom: 12, zIndex: 130, background: '#2B0815', color: '#fff', font: '500 12px/1.4 Barlow, sans-serif', letterSpacing: 1, padding: '10px 14px', borderRadius: 4 }}>
      PREVIEW · Index {data.year}{data.label ? ` · ${data.label}` : ''} · {data.status.toUpperCase()}
    </div>
  )
  return <SitePage content={content} index={data.payload as IndexPayload} banner={banner} />
}
