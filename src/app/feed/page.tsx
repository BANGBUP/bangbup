import { Suspense } from 'react'
import Link from 'next/link'
import { getFeed } from '@/lib/methods'
import { getCurrentUser } from '@/lib/auth'
import { getUserInteractions } from '@/lib/interactions'
import { MethodCard } from '@/components/method-card'
import { buttonVariants } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default function FeedPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-8 flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">피드</h1>
          <p className="text-muted-foreground text-sm">
            최근 공유된 방법들. 써본 사람이 많을수록 위로 올라가요.
          </p>
        </div>
        <Link href="/new" className={buttonVariants({ size: 'sm' })}>
          방법 올리기
        </Link>
      </div>
      <Suspense fallback={<FeedSkeleton />}>
        <FeedContent />
      </Suspense>
    </main>
  )
}

async function FeedContent() {
  const [user, feed] = await Promise.all([getCurrentUser(), getFeed()])
  const entries = feed.items
  const interactionMap = user
    ? await getUserInteractions(
        user.id,
        entries.map((e) => e.method.id),
      )
    : new Map()

  if (entries.length === 0) {
    return (
      <div className="border-muted rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground mb-4">아직 방법이 없어요.</p>
        <Link href="/new" className={buttonVariants()}>
          첫 방법 올리기
        </Link>
      </div>
    )
  }

  return (
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
  )
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card space-y-3 rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted size-8 animate-pulse rounded-full" />
            <div className="space-y-1.5">
              <div className="bg-muted h-3.5 w-24 animate-pulse rounded" />
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
            </div>
          </div>
          <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
          <div className="space-y-2">
            <div className="bg-muted h-4 w-full animate-pulse rounded" />
            <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
            <div className="bg-muted h-4 w-4/6 animate-pulse rounded" />
          </div>
          <div className="flex gap-2 border-t pt-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="bg-muted h-7 w-16 animate-pulse rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
