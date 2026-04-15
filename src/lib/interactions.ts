import { prisma } from '@/lib/prisma'
import { METHOD_SCORE_WEIGHTS } from '@/lib/utils'
import type { InteractionType, OutdatedReason } from '@prisma/client'

export class InteractionError extends Error {}

type ToggleableType =
  | 'SAVE'
  | 'USEFUL'
  | 'TRIED'
  | 'SUCCESS'
  | 'FAIL'
  | 'OUTDATED'

type ApplyInput = {
  userId: string
  methodId: string
  type: ToggleableType
  comment?: string | null
  outdatedReason?: OutdatedReason | null
}

/**
 * 인터랙션 처리 규칙:
 * - SAVE, OUTDATED: 토글 가능 (다시 누르면 해제)
 * - TRIED / SUCCESS / FAIL: 1회성. SUCCESS ↔ FAIL 은 상호 배타.
 */
export type ApplyResult = {
  applied: boolean
  type: ToggleableType
  /** 같은 요청에서 추가로 생성된 인터랙션 타입 (예: SUCCESS 누르면 TRIED 자동 추가) */
  alsoAdded: ToggleableType[]
  /** 같은 요청에서 철회된 인터랙션 타입 (예: TRIED 철회 시 SUCCESS도 철회) */
  alsoRemoved: ToggleableType[]
}

export async function applyInteraction({
  userId,
  methodId,
  type,
  comment,
  outdatedReason,
}: ApplyInput): Promise<ApplyResult> {
  return prisma.$transaction(async (tx) => {
    const alsoAdded: ToggleableType[] = []
    const alsoRemoved: ToggleableType[] = []

    const existing = await tx.interaction.findUnique({
      where: { userId_methodId_type: { userId, methodId, type } },
    })

    // 기존 기록 있으면 철회 + 종속 철회 처리
    if (existing) {
      await removeInteraction(tx, userId, methodId, type)

      // 써봄 철회 → SUCCESS/FAIL도 같이 철회
      if (type === 'TRIED') {
        for (const dep of ['SUCCESS', 'FAIL'] as const) {
          const depExisting = await tx.interaction.findUnique({
            where: { userId_methodId_type: { userId, methodId, type: dep } },
          })
          if (depExisting) {
            await removeInteraction(tx, userId, methodId, dep)
            alsoRemoved.push(dep)
          }
        }
      }

      return { applied: false, type, alsoAdded, alsoRemoved }
    }

    // 신규 OUTDATED 는 사유 필수
    if (type === 'OUTDATED') {
      if (!outdatedReason) {
        throw new InteractionError('구식 사유를 선택해주세요')
      }
      if (
        outdatedReason === 'OTHER' &&
        (!comment || comment.trim().length < 3)
      ) {
        throw new InteractionError('기타 사유는 설명(3자 이상)이 필요합니다')
      }
    }

    // SUCCESS/FAIL 누를 때: TRIED 자동 추가 + 반대편 철회
    if (type === 'SUCCESS' || type === 'FAIL') {
      const triedExists = await tx.interaction.findUnique({
        where: { userId_methodId_type: { userId, methodId, type: 'TRIED' } },
      })
      if (!triedExists) {
        await addInteraction(tx, userId, methodId, 'TRIED')
        alsoAdded.push('TRIED')
      }

      const opposite = type === 'SUCCESS' ? 'FAIL' : 'SUCCESS'
      const other = await tx.interaction.findUnique({
        where: { userId_methodId_type: { userId, methodId, type: opposite } },
      })
      if (other) {
        await removeInteraction(tx, userId, methodId, opposite)
        alsoRemoved.push(opposite)
      }
    }

    await addInteraction(tx, userId, methodId, type, { comment, outdatedReason })

    return { applied: true, type, alsoAdded, alsoRemoved }
  })
}

type TxClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0]

async function addInteraction(
  tx: TxClient,
  userId: string,
  methodId: string,
  type: ToggleableType,
  extra?: { comment?: string | null; outdatedReason?: OutdatedReason | null },
) {
  await tx.interaction.create({
    data: {
      userId,
      methodId,
      type,
      comment: extra?.comment ?? null,
      outdatedReason:
        type === 'OUTDATED' ? extra?.outdatedReason ?? null : null,
    },
  })
  const m = await tx.method.update({
    where: { id: methodId },
    data: incrementData(type),
    select: { authorId: true },
  })
  const delta = authorScoreFor(type)
  if (delta !== 0) {
    await tx.user.update({
      where: { id: m.authorId },
      data: { methodScore: { increment: delta } },
    })
  }
}

async function removeInteraction(
  tx: TxClient,
  userId: string,
  methodId: string,
  type: ToggleableType,
) {
  await tx.interaction.delete({
    where: { userId_methodId_type: { userId, methodId, type } },
  })
  const m = await tx.method.update({
    where: { id: methodId },
    data: decrementData(type),
    select: { authorId: true },
  })
  const delta = authorScoreFor(type)
  if (delta !== 0) {
    await tx.user.update({
      where: { id: m.authorId },
      data: { methodScore: { decrement: delta } },
    })
  }
}

function incrementData(type: ToggleableType) {
  const w = METHOD_SCORE_WEIGHTS
  const now = new Date()
  switch (type) {
    case 'SAVE':
      return {
        saves: { increment: 1 },
        score: { increment: w.save },
        lastActivityAt: now,
      }
    case 'USEFUL':
      return {
        usefuls: { increment: 1 },
        score: { increment: w.useful },
        lastActivityAt: now,
      }
    case 'TRIED':
      return {
        tried: { increment: 1 },
        score: { increment: w.tried },
        lastActivityAt: now,
      }
    case 'SUCCESS':
      return {
        successes: { increment: 1 },
        score: { increment: w.success },
        lastActivityAt: now,
      }
    case 'FAIL':
      return {
        fails: { increment: 1 },
        lastActivityAt: now,
      }
    case 'OUTDATED':
      return {
        outdated: { increment: 1 },
        score: { increment: w.outdated },
        lastActivityAt: now,
      }
  }
}

function decrementData(type: ToggleableType) {
  const w = METHOD_SCORE_WEIGHTS
  switch (type) {
    case 'SAVE':
      return { saves: { decrement: 1 }, score: { decrement: w.save } }
    case 'USEFUL':
      return { usefuls: { decrement: 1 }, score: { decrement: w.useful } }
    case 'TRIED':
      return { tried: { decrement: 1 }, score: { decrement: w.tried } }
    case 'SUCCESS':
      return { successes: { decrement: 1 }, score: { decrement: w.success } }
    case 'FAIL':
      return { fails: { decrement: 1 } }
    case 'OUTDATED':
      return {
        outdated: { decrement: 1 },
        score: { decrement: w.outdated },
      }
  }
}

function authorScoreFor(type: ToggleableType): number {
  const w = METHOD_SCORE_WEIGHTS
  switch (type) {
    case 'SAVE':
      return w.save
    case 'USEFUL':
      return w.useful
    case 'TRIED':
      return w.tried
    case 'SUCCESS':
      return w.success
    case 'FAIL':
      return 0
    case 'OUTDATED':
      return w.outdated
  }
}

export async function recordView(userId: string | null, methodId: string) {
  if (!userId) return
  const existing = await prisma.interaction.findUnique({
    where: { userId_methodId_type: { userId, methodId, type: 'VIEW' } },
  })
  if (existing) return
  await prisma.$transaction([
    prisma.interaction.create({
      data: { userId, methodId, type: 'VIEW' },
    }),
    prisma.method.update({
      where: { id: methodId },
      data: {
        views: { increment: 1 },
        score: { increment: METHOD_SCORE_WEIGHTS.view },
      },
    }),
  ])
}

export type OutdatedReportSummary = {
  total: number
  byReason: Record<OutdatedReason, number>
  recent: Array<{
    id: string
    reason: OutdatedReason | null
    comment: string | null
    createdAt: Date
    user: { handle: string; name: string | null; avatarUrl: string | null }
  }>
}

export async function getOutdatedReport(
  methodId: string,
  take = 5,
): Promise<OutdatedReportSummary> {
  const [byReasonRaw, recent, total] = await Promise.all([
    prisma.interaction.groupBy({
      by: ['outdatedReason'],
      where: { methodId, type: 'OUTDATED' },
      _count: { _all: true },
    }),
    prisma.interaction.findMany({
      where: { methodId, type: 'OUTDATED' },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        outdatedReason: true,
        comment: true,
        createdAt: true,
        user: { select: { handle: true, name: true, avatarUrl: true } },
      },
    }),
    prisma.interaction.count({
      where: { methodId, type: 'OUTDATED' },
    }),
  ])

  const byReason: Record<OutdatedReason, number> = {
    CONTEXT_CHANGED: 0,
    BETTER_ALTERNATIVE: 0,
    EVIDENCE_REFUTED: 0,
    HARMFUL: 0,
    UNCLEAR: 0,
    OTHER: 0,
  }
  for (const row of byReasonRaw) {
    if (row.outdatedReason) byReason[row.outdatedReason] = row._count._all
  }

  return {
    total,
    byReason,
    recent: recent.map((r) => ({
      id: r.id,
      reason: r.outdatedReason,
      comment: r.comment,
      createdAt: r.createdAt,
      user: r.user,
    })),
  }
}

export async function getUserInteractions(userId: string, methodIds: string[]) {
  if (!methodIds.length) return new Map<string, Set<InteractionType>>()
  const rows = await prisma.interaction.findMany({
    where: { userId, methodId: { in: methodIds } },
    select: { methodId: true, type: true },
  })
  const map = new Map<string, Set<InteractionType>>()
  for (const r of rows) {
    const set = map.get(r.methodId) ?? new Set()
    set.add(r.type)
    map.set(r.methodId, set)
  }
  return map
}
