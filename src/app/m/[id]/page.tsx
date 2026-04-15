import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { methodFeedSelect, findSuccessor } from '@/lib/methods'
import { getUserInteractions, recordView } from '@/lib/interactions'
import { MethodCard } from '@/components/method-card'
import { OutdatedReport } from '@/components/outdated-report'
import { RelatedMethods } from '@/components/related-methods'

export const dynamic = 'force-dynamic'

export default async function MethodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const method = await prisma.method.findUnique({
    where: { id },
    select: methodFeedSelect,
  })
  if (!method) notFound()

  const user = await getCurrentUser()
  await recordView(user?.id ?? null, id)

  const [interactionMap, successor] = await Promise.all([
    user ? getUserInteractions(user.id, [id]) : Promise.resolve(new Map()),
    findSuccessor(id),
  ])

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <MethodCard
        method={method}
        initialInteractions={Array.from(interactionMap.get(id) ?? [])}
        successor={successor ? { id: successor.id, title: successor.title } : null}
        isAuthor={user?.id === method.author.id}
      />
      <OutdatedReport methodId={id} />
      <RelatedMethods methodId={id} />
    </main>
  )
}
