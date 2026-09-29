import type { Metadata } from 'next'
import SitePage from '@/components/site/SitePage'
import { getPublishedIndex, getSiteContent } from '@/lib/content/load'
import { mediaUrl } from '@/lib/content/text'

/* Static, rebuilt when an editor saves (revalidatePath) and at most every
   five minutes regardless, so a missed revalidation heals itself. */
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteContent()
  const og = mediaUrl(seo.ogImage)
  return {
    title: seo.title,
    description: seo.description,
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
    openGraph: { title: seo.title, description: seo.description, images: og ? [og] : undefined },
  }
}

export default async function Home() {
  const [content, index] = await Promise.all([getSiteContent(), getPublishedIndex()])
  return <SitePage content={content} index={index} />
}
