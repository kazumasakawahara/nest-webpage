import type { APIRoute } from 'astro';
import { createServerClient } from '../../../../../lib/supabase';
import { createSignedPdfUrl } from '../../../../../lib/pdf-url';
import { recordAudit } from '../../../../../lib/audit';

export const prerender = false;

export const GET: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) return new Response('Bad Request', { status: 400 });

  // middleware で /members/family/* は role === 'family' のみ通すが、
  // 念のため defense-in-depth として明示チェック
  const member = locals.member;
  if (!member || member.role !== 'family') {
    return new Response('Forbidden', { status: 403 });
  }

  const supabase = createServerClient();
  const { data: meeting } = await supabase
    .from('family_meetings')
    .select('id, title, minutes_pdf_path, visible')
    .eq('id', id)
    .maybeSingle();

  if (!meeting || !meeting.visible || !meeting.minutes_pdf_path) {
    return new Response('Not Found', { status: 404 });
  }

  const signedUrl = await createSignedPdfUrl('family-minutes', meeting.minutes_pdf_path);

  await recordAudit({
    memberId: member.id,
    event: 'pdf_download',
    detail: { kind: 'family_minutes', id, title: meeting.title },
    ip: request.headers.get('cf-connecting-ip'),
    userAgent: request.headers.get('user-agent'),
  });

  return Response.redirect(signedUrl, 302);
};
