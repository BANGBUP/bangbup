import { AlertTriangle } from 'lucide-react'
import { getOutdatedReport } from '@/lib/interactions'
import { OUTDATED_REASONS, OUTDATED_REASON_LABEL } from '@/lib/validators'
import { timeAgo } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export async function OutdatedReport({ methodId }: { methodId: string }) {
  const report = await getOutdatedReport(methodId, 10)
  if (report.total === 0) return null

  const sorted = OUTDATED_REASONS.map((r) => ({
    reason: r,
    label: OUTDATED_REASON_LABEL[r],
    count: report.byReason[r],
    pct: Math.round((report.byReason[r] / report.total) * 100),
  }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-destructive flex items-center gap-2 text-base">
          <AlertTriangle className="size-4" />
          구식 리포트 {report.total}건
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          {sorted.map((x) => (
            <div key={x.reason} className="flex items-center gap-2 text-sm">
              <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                <div
                  className="bg-destructive/70 h-full rounded-full"
                  style={{ width: `${x.pct}%` }}
                />
              </div>
              <span className="w-44 shrink-0">{x.label}</span>
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
      </CardContent>
    </Card>
  )
}
