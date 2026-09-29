'use client'
import { useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabase/browser'
import { BASE_PATH } from '@/lib/supabase/env'

const NOT_EDITOR = 'That account is not on the editor list. Ask an existing editor to add it.'

export default function LoginForm({ next, notEditor }: { next: string; notEditor: boolean }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'bad' | 'ok'; text: string } | null>(
    notEditor ? { kind: 'bad', text: NOT_EDITOR } : null,
  )
  const [mode, setMode] = useState<'signin' | 'reset'>('signin')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const supabase = createBrowserSupabase()
    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}${BASE_PATH}/admin/auth/callback?next=/admin/reset`,
      })
      setBusy(false)
      setMsg(error ? { kind: 'bad', text: error.message } : { kind: 'ok', text: 'If that address has an account, a reset link is on its way.' })
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setBusy(false)
      setMsg({ kind: 'bad', text: error.message })
      return
    }
    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) {
      await supabase.auth.signOut()
      setBusy(false)
      setMsg({ kind: 'bad', text: NOT_EDITOR })
      return
    }
    /* a full load, so the server sees the new session cookie */
    location.assign(BASE_PATH + next)
  }

  return (
    <form onSubmit={submit}>
      {msg && <div className={`notice notice--${msg.kind}`} role="alert">{msg.text}</div>}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {mode === 'signin' && (
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      )}
      <button className="btn btn--primary" style={{ width: '100%', marginTop: 6 }} disabled={busy}>
        {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Send reset link'}
      </button>
      <p className="auth__alt">
        <button type="button" onClick={() => { setMode(mode === 'signin' ? 'reset' : 'signin'); setMsg(null) }}>
          {mode === 'signin' ? 'Forgotten your password?' : 'Back to sign in'}
        </button>
      </p>
    </form>
  )
}
