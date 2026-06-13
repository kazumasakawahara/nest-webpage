import type { APIRoute } from 'astro';
import { createServerClient } from '../../../../lib/supabase';
import { createSignedPdfUrl } from '../../../../lib/pdf-url';
import { recordAudit } from '../../../../lib/audit';

export const prerender = false;

export const GET: APIRoute = async ({ params, request, locals, url }) => {
  const id = params.id;
  if (!id) return new Response('Bad Request', { status: 400 });

  // 通常は middleware で /members/* の未ログインはここに到達しないが、
  // 念のための型 narrowing & defense-in-depth として明示チェック
  const member = locals.member;
  if (!member) return new Response('Unauthorized', { status: 401 });

  // ?inline=1 でブラウザ内閲覧、無ければダウンロード
  const inline = url.searchParams.get('inline') === '1';

  const supabase = createServerClient();
  const { data: newsletter } = await supabase
    .from('newsletters')
    .select('id, title, pdf_path, visible')
    .eq('id', id)
    .maybeSingle();

  if (!newsletter || !newsletter.visible) {
    return new Response('Not Found', { status: 404 });
  }

  const signedUrl = await createSignedPdfUrl('newsletters', newsletter.pdf_path, {
    download: !inline,
  });

  await recordAudit({
    memberId: member.id,
    event: 'pdf_download',
    detail: { kind: 'newsletter', id, title: newsletter.title, mode: inline ? 'view' : 'download' },
    ip: request.headers.get('cf-connecting-ip'),
    userAgent: request.headers.get('user-agent'),
  });

  return Response.redirect(signedUrl, 302);
};
