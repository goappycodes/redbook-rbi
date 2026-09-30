/* The editable content of the page, one type per `site_content` row.
   Text fields accept two conventions, applied by `rt()`:
   - a newline is an authored line break
   - "RBi" is always wrapped so tracked (uppercase) styles cannot turn it into "RBI" */

export type Link = { label: string; href: string }

export type HeaderContent = {
  logoHref: string
  /** Optional silhouette that replaces the built-in logo mask. Empty keeps the default. */
  logoImage: string
  left: Link[]
  right: (Link & { active?: boolean })[]
  menuLabel: string
}

export type NavContent = {
  items: { anchor: string; long: string; short: string }[]
}

export type HeroContent = {
  eyebrow: string
  /** One line per row - the type is tuned to three. */
  headline: string
  standfirst: string
  buttonLabel: string
  buttonHref: string
}

export type Figure = { count: number; prefix: string; suffix: string; label: string }

export type AboutContent = {
  eyebrow: string
  headline: string
  body: string
  figures: Figure[]
  footnote: string
}

export type PillarIcon = 'research' | 'data' | 'tools'

export type PillarsContent = {
  eyebrow: string
  headline: string
  cards: { label: string; body: string; linkLabel: string; href: string; icon: PillarIcon }[]
}

export type ReportCard = {
  /** An ordinal ("01") or a fixed line ("RBi Report"). Empty for none. */
  label: string
  title: string
  /** MM/YY */
  published: string
  blurb: string
  image: string
  href: string
  newTab: boolean
  locked: boolean
}

export type FutureReport = {
  ordinal: string
  title: string
  description: string
  /** MM/YY */
  due: string
}

export type ReportYear = {
  year: string
  reports: ReportCard[]
  future: FutureReport[]
}

export type ReportsContent = {
  eyebrow: string
  headline: string
  standfirst: string
  yearLabel: string
  hintLabel: string
  lockedTitle: string
  futureHeading: string
  /** Newest first - the first one is on show when the page loads. */
  years: ReportYear[]
}

export type IndexContent = {
  eyebrow: string
  headline: string
  standfirst: string
  customiseLabel: string
  pickerNote: string
  pickerNoteFull: string
  clearLabel: string
  baseColumnLabel: string
  exportLabel: string
  requestLabel: string
}

export type Tool = {
  ordinal: string
  title: string
  body: string
  state: 'live' | 'locked'
  linkLabel: string
  href: string
}

export type ToolsContent = {
  eyebrow: string
  headline: string
  standfirst: string
  lockedLabel: string
  tools: Tool[]
}

export type ExchangeColumn = {
  eyebrow: string
  heading: string
  standfirst: string
  instruction: string
  placeholder: string
  buttonLabel: string
  successMessage: string
}

export type ExchangeContent = {
  contribute: ExchangeColumn
  contact: ExchangeColumn
}

export type JournalEntry = { date: string; title: string; kind: string; href: string }

export type NewshubContent = {
  eyebrow: string
  headline: string
  placeholder: string
  buttonLabel: string
  successMessage: string
  tiles: { image: string; label: string; body: string }[]
  /** When true, the journal list is pulled live from WordPress `press` posts. */
  journalFromWordpress: boolean
  journal: JournalEntry[]
}

export type FooterContent = {
  tagline: string
  /** Optional footer logo image. Empty keeps the built-in mark. */
  mark: string
  groups: { title: string; links: Link[] }[]
  legal: string
}

export type RequestModalContent = {
  title: string
  standfirst: string
  firstName: string
  lastName: string
  company: string
  position: string
  email: string
  submitLabel: string
  successMessage: string
}

export type SeoContent = {
  title: string
  description: string
  ogImage: string
}

export type SiteContent = {
  seo: SeoContent
  header: HeaderContent
  nav: NavContent
  hero: HeroContent
  about: AboutContent
  pillars: PillarsContent
  reports: ReportsContent
  index: IndexContent
  tools: ToolsContent
  exchange: ExchangeContent
  newshub: NewshubContent
  footer: FooterContent
  request: RequestModalContent
}

export type ContentKey = keyof SiteContent
