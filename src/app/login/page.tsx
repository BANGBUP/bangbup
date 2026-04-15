'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState<'email' | 'google' | 'kakao' | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading('email')
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${appUrl}/auth/callback` },
    })

    setLoading(null)
    if (error) setError(error.message)
    else setMessage('메일함을 확인해주세요. 로그인 링크를 보냈어요.')
  }

  async function handleOAuth(provider: 'google' | 'kakao') {
    setLoading(provider)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${appUrl}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(null)
    }
    // 성공 시 provider로 리다이렉트됨
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">방법닷컴</CardTitle>
          <CardDescription>문제를 풀어주는 방법들의 SNS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuth('google')}
              disabled={loading !== null}
            >
              {loading === 'google' ? '이동 중...' : 'Google 로 계속하기'}
            </Button>
            <Button
              variant="outline"
              className="w-full bg-[#FEE500] text-black hover:bg-[#FEE500]/90"
              onClick={() => handleOAuth('kakao')}
              disabled={loading !== null}
            >
              {loading === 'kakao' ? '이동 중...' : '카카오 로 계속하기'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">또는</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading !== null}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading !== null}>
              {loading === 'email' ? '전송 중...' : '매직링크 받기'}
            </Button>
          </form>

          {message && (
            <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
          )}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
