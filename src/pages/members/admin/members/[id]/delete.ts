import type { APIRoute } from 'astro';
import { createServerClient } from '../../../../../lib/supabase';
import { recordAudit } from '../../../../../lib/audit';

export const prerender = false;

export const POST: APIRoute = async ({ params, locals, request }) => {
  const id = params.id;
  if (!id || !locals.member?.is_staff) {
    return new Response('Forbidden', { status: 403 });
  }
  const supabase = createServerClient();
  const { error } = await supabase
    .from('members')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return new Response(error.message, { status: 500 });

  // セッションも全部消す（即時ログアウト）
  await supabase.from('sessions').delete().eq('member_id', id);

  await recordAudit({
    memberId: locals.member.id,
    event: 'member_deleted',
    detail: { target_id: id },
    ip: request.headers.get('cf-connecting-ip'),
    userAgent: request.headers.get('user-agent'),
  });

  return Response.redirect(new URL('/members/admin/members', request.url), 303);
};
