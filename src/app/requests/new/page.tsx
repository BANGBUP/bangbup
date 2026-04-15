'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  requestInputSchema,
  type RequestInput,
  type RequestInputForm,
} from '@/lib/validators'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function NewRequestPage() {
  return (
    <Suspense>
      <NewRequestForm />
    </Suspense>
  )
}

function NewRequestForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillQuery = searchParams.get('q') ?? ''

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestInputForm, unknown, RequestInput>({
    resolver: zodResolver(requestInputSchema),
    defaultValues: {
      title: prefillQuery ? `"${prefillQuery}" 에 대한 방법이 필요해요` : '',
      situation: '',
      problem: prefillQuery,
      tried: '',
      constraints: '',
      desired: '',
      problemTag: '',
    },
  })

  async function onSubmit(data: RequestInput) {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.status === 401) {
      toast('로그인이 필요해요')
      router.push('/login')
      return
    }
    if (!res.ok) {
      toast.error('저장 실패')
      return
    }
    toast.success('요청을 올렸어요')
    router.push('/requests')
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>방법 요청하기</CardTitle>
          <p className="text-muted-foreground text-sm">
            커뮤니티에 방법을 요청해보세요. 구체적으로 적을수록 좋은 답변이 와요.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <F label="제목" error={errors.title?.message}>
              <Input {...register('title')} placeholder="한 줄 요약" />
            </F>
            <F label="내 상황" error={errors.situation?.message}>
              <Textarea {...register('situation')} rows={2} placeholder="나이/직업/배경" />
            </F>
            <F label="겪고 있는 문제" error={errors.problem?.message}>
              <Textarea {...register('problem')} rows={3} />
            </F>
            <F label="이미 시도한 것 (선택)">
              <Textarea {...register('tried')} rows={2} />
            </F>
            <F label="제약 조건 (선택)" hint="시간/돈/환경 등">
              <Textarea {...register('constraints')} rows={2} />
            </F>
            <F label="원하는 결과" error={errors.desired?.message}>
              <Textarea {...register('desired')} rows={2} />
            </F>
            <F label="문제 태그 (선택)">
              <Input {...register('problemTag')} placeholder="예: 수면" />
            </F>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? '올리는 중...' : '요청 올리기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

function F({
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
