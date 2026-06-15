import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from './runtime-env';

/**
 * Service role クライアント（サーバ側のみ。RLSバイパス）。
 * Astro エンドポイント / middleware 内でのみ使用すること。
 */
export function createServerClient(): SupabaseClient {
  const url = getEnv('SUPABASE_URL');
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
