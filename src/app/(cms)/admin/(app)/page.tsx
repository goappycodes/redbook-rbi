import Link from 'next/link'
import { requireEditor } from '@/lib/cms/auth'
import { SECTIONS } from '@/lib/cms/schema'
import { BASE_PATH } from '@/lib/supabase/env'
import { Icon } from './icons'

export const metadata = { title: 'Dashboard' }

/* Same split as the sidebar: the page top-to-bottom, then the furniture. */
const PAGE = ['hero', 'about', 'pillars', 'reports', 'index', 'tools', 'exchange', 'newshub', 'request']
const SITE = ['nav', 'header', 'footer', 'seo', 'notify']

const SOURCES: Record<string, string> = {
  contribute: 'Contribute',
  contact: 'Contact',
  newshub: 'Newshub',
  request_index: 'Request full index',
}

const when = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

export default async function Dashboard() {
  const { supabase } = await requireEditor()
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString()

  const [content, published, drafts, total, week, latest] = await Promise.all([
    supabase.from('site_content').select('key, updated_at'),
    supabase.from('index_datasets').select('year, label, published_at').eq('status', 'published').maybeSingle(),
    supabase.from('index_datasets').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('form_submissions').select('id', { count: 'exact', head: true }),
    supabase.from('form_submissions').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabase.from('form_submissions').select('id, source, email, first_name, last_name, created_at').order('created_at', { ascending: false }).limit(5),
  ])
  const updated = Object.fromEntries((content.data ?? []).map((r) => [r.key, r.updated_at as string]))
  const byKey = Object.fromEntries(SECTIONS.map((s) => [s.key, s]))

  const tile = (k: string) => {
    const s = byKey[k]
    if (!s) return null
    return (
      <Link key={k} className="tile" href={`/admin/content/${k}`}>
        <span className="tile__ico"><Icon name={k} /></span>
        <span className="tile__body">
          <h3>{s.title}</h3>
          <p>{s.description}</p>
          <small>Updated {when(updated[k])}</small>
        </span>
      </Link>
    )
  }

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

      <div className="stat-list">
        <Link href="/admin/submissions">
          <span className="stat-list__ico"><Icon name="recent" /></span>
          <span className="stat-list__label">Submissions, last 7 days</span>
          <b>{week.count ?? 0}</b>
        </Link>
        <Link href="/admin/submissions">
          <span className="stat-list__ico"><Icon name="submissions" /></span>
          <span className="stat-list__label">Submissions, all time</span>
          <b>{total.count ?? 0}</b>
        </Link>
        <Link href="/admin/index-data">
          <span className="stat-list__ico"><Icon name="index" /></span>
          <span className="stat-list__label">Index on the page{published.data?.label && <small>{published.data.label}</small>}</span>
          <b>{published.data?.year ?? 'None'}</b>
        </Link>
        <Link href="/admin/index-data">
          <span className="stat-list__ico"><Icon name="index-data" /></span>
          <span className="stat-list__label">Index drafts</span>
          <b>{drafts.count ?? 0}</b>
        </Link>
      </div>

      <div className="dash-recent__head">
        <p className="section-label" style={{ margin: 0 }}>Latest submissions</p>
        {!!latest.data?.length && <Link className="btn btn--sm btn--ghost" href="/admin/submissions">View all →</Link>}
      </div>
      <div className="feed">
        {latest.data?.length ? (
          latest.data.map((r) => {
            const name = [r.first_name, r.last_name].filter(Boolean).join(' ')
            return (
              <Link key={r.id} href="/admin/submissions">
                <span className="badge">{SOURCES[r.source] ?? r.source}</span>
                <span className="feed__main"><b>{r.email}</b>{name && <span className="muted"> · {name}</span>}</span>
                <span className="feed__time">{when(r.created_at)}</span>
              </Link>
            )
          })
        ) : (
          <div className="empty">No submissions yet.</div>
        )}
      </div>

      <p className="section-label">Page, top to bottom</p>
      <div className="grid-cards">{PAGE.map(tile)}</div>

      <p className="section-label">Around the page</p>
      <div className="grid-cards">{SITE.map(tile)}</div>
    </>
  )
}
