'use client'
import { useTransition } from 'react'
import { deleteIndex, publishIndex } from '../../actions'

export default function DatasetActions({ id, status, previewHref, downloadHref }: { id: string; status: string; previewHref: string; downloadHref: string }) {
  const [pending, start] = useTransition()

  const publish = () => {
    if (!confirm('Publish this dataset? It replaces the figures on the live page straight away.')) return
    start(async () => {
      const res = await publishIndex(id)
      if (!res.ok) alert(res.message)
    })
  }
  const remove = () => {
    if (!confirm('Delete this dataset? This cannot be undone.')) return
    start(async () => {
      const res = await deleteIndex(id)
      if (!res.ok) alert(res.message)
    })
  }

  return (
    <div className="actions">
      <a className="btn btn--sm" href={previewHref} target="_blank" rel="noopener">Preview ↗</a>
      <a className="btn btn--sm btn--ghost" href={downloadHref}>JSON</a>
      {status !== 'published' && (
        <>
          <button className="btn btn--sm btn--primary" disabled={pending} onClick={publish}>Publish</button>
          <button className="btn btn--sm btn--ghost btn--danger" disabled={pending} onClick={remove}>Delete</button>
        </>
      )}
    </div>
  )
}
