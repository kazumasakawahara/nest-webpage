import { describe, it, expect } from 'vitest';
import { generateToken, hashToken } from '~/lib/auth-token';

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

describe('hashToken', () => {
  it('同じ入力に対して同じハッシュを返す', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'));
  });

  it('異なる入力に対して異なるハッシュを返す', () => {
    expect(hashToken('abc')).not.toBe(hashToken('abd'));
  });

  it('64文字の hex 文字列を返す（SHA-256）', () => {
    expect(hashToken('x')).toMatch(/^[0-9a-f]{64}$/);
  });
});
