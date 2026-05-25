import type { APIRoute } from 'astro';
import { consumeMagicLink } from '../../lib/magic-link';
import { createSession } from '../../lib/session';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '../../lib/cookies';
import { recordAudit } from '../../lib/audit';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? '';
  const ip = request.headers.get('cf-connecting-ip') ?? null;
  const ua = request.headers.get('user-agent') ?? null;

  if (!token) {
    return new Response('Bad Request', { status: 400 });
  }

  const result = await consumeMagicLink(token);

  if (!result) {
    await recordAudit({
      memberId: null,
      event: 'sign_in_failed',
      detail: { reason: 'invalid_or_expired_token' },
      ip, userAgent: ua,
    });
    return Response.redirect(
      new URL('/members/sign-in?m=invalid', request.url),
      303,
    );
  }

  const session = await createSession(result.member.id);
  cookies.set(SESSION_COOKIE_NAME, session.session_id, sessionCookieOptions());

  await recordAudit({
    memberId: result.member.id,
    event: 'sign_in_success',
    ip, userAgent: ua,
  });

  const redirect = result.redirectTo && result.redirectTo.startsWith('/members')
    ? result.redirectTo
    : '/members/';

  return Response.redirect(new URL(redirect, request.url), 303);
};
