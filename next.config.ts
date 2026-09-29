import type { NextConfig } from 'next'

/* The page is served at redbookagency.com/redbook-intelligence behind the
   WordPress proxy, so everything - assets, API routes, the admin - has to live
   under that path. Leave NEXT_PUBLIC_BASE_PATH empty to serve from the root. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  trailingSlash: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default nextConfig
