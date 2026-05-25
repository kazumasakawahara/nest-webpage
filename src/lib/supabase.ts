import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Service role クライアント（サーバ側のみ。RLSバイパス）。
 * Astro エンドポイント / middleware 内でのみ使用すること。
 */
export function createServerClient(): SupabaseClient {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
