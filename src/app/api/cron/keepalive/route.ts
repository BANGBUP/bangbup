import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Supabase 무료 티어 DB 수면 방지.
 * Vercel Cron 으로 5분마다 호출 (vercel.json 에 설정).
 */
export async function GET(request: Request) {
  // cron secret 검증 (Vercel 자동 삽입)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const start = Date.now()
  await prisma.$queryRawUnsafe('SELECT 1')
  const ms = Date.now() - start

  return NextResponse.json({ ok: true, pingMs: ms })
}
