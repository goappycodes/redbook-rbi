'use client'
import { useEffect } from 'react'

/* The prototype's scripts rewrite parts of the DOM (the chart, the table, the
   picker, reveal classes). Run before hydration they would make React's view of
   the page disagree with the real one, so they are injected afterwards, in
   order, exactly once. Nothing on the page re-renders after that. */
export default function LegacyScripts({ srcs }: { srcs: string[] }) {
  useEffect(() => {
    const w = window as unknown as { __rbScripts?: boolean }
    if (w.__rbScripts) return
    w.__rbScripts = true
    for (const src of srcs) {
      const s = document.createElement('script')
      s.src = src
      s.async = false /* keeps document order, as `defer` did */
      document.body.appendChild(s)
    }
  }, [srcs])
  return null
}
