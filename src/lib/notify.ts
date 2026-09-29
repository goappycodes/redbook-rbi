import 'server-only'
import { esc } from '@/lib/content/text'

const LABELS: Record<string, string> = {
  contribute: 'Contribute - register interest',
  contact: 'Contact - acquiring RedBook data',
  newshub: 'Newshub - subscribe',
  request_index: 'Request full index',
}

type Row = {
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

const list = (v: string | undefined) => (v || '').split(',').map((s) => s.trim()).filter(Boolean)

/* Notification email via Resend's HTTP API. Without RESEND_API_KEY it does
   nothing - the submission is still stored and visible in the admin. */
export async function notifySubmission(row: Row) {
  const key = process.env.RESEND_API_KEY
  if (!key) return

  const to =
    row.source === 'request_index'
      ? list(process.env.NOTIFY_TO_REQUEST_INDEX || 'index@redbookagency.com,vihaan@redbookagency.com')
      : list(process.env.NOTIFY_TO || 'index@redbookagency.com')
  if (!to.length) return

  const label = LABELS[row.source] ?? row.source
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
  const shown = fields.filter(([, v]) => v)
  const name = [row.first_name, row.last_name].filter(Boolean).join(' ')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM || 'RedBook Intelligence <noreply@redbookagency.com>',
      to,
      reply_to: row.email,
      subject: `RBi: ${label} - ${name || row.email}${row.company ? ` (${row.company})` : ''}`,
      text: shown.map(([k, v]) => `${k}: ${v}`).join('\n'),
      html:
        '<table cellpadding="6" style="font:14px/1.5 Arial,sans-serif;border-collapse:collapse">' +
        shown.map(([k, v]) => `<tr><td style="color:#8B857F">${esc(k)}</td><td>${esc(String(v))}</td></tr>`).join('') +
        '</table>',
    }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
}
