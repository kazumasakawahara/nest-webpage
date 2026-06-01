import { SESSION_TTL_SECONDS } from './auth-token';

export const SESSION_COOKIE_NAME = 'nest_sess';

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}
