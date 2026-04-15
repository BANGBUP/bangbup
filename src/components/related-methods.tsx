import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { timeAgo } from '@/lib/utils'
import type { MethodFeedItem } from '@/lib/methods'
import { getRelated } from '@/lib/methods'

export async function RelatedMethods({ methodId }: { methodId: string }) {
  const { byProblem, remixFamily, byAuthor } = await getRelated(methodId, 5)

  const hasAny =
    byProblem.length > 0 || remixFamily.length > 0 || byAuthor.length > 0
  if (!hasAny) return null

  return (
    <div className="space-y-6">
      {remixFamily.length > 0 && (
        <div id="remix-family" className="scroll-mt-16">
          <Section title="리믹스 계보" items={remixFamily} />
        </div>
      )}
      {byProblem.length > 0 && (
        <Section title="같은 문제의 다른 방법" items={byProblem} />
      )}
      {byAuthor.length > 0 && (
        <Section title="작성자의 다른 방법" items={byAuthor} />
      )}
    </div>
  )
}

function Section({
  title,
  items,
}: {
  title: string
  items: MethodFeedItem[]
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-muted-foreground text-sm font-semibold">{title}</h3>
      <div className="space-y-2">
        {items.map((m) => (
          <RelatedRow key={m.id} method={m} />
        ))}
      </div>
    </section>
  )
}

function RelatedRow({ method }: { method: MethodFeedItem }) {
  const problems = method.problems.map((p) => p.problem)
  const isOutdated = method.outdated >= 3

  return (
    <Link href={`/m/${method.id}`}>
      <Card className="hover:bg-muted/40 transition">
        <CardContent className="flex gap-3 py-3">
          {method.mediaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={method.mediaUrl}
              alt=""
              className="size-16 shrink-0 rounded object-cover"
              loading="lazy"
            />
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start gap-2">
              <h4 className="flex-1 truncate text-sm font-medium">
                {method.title}
              </h4>
              {isOutdated && (
                <Badge variant="destructive" className="shrink-0 text-xs">
                  검증 필요
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground line-clamp-1 text-xs">
              {method.situation}
            </p>
            <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
              <span>@{method.author.handle}</span>
              <span>·</span>
              <span>{timeAgo(method.createdAt)}</span>
              <span>·</span>
              <span>
                👍 {method.usefuls} · 🎉 {method.successes}
              </span>
              {problems.slice(0, 2).map((p) => (
                <Badge key={p.id} variant="secondary" className="text-xs">
                  #{p.title}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
