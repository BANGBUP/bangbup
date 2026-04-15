import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'

/**
 * 현재 Supabase 세션 기반으로 DB User 를 반환. 없으면 프로비저닝.
 * 로그인 안 된 경우 null.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const existing = await prisma.user.findUnique({ where: { id: authUser.id } })
  if (existing) return existing

  // 최초 로그인 시 유저 레코드 생성
  const email = authUser.email ?? `${authUser.id}@placeholder.local`
  const metaName =
    (authUser.user_metadata?.full_name as string | undefined) ??
    (authUser.user_metadata?.name as string | undefined) ??
    null
  const avatarUrl =
    (authUser.user_metadata?.avatar_url as string | undefined) ?? null

  const baseHandle = generateHandle(email, metaName)
  const handle = await ensureUniqueHandle(baseHandle)

  return prisma.user.create({
    data: {
      id: authUser.id,
      email,
      handle,
      name: metaName,
      avatarUrl,
    },
  })
}

function generateHandle(email: string, name: string | null): string {
  const base =
    (name ?? email.split('@')[0] ?? 'user')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 16) || 'user'
  return base
}

async function ensureUniqueHandle(base: string): Promise<string> {
  let candidate = base
  let i = 0
  while (await prisma.user.findUnique({ where: { handle: candidate } })) {
    i += 1
    candidate = `${base}${i}`
    if (i > 100) {
      candidate = `${base}${Date.now().toString(36)}`
      break
    }
  }
  return candidate
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}
