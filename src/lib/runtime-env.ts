import { env as cfEnv } from 'cloudflare:workers';

/**
 * 実行時の環境変数（シークレット）を取得する。
 *
 * Cloudflare Workers では、ダッシュボードで設定した実行時シークレットは
 * `cloudflare:workers` の `env` から読む必要がある。
 * （@astrojs/cloudflare v13 では `import.meta.env` はビルド時に確定する値で、
 *  実行時シークレットは読み取れない。旧 `Astro.locals.runtime` は廃止済み。）
 *
 * ローカル開発（`astro dev` / ビルド）では `.env` を読む `import.meta.env`、
 * 次いで `process.env` にフォールバックする。
 */
export function getEnv(key: string): string | undefined {
  return (
    (cfEnv as Record<string, string | undefined>)?.[key] ??
    (import.meta.env as Record<string, string | undefined>)?.[key] ??
    (typeof process !== 'undefined' ? process.env?.[key] : undefined)
  );
}
