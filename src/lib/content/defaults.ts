import type { SiteContent } from './types'

/* The prototype's copy, verbatim. Seeds the database and stands in for any
   row that is missing or unreadable, so the page never renders empty. */

const img = (f: string) => `/assets/img/${f}`
const RBI_INDEX = 'https://redbookagency.com/theredbookindex/'

export const DEFAULT_CONTENT: SiteContent = {
  seo: {
    title: 'RedBook Intelligence',
    description: 'The intelligence hub for luxury residential projects – research, data and tools, built for you.',
    ogImage: '',
  },

  header: {
    logoHref: '#',
    logoImage: '',
    left: [
      { label: 'About Us', href: '#' },
      { label: 'Services', href: '#' },
      { label: 'Our Team', href: '#' },
    ],
    right: [
      { label: 'RedBook Intelligence', href: '#pillars', active: true },
      { label: 'News', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    menuLabel: 'Menu',
  },

  nav: {
    items: [
      { anchor: 'about', long: 'What we stand for', short: 'About' },
      { anchor: 'pillars', long: 'The Three Pillars', short: 'Pillars' },
      { anchor: 'reports', long: 'Research', short: 'Research' },
      { anchor: 'index', long: 'Data', short: 'Data' },
      { anchor: 'tools', long: 'Tools', short: 'Tools' },
      { anchor: 'exchange', long: 'Contribute/Contact', short: 'Contribute/Contact' },
      { anchor: 'newsletter', long: 'Newshub', short: 'Newshub' },
    ],
  },

  hero: {
    eyebrow: 'RedBook Intelligence',
    headline: 'Research,\ndata\n& tools',
    standfirst: 'The intelligence hub for luxury residential projects – built for you.',
    buttonLabel: 'Explore RedBook Intelligence',
    buttonHref: '#pillars',
  },

  about: {
    eyebrow: 'What we stand for',
    headline: 'Data tells you what’s happened to costs. Intelligence tells you what to do about it.',
    body:
      'RedBook Intelligence exists to turn industry data into valuable insights. We make an often opaque world more transparent, bringing clarity to the numbers and data that can be applied. RBi is research designed to be used, quoted or presented to clients as well as within the industry. Trust is earned by consistently providing information that helps people make better decisions, something we strive to do.',
    figures: [
      { count: 200, prefix: '', suffix: '+', label: 'Contributing\npractices' },
      { count: 2800, prefix: '', suffix: '', label: 'Projects\nlogged' },
      { count: 14, prefix: '£', suffix: 'B+', label: 'Project\nvalue' },
      { count: 350, prefix: '', suffix: 'k+', label: 'Data\npoints' },
    ],
    footnote: '* RBi Statistics 26/27',
  },

  pillars: {
    eyebrow: 'The intelligence hub',
    headline: 'RedBook Intelligence',
    cards: [
      {
        label: 'Research',
        body: 'Focused papers segmented by topic and by audience. Written to be read, not to be academic.',
        linkLabel: 'Read the research',
        href: '#reports',
        icon: 'research',
      },
      {
        label: 'Data',
        body: 'The data spine. Total project-cost movement, year on year, base 100 from Year 1.',
        linkLabel: 'See the index',
        href: '#index',
        icon: 'data',
      },
      {
        label: 'Tools',
        body: 'Where the data stops being something to read about and becomes something you run against your own scheme.',
        linkLabel: 'Open the tools',
        href: '#tools',
        icon: 'tools',
      },
    ],
  },

  reports: {
    eyebrow: 'Research',
    headline: 'REDBOOK INTELLIGENCE REPORTS',
    standfirst: 'Annual industry data reports with key findings and insights from RBi data.',
    yearLabel: 'Year',
    hintLabel: 'Click to read',
    lockedTitle: 'Available to contributors on release',
    futureHeading: 'Future reports',
    years: [
      {
        year: '2026/27',
        reports: [
          {
            label: 'RBi Report', title: 'Sentiment', published: '01/26',
            blurb: 'What clients, advisors and contractors expect over the next twelve months: appetite, hesitancy, and where the two diverge between London and the country.',
            image: img('report-2026-27-01-sentiment.jpg'), href: '#', newTab: false, locked: false,
          },
          {
            label: 'RBi Report', title: 'Costs', published: '03/26',
            blurb: 'Where total project costs have moved since Year 1, which components drove the shift, and what that means for a scheme being priced today.',
            image: img('report-2026-27-02-costs.jpg'), href: '#', newTab: false, locked: false,
          },
          {
            label: 'RBi Report', title: 'Clients', published: '05/26',
            blurb: 'Who is building, what they are building, and how they make decisions. Segmented by budget band and by region.',
            image: img('report-2026-27-03-clients.jpg'), href: '#', newTab: false, locked: false,
          },
        ],
        future: [
          { ordinal: '04', title: 'Timelines', due: '07/26', description: 'How long schemes actually take against how long they were promised, and the points at which programmes most often slip.' },
          { ordinal: '05', title: 'Planning & Heritage', due: '09/26', description: 'Borough-by-borough approval rates, refusal reasons and policy summaries for listed buildings and conservation-area work.' },
          { ordinal: '06', title: 'What Do Clients Want', due: '11/26', description: 'The brief behind the brief: the rooms, finishes and outcomes clients ask for most often, and what each one costs to deliver.' },
          { ordinal: '07', title: 'Project Finance', due: '01/27', description: 'How lenders, brokers and underwriters price luxury residential risk, and the points at which schemes most often stall on funding.' },
          { ordinal: '08', title: 'Contributor Report', due: '03/27', description: 'What the practices themselves told us: salaries, margins and charge-out rates, gathered across the year and returned in full.' },
        ],
      },
      {
        year: '2025/26',
        reports: [
          ['01', 'Welcome', 'report-2025-26-01-welcome.jpg'],
          ['02', 'Unwrapping Property Projects', 'report-2025-26-02-unwrapping-property-projects.jpg'],
          ['03', 'Clients', 'report-2025-26-03-clients.jpg'],
          ['04', 'Costs', 'report-2025-26-04-costs.jpg'],
          ['05', 'Time', 'report-2025-26-05-time.jpg'],
          ['06', 'Planning & Heritage', 'report-2025-26-06-planning-and-heritage.jpg'],
          ['07', 'What Do Clients Want?', 'report-2025-26-07-what-do-clients-want.jpg'],
          ['08', 'Our Predictions', 'report-2025-26-08-our-predictions.jpg'],
          ['09', 'Contributor Report', 'report-2025-26-09-contributor-report.jpg'],
        ].map(([label, title, file]) => ({
          label, title, published: '10/25', blurb: '', image: img(file),
          href: RBI_INDEX, newTab: true, locked: label === '09',
        })),
        future: [],
      },
      {
        year: '2024/25',
        reports: [
          {
            label: '', title: 'RedBook Intelligence Report', published: '10/24', blurb: '',
            image: img('report-2024-25-redbook-intelligence-report.jpg'), href: '#', newTab: false, locked: false,
          },
        ],
        future: [],
      },
    ],
  },

  index: {
    eyebrow: 'Data',
    headline: 'The RedBook Index',
    standfirst: 'Tracking the change in key metrics across luxury residential project costs.',
    customiseLabel: 'Customise your view',
    pickerNote: 'Select up to four. The overall index is always shown.',
    pickerNoteFull: 'Three selected. Turn one off to choose another.',
    clearLabel: 'Clear all',
    baseColumnLabel: 'From base',
    exportLabel: 'Export your graph',
    requestLabel: 'Request full index',
  },

  tools: {
    eyebrow: 'Tools',
    headline: 'REDBOOK INTELLIGENCE TOOLS',
    standfirst: 'Where the data stops being something to read and becomes something you can run against your own scheme.',
    lockedLabel: 'In development',
    tools: [
      {
        ordinal: '01', title: 'Feasibility\ncalculator', state: 'live',
        body: 'The flagship. Put a scheme in, get a cost range out, benchmarked against real project data.',
        linkLabel: 'Open the calculator', href: '#',
      },
      { ordinal: '02', title: '', body: '', state: 'locked', linkLabel: '', href: '' },
      { ordinal: '03', title: '', body: '', state: 'locked', linkLabel: '', href: '' },
    ],
  },

  exchange: {
    contribute: {
      eyebrow: 'Collective knowledge',
      heading: 'Are you a design or delivery\nprofessional in this industry?',
      standfirst: 'Contribute to the report in exchange for your data.',
      instruction: 'Register your interest in participation for 27/28',
      placeholder: 'Email address',
      buttonLabel: 'Register',
      successMessage: 'Thank you, we will be in touch.',
    },
    contact: {
      eyebrow: 'Contact us',
      heading: 'Interested in acquiring\nRedBook data?',
      standfirst: 'Tailored data for your project or development.',
      instruction: 'Tell us what you are working on',
      placeholder: 'Email address',
      buttonLabel: 'Get in touch',
      successMessage: 'Thank you, we will be in touch.',
    },
  },

  newshub: {
    eyebrow: 'Monthly',
    headline: 'The RBi Newshub',
    placeholder: 'Email address',
    buttonLabel: 'Subscribe',
    successMessage: 'Thank you, you are subscribed.',
    tiles: [
      { image: img('newshub-the-podcast.jpg'), label: 'The\npodcast', body: 'Monthly, with a designer, data expert or industry CEO.' },
      { image: img('newshub-news-and-lifestyle.jpg'), label: 'News &\nLifestyle', body: 'Where human-interest and talking-head material lives.' },
    ],
    journalFromWordpress: false,
    journal: [
      { date: 'Sep 2026', title: 'What the Q3 tender returns are telling us', kind: 'Journal', href: '#' },
      { date: 'Aug 2026', title: 'Why professional fees are lagging build costs', kind: 'Article', href: '#' },
      { date: 'Aug 2026', title: 'Five schemes that came in under budget, and why', kind: 'Journal', href: '#' },
      { date: 'Jul 2026', title: 'Landscaping: the line item nobody forecasts', kind: 'Article', href: '#' },
      { date: 'Jul 2026', title: 'Talking to lenders about prime residential risk', kind: 'Journal', href: '#' },
    ],
  },

  footer: {
    tagline: 'An intelligence hub of research, data and tools.',
    mark: '',
    groups: [
      {
        title: 'RedBook Intelligence',
        links: [
          { label: 'Reports', href: '#reports' },
          { label: 'The Index', href: '#index' },
          { label: 'Tools', href: '#tools' },
          { label: 'Contribute data', href: '#exchange' },
        ],
      },
      {
        title: 'Follow',
        links: [
          { label: 'Instagram', href: '' },
          { label: 'LinkedIn', href: '' },
        ],
      },
    ],
    legal: 'Privacy Policy · © 2026 RedBook\nThe Red Book Agency Limited Trading As RedBook, No. 07534026',
  },

  request: {
    title: 'Request full index',
    standfirst: 'Tell us who you are and we will send the current edition over.',
    firstName: 'First name',
    lastName: 'Last name',
    company: 'Company name',
    position: 'Position',
    email: 'Email address',
    submitLabel: 'Send request',
    successMessage: 'Thank you. We will send the index over shortly.',
  },
}
