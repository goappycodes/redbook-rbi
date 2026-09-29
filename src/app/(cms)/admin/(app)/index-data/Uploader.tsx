'use client'
import { useActionState, useRef } from 'react'
import { uploadIndex, type ActionResult } from '../../actions'

export default function Uploader() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(async (prev, form) => {
    const res = await uploadIndex(prev, form)
    if (res.ok) formRef.current?.reset()
    return res
  }, null)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={action}>
      {state && (
        <div className={`notice notice--${state.ok ? 'ok' : 'bad'}`} role="status">
          {state.message}
          {state.errors && state.errors.length > 0 && <ul>{state.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
        </div>
      )}
      {state?.warnings && state.warnings.length > 0 && (
        <div className="notice notice--warn">
          Worth checking:
          <ul>{state.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </div>
      )}
      <div className="row-2">
        <div className="field">
          <label htmlFor="file">File</label>
          <input id="file" name="file" className="input" type="file" accept=".json,.csv,application/json,text/csv" />
          <span className="field__help">
            The filled <code>index-template.json</code>, or the CSV version. A CSV takes its notes, region labels and axis
            from the dataset currently on the page.
          </span>
        </div>
        <div className="field">
          <label htmlFor="label">Label (optional)</label>
          <input id="label" name="label" className="input" placeholder="e.g. 2026/27 final figures" maxLength={120} />
          <span className="field__help">For telling uploads apart in the list below.</span>
        </div>
      </div>
      <details style={{ marginBottom: 14 }}>
        <summary style={{ cursor: 'pointer', color: 'var(--ink-70)' }}>…or paste JSON instead</summary>
        <textarea name="pasted" className="textarea" rows={8} style={{ marginTop: 8, fontFamily: 'ui-monospace, monospace', fontSize: 12 }} placeholder='{ "meta": { … }, "order": [ … ], "series": { … } }' />
      </details>
      <button className="btn btn--primary" disabled={pending}>{pending ? 'Checking…' : 'Check & save as draft'}</button>
    </form>
  )
}
