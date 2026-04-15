import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { requestInputSchema, slugifyProblem } from '@/lib/validators'

export async function GET() {
  const items = await prisma.request.findMany({
    where: { status: 'OPEN' },
    orderBy: [{ upvotes: 'desc' }, { createdAt: 'desc' }],
    take: 30,
    include: {
      requester: { select: { id: true, handle: true, name: true, avatarUrl: true } },
      tag: { select: { id: true, title: true, slug: true } },
      _count: { select: { answers: true } },
    },
  })
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = requestInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_INPUT', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const data = parsed.data
  let problemId: string | null = null
  if (data.problemTag) {
    const slug = slugifyProblem(data.problemTag) || data.problemTag
    const problem = await prisma.problem.upsert({
      where: { slug },
      update: { requestCount: { increment: 1 } },
      create: { title: data.problemTag, slug, requestCount: 1 },
    })
    problemId = problem.id
  }

  const created = await prisma.request.create({
    data: {
      requesterId: user.id,
      title: data.title,
      situation: data.situation,
      problem: data.problem,
      tried: data.tried ?? null,
      constraints: data.constraints ?? null,
      desired: data.desired,
      problemId,
    },
  })
  return NextResponse.json({ request: created }, { status: 201 })
}
