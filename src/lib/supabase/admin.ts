import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * 서버 사이드 전용. service_role 키로 생성하므로 RLS 를 우회.
 * 반드시 서버 코드(API route, server action)에서만 사용.
 */
export function createAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
