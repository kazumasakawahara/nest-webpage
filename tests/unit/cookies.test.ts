import { describe, it, expect } from 'vitest';
import { sessionCookieOptions, SESSION_COOKIE_NAME } from '~/lib/cookies';

describe('sessionCookieOptions', () => {
  it('HttpOnly / Secure / SameSite=Lax を持つ', () => {
    const opts = sessionCookieOptions();
    expect(opts.httpOnly).toBe(true);
    expect(opts.secure).toBe(true);
    expect(opts.sameSite).toBe('lax');
  });

  it('30日の maxAge を持つ', () => {
    const opts = sessionCookieOptions();
    expect(opts.maxAge).toBe(30 * 24 * 60 * 60);
  });

  it('path が "/" である', () => {
    expect(sessionCookieOptions().path).toBe('/');
  });
});

describe('SESSION_COOKIE_NAME', () => {
  it('"nest_sess" である', () => {
    expect(SESSION_COOKIE_NAME).toBe('nest_sess');
  });
});
