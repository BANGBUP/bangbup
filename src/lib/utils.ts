import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const METHOD_SCORE_WEIGHTS = {
  view: 1,
  useful: 3,
  save: 5,
  tried: 20,
  success: 50,
  remix: 30,
  outdated: -15,
} as const

// 점수 감쇠 파라미터 — HN 스타일 half-life
export const DECAY = {
  // 24시간 단위. 값이 작을수록 신작 가중 ↑
  halfLifeDays: 14,
  // outdated 1건당 effectiveScore 에 곱해지는 페널티
  outdatedPenalty: 0.04,
  // 자식(remix) 이 부모 effectiveScore 에 영향을 주는 비율
  childSupersedeFactor: 0.6,
} as const

/**
 * 시간 감쇠 적용된 trending score.
 * 최근 활동이 있을수록 높고, 오래될수록 점수가 천천히 낮아짐.
 */
export function trendScore(score: number, lastActivityAt: Date | string): number {
  const ms = Date.now() - new Date(lastActivityAt).getTime()
  const days = Math.max(0, ms / 86_400_000)
  return score / Math.pow(days / DECAY.halfLifeDays + 1, 1.2)
}

/**
 * 종합 effectiveScore: (누적점수 * 0.3 + trendScore * 0.7) 에 outdated 페널티.
 */
export function effectiveScore(input: {
  score: number
  lastActivityAt: Date | string
  outdated: number
}): number {
  const base = input.score * 0.3 + trendScore(input.score, input.lastActivityAt) * 0.7
  const penalty = Math.max(0, 1 - input.outdated * DECAY.outdatedPenalty)
  return base * penalty
}

/**
 * "3분 전", "2일 전", "1년 전" 같은 상대 시간 한국어 표기.
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const abs = Math.abs(diff)
  const suffix = diff >= 0 ? '전' : '후'

  const min = 60_000
  const hour = min * 60
  const day = hour * 24
  const week = day * 7
  const month = day * 30
  const year = day * 365

  if (abs < min) return '방금'
  if (abs < hour) return `${Math.floor(abs / min)}분 ${suffix}`
  if (abs < day) return `${Math.floor(abs / hour)}시간 ${suffix}`
  if (abs < week) return `${Math.floor(abs / day)}일 ${suffix}`
  if (abs < month) return `${Math.floor(abs / week)}주 ${suffix}`
  if (abs < year) return `${Math.floor(abs / month)}개월 ${suffix}`
  return `${Math.floor(abs / year)}년 ${suffix}`
}

export function calcMethodScore(stats: {
  views: number
  saves: number
  usefuls?: number
  tried: number
  successes: number
  remixes: number
  outdated?: number
}): number {
  const w = METHOD_SCORE_WEIGHTS
  return (
    stats.views * w.view +
    (stats.usefuls ?? 0) * w.useful +
    stats.saves * w.save +
    stats.tried * w.tried +
    stats.successes * w.success +
    stats.remixes * w.remix +
    (stats.outdated ?? 0) * w.outdated
  )
}
