export default function FeedLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="bg-muted h-8 w-20 animate-pulse rounded" />
        <div className="bg-muted h-8 w-28 animate-pulse rounded" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </main>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-card space-y-3 rounded-xl border p-4">
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
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-7 w-16 animate-pulse rounded" />
        ))}
      </div>
    </div>
  )
}
