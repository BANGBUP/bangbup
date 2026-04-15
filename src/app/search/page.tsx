'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Search as SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { MethodCard } from '@/components/method-card'
import type { MethodFeedItem } from '@/lib/methods'

export default function SearchPage() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<MethodFeedItem[] | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!q.trim()) return
    startTransition(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      setResults(data.items)
    })
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-5">
      <h1 className="text-2xl font-bold">검색</h1>

      <form onSubmit={submit} className="flex gap-2">
        <Input
          placeholder="어떤 문제를 해결하고 싶으세요?"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
        <Button type="submit" disabled={pending}>
          <SearchIcon className="size-4" />
          검색
        </Button>
      </form>

      {results === null && (
        <p className="text-muted-foreground text-sm">
          자연어로 상황을 적어도 좋아요. 예: &quot;새벽에 잠이 안 와&quot;
        </p>
      )}

      {results && results.length === 0 && (
        <div className="border-muted space-y-3 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">결과가 없어요.</p>
          <p className="text-sm">직접 방법을 요청해보세요 — 커뮤니티가 답변해줄 거예요.</p>
          <Link href={`/requests/new?q=${encodeURIComponent(q)}`} className={buttonVariants()}>
            방법 요청하기
          </Link>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-4">
          {results.map((m) => (
            <MethodCard key={m.id} method={m} />
          ))}
        </div>
      )}
    </main>
  )
}
