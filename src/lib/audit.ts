import { createServerClient } from './supabase';

export type AuditEvent =
  | 'sign_in_request'
  | 'sign_in_success'
  | 'sign_in_failed'
  | 'sign_out'
  | 'pdf_download'
  | 'member_created'
  | 'member_updated'
  | 'member_deleted'
  | 'role_change';

export interface AuditDetail {
  [k: string]: unknown;
}

export async function recordAudit(params: {
  memberId?: string | null;
  event: AuditEvent;
  detail?: AuditDetail;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  const supabase = createServerClient();
  await supabase.from('audit_logs').insert({
    member_id: params.memberId ?? null,
    event: params.event,
    detail: params.detail ?? null,
    ip: params.ip ?? null,
    user_agent: params.userAgent ?? null,
  });
}
