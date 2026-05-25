import { createServerClient } from './supabase';
import { generateToken, SESSION_TTL_SECONDS } from './auth-token';
import type { Member } from './rbac';

export interface SessionRecord {
  session_id: string;
  member_id: string;
  expires_at: string;
}

/**
 * 新しいセッションを発行する。
 */
export async function createSession(memberId: string): Promise<SessionRecord> {
  const supabase = createServerClient();
  const sessionId = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  const { data, error } = await supabase
    .from('sessions')
    .insert({ session_id: sessionId, member_id: memberId, expires_at: expiresAt })
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to create session: ${error?.message}`);
  return data as SessionRecord;
}

/**
 * セッションIDから会員を取得する。
 * 有効期限切れ・存在しない → null
 */
export async function getMemberBySession(sessionId: string): Promise<Member | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      session_id,
      expires_at,
      members:members!inner (
        id, email, display_name, role, is_staff, deleted_at
      )
    `)
    .eq('session_id', sessionId)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;
  // @ts-expect-error supabase nested type
  const m = data.members;
  if (!m || m.deleted_at) return null;

  // last_seen_at を非同期で更新（失敗しても無視）
  void supabase.from('sessions')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('session_id', sessionId);

  return {
    id: m.id,
    email: m.email,
    display_name: m.display_name,
    role: m.role,
    is_staff: m.is_staff,
  };
}

/**
 * セッションを削除（ログアウト）
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.from('sessions').delete().eq('session_id', sessionId);
}
