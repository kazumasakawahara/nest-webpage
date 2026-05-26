# Phase 1 UAT チェックリスト

## 前提
- Supabase 本番環境（または検証用環境）にマイグレーション 0001〜0008 適用済み
- テスト用会員 3名（member / family / staff）を投入済み（最低限、自分1人は family + is_staff でログイン可能）
- Resend のドメイン認証済み（または `onboarding@resend.dev` で送信可能）

## A. 認証フロー
- [ ] `/members/` 未ログインアクセス → `/members/sign-in?redirect=...` にリダイレクト
- [ ] 登録済みメアドでサインイン → メール到着（15分以内）
- [ ] メール内リンクをクリック → ログイン成功 → `/members/` に到達
- [ ] 未登録メアドでサインイン → 「会員として登録されていません」表示
- [ ] サインアウト → セッション破棄 → `/members/sign-in` に戻る
- [ ] 既にログアウト済みの状態で `/members/admin/` 直アクセス → サインインへリダイレクト
- [ ] 15分経過後のリンクをクリック → 「無効な or 期限切れ」エラー表示

## B. 認可
- [ ] member ロールで `/members/family/` → 403
- [ ] family ロールで `/members/family/` → アクセス可
- [ ] member ロールで `/members/admin/` → 403
- [ ] is_staff=true で `/members/admin/` → アクセス可

## C. 機関誌
- [ ] `/members/newsletter/` でバックナンバー一覧が表示される
- [ ] ダウンロードボタンクリック → PDF がダウンロードされる
- [ ] DL URL を5分後に再アクセス → 403 / 404（署名期限切れ）
- [ ] visible=false の機関誌は一覧に出ない

## D. 家族会
- [ ] family ロールで `/members/family/` で次回案内が見える
- [ ] 過去議事録の PDF DL が動く
- [ ] member ロールでは `/members/family/minutes/<id>/download` → 403

## E. 管理画面
- [ ] 会員追加 → 新規会員にマジックリンクが送れる
- [ ] 会員編集 → ロール変更・スタッフフラグ変更が反映される
- [ ] 退会処理 → 一覧から消える、その後のサインインで「未登録」扱い
- [ ] 機関誌登録 → 一覧と会員ページに反映
- [ ] 家族会の「次回」を切替 → 古い「次回」が解除される
- [ ] お知らせ作成（家族会員のみ）→ family ロールに表示、member には表示されない

## F. UX（高齢家族ペルソナ）
- [ ] iPad での表示崩れがない
- [ ] フォントサイズ・コントラストが既存サイトと同等
- [ ] ログインメール本文が日本語で読みやすい
- [ ] 操作で迷うラベル・専門用語がない

## G. 個人情報保護
- [ ] `/members/privacy` に法令対応の文言が記載されている
- [ ] 削除依頼の窓口（電話/メール）が明示されている

## H. キャッシュ
- [ ] `/members/` 以下のレスポンスに `Cache-Control: private, no-store` が付いている
- [ ] 公開ページ（/about, / 等）のキャッシュは従来通り

## I. 監査ログ
- [ ] Supabase Studio で `audit_logs` テーブルを確認
- [ ] sign_in_success / pdf_download / member_created が記録されている

すべてチェックが付いたら本番デプロイへ。
