import Link from 'next/link'
import { requireEditor } from '@/lib/cms/auth'
import { SECTIONS } from '@/lib/cms/schema'
import { BASE_PATH } from '@/lib/supabase/env'

export const metadata = { title: 'Dashboard' }

const when = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

export default async function Dashboard() {
  const { supabase } = await requireEditor()
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString()

  const [content, published, drafts, total, week] = await Promise.all([
    supabase.from('site_content').select('key, updated_at'),
    supabase.from('index_datasets').select('year, label, published_at').eq('status', 'published').maybeSingle(),
    supabase.from('index_datasets').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('form_submissions').select('id', { count: 'exact', head: true }),
    supabase.from('form_submissions').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
  ])
  const updated = Object.fromEntries((content.data ?? []).map((r) => [r.key, r.updated_at as string]))

  return (
    <>
      <div className="head">
        <div>
          <h1>Dashboard</h1>
          <p>Everything on the RedBook Intelligence page. Saving a section publishes it straight away; the index figures go through a draft and a preview first.</p>
        </div>
        <div className="head__actions">
          <a className="btn" href={`${BASE_PATH}/`} target="_blank" rel="noopener">View page ↗</a>
        </div>
      </div>

      <div className="stat-row">
        <Link className="stat-box" href="/admin/submissions" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span>Submissions, last 7 days</span>
          <b>{week.count ?? 0}</b>
        </Link>
        <Link className="stat-box" href="/admin/submissions" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span>Submissions, all time</span>
          <b>{total.count ?? 0}</b>
        </Link>
        <Link className="stat-box" href="/admin/index-data" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span>Index on the page</span>
          <b>{published.data?.year ?? 'None'}</b>
          <small className="muted">{published.data?.label}</small>
        </Link>
        <Link className="stat-box" href="/admin/index-data" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span>Index drafts</span>
          <b>{drafts.count ?? 0}</b>
        </Link>
      </div>

      <p className="section-label">Sections</p>
      <div className="grid-cards">
        {SECTIONS.map((s) => (
          <Link key={s.key} className="tile" href={`/admin/content/${s.key}`}>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
            <small>Updated {when(updated[s.key])}</small>
          </Link>
        ))}
      </div>
    </>
  )
}
