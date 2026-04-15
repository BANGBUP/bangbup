import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { MethodForm } from '@/components/method-form'

export const dynamic = 'force-dynamic'

export default async function EditMethodPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect(`/login`)

  const method = await prisma.method.findUnique({
    where: { id },
    include: {
      problems: { select: { problem: { select: { title: true } } } },
      contexts: { select: { context: { select: { title: true } } } },
    },
  })
  if (!method) notFound()
  if (method.authorId !== user.id) redirect(`/m/${id}`)

  return (
    <MethodForm
      mode="edit"
      methodId={method.id}
      initial={{
        title: method.title,
        situation: method.situation,
        action: method.action,
        result: method.result,
        detail: method.detail,
        mediaUrl: method.mediaUrl,
        sources: method.sources,
        difficulty: method.difficulty,
        cost: method.cost,
        duration: method.duration,
        problems: method.problems.map((p) => p.problem.title),
        contexts: method.contexts.map((c) => c.context.title),
      }}
    />
  )
}
