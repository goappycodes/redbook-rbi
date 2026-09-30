'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Icon } from './icons'

export default function SideLink({ href, exact, icon, children }: { href: string; exact?: boolean; icon?: string; children: ReactNode }) {
  const path = usePathname()
  const here = exact ? path === href : path === href || path.startsWith(href + '/')
  return (
    <Link href={href} aria-current={here ? 'page' : undefined}>
      {icon && <Icon name={icon} className="side__ico" />}
      <span>{children}</span>
    </Link>
  )
}
