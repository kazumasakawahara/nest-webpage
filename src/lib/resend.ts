import { Resend } from 'resend';
import { getEnv } from './runtime-env';

function getResend(): Resend {
  const key = getEnv('RESEND_API_KEY');
  if (!key) throw new Error('RESEND_API_KEY is not set');
  return new Resend(key);
}

export interface MagicLinkEmailParams {
  to: string;
  displayName: string | null;
  magicLinkUrl: string;
  expiresInMinutes: number;
}

export async function sendMagicLinkEmail(p: MagicLinkEmailParams): Promise<void> {
  const resend = getResend();
  const from = getEnv('MAIL_FROM');
  if (!from) throw new Error('MAIL_FROM is not set');

  const greeting = p.displayName ? `${p.displayName} 様` : 'nest 会員の皆様';

  const text = [
    `${greeting}`,
    '',
    'NPO法人 nest 会員ページのログインリンクをお送りします。',
    '',
    '下記リンクを ' + p.expiresInMinutes + ' 分以内にクリックしてください：',
    p.magicLinkUrl,
    '',
    'リンクは一度だけ有効です。心当たりが無い場合は破棄してください。',
    '',
    '——',
    'NPO法人 nest',
    '093-582-7018（平日 8:00〜20:00）',
  ].join('\n');

  const { error } = await resend.emails.send({
    from,
    to: p.to,
    subject: '【nest】会員ページ ログインリンク',
    text,
  });

  if (error) throw new Error(`Resend send failed: ${error.message}`);
}
