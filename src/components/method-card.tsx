'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  Bookmark,
  Check,
  Flag,
  PartyPopper,
  Frown,
  AlertTriangle,
  ArrowUpRight,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { timeAgo } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Repeat } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import type { MethodFeedItem } from '@/lib/methods'
import {
  OUTDATED_REASONS,
  OUTDATED_REASON_LABEL,
} from '@/lib/validators'
import { OutdatedReportDialog } from '@/components/outdated-report-dialog'
import type { InteractionType, OutdatedReason } from '@prisma/client'

type SuccessorInfo = { id: string; title: string } | null

type Props = {
  method: MethodFeedItem
  initialInteractions?: InteractionType[]
  successor?: SuccessorInfo
  isAuthor?: boolean
}

export function MethodCard({
  method,
  initialInteractions = [],
  successor,
  isAuthor = false,
}: Props) {
  const router = useRouter()
  const [active, setActive] = useState<Set<InteractionType>>(
    new Set(initialInteractions),
  )
  const [counts, setCounts] = useState({
    saves: method.saves,
    usefuls: method.usefuls,
    tried: method.tried,
    successes: method.successes,
    fails: method.fails,
    outdated: method.outdated,
  })
  const [pending, setPending] = useState<InteractionType | null>(null)
  const [outdatedOpen, setOutdatedOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/methods/${method.id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('삭제 실패')
        return
      }
      toast.success('방법이 삭제됐어요')
      setDeleteOpen(false)
      router.push('/feed')
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }
  const [outdatedReason, setOutdatedReason] = useState<OutdatedReason | null>(null)
  const [outdatedComment, setOutdatedComment] = useState('')

  async function interact(
    type: 'SAVE' | 'USEFUL' | 'TRIED' | 'SUCCESS' | 'FAIL' | 'OUTDATED',
    extra?: { comment?: string; outdatedReason?: OutdatedReason },
  ) {
    if (pending) return
    setPending(type)
    try {
      const res = await fetch(`/api/methods/${method.id}/interactions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type,
          comment: extra?.comment ?? null,
          outdatedReason: extra?.outdatedReason ?? null,
        }),
      })
      if (res.status === 401) {
        toast('로그인이 필요해요')
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? '문제가 발생했어요')
        return
      }
      const data = (await res.json()) as {
        applied: boolean
        type: InteractionType
        alsoAdded?: InteractionType[]
        alsoRemoved?: InteractionType[]
      }
      const alsoAdded = data.alsoAdded ?? []
      const alsoRemoved = data.alsoRemoved ?? []

      setActive((prev) => {
        const next = new Set(prev)
        if (data.applied) next.add(type)
        else next.delete(type)
        for (const t of alsoAdded) next.add(t)
        for (const t of alsoRemoved) next.delete(t)
        return next
      })
      setCounts((c) => {
        const next = { ...c }
        applyDelta(next, type, data.applied ? 1 : -1)
        for (const t of alsoAdded) applyDelta(next, t, 1)
        for (const t of alsoRemoved) applyDelta(next, t, -1)
        return next
      })
      if (type === 'OUTDATED' && data.applied) {
        toast.success('구식으로 표시했어요')
      }
    } finally {
      setPending(null)
    }
  }

  async function submitOutdated() {
    if (!outdatedReason) {
      toast.error('사유 카테고리를 선택해주세요')
      return
    }
    if (outdatedReason === 'OTHER' && outdatedComment.trim().length < 3) {
      toast.error('기타 사유는 설명(3자 이상)이 필요합니다')
      return
    }
    await interact('OUTDATED', {
      outdatedReason,
      comment: outdatedComment.trim() || undefined,
    })
    setOutdatedOpen(false)
    setOutdatedReason(null)
    setOutdatedComment('')
  }

  const author = method.author
  const problems = method.problems.map((p) => p.problem)
  const contexts = method.contexts.map((c) => c.context)
  const isOutdated = counts.outdated >= 3 || active.has('OUTDATED')

  return (
    <Card className="w-full">
      <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
        <Link href={`/@${author.handle}`} className="flex items-center gap-2">
          <Avatar className="size-8">
            {author.avatarUrl && <AvatarImage src={author.avatarUrl} />}
            <AvatarFallback>{author.handle.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-medium leading-tight">
              {author.name ?? author.handle}
            </div>
            <div className="text-muted-foreground text-xs">@{author.handle}</div>
          </div>
        </Link>
        <span
          className="text-muted-foreground ml-2 text-xs"
          title={new Date(method.createdAt).toLocaleString('ko-KR')}
        >
          {timeAgo(method.createdAt)}
          {method.lastActivityAt &&
            new Date(method.lastActivityAt).getTime() -
              new Date(method.createdAt).getTime() >
              60_000 && (
              <span className="ml-1 opacity-60">
                · 활동 {timeAgo(method.lastActivityAt)}
              </span>
            )}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {method._count.children > 0 && (
            <Link
              href={`/m/${method.id}#remix-family`}
              className="hover:bg-muted inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
              title="리믹스 보기"
            >
              <Repeat className="size-3" /> 리믹스 {method._count.children}
            </Link>
          )}
          {isOutdated && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="size-3" /> 검증 필요
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="더보기">
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/m/${method.id}/remix`)}
              >
                <Repeat className="size-4" /> 리믹스 만들기
              </DropdownMenuItem>
              {isAuthor && (
                <>
                  <DropdownMenuItem
                    onClick={() => router.push(`/m/${method.id}/edit`)}
                  >
                    <Pencil className="size-4" /> 편집
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" /> 삭제
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {successor && (
          <Link
            href={`/m/${successor.id}`}
            className="bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:opacity-90"
          >
            <ArrowUpRight className="size-4" />
            <span>
              더 나은 버전 있어요:{' '}
              <span className="font-medium">{successor.title}</span>
            </span>
          </Link>
        )}

        <Link href={`/m/${method.id}`} className="block space-y-3 hover:opacity-90">
          <h3 className="break-keep text-lg font-semibold leading-snug">
            {method.title}
          </h3>
          {method.mediaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={method.mediaUrl}
              alt={method.title}
              className="max-h-80 w-full rounded-md object-cover"
              loading="lazy"
            />
          )}
          <div className="space-y-2 text-sm">
            <Line label="IF" text={method.situation} />
            <Line label="THEN" text={method.action} />
            <Line label="SO" text={method.result} />
          </div>
        </Link>

        {method.detail && method.detail.trim().length > 0 && (
          <div className="border-t pt-3">
            <button
              type="button"
              onClick={() => setDetailOpen((v) => !v)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-medium"
            >
              <BookOpen className="size-3.5" />
              자세히 보기
              {detailOpen ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
            {detailOpen && (
              <div className="prose prose-sm dark:prose-invert mt-2 max-w-none text-sm leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: (props) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="underline"
                      />
                    ),
                  }}
                >
                  {method.detail}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {method.sources && method.sources.length > 0 && (
          <div className="space-y-1.5 border-t pt-3">
            <p className="text-muted-foreground text-xs font-medium">출처</p>
            <ul className="space-y-1">
              {method.sources.map((s) => (
                <li key={s} className="text-sm">
                  <a
                    href={s}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 break-all"
                  >
                    <ExternalLink className="size-3 shrink-0" />
                    <span className="truncate">{formatUrl(s)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(problems.length > 0 || contexts.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {problems.map((p) => (
              <Link key={p.id} href={`/p/${p.slug}`}>
                <Badge variant="secondary" className="text-xs">
                  #{p.title}
                </Badge>
              </Link>
            ))}
            {contexts.map((c) => (
              <Badge key={c.id} variant="outline" className="text-xs">
                {c.title}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1 border-t pt-3">
          <ActionBtn
            label={`유용 ${counts.usefuls}`}
            icon={ThumbsUp}
            active={active.has('USEFUL')}
            disabled={pending !== null}
            onClick={() => interact('USEFUL')}
          />
          <ActionBtn
            label={`저장 ${counts.saves}`}
            icon={Bookmark}
            active={active.has('SAVE')}
            disabled={pending !== null}
            onClick={() => interact('SAVE')}
          />
          <ActionBtn
            label={`써봄 ${counts.tried}`}
            icon={Check}
            active={active.has('TRIED')}
            disabled={pending !== null}
            onClick={() => interact('TRIED')}
          />
          <ActionBtn
            label={`성공 ${counts.successes}`}
            icon={PartyPopper}
            active={active.has('SUCCESS')}
            disabled={pending !== null}
            onClick={() => interact('SUCCESS')}
          />
          <ActionBtn
            label={`실패 ${counts.fails}`}
            icon={Frown}
            active={active.has('FAIL')}
            disabled={pending !== null}
            onClick={() => interact('FAIL')}
          />

          <Button
            variant={active.has('OUTDATED') ? 'secondary' : 'ghost'}
            size="sm"
            className="text-xs"
            disabled={pending !== null}
            onClick={() => setOutdatedOpen(true)}
          >
            <AlertTriangle className="size-3.5" />
            {active.has('OUTDATED') ? '구식 철회' : '구식'}
          </Button>

          {counts.outdated > 0 && (
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="text-destructive hover:bg-muted rounded-md px-2 py-1 text-xs underline-offset-4 hover:underline"
              title="다른 사람들의 구식 사유 보기"
            >
              {counts.outdated}건 보기
            </button>
          )}

          <OutdatedReportDialog
            methodId={method.id}
            open={reportOpen}
            onOpenChange={setReportOpen}
          />

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>방법 삭제</DialogTitle>
                <DialogDescription>
                  이 방법을 정말 삭제할까요? 다른 사용자의 인터랙션 기록도 함께
                  삭제되며 되돌릴 수 없어요.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? '삭제 중...' : '삭제'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={outdatedOpen} onOpenChange={setOutdatedOpen}>
            <DialogContent className="sm:max-w-md">
              {active.has('OUTDATED') ? (
                <>
                  <DialogHeader>
                    <DialogTitle>구식 표시 철회</DialogTitle>
                    <DialogDescription>
                      이 방법에 대한 구식 투표를 철회할까요? 이전 사유·설명은
                      삭제됩니다.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setOutdatedOpen(false)}
                    >
                      취소
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={pending !== null}
                      onClick={async () => {
                        await interact('OUTDATED')
                        setOutdatedOpen(false)
                      }}
                    >
                      철회
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>구식으로 표시</DialogTitle>
                    <DialogDescription>
                      왜 이 방법이 유효하지 않은가요?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-wrap gap-2">
                    {OUTDATED_REASONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setOutdatedReason(r)}
                        className={`rounded-md border px-3 py-1.5 text-xs transition ${
                          outdatedReason === r
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-input hover:bg-muted'
                        }`}
                      >
                        {OUTDATED_REASON_LABEL[r]}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={outdatedComment}
                    onChange={(e) => setOutdatedComment(e.target.value)}
                    placeholder={
                      outdatedReason === 'OTHER'
                        ? '사유를 3자 이상 입력 (필수)'
                        : '추가 설명 (선택)'
                    }
                    rows={3}
                    maxLength={200}
                  />
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setOutdatedOpen(false)}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={submitOutdated}
                      disabled={pending !== null}
                    >
                      제출
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Flag className="mr-1 size-3" /> 점수 {method.score}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type Counts = {
  saves: number
  usefuls: number
  tried: number
  successes: number
  fails: number
  outdated: number
}

function applyDelta(counts: Counts, type: InteractionType, delta: number) {
  switch (type) {
    case 'SAVE':
      counts.saves += delta
      break
    case 'USEFUL':
      counts.usefuls += delta
      break
    case 'TRIED':
      counts.tried += delta
      break
    case 'SUCCESS':
      counts.successes += delta
      break
    case 'FAIL':
      counts.fails += delta
      break
    case 'OUTDATED':
      counts.outdated += delta
      break
  }
}

function formatUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.hostname}${u.pathname === '/' ? '' : u.pathname}`
  } catch {
    return url
  }
}

function Line({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-10 shrink-0 text-xs font-semibold tracking-wider">
        {label}
      </span>
      <span className="flex-1">{text}</span>
    </div>
  )
}

type ActionBtnProps = {
  label: string
  icon: React.ElementType
  active: boolean
  disabled: boolean
  onClick: () => void
}

function ActionBtn({ label, icon: Icon, active, disabled, onClick }: ActionBtnProps) {
  return (
    <Button
      variant={active ? 'secondary' : 'ghost'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="text-xs"
    >
      <Icon className="size-3.5" />
      {label}
    </Button>
  )
}
