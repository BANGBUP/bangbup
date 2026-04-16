export default function MethodDetailLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="bg-card space-y-4 rounded-xl border p-4">
        <div className="flex items-center gap-3">
          <div className="bg-muted size-8 animate-pulse rounded-full" />
          <div className="space-y-1.5">
            <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            <div className="bg-muted h-3 w-16 animate-pulse rounded" />
          </div>
        </div>
        <div className="bg-muted h-6 w-3/4 animate-pulse rounded" />
        <div className="space-y-2">
          <div className="bg-muted h-4 w-full animate-pulse rounded" />
          <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
          <div className="bg-muted h-4 w-4/6 animate-pulse rounded" />
        </div>
        <div className="bg-muted h-8 w-full animate-pulse rounded" />
      </div>
    </main>
  )
}
