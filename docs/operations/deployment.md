# デプロイ手順（Cloudflare Pages）

## 1. GitHub リポジトリの準備
- リモートに `feature/members-area` を push（または main にマージ後 push）
- main にマージするのはステージング検証 OK 後

## 2. Cloudflare Pages プロジェクト作成
1. Cloudflare ダッシュボード → Pages → Create a project
2. Connect to Git → 該当リポジトリを選択
3. ビルド設定：
   - Production branch: `main`
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. 環境変数（Production / Preview それぞれ）：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` （**漏洩注意**）
   - `RESEND_API_KEY`
   - `MAIL_FROM`
   - `PUBLIC_SITE_URL`

## 3. カスタムドメイン
1. Pages → Custom domains → Set up a domain
2. `www.nponest.org` を追加
3. DNS で CNAME を Cloudflare 指定値に設定

## 4. SPF / DKIM / DMARC（Resend）
1. Resend ダッシュボード → Domains → Add domain（`nponest.org`）
2. 表示される TXT / MX レコードを DNS に登録
3. ステータスが verified になるまで待つ
4. verified になったら `MAIL_FROM` を `noreply@nponest.org` に切替

## 5. デプロイ確認
- `feature/members-area` を push して Preview URL が出ることを確認
- main にマージで Production にデプロイ
- ログインフロー（マジックリンク受信 → クリック → セッション発行）を本番で1度通す

## 6. 切替後の検証
- Resend ダッシュボードで実送信ログを確認（迷惑メール扱いされていないか）
- Cloudflare Pages の Functions ログでエラーが無いか
- Supabase の audit_logs テーブルでサインインイベントを確認
