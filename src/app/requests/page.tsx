import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function RequestsPage() {
  const items = await prisma.request.findMany({
    where: { status: 'OPEN' },
    orderBy: [{ upvotes: 'desc' }, { createdAt: 'desc' }],
    take: 30,
    include: {
      requester: { select: { handle: true, name: true } },
      tag: { select: { title: true, slug: true } },
      _count: { select: { answers: true } },
    },
  })

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">방법 요청</h1>
        <Link href="/requests/new" className={buttonVariants()}>
          요청 올리기
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-muted-foreground border-muted rounded-lg border border-dashed p-12 text-center">
          아직 요청이 없어요.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{r.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {r.problem}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  {r.tag && (
                    <Badge variant="secondary">#{r.tag.title}</Badge>
                  )}
                  <span className="text-muted-foreground">
                    @{r.requester.handle}
                  </span>
                  <span className="text-muted-foreground">
                    · 답변 {r._count.answers}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
