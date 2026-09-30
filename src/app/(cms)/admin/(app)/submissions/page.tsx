import Link from 'next/link'
import { requireEditor } from '@/lib/cms/auth'
import { BASE_PATH } from '@/lib/supabase/env'
import DeleteSubmission from './DeleteSubmission'

export const metadata = { title: 'Form submissions' }

const SOURCES: Record<string, string> = {
  contribute: 'Contribute',
  contact: 'Contact',
  newshub: 'Newshub',
  request_index: 'Request full index',
}
const PAGE = 100

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default async function Submissions({ searchParams }: { searchParams: Promise<{ source?: string; page?: string }> }) {
  const sp = await searchParams
  const source = sp.source && SOURCES[sp.source] ? sp.source : undefined
  const page = Math.max(1, Number(sp.page) || 1)
  const { supabase } = await requireEditor()

  let q = supabase
    .from('form_submissions')
    .select('id, source, email, first_name, last_name, company, position, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1)
  if (source) q = q.eq('source', source)
  const { data: rows, count } = await q
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE))
  const href = (s?: string, p?: number) => {
    const u = new URLSearchParams()
    if (s) u.set('source', s)
    if (p && p > 1) u.set('page', String(p))
    const qs = u.toString()
    return `/admin/submissions${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <div className="head">
        <div>
          <h1>Form submissions</h1>
          <p>Everything sent from the four capture points on the page. Each one also emails the RedBook inbox when notifications are configured.</p>
        </div>
        <div className="head__actions">
          <a className="btn" href={`${BASE_PATH}/admin/submissions/export${source ? `?source=${source}` : ''}`}>Export CSV</a>
        </div>
      </div>

      <nav className="filters" aria-label="Filter by form">
        <Link className="btn btn--sm" href={href()} aria-current={!source ? 'page' : undefined}>All</Link>
        {Object.entries(SOURCES).map(([k, v]) => (
          <Link key={k} className="btn btn--sm" href={href(k)} aria-current={source === k ? 'page' : undefined}>{v}</Link>
        ))}
      </nav>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Received</th><th>Form</th><th>Email</th><th>First name</th><th>Last name</th><th>Company</th><th>Position</th><th /></tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id}>
                <td className="nowrap">{when(r.created_at)}</td>
                <td className="nowrap"><span className="badge">{SOURCES[r.source] ?? r.source}</span></td>
                <td><a href={`mailto:${r.email}`}>{r.email}</a></td>
                <td>{r.first_name || <span className="muted">—</span>}</td>
                <td>{r.last_name || <span className="muted">—</span>}</td>
                <td>{r.company || <span className="muted">—</span>}</td>
                <td>{r.position || <span className="muted">—</span>}</td>
                <td><div className="actions"><DeleteSubmission id={r.id} /></div></td>
              </tr>
            ))}
            {!rows?.length && <tr><td colSpan={8} className="empty">Nothing yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="filters" style={{ marginTop: 14, alignItems: 'center' }}>
          {page > 1 && <Link className="btn btn--sm" href={href(source, page - 1)}>← Newer</Link>}
          <span className="muted">Page {page} of {pages} · {count} total</span>
          {page < pages && <Link className="btn btn--sm" href={href(source, page + 1)}>Older →</Link>}
        </div>
      )}
    </>
  )
}
