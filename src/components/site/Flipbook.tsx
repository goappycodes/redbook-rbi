'use client'
import { useEffect, useState } from 'react'

/* Opens a report's WordPress 3D FlipBook in a modal. Any element on the page
   with data-flipbook-id (the report covers) opens it; the bare WP embed page
   (flipbook-embed) renders just the book, which we iframe here. */
const EMBED = process.env.NEXT_PUBLIC_FLIPBOOK_EMBED || 'https://redbookagency.com/flipbook-embed/'

export default function Flipbook() {
  const [open, setOpen] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.('[data-flipbook-id]') as HTMLElement | null
      if (!el) return
      const id = el.getAttribute('data-flipbook-id')
      if (!id) return
      e.preventDefault()
      setOpen({ id, title: el.getAttribute('data-flipbook-title') || 'Report' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    document.addEventListener('keydown', onKey)
    /* Lock the background with position:fixed rather than the prototype's
       rbScrollLock - that one cancels touchmove, which would also kill the
       flipbook's swipe navigation inside the iframe on mobile. */
    const y = window.scrollY
    const b = document.body.style
    const h = document.documentElement.style
    const prev = { pos: b.position, top: b.top, width: b.width, bov: b.overflow, hov: h.overflow }
    b.position = 'fixed'; b.top = `-${y}px`; b.width = '100%'; b.overflow = 'hidden'; h.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      b.position = prev.pos; b.top = prev.top; b.width = prev.width; b.overflow = prev.bov; h.overflow = prev.hov
      window.scrollTo(0, y)
    }
  }, [open])

  if (!open) return null
  const src = `${EMBED}${EMBED.includes('?') ? '&' : '?'}id=${encodeURIComponent(open.id)}`
  return (
    <div className="fbx" role="dialog" aria-modal="true" aria-label={open.title} onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(null) }}>
      <button className="fbx__x" type="button" aria-label="Close" onClick={() => setOpen(null)}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
      <iframe className="fbx__frame" src={src} title={open.title} loading="lazy" allow="fullscreen" allowFullScreen />
    </div>
  )
}
