import { prisma } from '@/lib/prisma'
import {
  METHOD_SCORE_WEIGHTS,
  effectiveScore,
  DECAY,
} from '@/lib/utils'
import { slugifyProblem, type MethodInput } from '@/lib/validators'
import type { Method, Prisma } from '@prisma/client'

export async function createMethod(
  authorId: string,
  input: MethodInput,
): Promise<Method> {
  const [problems, contexts] = await Promise.all([
    ensureProblems(input.problems),
    ensureContexts(input.contexts ?? []),
  ])

  return prisma.$transaction(async (tx) => {
    const method = await tx.method.create({
      data: {
        authorId,
        title: input.title,
        situation: input.situation,
        action: input.action,
        result: input.result,
        detail: input.detail ?? null,
        mediaUrl: input.mediaUrl ?? null,
        sources: input.sources ?? [],
        difficulty: input.difficulty,
        cost: input.cost,
        duration: input.duration ?? null,
        parentId: input.parentId ?? null,
        problems: {
          create: problems.map((p) => ({ problemId: p.id })),
        },
        contexts: {
          create: contexts.map((c) => ({ contextId: c.id })),
        },
      },
    })

    if (problems.length) {
      await tx.problem.updateMany({
        where: { id: { in: problems.map((p) => p.id) } },
        data: { methodCount: { increment: 1 } },
      })
    }
    if (contexts.length) {
      await tx.context.updateMany({
        where: { id: { in: contexts.map((c) => c.id) } },
        data: { methodCount: { increment: 1 } },
      })
    }

    if (input.parentId) {
      await tx.method.update({
        where: { id: input.parentId },
        data: {
          remixes: { increment: 1 },
          score: { increment: METHOD_SCORE_WEIGHTS.remix },
          lastActivityAt: new Date(),
        },
      })
      const parent = await tx.method.findUnique({
        where: { id: input.parentId },
        select: { authorId: true },
      })
      if (parent) {
        await tx.user.update({
          where: { id: parent.authorId },
          data: { methodScore: { increment: METHOD_SCORE_WEIGHTS.remix } },
        })
      }
    }

    return method
  })
}

export async function updateMethod(
  methodId: string,
  authorId: string,
  input: MethodInput,
) {
  const existing = await prisma.method.findUnique({
    where: { id: methodId },
    select: { authorId: true },
  })
  if (!existing) throw new Error('NOT_FOUND')
  if (existing.authorId !== authorId) throw new Error('FORBIDDEN')

  const [problems, contexts] = await Promise.all([
    ensureProblems(input.problems),
    ensureContexts(input.contexts ?? []),
  ])

  return prisma.$transaction(async (tx) => {
    // 기존 problem/context 연결 제거 (개수 보정)
    const oldProblems = await tx.methodProblem.findMany({
      where: { methodId },
      select: { problemId: true },
    })
    const oldContexts = await tx.methodContext.findMany({
      where: { methodId },
      select: { contextId: true },
    })

    await tx.methodProblem.deleteMany({ where: { methodId } })
    await tx.methodContext.deleteMany({ where: { methodId } })

    if (oldProblems.length) {
      await tx.problem.updateMany({
        where: { id: { in: oldProblems.map((p) => p.problemId) } },
        data: { methodCount: { decrement: 1 } },
      })
    }
    if (oldContexts.length) {
      await tx.context.updateMany({
        where: { id: { in: oldContexts.map((c) => c.contextId) } },
        data: { methodCount: { decrement: 1 } },
      })
    }

    const updated = await tx.method.update({
      where: { id: methodId },
      data: {
        title: input.title,
        situation: input.situation,
        action: input.action,
        result: input.result,
        detail: input.detail ?? null,
        mediaUrl: input.mediaUrl ?? null,
        sources: input.sources ?? [],
        difficulty: input.difficulty,
        cost: input.cost,
        duration: input.duration ?? null,
        problems: { create: problems.map((p) => ({ problemId: p.id })) },
        contexts: { create: contexts.map((c) => ({ contextId: c.id })) },
      },
    })

    if (problems.length) {
      await tx.problem.updateMany({
        where: { id: { in: problems.map((p) => p.id) } },
        data: { methodCount: { increment: 1 } },
      })
    }
    if (contexts.length) {
      await tx.context.updateMany({
        where: { id: { in: contexts.map((c) => c.id) } },
        data: { methodCount: { increment: 1 } },
      })
    }

    return updated
  })
}

async function ensureProblems(titles: string[]) {
  const unique = [...new Set(titles.map((t) => t.trim()).filter(Boolean))]
  return Promise.all(
    unique.map(async (title) => {
      const slug = slugifyProblem(title) || title
      return prisma.problem.upsert({
        where: { slug },
        update: {},
        create: { title, slug },
      })
    }),
  )
}

export async function ensureContexts(titles: string[]) {
  const unique = [...new Set(titles.map((t) => t.trim()).filter(Boolean))]
  return Promise.all(
    unique.map(async (title) => {
      const slug = slugifyProblem(title) || title
      return prisma.context.upsert({
        where: { slug },
        update: {},
        create: { title, slug },
      })
    }),
  )
}

export const methodFeedSelect = {
  id: true,
  title: true,
  situation: true,
  action: true,
  result: true,
  detail: true,
  mediaUrl: true,
  sources: true,
  difficulty: true,
  cost: true,
  duration: true,
  views: true,
  saves: true,
  usefuls: true,
  tried: true,
  successes: true,
  fails: true,
  remixes: true,
  outdated: true,
  score: true,
  parentId: true,
  lastActivityAt: true,
  createdAt: true,
  author: {
    select: { id: true, handle: true, name: true, avatarUrl: true, tier: true },
  },
  problems: {
    select: { problem: { select: { id: true, title: true, slug: true } } },
  },
  contexts: {
    select: { context: { select: { id: true, title: true, slug: true } } },
  },
  _count: {
    select: { children: true },
  },
} satisfies Prisma.MethodSelect

export type MethodFeedItem = Prisma.MethodGetPayload<{
  select: typeof methodFeedSelect
}>

/**
 * 피드 정렬: effectiveScore 기반.
 * 자식(remix)이 부모보다 effectiveScore 가 높으면, 부모의 점수를 child.score * factor 만큼 강등.
 */
export type FeedEntry = {
  method: MethodFeedItem
  successor: { id: string; title: string } | null
}

export async function getFeed(
  cursor?: string,
  take = 20,
): Promise<{ items: FeedEntry[]; nextCursor: string | null }> {
  const pool = await prisma.method.findMany({
    take: 200,
    orderBy: [{ lastActivityAt: 'desc' }],
    select: methodFeedSelect,
  })

  // parentId -> best child (effectiveScore 기준)
  const bestChildByParent = new Map<
    string,
    { id: string; title: string; es: number }
  >()
  for (const m of pool) {
    if (!m.parentId) continue
    const es = effectiveScore(m)
    const prev = bestChildByParent.get(m.parentId)
    if (!prev || es > prev.es) {
      bestChildByParent.set(m.parentId, { id: m.id, title: m.title, es })
    }
  }

  const ranked = pool
    .map((m) => {
      let es = effectiveScore(m)
      const bestChild = bestChildByParent.get(m.id)
      const superseded = bestChild && bestChild.es > es * 1.2
      if (superseded) {
        es = es * (1 - DECAY.childSupersedeFactor)
      }
      return {
        method: m,
        successor: superseded
          ? { id: bestChild!.id, title: bestChild!.title }
          : null,
        es,
      }
    })
    .sort((a, b) => b.es - a.es)

  const startIdx = cursor
    ? ranked.findIndex((r) => r.method.id === cursor) + 1
    : 0
  const page = ranked.slice(startIdx, startIdx + take)
  const nextCursor =
    startIdx + take < ranked.length
      ? ranked[startIdx + take - 1].method.id
      : null

  return {
    items: page.map(({ method, successor }) => ({ method, successor })),
    nextCursor,
  }
}

export async function searchMethods(query: string, take = 20) {
  const q = query.trim()
  if (!q) return []
  const pool = await prisma.method.findMany({
    take: 100,
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { situation: { contains: q, mode: 'insensitive' } },
        { action: { contains: q, mode: 'insensitive' } },
        { result: { contains: q, mode: 'insensitive' } },
        { problems: { some: { problem: { title: { contains: q, mode: 'insensitive' } } } } },
        { contexts: { some: { context: { title: { contains: q, mode: 'insensitive' } } } } },
      ],
    },
    select: methodFeedSelect,
  })
  return pool
    .map((m) => ({ m, es: effectiveScore(m) }))
    .sort((a, b) => b.es - a.es)
    .slice(0, take)
    .map((x) => x.m)
}

/**
 * 관련 방법 그룹. 각 섹션은 effectiveScore 내림차순.
 */
export type RelatedMethods = {
  byProblem: MethodFeedItem[]
  remixFamily: MethodFeedItem[]
  byAuthor: MethodFeedItem[]
}

export async function getRelated(
  methodId: string,
  take = 5,
): Promise<RelatedMethods> {
  const self = await prisma.method.findUnique({
    where: { id: methodId },
    select: {
      authorId: true,
      parentId: true,
      problems: { select: { problemId: true } },
    },
  })
  if (!self) {
    return { byProblem: [], remixFamily: [], byAuthor: [] }
  }

  const problemIds = self.problems.map((p) => p.problemId)

  const [byProblemRaw, remixFamilyRaw, byAuthorRaw] = await Promise.all([
    problemIds.length
      ? prisma.method.findMany({
          where: {
            id: { not: methodId },
            problems: { some: { problemId: { in: problemIds } } },
          },
          take: take * 3,
          orderBy: { score: 'desc' },
          select: methodFeedSelect,
        })
      : Promise.resolve([]),
    prisma.method.findMany({
      where: {
        id: { not: methodId },
        OR: [
          self.parentId ? { id: self.parentId } : {},
          self.parentId ? { parentId: self.parentId } : {},
          { parentId: methodId },
        ].filter((w) => Object.keys(w).length > 0),
      },
      take: take * 2,
      orderBy: { score: 'desc' },
      select: methodFeedSelect,
    }),
    prisma.method.findMany({
      where: { authorId: self.authorId, id: { not: methodId } },
      take: take * 2,
      orderBy: { score: 'desc' },
      select: methodFeedSelect,
    }),
  ])

  const rank = (items: MethodFeedItem[]) =>
    items
      .map((m) => ({ m, es: effectiveScore(m) }))
      .sort((a, b) => b.es - a.es)
      .slice(0, take)
      .map((x) => x.m)

  // 중복 제거: remixFamily 우선, 그 다음 byProblem, 마지막 byAuthor
  const usedIds = new Set<string>()
  const remixFamily = rank(remixFamilyRaw)
  remixFamily.forEach((m) => usedIds.add(m.id))

  const byProblem = rank(
    byProblemRaw.filter((m) => !usedIds.has(m.id)),
  )
  byProblem.forEach((m) => usedIds.add(m.id))

  const byAuthor = rank(byAuthorRaw.filter((m) => !usedIds.has(m.id)))

  return { byProblem, remixFamily, byAuthor }
}

/**
 * 이 방법의 후속작(가장 성공률/점수 높은 자식) 반환. 없으면 null.
 */
export async function findSuccessor(parentId: string): Promise<MethodFeedItem | null> {
  const children = await prisma.method.findMany({
    where: { parentId },
    select: methodFeedSelect,
  })
  if (children.length === 0) return null

  const parent = await prisma.method.findUnique({
    where: { id: parentId },
    select: methodFeedSelect,
  })
  if (!parent) return null

  const parentEs = effectiveScore(parent)
  const ranked = children
    .map((c) => ({ c, es: effectiveScore(c) }))
    .sort((a, b) => b.es - a.es)

  if (ranked[0].es > parentEs * 1.2) return ranked[0].c
  return null
}
