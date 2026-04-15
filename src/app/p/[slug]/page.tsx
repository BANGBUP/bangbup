import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { methodFeedSelect } from '@/lib/methods'
import { MethodCard } from '@/components/method-card'

export const dynamic = 'force-dynamic'

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: {
      methods: {
        orderBy: { method: { score: 'desc' } },
        take: 30,
        select: { method: { select: methodFeedSelect } },
      },
    },
  })
  if (!problem) notFound()

  const methods = problem.methods.map((mp) => mp.method)

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold">#{problem.title}</h1>
        <p className="text-muted-foreground text-sm">
          방법 {problem.methodCount} · 요청 {problem.requestCount}
        </p>
      </header>

      <div className="space-y-4">
        {methods.length === 0 ? (
          <p className="text-muted-foreground text-sm">아직 방법이 없어요.</p>
        ) : (
          methods.map((m) => <MethodCard key={m.id} method={m} />)
        )}
      </div>
    </main>
  )
}
