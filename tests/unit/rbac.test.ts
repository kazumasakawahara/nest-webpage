import { describe, it, expect } from 'vitest';
import { canAccessRoute, type Member } from '~/lib/rbac';

const memberOnly: Member = {
  id: 'm1', email: 'a@b.c', display_name: null,
  role: 'member', is_staff: false,
};
const familyMember: Member = { ...memberOnly, role: 'family' };
const staffMember: Member = { ...memberOnly, is_staff: true };
const staffFamily: Member = { ...memberOnly, role: 'family', is_staff: true };

describe('canAccessRoute', () => {
  it('未ログイン: 認証必要なら拒否', () => {
    expect(canAccessRoute(null, '/members/newsletter/')).toBe(false);
    expect(canAccessRoute(null, '/members/sign-in')).toBe(true);
  });

  it('member は標準ページに入れる', () => {
    expect(canAccessRoute(memberOnly, '/members/')).toBe(true);
    expect(canAccessRoute(memberOnly, '/members/newsletter/')).toBe(true);
    expect(canAccessRoute(memberOnly, '/members/community/')).toBe(true);
  });

  it('member は family ページに入れない', () => {
    expect(canAccessRoute(memberOnly, '/members/family/')).toBe(false);
  });

  it('family は family ページに入れる', () => {
    expect(canAccessRoute(familyMember, '/members/family/')).toBe(true);
    expect(canAccessRoute(familyMember, '/members/newsletter/')).toBe(true);
  });

  it('is_staff=true は admin に入れる', () => {
    expect(canAccessRoute(staffMember, '/members/admin/')).toBe(true);
    expect(canAccessRoute(staffFamily, '/members/admin/members')).toBe(true);
  });

  it('is_staff=false は admin に入れない', () => {
    expect(canAccessRoute(memberOnly, '/members/admin/')).toBe(false);
    expect(canAccessRoute(familyMember, '/members/admin/')).toBe(false);
  });

  it('公開パスは誰でもOK', () => {
    expect(canAccessRoute(null, '/members/sign-in')).toBe(true);
    expect(canAccessRoute(null, '/members/verify')).toBe(true);
    expect(canAccessRoute(null, '/members/sign-out')).toBe(true);
  });

  it('紛らわしいパス名で family/admin 制限を誤適用しない', () => {
    // ロール無しでもアクセス可能な /members/* のサブパスとして扱われるべき
    // (実際にはルートが存在しないが、prefix match の正確性を担保する)
    expect(canAccessRoute(memberOnly, '/members/familyabc')).toBe(true);
    expect(canAccessRoute(memberOnly, '/members/family-newsletter')).toBe(true);
    expect(canAccessRoute(memberOnly, '/members/adminxyz')).toBe(true);
    expect(canAccessRoute(memberOnly, '/members/admin-archive')).toBe(true);
  });

  it('family 制限は厳密に "/members/family" ディレクトリ配下のみ', () => {
    expect(canAccessRoute(memberOnly, '/members/family')).toBe(false);     // 完全一致
    expect(canAccessRoute(memberOnly, '/members/family/')).toBe(false);    // 末尾スラッシュ
    expect(canAccessRoute(memberOnly, '/members/family/minutes/x')).toBe(false); // サブパス
    expect(canAccessRoute(familyMember, '/members/family')).toBe(true);
    expect(canAccessRoute(familyMember, '/members/family/')).toBe(true);
    expect(canAccessRoute(familyMember, '/members/family/minutes/x')).toBe(true);
  });
});
