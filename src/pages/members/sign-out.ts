import type { APIRoute } from 'astro';
import { deleteSession } from '../../lib/session';
import { SESSION_COOKIE_NAME } from '../../lib/cookies';
import { recordAudit } from '../../lib/audit';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const sessionId = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    await deleteSession(sessionId);
    cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
  }
  await recordAudit({
    memberId: locals.member?.id ?? null,
    event: 'sign_out',
    ip: request.headers.get('cf-connecting-ip'),
    userAgent: request.headers.get('user-agent'),
  });
  return Response.redirect(new URL('/members/sign-in', request.url), 303);
};

// GET でもログアウトできるようにしておく（ナビからのリンクで使う）。
// SameSite=Lax により <img>/embed 経由の CSRF は防げる。
// ユーザがクロスサイトリンク経由で誘導される CSRF リスクは残るが、影響は
// 「ログアウトされるだけ」で、Phase 1 では UX 優先で許容する。
export const GET = POST;
