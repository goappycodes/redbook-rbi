import { NextResponse } from 'next/server'
import { getEditor } from '@/lib/cms/auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, isAdmin } = await getEditor()
  if (!isAdmin) return new NextResponse('Not allowed', { status: 403 })
  const { data } = await supabase.from('index_datasets').select('year, payload').eq('id', id).maybeSingle()
  if (!data) return new NextResponse('Not found', { status: 404 })
  return new NextResponse(JSON.stringify(data.payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="redbook-index-${data.year.replace('/', '-')}.json"`,
    },
  })
}
