import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { methodFeedSelect, updateMethod } from '@/lib/methods'
import { methodInputSchema } from '@/lib/validators'
import { recordView } from '@/lib/interactions'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const method = await prisma.method.findUnique({
    where: { id },
    select: methodFeedSelect,
  })
  if (!method) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const user = await getCurrentUser()
  await recordView(user?.id ?? null, id)

  return NextResponse.json({ method })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => null)
  const parsed = methodInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_INPUT', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const method = await updateMethod(id, user.id, parsed.data)
    return NextResponse.json({ method })
  } catch (e) {
    const msg = (e as Error).message
    if (msg === 'NOT_FOUND')
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
    if (msg === 'FORBIDDEN')
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    throw e
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { id } = await params
  const method = await prisma.method.findUnique({
    where: { id },
    select: { authorId: true },
  })
  if (!method) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  if (method.authorId !== user.id)
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  await prisma.method.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
