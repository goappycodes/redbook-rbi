'use client'
import { useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabase/browser'
import { BASE_PATH } from '@/lib/supabase/env'

export default function ResetPassword() {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [msg, setMsg] = useState<{ kind: 'bad' | 'ok'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (pw.length < 10) return setMsg({ kind: 'bad', text: 'Use at least 10 characters.' })
    if (pw !== pw2) return setMsg({ kind: 'bad', text: 'The two passwords differ.' })
    setBusy(true)
    const { error } = await createBrowserSupabase().auth.updateUser({ password: pw })
    setBusy(false)
    if (error) return setMsg({ kind: 'bad', text: error.message })
    setMsg({ kind: 'ok', text: 'Password changed.' })
    setTimeout(() => location.assign(BASE_PATH + '/admin'), 900)
  }

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={submit}>
        <h1>Set a new password</h1>
        <p>At least 10 characters.</p>
        {msg && <div className={`notice notice--${msg.kind}`}>{msg.text}</div>}
        <div className="field">
          <label htmlFor="pw">New password</label>
          <input id="pw" className="input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="pw2">Repeat it</label>
          <input id="pw2" className="input" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        </div>
        <button className="btn btn--primary" style={{ width: '100%' }} disabled={busy}>Save password</button>
      </form>
    </main>
  )
}
