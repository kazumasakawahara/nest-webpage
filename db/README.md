# Supabase 準備手順（Phase 1）

## 1. プロジェクト作成
1. https://supabase.com/dashboard で新規プロジェクト作成
2. リージョン: **Tokyo (ap-northeast-1)** を選択
3. プロジェクト名: `nest-members-prod`（ステージング用は `nest-members-staging`）
4. データベースパスワードを安全に保管

## 2. 認証情報の取得
- Project Settings → API
  - `Project URL` → `SUPABASE_URL`
  - `anon public` → `SUPABASE_ANON_KEY`
  - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`（**サーバ専用、漏洩厳禁**）

## 3. Storage バケット作成
- Storage → New bucket
  - 名前: `newsletters`、Public: **OFF**
  - 名前: `family-minutes`、Public: **OFF**

## 4. マイグレーション実行
ローカルから順番に SQL を流し込む。Supabase Studio の SQL Editor で：
1. `0001_members.sql`
2. `0002_magic_link_tokens.sql`
3. `0003_sessions.sql`
4. `0004_newsletters.sql`
5. `0005_family_meetings.sql`
6. `0006_announcements.sql`
7. `0007_audit_logs.sql`
8. `0008_rls_policies.sql`

## 5. 初回スタッフユーザー作成
`0001_members.sql` 適用後、Supabase Studio で `members` テーブルに1件 INSERT：
```sql
INSERT INTO members (email, display_name, role, is_staff, joined_at)
VALUES ('kazumasa.kawahara@lawnest.net', '河原一雅', 'family', true, CURRENT_DATE);
```

## 6. ローカル環境変数の設定
`.env.local` に Step 2 の値をコピー。

## 7. Phase 1 リリース後の運用
- 会員追加は管理画面 (`/members/admin/members`) から行う
- 直接 SQL Editor で操作する場合は、必ず Supabase 監査ログを確認
