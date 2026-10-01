'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDialog } from './dialog'

type Opts = { title?: string; message: string; confirmText?: string }

/* Guard against losing unsaved edits with the admin's styled dialog (never the
   browser's bare confirm). While `dirty`:
    - a hard navigation (refresh, tab close, cross-site link) still shows the
      browser's own beforeunload prompt - that is the only thing that can block
      synchronously there;
    - an in-app link click is blocked, then the dialog asks; on confirm we
      navigate on with the router, on cancel we stay;
    - the browser Back button is caught via a parked history entry: we re-park to
      stay put, ask, and only step back on confirm.
   Because the dialog is async, the two in-app cases block first and act after,
   which also means no native beforeunload fires on top of our dialog. */
export function useLeaveConfirm(dirty: boolean, opts: Opts) {
  const router = useRouter()
  const { confirm } = useDialog()
  const optsRef = useRef(opts)
  optsRef.current = opts

  useEffect(() => {
    if (!dirty) return
    let armed = true
    let asking = false
    const ask = () => confirm({ ...optsRef.current })

    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)

    const onClick = (e: MouseEvent) => {
      if (!armed || asking) return
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin) return          /* external: beforeunload covers it */
      if (url.href === location.href) return               /* same page / anchor: not leaving */
      e.preventDefault()
      e.stopPropagation()
      asking = true
      ask().then((ok) => {
        asking = false
        if (ok) { armed = false; router.push(url.pathname + url.search + url.hash) }
      })
    }
    document.addEventListener('click', onClick, true)

    /* Park an entry so the first Back lands here, where we can ask. */
    history.pushState(null, '', location.href)
    const onPop = () => {
      if (!armed) return
      history.pushState(null, '', location.href)           /* re-park: stay on this page */
      if (asking) return
      asking = true
      ask().then((ok) => {
        asking = false
        if (ok) { armed = false; history.go(-2) }          /* step past the park to the previous page */
      })
    }
    window.addEventListener('popstate', onPop)

    return () => {
      window.removeEventListener('beforeunload', warn)
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPop)
    }
  }, [dirty, confirm, router])
}
