# nest 会員専用エリア Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Astro v6 サイトに認証付き会員エリア `/members/*` を構築し、機関誌「巣箱」PDF配信・家族会限定コンテンツ・コミュニティ導線・最小限の管理画面を提供する。

**Architecture:** 既存の Astro 静的サイトを `output: 'hybrid'` に変更し、`/members/*` のみ SSR で動作させる。認証は **自前マジックリンク方式**（メアド入力 → メールに届くリンクで30日セッション発行）。DB と PDF ストレージは **Supabase 東京リージョン**、メール送信は **Resend**、デプロイは **Cloudflare Pages + Functions**。

**Tech Stack:**
- Astro v6 + `@astrojs/cloudflare` (SSR adapter)
- `@supabase/supabase-js` (postgres client + storage)
- `resend` (transactional email)
- Vitest (unit tests)
- Playwright (E2E tests)
- TypeScript strict mode (既存設定踏襲)

---

## Implementation Note — 設計仕様からの調整点

設計仕様（`docs/superpowers/specs/2026-05-24-members-area-phase1-design.md`）では認証技術として「Auth.js または @clerk/astro」を挙げました。実装計画策定にあたり、以下の理由で **自前マジックリンク実装** に切り替えました：

| 観点 | 自前マジックリンク | Auth.js v5 |
|---|---|---|
| Astro 連携 | フレームワーク非依存、ミドルウェア数十行 | third-party adapter（`@auth/astro` 等）に依存 |
| 行数 | 約 150 LOC（テスト込み） | フレームワーク + 設定で同等以上 |
| 日本語 UX | 完全制御 | コンポーネントの上書きが必要 |
| 学習コスト | Astro middleware を知っていれば足りる | Auth.js の概念（providers / callbacks / events）の理解が要 |
| 100人規模での妥当性 | 十分 | やや重い |

**Auth.js に戻す判断ポイント：** 将来 Google OAuth / Microsoft OAuth を追加したくなった場合、Phase 2 で Auth.js に乗せ換える選択肢を残しておく。Phase 1 のテーブル定義（`members.email`, `sessions.session_id`）は Auth.js のスキーマと互換にしておくことで、移行コストを下げる。

**この変更で問題がある場合は、Stage 0 着手前にフラグを立ててください。**

---

## File Structure

新規作成・変更されるファイル一覧（責務付き）：

### 設定・基盤
| パス | 種別 | 責務 |
|---|---|---|
| `astro.config.mjs` | 変更 | SSR adapter追加、output: 'hybrid' |
| `package.json` | 変更 | 依存追加 |
| `tsconfig.json` | 変更 | path alias 追加（任意） |
| `src/env.d.ts` | 新規 | 環境変数の型 + locals 型 |
| `.env.example` | 新規 | 環境変数テンプレ |
| `.gitignore` | 変更 | `.env.local` を追加 |
| `vitest.config.ts` | 新規 | Vitest 設定 |
| `playwright.config.ts` | 新規 | Playwright 設定 |

### DB マイグレーション
| パス | 責務 |
|---|---|
| `db/migrations/0001_members.sql` | members テーブル |
| `db/migrations/0002_magic_link_tokens.sql` | マジックリンク トークン |
| `db/migrations/0003_sessions.sql` | セッション |
| `db/migrations/0004_newsletters.sql` | 機関誌 |
| `db/migrations/0005_family_meetings.sql` | 家族会 |
| `db/migrations/0006_announcements.sql` | お知らせ |
| `db/migrations/0007_audit_logs.sql` | 監査ログ |
| `db/migrations/0008_rls_policies.sql` | RLS ポリシー |
| `db/README.md` | マイグレーション手順 |

### ライブラリ層 (`src/lib/`)
| パス | 責務 |
|---|---|
| `src/lib/supabase.ts` | Supabase クライアント生成 |
| `src/lib/rbac.ts` | ロール・権限判定 |
| `src/lib/auth-token.ts` | マジックリンクトークン生成・検証 |
| `src/lib/session.ts` | セッション発行・検証 |
| `src/lib/cookies.ts` | Cookie 操作ヘルパ |
| `src/lib/resend.ts` | メール送信 |
| `src/lib/audit.ts` | 監査ログ書き込み |
| `src/lib/pdf-url.ts` | 署名付きPDF URL発行 |

### ミドルウェア
| パス | 責務 |
|---|---|
| `src/middleware.ts` | 認証・認可・Cache-Control |

### 会員エリア ページ・API (`src/pages/members/`)
| パス | 責務 |
|---|---|
| `src/layouts/MembersLayout.astro` | 会員エリア共通レイアウト |
| `src/components/members/MembersNav.astro` | 会員ナビ |
| `src/components/members/PdfCard.astro` | PDF カード UI |
| `src/components/members/SignInForm.astro` | ログイン入力 |
| `src/pages/members/index.astro` | 会員トップ |
| `src/pages/members/sign-in.astro` | ログイン画面 |
| `src/pages/members/sign-in.ts` | POST: マジックリンク発行 |
| `src/pages/members/verify.ts` | GET: トークン検証 |
| `src/pages/members/sign-out.ts` | POST: ログアウト |
| `src/pages/members/privacy.astro` | 個情法説明 |
| `src/pages/members/newsletter/index.astro` | 機関誌一覧 |
| `src/pages/members/newsletter/[id]/download.ts` | 機関誌 PDF DL |
| `src/pages/members/family/index.astro` | 家族会 |
| `src/pages/members/family/minutes/[id]/download.ts` | 議事録 PDF DL |
| `src/pages/members/my-note/index.astro` | 自分ノート紹介 |
| `src/pages/members/community/index.astro` | LINE/Instagram 導線 |

### 管理画面 (`src/pages/members/admin/`)
| パス | 責務 |
|---|---|
| `src/pages/members/admin/index.astro` | 管理トップ |
| `src/pages/members/admin/members/index.astro` | 会員一覧 |
| `src/pages/members/admin/members/new.astro` | 会員追加 |
| `src/pages/members/admin/members/[id].astro` | 会員編集 |
| `src/pages/members/admin/members/[id]/delete.ts` | POST: 論理削除 |
| `src/pages/members/admin/newsletters.astro` | 機関誌管理 |
| `src/pages/members/admin/family.astro` | 家族会管理 |
| `src/pages/members/admin/announcements.astro` | お知らせ管理 |

### テスト
| パス | 責務 |
|---|---|
| `tests/unit/rbac.test.ts` | RBAC 単体 |
| `tests/unit/auth-token.test.ts` | トークン生成・検証 |
| `tests/unit/cookies.test.ts` | Cookie ヘルパ |
| `tests/e2e/sign-in.spec.ts` | ログイン E2E |
| `tests/e2e/authorization.spec.ts` | 認可ガード E2E |
| `tests/e2e/newsletter-download.spec.ts` | PDF DL E2E |
| `tests/e2e/admin.spec.ts` | 管理画面 E2E |

### ドキュメント
| パス | 責務 |
|---|---|
| `README.md` | 変更：会員エリア運用手順を追記 |
| `docs/operations/member-management.md` | 会員管理手順書 |

---

## Stages Overview

| Stage | 内容 | タスク数 | 所要目安 |
|---|---|---|---|
| 0 | Foundation（adapter / vitest / dirs） | 5 | 半日 |
| 1 | Database（migrations + Supabase） | 8 | 1日 |
| 2 | Lib layer（TDD） | 8 | 2日 |
| 3 | Middleware + 認証フロー | 7 | 2日 |
| 4 | 会員ページ | 9 | 3日 |
| 5 | 管理画面 | 6 | 2日 |
| 6 | 統合・仕上げ | 5 | 1日 |
| 7 | UAT・運用ドキュメント | 2 | 半日 |
| **合計** | — | **50** | **2〜3週間** |

---

## Pre-flight Requirements（着手前に確認）

実装に入る前に、河原さん側で以下が揃っている必要があります：

- [ ] Supabase アカウント（無料プランで可）
- [ ] Resend アカウント（無料枠：日100通）
- [ ] Cloudflare アカウント（既に持っている前提）
- [ ] `nponest.org` ドメインの DNS 編集権限（後段で SPF/DKIM 設定）
- [ ] Node.js 22.12+ が手元にインストール済み（`package.json` engines 通り）
- [ ] git リポジトリが GitHub にプッシュされていること（自動デプロイ用）

これらが揃ったら Stage 0 に進みます。

---

## Stage 0: Foundation

### Task 0.1: Cloudflare SSR Adapter を追加

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`

- [ ] **Step 1: 依存パッケージのセキュリティスコアを確認**

Bash:
```bash
# socket-mcp の depscore を使用（プロジェクト規約）
# 確認対象: @astrojs/cloudflare
```
期待値：score >= 0.8。下回る場合は採用判断を再考。

- [ ] **Step 2: アダプタをインストール**

```bash
npm install @astrojs/cloudflare
```

- [ ] **Step 3: `astro.config.mjs` を更新**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://www.nponest.org',
  output: 'hybrid',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
```

- [ ] **Step 4: ビルドが通ることを確認**

```bash
npm run build
```
Expected: `16ページ build 成功` 相当のメッセージ。SSR エントリは無いので警告のみ出る可能性あり。

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json astro.config.mjs
git commit -m "build: add @astrojs/cloudflare adapter and switch to hybrid output"
```

---

### Task 0.2: 環境変数の型と `.env.example` を作成

**Files:**
- Create: `src/env.d.ts`
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: `src/env.d.ts` を作成**

```ts
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly RESEND_API_KEY: string;
  readonly MAIL_FROM: string;
  readonly PUBLIC_SITE_URL: string;
  readonly SESSION_COOKIE_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    member?: {
      id: string;
      email: string;
      display_name: string | null;
      role: 'member' | 'family';
      is_staff: boolean;
    };
  }
}
```

- [ ] **Step 2: `.env.example` を作成**

```env
# Supabase (Tokyo region)
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Resend
RESEND_API_KEY=re_xxx
MAIL_FROM="NPO法人 nest <noreply@nponest.org>"

# Site
PUBLIC_SITE_URL=https://www.nponest.org
SESSION_COOKIE_SECRET=generate-with-openssl-rand-base64-32
```

- [ ] **Step 3: `.gitignore` を更新**

`.gitignore` に以下を追加（既に `.env` がある場合は重複させない）：
```
.env.local
.env.*.local
```

- [ ] **Step 4: Commit**

```bash
git add src/env.d.ts .env.example .gitignore
git commit -m "chore: add env var schema and example template"
```

---

### Task 0.3: Vitest テスト基盤を追加

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/unit/smoke.test.ts`

- [ ] **Step 1: 依存をスコアチェック後インストール**

```bash
# depscore check: vitest, @vitest/coverage-v8
npm install -D vitest @vitest/coverage-v8
```

- [ ] **Step 2: `vitest.config.ts` を作成**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '~': new URL('./src/', import.meta.url).pathname,
    },
  },
});
```

- [ ] **Step 3: スモークテストを作成（基盤動作確認用）**

`tests/unit/smoke.test.ts`：
```ts
import { describe, it, expect } from 'vitest';

describe('vitest smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: `package.json` にスクリプト追加**

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 5: テスト実行**

```bash
npm run test
```
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/unit/smoke.test.ts
git commit -m "test: add vitest infrastructure with smoke test"
```

---

### Task 0.4: ディレクトリ骨格を作成

**Files:**
- Create: `src/lib/.gitkeep`
- Create: `src/pages/members/.gitkeep`
- Create: `src/pages/members/admin/.gitkeep`
- Create: `src/components/members/.gitkeep`
- Create: `src/layouts/.gitkeep` (既存なら不要)
- Create: `db/migrations/.gitkeep`
- Create: `tests/unit/.gitkeep`
- Create: `tests/e2e/.gitkeep`

- [ ] **Step 1: ディレクトリ作成**

```bash
mkdir -p src/lib src/pages/members/admin src/pages/members/newsletter src/pages/members/family/minutes src/pages/members/my-note src/pages/members/community src/components/members db/migrations tests/unit tests/e2e
touch src/lib/.gitkeep src/components/members/.gitkeep db/migrations/.gitkeep tests/e2e/.gitkeep
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: scaffold directory structure for members area"
```

---

### Task 0.5: Playwright E2E テスト基盤

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: 依存スコアチェック → インストール**

```bash
# depscore check: @playwright/test
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: `playwright.config.ts` を作成**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

- [ ] **Step 3: スモーク E2E**

`tests/e2e/smoke.spec.ts`：
```ts
import { test, expect } from '@playwright/test';

test('homepage renders', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/nest/);
});
```

- [ ] **Step 4: スクリプト追加**

`package.json` に追加：
```json
"test:e2e": "playwright test"
```

- [ ] **Step 5: E2E スモーク実行**

```bash
npm run test:e2e -- --project=chromium
```
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json playwright.config.ts tests/e2e/smoke.spec.ts
git commit -m "test: add playwright e2e infrastructure with smoke test"
```

---

## Stage 1: Database

### Task 1.1: Supabase プロジェクト準備チェックリストを記述

**Files:**
- Create: `db/README.md`

- [ ] **Step 1: 手順書を作成**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add db/README.md
git commit -m "docs(db): add Supabase setup checklist"
```

---

### Task 1.2: `members` マイグレーションを作成

**Files:**
- Create: `db/migrations/0001_members.sql`

- [ ] **Step 1: SQL を作成**

```sql
-- 0001_members.sql
-- 会員マスタ
CREATE TABLE members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL,
    display_name    TEXT,
    role            TEXT NOT NULL CHECK (role IN ('member', 'family')),
    is_staff        BOOLEAN NOT NULL DEFAULT false,
    joined_at       DATE NOT NULL,
    note            TEXT,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 有効な会員のメアドはユニーク
CREATE UNIQUE INDEX members_email_active_uidx
    ON members (email)
    WHERE deleted_at IS NULL;

-- スタッフ検索用
CREATE INDEX members_is_staff_idx
    ON members (is_staff)
    WHERE is_staff = true;

-- updated_at 自動更新
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
```

- [ ] **Step 2: Commit**

```bash
git add db/migrations/0001_members.sql
git commit -m "db: add members table migration"
```

---

### Task 1.3: `magic_link_tokens` マイグレーション

**Files:**
- Create: `db/migrations/0002_magic_link_tokens.sql`

- [ ] **Step 1: SQL を作成**

```sql
-- 0002_magic_link_tokens.sql
-- ログイン用ワンタイムトークン
CREATE TABLE magic_link_tokens (
    token           TEXT PRIMARY KEY,
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    expires_at      TIMESTAMPTZ NOT NULL,
    used_at         TIMESTAMPTZ,
    redirect_to     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 期限切れトークン掃除用
CREATE INDEX magic_link_tokens_expires_at_idx ON magic_link_tokens (expires_at);

-- 会員別の未使用トークン検索用
CREATE INDEX magic_link_tokens_member_active_idx
    ON magic_link_tokens (member_id)
    WHERE used_at IS NULL;
```

- [ ] **Step 2: Commit**

```bash
git add db/migrations/0002_magic_link_tokens.sql
git commit -m "db: add magic_link_tokens table migration"
```

---

### Task 1.4: `sessions` マイグレーション

**Files:**
- Create: `db/migrations/0003_sessions.sql`

- [ ] **Step 1: SQL を作成**

```sql
-- 0003_sessions.sql
-- ログインセッション
CREATE TABLE sessions (
    session_id      TEXT PRIMARY KEY,
    member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sessions_member_id_idx ON sessions (member_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);
```

- [ ] **Step 2: Commit**

```bash
git add db/migrations/0003_sessions.sql
git commit -m "db: add sessions table migration"
```

---

### Task 1.5: `newsletters` マイグレーション

**Files:**
- Create: `db/migrations/0004_newsletters.sql`

- [ ] **Step 1: SQL を作成**

```sql
-- 0004_newsletters.sql
-- 機関誌「巣箱」バックナンバー
CREATE TABLE newsletters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,         -- 例: '巣箱 vol.14'
    issue           TEXT NOT NULL,         -- 例: 'vol.14'
    published_on    DATE NOT NULL,
    cover_path      TEXT,                  -- storage パス（任意）
    pdf_path        TEXT NOT NULL,         -- storage パス（必須）
    sort_order      INT NOT NULL DEFAULT 0,
    visible         BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX newsletters_visible_sort_idx
    ON newsletters (visible, sort_order DESC, published_on DESC);
```

- [ ] **Step 2: Commit**

```bash
git add db/migrations/0004_newsletters.sql
git commit -m "db: add newsletters table migration"
```

---

### Task 1.6: `family_meetings` マイグレーション

**Files:**
- Create: `db/migrations/0005_family_meetings.sql`

- [ ] **Step 1: SQL を作成**

```sql
-- 0005_family_meetings.sql
-- 家族会
CREATE TABLE family_meetings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    held_on             DATE NOT NULL,
    title               TEXT NOT NULL,
    location            TEXT,
    agenda              TEXT,
    minutes_pdf_path    TEXT,
    is_upcoming         BOOLEAN NOT NULL DEFAULT false,
    visible             BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX family_meetings_held_on_idx ON family_meetings (held_on DESC);
CREATE UNIQUE INDEX family_meetings_upcoming_uidx
    ON family_meetings (is_upcoming)
    WHERE is_upcoming = true;
```

- [ ] **Step 2: Commit**

```bash
git add db/migrations/0005_family_meetings.sql
git commit -m "db: add family_meetings table migration"
```

---

### Task 1.7: `announcements` + `audit_logs` マイグレーション

**Files:**
- Create: `db/migrations/0006_announcements.sql`
- Create: `db/migrations/0007_audit_logs.sql`

- [ ] **Step 1: `0006_announcements.sql` 作成**

```sql
-- 0006_announcements.sql
-- 会員向けお知らせ
CREATE TABLE announcements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    body_markdown   TEXT NOT NULL,
    published       BOOLEAN NOT NULL DEFAULT false,
    audience        TEXT NOT NULL DEFAULT 'member' CHECK (audience IN ('member', 'family')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX announcements_published_created_idx
    ON announcements (published, created_at DESC);

CREATE TRIGGER announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
```

- [ ] **Step 2: `0007_audit_logs.sql` 作成**

```sql
-- 0007_audit_logs.sql
-- 監査ログ（90日保持を想定。物理 TTL は手動運用）
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    member_id       UUID REFERENCES members(id) ON DELETE SET NULL,
    event           TEXT NOT NULL,
    detail          JSONB,
    ip              TEXT,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_member_created_idx
    ON audit_logs (member_id, created_at DESC);
CREATE INDEX audit_logs_created_idx
    ON audit_logs (created_at DESC);
```

- [ ] **Step 3: Commit**

```bash
git add db/migrations/0006_announcements.sql db/migrations/0007_audit_logs.sql
git commit -m "db: add announcements and audit_logs table migrations"
```

---

### Task 1.8: RLS ポリシー マイグレーション

**Files:**
- Create: `db/migrations/0008_rls_policies.sql`

- [ ] **Step 1: SQL を作成**

```sql
-- 0008_rls_policies.sql
-- Row Level Security ポリシー
-- 注意: Astro サーバ側は service_role キーで RLS をバイパスするため、
--       これらのポリシーは Supabase 管理画面経由・anon キー経由のアクセス時に効く

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_link_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- デフォルトは全 deny。Astro 側は service_role でアクセスする前提。
-- service_role キーは Row Level Security をバイパスするため、明示的な policy は不要。

-- 将来 anon キー経由で読み取りを許可したい場合のための雛形（コメントアウト）：
-- CREATE POLICY members_read_self
--     ON members FOR SELECT
--     USING (auth.uid() = id);
```

- [ ] **Step 2: Commit**

```bash
git add db/migrations/0008_rls_policies.sql
git commit -m "db: enable RLS on all tables (service_role bypasses)"
```

---

## Stage 2: Lib layer (TDD)

### Task 2.1: Supabase クライアントファクトリ

**Files:**
- Create: `src/lib/supabase.ts`

新規依存パッケージなので、まず確認：

- [ ] **Step 1: depscore チェック**

```bash
# socket-mcp depscore: @supabase/supabase-js
```
Expected: score >= 0.8

- [ ] **Step 2: インストール**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 3: クライアント実装**

`src/lib/supabase.ts`：
```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Service role クライアント（サーバ側のみ。RLSバイパス）。
 * Astro エンドポイント / middleware 内でのみ使用すること。
 */
export function createServerClient(): SupabaseClient {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/supabase.ts
git commit -m "feat(lib): add Supabase server client factory"
```

---

### Task 2.2: RBAC 判定ロジック（TDD）

**Files:**
- Create: `tests/unit/rbac.test.ts`
- Create: `src/lib/rbac.ts`

- [ ] **Step 1: 失敗テストを書く**

`tests/unit/rbac.test.ts`：
```ts
import { describe, it, expect } from 'vitest';
import { canAccessRoute, type Member } from '~/lib/rbac';

const memberOnly: Member = {
  id: 'm1', email: 'a@b.c', display_name: null,
  role: 'member', is_staff: false,
};
const familyMember: Member = { ...memberOnly, role: 'family' };
const staffMember: Member = { ...memberOnly, is_staff: true };
const staffFamily: Member = { ...memberOnly, role: 'family', is_staff: true };

describe('canAccessRoute', () => {
  it('未ログイン: 認証必要なら拒否', () => {
    expect(canAccessRoute(null, '/members/newsletter/')).toBe(false);
    expect(canAccessRoute(null, '/members/sign-in')).toBe(true);
  });

  it('member は標準ページに入れる', () => {
    expect(canAccessRoute(memberOnly, '/members/')).toBe(true);
    expect(canAccessRoute(memberOnly, '/members/newsletter/')).toBe(true);
    expect(canAccessRoute(memberOnly, '/members/community/')).toBe(true);
  });

  it('member は family ページに入れない', () => {
    expect(canAccessRoute(memberOnly, '/members/family/')).toBe(false);
  });

  it('family は family ページに入れる', () => {
    expect(canAccessRoute(familyMember, '/members/family/')).toBe(true);
    expect(canAccessRoute(familyMember, '/members/newsletter/')).toBe(true);
  });

  it('is_staff=true は admin に入れる', () => {
    expect(canAccessRoute(staffMember, '/members/admin/')).toBe(true);
    expect(canAccessRoute(staffFamily, '/members/admin/members')).toBe(true);
  });

  it('is_staff=false は admin に入れない', () => {
    expect(canAccessRoute(memberOnly, '/members/admin/')).toBe(false);
    expect(canAccessRoute(familyMember, '/members/admin/')).toBe(false);
  });

  it('公開パスは誰でもOK', () => {
    expect(canAccessRoute(null, '/members/sign-in')).toBe(true);
    expect(canAccessRoute(null, '/members/verify')).toBe(true);
    expect(canAccessRoute(null, '/members/sign-out')).toBe(true);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm run test -- rbac
```
Expected: fail with "Cannot find module '~/lib/rbac'".

- [ ] **Step 3: 最小実装**

`src/lib/rbac.ts`：
```ts
export interface Member {
  id: string;
  email: string;
  display_name: string | null;
  role: 'member' | 'family';
  is_staff: boolean;
}

const PUBLIC_PATHS = [
  '/members/sign-in',
  '/members/verify',
  '/members/sign-out',
];

const FAMILY_PREFIXES = ['/members/family'];
const ADMIN_PREFIXES = ['/members/admin'];

function startsWithAny(path: string, prefixes: string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(p + '/'));
}

export function isPublicRoute(path: string): boolean {
  // Astro.url.pathname にクエリ文字列は含まれないため完全一致のみ
  return PUBLIC_PATHS.includes(path);
}

export function canAccessRoute(member: Member | null, path: string): boolean {
  if (isPublicRoute(path)) return true;
  if (!path.startsWith('/members/')) return true;
  if (!member) return false;

  if (startsWithAny(path, ADMIN_PREFIXES)) return member.is_staff;
  if (startsWithAny(path, FAMILY_PREFIXES)) return member.role === 'family';

  // /members/* の残りは member 以上
  return true;
}
```

- [ ] **Step 4: テストを通す**

```bash
npm run test -- rbac
```
Expected: all 7 passed.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/rbac.test.ts src/lib/rbac.ts
git commit -m "feat(lib): add RBAC route access logic with tests"
```

---

### Task 2.3: マジックリンクトークン生成・検証（TDD）

**Files:**
- Create: `tests/unit/auth-token.test.ts`
- Create: `src/lib/auth-token.ts`

- [ ] **Step 1: 失敗テストを書く**

`tests/unit/auth-token.test.ts`：
```ts
import { describe, it, expect } from 'vitest';
import { generateToken } from '~/lib/auth-token';

describe('generateToken', () => {
  it('43文字以上の base64url 文字列を返す', () => {
    const t = generateToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(t.length).toBeGreaterThanOrEqual(43);
  });

  it('呼び出し毎に異なる値を返す', () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: 失敗確認**

```bash
npm run test -- auth-token
```

- [ ] **Step 3: 実装**

`src/lib/auth-token.ts`：
```ts
/**
 * URL-safe な 32バイト ランダム文字列を返す。
 * マジックリンクトークン / セッションIDの両方に使う。
 *
 * Cloudflare Workers / Node v20+ 両方で動作する Web Crypto を使用。
 */
export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64urlEncode(bytes);
}

function base64urlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const MAGIC_LINK_TTL_SECONDS = 15 * 60;       // 15分
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30日
```

- [ ] **Step 4: テスト通過確認**

```bash
npm run test -- auth-token
```
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/auth-token.test.ts src/lib/auth-token.ts
git commit -m "feat(lib): add auth token generation and hashing helpers"
```

---

### Task 2.4: Cookie ヘルパ（TDD）

**Files:**
- Create: `tests/unit/cookies.test.ts`
- Create: `src/lib/cookies.ts`

- [ ] **Step 1: 失敗テストを書く**

`tests/unit/cookies.test.ts`：
```ts
import { describe, it, expect } from 'vitest';
import { sessionCookieOptions, SESSION_COOKIE_NAME } from '~/lib/cookies';

describe('sessionCookieOptions', () => {
  it('HttpOnly / Secure / SameSite=Lax を持つ', () => {
    const opts = sessionCookieOptions();
    expect(opts.httpOnly).toBe(true);
    expect(opts.secure).toBe(true);
    expect(opts.sameSite).toBe('lax');
  });

  it('30日の maxAge を持つ', () => {
    const opts = sessionCookieOptions();
    expect(opts.maxAge).toBe(30 * 24 * 60 * 60);
  });

  it('path が "/" である', () => {
    expect(sessionCookieOptions().path).toBe('/');
  });
});

describe('SESSION_COOKIE_NAME', () => {
  it('"nest_sess" である', () => {
    expect(SESSION_COOKIE_NAME).toBe('nest_sess');
  });
});
```

- [ ] **Step 2: 失敗確認**

```bash
npm run test -- cookies
```

- [ ] **Step 3: 実装**

`src/lib/cookies.ts`：
```ts
import { SESSION_TTL_SECONDS } from './auth-token';

export const SESSION_COOKIE_NAME = 'nest_sess';

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}
```

- [ ] **Step 4: テスト通過確認**

```bash
npm run test -- cookies
```

- [ ] **Step 5: Commit**

```bash
git add tests/unit/cookies.test.ts src/lib/cookies.ts
git commit -m "feat(lib): add session cookie helpers"
```

---

### Task 2.5: Session 発行・検証

**Files:**
- Create: `src/lib/session.ts`

DB を叩く処理なのでユニットテストは難しい。E2E でカバー（Stage 3 で）。実装のみ書く。

- [ ] **Step 1: 実装**

`src/lib/session.ts`：
```ts
import { createServerClient } from './supabase';
import { generateToken, SESSION_TTL_SECONDS } from './auth-token';
import type { Member } from './rbac';

export interface SessionRecord {
  session_id: string;
  member_id: string;
  expires_at: string;
}

/**
 * 新しいセッションを発行する。
 */
export async function createSession(memberId: string): Promise<SessionRecord> {
  const supabase = createServerClient();
  const sessionId = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  const { data, error } = await supabase
    .from('sessions')
    .insert({ session_id: sessionId, member_id: memberId, expires_at: expiresAt })
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to create session: ${error?.message}`);
  return data as SessionRecord;
}

/**
 * セッションIDから会員を取得する。
 * 有効期限切れ・存在しない → null
 */
export async function getMemberBySession(sessionId: string): Promise<Member | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      session_id,
      expires_at,
      members:members!inner (
        id, email, display_name, role, is_staff, deleted_at
      )
    `)
    .eq('session_id', sessionId)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;
  // @ts-expect-error supabase nested type
  const m = data.members;
  if (!m || m.deleted_at) return null;

  // last_seen_at を非同期で更新（失敗しても無視）
  // 注: supabase-js v2 の builder は PromiseLike なので、.then() を明示的に
  // 呼ばないと HTTP リクエストが発火しない。`void builder` だけでは no-op。
  supabase.from('sessions')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('session_id', sessionId)
    .then(() => undefined, () => undefined);

  return {
    id: m.id,
    email: m.email,
    display_name: m.display_name,
    role: m.role,
    is_staff: m.is_staff,
  };
}

/**
 * セッションを削除（ログアウト）
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.from('sessions').delete().eq('session_id', sessionId);
}
```

- [ ] **Step 2: 型チェック**

```bash
npm run astro -- check
```
Expected: 0 errors（型エラーがあれば修正）

- [ ] **Step 3: Commit**

```bash
git add src/lib/session.ts
git commit -m "feat(lib): add session create/get/delete operations"
```

---

### Task 2.6: マジックリンクトークン発行・検証（DBアクセス）

**Files:**
- Create: `src/lib/magic-link.ts`

- [ ] **Step 1: 実装**

`src/lib/magic-link.ts`：
```ts
import { createServerClient } from './supabase';
import { generateToken, MAGIC_LINK_TTL_SECONDS } from './auth-token';
import type { Member } from './rbac';

/**
 * メアドに該当する会員にマジックリンクトークンを発行する。
 * 該当会員が存在しなければ null。
 */
export async function issueMagicLink(
  email: string,
  redirectTo: string | null = null,
): Promise<{ token: string; member: Member } | null> {
  const supabase = createServerClient();

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, email, display_name, role, is_staff')
    .eq('email', email.toLowerCase().trim())
    .is('deleted_at', null)
    .maybeSingle();

  if (memberError || !member) return null;

  const token = generateToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_SECONDS * 1000).toISOString();

  const { error } = await supabase
    .from('magic_link_tokens')
    .insert({
      token,
      member_id: member.id,
      expires_at: expiresAt,
      redirect_to: redirectTo,
    });

  if (error) throw new Error(`Failed to insert magic_link_token: ${error.message}`);

  return { token, member: member as Member };
}

/**
 * トークンを検証して該当会員と redirect_to を返す。
 * 検証成功時に used_at をセット（単回限り）。
 */
export async function consumeMagicLink(
  token: string,
): Promise<{ member: Member; redirectTo: string | null } | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('magic_link_tokens')
    .select(`
      token, expires_at, used_at, redirect_to,
      members:members!inner (id, email, display_name, role, is_staff, deleted_at)
    `)
    .eq('token', token)
    .maybeSingle();

  if (error || !data) return null;
  if (data.used_at) return null;
  if (new Date(data.expires_at) <= new Date()) return null;
  // @ts-expect-error supabase nested type
  const m = data.members;
  if (!m || m.deleted_at) return null;

  // 単回限りでマークする — UPDATE が実際に何行更新したかを返り値で確認する
  const { data: updated, error: updateError } = await supabase
    .from('magic_link_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)
    .is('used_at', null)
    .select('token');

  // updateError か、または該当行が無い（同時アクセスで既に消費済み）場合は失敗
  if (updateError || !updated || updated.length === 0) return null;

  return {
    member: {
      id: m.id, email: m.email, display_name: m.display_name,
      role: m.role, is_staff: m.is_staff,
    },
    redirectTo: data.redirect_to,
  };
}
```

- [ ] **Step 2: 型チェック**

```bash
npm run astro -- check
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/magic-link.ts
git commit -m "feat(lib): add magic link issuance and consumption"
```

---

### Task 2.7: Resend メール送信

**Files:**
- Create: `src/lib/resend.ts`

- [ ] **Step 1: depscore チェック**

```bash
# socket-mcp depscore: resend
```

- [ ] **Step 2: インストール**

```bash
npm install resend
```

- [ ] **Step 3: 実装**

`src/lib/resend.ts`：
```ts
import { Resend } from 'resend';

function getResend(): Resend {
  const key = import.meta.env.RESEND_API_KEY;
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
  const from = import.meta.env.MAIL_FROM;
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
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/resend.ts
git commit -m "feat(lib): add Resend transactional email integration"
```

---

### Task 2.8: 監査ログ + PDF 署名URL ヘルパ

**Files:**
- Create: `src/lib/audit.ts`
- Create: `src/lib/pdf-url.ts`

- [ ] **Step 1: 監査ログ実装**

`src/lib/audit.ts`：
```ts
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
```

- [ ] **Step 2: PDF 署名URL ヘルパ**

`src/lib/pdf-url.ts`：
```ts
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
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/audit.ts src/lib/pdf-url.ts
git commit -m "feat(lib): add audit logging and PDF signed URL helpers"
```

---

## Stage 3: Middleware + 認証フロー

### Task 3.1: 認証ミドルウェアを実装

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: 実装**

`src/middleware.ts`：
```ts
import { defineMiddleware } from 'astro:middleware';
import { canAccessRoute, isPublicRoute } from './lib/rbac';
import { getMemberBySession } from './lib/session';
import { SESSION_COOKIE_NAME } from './lib/cookies';

// /members/* から返るレスポンスには必ず Cache-Control を付与する
function withNoStore(response: Response): Response {
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const path = ctx.url.pathname;

  // /members 完全一致と /members/ 配下のみ対象（/membersclub などを誤検知しない）
  if (path !== '/members' && !path.startsWith('/members/')) {
    return next();
  }

  // 公開パス（sign-in / verify / sign-out）は素通りだが、Cache-Control だけ付ける
  const isPublic = isPublicRoute(path);

  // セッション解決
  const sessionId = ctx.cookies.get(SESSION_COOKIE_NAME)?.value;
  const member = sessionId ? await getMemberBySession(sessionId) : null;
  if (member) ctx.locals.member = member;

  // 公開パスはアクセス制御スキップ
  if (isPublic) {
    return withNoStore(await next());
  }

  // 未ログイン → サインインへリダイレクト（戻り先を保持）
  if (!member) {
    const redirect = encodeURIComponent(path + ctx.url.search);
    return withNoStore(ctx.redirect(`/members/sign-in?redirect=${redirect}`));
  }

  // ロール・スタッフ判定
  if (!canAccessRoute(member, path)) {
    return withNoStore(new Response('Forbidden', { status: 403 }));
  }

  return withNoStore(await next());
});
```

- [ ] **Step 2: 型チェック**

```bash
npm run astro -- check
```

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add auth middleware with route protection and cache headers"
```

---

### Task 3.2: サインインページ（UI + POST ハンドラ統合）

> **実装メモ（2026-05-25 更新）**: 当初は Task 3.2（`sign-in.astro` で GET 描画）と Task 3.3（`sign-in.ts` で POST 処理）を別ファイルに分ける計画だったが、**Astro のルーティング制約により同一パスで `.astro` と `.ts` が共存すると `.astro` が優先され `.ts` は無視される**ことを実装時に発見した。
>
> このため Task 3.2 と Task 3.3 を統合し、**単一の `src/pages/members/sign-in.astro` で `Astro.request.method` を見て GET/POST を分岐**する Astro 慣用のパターンに変更した。`SignInForm.astro` コンポーネントは独立した部品として残す。
>
> - 実際に作成したファイル：`src/components/members/SignInForm.astro` ＋ `src/pages/members/sign-in.astro`（GET と POST を内包）
> - **作成しないファイル**：`src/pages/members/sign-in.ts`（衝突するため）
> - コミットも 1 つに統合：`feat(members): add sign-in page with magic link issuance`
>
> Task 3.3 のセクションは下記に「統合済み」の注記のみ残してある。
>
> **2026-05-25 追記（レビュー指摘修正）**: 本ページは `<Fragment slot="head">` で `<meta name="robots" content="noindex, nofollow" />` を注入するが、`BaseLayout.astro` 側に名前付き `head` スロットが無いと黙って破棄される。Stage 3 レビューで発覚したため `src/layouts/BaseLayout.astro` の `</head>` 直前に `<slot name="head" />` を追加した。

**Files:**
- Create: `src/components/members/SignInForm.astro`
- Create: `src/pages/members/sign-in.astro`（GET 描画と POST マジックリンク発行を統合）
- Edit: `src/layouts/BaseLayout.astro`（`<slot name="head" />` を追加。noindex メタ等を子から注入できるようにするため）

- [ ] **Step 1: フォームコンポーネント作成**

`src/components/members/SignInForm.astro`：
```astro
---
interface Props {
  redirect?: string;
  message?: 'sent' | 'invalid' | null;
}
const { redirect = '', message = null } = Astro.props;
---

<form method="POST" action="/members/sign-in" class="signin">
  <label for="email" class="signin__label">会員登録メールアドレス</label>
  <input
    id="email"
    name="email"
    type="email"
    autocomplete="email"
    required
    class="signin__input"
    placeholder="your-email@example.com"
  />
  <input type="hidden" name="redirect" value={redirect} />
  <button type="submit" class="btn btn--primary signin__submit">
    ログインリンクをメールで送る
  </button>

  {message === 'sent' && (
    <p class="signin__notice signin__notice--ok">
      メールを送信しました。受信箱を確認し、リンクをクリックしてログインしてください。<br />
      （15分以内、迷惑メールフォルダに入る場合があります）
    </p>
  )}
  {message === 'invalid' && (
    <p class="signin__notice signin__notice--err">
      このメールアドレスは会員として登録されていません。<br />
      ご不明な点は事務局（093-582-7018）までお問い合わせください。
    </p>
  )}
</form>

<style>
  .signin {
    display: grid;
    gap: var(--space-3);
    max-width: 32rem;
    margin: 0 auto;
  }
  .signin__label {
    font-weight: 600;
    color: var(--color-ink);
  }
  .signin__input {
    font: inherit;
    padding: var(--space-3);
    border: 1px solid var(--color-ink-mute);
    border-radius: var(--radius-md);
    background: var(--color-cream);
  }
  .signin__submit { justify-self: start; }
  .signin__notice {
    padding: var(--space-3);
    border-radius: var(--radius-md);
    line-height: var(--lh-normal);
  }
  .signin__notice--ok {
    background: var(--color-sand);
    color: var(--color-green-900);
  }
  .signin__notice--err {
    background: #fce4e0;
    color: #8a2a1a;
  }
</style>
```

- [ ] **Step 2: ページ作成（GET 描画 + POST マジックリンク発行を統合）**

`src/pages/members/sign-in.astro`：
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SignInForm from '../../components/members/SignInForm.astro';
import { issueMagicLink } from '../../lib/magic-link';
import { sendMagicLinkEmail } from '../../lib/resend';
import { recordAudit } from '../../lib/audit';
import { MAGIC_LINK_TTL_SECONDS } from '../../lib/auth-token';

export const prerender = false;

// POST: マジックリンク発行
if (Astro.request.method === 'POST') {
  const form = await Astro.request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const redirect = String(form.get('redirect') ?? '/members/');
  const ip = Astro.request.headers.get('cf-connecting-ip') ?? null;
  const ua = Astro.request.headers.get('user-agent') ?? null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Astro.redirect('/members/sign-in?m=invalid', 303);
  }

  const result = await issueMagicLink(email, redirect);

  if (!result) {
    await recordAudit({
      memberId: null,
      event: 'sign_in_failed',
      detail: { reason: 'email_not_registered', email },
      ip, userAgent: ua,
    });
    return Astro.redirect('/members/sign-in?m=invalid', 303);
  }

  // リクエストの origin を使うことで、ローカル開発・ステージング・本番すべてで
  // 自動的に正しいリンクが生成される（PUBLIC_SITE_URL を本番固定にしておけて、
  // 環境ごとに書き換える運用負担が出ない）。
  const magicLinkUrl = `${Astro.url.origin}/members/verify?token=${encodeURIComponent(result.token)}`;

  // Resend 送信失敗時は audit に残しつつ invalid メッセージで戻す
  // （「このメールは登録済みだが送れなかった」と漏らさないため）
  try {
    await sendMagicLinkEmail({
      to: result.member.email,
      displayName: result.member.display_name,
      magicLinkUrl,
      expiresInMinutes: Math.floor(MAGIC_LINK_TTL_SECONDS / 60),
    });
  } catch (e) {
    await recordAudit({
      memberId: result.member.id,
      event: 'sign_in_failed',
      detail: {
        reason: 'email_send_failed',
        error: e instanceof Error ? e.message : String(e),
      },
      ip, userAgent: ua,
    });
    return Astro.redirect('/members/sign-in?m=invalid', 303);
  }

  await recordAudit({
    memberId: result.member.id,
    event: 'sign_in_request',
    detail: { redirect },
    ip, userAgent: ua,
  });

  return Astro.redirect('/members/sign-in?m=sent', 303);
}

// GET: フォーム表示
const redirect = Astro.url.searchParams.get('redirect') ?? '/members/';
const messageParam = Astro.url.searchParams.get('m');
const message =
  messageParam === 'sent' || messageParam === 'invalid' ? messageParam : null;
---

<BaseLayout
  title="会員ログイン"
  description="NPO法人nest 会員ページのログインリンクを発行します"
>
  <Fragment slot="head">
    <meta name="robots" content="noindex, nofollow" />
  </Fragment>

  <section class="section">
    <div class="container container--narrow">
      <h1 class="section__title">会員ログイン</h1>
      <p class="section__lead">
        会員登録時のメールアドレスを入力してください。<br />
        パスワードは不要です。届いたメールのリンクからログインできます。
      </p>
      <SignInForm redirect={redirect} message={message} />
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: ローカル動作確認**

```bash
npm run dev
# http://localhost:4321/members/sign-in を開く
```
Expected: フォーム表示、見た目崩れなし。POST 送信時もこのファイル内のスクリプト部で処理される。

- [ ] **Step 4: Commit（旧 Task 3.3 を統合）**

```bash
git add src/components/members/SignInForm.astro src/pages/members/sign-in.astro
git commit -m "feat(members): add sign-in page with magic link issuance"
```

---

### Task 3.3: ~~サインイン POST ハンドラ（マジックリンク発行）~~ → **Task 3.2 に統合**

> **2026-05-25 実装時の方針変更**: Astro は同一パスで `.astro` と `.ts` が共存すると `.astro` を優先し `.ts` を無視するため、`src/pages/members/sign-in.ts` を独立ファイルとして作成することはできない。
>
> このため当 Task の POST ハンドラ実装は **Task 3.2 の `sign-in.astro` 内に `Astro.request.method === 'POST'` 分岐として統合**された。元の `sign-in.ts` 案で書かれていたロジック（`issueMagicLink` → メール送信 → 監査ログ → 303 リダイレクト）はすべて Task 3.2 Step 2 のコードブロック先頭に移植済み。
>
> - 作成ファイル：なし（Task 3.2 に統合済み）
> - コミット：Task 3.2 のコミット `feat(members): add sign-in page with magic link issuance` に含まれる
>
> このセクションは履歴として残してあるが、新たな実装作業は不要。

---

### Task 3.4: マジックリンク検証エンドポイント

**Files:**
- Create: `src/pages/members/verify.ts`

- [ ] **Step 1: 実装**

`src/pages/members/verify.ts`：
```ts
import type { APIRoute } from 'astro';
import { consumeMagicLink } from '../../lib/magic-link';
import { createSession } from '../../lib/session';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '../../lib/cookies';
import { recordAudit } from '../../lib/audit';

export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? '';
  const ip = request.headers.get('cf-connecting-ip') ?? null;
  const ua = request.headers.get('user-agent') ?? null;

  if (!token) {
    return new Response('Bad Request', { status: 400 });
  }

  const result = await consumeMagicLink(token);

  if (!result) {
    await recordAudit({
      memberId: null,
      event: 'sign_in_failed',
      detail: { reason: 'invalid_or_expired_token' },
      ip, userAgent: ua,
    });
    return Response.redirect(
      new URL('/members/sign-in?m=invalid', request.url),
      303,
    );
  }

  const session = await createSession(result.member.id);
  cookies.set(SESSION_COOKIE_NAME, session.session_id, sessionCookieOptions());

  await recordAudit({
    memberId: result.member.id,
    event: 'sign_in_success',
    ip, userAgent: ua,
  });

  const redirect = result.redirectTo && result.redirectTo.startsWith('/members')
    ? result.redirectTo
    : '/members/';

  return Response.redirect(new URL(redirect, request.url), 303);
};
```

- [ ] **Step 2: 型チェック**

```bash
npm run astro -- check
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/members/verify.ts
git commit -m "feat(members): add magic link verify endpoint creating session"
```

---

### Task 3.5: サインアウトエンドポイント

**Files:**
- Create: `src/pages/members/sign-out.ts`

- [ ] **Step 1: 実装**

`src/pages/members/sign-out.ts`：
```ts
import type { APIRoute } from 'astro';
import { deleteSession } from '../../lib/session';
import { SESSION_COOKIE_NAME } from '../../lib/cookies';
import { recordAudit } from '../../lib/audit';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const sessionId = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    await deleteSession(sessionId);
    cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
  }
  await recordAudit({
    memberId: locals.member?.id ?? null,
    event: 'sign_out',
    ip: request.headers.get('cf-connecting-ip'),
    userAgent: request.headers.get('user-agent'),
  });
  return Response.redirect(new URL('/members/sign-in', request.url), 303);
};

// GET でもログアウトできるようにしておく（ナビからのリンクで使う）。
// SameSite=Lax により <img>/embed 経由の CSRF は防げる。
// ユーザがクロスサイトリンク経由で誘導される CSRF リスクは残るが、影響は
// 「ログアウトされるだけ」で、Phase 1 では UX 優先で許容する。
export const GET = POST;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/members/sign-out.ts
git commit -m "feat(members): add sign-out endpoint clearing session"
```

---

### Task 3.6: E2E - ログイン成功フロー

Resend / Supabase を実際に叩く E2E は CI で扱いにくいので、Phase 1 は **ローカル開発環境で実行する** 前提のテストを書く。

**Files:**
- Create: `tests/e2e/sign-in.spec.ts`

- [ ] **Step 1: テスト作成**

`tests/e2e/sign-in.spec.ts`：
```ts
import { test, expect } from '@playwright/test';

test.describe('Sign-in flow', () => {
  test('unauthenticated user is redirected to sign-in', async ({ page }) => {
    await page.goto('/members/');
    await expect(page).toHaveURL(/\/members\/sign-in/);
  });

  test('sign-in form posts and shows sent state', async ({ page }) => {
    // 事前条件: Supabase の members に test-staff@example.com を staff フラグで登録しておく
    await page.goto('/members/sign-in');
    await page.fill('input[name="email"]', process.env.E2E_TEST_EMAIL ?? 'test-staff@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/m=sent/);
    await expect(page.getByText('メールを送信しました')).toBeVisible();
  });

  test('unknown email shows invalid message', async ({ page }) => {
    await page.goto('/members/sign-in');
    await page.fill('input[name="email"]', 'no-one@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/m=invalid/);
    await expect(page.getByText('会員として登録されていません')).toBeVisible();
  });
});
```

- [ ] **Step 2: 実行（ローカル環境で）**

```bash
# .env.local に Supabase / Resend / E2E_TEST_EMAIL を設定済みで
npm run test:e2e -- sign-in
```
Expected: 3 passed。

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/sign-in.spec.ts
git commit -m "test(e2e): cover sign-in form submission states"
```

---

### Task 3.7: E2E - 認可ガードの動作確認

**Files:**
- Create: `tests/e2e/authorization.spec.ts`

実セッション Cookie を Playwright が持っている前提のテスト。ヘルパで「テストユーザーにマジックリンクを発行 → 検証 → Cookie 設定」する関数を用意する。

- [ ] **Step 1: テスト用ヘルパを作る**

`tests/e2e/helpers/login.ts`：
```ts
import { type Page, request } from '@playwright/test';

/**
 * テスト用メンバー（DB に事前投入）でセッション Cookie を獲得する。
 * 本番では決して動作しない（DB 直接アクセスが必要）。ローカル E2E のみ。
 */
export async function signInAs(page: Page, email: string) {
  // Phase 1 の運用方針として、E2E はローカル DB に test_* メンバーを置き、
  // 開発フラグ ENABLE_DEV_LOGIN=true 時のみ有効な /members/_dev-login エンドポイントを
  // 経由してセッションを発行する（実装は dev-only ガード付き）。
  await page.goto(`/members/_dev-login?email=${encodeURIComponent(email)}`);
  await page.waitForURL(/\/members\/?$/);
}
```

- [ ] **Step 2: dev-login エンドポイントを実装**

`src/pages/members/_dev-login.ts`：
```ts
import type { APIRoute } from 'astro';
import { createServerClient } from '../../lib/supabase';
import { createSession } from '../../lib/session';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '../../lib/cookies';

export const GET: APIRoute = async ({ request, cookies }) => {
  if (import.meta.env.PROD || import.meta.env.ENABLE_DEV_LOGIN !== 'true') {
    return new Response('Not Found', { status: 404 });
  }
  const email = new URL(request.url).searchParams.get('email');
  if (!email) return new Response('Bad Request', { status: 400 });

  const supabase = createServerClient();
  const { data: member } = await supabase
    .from('members').select('id').eq('email', email.toLowerCase()).maybeSingle();
  if (!member) return new Response('Not Found', { status: 404 });

  const session = await createSession(member.id);
  cookies.set(SESSION_COOKIE_NAME, session.session_id, sessionCookieOptions());

  return Response.redirect(new URL('/members/', request.url), 303);
};
```

`src/env.d.ts` の `ImportMetaEnv` に追記：
```ts
readonly ENABLE_DEV_LOGIN?: string;
```

- [ ] **Step 3: 認可テスト作成**

`tests/e2e/authorization.spec.ts`：
```ts
import { test, expect } from '@playwright/test';
import { signInAs } from './helpers/login';

test.describe('Route authorization', () => {
  test('member can access /members/ but not /members/family', async ({ page }) => {
    await signInAs(page, 'test-member@example.com');
    await page.goto('/members/newsletter/');
    await expect(page.getByText('巣箱')).toBeVisible();
    const familyResponse = await page.goto('/members/family/');
    expect(familyResponse?.status()).toBe(403);
  });

  test('family member can access /members/family', async ({ page }) => {
    await signInAs(page, 'test-family@example.com');
    await page.goto('/members/family/');
    await expect(page.getByText('家族会')).toBeVisible();
  });

  test('non-staff cannot access /members/admin', async ({ page }) => {
    await signInAs(page, 'test-member@example.com');
    const res = await page.goto('/members/admin/');
    expect(res?.status()).toBe(403);
  });

  test('staff can access /members/admin', async ({ page }) => {
    await signInAs(page, 'test-staff@example.com');
    await page.goto('/members/admin/');
    await expect(page.getByText('管理')).toBeVisible();
  });
});
```

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/helpers/login.ts src/pages/members/_dev-login.ts src/env.d.ts tests/e2e/authorization.spec.ts
git commit -m "test(e2e): add authorization route tests with dev-login helper"
```

---

## Stage 4: 会員ページ

### Task 4.1: 会員エリア共通レイアウト

**Files:**
- Create: `src/components/members/MembersNav.astro`
- Create: `src/layouts/MembersLayout.astro`

- [ ] **Step 1: ナビを作成**

`src/components/members/MembersNav.astro`：
```astro
---
const member = Astro.locals.member;
const path = Astro.url.pathname;

interface NavItem { href: string; label: string; show: boolean; }

const items: NavItem[] = [
  { href: '/members/', label: 'ホーム', show: true },
  { href: '/members/newsletter/', label: '機関誌「巣箱」', show: true },
  { href: '/members/family/', label: '家族会', show: member?.role === 'family' },
  { href: '/members/my-note/', label: '自分ノート', show: true },
  { href: '/members/community/', label: 'コミュニティ', show: true },
  { href: '/members/admin/', label: '管理', show: !!member?.is_staff },
];

function isCurrent(href: string) {
  if (href === '/members/') return path === '/members/' || path === '/members';
  return path === href || path.startsWith(href);
}
---

<nav class="mnav" aria-label="会員メニュー">
  <ul class="mnav__list">
    {items.filter(i => i.show).map(i => (
      <li class="mnav__item">
        <a href={i.href} class={`mnav__link ${isCurrent(i.href) ? 'is-current' : ''}`}>
          {i.label}
        </a>
      </li>
    ))}
  </ul>
  <form method="POST" action="/members/sign-out" class="mnav__signout">
    <button type="submit" class="mnav__signout-btn">ログアウト</button>
  </form>
</nav>

<style>
  .mnav {
    background: var(--color-sand);
    border-bottom: 1px solid var(--color-ink-mute);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-4);
  }
  .mnav__list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .mnav__link {
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-md);
    color: var(--color-ink);
    text-decoration: none;
  }
  .mnav__link.is-current { background: var(--color-green-700); color: var(--color-cream); }
  .mnav__signout { margin-left: auto; }
  .mnav__signout-btn {
    background: none;
    border: 1px solid var(--color-ink-mute);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-md);
    cursor: pointer;
    font: inherit;
    color: var(--color-ink);
  }
</style>
```

- [ ] **Step 2: レイアウトを作成**

`src/layouts/MembersLayout.astro`：
```astro
---
import BaseLayout from './BaseLayout.astro';
import MembersNav from '../components/members/MembersNav.astro';

interface Props {
  title: string;
  description?: string;
}
const { title, description } = Astro.props;
const fullTitle = `${title}｜会員ページ - NPO法人 nest`;
---

<BaseLayout title={fullTitle} description={description}>
  <Fragment slot="head">
    <meta name="robots" content="noindex, nofollow" />
  </Fragment>
  <MembersNav />
  <main>
    <slot />
  </main>
</BaseLayout>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/members/MembersNav.astro src/layouts/MembersLayout.astro
git commit -m "feat(members): add members-area shared layout and nav"
```

---

### Task 4.2: 会員トップ

**Files:**
- Create: `src/pages/members/index.astro`

- [ ] **Step 1: 実装**

`src/pages/members/index.astro`：
```astro
---
import MembersLayout from '../../layouts/MembersLayout.astro';
import { createServerClient } from '../../lib/supabase';

const supabase = createServerClient();
const member = Astro.locals.member!;

// お知らせ（最新1件）
const audience = member.role === 'family' ? ['member', 'family'] : ['member'];
const { data: latestAnnouncement } = await supabase
  .from('announcements')
  .select('id, body_markdown, audience, created_at')
  .eq('published', true)
  .in('audience', audience)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

// 最新の機関誌
const { data: latestNewsletter } = await supabase
  .from('newsletters')
  .select('id, title, published_on')
  .eq('visible', true)
  .order('published_on', { ascending: false })
  .limit(1)
  .maybeSingle();

// 次回家族会（家族会員のみ）
let upcomingMeeting: { id: string; held_on: string; title: string; location: string | null } | null = null;
if (member.role === 'family') {
  const { data } = await supabase
    .from('family_meetings')
    .select('id, held_on, title, location')
    .eq('is_upcoming', true)
    .eq('visible', true)
    .maybeSingle();
  upcomingMeeting = data ?? null;
}

const displayName = member.display_name ?? '会員';
---

<MembersLayout title="会員トップ" description="NPO法人 nest 会員ページのトップ">
  <section class="section">
    <div class="container container--narrow">
      <h1 class="section__title">{displayName} 様、ようこそ</h1>

      {latestAnnouncement && (
        <article class="mcard">
          <h2 class="mcard__title">お知らせ</h2>
          <p class="mcard__body">{latestAnnouncement.body_markdown}</p>
        </article>
      )}

      {latestNewsletter && (
        <article class="mcard">
          <h2 class="mcard__title">最新の機関誌「巣箱」</h2>
          <p class="mcard__body">
            {latestNewsletter.title}（{new Date(latestNewsletter.published_on).toLocaleDateString('ja-JP')}）
          </p>
          <a href="/members/newsletter/" class="btn btn--outline">バックナンバー一覧へ</a>
        </article>
      )}

      {upcomingMeeting && (
        <article class="mcard">
          <h2 class="mcard__title">次回家族会</h2>
          <p class="mcard__body">
            <strong>{upcomingMeeting.title}</strong><br />
            {new Date(upcomingMeeting.held_on).toLocaleDateString('ja-JP')}
            {upcomingMeeting.location && <> @ {upcomingMeeting.location}</>}
          </p>
          <a href="/members/family/" class="btn btn--outline">詳しく見る</a>
        </article>
      )}
    </div>
  </section>
</MembersLayout>

<style>
  .mcard {
    background: var(--color-cream);
    padding: var(--space-5);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-soft);
    margin-block: var(--space-4);
  }
  .mcard__title {
    font-family: var(--font-heading);
    margin-top: 0;
  }
</style>
```

- [ ] **Step 2: ローカル動作確認**

```bash
npm run dev
# /members/sign-in からマジックリンク経由でログイン → /members/ が表示
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/members/index.astro
git commit -m "feat(members): add members home with announcement and latest items"
```

---

### Task 4.3: 機関誌バックナンバー一覧

**Files:**
- Create: `src/components/members/PdfCard.astro`
- Create: `src/pages/members/newsletter/index.astro`

- [ ] **Step 1: PDF カードコンポーネント**

`src/components/members/PdfCard.astro`：
```astro
---
interface Props {
  title: string;
  subtitle?: string;
  downloadHref: string;
  thumbnailUrl?: string | null;
}
const { title, subtitle, downloadHref, thumbnailUrl } = Astro.props;
---

<article class="pdfc">
  <div class="pdfc__thumb">
    {thumbnailUrl
      ? <img src={thumbnailUrl} alt="" loading="lazy" />
      : <span class="pdfc__ph">PDF 表紙</span>}
  </div>
  <div class="pdfc__body">
    <h3 class="pdfc__title">{title}</h3>
    {subtitle && <p class="pdfc__sub">{subtitle}</p>}
    <a href={downloadHref} class="btn btn--primary">PDFダウンロード</a>
  </div>
</article>

<style>
  .pdfc {
    display: flex;
    flex-direction: column;
    background: var(--color-cream);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-soft);
    overflow: hidden;
  }
  .pdfc__thumb {
    aspect-ratio: 3 / 4;
    background: var(--color-sand);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pdfc__thumb img { width: 100%; height: 100%; object-fit: cover; }
  .pdfc__ph { color: var(--color-ink-mute); font-size: var(--fs-small); }
  .pdfc__body { padding: var(--space-4); display: grid; gap: var(--space-2); }
  .pdfc__title { font-family: var(--font-heading); margin: 0; }
  .pdfc__sub { color: var(--color-ink-mute); margin: 0; }
</style>
```

- [ ] **Step 2: 一覧ページ**

`src/pages/members/newsletter/index.astro`：
```astro
---
import MembersLayout from '../../../layouts/MembersLayout.astro';
import PdfCard from '../../../components/members/PdfCard.astro';
import { createServerClient } from '../../../lib/supabase';

const supabase = createServerClient();
const { data: newsletters } = await supabase
  .from('newsletters')
  .select('id, title, issue, published_on, cover_path')
  .eq('visible', true)
  .order('sort_order', { ascending: false })
  .order('published_on', { ascending: false });
---

<MembersLayout title="機関誌「巣箱」バックナンバー">
  <section class="section">
    <div class="container">
      <h1 class="section__title">機関誌「巣箱」バックナンバー</h1>
      <p class="section__lead">PDFをダウンロードしてご覧いただけます。</p>

      {(!newsletters || newsletters.length === 0) && (
        <p class="text-soft">バックナンバーはまだ登録されていません。</p>
      )}

      <div class="grid-3">
        {newsletters?.map(n => (
          <PdfCard
            title={n.title}
            subtitle={new Date(n.published_on).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
            downloadHref={`/members/newsletter/${n.id}/download`}
          />
        ))}
      </div>
    </div>
  </section>
</MembersLayout>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/members/PdfCard.astro src/pages/members/newsletter/index.astro
git commit -m "feat(members): add newsletter backissue list page"
```

---

### Task 4.4: 機関誌 PDF ダウンロードエンドポイント

**Files:**
- Create: `src/pages/members/newsletter/[id]/download.ts`

- [ ] **Step 1: 実装**

`src/pages/members/newsletter/[id]/download.ts`：
```ts
import type { APIRoute } from 'astro';
import { createServerClient } from '../../../../lib/supabase';
import { createSignedPdfUrl } from '../../../../lib/pdf-url';
import { recordAudit } from '../../../../lib/audit';

export const GET: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) return new Response('Bad Request', { status: 400 });

  const member = locals.member;
  if (!member) return new Response('Unauthorized', { status: 401 });

  const supabase = createServerClient();
  const { data: newsletter } = await supabase
    .from('newsletters')
    .select('id, title, pdf_path, visible')
    .eq('id', id)
    .maybeSingle();

  if (!newsletter || !newsletter.visible) {
    return new Response('Not Found', { status: 404 });
  }

  const signedUrl = await createSignedPdfUrl('newsletters', newsletter.pdf_path);

  await recordAudit({
    memberId: member.id,
    event: 'pdf_download',
    detail: { kind: 'newsletter', id, title: newsletter.title },
    ip: request.headers.get('cf-connecting-ip'),
    userAgent: request.headers.get('user-agent'),
  });

  return Response.redirect(signedUrl, 302);
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/members/newsletter/\[id\]/download.ts
git commit -m "feat(members): add newsletter download endpoint with signed URL"
```

---

### Task 4.5: 家族会ページ

**Files:**
- Create: `src/pages/members/family/index.astro`

- [ ] **Step 1: 実装**

`src/pages/members/family/index.astro`：
```astro
---
import MembersLayout from '../../../layouts/MembersLayout.astro';
import { createServerClient } from '../../../lib/supabase';

const supabase = createServerClient();

const { data: upcoming } = await supabase
  .from('family_meetings')
  .select('id, held_on, title, location, agenda')
  .eq('is_upcoming', true)
  .eq('visible', true)
  .maybeSingle();

const { data: past } = await supabase
  .from('family_meetings')
  .select('id, held_on, title, minutes_pdf_path')
  .eq('is_upcoming', false)
  .eq('visible', true)
  .order('held_on', { ascending: false });
---

<MembersLayout title="家族会">
  <section class="section">
    <div class="container container--narrow">
      <h1 class="section__title">家族会</h1>

      {upcoming && (
        <article class="mcard">
          <h2 class="mcard__title">次回のご案内</h2>
          <p><strong>{upcoming.title}</strong></p>
          <p>
            日時：{new Date(upcoming.held_on).toLocaleDateString('ja-JP')}<br />
            {upcoming.location && <>会場：{upcoming.location}<br /></>}
          </p>
          {upcoming.agenda && <p class="mcard__body">{upcoming.agenda}</p>}
        </article>
      )}

      <h2 class="section__title section__title--sub">過去の議事録</h2>
      {(!past || past.length === 0) ? (
        <p class="text-soft">議事録はまだありません。</p>
      ) : (
        <ul class="minutes">
          {past.map(m => (
            <li class="minutes__item">
              <span class="minutes__date">{new Date(m.held_on).toLocaleDateString('ja-JP')}</span>
              <span class="minutes__title">{m.title}</span>
              {m.minutes_pdf_path && (
                <a href={`/members/family/minutes/${m.id}/download`} class="btn btn--outline btn--sm">議事録PDF</a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  </section>
</MembersLayout>

<style>
  .mcard { background: var(--color-cream); padding: var(--space-5); border-radius: var(--radius-lg); box-shadow: var(--shadow-soft); margin-block: var(--space-4); }
  .mcard__title { font-family: var(--font-heading); margin-top: 0; }
  .minutes { list-style: none; padding: 0; }
  .minutes__item { display: grid; grid-template-columns: 8em 1fr auto; gap: var(--space-3); padding: var(--space-3); border-bottom: 1px solid var(--color-ink-mute); align-items: center; }
  .minutes__date { color: var(--color-ink-mute); font-variant-numeric: tabular-nums; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/members/family/index.astro
git commit -m "feat(members): add family meeting page with upcoming and past minutes"
```

---

### Task 4.6: 議事録 PDF ダウンロード

**Files:**
- Create: `src/pages/members/family/minutes/[id]/download.ts`

- [ ] **Step 1: 実装**

`src/pages/members/family/minutes/[id]/download.ts`：
```ts
import type { APIRoute } from 'astro';
import { createServerClient } from '../../../../../lib/supabase';
import { createSignedPdfUrl } from '../../../../../lib/pdf-url';
import { recordAudit } from '../../../../../lib/audit';

export const GET: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) return new Response('Bad Request', { status: 400 });

  const member = locals.member;
  if (!member || member.role !== 'family') {
    return new Response('Forbidden', { status: 403 });
  }

  const supabase = createServerClient();
  const { data: meeting } = await supabase
    .from('family_meetings')
    .select('id, title, minutes_pdf_path, visible')
    .eq('id', id)
    .maybeSingle();

  if (!meeting || !meeting.visible || !meeting.minutes_pdf_path) {
    return new Response('Not Found', { status: 404 });
  }

  const signedUrl = await createSignedPdfUrl('family-minutes', meeting.minutes_pdf_path);

  await recordAudit({
    memberId: member.id,
    event: 'pdf_download',
    detail: { kind: 'family_minutes', id, title: meeting.title },
    ip: request.headers.get('cf-connecting-ip'),
    userAgent: request.headers.get('user-agent'),
  });

  return Response.redirect(signedUrl, 302);
};
```

- [ ] **Step 2: Commit**

```bash
git add "src/pages/members/family/minutes/[id]/download.ts"
git commit -m "feat(members): add family-meeting minutes download endpoint"
```

---

### Task 4.7: 自分ノート紹介ページ

**Files:**
- Create: `src/pages/members/my-note/index.astro`

- [ ] **Step 1: 実装**

`src/pages/members/my-note/index.astro`：
```astro
---
import MembersLayout from '../../../layouts/MembersLayout.astro';
---

<MembersLayout title="自分ノート">
  <section class="section">
    <div class="container container--narrow">
      <h1 class="section__title">自分ノート</h1>
      <p class="section__lead">
        「親なきあと」を見据えて、ご本人の生活情報・希望・支援者ネットワークを書き残しておく
        ためのノートです。
      </p>

      <article class="mcard">
        <h2 class="mcard__title">なぜ書くのか</h2>
        <p>
          ご家族や支援者が突然関わるようになったとき、本人のことを知っている人がいない／少ないと、
          本人が安心して生活を続けることが難しくなります。
          書いておくことで、本人の意思と日常を「言葉」で残し、誰かに引き継げる状態にすることができます。
        </p>
      </article>

      <article class="mcard">
        <h2 class="mcard__title">何を書くのか（例）</h2>
        <ul>
          <li>医療情報（病歴・服薬・主治医・アレルギー）</li>
          <li>生活情報（食事の好み・苦手なこと・1日のルーティン）</li>
          <li>緊急連絡先・支援者ネットワーク</li>
          <li>「親なきあと」の希望（住まい・仕事・お金）</li>
        </ul>
      </article>

      <article class="mcard">
        <h2 class="mcard__title">記入用 PDF テンプレート</h2>
        <p>下記から印刷用のテンプレートをダウンロードできます。</p>
        <p>
          <!-- TODO: Phase 1 リリース時に河原さん／林代表用意の PDF を配置 -->
          <a href="#" class="btn btn--primary">PDFテンプレートをダウンロード（準備中）</a>
        </p>
        <p class="text-soft">
          ※ Phase 2 では、このノートを Web 上で記入・印刷できるツールを実装予定です。
        </p>
      </article>

      <article class="mcard">
        <h2 class="mcard__title">参考リンク</h2>
        <ul>
          <li><a href="https://www.mhlw.go.jp/" rel="external">厚生労働省「私のノート」</a></li>
          <li><a href="https://zen-iku.jp/" rel="external">全国手をつなぐ育成会連合会</a></li>
        </ul>
      </article>
    </div>
  </section>
</MembersLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/members/my-note/index.astro
git commit -m "feat(members): add my-note introduction page (Phase 1 stub)"
```

---

### Task 4.8: コミュニティページ（LINE + Instagram）

**Files:**
- Create: `src/pages/members/community/index.astro`

- [ ] **Step 1: 実装**

`src/pages/members/community/index.astro`：
```astro
---
import MembersLayout from '../../../layouts/MembersLayout.astro';
import { createServerClient } from '../../../lib/supabase';

// 招待URL等の設定値は announcements テーブルや専用の settings テーブルから取るのが
// 理想だが、Phase 1 では環境変数 / 直接編集で十分とする。
// 河原さんが管理画面から差し替えたくなったら Phase 2 で settings テーブルを足す。
const LINE_OC_URL = 'https://line.me/ti/g2/REPLACE_ME';
const INSTAGRAM_URL = 'https://instagram.com/kimachi_ya/';
---

<MembersLayout title="コミュニティ">
  <section class="section">
    <div class="container container--narrow">
      <h1 class="section__title">コミュニティ</h1>

      <article class="mcard">
        <h2 class="mcard__title">LINE オープンチャット</h2>
        <p>
          家族・支援者の方々で日々のことを共有できる場として、LINE オープンチャット
          「nest 家族の輪」をご用意しています。
        </p>
        <p>
          <a href={LINE_OC_URL} class="btn btn--primary" rel="external">
            オープンチャットに参加する
          </a>
        </p>
        <h3>参加にあたってのお願い</h3>
        <ul>
          <li>個人情報（実名・住所・電話番号など）の書き込みはお控えください</li>
          <li>運営は事務局スタッフが行います。不適切な投稿は削除する場合があります</li>
          <li>退会される場合は、ご自身でグループから退出してください</li>
        </ul>
      </article>

      <article class="mcard">
        <h2 class="mcard__title">Instagram で活動を発信中</h2>
        <p>
          nest が運営する木町家を中心に、活動の様子を Instagram で発信しています。
        </p>
        <p>
          <a href={INSTAGRAM_URL} class="btn btn--outline" rel="external">
            @kimachi_ya をフォローする
          </a>
        </p>
      </article>
    </div>
  </section>
</MembersLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/members/community/index.astro
git commit -m "feat(members): add community page with LINE OC and Instagram links"
```

---

### Task 4.9: 個人情報保護ページ

**Files:**
- Create: `src/pages/members/privacy.astro`

- [ ] **Step 1: 実装**

`src/pages/members/privacy.astro`：
```astro
---
import MembersLayout from '../../layouts/MembersLayout.astro';
---

<MembersLayout title="会員ページ 個人情報の取扱い">
  <section class="section">
    <div class="container container--narrow">
      <h1 class="section__title">会員ページにおける個人情報の取扱い</h1>

      <h2>1. 収集する情報</h2>
      <ul>
        <li>氏名（任意）</li>
        <li>メールアドレス</li>
        <li>会員区分（全会員 / 家族会員）</li>
        <li>ログイン履歴・PDF ダウンロード履歴（最大90日）</li>
      </ul>

      <h2>2. 利用目的</h2>
      <ul>
        <li>会員向けコンテンツの配信</li>
        <li>本人確認（ログイン）</li>
        <li>サービス改善のための統計分析</li>
      </ul>

      <h2>3. 保存場所</h2>
      <p>
        Supabase 東京リージョン（日本国内）に保存します。
        会員情報の越境移転（海外サーバへの送信）は行いません。
      </p>

      <h2>4. 第三者提供</h2>
      <p>原則として行いません。法令に基づく場合を除き、ご本人の同意なく第三者に提供することはありません。</p>

      <h2>5. 削除・訂正のご依頼</h2>
      <p>
        ご自身の情報の削除・訂正を希望される場合は、事務局までご連絡ください。
      </p>
      <address>
        NPO法人 nest 事務局<br />
        〒803-0851 福岡県北九州市小倉北区木町3丁目6−7<br />
        TEL: 093-582-7018（平日 8:00〜20:00）
      </address>

      <h2>6. ポリシーの変更</h2>
      <p>本ポリシーは予告なく改定する場合があります。重要な変更は会員ページのお知らせで通知します。</p>
    </div>
  </section>
</MembersLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/members/privacy.astro
git commit -m "feat(members): add privacy notice page for members area"
```

---

## Stage 5: 管理画面

### Task 5.1: 管理画面トップ

**Files:**
- Create: `src/pages/members/admin/index.astro`

- [ ] **Step 1: 実装**

`src/pages/members/admin/index.astro`：
```astro
---
import MembersLayout from '../../../layouts/MembersLayout.astro';
import { createServerClient } from '../../../lib/supabase';

const supabase = createServerClient();
const { count: memberCount } = await supabase
  .from('members')
  .select('id', { count: 'exact', head: true })
  .is('deleted_at', null);
const { count: newsletterCount } = await supabase
  .from('newsletters').select('id', { count: 'exact', head: true });
const { count: meetingCount } = await supabase
  .from('family_meetings').select('id', { count: 'exact', head: true });
---

<MembersLayout title="管理">
  <section class="section">
    <div class="container container--narrow">
      <h1 class="section__title">管理画面</h1>
      <p class="section__lead">スタッフ専用です。</p>

      <ul class="admin-menu">
        <li><a href="/members/admin/members">会員管理（{memberCount ?? 0} 名）</a></li>
        <li><a href="/members/admin/newsletters">機関誌管理（{newsletterCount ?? 0} 号）</a></li>
        <li><a href="/members/admin/family">家族会管理（{meetingCount ?? 0} 件）</a></li>
        <li><a href="/members/admin/announcements">お知らせ管理</a></li>
      </ul>
    </div>
  </section>
</MembersLayout>

<style>
  .admin-menu { list-style: none; padding: 0; }
  .admin-menu li { padding: var(--space-3); border-bottom: 1px solid var(--color-ink-mute); }
  .admin-menu a { font-size: var(--fs-large); }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/members/admin/index.astro
git commit -m "feat(admin): add admin home with counts"
```

---

### Task 5.2: 会員一覧・追加・編集・削除

**Files:**
- Create: `src/pages/members/admin/members/index.astro`
- Create: `src/pages/members/admin/members/new.astro`
- Create: `src/pages/members/admin/members/[id].astro`
- Create: `src/pages/members/admin/members/[id]/delete.ts`

このタスクは規模が大きいため、ステップが多めになります。

- [ ] **Step 1: 会員一覧ページ**

`src/pages/members/admin/members/index.astro`：
```astro
---
import MembersLayout from '../../../../layouts/MembersLayout.astro';
import { createServerClient } from '../../../../lib/supabase';

const supabase = createServerClient();
const { data: members } = await supabase
  .from('members')
  .select('id, email, display_name, role, is_staff, joined_at')
  .is('deleted_at', null)
  .order('joined_at', { ascending: false });
---

<MembersLayout title="会員管理">
  <section class="section">
    <div class="container">
      <div class="admin-head">
        <h1 class="section__title">会員一覧</h1>
        <a href="/members/admin/members/new" class="btn btn--primary">＋ 新規追加</a>
      </div>

      <table class="admin-table">
        <thead>
          <tr><th>氏名</th><th>メール</th><th>区分</th><th>スタッフ</th><th>入会日</th><th></th></tr>
        </thead>
        <tbody>
          {members?.map(m => (
            <tr>
              <td>{m.display_name ?? '（未登録）'}</td>
              <td>{m.email}</td>
              <td>{m.role === 'family' ? '家族会員' : '全会員'}</td>
              <td>{m.is_staff ? '○' : '—'}</td>
              <td>{new Date(m.joined_at).toLocaleDateString('ja-JP')}</td>
              <td><a href={`/members/admin/members/${m.id}`}>編集</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
</MembersLayout>

<style>
  .admin-head { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
  .admin-table { width: 100%; border-collapse: collapse; }
  .admin-table th, .admin-table td { padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--color-ink-mute); text-align: left; }
</style>
```

- [ ] **Step 2: 新規追加ページ（フォーム + POST 同一ファイル）**

`src/pages/members/admin/members/new.astro`：
```astro
---
import MembersLayout from '../../../../layouts/MembersLayout.astro';
import { createServerClient } from '../../../../lib/supabase';
import { recordAudit } from '../../../../lib/audit';

let error: string | null = null;
let success = false;

if (Astro.request.method === 'POST') {
  const form = await Astro.request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const displayName = String(form.get('display_name') ?? '').trim() || null;
  const role = String(form.get('role') ?? 'member');
  const isStaff = form.get('is_staff') === 'on';
  const joinedAt = String(form.get('joined_at') ?? new Date().toISOString().slice(0, 10));
  const note = String(form.get('note') ?? '').trim() || null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    error = 'メールアドレスの形式が正しくありません。';
  } else if (!['member', 'family'].includes(role)) {
    error = '会員区分が正しくありません。';
  } else {
    const supabase = createServerClient();
    const { data, error: insertError } = await supabase
      .from('members')
      .insert({ email, display_name: displayName, role, is_staff: isStaff, joined_at: joinedAt, note })
      .select('id').single();
    if (insertError) {
      error = `登録に失敗しました：${insertError.message}`;
    } else {
      await recordAudit({
        memberId: Astro.locals.member!.id,
        event: 'member_created',
        detail: { new_member_id: data!.id, email, role, is_staff: isStaff },
      });
      success = true;
    }
  }
}
---

<MembersLayout title="会員 新規追加">
  <section class="section">
    <div class="container container--narrow">
      <h1 class="section__title">会員 新規追加</h1>

      {error && <p class="err">{error}</p>}
      {success && (
        <>
          <p class="ok">登録しました。</p>
          <p><a href="/members/admin/members">一覧に戻る</a></p>
        </>
      )}

      {!success && (
        <form method="POST" class="adminform">
          <label>メールアドレス（必須）
            <input type="email" name="email" required />
          </label>
          <label>氏名
            <input type="text" name="display_name" />
          </label>
          <label>会員区分
            <select name="role">
              <option value="member">全会員</option>
              <option value="family">家族会員</option>
            </select>
          </label>
          <label class="adminform__check">
            <input type="checkbox" name="is_staff" />スタッフ権限を付与
          </label>
          <label>入会日
            <input type="date" name="joined_at" value={new Date().toISOString().slice(0, 10)} />
          </label>
          <label>備考
            <textarea name="note" rows="3"></textarea>
          </label>
          <button type="submit" class="btn btn--primary">登録</button>
        </form>
      )}
    </div>
  </section>
</MembersLayout>

<style>
  .adminform { display: grid; gap: var(--space-3); }
  .adminform label { display: grid; gap: var(--space-1); font-weight: 600; }
  .adminform input, .adminform select, .adminform textarea { font: inherit; padding: var(--space-2); border: 1px solid var(--color-ink-mute); border-radius: var(--radius-md); }
  .adminform__check { grid-template-columns: auto 1fr; align-items: center; gap: var(--space-2); font-weight: 400; }
  .err { color: #8a2a1a; }
  .ok { color: var(--color-green-700); }
</style>
```

- [ ] **Step 3: 編集ページ**

`src/pages/members/admin/members/[id].astro`：
```astro
---
import MembersLayout from '../../../../layouts/MembersLayout.astro';
import { createServerClient } from '../../../../lib/supabase';
import { recordAudit } from '../../../../lib/audit';

const id = Astro.params.id!;
const supabase = createServerClient();
let error: string | null = null;
let saved = false;

if (Astro.request.method === 'POST') {
  const form = await Astro.request.formData();
  const displayName = String(form.get('display_name') ?? '').trim() || null;
  const role = String(form.get('role') ?? 'member');
  const isStaff = form.get('is_staff') === 'on';
  const note = String(form.get('note') ?? '').trim() || null;

  const { error: updateError } = await supabase
    .from('members')
    .update({ display_name: displayName, role, is_staff: isStaff, note })
    .eq('id', id);
  if (updateError) {
    error = updateError.message;
  } else {
    await recordAudit({
      memberId: Astro.locals.member!.id,
      event: 'member_updated',
      detail: { target_id: id },
    });
    saved = true;
  }
}

const { data: member } = await supabase
  .from('members')
  .select('id, email, display_name, role, is_staff, joined_at, note, deleted_at')
  .eq('id', id)
  .maybeSingle();

if (!member) {
  return new Response('Not Found', { status: 404 });
}
---

<MembersLayout title={`会員編集: ${member.display_name ?? member.email}`}>
  <section class="section">
    <div class="container container--narrow">
      <h1 class="section__title">会員編集</h1>
      <p>メール：{member.email}（変更不可）</p>

      {error && <p class="err">{error}</p>}
      {saved && <p class="ok">保存しました。</p>}

      <form method="POST" class="adminform">
        <label>氏名<input type="text" name="display_name" value={member.display_name ?? ''} /></label>
        <label>会員区分
          <select name="role">
            <option value="member" selected={member.role === 'member'}>全会員</option>
            <option value="family" selected={member.role === 'family'}>家族会員</option>
          </select>
        </label>
        <label class="adminform__check">
          <input type="checkbox" name="is_staff" checked={member.is_staff} />スタッフ権限
        </label>
        <label>備考<textarea name="note" rows="3">{member.note ?? ''}</textarea></label>
        <button type="submit" class="btn btn--primary">保存</button>
      </form>

      <hr />

      <form method="POST" action={`/members/admin/members/${member.id}/delete`} onsubmit="return confirm('この会員を削除（論理削除）しますか？')">
        <button type="submit" class="btn btn--outline">退会処理（論理削除）</button>
      </form>
    </div>
  </section>
</MembersLayout>

<style>
  .adminform { display: grid; gap: var(--space-3); }
  .adminform label { display: grid; gap: var(--space-1); font-weight: 600; }
  .adminform input, .adminform select, .adminform textarea { font: inherit; padding: var(--space-2); border: 1px solid var(--color-ink-mute); border-radius: var(--radius-md); }
  .adminform__check { grid-template-columns: auto 1fr; align-items: center; gap: var(--space-2); font-weight: 400; }
  .err { color: #8a2a1a; }
  .ok { color: var(--color-green-700); }
</style>
```

- [ ] **Step 4: 論理削除エンドポイント**

`src/pages/members/admin/members/[id]/delete.ts`：
```ts
import type { APIRoute } from 'astro';
import { createServerClient } from '../../../../../lib/supabase';
import { recordAudit } from '../../../../../lib/audit';

export const POST: APIRoute = async ({ params, locals, request }) => {
  const id = params.id;
  if (!id || !locals.member?.is_staff) {
    return new Response('Forbidden', { status: 403 });
  }
  const supabase = createServerClient();
  const { error } = await supabase
    .from('members')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return new Response(error.message, { status: 500 });

  // セッションも全部消す
  await supabase.from('sessions').delete().eq('member_id', id);

  await recordAudit({
    memberId: locals.member.id,
    event: 'member_deleted',
    detail: { target_id: id },
    ip: request.headers.get('cf-connecting-ip'),
    userAgent: request.headers.get('user-agent'),
  });

  return Response.redirect(new URL('/members/admin/members', request.url), 303);
};
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/members/admin/members/
git commit -m "feat(admin): add member CRUD pages (list/new/edit/delete)"
```

---

### Task 5.3: 機関誌管理ページ

**Files:**
- Create: `src/pages/members/admin/newsletters.astro`

仕様簡略化：Phase 1 ではフォーム入力 + Supabase Storage への直接アップロードはせず、**「PDF は Supabase Studio で newsletters バケットに手動アップロード → このページでメタ情報のみ登録」** という運用にする。これが最小で安全。

- [ ] **Step 1: 実装**

`src/pages/members/admin/newsletters.astro`：
```astro
---
import MembersLayout from '../../../layouts/MembersLayout.astro';
import { createServerClient } from '../../../lib/supabase';

const supabase = createServerClient();
let message: string | null = null;

if (Astro.request.method === 'POST') {
  const form = await Astro.request.formData();
  const action = String(form.get('_action') ?? '');

  if (action === 'create') {
    const title = String(form.get('title') ?? '').trim();
    const issue = String(form.get('issue') ?? '').trim();
    const publishedOn = String(form.get('published_on') ?? '');
    const pdfPath = String(form.get('pdf_path') ?? '').trim();
    const coverPath = String(form.get('cover_path') ?? '').trim() || null;

    if (title && issue && publishedOn && pdfPath) {
      const { error } = await supabase.from('newsletters').insert({
        title, issue, published_on: publishedOn, pdf_path: pdfPath, cover_path: coverPath,
      });
      message = error ? `エラー：${error.message}` : '登録しました。';
    } else {
      message = '必須項目が足りません。';
    }
  } else if (action === 'toggle_visible') {
    const id = String(form.get('id'));
    const visible = form.get('visible') === 'true';
    await supabase.from('newsletters').update({ visible: !visible }).eq('id', id);
    message = '表示/非表示を切替えました。';
  } else if (action === 'delete') {
    const id = String(form.get('id'));
    await supabase.from('newsletters').delete().eq('id', id);
    message = '削除しました。';
  }
}

const { data: list } = await supabase
  .from('newsletters')
  .select('id, title, issue, published_on, pdf_path, visible')
  .order('published_on', { ascending: false });
---

<MembersLayout title="機関誌管理">
  <section class="section">
    <div class="container">
      <h1 class="section__title">機関誌「巣箱」管理</h1>
      <p class="text-soft">
        PDF ファイルは Supabase Studio から <code>newsletters</code> バケットにアップロードし、
        そのパス（例：<code>vol-14.pdf</code>）をここで登録してください。
      </p>

      {message && <p class="notice">{message}</p>}

      <h2>新規登録</h2>
      <form method="POST" class="adminform">
        <input type="hidden" name="_action" value="create" />
        <label>タイトル<input type="text" name="title" placeholder="巣箱 vol.14" required /></label>
        <label>号<input type="text" name="issue" placeholder="vol.14" required /></label>
        <label>発行日<input type="date" name="published_on" required /></label>
        <label>PDFパス（バケット内）<input type="text" name="pdf_path" placeholder="vol-14.pdf" required /></label>
        <label>表紙パス（任意）<input type="text" name="cover_path" placeholder="vol-14-cover.jpg" /></label>
        <button type="submit" class="btn btn--primary">登録</button>
      </form>

      <h2>登録済み一覧</h2>
      <table class="admin-table">
        <thead><tr><th>号</th><th>タイトル</th><th>発行日</th><th>表示</th><th>操作</th></tr></thead>
        <tbody>
          {list?.map(n => (
            <tr>
              <td>{n.issue}</td>
              <td>{n.title}</td>
              <td>{new Date(n.published_on).toLocaleDateString('ja-JP')}</td>
              <td>{n.visible ? '○' : '✗'}</td>
              <td>
                <form method="POST" style="display: inline">
                  <input type="hidden" name="_action" value="toggle_visible" />
                  <input type="hidden" name="id" value={n.id} />
                  <input type="hidden" name="visible" value={String(n.visible)} />
                  <button type="submit" class="btn btn--outline btn--sm">{n.visible ? '非表示' : '表示'}</button>
                </form>
                <form method="POST" style="display: inline" onsubmit="return confirm('完全削除しますか？')">
                  <input type="hidden" name="_action" value="delete" />
                  <input type="hidden" name="id" value={n.id} />
                  <button type="submit" class="btn btn--outline btn--sm">削除</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
</MembersLayout>

<style>
  .adminform { display: grid; gap: var(--space-3); max-width: 32rem; }
  .adminform label { display: grid; gap: var(--space-1); font-weight: 600; }
  .adminform input { font: inherit; padding: var(--space-2); border: 1px solid var(--color-ink-mute); border-radius: var(--radius-md); }
  .admin-table { width: 100%; border-collapse: collapse; margin-top: var(--space-4); }
  .admin-table th, .admin-table td { padding: var(--space-2); border-bottom: 1px solid var(--color-ink-mute); text-align: left; }
  .notice { padding: var(--space-2) var(--space-3); background: var(--color-sand); border-radius: var(--radius-md); }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/members/admin/newsletters.astro
git commit -m "feat(admin): add newsletter management with create/toggle/delete"
```

---

### Task 5.4: 家族会管理ページ

**Files:**
- Create: `src/pages/members/admin/family.astro`

機関誌管理と同じパターンで実装。

- [ ] **Step 1: 実装**

`src/pages/members/admin/family.astro`：
```astro
---
import MembersLayout from '../../../layouts/MembersLayout.astro';
import { createServerClient } from '../../../lib/supabase';

const supabase = createServerClient();
let message: string | null = null;

if (Astro.request.method === 'POST') {
  const form = await Astro.request.formData();
  const action = String(form.get('_action') ?? '');

  if (action === 'create') {
    const heldOn = String(form.get('held_on') ?? '');
    const title = String(form.get('title') ?? '').trim();
    const location = String(form.get('location') ?? '').trim() || null;
    const agenda = String(form.get('agenda') ?? '').trim() || null;
    const minutesPath = String(form.get('minutes_pdf_path') ?? '').trim() || null;
    const isUpcoming = form.get('is_upcoming') === 'on';

    if (isUpcoming) {
      // 既存の upcoming を解除（DB 制約により同時に1件しか許容しないため）
      await supabase.from('family_meetings').update({ is_upcoming: false }).eq('is_upcoming', true);
    }

    const { error } = await supabase.from('family_meetings').insert({
      held_on: heldOn, title, location, agenda,
      minutes_pdf_path: minutesPath, is_upcoming: isUpcoming,
    });
    message = error ? `エラー：${error.message}` : '登録しました。';
  } else if (action === 'toggle_upcoming') {
    const id = String(form.get('id'));
    await supabase.from('family_meetings').update({ is_upcoming: false }).eq('is_upcoming', true);
    await supabase.from('family_meetings').update({ is_upcoming: true }).eq('id', id);
    message = '「次回」を変更しました。';
  } else if (action === 'delete') {
    const id = String(form.get('id'));
    await supabase.from('family_meetings').delete().eq('id', id);
    message = '削除しました。';
  }
}

const { data: list } = await supabase
  .from('family_meetings')
  .select('id, held_on, title, location, is_upcoming, minutes_pdf_path')
  .order('held_on', { ascending: false });
---

<MembersLayout title="家族会管理">
  <section class="section">
    <div class="container">
      <h1 class="section__title">家族会管理</h1>
      <p class="text-soft">
        議事録 PDF は Supabase Studio から <code>family-minutes</code> バケットにアップし、
        パスをここで登録してください。
      </p>

      {message && <p class="notice">{message}</p>}

      <h2>新規登録</h2>
      <form method="POST" class="adminform">
        <input type="hidden" name="_action" value="create" />
        <label>開催日<input type="date" name="held_on" required /></label>
        <label>タイトル<input type="text" name="title" required placeholder="第○回 家族会" /></label>
        <label>場所<input type="text" name="location" placeholder="木町家2F" /></label>
        <label>議題・案内<textarea name="agenda" rows="3"></textarea></label>
        <label>議事録PDFパス<input type="text" name="minutes_pdf_path" placeholder="2026-06-15.pdf" /></label>
        <label class="adminform__check"><input type="checkbox" name="is_upcoming" />これを「次回」として表示する</label>
        <button type="submit" class="btn btn--primary">登録</button>
      </form>

      <h2>登録済み一覧</h2>
      <table class="admin-table">
        <thead><tr><th>開催日</th><th>タイトル</th><th>次回</th><th>議事録</th><th>操作</th></tr></thead>
        <tbody>
          {list?.map(m => (
            <tr>
              <td>{new Date(m.held_on).toLocaleDateString('ja-JP')}</td>
              <td>{m.title}</td>
              <td>{m.is_upcoming ? '○' : '—'}</td>
              <td>{m.minutes_pdf_path ?? '—'}</td>
              <td>
                <form method="POST" style="display: inline">
                  <input type="hidden" name="_action" value="toggle_upcoming" />
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" class="btn btn--outline btn--sm">次回にする</button>
                </form>
                <form method="POST" style="display: inline" onsubmit="return confirm('削除しますか？')">
                  <input type="hidden" name="_action" value="delete" />
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" class="btn btn--outline btn--sm">削除</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
</MembersLayout>

<style>
  .adminform { display: grid; gap: var(--space-3); max-width: 36rem; }
  .adminform label { display: grid; gap: var(--space-1); font-weight: 600; }
  .adminform input, .adminform textarea { font: inherit; padding: var(--space-2); border: 1px solid var(--color-ink-mute); border-radius: var(--radius-md); }
  .adminform__check { grid-template-columns: auto 1fr; align-items: center; gap: var(--space-2); font-weight: 400; }
  .admin-table { width: 100%; border-collapse: collapse; margin-top: var(--space-4); }
  .admin-table th, .admin-table td { padding: var(--space-2); border-bottom: 1px solid var(--color-ink-mute); text-align: left; }
  .notice { padding: var(--space-2) var(--space-3); background: var(--color-sand); border-radius: var(--radius-md); }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/members/admin/family.astro
git commit -m "feat(admin): add family-meeting management page"
```

---

### Task 5.5: お知らせ管理

**Files:**
- Create: `src/pages/members/admin/announcements.astro`

- [ ] **Step 1: 実装**

`src/pages/members/admin/announcements.astro`：
```astro
---
import MembersLayout from '../../../layouts/MembersLayout.astro';
import { createServerClient } from '../../../lib/supabase';

const supabase = createServerClient();
let message: string | null = null;

if (Astro.request.method === 'POST') {
  const form = await Astro.request.formData();
  const action = String(form.get('_action') ?? '');

  if (action === 'create') {
    const body = String(form.get('body_markdown') ?? '').trim();
    const audience = String(form.get('audience') ?? 'member');
    const published = form.get('published') === 'on';
    if (body) {
      const { error } = await supabase.from('announcements').insert({ body_markdown: body, audience, published });
      message = error ? `エラー：${error.message}` : '登録しました。';
    } else {
      message = '本文が空です。';
    }
  } else if (action === 'toggle_published') {
    const id = String(form.get('id'));
    const published = form.get('published') === 'true';
    await supabase.from('announcements').update({ published: !published }).eq('id', id);
    message = '公開状態を変更しました。';
  } else if (action === 'delete') {
    const id = String(form.get('id'));
    await supabase.from('announcements').delete().eq('id', id);
    message = '削除しました。';
  }
}

const { data: list } = await supabase
  .from('announcements')
  .select('id, body_markdown, audience, published, created_at')
  .order('created_at', { ascending: false });
---

<MembersLayout title="お知らせ管理">
  <section class="section">
    <div class="container">
      <h1 class="section__title">お知らせ管理</h1>
      {message && <p class="notice">{message}</p>}

      <h2>新規作成</h2>
      <form method="POST" class="adminform">
        <input type="hidden" name="_action" value="create" />
        <label>本文（Markdown 可）<textarea name="body_markdown" rows="5" required></textarea></label>
        <label>対象
          <select name="audience">
            <option value="member">全会員</option>
            <option value="family">家族会員のみ</option>
          </select>
        </label>
        <label class="adminform__check"><input type="checkbox" name="published" />すぐに公開する</label>
        <button type="submit" class="btn btn--primary">登録</button>
      </form>

      <h2>登録済み</h2>
      <ul class="annlist">
        {list?.map(a => (
          <li class="annlist__item">
            <div class="annlist__meta">
              {new Date(a.created_at).toLocaleString('ja-JP')}
              ／ 対象: {a.audience === 'family' ? '家族会員' : '全会員'}
              ／ {a.published ? '公開中' : '非公開'}
            </div>
            <pre class="annlist__body">{a.body_markdown}</pre>
            <div class="annlist__actions">
              <form method="POST" style="display: inline">
                <input type="hidden" name="_action" value="toggle_published" />
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="published" value={String(a.published)} />
                <button type="submit" class="btn btn--outline btn--sm">{a.published ? '非公開化' : '公開する'}</button>
              </form>
              <form method="POST" style="display: inline" onsubmit="return confirm('削除しますか？')">
                <input type="hidden" name="_action" value="delete" />
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" class="btn btn--outline btn--sm">削除</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
</MembersLayout>

<style>
  .adminform { display: grid; gap: var(--space-3); max-width: 36rem; }
  .adminform label { display: grid; gap: var(--space-1); font-weight: 600; }
  .adminform input, .adminform select, .adminform textarea { font: inherit; padding: var(--space-2); border: 1px solid var(--color-ink-mute); border-radius: var(--radius-md); }
  .adminform__check { grid-template-columns: auto 1fr; align-items: center; gap: var(--space-2); font-weight: 400; }
  .annlist { list-style: none; padding: 0; }
  .annlist__item { padding: var(--space-3); border: 1px solid var(--color-ink-mute); border-radius: var(--radius-md); margin-block: var(--space-3); }
  .annlist__meta { font-size: var(--fs-small); color: var(--color-ink-mute); }
  .annlist__body { white-space: pre-wrap; font: inherit; background: var(--color-cream); padding: var(--space-2); border-radius: var(--radius-md); }
  .notice { padding: var(--space-2) var(--space-3); background: var(--color-sand); border-radius: var(--radius-md); }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/members/admin/announcements.astro
git commit -m "feat(admin): add announcements management page"
```

---

### Task 5.6: 管理画面 E2E

**Files:**
- Create: `tests/e2e/admin.spec.ts`

- [ ] **Step 1: テスト作成**

`tests/e2e/admin.spec.ts`：
```ts
import { test, expect } from '@playwright/test';
import { signInAs } from './helpers/login';

test.describe('Admin pages (staff only)', () => {
  test('non-staff is forbidden', async ({ page }) => {
    await signInAs(page, 'test-member@example.com');
    const res = await page.goto('/members/admin/');
    expect(res?.status()).toBe(403);
  });

  test('staff sees admin home with counts', async ({ page }) => {
    await signInAs(page, 'test-staff@example.com');
    await page.goto('/members/admin/');
    await expect(page.getByText('会員管理')).toBeVisible();
    await expect(page.getByText('機関誌管理')).toBeVisible();
  });

  test('staff can register a newsletter entry', async ({ page }) => {
    await signInAs(page, 'test-staff@example.com');
    await page.goto('/members/admin/newsletters');
    await page.fill('input[name="title"]', '巣箱 vol.99（テスト）');
    await page.fill('input[name="issue"]', 'vol.99');
    await page.fill('input[name="published_on"]', '2026-05-25');
    await page.fill('input[name="pdf_path"]', 'test/vol-99.pdf');
    await page.click('button[type="submit"]');
    await expect(page.getByText('登録しました')).toBeVisible();
  });
});
```

- [ ] **Step 2: 実行**

```bash
npm run test:e2e -- admin
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/admin.spec.ts
git commit -m "test(e2e): cover admin authorization and newsletter create"
```

---

## Stage 6: 統合・仕上げ

### Task 6.1: 既存 `members.astro` を廃止

**Files:**
- Delete: `src/pages/members.astro`
- Create: `src/pages/members.ts`（リダイレクト用）

`/members/`（新規）と `/members`（旧静的、`.astro`）が衝突するため、旧ページを削除しリダイレクトに置き換える。実は Astro のルーティングでは `/members/index.astro` があるので `/members.astro` は無くせばよい。

- [ ] **Step 1: 旧ページを削除**

```bash
git rm src/pages/members.astro
```

- [ ] **Step 2: ローカルで動作確認**

```bash
npm run dev
# /members → /members/sign-in にリダイレクトされるか確認
# （middleware が未ログインを判定してリダイレクトする）
```

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor(members): retire static members.astro (replaced by SSR /members/)"
```

---

### Task 6.2: ヘッダーの「会員の方へ」リンクを更新

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/lib/site.ts`

既存の `navLinks` で `/members` を参照している場合、`/members/sign-in` または `/members/` に向ける。

- [ ] **Step 1: site.ts を確認**

```bash
cat src/lib/site.ts
```
Expected: `navLinks` の中に「会員の方へ」相当があるはず。`href` を `/members/` のまま維持。`/members/` への未ログインアクセスは middleware が `/members/sign-in` にリダイレクトする。

- [ ] **Step 2: Header.astro でログイン状態によるラベル切替（任意）**

`src/components/Header.astro` 内の該当箇所を修正：
```astro
---
import { navLinks } from '../lib/site.ts';
const member = Astro.locals.member;
---
<!-- 「会員の方へ」リンクのラベルを動的に -->
<a href={member ? '/members/' : '/members/sign-in'}>
  {member ? '会員ページ' : '会員ログイン'}
</a>
```

ただし既存 Header の構造に合わせて最小編集にとどめる。

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro src/lib/site.ts
git commit -m "refactor(header): toggle members link label by auth state"
```

---

### Task 6.3: 公開ページの Cache-Control を維持

**Files:** （確認のみ）

middleware は `/members/` のみ介入する設定なので、公開ページのキャッシュ動作は変わらない。確認だけ行う。

- [ ] **Step 1: 公開ページに `Cache-Control` が付かないことを確認**

```bash
npm run dev
curl -sI http://localhost:4321/ | grep -i cache
```
Expected: middleware による `no-store` が付与されていないこと（Cloudflare デフォルト）。

- [ ] **Step 2: `/members/` には `no-store` が付くことを確認**

```bash
# サインイン後にセッション Cookie を控え：
curl -sI -H "Cookie: nest_sess=<dev value>" http://localhost:4321/members/ | grep -i cache
```
Expected: `Cache-Control: private, no-store`

実機検証で確認するだけのタスク。コードは無し。

- [ ] **Step 3: Commit**

このタスクではコード変更はない（前段で middleware に `Cache-Control` を実装済み）。

---

### Task 6.4: Cloudflare Pages 環境変数・デプロイ設定の文書化

**Files:**
- Create: `docs/operations/deployment.md`

- [ ] **Step 1: ドキュメント作成**

`docs/operations/deployment.md`：
```markdown
# デプロイ手順（Cloudflare Pages）

## 1. GitHub リポジトリの準備
- リモートに `feature/members-area` を push
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
   - `SESSION_COOKIE_SECRET`（`openssl rand -base64 32` で生成）
   - 本番では `ENABLE_DEV_LOGIN` を **未設定**（dev-login が無効化される）

## 3. カスタムドメイン
1. Pages → Custom domains → Set up a domain
2. `www.nponest.org` を追加
3. DNS で CNAME を Cloudflare 指定値に設定

## 4. SPF / DKIM / DMARC（Resend）
1. Resend ダッシュボード → Domains → Add domain（`nponest.org`）
2. 表示される TXT / MX レコードを DNS に登録
3. ステータスが verified になるまで待つ

## 5. デプロイ確認
- `feature/members-area` を push して Preview URL が出ることを確認
- main にマージで Production にデプロイ
- ログインフロー（マジックリンク受信 → クリック → セッション発行）を本番で1度通す
```

- [ ] **Step 2: Commit**

```bash
git add docs/operations/deployment.md
git commit -m "docs(ops): document Cloudflare Pages deployment and env vars"
```

---

### Task 6.5: README に運用手順を追記

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 現状確認**

```bash
cat README.md
```

- [ ] **Step 2: 末尾に追記**

`README.md` の末尾に：
```markdown
---

## 会員専用エリア（Phase 1）

`/members/` 以下は認証付きの会員専用エリアです。

### 開発時の動作確認
1. `.env.example` を `.env.local` にコピーし、Supabase / Resend の認証情報を入れる
2. Supabase Studio で `db/README.md` の手順に従ってマイグレーションを実行
3. `npm run dev` で開発サーバ起動
4. ローカル E2E 用に `ENABLE_DEV_LOGIN=true` を `.env.local` に追加

### 会員追加（事務局向け）
1. `/members/admin/members/new` から新規会員を登録
2. 会員ご本人がメアドを入力してログイン → メールに届くリンクをクリック

### PDF アップロード
1. Supabase Studio → Storage → `newsletters` / `family-minutes` バケットに PDF アップロード
2. `/members/admin/newsletters` または `/members/admin/family` でメタ情報を登録

### 詳細
- 設計仕様: `docs/superpowers/specs/2026-05-24-members-area-phase1-design.md`
- デプロイ手順: `docs/operations/deployment.md`
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(readme): document members-area operations"
```

---

## Stage 7: UAT・運用ドキュメント

### Task 7.1: UAT チェックリスト作成

**Files:**
- Create: `docs/operations/uat-checklist.md`

- [ ] **Step 1: チェックリスト作成**

`docs/operations/uat-checklist.md`：
```markdown
# Phase 1 UAT チェックリスト

## 前提
- Supabase ステージング環境にマイグレーション適用済み
- テスト用会員 3名（member / family / staff）を投入済み
- Resend のステージング送信ドメイン設定済み

## A. 認証フロー
- [ ] `/members/` 未ログインアクセス → `/members/sign-in?redirect=...` にリダイレクト
- [ ] 登録済みメアドでサインイン → メール到着（15分以内）
- [ ] メール内リンクをクリック → ログイン成功 → `/members/` に到達
- [ ] 未登録メアドでサインイン → 「会員として登録されていません」表示
- [ ] サインアウト → セッション破棄 → `/members/sign-in` に戻る
- [ ] 既にログアウト済みの状態で `/members/admin/` 直アクセス → サインインへリダイレクト

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
```

- [ ] **Step 2: Commit**

```bash
git add docs/operations/uat-checklist.md
git commit -m "docs(ops): add Phase 1 UAT checklist"
```

---

### Task 7.2: 運用手順書（会員管理）

**Files:**
- Create: `docs/operations/member-management.md`

- [ ] **Step 1: 文書作成**

`docs/operations/member-management.md`：
```markdown
# 会員管理 運用手順（事務局向け）

## 1. 新規会員の登録
1. 会員から入会申込書を受領
2. 会費納付を確認
3. `https://www.nponest.org/members/admin/members/new` を開く
4. 必須項目を入力：メールアドレス・氏名・区分・入会日
5. 「登録」をクリック
6. 新会員にメールで案内：
   > NPO法人 nest 会員ページを開設しました。
   > https://www.nponest.org/members/sign-in
   > 上記ページでご登録のメールアドレスを入力すると、ログインリンクをお送りします。

## 2. 家族会員への昇格
1. 会員一覧から該当者を選択して「編集」
2. 会員区分を「家族会員」に変更
3. 保存

## 3. スタッフ権限の付与
1. 会員編集ページで「スタッフ権限」をチェック
2. 保存
3. 退任時はチェックを外す

## 4. 退会処理
1. 会員編集ページの「退会処理（論理削除）」ボタン
2. 確認ダイアログで OK
3. 該当者のセッションは即時破棄され、再ログイン不可になる

## 5. 機関誌の公開
1. PDF を Supabase Studio で `newsletters` バケットにアップロード
2. `/members/admin/newsletters` で新規登録（タイトル、号、発行日、PDFパス）
3. 表示状態を「○」にする
4. 会員ページのお知らせで案内する（手動）

## 6. 家族会の次回案内
1. `/members/admin/family` で新規登録（開催日・タイトル・場所・議題）
2. 「次回として表示する」にチェック
3. 議事録 PDF は開催後にアップロード → メタ情報に追加

## 7. お知らせの掲載
1. `/members/admin/announcements` で本文を入力
2. 対象（全会員 / 家族会員）と公開フラグを設定
3. 「登録」

## トラブルシューティング
- **ログインメールが届かない** → 迷惑メールフォルダ確認 → Resend ダッシュボードで送信ログ確認
- **会員から「ログインできない」** → admin/members で該当者の退会フラグが ON でないか確認
- **PDF が DL できない** → Supabase Storage のパスとレコードの pdf_path が一致しているか確認
```

- [ ] **Step 2: Commit**

```bash
git add docs/operations/member-management.md
git commit -m "docs(ops): add member management operations runbook"
```

---

## Self-Review

実装計画完成後、設計仕様（`docs/superpowers/specs/2026-05-24-members-area-phase1-design.md`）と照らし合わせた結果：

### 1. Spec coverage（仕様カバー確認）

| 仕様セクション | 対応タスク |
|---|---|
| §1.2 含むもの: 認証基盤 | Task 0.1〜0.5, 1.1〜1.8, 2.1〜2.8, 3.1〜3.7 |
| §1.2 含むもの: ロール制御 | Task 2.2 (rbac), 3.1 (middleware) |
| §1.2 含むもの: 機関誌 | Task 4.3, 4.4, 5.3 |
| §1.2 含むもの: 家族会 | Task 4.5, 4.6, 5.4 |
| §1.2 含むもの: 自分ノート紹介 | Task 4.7 |
| §1.2 含むもの: コミュニティ | Task 4.8 |
| §1.2 含むもの: Instagram リンク | Task 4.8（統合） |
| §1.2 含むもの: 管理画面 | Task 5.1〜5.5 |
| §2.1 ロール（2軸モデル） | Task 1.2, 2.2 |
| §3.1 マジックリンク | Task 2.3, 2.6, 3.3, 3.4 |
| §3.2 ルート保護 | Task 3.1, 2.2 |
| §4.1 セキュリティ（Cookie 設定など） | Task 2.4 |
| §4.2 個情法対応 | Task 4.9 |
| §6.1 データモデル | Task 1.2〜1.7 |
| §6.2 RLS | Task 1.8 |
| §7 既存サイトとの統合 | Task 6.1, 6.2 |
| §11 デプロイ | Task 6.4 |

**ギャップ：**
- §3.1 「2回目以降のパスキー登録案内」→ Phase 1 のスコープから明示的に外す（実装しない）。仕様ではオプション扱いだったので問題なし。

### 2. Placeholder scan
- Task 4.7 の PDF テンプレートリンクが `href="#"` → これは Phase 1 で河原さん用意の PDF を後で差し込む箇所。コメントで明記済みなので OK。
- `LINE_OC_URL = 'https://line.me/ti/g2/REPLACE_ME'` → 河原さん用意の URL に差し替える前提。コメントで明記済み。

### 3. Type consistency
- `Member` 型は `src/lib/rbac.ts` で1箇所定義し、他全部から import する設計。一貫性 OK。
- `SESSION_COOKIE_NAME` も `cookies.ts` 一箇所。

### 4. Ambiguity check
- 「Auth.js から自前マジックリンクへの変更」を冒頭で明示。意図的な仕様変更。

self-review 結果：**重大な抜け漏れなし**。実装着手可能な状態。

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-25-members-area-phase1.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
