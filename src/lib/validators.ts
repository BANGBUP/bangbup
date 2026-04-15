import { z } from 'zod'

// 안전한 URL 검증: http/https 만 허용, 특수 스킴 차단
const safeUrl = z
  .string()
  .trim()
  .url()
  .refine((u) => {
    try {
      const url = new URL(u)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }, { message: 'http/https URL만 허용됩니다' })
  .max(500)

export const methodInputSchema = z.object({
  title: z.string().trim().min(3).max(40),
  situation: z.string().trim().min(5).max(200),
  action: z.string().trim().min(5).max(200),
  result: z.string().trim().min(5).max(200),
  detail: z.string().trim().max(2000).optional().nullable(),
  mediaUrl: z.string().url().max(500).optional().nullable(),
  sources: z.array(safeUrl).max(3).default([]),
  difficulty: z.number().int().min(1).max(5).default(1),
  cost: z.enum(['FREE', 'LOW', 'MID', 'HIGH']).default('FREE'),
  duration: z.string().trim().max(30).optional().nullable(),
  problems: z.array(z.string().trim().min(1).max(30)).max(8).default([]),
  contexts: z.array(z.string().trim().min(1).max(30)).max(6).default([]),
  parentId: z.string().cuid().optional().nullable(),
})
export type MethodInput = z.output<typeof methodInputSchema>
export type MethodInputForm = z.input<typeof methodInputSchema>

export const requestInputSchema = z.object({
  title: z.string().trim().min(5).max(80),
  situation: z.string().trim().min(5).max(300),
  problem: z.string().trim().min(5).max(500),
  tried: z.string().trim().max(500).optional().nullable(),
  constraints: z.string().trim().max(300).optional().nullable(),
  desired: z.string().trim().min(5).max(300),
  problemTag: z.string().trim().max(30).optional().nullable(),
})
export type RequestInput = z.output<typeof requestInputSchema>
export type RequestInputForm = z.input<typeof requestInputSchema>

export const OUTDATED_REASONS = [
  'CONTEXT_CHANGED',
  'BETTER_ALTERNATIVE',
  'EVIDENCE_REFUTED',
  'HARMFUL',
  'UNCLEAR',
  'OTHER',
] as const

export const OUTDATED_REASON_LABEL: Record<
  (typeof OUTDATED_REASONS)[number],
  string
> = {
  CONTEXT_CHANGED: '환경/버전이 바뀜',
  BETTER_ALTERNATIVE: '더 나은 대안 있음',
  EVIDENCE_REFUTED: '연구/사실 반박',
  HARMFUL: '위험하거나 해로움',
  UNCLEAR: '설명 부족/모호',
  OTHER: '기타',
}

// OUTDATED 신규 투표 시 reason 필수, 철회 시 없어도 됨 → 필수 여부는 서버가 기존 기록 유무로 판단
export const interactionSchema = z.object({
  type: z.enum(['SAVE', 'USEFUL', 'TRIED', 'SUCCESS', 'FAIL', 'OUTDATED']),
  comment: z.string().trim().max(200).optional().nullable(),
  outdatedReason: z.enum(OUTDATED_REASONS).optional().nullable(),
})
export type InteractionInput = z.infer<typeof interactionSchema>

export function slugifyProblem(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .slice(0, 50)
}
