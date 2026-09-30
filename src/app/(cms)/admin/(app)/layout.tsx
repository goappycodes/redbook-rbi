import type { ReactNode } from 'react'
import { requireEditor } from '@/lib/cms/auth'
import { SECTIONS } from '@/lib/cms/schema'
import { signOut } from '../actions'
import Sidebar from './Sidebar'
import SideLink from './SideLink'

/* Every page under here is for editors only. Dynamic, because it depends on
   who is asking. */
export const dynamic = 'force-dynamic'

const PAGE = ['hero', 'about', 'pillars', 'reports', 'index', 'tools', 'exchange', 'newshub', 'request']
const SITE = ['nav', 'header', 'footer', 'seo', 'notify']

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user } = await requireEditor()
  const byKey = Object.fromEntries(SECTIONS.map((s) => [s.key, s]))
  return (
    <div className="shell">
      <Sidebar>
        <nav className="side__group" aria-label="Overview">
          <SideLink href="/admin" exact icon="dashboard">Dashboard</SideLink>
          <SideLink href="/admin/index-data" icon="index-data">Index data</SideLink>
          <SideLink href="/admin/submissions" icon="submissions">Form submissions</SideLink>
        </nav>
        <nav className="side__group" aria-label="Page sections">
          <span className="side__label">Page, top to bottom</span>
          {PAGE.map((k) => <SideLink key={k} href={`/admin/content/${k}`} icon={k}>{byKey[k].title}</SideLink>)}
        </nav>
        <nav className="side__group" aria-label="Site furniture">
          <span className="side__label">Around the page</span>
          {SITE.map((k) => <SideLink key={k} href={`/admin/content/${k}`} icon={k}>{byKey[k].title}</SideLink>)}
        </nav>
        <div className="side__foot">
          <span className="side__user">{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="side__signout" aria-label="Sign out" title="Sign out">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
          </form>
        </div>
      </Sidebar>
      <main className="main">{children}</main>
    </div>
  )
}
