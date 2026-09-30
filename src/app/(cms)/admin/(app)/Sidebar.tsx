'use client'
import { useState, type ReactNode } from 'react'

/* The admin sidebar. On desktop it is the full rail; below 860px it collapses to
   a bar with a hamburger, and the nav drops down when opened. Tapping a link
   closes it again. */
export default function Sidebar({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <aside className="side" data-open={open}>
      <div className="side__head">
        <div className="side__brand">
          RedBook Intelligence
          <small>Content manager</small>
        </div>
        <button
          type="button"
          className="side__burger"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      <div
        className="side__panel"
        onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setOpen(false) }}
      >
        {children}
      </div>
    </aside>
  )
}
