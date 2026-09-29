import type { ReactNode } from 'react'
import { requireEditor } from '@/lib/cms/auth'
import { SECTIONS } from '@/lib/cms/schema'
import { BASE_PATH } from '@/lib/supabase/env'
import { signOut } from '../actions'
import SideLink from './SideLink'

/* Every page under here is for editors only. Dynamic, because it depends on
   who is asking. */
export const dynamic = 'force-dynamic'

const PAGE = ['hero', 'about', 'pillars', 'reports', 'index', 'tools', 'exchange', 'newshub', 'request']
const SITE = ['nav', 'header', 'footer', 'seo']

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user } = await requireEditor()
  const byKey = Object.fromEntries(SECTIONS.map((s) => [s.key, s]))
  return (
    <div className="shell">
      <aside className="side">
        <div className="side__brand">
          RedBook Intelligence
          <small>Content manager</small>
        </div>
        <nav className="side__group" aria-label="Overview">
          <SideLink href="/admin" exact>Dashboard</SideLink>
          <SideLink href="/admin/index-data">Index data</SideLink>
          <SideLink href="/admin/submissions">Form submissions</SideLink>
        </nav>
        <nav className="side__group" aria-label="Page sections">
          <span className="side__label">Page, top to bottom</span>
          {PAGE.map((k) => <SideLink key={k} href={`/admin/content/${k}`}>{byKey[k].title}</SideLink>)}
        </nav>
        <nav className="side__group" aria-label="Site furniture">
          <span className="side__label">Around the page</span>
          {SITE.map((k) => <SideLink key={k} href={`/admin/content/${k}`}>{byKey[k].title}</SideLink>)}
        </nav>
        <div className="side__foot">
          <a href={`${BASE_PATH}/`} target="_blank" rel="noopener">View the live page ↗</a>
          <span>{user.email}</span>
          <form action={signOut}><button type="submit">Sign out</button></form>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  )
}
