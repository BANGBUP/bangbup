import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { MethodForm } from '@/components/method-form'

export const dynamic = 'force-dynamic'

export default async function RemixMethodPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const parent = await prisma.method.findUnique({
    where: { id },
    include: {
      problems: { select: { problem: { select: { title: true } } } },
      contexts: { select: { context: { select: { title: true } } } },
    },
  })
  if (!parent) notFound()

  return (
    <MethodForm
      mode="create"
      parentId={parent.id}
      parentTitle={parent.title}
      initial={{
        title: parent.title,
        situation: parent.situation,
        action: parent.action,
        result: parent.result,
        detail: parent.detail,
        mediaUrl: null, // 새로 업로드
        sources: parent.sources,
        difficulty: parent.difficulty,
        cost: parent.cost,
        duration: parent.duration,
        problems: parent.problems.map((p) => p.problem.title),
        contexts: parent.contexts.map((c) => c.context.title),
      }}
    />
  )
}
