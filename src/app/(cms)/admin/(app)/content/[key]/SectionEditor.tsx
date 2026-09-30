'use client'
import { useEffect, useId, useMemo, useState, useTransition } from 'react'
import { sectionByKey, type Field } from '@/lib/cms/schema'
import { mediaUrl } from '@/lib/content/text'
import { createBrowserSupabase } from '@/lib/supabase/browser'
import { STORAGE_BUCKET } from '@/lib/supabase/env'
import { restoreRevision, saveSection, type ActionResult } from '../../../actions'

type Obj = Record<string, unknown>

/* ---------- blank values for a new list item ---------- */
function blank(fields: Field[]): Obj {
  const o: Obj = {}
  for (const f of fields) {
    if (f.type === 'number') o[f.key] = 0
    else if (f.type === 'checkbox') o[f.key] = false
    else if (f.type === 'select') o[f.key] = f.options[0].value
    else if (f.type === 'list') o[f.key] = []
    else if (f.type === 'group') o[f.key] = blank(f.fields)
    else o[f.key] = ''
  }
  return o
}

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function SectionEditor({
  contentKey, initial, updatedAt, revisions,
}: {
  contentKey: string
  initial: Obj
  updatedAt: string | null
  revisions: { id: number; saved_at: string }[]
}) {
  const section = sectionByKey(contentKey)!
  const [data, setData] = useState<Obj>(initial)
  const [saved, setSaved] = useState(() => JSON.stringify(initial))
  const [result, setResult] = useState<ActionResult | null>(null)
  const [pending, start] = useTransition()
  const dirty = useMemo(() => JSON.stringify(data) !== saved, [data, saved])

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function save() {
    start(async () => {
      const res = await saveSection(contentKey, data)
      setResult(res)
      if (res.ok) setSaved(JSON.stringify(data))
    })
  }

  function restore(id: number) {
    if (!confirm('Replace the live content of this section with that earlier version? The current version is kept in the history.')) return
    start(async () => {
      const res = await restoreRevision(contentKey, id)
      if (res.ok) location.reload()
      else setResult(res)
    })
  }

  return (
    <>
      {result && (
        <div className={`notice notice--${result.ok ? 'ok' : 'bad'}`} role="status">
          {result.message}
          {result.errors && <ul>{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
        </div>
      )}

      <div className="card">
        <Fields fields={section.fields} value={data} onChange={setData} />
      </div>

      {revisions.length > 0 && (
        <details className="card" style={{ marginTop: 16 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 500 }}>History ({revisions.length})</summary>
          <p className="muted" style={{ margin: '8px 0 10px' }}>Each save keeps the version it replaced. Restoring one publishes it.</p>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {revisions.map((r) => (
                  <tr key={r.id}>
                    <td>Version saved {when(r.saved_at)}</td>
                    <td><div className="actions"><button className="btn btn--sm" disabled={pending} onClick={() => restore(r.id)}>Restore</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      <div className="savebar">
        <button className="btn btn--primary" onClick={save} disabled={pending || !dirty}>
          {pending ? 'Saving…' : 'Save & publish'}
        </button>
        {dirty && <button className="btn btn--ghost" onClick={() => setData(JSON.parse(saved))} disabled={pending}>Discard changes</button>}
        <span className={`savebar__msg${dirty ? ' savebar__msg--dirty' : ''}`}>
          {dirty ? 'Unsaved changes' : updatedAt ? `Live · last saved ${when(updatedAt)}` : 'Live'}
        </span>
      </div>
    </>
  )
}

/* ---------- the recursive form ---------- */

function Fields({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v })
  return (
    <>
      {fields.map((f) => (
        <FieldInput key={f.key} field={f} value={value?.[f.key]} onChange={(v) => set(f.key, v)} />
      ))}
    </>
  )
}

function FieldInput({ field: f, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = useId()
  const help = f.help ? <span className="field__help">{f.help}</span> : null

  switch (f.type) {
    case 'text': {
      const v = String(value ?? '')
      const bad = !!(f.pattern && v && !new RegExp(f.pattern).test(v))
      return (
        <div className="field">
          <label htmlFor={id}>{f.label}</label>
          <input id={id} className="input" value={v} placeholder={f.placeholder} aria-invalid={bad || undefined} onChange={(e) => onChange(e.target.value)} />
          {bad && <span className="field__help" style={{ color: 'var(--bad)' }}>Expected something like {f.placeholder}.</span>}
          {help}
        </div>
      )
    }
    case 'textarea':
      return (
        <div className="field">
          <label htmlFor={id}>{f.label}</label>
          <textarea id={id} className="textarea" rows={f.rows ?? 3} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
          {help}
        </div>
      )
    case 'number':
      return (
        <div className="field">
          <label htmlFor={id}>{f.label}</label>
          <input id={id} className="input" type="number" step="any" value={value === '' || value == null ? '' : Number(value)} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
          {help}
        </div>
      )
    case 'checkbox':
      return (
        <div className="check">
          <label className="check__row">
            <input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
            <span>{f.label}</span>
          </label>
          {help && <div className="check__help">{help}</div>}
        </div>
      )
    case 'select':
      return (
        <div className="field">
          <label htmlFor={id}>{f.label}</label>
          <select id={id} className="select" value={String(value ?? f.options[0].value)} onChange={(e) => onChange(e.target.value)}>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {help}
        </div>
      )
    case 'image':
      return <ImageField id={id} label={f.label} help={help} value={String(value ?? '')} onChange={onChange} />
    case 'group':
      return (
        <div className="group">
          <p className="group__title">{f.label}</p>
          {help}
          <Fields fields={f.fields} value={(value as Obj) ?? {}} onChange={onChange} />
        </div>
      )
    case 'list':
      return <ListField field={f} value={Array.isArray(value) ? (value as Obj[]) : []} onChange={onChange} />
  }
}

function ListField({ field: f, value, onChange }: { field: Extract<Field, { type: 'list' }>; value: Obj[]; onChange: (v: Obj[]) => void }) {
  const [open, setOpen] = useState<number | null>(null)
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= value.length) return
    const next = value.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
    if (open === i) setOpen(j)
  }
  const remove = (i: number) => {
    const label = String(value[i]?.[f.summary] ?? '').split('\n')[0]
    if (!confirm(`Remove this ${f.itemName}${label ? ` ("${label}")` : ''}?`)) return
    onChange(value.filter((_, k) => k !== i))
    setOpen(null)
  }
  const add = () => {
    onChange([...value, blank(f.fields)])
    setOpen(value.length)
  }
  const canAdd = f.max === undefined || value.length < f.max
  const canRemove = f.min === undefined || value.length > f.min

  return (
    <div className="list">
      <div className="list__head">
        <span className="field__label">{f.label} <span className="muted">({value.length})</span></span>
        {canAdd && <button type="button" className="btn btn--sm" onClick={add}>+ Add {f.itemName}</button>}
      </div>
      {f.help && <span className="field__help">{f.help}</span>}
      {value.map((item, i) => {
        const summary = String(item?.[f.summary] ?? '').replace(/\s*\n\s*/g, ' ')
        return (
          <details key={i} className="item" open={open === i} onToggle={(e) => {
            const isOpen = (e.currentTarget as HTMLDetailsElement).open
            if (isOpen) setOpen(i)
            else if (open === i) setOpen(null)
          }}>
            <summary>
              <span className="item__n">{i + 1}</span>
              <span className="item__t">{summary || <em>Untitled {f.itemName}</em>}</span>
              <span className="item__tools" onClick={(e) => e.preventDefault()}>
                <button type="button" className="btn btn--ghost btn--icon" title="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                <button type="button" className="btn btn--ghost btn--icon" title="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)}>↓</button>
                {canRemove && <button type="button" className="btn btn--ghost btn--icon btn--danger" title="Remove" onClick={() => remove(i)}>×</button>}
              </span>
            </summary>
            {open === i && (
              <div className="item__body">
                <Fields fields={f.fields} value={item} onChange={(v) => onChange(value.map((x, k) => (k === i ? v : x)))} />
              </div>
            )}
          </details>
        )
      })}
    </div>
  )
}

function ImageField({ id, label, help, value, onChange }: { id: string; label: string; help: React.ReactNode; value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function upload(file: File) {
    setErr('')
    if (!file.type.startsWith('image/')) return setErr('That is not an image.')
    if (file.size > 8 * 1024 * 1024) return setErr('Keep images under 8 MB.')
    setBusy(true)
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '')
    const path = `uploads/${new Date().getFullYear()}/${crypto.randomUUID().slice(0, 8)}-${safe}`
    const supabase = createBrowserSupabase()
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type })
    setBusy(false)
    if (error) return setErr(error.message)
    onChange(supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl)
  }

  const src = mediaUrl(value)
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="img-field">
        <div className="img-field__thumb" style={src ? { backgroundImage: `url("${src}")` } : undefined} />
        <div className="img-field__body">
          <input id={id} className="input" value={value} placeholder="Upload, or paste an image URL" onChange={(e) => onChange(e.target.value)} />
          <div className="img-field__actions">
            <label className="btn btn--sm" style={{ cursor: busy ? 'default' : 'pointer' }}>
              {busy ? 'Uploading…' : 'Upload image'}
              <input type="file" accept="image/*" hidden disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
            </label>
            {src && <a className="btn btn--sm btn--ghost" href={src} target="_blank" rel="noopener">Open ↗</a>}
          </div>
          {err && <span className="field__help" style={{ color: 'var(--bad)' }}>{err}</span>}
          {help}
        </div>
      </div>
    </div>
  )
}
