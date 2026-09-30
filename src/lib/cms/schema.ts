import type { ContentKey } from '@/lib/content/types'

/* What the editor shows for each section, and the shape the server will accept.
   Order here is the order in the form. Keep in step with content/types.ts. */

export type Field =
  | { type: 'text'; key: string; label: string; help?: string; placeholder?: string; pattern?: string }
  | { type: 'textarea'; key: string; label: string; help?: string; rows?: number }
  | { type: 'number'; key: string; label: string; help?: string }
  | { type: 'checkbox'; key: string; label: string; help?: string }
  | { type: 'select'; key: string; label: string; help?: string; options: { value: string; label: string }[] }
  | { type: 'image'; key: string; label: string; help?: string }
  | { type: 'group'; key: string; label: string; help?: string; fields: Field[] }
  | {
      type: 'list'
      key: string
      label: string
      help?: string
      fields: Field[]
      /** Which field names an item in the collapsed list. */
      summary: string
      itemName: string
      min?: number
      max?: number
    }

export type SectionSchema = { key: ContentKey; title: string; description: string; anchor?: string; fields: Field[] }

const BREAKS = 'Press Enter for a line break.'
const HREF = 'A page anchor such as #reports, or a full https:// link. Leave # while there is nowhere to go.'
const MMYY = '^(0[1-9]|1[0-2])/\\d{2}$'

const link = (label = 'Link'): Field[] => [
  { type: 'text', key: 'label', label: `${label} label` },
  { type: 'text', key: 'href', label: `${label} target`, help: HREF },
]

export const SECTIONS: SectionSchema[] = [
  {
    key: 'hero',
    title: 'Hero',
    anchor: 'hero',
    description: 'The opening screen. The background is generated - there is nothing to upload.',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      { type: 'textarea', key: 'headline', label: 'Headline', rows: 3, help: 'One line per row. The type is tuned to three lines - check the page after changing it.' },
      { type: 'textarea', key: 'standfirst', label: 'Standfirst', rows: 2, help: 'Use an en dash (–), not a hyphen.' },
      { type: 'text', key: 'buttonLabel', label: 'Button label' },
      { type: 'text', key: 'buttonHref', label: 'Button target', help: HREF },
    ],
  },
  {
    key: 'about',
    title: 'What we stand for',
    anchor: 'about',
    description: 'Headline, body and the four counting figures.',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      { type: 'textarea', key: 'headline', label: 'Headline', rows: 2, help: 'Measured to sit one clause per line above 700px. A much longer headline changes the section.' },
      { type: 'textarea', key: 'body', label: 'Body', rows: 6 },
      {
        type: 'list', key: 'figures', label: 'Figures', itemName: 'figure', summary: 'label', min: 4, max: 4,
        help: 'Four figures. The number counts up on scroll - enter the final value.',
        fields: [
          { type: 'number', key: 'count', label: 'Number' },
          { type: 'text', key: 'prefix', label: 'Prefix', placeholder: '£' },
          { type: 'text', key: 'suffix', label: 'Suffix', placeholder: 'B+' },
          { type: 'textarea', key: 'label', label: 'Label', rows: 2, help: `Two lines. ${BREAKS}` },
        ],
      },
      { type: 'text', key: 'footnote', label: 'Footnote' },
    ],
  },
  {
    key: 'pillars',
    title: 'Intelligence hub',
    anchor: 'pillars',
    description: 'The three pillar cards.',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      { type: 'text', key: 'headline', label: 'Headline' },
      {
        type: 'list', key: 'cards', label: 'Cards', itemName: 'card', summary: 'label', min: 3, max: 3,
        fields: [
          { type: 'text', key: 'label', label: 'Label' },
          { type: 'textarea', key: 'body', label: 'Body', rows: 3 },
          { type: 'text', key: 'linkLabel', label: 'Link label' },
          { type: 'text', key: 'href', label: 'Link target', help: HREF },
          {
            type: 'select', key: 'icon', label: 'Icon',
            options: [
              { value: 'research', label: 'Research - page under a lens' },
              { value: 'data', label: 'Data - rising plot' },
              { value: 'tools', label: 'Tools - calculator' },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'reports',
    title: 'Research reports',
    anchor: 'reports',
    description: 'Report cards and future reports, grouped by year. The first year is the one on show when the page loads.',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      { type: 'text', key: 'headline', label: 'Headline' },
      { type: 'textarea', key: 'standfirst', label: 'Standfirst', rows: 2 },
      {
        type: 'list', key: 'years', label: 'Years', itemName: 'year', summary: 'year',
        help: 'Newest first - that order is the order of the year selector.',
        fields: [
          { type: 'text', key: 'year', label: 'Year', placeholder: '2026/27', pattern: '^\\d{4}/\\d{2}$' },
          {
            type: 'list', key: 'reports', label: 'Report cards', itemName: 'report', summary: 'title',
            help: 'Titles are not length-capped: every title in the year is raised to the tallest.',
            fields: [
              { type: 'text', key: 'label', label: 'Label', help: 'An ordinal ("01") or a fixed line ("RBi Report"). Leave empty for none.' },
              { type: 'text', key: 'title', label: 'Title' },
              { type: 'text', key: 'published', label: 'Published (MM/YY)', placeholder: '10/25', pattern: MMYY },
              { type: 'textarea', key: 'blurb', label: 'Blurb', rows: 3, help: 'Optional. Hidden on phones.' },
              { type: 'image', key: 'image', label: 'Cover image', help: '3:4 portrait, e.g. 640 × 853.' },
              { type: 'text', key: 'alt', label: 'Cover alt text', help: 'Describes the cover for screen readers. Leave empty if it is purely decorative.' },
              { type: 'text', key: 'href', label: 'Link', help: HREF },
              { type: 'checkbox', key: 'newTab', label: 'Open the link in a new tab' },
              { type: 'checkbox', key: 'locked', label: 'Locked', help: 'Decorative only - shows a padlock and removes the link. There is no access control behind it.' },
            ],
          },
          {
            type: 'list', key: 'future', label: 'Future reports', itemName: 'future report', summary: 'title',
            help: 'Shown under the cards for this year only.',
            fields: [
              { type: 'text', key: 'ordinal', label: 'Ordinal', placeholder: '04' },
              { type: 'text', key: 'title', label: 'Title' },
              { type: 'textarea', key: 'description', label: 'Description', rows: 2, help: 'Hidden on phones.' },
              { type: 'text', key: 'due', label: 'Due (MM/YY)', placeholder: '07/26', pattern: MMYY },
            ],
          },
        ],
      },
      { type: 'text', key: 'yearLabel', label: '"Year" label' },
      { type: 'text', key: 'hintLabel', label: 'Hover hint', help: 'Shown over a cover on hover.' },
      { type: 'text', key: 'lockedTitle', label: 'Locked card tooltip' },
      { type: 'text', key: 'futureHeading', label: 'Future reports heading' },
    ],
  },
  {
    key: 'index',
    title: 'The RedBook Index',
    anchor: 'index',
    description: 'The words around the chart. The figures themselves are uploaded under Index data.',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      { type: 'text', key: 'headline', label: 'Headline' },
      { type: 'textarea', key: 'standfirst', label: 'Standfirst', rows: 2 },
      { type: 'text', key: 'customiseLabel', label: 'Picker button' },
      { type: 'text', key: 'pickerNote', label: 'Picker note' },
      { type: 'text', key: 'pickerNoteFull', label: 'Picker note when full' },
      { type: 'text', key: 'clearLabel', label: 'Clear label' },
      { type: 'text', key: 'baseColumnLabel', label: '"From base" column heading', help: 'The other column heading comes from the data (the penultimate reading).' },
      { type: 'text', key: 'exportLabel', label: 'Export action' },
      { type: 'text', key: 'requestLabel', label: 'Request action', help: 'Opens the request form - edit its copy under Request form.' },
    ],
  },
  {
    key: 'tools',
    title: 'Tools',
    anchor: 'tools',
    description: 'The three tool boxes.',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      { type: 'text', key: 'headline', label: 'Headline' },
      { type: 'textarea', key: 'standfirst', label: 'Standfirst', rows: 2 },
      { type: 'text', key: 'lockedLabel', label: 'Locked label' },
      {
        type: 'list', key: 'tools', label: 'Tools', itemName: 'tool', summary: 'ordinal', max: 3,
        fields: [
          { type: 'text', key: 'ordinal', label: 'Ordinal', placeholder: '01' },
          { type: 'select', key: 'state', label: 'State', options: [{ value: 'live', label: 'Live' }, { value: 'locked', label: 'Locked - in development' }] },
          { type: 'textarea', key: 'title', label: 'Title', rows: 2, help: `Live tools only. Two lines. ${BREAKS}` },
          { type: 'textarea', key: 'body', label: 'Body', rows: 3, help: 'Live tools only.' },
          { type: 'text', key: 'linkLabel', label: 'Link label', help: 'Live tools only.' },
          { type: 'text', key: 'href', label: 'Link target', help: HREF },
        ],
      },
    ],
  },
  {
    key: 'exchange',
    title: 'Contribute / Contact',
    anchor: 'exchange',
    description: 'The two capture columns. Keep them structurally parallel - above 980px their rows line up across the divide.',
    fields: (['contribute', 'contact'] as const).map((k) => ({
      type: 'group' as const,
      key: k,
      label: k === 'contribute' ? 'Left - Contribute' : 'Right - Contact',
      fields: [
        { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
        { type: 'textarea', key: 'heading', label: 'Heading', rows: 2, help: `Two lines. ${BREAKS}` },
        { type: 'text', key: 'standfirst', label: 'Standfirst' },
        { type: 'text', key: 'instruction', label: 'Instruction' },
        { type: 'text', key: 'placeholder', label: 'Field placeholder' },
        { type: 'text', key: 'buttonLabel', label: 'Button label' },
        { type: 'text', key: 'successMessage', label: 'Thank-you message' },
      ] as Field[],
    })),
  },
  {
    key: 'newshub',
    title: 'Newshub',
    anchor: 'newsletter',
    description: 'Newsletter sign-up, the two tiles and the journal list.',
    fields: [
      { type: 'text', key: 'eyebrow', label: 'Eyebrow' },
      { type: 'text', key: 'headline', label: 'Headline' },
      { type: 'text', key: 'placeholder', label: 'Field placeholder' },
      { type: 'text', key: 'buttonLabel', label: 'Button label' },
      { type: 'text', key: 'successMessage', label: 'Thank-you message' },
      {
        type: 'list', key: 'tiles', label: 'Tiles', itemName: 'tile', summary: 'label', min: 2, max: 2,
        fields: [
          { type: 'image', key: 'image', label: 'Image', help: 'Square.' },
          { type: 'text', key: 'alt', label: 'Image alt text', help: 'Describes the image for screen readers. Leave empty if decorative.' },
          { type: 'textarea', key: 'label', label: 'Label', rows: 2, help: 'Press Enter where the label should break on phones only, so the two tiles stay aligned.' },
          { type: 'textarea', key: 'body', label: 'Body', rows: 2 },
        ],
      },
      {
        type: 'checkbox', key: 'journalFromWordpress', label: 'Pull journal from WordPress',
        help: 'When on, the journal list is pulled live from the WordPress “press” posts (newest first) and the entries below are ignored. If WordPress is unreachable, the entries below are used instead.',
      },
      {
        type: 'list', key: 'journal', label: 'Journal', itemName: 'entry', summary: 'title',
        help: 'Used when “Pull journal from WordPress” is off (or as the fallback when it is on).',
        fields: [
          { type: 'text', key: 'date', label: 'Date', placeholder: 'Sep 2026' },
          { type: 'text', key: 'title', label: 'Title' },
          { type: 'text', key: 'kind', label: 'Kind', placeholder: 'Journal or Article' },
          { type: 'text', key: 'href', label: 'Link', help: HREF },
        ],
      },
    ],
  },
  {
    key: 'request',
    title: 'Request form',
    description: 'The "Request full index" dialog.',
    fields: [
      { type: 'text', key: 'title', label: 'Title' },
      { type: 'textarea', key: 'standfirst', label: 'Standfirst', rows: 2 },
      { type: 'text', key: 'firstName', label: 'First name placeholder' },
      { type: 'text', key: 'lastName', label: 'Last name placeholder' },
      { type: 'text', key: 'company', label: 'Company placeholder' },
      { type: 'text', key: 'position', label: 'Position placeholder' },
      { type: 'text', key: 'email', label: 'Email placeholder' },
      { type: 'text', key: 'submitLabel', label: 'Submit label' },
      { type: 'text', key: 'successMessage', label: 'Thank-you message' },
    ],
  },
  {
    key: 'nav',
    title: 'Section navigation',
    description: 'The bar that slides in below the hero. The short labels must fit one line at 375px - check on a phone after any change.',
    fields: [
      {
        type: 'list', key: 'items', label: 'Items', itemName: 'item', summary: 'long', max: 7,
        fields: [
          {
            type: 'select', key: 'anchor', label: 'Section',
            options: ['about', 'pillars', 'reports', 'index', 'tools', 'exchange', 'newsletter'].map((v) => ({ value: v, label: `#${v}` })),
          },
          { type: 'text', key: 'long', label: 'Long label', help: 'Above 980px.' },
          { type: 'text', key: 'short', label: 'Short label', help: 'Below 980px.' },
        ],
      },
    ],
  },
  {
    key: 'header',
    title: 'Site header',
    description: 'The top bar - normally kept in step with the rest of redbookagency.com.',
    fields: [
      { type: 'text', key: 'logoHref', label: 'Logo link' },
      {
        type: 'image', key: 'logoImage', label: 'Logo',
        help: 'Optional. The logo is tinted to match the header (red normally, white over the hero), so upload a solid silhouette on a transparent background (SVG or PNG). A full-colour logo would show as a solid red/white shape. Leave empty for the built-in mark.',
      },
      { type: 'list', key: 'left', label: 'Left links', itemName: 'link', summary: 'label', fields: link() },
      {
        type: 'list', key: 'right', label: 'Right links', itemName: 'link', summary: 'label',
        fields: [...link(), { type: 'checkbox', key: 'active', label: 'Highlighted (this page)' }],
      },
      { type: 'text', key: 'menuLabel', label: 'Menu label', help: 'Shown below 980px.' },
    ],
  },
  {
    key: 'footer',
    title: 'Footer',
    description: 'Tagline, link groups and the company line.',
    fields: [
      { type: 'text', key: 'tagline', label: 'Tagline' },
      {
        type: 'image', key: 'mark', label: 'Logo',
        help: 'Optional. Shown top-left of the footer, 40px tall on a dark background. Leave empty for the built-in mark.',
      },
      {
        type: 'list', key: 'groups', label: 'Link groups', itemName: 'group', summary: 'title', max: 2,
        fields: [
          { type: 'text', key: 'title', label: 'Title' },
          { type: 'list', key: 'links', label: 'Links', itemName: 'link', summary: 'label', fields: [
            { type: 'text', key: 'label', label: 'Label' },
            { type: 'text', key: 'href', label: 'Target', help: 'Leave empty for plain text.' },
          ] },
        ],
      },
      { type: 'textarea', key: 'legal', label: 'Legal line', rows: 2, help: `Shown under the last group. ${BREAKS}` },
    ],
  },
  {
    key: 'seo',
    title: 'Search & sharing',
    description: 'The page title and description search engines and social cards use.',
    fields: [
      { type: 'text', key: 'title', label: 'Page title' },
      { type: 'textarea', key: 'description', label: 'Description', rows: 3 },
      { type: 'image', key: 'ogImage', label: 'Share image', help: '1200 × 630.' },
    ],
  },
  {
    key: 'notify',
    title: 'Notifications',
    description: 'Who is emailed when a form is submitted. Needs the Resend key configured; without it submissions are still stored and shown here.',
    fields: [
      { type: 'text', key: 'requestRecipients', label: '"Request full index" recipients', help: 'Comma-separated email addresses. Leave empty to fall back to the server default.' },
      { type: 'text', key: 'formRecipients', label: 'Other forms recipients', help: 'Contribute, Contact and Newshub. Comma-separated. Leave empty for the server default.' },
    ],
  },
]

export const sectionByKey = (key: string) => SECTIONS.find((s) => s.key === key)

/* ---------- server-side sanitising --------------------------------------
   Whatever the browser sends is rebuilt field by field from the schema:
   unknown keys dropped, types coerced, strings capped. */

const MAX_STRING = 5000

export function sanitize(fields: Field[], input: unknown): Record<string, unknown> {
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const f of fields) {
    const v = src[f.key]
    switch (f.type) {
      case 'text':
      case 'textarea':
      case 'image':
        out[f.key] = typeof v === 'string' ? v.slice(0, MAX_STRING) : v == null ? '' : String(v).slice(0, MAX_STRING)
        break
      case 'number': {
        const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
        out[f.key] = Number.isFinite(n) ? n : 0
        break
      }
      case 'checkbox':
        out[f.key] = v === true || v === 'true' || v === 'on'
        break
      case 'select':
        out[f.key] = f.options.some((o) => o.value === v) ? v : f.options[0].value
        break
      case 'group':
        out[f.key] = sanitize(f.fields, v)
        break
      case 'list': {
        const arr = Array.isArray(v) ? v.slice(0, f.max ?? 200) : []
        out[f.key] = arr.map((item) => sanitize(f.fields, item))
        break
      }
    }
  }
  return out
}

/** Problems worth stopping a save for. */
export function problems(fields: Field[], data: Record<string, unknown>, path = ''): string[] {
  const out: string[] = []
  for (const f of fields) {
    const v = data[f.key]
    const where = path ? `${path} › ${f.label}` : f.label
    if (f.type === 'text' && f.pattern && typeof v === 'string' && v && !new RegExp(f.pattern).test(v)) {
      out.push(`${where}: "${v}" is not in the expected format${f.placeholder ? ` (e.g. ${f.placeholder})` : ''}.`)
    }
    if (f.type === 'group') out.push(...problems(f.fields, v as Record<string, unknown>, where))
    if (f.type === 'list') {
      const arr = v as Record<string, unknown>[]
      if (f.min && arr.length < f.min) out.push(`${where}: needs at least ${f.min}.`)
      arr.forEach((item, i) => out.push(...problems(f.fields, item, `${where} ${i + 1}`)))
    }
  }
  return out
}
