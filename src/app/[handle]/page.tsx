import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { methodFeedSelect } from '@/lib/methods'
import { MethodCard } from '@/components/method-card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ handle: string }> }

export default async function ProfilePage({ params }: Props) {
  const { handle: raw } = await params
  const handle = raw.startsWith('%40') || raw.startsWith('@') ? raw.replace(/^(%40|@)/, '') : raw

  const user = await prisma.user.findUnique({
    where: { handle },
    select: {
      id: true,
      handle: true,
      name: true,
      avatarUrl: true,
      bio: true,
      tier: true,
      methodScore: true,
      createdAt: true,
      _count: { select: { methods: true, following: true, followedBy: true } },
    },
  })
  if (!user) notFound()

  const me = await getCurrentUser()
  const isMe = me?.id === user.id

  const [methods, savedRaw, triedRaw] = await Promise.all([
    prisma.method.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: 'desc' },
      select: methodFeedSelect,
      take: 30,
    }),
    isMe
      ? prisma.interaction.findMany({
          where: { userId: user.id, type: 'SAVE' },
          orderBy: { createdAt: 'desc' },
          take: 30,
          select: { method: { select: methodFeedSelect } },
        })
      : Promise.resolve([]),
    isMe
      ? prisma.interaction.findMany({
          where: { userId: user.id, type: 'TRIED' },
          orderBy: { createdAt: 'desc' },
          take: 30,
          select: { method: { select: methodFeedSelect } },
        })
      : Promise.resolve([]),
  ])

  const saved = savedRaw.map((i) => i.method)
  const tried = triedRaw.map((i) => i.method)

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-6 flex items-center gap-4">
        <Avatar className="size-20">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
          <AvatarFallback className="text-xl">
            {user.handle.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{user.name ?? user.handle}</h1>
            {user.tier !== 'NONE' && (
              <Badge variant="secondary">{user.tier}</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">@{user.handle}</p>
          {user.bio && <p className="text-sm">{user.bio}</p>}
          <div className="text-muted-foreground flex gap-4 text-xs">
            <span>방법 {user._count.methods}</span>
            <span>팔로워 {user._count.followedBy}</span>
            <span>팔로잉 {user._count.following}</span>
            <span>점수 {user.methodScore}</span>
          </div>
        </div>
        {isMe && (
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-muted-foreground hover:text-foreground text-xs underline"
            >
              로그아웃
            </button>
          </form>
        )}
      </header>

      <Tabs defaultValue="methods">
        <TabsList className="w-full">
          <TabsTrigger value="methods" className="flex-1">
            방법 {user._count.methods}
          </TabsTrigger>
          {isMe && (
            <>
              <TabsTrigger value="saved" className="flex-1">
                저장
              </TabsTrigger>
              <TabsTrigger value="tried" className="flex-1">
                써봄
              </TabsTrigger>
            </>
          )}
        </TabsList>
        <TabsContent value="methods" className="space-y-4 pt-4">
          {methods.length === 0 ? (
            <Empty text="아직 올린 방법이 없어요." />
          ) : (
            methods.map((m) => <MethodCard key={m.id} method={m} isAuthor={me?.id === m.author.id} />)
          )}
        </TabsContent>
        {isMe && (
          <>
            <TabsContent value="saved" className="space-y-4 pt-4">
              {saved.length === 0 ? (
                <Empty text="저장한 방법이 없어요." />
              ) : (
                saved.map((m) => <MethodCard key={m.id} method={m} isAuthor={me?.id === m.author.id} />)
              )}
            </TabsContent>
            <TabsContent value="tried" className="space-y-4 pt-4">
              {tried.length === 0 ? (
                <Empty text="써본 방법이 없어요." />
              ) : (
                tried.map((m) => <MethodCard key={m.id} method={m} isAuthor={me?.id === m.author.id} />)
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </main>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="text-muted-foreground border-muted rounded-lg border border-dashed p-8 text-center text-sm">
      {text}
    </div>
  )
}
