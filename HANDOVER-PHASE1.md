# 引き継ぎ書 — 会員専用エリア Phase 1 実装

> 最終更新：2026-05-26（火）朝 7時頃／作成者：Claude（前回セッション）
> Phase 1 = 認証付き会員エリアの初期実装。本ファイルは Task 4.3 以降を別セッションで再開する時に最初に読むファイル。
> 関連：`HANDOVER.md`（プロジェクト全体・元のリニューアル）、`docs/superpowers/specs/2026-05-24-members-area-phase1-design.md`（設計仕様）、`docs/superpowers/plans/2026-05-25-members-area-phase1.md`（実装計画）

---

## 0. 一目で（status summary）

- **ブランチ**：`feature/members-area`（origin より **21 commits ahead**）
- **進捗**：50 タスク中 **28 完了**（Stage 0-3 + Stage 4.1+4.2、56%）
- **認証基盤**：実 Supabase + 実 Resend で **end-to-end 動作確認済み**
- **次の着手点**：Stage 4.3（機関誌バックナンバー一覧）
- **コードは Cloudflare Workers 互換**（Node:crypto は使っていない、Web Crypto に統一）

---

## 1. 再開コマンド（コピペで動く）

```bash
cd /Users/k-kawahara/Projects/nest-webpage
git status                       # → clean、feature/members-area
git log --oneline -5             # 直近のコミットを確認

# テストと build 確認
npm run test                     # → 16 passing
npm run build                    # → clean（adapter のお知らせのみ）

# dev サーバ起動（ポートは 4321 が空かどうかで 4321 or 4322 になる）
npm run dev
```

ブラウザ：
```
http://localhost:4321/members/sign-in   （ポート要確認）
```

`kazumasa.kawahara@lawnest.net` でログイン → メール内リンク → `/members/` に到達できれば OK。

---

## 2. 完了済みタスク

### Stage 0 — Foundation（5/5 ✅）
- 0.1 `@astrojs/cloudflare` adapter 導入（`output: 'static'` + adapter で hybrid 同等）
- 0.2 `src/env.d.ts` の型定義（ImportMetaEnv / App.Locals.member）
- 0.3 Vitest テスト基盤
- 0.4 ディレクトリ骨格
- 0.5 Playwright E2E 基盤（chromium 1個だけ動作確認）

### Stage 1 — Database（8/8 ✅）
- 1.1 `db/README.md` Supabase セットアップ手順書
- 1.2〜1.8 マイグレーション `0001_members.sql` 〜 `0008_rls_policies.sql`
  - すべて Supabase 本番プロジェクトに適用済み
  - RLS 有効化（service_role バイパス前提の deny-by-default）

### Stage 2 — Lib layer（8/8 ✅）
- 2.1 `src/lib/supabase.ts` — `createServerClient()`
- 2.2 `src/lib/rbac.ts` — `Member` 型、`canAccessRoute`、`isPublicRoute`（**TDD 9 tests**）
- 2.3 `src/lib/auth-token.ts` — `generateToken()`（**Web Crypto 版、Cloudflare 互換**）（**TDD 2 tests**）
- 2.4 `src/lib/cookies.ts` — `SESSION_COOKIE_NAME`, `sessionCookieOptions()`（**TDD 4 tests**）
- 2.5 `src/lib/session.ts` — `createSession`, `getMemberBySession`, `deleteSession`
- 2.6 `src/lib/magic-link.ts` — `issueMagicLink`, `consumeMagicLink`（TOCTOU 対策済み）
- 2.7 `src/lib/resend.ts` — `sendMagicLinkEmail`
- 2.8 `src/lib/audit.ts` + `src/lib/pdf-url.ts` — 監査ログ、PDF 署名URL

### Stage 3 — Middleware + 認証フロー（5/7 ✅）
- 3.1 `src/middleware.ts` — 認証・認可・Cache-Control（**withNoStore は Response clone 必須**）
- 3.2+3.3（統合）`src/pages/members/sign-in.astro` — GET/POST 両対応（**`.astro` と `.ts` は同パス共存不可**）
- 3.4 `src/pages/members/verify.ts` — マジックリンク消費・セッション発行
- 3.5 `src/pages/members/sign-out.ts` — セッション削除（GET も許容、SameSite=Lax 前提）
- **3.6 sign-in E2E（後回し）**
- **3.7 authorization E2E + dev-login ヘルパ（後回し）**

### Stage 4（部分完了 2/9）
- 4.1 ✅ `src/layouts/MembersLayout.astro` + `src/components/members/MembersNav.astro`
- 4.2 ✅ `src/pages/members/index.astro`（会員トップ、空状態フォールバックあり）

---

## 3. 未着手タスク（次の着手順）

### 推奨着手順

1. **Task 4.3** 機関誌バックナンバー一覧（`/members/newsletter/`）
2. **Task 4.4** 機関誌 PDF DL エンドポイント（`/members/newsletter/[id]/download`）
3. **Task 4.5** 家族会ページ（`/members/family/`、family ロール限定）
4. **Task 4.6** 議事録 PDF DL（`/members/family/minutes/[id]/download`）
5. **Task 4.7** 自分ノート紹介（`/members/my-note/`）
6. **Task 4.8** コミュニティ（`/members/community/`、LINE OC + Instagram）
7. **Task 4.9** 個情法説明（`/members/privacy`）
8. **Stage 5**（6タスク）管理画面
9. **Stage 6**（5タスク）統合・仕上げ
10. **Stage 7**（2タスク）UAT・運用文書
11. **後回しタスク**：Stage 3.6 + 3.7 の E2E テスト

### 残タスク数：22 タスク

---

## 4. 環境状態

### Supabase

| 項目 | 値 |
|---|---|
| プロジェクト名 | `nest-webpage-pro`（計画書では `nest-members-prod` と書いたが、河原さん命名） |
| リージョン | Tokyo（ap-northeast-1）|
| Project URL | `https://daaeclrkdirnnxdlrjwp.supabase.co` |
| Storage バケット | `newsletters`（Private）、`family-minutes`（Private）|
| マイグレーション | 0001〜0008 すべて適用済み |
| 初回スタッフ | `kazumasa.kawahara@lawnest.net`（family + is_staff=true）|

### Resend

| 項目 | 値 |
|---|---|
| API キー | `.env.local` に設定済み |
| 送信ドメイン | `onboarding@resend.dev`（Resend の検証済みドメイン、開発用）|
| 本番用 | `noreply@nponest.org`（DKIM/SPF 設定後に切替、`.env.local` 8行目にコメント保管）|

### `.env.local`（git 管理外）

存在を確認するだけで OK：
```bash
grep -c '^[A-Z_]*=' /Users/k-kawahara/Projects/nest-webpage/.env.local
# → 6 が出れば必要な値が全部入っている
```

中身の概要：
```
SUPABASE_URL                  → 設定済
SUPABASE_ANON_KEY             → sb_publishable_... 形式（新キー）
SUPABASE_SERVICE_ROLE_KEY     → sb_secret_... 形式（新キー）
RESEND_API_KEY                → re_... 形式
MAIL_FROM                     → "NPO法人 nest <onboarding@resend.dev>"
PUBLIC_SITE_URL               → https://www.nponest.org
```

---

## 5. 動作確認済み（次回再現しなくて良いもの）

- ✅ Vitest 単体テスト 16 件すべて GREEN
- ✅ `npm run build` クリーン
- ✅ Cloudflare adapter の SSR エントリ生成
- ✅ Supabase 接続（service_role 経由でテーブル参照可能）
- ✅ Resend 送信（実メアドへの送信成功）
- ✅ マジックリンク発行 → トークン保存 → メール到達 → クリック → セッション発行 → Cookie 設定
- ✅ middleware 通過：認証必須エリアへの未ログインアクセスは sign-in にリダイレクト
- ✅ 会員トップで `Astro.locals.member.display_name` が「河原一雅」と表示
- ✅ MembersNav が family + is_staff の場合に全 6 項目表示
- ✅ ログアウト → セッション削除 → Cookie 削除 → sign-in に戻る

---

## 6. 重要な実装判断・スペックからの逸脱

### 6.1 認証は Auth.js ではなく **自前マジックリンク**

設計仕様では Auth.js を選択肢に挙げていたが、Astro 連携が third-party 依存で重いため、約150行の自前実装に切替。判断理由は計画書冒頭の "Implementation Note" 参照。

### 6.2 sign-in は `.astro` + `.ts` ではなく **`.astro` 1ファイル**

Astro のルーティングで `.astro` と `.ts` が同パスに共存できないため、`Astro.request.method` で GET/POST を分岐する単一ファイルに統合（計画書 Task 3.2 に注釈追記済み）。

### 6.3 Web Crypto に統一（**Cloudflare Workers 互換**）

`node:crypto` は Cloudflare Workers でデフォルト未サポート。`generateToken()` は `crypto.getRandomValues` + 自前 base64url エンコードに切替。`hashToken()` は YAGNI で削除（未使用だった）。

### 6.4 RBAC prefix matching の厳密化

`startsWithAny` の第3項 `path.startsWith(p)` を削除。`/members/familyabc` が `/members/family/*` 扱いされる誤検知を防止。回帰テスト追加済み。

### 6.5 magic-link 消費の TOCTOU 対策

`consumeMagicLink` の UPDATE で `.select('token')` を付け、実際に1行更新されたか確認。同時アクセスで二重消費されない保証を追加。

### 6.6 middleware の Cache-Control は **Response clone 必須**

`Response.redirect()` や Cloudflare adapter 経由の redirect は immutable headers を持つため、`headers.set()` で例外発生。`withNoStore()` は新 Response を組み立てる実装に変更。

### 6.7 マジックリンク URL は **`Astro.url.origin` を使用**

`PUBLIC_SITE_URL` を直接埋め込むと開発時にも本番ドメインを指してしまう。`Astro.url.origin` でリクエスト host に追従させる方式に変更。

### 6.8 sign-out は **GET も許容**

設計の妥協点。SameSite=Lax により実害は限定的、UI 上のリンクから素直にログアウトできる UX を優先。コードコメントで明示。

### 6.9 旧 `src/pages/members.astro` を **廃止済み**

URL シークレット方式の旧ページは、Task 4.2 で SSR 版を作成するタイミングで `git rm` 済み。計画 Task 6.1 のリダイレクト実装は不要になった。

### 6.10 BaseLayout に **`<slot name="head" />` を追加**

MembersLayout が `<Fragment slot="head">noindex meta</Fragment>` で noindex を注入できるように、BaseLayout に名前付きスロットを追加した。

---

## 7. つまずきポイント（次回再現しないために）

| 罠 | 症状 | 対処 |
|---|---|---|
| dev サーバが古いポートに残っている | 修正がブラウザに反映されない | `lsof -i :4321` で確認、または `npm run dev` の出力で localhost:XXXX を確認 |
| `.env.local` 変更後、dev サーバを再起動していない | env 変数の修正が効かない | Ctrl+C → `npm run dev` |
| Astro の `.astro` と `.ts` が同パスにある | `.astro` が優先され `.ts` 無視 | 1つのファイルで `Astro.request.method` 分岐に統合 |
| `node:crypto` import | Cloudflare Workers ランタイムで失敗 | Web Crypto API に切替（既に対応済み） |
| `void supabase.from(...).update(...)` | HTTP リクエスト発火しない（PromiseLike） | `.then(() => undefined, () => undefined)` を付ける（既に対応済み）|
| `Response.redirect()` の headers に `.set()` | "Can't modify immutable headers" 例外 | 新 Response を組み立て直す（既に対応済み）|
| `PUBLIC_SITE_URL` を直接埋め込む | 開発時のメールリンクが本番ドメインに | `Astro.url.origin` を使う（既に対応済み）|
| TypeScript の `paths` に `baseUrl` を付ける | TS 6 で deprecated | `baseUrl` 削除、`paths` 単体で動く |
| マジックリンクをクリックする前に時間が経つ | 15分でトークン期限切れ | 新規発行（仕様通り）|

---

## 8. ファイル所在（Stage 4.3 以降で触る or 参照するもの）

### 既に存在する（参照／import のみ）
| ファイル | 内容 |
|---|---|
| `src/lib/supabase.ts` | `createServerClient()` |
| `src/lib/rbac.ts` | `Member` 型、`canAccessRoute` |
| `src/lib/audit.ts` | `recordAudit`、`AuditEvent` 型 |
| `src/lib/pdf-url.ts` | `createSignedPdfUrl(bucket, path)` |
| `src/layouts/MembersLayout.astro` | 会員エリア共通レイアウト |
| `src/components/members/MembersNav.astro` | 会員ナビ |

### Stage 4.3 以降で新規作成するもの（計画通り）
| 新ファイル | タスク |
|---|---|
| `src/components/members/PdfCard.astro` | 4.3 |
| `src/pages/members/newsletter/index.astro` | 4.3 |
| `src/pages/members/newsletter/[id]/download.ts` | 4.4 |
| `src/pages/members/family/index.astro` | 4.5 |
| `src/pages/members/family/minutes/[id]/download.ts` | 4.6 |
| `src/pages/members/my-note/index.astro` | 4.7 |
| `src/pages/members/community/index.astro` | 4.8 |
| `src/pages/members/privacy.astro` | 4.9 |
| `src/pages/members/admin/*` | Stage 5 |

### 設計・計画
| ファイル | 用途 |
|---|---|
| `docs/superpowers/specs/2026-05-24-members-area-phase1-design.md` | 設計仕様（spec） |
| `docs/superpowers/plans/2026-05-25-members-area-phase1.md` | 実装計画（plan）— Task ごとのコード片あり |
| `db/README.md` | Supabase セットアップ手順 |

---

## 9. 次回セッションの開始方法

### A. 河原さんが Claude に依頼するときのテンプレ

```
@HANDOVER-PHASE1.md を読んで、Stage 4.3 から実装を再開してください。
feature/members-area ブランチで作業します。
Stage 3 まで認証フロー動作確認済み、Stage 4.1+4.2 まで完了済みです。
```

### B. Claude（再開時の私）がやるべき手順

1. **このファイル（HANDOVER-PHASE1.md）を読む**
2. `git log --oneline -10` で直近コミットを確認
3. `npm run test`、`npm run build` で現状確認
4. `docs/superpowers/plans/2026-05-25-members-area-phase1.md` の Task 4.3 セクションを開く
5. `superpowers:subagent-driven-development` スキルで実装再開
   - 1人の implementer に複数の関連タスクをまとめて依頼するパターンを継続
   - Stage 4.3+4.4（機関誌一覧 + PDF DL）は1人にまとめるのが効率的
6. 各バッチで spec compliance + code quality review を必ず実施

### C. 河原さんが事前にやっておくと良いこと（任意）

- `git push origin feature/members-area` でリモートにバックアップ
- `.env.local` のバックアップを 1Password 等に保管
- 機関誌「巣箱」の最新号 PDF を Supabase Storage `newsletters` バケットにテスト アップロード（Task 4.3 の UAT 用）
- 家族会議事録の PDF サンプルを `family-minutes` バケットにアップロード（Task 4.5 の UAT 用）

---

## 10. 残課題リスト（軽い順）

| 優先度 | 項目 | 着手タイミング |
|---|---|---|
| ★★ | Task 4.3〜4.9 実装 | 次回セッション |
| ★★ | Stage 5 管理画面 | 次々回セッション |
| ★ | Stage 6.1〜6.5 統合・仕上げ | Stage 4-5 完了後 |
| ★ | Stage 3.6+3.7 E2E テスト | Stage 4-5 安定後、まとめて |
| ★ | Stage 7 UAT・運用文書 | リリース前 |
| 検討 | 自分ノート Web 入力ツール（Phase 2） | Phase 1 リリース後 |
| 検討 | Resend で nponest.org ドメイン認証（SPF/DKIM） | 本番リリース直前 |
| 検討 | Cloudflare Pages へのデプロイ | 全タスク完了後 |
| 検討 | LINE オープンチャットの招待 URL を取得して Task 4.8 で使う | 任意のタイミング |

---

## 11. このセッションのコミット履歴（参考）

直近の21コミット（`d28a0d5` 以降が Phase 1 関連）：

```
f1f5f10 fix(members-layout): drop redundant org name from page title
c34af92 feat(members): replace legacy static page with SSR members home
890c493 feat(members): add members-area shared layout and nav
31b5f12 fix(middleware): clone response in withNoStore to avoid immutable headers error
eb91791 fix(sign-in): use request origin for magic link URL instead of PUBLIC_SITE_URL
de97613 fix(auth): close 3 critical and 3 important auth review findings
a42f98b docs(plan): merge Tasks 3.2 and 3.3 — Astro routing requires unified page
e0a86d8 feat(members): add sign-out endpoint clearing session
12c1351 feat(members): add magic link verify endpoint creating session
b8a88e8 feat(members): add sign-in page with magic link issuance
c40ef36 feat: add auth middleware with route protection and cache headers
6d9f18e refactor(auth-token): switch to Web Crypto for Cloudflare compatibility
6a7f04a fix(session): force fire-and-forget update to actually execute
96a9148 feat(lib): add audit logging and PDF signed URL helpers
5f46bf7 feat(lib): add Resend transactional email integration
370f9b3 feat(lib): add magic link issuance and consumption
5eaf8ac feat(lib): add session create/get/delete operations
fc74b03 fix(rbac): tighten prefix matching to avoid false positive sub-path matches
fb4d9dc feat(lib): add session cookie helpers
97defa3 feat(lib): add auth token generation and hashing helpers
53fb0aa feat(lib): add RBAC route access logic with tests
（以下 Stage 0-1 のコミット続く）
```

---

## 12. 連絡・参照先

- **法人サイト現行版**：https://www.nponest.org/（旧 Wix サイト、まだ生きている）
- **Supabase ダッシュボード**：https://supabase.com/dashboard
- **Resend ダッシュボード**：https://resend.com
- **事務局**：093-582-7018（平日 8:00〜20:00）
- **代表 / 個人情報管理者**：林 澄江
- **所在地**：〒803-0851 福岡県北九州市小倉北区木町3丁目6−7

---

以上。再開時に詰まったら、設計仕様（spec）と実装計画（plan）の Task 番号をピンポイントで参照すると効率的です。

お疲れさまでした 🌱
