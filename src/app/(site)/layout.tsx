import type { ReactNode } from 'react'
import { assetV } from '@/lib/content/text'
import { BASE_PATH } from '@/lib/supabase/env'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href={assetV('/assets/css/01-foundation.css')} />
        <link rel="stylesheet" href={assetV('/assets/css/02-page.css')} />
        <link rel="stylesheet" href={assetV('/assets/css/03-rail.css')} />
      </head>
      <body data-base={BASE_PATH}>{children}</body>
    </html>
  )
}
