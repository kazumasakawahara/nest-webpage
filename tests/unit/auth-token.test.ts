import { describe, it, expect } from 'vitest';
import { generateToken } from '~/lib/auth-token';

describe('generateToken', () => {
  it('43文字以上の base64url 文字列を返す', () => {
    const t = generateToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(t.length).toBeGreaterThanOrEqual(43);
  });

  it('呼び出し毎に異なる値を返す', () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
  });
});
