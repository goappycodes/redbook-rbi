import type { Metadata } from 'next'
import SitePage from '@/components/site/SitePage'
import { getPublishedIndex, getSiteContent } from '@/lib/content/load'
import { mediaUrl } from '@/lib/content/text'

/* Static, rebuilt when an editor saves (revalidatePath) and at most every
   five minutes regardless, so a missed revalidation heals itself. */
export const revalidate = 300

/* NEXT_PUBLIC_SITE_URL wins, unless it still points at a dev machine on a
   Vercel build - then the project's production domain is the better guess. */
function siteUrl(): URL | undefined {
  const set = process.env.NEXT_PUBLIC_SITE_URL
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (set && !(vercel && /localhost|127\.0\.0\.1/.test(set))) return new URL(set)
  return vercel ? new URL(`https://${vercel}`) : undefined
}

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteContent()
  const og = mediaUrl(seo.ogImage)
  return {
    title: seo.title,
    description: seo.description,
    metadataBase: siteUrl(),
    openGraph: { title: seo.title, description: seo.description, images: og ? [og] : undefined },
  }
}

export default async function Home() {
  const [content, index] = await Promise.all([getSiteContent(), getPublishedIndex()])
  return <SitePage content={content} index={index} />
}
