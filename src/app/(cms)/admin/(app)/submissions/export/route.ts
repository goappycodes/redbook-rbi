import { NextResponse, type NextRequest } from 'next/server'
import { getEditor } from '@/lib/cms/auth'

const COLS = ['created_at', 'source', 'email', 'first_name', 'last_name', 'company', 'position', 'page_url', 'referrer', 'utm'] as const

/* A cell that starts with = + - @ would run as a formula in Excel. */
function cell(v: unknown) {
  let s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(req: NextRequest) {
  const { supabase, isAdmin } = await getEditor()
  if (!isAdmin) return new NextResponse('Not allowed', { status: 403 })

  const source = req.nextUrl.searchParams.get('source')
  const rows: Record<string, unknown>[] = []
  /* page through, PostgREST caps a single response */
  for (let from = 0; ; from += 1000) {
    let q = supabase.from('form_submissions').select(COLS.join(', ')).order('created_at', { ascending: false }).range(from, from + 999)
    if (source) q = q.eq('source', source)
    const { data, error } = await q
    if (error) return new NextResponse(error.message, { status: 500 })
    rows.push(...((data ?? []) as unknown as Record<string, unknown>[]))
    if (!data || data.length < 1000) break
  }

  const csv = '﻿' + [COLS.join(','), ...rows.map((r) => COLS.map((c) => cell(r[c])).join(','))].join('\r\n')
  const stamp = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rbi-submissions${source ? `-${source}` : ''}-${stamp}.csv"`,
    },
  })
}
