import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { buttonVariants } from '@/components/ui/button'

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          방법닷컴
        </h1>
        <p className="text-muted-foreground text-lg">
          모든 문제에는 방법이 있다. 공유하고, 실천하고, 보상받자.
        </p>
      </div>

      <div className="flex gap-3">
        {user ? (
          <>
            <Link href="/feed" className={buttonVariants({ size: 'lg' })}>
              피드 보러가기
            </Link>
            <Link
              href={`/@${user.handle}`}
              className={buttonVariants({ size: 'lg', variant: 'outline' })}
            >
              내 프로필
            </Link>
          </>
        ) : (
          <Link href="/login" className={buttonVariants({ size: 'lg' })}>
            시작하기
          </Link>
        )}
      </div>

      {user && (
        <p className="text-muted-foreground text-sm">
          환영해요, <span className="font-medium">{user.name ?? user.handle}</span> 님
        </p>
      )}
    </main>
  )
}
