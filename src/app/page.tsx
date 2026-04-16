import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { buttonVariants } from '@/components/ui/button'

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-10 px-6 text-center">
      <div className="space-y-5">
        <div className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
          bangbup.com
        </div>
        <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
          모든 문제엔{' '}
          <span className="bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
            방법
          </span>
          이 있다
        </h1>
        <p className="text-muted-foreground mx-auto max-w-md text-balance text-lg">
          짧게 공유하고, 직접 써보고, 효과 본 만큼 보상받는 노하우 SNS.
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
