import { defineMiddleware } from 'astro:middleware';
import { canAccessRoute, isPublicRoute } from './lib/rbac';
import { getMemberBySession } from './lib/session';
import { SESSION_COOKIE_NAME } from './lib/cookies';

// /members/* から返るレスポンスには必ず Cache-Control を付与する
function withNoStore(response: Response): Response {
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const path = ctx.url.pathname;

  // /members 完全一致と /members/ 配下のみ対象（/membersclub などを誤検知しない）
  if (path !== '/members' && !path.startsWith('/members/')) {
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
    return withNoStore(await next());
  }

  // 未ログイン → サインインへリダイレクト（戻り先を保持）
  if (!member) {
    const redirect = encodeURIComponent(path + ctx.url.search);
    return withNoStore(ctx.redirect(`/members/sign-in?redirect=${redirect}`));
  }

  // ロール・スタッフ判定
  if (!canAccessRoute(member, path)) {
    return withNoStore(new Response('Forbidden', { status: 403 }));
  }

  return withNoStore(await next());
});
