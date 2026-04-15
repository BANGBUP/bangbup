import { NextResponse } from 'next/server'
import { searchMethods } from '@/lib/methods'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q') ?? ''
  const items = await searchMethods(q)
  return NextResponse.json({ items })
}
