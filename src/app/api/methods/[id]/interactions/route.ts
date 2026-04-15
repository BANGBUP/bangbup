import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { interactionSchema } from '@/lib/validators'
import { applyInteraction, InteractionError } from '@/lib/interactions'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => null)
  const parsed = interactionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_INPUT', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const result = await applyInteraction({
      userId: user.id,
      methodId: id,
      type: parsed.data.type,
      comment: parsed.data.comment,
      outdatedReason: parsed.data.outdatedReason,
    })
    return NextResponse.json(result)
  } catch (e) {
    if (e instanceof InteractionError) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    throw e
  }
}
