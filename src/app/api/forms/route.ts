import { NextResponse, type NextRequest } from 'next/server'
import { createPublicClient, createServiceClient } from '@/lib/supabase/server'
import { notifySubmission } from '@/lib/notify'

/* The four capture points (07-forms-and-capture.md). Every one writes a row
   to form_submissions and sends a notification email. */

const SOURCES = ['contribute', 'contact', 'newshub', 'request_index'] as const
type Source = (typeof SOURCES)[number]
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* Spam: a honeypot plus a timing check (09-decisions.md, "still open").
   Anything tripping them is told it succeeded, so there is nothing to tune
   against. The rate limit is per instance - enough to blunt a loop. */
const MIN_ELAPSED_MS = 2500
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 8
const hits = new Map<string, number[]>()

function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '')

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request.' }, { status: 400 })
  }

  const source = body.source as Source
  if (!SOURCES.includes(source)) return NextResponse.json({ ok: false, error: 'Unknown form.' }, { status: 400 })

  if (clip(body.website, 200) || Number(body.elapsed) < MIN_ELAPSED_MS) {
    return NextResponse.json({ ok: true })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Please try again in a few minutes.' }, { status: 429 })
  }

  const email = clip(body.email, 254)
  if (!EMAIL.test(email)) {
    return NextResponse.json({ ok: false, error: 'That does not look like an email address' }, { status: 422 })
  }

  const isRequest = source === 'request_index'
  const first = clip(body.first, 200)
  if (isRequest && !first) {
    return NextResponse.json({ ok: false, error: 'Enter your first name' }, { status: 422 })
  }
  const utm =
    body.utm && typeof body.utm === 'object'
      ? Object.fromEntries(Object.entries(body.utm as object).map(([k, v]) => [k.slice(0, 40), clip(v, 200)]))
      : null

  const row = {
    source,
    email,
    first_name: isRequest ? clip(body.first, 200) || null : null,
    last_name: isRequest ? clip(body.last, 200) || null : null,
    company: isRequest ? clip(body.company, 200) || null : null,
    position: isRequest ? clip(body.position, 200) || null : null,
    referrer: clip(body.referrer, 1000) || null,
    page_url: clip(body.page, 1000) || null,
    utm: utm && Object.keys(utm).length ? utm : null,
    user_agent: clip(req.headers.get('user-agent'), 500) || null,
  }

  const db = createServiceClient() ?? createPublicClient()
  const { error } = await db.from('form_submissions').insert(row)
  if (error) {
    console.error('[forms] insert failed:', error)
    return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  /* the row is the record; a failed email is logged, not shown to the visitor */
  try {
    await notifySubmission(row)
  } catch (e) {
    console.error('[forms] notification failed:', e)
  }

  return NextResponse.json({ ok: true })
}
