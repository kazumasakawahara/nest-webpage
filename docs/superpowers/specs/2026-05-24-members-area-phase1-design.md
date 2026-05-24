# nest 会員専用エリア Phase 1 設計書

> 作成日：2026-05-24
> 対象：NPO法人 nest 公式サイト（`nest-webpage`）
> 関連：`HANDOVER.md` / `spec.md` / `src/pages/members.astro`（既存・URL シークレット方式）

---

## 0. 一行サマリー

既存 Astro v6 サイトに、**Auth.js（マジックリンク認証）+ Supabase（東京リージョン）** を組み合わせた認証付き会員エリアを増設し、**機関誌PDF配信・家族会向けコンテンツ・LINEオープンチャット導線・Instagram紹介** を提供する。**自分ノートは Phase 1 では紹介ページ＋PDFテンプレートDLのみ**とし、Web入力ツール化は Phase 2 に分離する。

---

## 1. 目的とスコープ

### 1.1 目的

会費会員（支援者・家族）に対して、**「会員でなければ得られない価値」を技術的にも保護された形で届ける**。具体的には：

1. **機関誌（会報誌）PDF を継続配信**する場を確保する
2. **家族会の運営**（次回案内・過去議事録）に必要な情報を、家族会員にだけ届ける
3. **既存コミュニティツール（LINEオープンチャット等）への入口**を提供する
4. **「自分ノート」普及活動の起点**となる紹介ページを設置する
5. 上記を、**福祉事業者として個人情報保護法の説明が成り立つ構成**で実現する

### 1.2 Phase 1 に含むもの

- 認証基盤（マジックリンク方式、パスキー任意で追加可能）
- ロール制御（会員資格：全会員 / 家族会員 の2階層 ＋ 管理権限フラグ）
- 機関誌バックナンバーのPDF配信
- 家族会専用ページ（次回案内・議事録PDF）
- 自分ノート紹介ページ＋PDFテンプレートDL
- LINEオープンチャット案内ページ
- Instagram 手動埋め込み（または公式アカウントへのリンク）
- 事務局向け最小管理画面（会員追加・削除・ロール変更、PDFアップロード、お知らせ編集）

### 1.3 Phase 1 に**含まない**もの（Phase 2 以降）

- 「自分ノート」の Web 入力ツール
- 会員同士のサイト内投稿・コメント・DM機能
- メーリングリスト一斉配信機能（メール送信は認証用マジックリンクのみ）
- イベント参加申込フォーム（既存の Googleフォームを継続利用）
- 寄付決済導線（既存の `join.astro` を継続利用）
- ダッシュボード的なパーソナライズ機能

### 1.4 成功条件

| # | 条件 | 検証方法 |
|---|---|---|
| S1 | 会員以外は `/members/*` の中身を閲覧・PDF取得できない | 未ログインで URL 直アクセス → `/members/sign-in` リダイレクト確認 |
| S2 | 家族会員以外は家族会コンテンツにアクセスできない | 非家族会員でログイン後、`/members/family/*` → 403 確認 |
| S3 | 高齢家族でもログインできる | UAT：パスワード不要のメール経由ログインフロー実施 |
| S4 | スタッフが PDF を追加・差し替え・削除できる | スタッフ画面から操作 → 一覧反映確認 |
| S5 | 個人情報保護法上の説明資料が用意される | 利用目的・保存場所・削除依頼窓口を明示したページ存在 |

---

## 2. 利用者とロール

### 2.1 ロール定義

会員資格は **`role` 列1つ**（階層構造）、管理権限は **`is_staff` フラグ**（独立した軸）の **2軸モデル** で表現する。

| 軸 | 列名 | 値 | 意味 |
|---|---|---|---|
| 会員資格（階層） | `role` | `member` | 全会員。基本コンテンツにアクセス可 |
| 〃 | `role` | `family` | 家族会員。`member` の権限を全て含み、家族会ページにもアクセス可 |
| 管理権限（独立軸） | `is_staff` | `true` / `false` | 管理画面アクセス可否。会員資格とは独立 |

**典型的な組み合わせ：**

| 想定者 | `role` | `is_staff` |
|---|---|---|
| 一般の賛助会員 | `member` | `false` |
| 家族会の家族 | `family` | `false` |
| 事務局スタッフ（会員でもある） | `family` または `member` | `true` |
| 林代表（家族会員かつ管理者） | `family` | `true` |

**運用ルール：**
- `role` 階層：`family > member`。家族会員は機関誌など `member` 向けコンテンツも閲覧可
- `is_staff` を持つ者は、管理画面 `/members/admin/*` にアクセス可
- 純粋な「管理だけして会員コンテンツは見ない」スタッフは想定しない（必要なら最低 `member` を付与）

### 2.2 想定ペルソナ

- **P1：60〜80代の家族**（メイン層）。スマホ／タブレットでメールは読める。パスワード管理は苦手。
- **P2：30〜50代の家族**。PC・スマホ両方使う。
- **P3：賛助会員（支援者）**。多くは寄付者で、サイトを覗く頻度は低い。
- **P4：林代表・事務局スタッフ**。管理画面利用者。河原さんを含む。

### 2.3 設計上の含意

P1 が成立することが最優先制約：
- **パスワード認証を主にしない**（マジックリンクをデフォルト）
- 文字サイズ・コントラスト・タップ領域は既存サイトのアクセシビリティ基準を踏襲
- ログイン UI は1画面で完結（メアド入力 → メール送信 → リンククリック）

---

## 3. 機能要件

### 3.1 認証

**方式：マジックリンク（パスワードレス）**

フロー：

```
1. /members/sign-in でメアド入力
2. 該当メアドが会員DBに登録されているか確認
   ├ 登録あり → ワンタイムトークン発行・メール送信
   └ 登録なし → 「会員登録は事務局へ」と案内（自動サインアップ不可）
3. 会員がメール内リンクをクリック（有効期限：15分）
4. トークン検証 → セッション Cookie 発行（有効期限：30日、HttpOnly, Secure, SameSite=Lax）
5. /members/ にリダイレクト
```

**任意拡張**：2回目以降のログイン時に、パスキー登録を案内（スキップ可能）。

**ログアウト**：`/members/sign-out` で Cookie 失効。

### 3.2 認可・ルート保護

Astro Middleware（`src/middleware.ts`）で実装：

```
/members/sign-in       → 認証不要
/members/sign-out      → 認証不要
/members/              → 認証済み（role: member 以上）
/members/newsletter/*  → 認証済み（role: member 以上）
/members/my-note/*     → 認証済み（role: member 以上）
/members/community/*   → 認証済み（role: member 以上）  ※Instagramセクションを内包
/members/family/*      → role: family
/members/admin/*       → is_staff: true
```

**未認証で保護ルート → `/members/sign-in?redirect=<元URL>`** にリダイレクト。ログイン後に元URLへ復帰。

**認可不足（ロール不足）→ 403 ページ表示**（リダイレクトはしない、混乱回避）。

### 3.3 機関誌配信（バックナンバー）

- ルート：`/members/newsletter/`
- 表示内容：機関誌「峠を越えて」のバックナンバー一覧（タイトル・発行月・表紙サムネ・ダウンロードボタン）
- PDF取得：ボタンクリック → サーバ側で **署名付き短期 URL（有効期限：5分）** を発行 → ブラウザがダウンロード
- 直接URL流出での無認可ダウンロードを防ぐ
- スタッフが管理画面からアップロード・並び替え・削除

### 3.4 家族会（家族会員のみ）

- ルート：`/members/family/`
- 表示内容：
  - 次回家族会の案内（日時・場所・議題・申込先）
  - 過去議事録の一覧と PDF ダウンロード
- お知らせは管理画面から編集
- 議事録 PDF も 3.3 と同じ署名付きURL方式

### 3.5 自分ノート（Phase 1 範囲）

- ルート：`/members/my-note/`
- 内容：
  - 「親なき後」に備える「自分ノート」とは何か、なぜ書くのかの説明
  - 推奨される項目セットの紹介（医療・生活・財産・希望）
  - **記入用 PDF テンプレートのダウンロード**（雛形は河原さん／nest 側で別途用意）
  - 参考リンク（厚労省「私のノート」、社協、家族会組織等）
  - Phase 2 で Web 入力ツール化予定の旨を予告

### 3.6 コミュニティ導線

- ルート：`/members/community/`
- 内容：
  - LINEオープンチャットの説明（目的・参加ルール・モデレーター）
  - QRコード画像 ＋ 招待URL
  - 既存 Instagram（`@kimachi_ya`）への導線

**運用ポリシー**：招待URL流出時の差し替え手順を README に記載。

### 3.7 Instagram 紹介

- ルート：3.6 と統合（`/members/community/` 内に Instagram セクションを設ける）
- 方式：**Phase 1 は「公式 Instagram プロフィールへの大きめのリンクボタン」のみ**
  - 理由：埋め込みは Instagram 側の仕様変更で表示崩れが起きやすく、運用負荷がある
  - 投稿の埋め込み表示は Phase 2 で検討（運用が回ることが見えてから）
- 補助：Instagram のスクリーンショットを1〜2枚静的に掲示するのは可（差し替えはスタッフが手動）

**注意**：将来埋め込みを行う場合、第三者の写真が映るものは肖像権・写り込みの確認を通常の SNS 運用と同様に行う。

### 3.8 お知らせ（会員向け）

- 会員エリアトップ `/members/` の最上部に表示
- スタッフが管理画面から編集（Markdown ベース、簡易エディタ）
- 1件のみ最新を表示（バナー的）

### 3.9 管理画面（最小限）

- ルート：`/members/admin/`
- 機能：
  1. **会員一覧 / 追加 / 編集 / 削除**
     - メアド・氏名・ロール・家族会フラグ・入会日・備考
     - 「ようこそメール」送信（任意）
  2. **機関誌PDF 管理**：アップロード、メタ情報編集、並び順、削除
  3. **家族会管理**：次回情報の編集、議事録PDFアップロード
  4. **お知らせ管理**：本文編集、公開ON/OFF
  5. **コミュニティ設定**：LINE 招待URL、Instagram 埋め込みコード

**Phase 1 では Supabase 管理画面を併用可**。専用 UI を作るのは「会員一覧」と「お知らせ編集」だけでも十分。

---

## 4. 非機能要件

### 4.1 セキュリティ

| 項目 | 方針 |
|---|---|
| トランスポート | 全ページ HTTPS（Cloudflare Pages が自動対応） |
| 認証Cookie | HttpOnly / Secure / SameSite=Lax / 有効期限30日 |
| マジックリンクトークン | 単回限り、有効期限15分、使用後即失効 |
| CSRF | SameSite=Lax + state パラメータで保護 |
| PDFキャッシュ | `Cache-Control: private, no-store` を会員エリア全体に付与 |
| 管理画面 | `is_staff = true` 限定 + IP制限なし（必要に応じ Phase 2 で検討） |
| パスワード | 採用しない（マジックリンク方式） |
| 監査ログ | ログイン・PDF DL・ロール変更を最低限記録（90日保持） |
| 依存パッケージ | `socket-mcp` の `depscore` で score < 0.8 の依存は要再検討 |

### 4.2 個人情報保護法対応

- **保存される個人情報**：氏名（任意）、メールアドレス、ロール、ログイン履歴、PDF DL履歴
- **保存場所**：Supabase 東京リージョン（国内）
- **第三者提供**：なし
- **越境移転**：なし（Supabase Tokyo 利用のため）
- **利用目的**：会員向けコンテンツ配信・本人確認・改善のための統計
- **削除依頼窓口**：事務局メール／電話を `/members/privacy` に明示
- 入会時に同意取得文を提示（テキストは別途確認）

### 4.3 パフォーマンス

- 既存 Astro 静的ページのパフォーマンスを劣化させない
- 会員エリアの初回描画 LCP < 2.5s（Cloudflare Edge）
- PDF 配信は署名付きURL経由でストレージから直接配信（サーバ経由しない）

### 4.4 アクセシビリティ

- 既存サイト（HANDOVER §3）と同じ基準
- 認証フローはキーボード操作可能
- `prefers-reduced-motion: reduce` を尊重

### 4.5 ブラウザ対応

- 既存サイトと同じ（Chrome / Safari / Firefox / Edge の各最新と1つ前）

---

## 5. アーキテクチャ

### 5.1 システム構成

```
┌──────────────────────────────────────────────────────────────┐
│                  Cloudflare Pages (Astro v6)                  │
│                                                                │
│  ┌──────────────────┐  ┌──────────────────────────────────┐  │
│  │  公開ページ群     │  │  会員エリア /members/             │  │
│  │  (静的)           │  │  - 認証Middleware                │  │
│  │  index.astro      │  │  - SSRページ                     │  │
│  │  about.astro      │  │  - PDF配信エンドポイント         │  │
│  │  …               │  │                                    │  │
│  └──────────────────┘  └──────────────────────────────────┘  │
│                                  │                             │
│                                  │ Cloudflare Functions       │
│                                  │ (Astro SSR adapter)        │
└──────────────────────────────────┼────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
   Supabase (Tokyo)            Resend                  Cloudflare R2
   - PostgreSQL                - Email送信             OR
   - Auth.js セッション         (マジックリンク)       Supabase Storage
   - 会員管理                                          - PDF保存
   - お知らせ                                          - 署名付きURL発行
   - 監査ログ
```

### 5.2 技術スタック

| レイヤ | 採用 | バージョン目安 |
|---|---|---|
| フレームワーク | Astro v6 | 既存 |
| 認証 | Auth.js (旧 NextAuth) v5 系の Astro 連携 | 最新 |
| DB | Supabase PostgreSQL（東京リージョン） | 最新 |
| ストレージ | Supabase Storage（または Cloudflare R2） | 最新 |
| メール送信 | Resend | 最新 |
| 言語 | TypeScript（既存設定） | 既存 |
| スタイル | 既存 `global.css` のCSS変数を踏襲 | 既存 |
| デプロイ | Cloudflare Pages + Functions | — |

**Astro アダプタ**：`@astrojs/cloudflare`（SSR を Cloudflare Functions で動かす）

### 5.3 ディレクトリ構成（追加分）

```
src/
├ middleware.ts                      ← 認証・認可ミドルウェア
├ pages/
│   ├ members/
│   │   ├ index.astro                ← 会員トップ（お知らせ・最新機関誌）
│   │   ├ sign-in.astro              ← ログイン
│   │   ├ sign-out.ts                ← API: ログアウト
│   │   ├ verify.ts                  ← API: マジックリンク検証
│   │   ├ newsletter/
│   │   │   ├ index.astro            ← バックナンバー一覧
│   │   │   └ [id]/download.ts       ← API: 署名付きURL発行
│   │   ├ family/
│   │   │   ├ index.astro
│   │   │   └ minutes/[id]/download.ts
│   │   ├ my-note/index.astro
│   │   ├ community/index.astro      ← LINE OC案内＋Instagramセクション
│   │   ├ privacy.astro              ← 会員エリアの個情法説明
│   │   └ admin/
│   │       ├ index.astro
│   │       ├ members.astro
│   │       ├ newsletters.astro
│   │       ├ family.astro
│   │       └ announcements.astro
├ components/members/                 ← 会員エリア専用部品
│   ├ MembersHeader.astro
│   ├ MembersNav.astro
│   ├ PdfCard.astro
│   └ SignInForm.astro
├ lib/
│   ├ auth.ts                        ← Auth.js 設定
│   ├ supabase.ts                    ← Supabase クライアント
│   ├ resend.ts                      ← メール送信
│   └ rbac.ts                        ← ロール判定ヘルパ
```

---

## 6. データモデル（Supabase）

### 6.1 テーブル定義（概念）

```
members
─────────────────────────────────────────
id              uuid          primary key
email           text          unique not null
display_name    text          nullable
role            text          not null  ('member' | 'family')   -- 会員資格の階層
is_staff        boolean       not null default false             -- 管理権限フラグ
joined_at       date          not null
note            text          nullable  (事務局メモ)
deleted_at      timestamptz   nullable  (論理削除)
created_at      timestamptz   default now()
updated_at      timestamptz   default now()

  制約:
   - CHECK (role IN ('member', 'family'))
   - INDEX (email) WHERE deleted_at IS NULL
   - INDEX (is_staff) WHERE is_staff = true

magic_link_tokens
─────────────────────────────────────────
token           text          primary key  (ランダム32バイトURL-safe)
member_id       uuid          fk -> members.id
expires_at      timestamptz   not null
used_at         timestamptz   nullable
redirect_to     text          nullable  (ログイン後復帰先)
created_at      timestamptz   default now()

sessions
─────────────────────────────────────────
session_id      text          primary key
member_id       uuid          fk -> members.id
expires_at      timestamptz   not null
created_at      timestamptz   default now()
last_seen_at    timestamptz   default now()

newsletters
─────────────────────────────────────────
id              uuid          primary key
title           text          not null  (例: "峠を越えて vol.14")
issue           text          not null  (例: "vol.14")
published_on    date          not null
cover_path      text          nullable  (storage path)
pdf_path        text          not null  (storage path)
sort_order      int           default 0
visible         bool          default true
created_at      timestamptz   default now()

family_meetings
─────────────────────────────────────────
id              uuid          primary key
held_on         date          not null
title           text          not null
location        text          nullable
agenda          text          nullable
minutes_pdf_path text         nullable
is_upcoming     bool          default false  (次回扱いするフラグ)
visible         bool          default true
created_at      timestamptz   default now()

announcements
─────────────────────────────────────────
id              uuid          primary key
body_markdown   text          not null
published       bool          default false
audience        text          default 'member'  ('member' | 'family')
created_at      timestamptz   default now()
updated_at      timestamptz   default now()

audit_logs
─────────────────────────────────────────
id              bigserial     primary key
member_id       uuid          nullable
event           text          not null  ('sign_in' | 'pdf_download' | 'role_change' | ...)
detail          jsonb         nullable
ip              text          nullable
user_agent      text          nullable
created_at      timestamptz   default now()
```

### 6.2 Row Level Security (RLS)

- `members`：本人と `is_staff = true` のみ参照可。`is_staff = true` のみ更新可。
- `newsletters` / `announcements`：認証済み会員は参照可、`is_staff = true` のみ更新可。
- `family_meetings`：`role = 'family'` の会員のみ参照可、`is_staff = true` のみ更新可。
- `audit_logs`：`is_staff = true` のみ参照可。

RLS は Supabase の `auth.uid()` をベースに、`members` テーブルと突合するポリシーで実装する。

---

## 7. 既存サイトとの統合

### 7.1 既存 `members.astro` の扱い

現状の `src/pages/members.astro`（URL シークレット方式、`noindex` ページ）は、**Phase 1 リリース時に廃止**する：

- 中身を新しい `/members/index.astro`（認証付き）に移行
- 旧URLでアクセスがあった場合は新URL（`/members/sign-in`）にリダイレクト

### 7.2 ナビゲーション

- 既存ヘッダー（`src/components/Header.astro`）の「会員の方へ」リンクは維持
- ログイン状態に応じてラベル切替（`会員ログイン` ↔ `会員ページ`）

### 7.3 デザインシステム

- 既存の CSS 変数・Shippori Mincho・Noto Sans JP をそのまま使用
- 会員エリアは「サブセクション感」を出すために、トップに薄いバー（会員エリアであることの明示）を追加
- 管理画面は機能優先で、簡素なテーブル UI

### 7.4 ビルド設定変更

- `astro.config.mjs` に `output: 'server'` または `'hybrid'`、`adapter: cloudflare()` を追加
- 既存の静的ページは引き続き静的書き出し
- `/members/*` のみ SSR

---

## 8. 環境変数

```
# Supabase
SUPABASE_URL                    https://xxx.supabase.co
SUPABASE_ANON_KEY               public anon key
SUPABASE_SERVICE_ROLE_KEY       server-side のみ

# Auth.js
AUTH_SECRET                     ランダム32バイト hex
AUTH_TRUST_HOST                 true

# Resend
RESEND_API_KEY                  re_xxx
MAIL_FROM                       "NPO法人 nest <noreply@nponest.org>"

# サイト
PUBLIC_SITE_URL                 https://www.nponest.org
```

機密値は Cloudflare Pages の Environment Variables に格納、ローカルは `.env.local`（`.gitignore` 済み）。

---

## 9. テスト戦略

### 9.1 単体テスト

- `lib/rbac.ts` のロール判定ロジック
- マジックリンクトークン生成・検証
- 署名付きURL 発行

### 9.2 統合テスト

- 認証フロー（メアド入力 → トークン発行 → 検証 → セッション発行）
- 認可（各ルートのアクセス制御）
- PDF 配信（署名付きURL の有効期限）

### 9.3 E2E（手動 UAT）

- 高齢家族ペルソナでのログイン体験（実機 iPad / Android タブレット）
- スタッフによる PDF アップロードから会員側表示までのフロー
- 退会処理後にアクセスできなくなることの確認

---

## 10. リスクと対応

| リスク | 影響 | 対応 |
|---|---|---|
| マジックリンクメールが届かない（迷惑メール扱い） | ログイン不能 | SPF/DKIM/DMARC 設定、Resend のドメイン認証、初回案内時に「迷惑メール確認のお願い」明示 |
| 高齢家族がリンクの有効期限切れに当たる | 再送が必要 | 有効期限15分、画面に「届かない時は再送」ボタン |
| メアド変更時の引継ぎ | アカウント分断 | 事務局窓口で旧メアドを新メアドに付け替え（管理画面で対応） |
| 1端末で家族複数人が同じメアドを使う | 区別不能 | Phase 1 では1メアド=1アカウントで割り切る |
| Supabase / Resend / Cloudflare 障害 | 全停止 | サービス利用規約上の SLA で許容、災害対応は静的トップから案内 |
| PDFが誤って公開URLに置かれる | 情報漏洩 | ストレージはデフォルト private、署名付きURL のみで配信 |
| スタッフが会員データを誤って削除 | 復旧困難 | 論理削除（`deleted_at`）採用、物理削除は管理画面から不可 |

---

## 11. デプロイ・運用

### 11.1 デプロイ

- Cloudflare Pages の GitHub 連携
- main ブランチ push で自動デプロイ
- プレビュー環境は別ブランチで作成可能

### 11.2 環境分離

- **本番**：`www.nponest.org`
- **ステージング**：`staging.nponest.org`（or プレビュー URL）
- 本番 Supabase とステージング Supabase は別プロジェクト推奨

### 11.3 バックアップ

- Supabase 自動バックアップ（無料枠：日次、7日間保持）
- PDF：Supabase Storage の世代管理 + 河原さん手元にもマスター保持

### 11.4 運用ドキュメント（README 拡充）

- 会員追加手順
- PDF アップロード手順
- ログ確認方法
- 障害時の対応窓口

---

## 12. 範囲外（Phase 2 以降に明示分離）

| 機能 | 想定フェーズ | 備考 |
|---|---|---|
| 自分ノート Web 入力ツール | Phase 2 | 項目設計・保存方針・共有方針を別途設計 |
| 会員同士の投稿・コメント | 検討せず | 既存コミュニティツール（LINE OC）で代替 |
| メールマガジン一斉配信 | Phase 2 候補 | Resend 利用、配信リスト・配信ログ管理が必要 |
| 寄付決済 | 当面なし | 既存 `join.astro` の振込案内を継続 |
| イベント申込フォーム | 当面なし | 既存 Googleフォームを継続 |
| 多言語化 | 当面なし | — |
| ダッシュボード（個別最適化UI） | 当面なし | — |

---

## 13. 見積もり感（参考）

| 工程 | 目安 |
|---|---|
| 認証基盤の組み込み（Auth.js + Supabase + Resend 連携） | 2〜3日 |
| ミドルウェア・ロール制御 | 1日 |
| 会員エリア各ページの実装 | 3〜4日 |
| 管理画面（最小） | 2〜3日 |
| 個人情報保護ページ・ドキュメント | 1日 |
| UAT・調整 | 2〜3日 |
| **合計** | **約2〜3週間（写真調達と並行可能）** |

---

## 14. 決まっていないこと（実装着手前に確定したい）

| # | 項目 | 決定者 |
|---|---|---|
| D1 | 機関誌「峠を越えて」のバックナンバー一覧（既存号の数とPDF所在） | 河原さん／林代表 |
| D2 | 家族会員リスト（メアド付き）の初期データ | 事務局 |
| D3 | 会員（賛助会員含む）リストの初期データ | 事務局 |
| D4 | LINEオープンチャットの招待URL／QRコード | 河原さん |
| D5 | Instagram 埋め込みコードまたは表示方針 | 河原さん |
| D6 | 自分ノートの紹介文・PDFテンプレート | 河原さん／林代表 |
| D7 | 個人情報保護法に基づく利用目的記載文 | 林代表確認 |
| D8 | `from` メールアドレス（noreply@nponest.org 等）と SPF/DKIM 設定 | 河原さん |

これらは**実装と並行で集めれば良い**ですが、リリース前には全て揃っている必要があります。

---

## 15. このドキュメントの位置づけ

- 本ドキュメントは Phase 1 の **設計仕様**（spec）。
- 次のステップは `superpowers:writing-plans` スキルでの **実装計画**作成。
- 実装計画は本仕様を分割し、2〜5分単位のタスクに分解する。
- 仕様変更時は本ドキュメントを更新し、git にコミットする。
