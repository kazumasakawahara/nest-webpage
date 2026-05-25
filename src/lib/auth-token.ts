import { randomBytes, createHash } from 'node:crypto';

/**
 * URL-safe な 32バイト ランダム文字列を返す。
 * マジックリンクトークン / セッションIDの両方に使う。
 */
export function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * DBには平文トークンを保存しない方針なら hash を使う。
 * Phase 1 では magic_link_tokens.token に平文を入れる（既存スキーマ通り）が、
 * 監査・ログ出力時にハッシュを使いたい場面のためのヘルパ。
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export const MAGIC_LINK_TTL_SECONDS = 15 * 60;       // 15分
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30日
