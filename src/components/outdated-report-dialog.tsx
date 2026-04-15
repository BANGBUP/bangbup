'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { OUTDATED_REASONS, OUTDATED_REASON_LABEL } from '@/lib/validators'
import { timeAgo } from '@/lib/utils'
import type { OutdatedReason } from '@prisma/client'

type Report = {
  total: number
  byReason: Record<OutdatedReason, number>
  recent: Array<{
    id: string
    reason: OutdatedReason | null
    comment: string | null
    createdAt: string
    user: { handle: string; name: string | null; avatarUrl: string | null }
  }>
}

type Props = {
  methodId: string
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function OutdatedReportDialog({ methodId, open, onOpenChange }: Props) {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`/api/methods/${methodId}/outdated`)
      .then((r) => r.json())
      .then(setReport)
      .finally(() => setLoading(false))
  }, [open, methodId])

  const sorted = report
    ? OUTDATED_REASONS.map((r) => ({
        reason: r,
        label: OUTDATED_REASON_LABEL[r],
        count: report.byReason[r],
        pct: report.total
          ? Math.round((report.byReason[r] / report.total) * 100)
          : 0,
      })).filter((x) => x.count > 0)
        .sort((a, b) => b.count - a.count)
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="size-4" />
            구식 리포트 {report ? `${report.total}건` : ''}
          </DialogTitle>
          <DialogDescription>
            다른 사용자들이 남긴 구식 사유 집계입니다.
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="text-muted-foreground text-sm">불러오는 중...</p>}

        {report && report.total === 0 && (
          <p className="text-muted-foreground text-sm">아직 구식 투표가 없어요.</p>
        )}

        {report && report.total > 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              {sorted.map((x) => (
                <div key={x.reason} className="flex items-center gap-2 text-sm">
                  <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className="bg-destructive/70 h-full rounded-full"
                      style={{ width: `${x.pct}%` }}
                    />
                  </div>
                  <span className="w-40 shrink-0 text-xs">{x.label}</span>
                  <span className="text-muted-foreground w-16 shrink-0 text-right text-xs">
                    {x.count}건 · {x.pct}%
                  </span>
                </div>
              ))}
            </div>

            {report.recent.some((r) => r.comment) && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-muted-foreground text-xs font-medium">최근 설명</p>
                {report.recent
                  .filter((r) => r.comment)
                  .slice(0, 5)
                  .map((r) => (
                    <div key={r.id} className="text-sm">
                      <div className="flex items-center gap-2 text-xs">
                        {r.reason && (
                          <Badge variant="outline" className="text-xs">
                            {OUTDATED_REASON_LABEL[r.reason]}
                          </Badge>
                        )}
                        <span className="text-muted-foreground">
                          @{r.user.handle} · {timeAgo(r.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1">{r.comment}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
