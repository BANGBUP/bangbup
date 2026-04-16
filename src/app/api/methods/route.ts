import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { methodInputSchema } from '@/lib/validators'
import { createMethod, getFeed } from '@/lib/methods'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const cursor = url.searchParams.get('cursor') ?? undefined
  const { items, nextCursor } = await getFeed(cursor)
  return NextResponse.json(
    { items, nextCursor },
    { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } },
  )
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = methodInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_INPUT', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const method = await createMethod(user.id, parsed.data)
  return NextResponse.json({ method }, { status: 201 })
}
