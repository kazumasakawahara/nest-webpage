import { defineMiddleware } from 'astro:middleware';
import { canAccessRoute, isPublicRoute } from './lib/rbac';
import { getMemberBySession } from './lib/session';
import { SESSION_COOKIE_NAME } from './lib/cookies';

export const onRequest = defineMiddleware(async (ctx, next) => {
  const path = ctx.url.pathname;

  // /members 以外は素通り
  if (!path.startsWith('/members')) {
    return next();
  }

  // 公開パス（sign-in / verify / sign-out）は素通りだが、Cache-Control だけ付ける
  const isPublic = isPublicRoute(path);

  // セッション解決
  const sessionId = ctx.cookies.get(SESSION_COOKIE_NAME)?.value;
  const member = sessionId ? await getMemberBySession(sessionId) : null;
  if (member) ctx.locals.member = member;

  // 公開パスはアクセス制御スキップ
  if (isPublic) {
    const response = await next();
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }

  // 未ログイン → サインインへリダイレクト（戻り先を保持）
  if (!member) {
    const redirect = encodeURIComponent(path + ctx.url.search);
    return ctx.redirect(`/members/sign-in?redirect=${redirect}`);
  }

  // ロール・スタッフ判定
  if (!canAccessRoute(member, path)) {
    return new Response('Forbidden', { status: 403 });
  }

  const response = await next();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
});
