import Link from 'next/link'
import { getFeed } from '@/lib/methods'
import { getCurrentUser } from '@/lib/auth'
import { getUserInteractions } from '@/lib/interactions'
import { MethodCard } from '@/components/method-card'
import { buttonVariants } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const [user, feed] = await Promise.all([getCurrentUser(), getFeed()])
  const entries = feed.items
  const interactionMap = user
    ? await getUserInteractions(
        user.id,
        entries.map((e) => e.method.id),
      )
    : new Map()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">피드</h1>
        <Link href="/new" className={buttonVariants({ size: 'sm' })}>
          방법 올리기
        </Link>
      </div>

      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {entries.map(({ method, successor }) => (
            <MethodCard
              key={method.id}
              method={method}
              successor={successor}
              isAuthor={user?.id === method.author.id}
              initialInteractions={Array.from(
                interactionMap.get(method.id) ?? [],
              )}
            />
          ))}
        </div>
      )}
    </main>
  )
}

function EmptyState() {
  return (
    <div className="border-muted rounded-lg border border-dashed p-12 text-center">
      <p className="text-muted-foreground mb-4">아직 방법이 없어요.</p>
      <Link href="/new" className={buttonVariants()}>
        첫 방법 올리기
      </Link>
    </div>
  )
}
