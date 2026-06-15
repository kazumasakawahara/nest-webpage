# デプロイ手順（Cloudflare Workers）

> 2026-06-15 更新: 実態に合わせて全面改訂。当初は Cloudflare **Pages** 前提だったが、
> 実際は `@astrojs/cloudflare` アダプタによる **Workers** デプロイ（プロジェクト名 `nest-webpage`）。
> ドメイン切替の詳細は `domain-migration-checklist.md` を参照。

## 1. 構成の現状

- Cloudflare **Workers** プロジェクト `nest-webpage`（個人アカウント）
- GitHub `kazumasakawahara/nest-webpage` 連携で **`main` への push＝自動ビルド・デプロイ**
  - ※ feature ブランチへの push では本番（Worker）は更新されない。**main に入って初めてデプロイ**される。
- 確認用URL: `https://nest-webpage.kazumasa-kawahara.workers.dev`
- バインディング: ASSETS / IMAGES / KV `SESSION`

## 2. 環境変数・シークレット（最重要）

会員エリア（ログイン・セッション・メール）は実行時に以下を読む：

| キー | 種別 | 用途 |
|---|---|---|
| `SUPABASE_URL` | 変数 | Supabase プロジェクトURL |
| `SUPABASE_SERVICE_ROLE_KEY` | **シークレット** | サーバ側DBアクセス（RLSバイパス。**絶対に公開しない**） |
| `RESEND_API_KEY` | **シークレット** | マジックリンクメール送信 |
| `MAIL_FROM` | 変数 | 送信元アドレス |

### 設定場所と読み取り方法（Workers特有の注意）

- **Cloudflare → Workers & Pages → `nest-webpage` → 設定 → 変数とシークレット**（＝実行時）に登録する。
- コードは `src/lib/runtime-env.ts` の `getEnv()` 経由で **`cloudflare:workers` の `env`** から読む。
  - `@astrojs/cloudflare` v13 では **`import.meta.env` は実行時シークレットを読めない**（ビルド時の値）。
  - 旧 `Astro.locals.runtime` は廃止。実行時は `import { env } from 'cloudflare:workers'` が正解。
  - ローカル開発（`astro dev`）では `.env` を `import.meta.env` 経由でフォールバック取得。
- 実行時シークレットは**登録すれば既存デプロイに即反映**（再ビルド不要）。ただし `getEnv()` 対応コードが
  デプロイ済みであることが前提。

> ローカル開発用の `.env`（gitignore対象）例:
> `SUPABASE_URL=` / `SUPABASE_SERVICE_ROLE_KEY=` / `RESEND_API_KEY=` / `MAIL_FROM=`

## 3. カスタムドメイン

`www.nponest.org` への割当は **DNSをCloudflareへ移してから**。手順は `domain-migration-checklist.md` を参照。
現状ドメインは Wix 配信のままなので、当面は workers.dev URL で検証する。

## 4. SPF / DKIM / DMARC（Resend）

`noreply@nponest.org` などの独自ドメイン送信は、nponest.org のDNSがCloudflare（または現Wix DNS）に
TXT/MX を登録できる状態になってから：
1. Resend → Domains → Add domain（`nponest.org`）
2. 表示される TXT/MX を DNS に登録 → verified を待つ
3. verified 後に `MAIL_FROM` を `noreply@nponest.org` に切替
   - 検証前は Resend のテスト送信元（`onboarding@resend.dev`）で疎通確認可能

## 5. デプロイ＆検証手順

1. main に変更を入れる（feature ブランチを ff-merge → push）→ 自動デプロイ
2. 上記2の env を Workers に設定
3. 本番検証（workers.dev）:
   - `/members` に偽セッションCookieで 500 が出ない（→ 302）こと
   - `/members/sign-in` でメール送信 → マジックリンク受信 → クリック → セッション発行 → `/members` 表示
   - Supabase ダッシュボードで Total Requests が増えること
   - Resend の送信ログ（迷惑メール判定されていないか）
   - Workers の Observability ログでエラーが無いか

## 6. 切替後（独自ドメイン公開時）

- Supabase の `audit_logs` でサインインイベント確認
- `MAIL_FROM` を独自ドメインに切替済みか
- `PUBLIC_SITE_URL` が `https://www.nponest.org` を指すこと
