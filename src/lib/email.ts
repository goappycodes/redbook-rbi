import 'server-only'
import { esc } from '@/lib/content/text'

/* Branded, table-based HTML emails - inline styles only, so they survive Gmail,
   Outlook and the rest. The RBi wordmark is set as text (Georgia) rather than an
   image, so it always renders even when a client blocks images. */

const C = {
  plum: '#2B0815', red: '#6F2123', ink: '#212529', ink70: '#4A4640',
  mute: '#8B857F', line: '#E2DDD8', paper: '#FFFFFF', parch: '#F5F3F0',
}

const FROM = () => process.env.NOTIFY_FROM || 'RedBook Intelligence <noreply@redbookagency.com>'
/* Absolute base for the logo image (emails can't use the site's CSS mask). */
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://redbookagency.com').replace(/\/$/, '')

export function emailShell(inner: string, preheader = ''): string {
  const year = new Date().getFullYear()
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:${C.parch};-webkit-text-size-adjust:100%;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(preheader)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.parch};">
<tr><td align="center" style="padding:28px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:${C.paper};border:1px solid ${C.line};border-radius:12px;overflow:hidden;">
<tr><td align="center" style="background:${C.red};padding:26px 32px;">
<img src="${SITE}/assets/img/rbi-logo.png" alt="RedBook Intelligence" width="104" height="50" style="display:block;margin:0 auto 8px;border:0;outline:none;height:50px;width:104px;">
<div style="font:600 11px/1 Arial,Helvetica,sans-serif;color:rgba(255,255,255,.72);letter-spacing:2.4px;text-transform:uppercase;">Redbook Intelligence</div>
</td></tr>
<tr><td style="padding:30px 32px;">${inner}</td></tr>
</table>
<div style="width:600px;max-width:100%;padding:18px 16px 0;font:400 12px/1.6 Arial,Helvetica,sans-serif;color:${C.mute};text-align:center;">&copy; ${year} RedBook Intelligence &middot; All rights reserved</div>
</td></tr>
</table>
</body></html>`
}

export const h1 = (t: string) => `<h1 style="margin:0 0 16px;font:600 21px/1.3 Georgia,'Times New Roman',serif;color:${C.plum};">${esc(t)}</h1>`
export const p = (html: string) => `<p style="margin:0 0 14px;font:400 15px/1.6 Arial,Helvetica,sans-serif;color:${C.ink70};">${html}</p>`

/* A clean label/value table for the internal notification. */
export function fieldTable(rows: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:4px;">${rows.map(([k, v]) =>
    `<tr><td style="padding:10px 0;border-bottom:1px solid ${C.line};font:600 11px/1.4 Arial,Helvetica,sans-serif;color:${C.mute};letter-spacing:.5px;text-transform:uppercase;vertical-align:middle;width:120px;">${esc(k)}</td><td style="padding:10px 0;border-bottom:1px solid ${C.line};font:400 14px/1.5 Arial,Helvetica,sans-serif;color:${C.ink};vertical-align:middle;">${esc(v)}</td></tr>`
  ).join('')}</table>`
}

/* One sender for every email, so the Resend wiring lives in a single place.
   Returns false when RESEND_API_KEY is unset (nothing is sent). */
export async function sendEmail(opts: { to: string[]; subject: string; html: string; text: string; replyTo?: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key || !opts.to.length) return false
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM(), to: opts.to, reply_to: opts.replyTo, subject: opts.subject, html: opts.html, text: opts.text }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
  return true
}
