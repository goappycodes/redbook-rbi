import type { NextConfig } from 'next'

/* The page is served at redbookagency.com/redbook-intelligence behind the
   WordPress proxy, so everything - assets, API routes, the admin - has to live
   under that path. Leave NEXT_PUBLIC_BASE_PATH empty to serve from the root. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

/* Assets are versioned (see lib/content/text.ts `assetV`), so production can
   cache them forever. In dev the version is constant, so immutable caching would
   pin stale CSS/JS in the browser and hide edits - serve those uncached instead. */
const assetCache =
  process.env.NODE_ENV === 'production' ? 'public, max-age=31536000, immutable' : 'no-store'

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  trailingSlash: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: assetCache }],
      },
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default nextConfig
