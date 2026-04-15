import Link from 'next/link'
import { Home, Search, PlusSquare, SendHorizontal, User as UserIcon } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { buttonVariants } from '@/components/ui/button'

export async function Nav() {
  const user = await getCurrentUser()

  const items = [
    { href: '/feed', icon: Home, label: '피드' },
    { href: '/search', icon: Search, label: '검색' },
    { href: '/new', icon: PlusSquare, label: '올리기' },
    { href: '/requests', icon: SendHorizontal, label: '요청' },
  ]

  return (
    <nav className="bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-lg font-bold">
          방법
        </Link>
        <div className="flex items-center gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:bg-muted text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-md sm:w-auto sm:px-3"
              title={item.label}
            >
              <item.icon className="size-4" />
              <span className="ml-1.5 hidden text-sm sm:inline">{item.label}</span>
            </Link>
          ))}
          {user ? (
            <Link
              href={`/@${user.handle}`}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-md hover:opacity-80"
              title={user.handle}
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.handle}
                  className="size-7 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="size-4" />
              )}
            </Link>
          ) : (
            <Link href="/login" className={buttonVariants({ size: 'sm' }) + ' ml-2'}>
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
