import { createServerClient } from './supabase';
import { generateToken, MAGIC_LINK_TTL_SECONDS } from './auth-token';
import type { Member } from './rbac';

/**
 * メアドに該当する会員にマジックリンクトークンを発行する。
 * 該当会員が存在しなければ null。
 */
export async function issueMagicLink(
  email: string,
  redirectTo: string | null = null,
): Promise<{ token: string; member: Member } | null> {
  const supabase = createServerClient();

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, email, display_name, role, is_staff')
    .eq('email', email.toLowerCase().trim())
    .is('deleted_at', null)
    .maybeSingle();

  if (memberError || !member) return null;

  const token = generateToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_SECONDS * 1000).toISOString();

  const { error } = await supabase
    .from('magic_link_tokens')
    .insert({
      token,
      member_id: member.id,
      expires_at: expiresAt,
      redirect_to: redirectTo,
    });

  if (error) throw new Error(`Failed to insert magic_link_token: ${error.message}`);

  return { token, member: member as Member };
}

/**
 * トークンを検証して該当会員と redirect_to を返す。
 * 検証成功時に used_at をセット（単回限り）。
 */
export async function consumeMagicLink(
  token: string,
): Promise<{ member: Member; redirectTo: string | null } | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('magic_link_tokens')
    .select(`
      token, expires_at, used_at, redirect_to,
      members:members!inner (id, email, display_name, role, is_staff, deleted_at)
    `)
    .eq('token', token)
    .maybeSingle();

  if (error || !data) return null;
  if (data.used_at) return null;
  if (new Date(data.expires_at) <= new Date()) return null;
  // @ts-expect-error supabase nested type
  const m = data.members;
  if (!m || m.deleted_at) return null;

  // 単回限りでマークする
  const { error: updateError } = await supabase
    .from('magic_link_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)
    .is('used_at', null);

  // 同時アクセスで既に消費されていた場合は失敗扱い
  if (updateError) return null;

  return {
    member: {
      id: m.id, email: m.email, display_name: m.display_name,
      role: m.role, is_staff: m.is_staff,
    },
    redirectTo: data.redirect_to,
  };
}
