import type { ReactNode } from 'react'

/* One line icon per nav item / section, keyed by route (overview) or section key.
   Feather style: 24 viewBox, stroke currentColor, so they take their parent's
   colour. Shared by the sidebar and the dashboard. */
export const ICONS: Record<string, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
  'index-data': <><line x1="4" y1="20" x2="20" y2="20" /><rect x="6" y="10" width="3" height="8" rx="0.5" /><rect x="11" y="6" width="3" height="12" rx="0.5" /><rect x="16" y="13" width="3" height="5" rx="0.5" /></>,
  submissions: <><path d="M4 13l2.5-8h11L20 13" /><path d="M4 13v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /><path d="M4 13h4l1.5 2.5h5L16 13h4" /></>,
  recent: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></>,
  hero: <><rect x="3" y="4" width="18" height="16" rx="1.5" /><circle cx="8.5" cy="10" r="1.8" /><path d="M21 16l-5-4.5-6 5.5" /></>,
  about: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
  pillars: <><path d="M5 4v16M12 4v16M19 4v16" /></>,
  reports: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></>,
  index: <><polyline points="3 16 9 10 13 14 21 6" /><polyline points="15 6 21 6 21 12" /></>,
  tools: <path d="M15 6a3.5 3.5 0 0 0 4.5 4.5L20 10a6 6 0 0 1-8 8l-6.3 6.3a2 2 0 0 1-2.8-2.8L9 15a6 6 0 0 1 8-8z" transform="translate(0 -1)" />,
  exchange: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></>,
  newshub: <><path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 5a15 15 0 0 1 15 15" /><circle cx="5" cy="19" r="1.2" /></>,
  request: <><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9.5 4a1.5 1.5 0 0 1 3 0" /><path d="M9 11h6M9 15h4" /></>,
  nav: <><path d="M9 6h12M9 12h12M9 18h12" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></>,
  header: <><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M3 9h18" /></>,
  footer: <><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M3 15h18" /></>,
  seo: <><circle cx="11" cy="11" r="7" /><path d="M20.5 20.5L16 16" /></>,
  notify: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const inner = ICONS[name]
  if (!inner) return null
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {inner}
    </svg>
  )
}
