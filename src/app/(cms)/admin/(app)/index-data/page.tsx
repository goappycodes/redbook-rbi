import { requireEditor } from '@/lib/cms/auth'
import { BASE_PATH } from '@/lib/supabase/env'
import DatasetActions from './DatasetActions'
import Uploader from './Uploader'

export const metadata = { title: 'Index data' }

const when = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

export default async function IndexData() {
  const { supabase } = await requireEditor()
  const { data: rows } = await supabase
    .from('index_datasets')
    .select('id, year, label, status, created_at, published_at, payload->meta')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <>
      <div className="head">
        <div>
          <h1>Index data</h1>
          <p>
            The figures behind the chart and table in the Data section. Upload the filled template as JSON or CSV; it is
            checked before anything is saved, kept as a draft, and only reaches the page when you publish it.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card__head">
          <h2>Upload a new dataset</h2>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <a className="btn btn--sm" href={`${BASE_PATH}/templates/index-template.json`} download>Template (JSON)</a>
            <a className="btn btn--sm" href={`${BASE_PATH}/templates/index-template.csv`} download>Template (CSV)</a>
            <a className="btn btn--sm btn--ghost" href={`${BASE_PATH}/templates/index-schema.json`} target="_blank" rel="noopener">Schema</a>
          </div>
        </div>
        <Uploader />
      </div>

      <p className="section-label">Datasets</p>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Status</th><th>Year</th><th>Readings</th><th>Regions</th><th>Label</th><th>Uploaded</th><th /></tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => {
              const meta = r.meta as { readings?: string[]; regions?: { label: string }[] } | null
              return (
                <tr key={r.id}>
                  <td><span className={`badge badge--${r.status}`}>{r.status}</span></td>
                  <td className="nowrap">{r.year}</td>
                  <td className="nowrap">{meta?.readings?.join(' · ')}</td>
                  <td className="nowrap">{meta?.regions?.map((x) => x.label).join(' / ')}</td>
                  <td>{r.label}</td>
                  <td className="nowrap">
                    {when(r.created_at)}
                    {r.published_at && <div className="muted">Published {when(r.published_at)}</div>}
                  </td>
                  <td><DatasetActions id={r.id} status={r.status} previewHref={`${BASE_PATH}/preview/index/${r.id}#index`} downloadHref={`${BASE_PATH}/admin/index-data/${r.id}/download`} /></td>
                </tr>
              )
            })}
            {!rows?.length && <tr><td colSpan={7} className="empty">No datasets yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
