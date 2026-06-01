export interface Member {
  id: string;
  email: string;
  display_name: string | null;
  role: 'member' | 'family';
  is_staff: boolean;
}

const PUBLIC_PATHS = [
  '/members/sign-in',
  '/members/verify',
  '/members/sign-out',
];

const FAMILY_PREFIXES = ['/members/family'];
const ADMIN_PREFIXES = ['/members/admin'];

function startsWithAny(path: string, prefixes: string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(p + '/'));
}

export function isPublicRoute(path: string): boolean {
  // Astro.url.pathname にクエリ文字列は含まれないため完全一致のみ
  return PUBLIC_PATHS.includes(path);
}

export function canAccessRoute(member: Member | null, path: string): boolean {
  if (isPublicRoute(path)) return true;
  if (!path.startsWith('/members/')) return true;
  if (!member) return false;

  if (startsWithAny(path, ADMIN_PREFIXES)) return member.is_staff;
  if (startsWithAny(path, FAMILY_PREFIXES)) return member.role === 'family';

  // /members/* の残りは member 以上
  return true;
}
