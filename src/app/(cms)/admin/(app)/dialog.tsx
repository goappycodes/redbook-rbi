'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

/* A small promise-based dialog system, so the admin never falls back to the
   browser's bare confirm()/alert() boxes. useDialog() gives async confirm() and
   alert(); the single modal is rendered by the provider that wraps the admin. */

type ConfirmOpts = { title?: string; message: ReactNode; confirmText?: string; cancelText?: string; danger?: boolean }
type AlertOpts = { title?: string; message: ReactNode; confirmText?: string }

type State =
  | { kind: 'confirm'; opts: ConfirmOpts; resolve: (v: boolean) => void }
  | { kind: 'alert'; opts: AlertOpts; resolve: () => void }

type Api = {
  confirm: (opts: ConfirmOpts) => Promise<boolean>
  alert: (opts: AlertOpts) => Promise<void>
}

const Ctx = createContext<Api | null>(null)

export function useDialog(): Api {
  const api = useContext(Ctx)
  if (!api) throw new Error('useDialog must be used within <DialogProvider>')
  return api
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State | null>(null)
  const confirmBtn = useRef<HTMLButtonElement>(null)

  const close = useCallback((result: boolean) => {
    setState((s) => {
      if (s) { if (s.kind === 'confirm') s.resolve(result); else s.resolve() }
      return null
    })
  }, [])

  const api = useMemo<Api>(() => ({
    confirm: (opts) => new Promise<boolean>((resolve) => setState({ kind: 'confirm', opts, resolve })),
    alert: (opts) => new Promise<void>((resolve) => setState({ kind: 'alert', opts, resolve })),
  }), [])

  useEffect(() => {
    if (!state) return
    const t = setTimeout(() => confirmBtn.current?.focus(), 0)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(false) }
      else if (e.key === 'Enter') { e.preventDefault(); close(true) }
    }
    document.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey) }
  }, [state, close])

  const o = state?.opts
  const isConfirm = state?.kind === 'confirm'
  const danger = isConfirm && (state.opts as ConfirmOpts).danger

  return (
    <Ctx.Provider value={api}>
      {children}
      {state && (
        <div className="dlg-ovl" onMouseDown={(e) => { if (e.target === e.currentTarget) close(false) }}>
          <div className="dlg-box" role={isConfirm ? 'dialog' : 'alertdialog'} aria-modal="true" aria-label={o?.title || 'Dialog'}>
            {o?.title && <h2 className="dlg-box__title">{o.title}</h2>}
            <div className="dlg-box__msg">{o?.message}</div>
            <div className="dlg-box__actions">
              {isConfirm && (
                <button type="button" className="btn btn--ghost" onClick={() => close(false)}>
                  {(o as ConfirmOpts).cancelText || 'Cancel'}
                </button>
              )}
              <button
                ref={confirmBtn}
                type="button"
                className={`btn ${danger ? 'btn--danger-solid' : 'btn--primary'}`}
                onClick={() => close(true)}
              >
                {o?.confirmText || (isConfirm ? 'Confirm' : 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
