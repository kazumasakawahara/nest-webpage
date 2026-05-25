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

// GET でもログアウトできるようにしておく（ナビからのリンクで使う）
export const GET = POST;
