import 'server-only'
import { emailShell, fieldTable, h1, p, sendEmail } from '@/lib/email'

const LABELS: Record<string, string> = {
  contribute: 'Contribute - register interest',
  contact: 'Contact - acquiring RedBook data',
  newshub: 'Newshub - subscribe',
  request_index: 'Request full index',
}

/* The message each submitter gets back, by form. */
const CONFIRM: Record<string, { subject: string; heading: string; body: string }> = {
  request_index: {
    subject: 'Your RedBook Index request',
    heading: 'Thank you for your request',
    body: 'We’ve received your request for the full RedBook Index. A member of our team will be in touch shortly with the details.',
  },
  contribute: {
    subject: 'Thanks for registering your interest',
    heading: 'Thank you for registering',
    body: 'Thanks for registering your interest in contributing to RedBook Intelligence. We’ll be in touch about the next edition.',
  },
  contact: {
    subject: 'We’ve received your enquiry',
    heading: 'Thank you for getting in touch',
    body: 'Thanks for your enquiry about acquiring RedBook data. A member of our team will respond shortly.',
  },
  newshub: {
    subject: 'You’re subscribed to Newshub',
    heading: 'You’re subscribed',
    body: 'Thanks for subscribing to RedBook Newshub. You’ll now receive our latest intelligence and updates.',
  },
}

export type Row = {
  source: string
  email: string
  first_name: string | null
  last_name: string | null
  company: string | null
  position: string | null
  page_url: string | null
  referrer: string | null
  utm: Record<string, string> | null
}

type Email = { to: string[]; subject: string; html: string; text: string; replyTo?: string }

const list = (v: string | undefined) => (v || '').split(',').map((s) => s.trim()).filter(Boolean)

/* --- builders (pure): one source of truth for sending and for previewing --- */

export function buildTeamEmail(row: Row, recipients?: { request?: string; form?: string }): Email {
  const label = LABELS[row.source] ?? row.source
  const name = [row.first_name, row.last_name].filter(Boolean).join(' ')
  const to =
    row.source === 'request_index'
      ? list(recipients?.request || process.env.NOTIFY_TO_REQUEST_INDEX || 'index@redbookagency.com,vihaan@redbookagency.com')
      : list(recipients?.form || process.env.NOTIFY_TO || 'index@redbookagency.com')

  const fields: [string, string | null][] = [
    ['Form', label],
    ['Email', row.email],
    ['First name', row.first_name],
    ['Last name', row.last_name],
    ['Company', row.company],
    ['Position', row.position],
    ['Page', row.page_url],
    ['Referrer', row.referrer],
    ['UTM', row.utm ? Object.entries(row.utm).map(([k, v]) => `${k}=${v}`).join(', ') : null],
  ]
  const shown = fields.filter(([, v]) => v) as [string, string][]

  const inner =
    h1('New ' + label.replace(/ - .*/, '').toLowerCase() + ' enquiry') +
    p(`A new <strong>${label}</strong> submission just came in. Reply to this email to respond to ${name || row.email} directly.`) +
    fieldTable(shown)

  return {
    to,
    replyTo: row.email,
    subject: `RBi: ${label} - ${name || row.email}${row.company ? ` (${row.company})` : ''}`,
    html: emailShell(inner, `New ${label} from ${name || row.email}`),
    text: shown.map(([k, v]) => `${k}: ${v}`).join('\n'),
  }
}

export function buildConfirmEmail(row: Row): Email | null {
  const c = CONFIRM[row.source]
  if (!c) return null
  const greeting = row.first_name ? `Hi ${row.first_name},` : 'Hello,'
  const inner = h1(c.heading) + p(greeting) + p(c.body) + p('With best regards,<br>The RedBook Intelligence team')
  return {
    to: [row.email],
    replyTo: list(process.env.NOTIFY_TO || 'index@redbookagency.com')[0],
    subject: c.subject,
    html: emailShell(inner, c.body),
    text: `${greeting}\n\n${c.body}\n\nWith best regards,\nThe RedBook Intelligence team`,
  }
}

/* Notifies the team of a new submission and sends the submitter a branded
   confirmation. Both go through Resend; without RESEND_API_KEY nothing is sent,
   and the submission is still stored and visible in the admin. Recipients can be
   set in the CMS (Notifications section), falling back to the server env, then a
   built-in default. A confirmation failure never blocks the team notification. */
export async function notifySubmission(row: Row, recipients?: { request?: string; form?: string }) {
  if (!process.env.RESEND_API_KEY) return

  await sendEmail(buildTeamEmail(row, recipients))

  /* The confirmation is best-effort - it must not fail the team notification. */
  try {
    const confirm = buildConfirmEmail(row)
    if (confirm) await sendEmail(confirm)
  } catch (e) {
    console.error('[notify] confirmation email failed:', e)
  }
}
