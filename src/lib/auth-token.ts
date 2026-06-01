/**
 * URL-safe な 32バイト ランダム文字列を返す。
 * マジックリンクトークン / セッションIDの両方に使う。
 *
 * Cloudflare Workers / Node v20+ 両方で動作する Web Crypto を使用。
 */
export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64urlEncode(bytes);
}

function base64urlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const MAGIC_LINK_TTL_SECONDS = 15 * 60;       // 15分
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30日
