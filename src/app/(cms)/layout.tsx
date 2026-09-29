import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './admin.css'

export const metadata: Metadata = {
  title: { default: 'CMS · RedBook Intelligence', template: '%s · RBi CMS' },
  robots: { index: false, follow: false },
}

export default function CmsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
