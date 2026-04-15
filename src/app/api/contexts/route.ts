import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 컨텍스트 자동완성. ?q= 접두어로 가장 많이 쓰인 순.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = (url.searchParams.get('q') ?? '').trim()

  const items = await prisma.context.findMany({
    where: q
      ? { title: { contains: q, mode: 'insensitive' } }
      : undefined,
    orderBy: [{ methodCount: 'desc' }, { title: 'asc' }],
    take: 10,
    select: { id: true, title: true, slug: true, methodCount: true },
  })
  return NextResponse.json({ items })
}
