'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export default function SideLink({ href, exact, children }: { href: string; exact?: boolean; children: ReactNode }) {
  const path = usePathname()
  const here = exact ? path === href : path === href || path.startsWith(href + '/')
  return (
    <Link href={href} aria-current={here ? 'page' : undefined}>
      {children}
    </Link>
  )
}
