'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  methodInputSchema,
  type MethodInput,
  type MethodInputForm,
} from '@/lib/validators'
import { TagInput } from '@/components/tag-input'
import { RichEditor } from '@/components/rich-editor'
import { ImageDropzone } from '@/components/image-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export type MethodFormInitial = {
  title: string
  situation: string
  action: string
  result: string
  detail: string | null
  mediaUrl: string | null
  sources: string[]
  difficulty: number
  cost: 'FREE' | 'LOW' | 'MID' | 'HIGH'
  duration: string | null
  problems: string[]
  contexts: string[]
}

type Props = {
  mode: 'create' | 'edit'
  methodId?: string
  initial?: MethodFormInitial
  parentId?: string
  parentTitle?: string
}

export function MethodForm({
  mode,
  methodId,
  initial,
  parentId,
  parentTitle,
}: Props) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<MethodInputForm, unknown, MethodInput>({
    resolver: zodResolver(methodInputSchema),
    defaultValues: {
      title: initial?.title ?? '',
      situation: initial?.situation ?? '',
      action: initial?.action ?? '',
      result: initial?.result ?? '',
      detail: initial?.detail ?? null,
      mediaUrl: initial?.mediaUrl ?? null,
      sources: initial?.sources ?? [],
      difficulty: initial?.difficulty ?? 1,
      cost: initial?.cost ?? 'FREE',
      duration: initial?.duration ?? null,
      problems: initial?.problems ?? [],
      contexts: initial?.contexts ?? [],
      parentId: parentId ?? null,
    },
  })

  const [problems, setProblems] = useState<string[]>(initial?.problems ?? [])
  const [contexts, setContexts] = useState<string[]>(initial?.contexts ?? [])
  const [sources, setSources] = useState<string[]>(initial?.sources ?? [])
  const [imageUrl, setImageUrl] = useState<string | null>(
    initial?.mediaUrl ?? null,
  )
  const [detail, setDetail] = useState(initial?.detail ?? '')

  async function onSubmit(data: MethodInput) {
    const url = mode === 'edit' ? `/api/methods/${methodId}` : '/api/methods'
    const method = mode === 'edit' ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.status === 401) {
      toast('로그인이 필요해요')
      router.push('/login')
      return
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? '저장 실패')
      return
    }
    const { method: saved } = await res.json()
    toast.success(mode === 'edit' ? '수정됐어요' : '방법을 올렸어요')
    router.push(`/m/${saved.id}`)
    router.refresh()
  }

  const title =
    mode === 'edit'
      ? '방법 수정'
      : parentId
        ? '리믹스 만들기'
        : '새 방법 올리기'

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {parentId && parentTitle ? (
            <p className="text-muted-foreground text-sm">
              원본 &quot;{parentTitle}&quot; 에서 파생. 내 상황에 맞게 수정해보세요.
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              IF-THEN-SO 포맷으로 간결하게. 15초 안에 이해될 수 있어야 해요.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="제목" error={errors.title?.message}>
              <Input
                {...register('title')}
                placeholder="예: 새벽에 핸드폰 못 놓을 때"
                maxLength={40}
              />
            </Field>

            <Field label="IF — 상황" error={errors.situation?.message}>
              <Textarea
                {...register('situation')}
                rows={2}
                placeholder="잠들기 전에 유튜브/SNS 를 계속 보게 될 때"
              />
            </Field>

            <Field label="THEN — 행동" error={errors.action?.message}>
              <Textarea
                {...register('action')}
                rows={2}
                placeholder="자기 전에 폰을 거실에 두고 아날로그 알람시계를 쓴다"
              />
            </Field>

            <Field label="SO — 결과" error={errors.result?.message}>
              <Textarea
                {...register('result')}
                rows={2}
                placeholder="3일만에 수면 시간이 평균 1시간 늘었다"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="난이도 (1~5)">
                <Input
                  type="number"
                  min={1}
                  max={5}
                  {...register('difficulty', { valueAsNumber: true })}
                />
              </Field>
              <Field label="비용">
                <select
                  {...register('cost')}
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                >
                  <option value="FREE">무료</option>
                  <option value="LOW">낮음</option>
                  <option value="MID">보통</option>
                  <option value="HIGH">높음</option>
                </select>
              </Field>
            </div>

            <Field label="소요 시간 (선택)">
              <Input
                {...register('duration')}
                placeholder="5분 / 21일 / 매일 아침"
              />
            </Field>

            <Field label="대표 이미지 (선택)" hint="드래그/클릭/붙여넣기 · 최대 5MB">
              <ImageDropzone
                value={imageUrl}
                onChange={(url) => {
                  setImageUrl(url)
                  setValue('mediaUrl', url)
                }}
              />
            </Field>

            <Field
              label="상세 설명 (선택)"
              hint="서식 지원 · 최대 2000자"
              error={errors.detail?.message}
            >
              <RichEditor
                value={detail}
                onChange={(md) => {
                  setDetail(md)
                  setValue('detail', md, { shouldValidate: true })
                }}
                placeholder="필요하면 자세한 단계·배경·주의점을 적어보세요."
              />
            </Field>

            <Field
              label="출처 URL (선택)"
              hint="Enter로 추가 · 최대 3개 · http/https만"
            >
              <TagInput
                value={sources}
                max={3}
                placeholder="https://..."
                onChange={(next) => {
                  setSources(next)
                  setValue('sources', next, { shouldValidate: true })
                }}
              />
            </Field>

            <Field label="문제 태그" hint="Enter/쉼표로 구분 · 최대 8개">
              <TagInput
                value={problems}
                max={8}
                placeholder="예: 수면, 집중, 새벽습관"
                onChange={(next) => {
                  setProblems(next)
                  setValue('problems', next, { shouldValidate: true })
                }}
              />
            </Field>

            <Field
              label="컨텍스트 (선택)"
              hint="버전/시점/환경 · 최대 6개 · 자동완성 지원"
            >
              <TagInput
                value={contexts}
                max={6}
                suggestUrl="/api/contexts"
                placeholder="예: iOS 17, 2024년, 안드로이드"
                onChange={(next) => {
                  setContexts(next)
                  setValue('contexts', next, { shouldValidate: true })
                }}
              />
            </Field>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting
                ? '저장 중...'
                : mode === 'edit'
                  ? '수정 저장'
                  : '방법 올리기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        {hint && <span className="text-muted-foreground text-xs">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
