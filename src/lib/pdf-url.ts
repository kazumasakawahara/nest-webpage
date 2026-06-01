import { createServerClient } from './supabase';

const PDF_URL_TTL_SECONDS = 5 * 60;

/**
 * Supabase Storage の private バケットから署名付き URL を発行する。
 * デフォルトは 5分の有効期限。
 */
export async function createSignedPdfUrl(
  bucket: 'newsletters' | 'family-minutes',
  path: string,
): Promise<string> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .createSignedUrl(path, PDF_URL_TTL_SECONDS, {
      download: true,
    });

  if (error || !data) throw new Error(`Failed to sign URL: ${error?.message}`);
  return data.signedUrl;
}
