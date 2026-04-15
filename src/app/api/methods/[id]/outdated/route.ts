import { NextResponse } from 'next/server'
import { getOutdatedReport } from '@/lib/interactions'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const report = await getOutdatedReport(id, 10)
  return NextResponse.json(report)
}
