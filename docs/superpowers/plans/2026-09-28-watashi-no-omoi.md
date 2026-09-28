# 「私の想い」コーナー Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 親なき後ページに、家族から寄せられた想い（編集部が確認して掲載）を読める「私の想い」コーナーと、投稿を受け付ける Google フォームの作成スクリプト・運用文書を用意する。

**Architecture:** 投稿は Google フォーム＋Apps Script＋スプレッドシート（審査台帳）で受け、掲載が決まった「掲載用本文」だけを Markdown にして Astro のコンテンツコレクション `postParentOmoi` に置く。サイトは静的のまま、親なき後ページに最新の抜粋、`/post-parent/omoi/` に全文一覧を出す。表示用の純粋なロジック（ラベル・並び順・抜粋）は `src/lib/omoi.ts` に集め、vitest で検証する。

**Tech Stack:** Astro 6（content collections / glob loader / zod）、TypeScript、vitest、Playwright、Google Apps Script

**Spec:** `docs/superpowers/specs/2026-09-28-watashi-no-omoi-design.md`

## Global Constraints

- 投稿の置き場所は `src/content/post-parent-omoi/`。**`src/content/post-parent/` の下には置かない**（コラムのコレクションが `src/content/post-parent` 配下の `**/*.md` を全部読むため）
- ファイル名は `YYYY-MM-DD-NN.md`（掲載日＋連番）。内容をファイル名に含めない
- お題のキー：`nokositai-kotoba`（子どもに遺したい言葉）/ `kigakari`（いま一番気がかりなこと）/ `anshin`（こうなっていたら安心できる）/ `jiyu`（自由に）
- お立場のキー：`oya`（親）/ `kyodai`（きょうだい）/ `sofubo`（祖父母）/ `sonota`（その他の家族）
- 掲載名はペンネームか「匿名」のみ。実名は載せない
- 入れないもの：コメント欄、「いいね」、即時公開、写真、個別記事ページ
- 個人に結びつく情報（投稿の原文、実在の人のエピソード）をリポジトリ・この作業部屋に書かない。検証用のサンプル投稿は**架空の文章**で作り、検証後に削除する
- 文言で「正直」を使わない
- 大きな見出しは文節の途中で折り返さない（全体共通の `.phrase` を使える）
- 色・余白は既存のトークン（`var(--color-…)`、`var(--space-…)`）だけを使う
- フォームの公開 URL は `src/lib/omoi.ts` の `OMOI_FORM_URL`。空文字の間は、ボタンの代わりに「準備中」の案内を出す
- 提案文言（導入文・ボタン・eyebrow `Voices`）は本計画の案。河原さんが計画レビューで確定する（spec §12）
- 通知先の2名のメールアドレスは、河原さんに確認してから Apps Script に書き込む。空のままでは作成処理を止める（spec §12）

## Review Focus

1. **掲載0件**：親なき後ページは導入文とボタンだけを表示し、一覧へのリンクは出さない。一覧ページは「まだ掲載はありません」を表示し、壊れない → Task 3・Task 4 の e2e
2. **フォーム URL が未設定**：リンク切れのボタンではなく、「投稿フォームは準備中です」を表示する → Task 3・Task 4 の e2e
3. **投稿がコラムに混ざる**：想いのファイルを置いても、コラムの一覧・`/post-parent/column/` 配下のページ数が変わらない → Task 2 のビルド確認
4. **frontmatter の書き間違い**：お題・お立場に列挙外の値を書くとビルドが失敗し、誤った表示のまま公開されない → Task 2 のビルド確認
5. **長文・改行・狭い画面**：1,200字程度、段落を複数含む投稿でも 320px で横スクロールが出ず、抜粋は文字化けしない（絵文字やサロゲートペアの途中で切らない） → Task 1 の unit、Task 8 の撮影
6. **JavaScript が無い環境**：お題の絞り込みボタンが出ないだけで、全件は読める → Task 3 の e2e

---

## ファイル構成

| ファイル | 役割 |
|---|---|
| `src/lib/omoi.ts`（新規） | キー・ラベル・フォーム URL・並び順・抜粋・署名行。純粋関数のみ |
| `tests/unit/omoi.test.ts`（新規） | 上記の unit テスト |
| `src/content.config.ts`（変更） | `postParentOmoi` コレクションの追加 |
| `src/content/post-parent-omoi/.gitkeep`（新規） | 空のコレクション用ディレクトリ |
| `src/components/OmoiCard.astro`（新規） | 1件分のカード（`full`＝全文 / `excerpt`＝抜粋） |
| `src/pages/post-parent/omoi.astro`（新規） | 一覧ページ `/post-parent/omoi/` |
| `src/pages/post-parent.astro`（変更） | 「私の想い」セクションを「ゆるく、つながる」の直前に追加 |
| `tests/e2e/omoi.spec.ts`（新規） | 0件時・URL未設定時の表示 |
| `src/pages/privacy.astro`（変更） | 「Ⅵ.『私の想い』への投稿について」を追加 |
| `scripts/create-watashi-no-omoi-form.gs`（新規） | フォーム＋審査台帳＋送信時処理の作成スクリプト |
| `docs/operations/watashi-no-omoi-checklist.md`（新規） | 担当者向け一次確認チェックリスト（1枚もの） |
| `docs/operations/watashi-no-omoi-publishing.md`（新規） | 掲載・取り下げの手順（掲載作業者向け） |

---

### Task 1: 表示ロジック（`src/lib/omoi.ts`）

**Files:**
- Create: `src/lib/omoi.ts`
- Test: `tests/unit/omoi.test.ts`

**Interfaces:**
- Consumes: なし
- Produces:
  - `OMOI_THEME_KEYS: readonly ['nokositai-kotoba','kigakari','anshin','jiyu']`、`type OmoiTheme`
  - `OMOI_RELATION_KEYS: readonly ['oya','kyodai','sofubo','sonota']`、`type OmoiRelation`
  - `OMOI_THEME_LABELS: Record<OmoiTheme, string>`、`OMOI_RELATION_LABELS: Record<OmoiRelation, string>`
  - `OMOI_FORM_URL: string`（初期値 `''`）
  - `sortOmoi<T extends { id: string; data: { publishedAt: Date } }>(items: T[]): T[]`
  - `omoiByline(m: { relation: OmoiRelation; ageRange?: string; penName: string }): string`
  - `omoiExcerpt(body: string, max?: number): string`（既定 120 字）

- [ ] **Step 1: 失敗するテストを書く**

`tests/unit/omoi.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  OMOI_THEME_KEYS,
  OMOI_THEME_LABELS,
  OMOI_RELATION_KEYS,
  OMOI_RELATION_LABELS,
  sortOmoi,
  omoiByline,
  omoiExcerpt,
} from '~/lib/omoi';

describe('labels', () => {
  it('has a label for every theme key', () => {
    expect(OMOI_THEME_KEYS.map((k) => OMOI_THEME_LABELS[k])).toEqual([
      '子どもに遺したい言葉',
      'いま一番気がかりなこと',
      'こうなっていたら安心できる',
      '自由に',
    ]);
  });

  it('has a label for every relation key', () => {
    expect(OMOI_RELATION_KEYS.map((k) => OMOI_RELATION_LABELS[k])).toEqual(['親', 'きょうだい', '祖父母', 'その他の家族']);
  });
});

describe('sortOmoi', () => {
  const e = (id: string, d: string) => ({ id, data: { publishedAt: new Date(d) } });

  it('puts the newest first', () => {
    const out = sortOmoi([e('2026-10-01-01', '2026-10-01'), e('2026-11-01-01', '2026-11-01')]);
    expect(out.map((x) => x.id)).toEqual(['2026-11-01-01', '2026-10-01-01']);
  });

  it('orders same-day posts by the larger serial first', () => {
    const out = sortOmoi([e('2026-10-01-01', '2026-10-01'), e('2026-10-01-02', '2026-10-01')]);
    expect(out.map((x) => x.id)).toEqual(['2026-10-01-02', '2026-10-01-01']);
  });

  it('does not mutate the input', () => {
    const input = [e('a', '2026-10-01'), e('b', '2026-11-01')];
    sortOmoi(input);
    expect(input.map((x) => x.id)).toEqual(['a', 'b']);
  });
});

describe('omoiByline', () => {
  it('joins relation and age, then the pen name', () => {
    expect(omoiByline({ relation: 'kyodai', ageRange: '40代', penName: 'ひまわり' })).toBe('きょうだい・40代／ひまわり');
  });

  it('omits the age when it is not given', () => {
    expect(omoiByline({ relation: 'oya', penName: '匿名' })).toBe('親／匿名');
  });
});

describe('omoiExcerpt', () => {
  it('returns short text as is, with line breaks collapsed', () => {
    expect(omoiExcerpt('一行目\n\n二行目')).toBe('一行目 二行目');
  });

  it('cuts long text and adds an ellipsis', () => {
    const out = omoiExcerpt('あ'.repeat(200), 120);
    expect(out).toBe('あ'.repeat(120) + '…');
  });

  it('does not split a surrogate pair', () => {
    const out = omoiExcerpt('😊'.repeat(5), 3);
    expect(out).toBe('😊😊😊…');
  });
});
```

- [ ] **Step 2: 失敗することを確かめる**

Run: `npx vitest run tests/unit/omoi.test.ts`
Expected: FAIL（`~/lib/omoi` が見つからない）

- [ ] **Step 3: 最小の実装を書く**

`src/lib/omoi.ts`:

```ts
// 親なき後ページ「私の想い」コーナー：家族から寄せられた想い（編集部が確認して掲載）の表示ロジック。
// 投稿は src/content/post-parent-omoi/ に1件1ファイル。受付は Google フォーム（scripts/create-watashi-no-omoi-form.gs）

export const OMOI_THEME_KEYS = ['nokositai-kotoba', 'kigakari', 'anshin', 'jiyu'] as const;
export type OmoiTheme = (typeof OMOI_THEME_KEYS)[number];

export const OMOI_THEME_LABELS: Record<OmoiTheme, string> = {
  'nokositai-kotoba': '子どもに遺したい言葉',
  kigakari: 'いま一番気がかりなこと',
  anshin: 'こうなっていたら安心できる',
  jiyu: '自由に',
};

export const OMOI_RELATION_KEYS = ['oya', 'kyodai', 'sofubo', 'sonota'] as const;
export type OmoiRelation = (typeof OMOI_RELATION_KEYS)[number];

export const OMOI_RELATION_LABELS: Record<OmoiRelation, string> = {
  oya: '親',
  kyodai: 'きょうだい',
  sofubo: '祖父母',
  sonota: 'その他の家族',
};

// 投稿フォームの公開URL（Apps Script の実行ログの「公開URL」）。空文字の間は「準備中」を表示する
export const OMOI_FORM_URL = '';

// 新しい順。同じ掲載日はファイル名の連番が大きいほうを先に
export function sortOmoi<T extends { id: string; data: { publishedAt: Date } }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime() || b.id.localeCompare(a.id),
  );
}

// 署名行：「きょうだい・40代／ひまわり」
export function omoiByline(m: { relation: OmoiRelation; ageRange?: string; penName: string }): string {
  const who = [OMOI_RELATION_LABELS[m.relation], m.ageRange].filter(Boolean).join('・');
  return `${who}／${m.penName}`;
}

// 抜粋：改行をつめ、max 字（コードポイント単位）を超えたら「…」
export function omoiExcerpt(body: string, max = 120): string {
  const chars = Array.from(body.replace(/\s+/g, ' ').trim());
  return chars.length > max ? chars.slice(0, max).join('') + '…' : chars.join('');
}
```

- [ ] **Step 4: 通ることを確かめる**

Run: `npx vitest run tests/unit/omoi.test.ts`
Expected: PASS（10件）

- [ ] **Step 5: コミット**

```bash
git add src/lib/omoi.ts tests/unit/omoi.test.ts
git commit -m "feat: add display helpers for watashi-no-omoi corner"
```

---

### Task 2: コンテンツコレクション `postParentOmoi`

**Files:**
- Modify: `src/content.config.ts`（`postParentColumn` の定義の後と、末尾の `export`）
- Create: `src/content/post-parent-omoi/.gitkeep`

**Interfaces:**
- Consumes: `OMOI_THEME_KEYS`、`OMOI_RELATION_KEYS`（Task 1）
- Produces: コレクション名 `postParentOmoi`。`data` は `{ theme: OmoiTheme; relation: OmoiRelation; ageRange?: string; penName: string; publishedAt: Date; draft: boolean }`、本文は `entry.body`（Markdown の生文字列）

- [ ] **Step 1: 変更前のコラムのページ数を控える**

Run: `npm run build && ls -d dist/post-parent/column/*/ | wc -l`
Expected: 数値（現状 1）。この数を Step 6 で比べる。

- [ ] **Step 2: ディレクトリとコレクションを追加する**

`src/content/post-parent-omoi/.gitkeep` を空で作る。

`src/content.config.ts` の先頭の import の後に追加：

```ts
import { OMOI_THEME_KEYS, OMOI_RELATION_KEYS } from './lib/omoi';
```

`postParentColumn` の定義の後に追加：

```ts
// 親なき後ページの「私の想い」：家族から寄せられた想い（編集部が確認して掲載。/post-parent/omoi/）
// ※ src/content/post-parent/ の下に置くとコラムに混ざるため、別ディレクトリにする
const postParentOmoi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/post-parent-omoi' }),
  schema: z.object({
    theme: z.enum(OMOI_THEME_KEYS),
    relation: z.enum(OMOI_RELATION_KEYS),
    ageRange: z.string().optional(),
    // ペンネームか「匿名」のみ。実名は載せない
    penName: z.string().min(1).default('匿名'),
    publishedAt: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});
```

末尾を次のように変える：

```ts
export const collections = { news, aiTips, topics, decisionSupport, postParentColumn, postParentOmoi };
```

- [ ] **Step 3: 架空のサンプル投稿を置いてビルドする**

`src/content/post-parent-omoi/2099-01-01-01.md`（検証用・Step 7 で削除）：

```md
---
theme: kigakari
relation: kyodai
ageRange: 40代
penName: テスト
publishedAt: 2099-01-01
---

これは表示確認のための架空の文章です。

二つ目の段落です。
```

Run: `npm run build`
Expected: 成功

- [ ] **Step 4: 列挙外の値でビルドが失敗することを確かめる**

同じファイルの `theme: kigakari` を `theme: foo` に変えて `npm run build`。
Expected: 失敗し、`theme` の値が不正だというエラーが出る。確認したら `theme: kigakari` に戻す。

- [ ] **Step 5: コラムに混ざっていないことを確かめる**

Run: `npm run build && ls -d dist/post-parent/column/*/ | wc -l && grep -c "これは表示確認のための架空の文章" dist/post-parent/index.html`
Expected: 1つ目は Step 1 と同じ数。2つ目は `0`（Task 4 でセクションを作る前なので、まだどこにも出ない）

- [ ] **Step 6: vitest 全体を回す**

Run: `npm test`
Expected: すべて PASS

- [ ] **Step 7: サンプルを消してコミット**

```bash
rm src/content/post-parent-omoi/2099-01-01-01.md
git add src/content.config.ts src/content/post-parent-omoi/.gitkeep
git commit -m "feat: add postParentOmoi content collection"
```

---

### Task 3: カード部品と一覧ページ `/post-parent/omoi/`

**Files:**
- Create: `src/components/OmoiCard.astro`
- Create: `src/pages/post-parent/omoi.astro`
- Test: `tests/e2e/omoi.spec.ts`

**Interfaces:**
- Consumes: コレクション `postParentOmoi`（Task 2）、`sortOmoi`・`omoiByline`・`omoiExcerpt`・`OMOI_THEME_LABELS`・`OMOI_THEME_KEYS`・`OMOI_FORM_URL`（Task 1）
- Produces: `<OmoiCard entry={CollectionEntry<'postParentOmoi'>} mode={'full' | 'excerpt'} />`。`excerpt` のときはカード全体が `/post-parent/omoi/#<id>` へのリンクになる。`full` のときは `<article id={entry.id}>`

- [ ] **Step 1: 失敗する e2e テストを書く**

`tests/e2e/omoi.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

// 掲載0件・フォームURL未設定（初期状態）の表示
test('omoi list page renders the empty state', async ({ page }) => {
  await page.goto('/post-parent/omoi/');
  // PageIntro は見出しを h2 で出す（資料室など既存の子ページと同じ）
  await expect(page.getByRole('heading', { level: 2, name: '私の想い' })).toBeVisible();
  await expect(page.getByText('まだ掲載はありません')).toBeVisible();
  await expect(page.getByText('投稿フォームは準備中です')).toBeVisible();
  // 絞り込みは2種類以上のお題があるときだけ
  await expect(page.locator('[data-omoi-filter]')).toHaveCount(0);
});
```

- [ ] **Step 2: 失敗することを確かめる**

Run: `npx playwright test tests/e2e/omoi.spec.ts`
Expected: FAIL（404 で見出しが見つからない）

- [ ] **Step 3: カード部品を書く**

`src/components/OmoiCard.astro`:

```astro
---
// 「私の想い」1件分のカード。full＝全文（一覧ページ）、excerpt＝抜粋（親なき後ページ）
import { render, type CollectionEntry } from 'astro:content';
import { OMOI_THEME_LABELS, omoiByline, omoiExcerpt } from '../lib/omoi';

interface Props {
  entry: CollectionEntry<'postParentOmoi'>;
  mode: 'full' | 'excerpt';
}
const { entry, mode } = Astro.props;
const { data } = entry;
const { Content } = mode === 'full' ? await render(entry) : { Content: null };
const theme = OMOI_THEME_LABELS[data.theme];
const byline = omoiByline(data);
---

{mode === 'full' ? (
  <article class="omoi-card" id={entry.id}>
    <p class="omoi-card__theme">{theme}</p>
    <div class="omoi-card__body">{Content && <Content />}</div>
    <p class="omoi-card__byline">{byline}</p>
  </article>
) : (
  <a class="omoi-card omoi-card--link" href={`/post-parent/omoi/#${entry.id}`}>
    <span class="omoi-card__theme">{theme}</span>
    <span class="omoi-card__body">{omoiExcerpt(entry.body ?? '')}</span>
    <span class="omoi-card__byline">{byline}</span>
  </a>
)}

<style>
  /* 手紙・便箋を思わせる落ち着いたカード（SNSのタイムライン風にしない） */
  .omoi-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-6);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-lg);
    background: var(--color-paper);
    color: var(--color-ink);
    scroll-margin-top: 80px;
  }
  .omoi-card--link {
    box-shadow: var(--shadow-soft);
    transition: transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
  }
  .omoi-card--link:hover { transform: translateY(-3px); box-shadow: var(--shadow-card); }
  .omoi-card__theme {
    margin: 0;
    font-size: 13px;
    letter-spacing: 0.05em;
    color: var(--color-terra-500);
  }
  .omoi-card__body {
    font-family: var(--font-serif);
    font-size: 16px;
    line-height: 2;
    overflow-wrap: anywhere;
  }
  .omoi-card__body :global(p) { margin: 0 0 var(--space-4); }
  .omoi-card__body :global(p:last-child) { margin-bottom: 0; }
  .omoi-card__byline {
    margin: 0;
    align-self: flex-end;
    font-size: 14px;
    color: var(--color-ink-mute);
  }
</style>
```

- [ ] **Step 4: 一覧ページを書く**

`src/pages/post-parent/omoi.astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PageIntro from '../../components/PageIntro.astro';
import OmoiCard from '../../components/OmoiCard.astro';
import CtaBlock from '../../components/CtaBlock.astro';
import { OMOI_FORM_URL, OMOI_THEME_KEYS, OMOI_THEME_LABELS, sortOmoi } from '../../lib/omoi';

const items = sortOmoi(await getCollection('postParentOmoi', ({ data }) => !data.draft));
// 掲載のあるお題だけを、定義順に並べる
const usedThemes = OMOI_THEME_KEYS.filter((t) => items.some((e) => e.data.theme === t));
---

<BaseLayout
  title="私の想い｜親なき後"
  description="「親なき後」を思うとき、胸にあること。ご家族から寄せられた想いを、編集部が確認して掲載しています。"
>
  <PageIntro
    eyebrow="Voices"
    title="私の想い"
    lead="「親なき後」を思うとき、胸にあること。ご家族から寄せられた想いを掲載しています。"
  />

  <section class="section">
    <div class="container container--narrow reveal">
      <p class="omoi-crumb"><a class="inline-link" href="/post-parent/">親なき後</a> › 私の想い</p>

      {usedThemes.length >= 2 && (
        <div class="omoi-filter" data-omoi-filter hidden>
          <button type="button" class="btn btn--sm btn--outline" aria-pressed="true" data-theme="all">すべて</button>
          {usedThemes.map((t) => (
            <button type="button" class="btn btn--sm btn--outline" aria-pressed="false" data-theme={t}>{OMOI_THEME_LABELS[t]}</button>
          ))}
        </div>
      )}

      {items.length === 0
        ? <p class="text-soft">まだ掲載はありません。最初の想いを、お待ちしています。</p>
        : (
          <ul class="omoi-list">
            {items.map((e) => <li data-theme={e.data.theme}><OmoiCard entry={e} mode="full" /></li>)}
          </ul>
        )}

      <div class="omoi-actions">
        {OMOI_FORM_URL
          ? <a href={OMOI_FORM_URL} class="btn btn--accent" rel="external" target="_blank">想いを寄せる</a>
          : <p class="text-soft">※ 投稿フォームは準備中です。</p>}
        <p class="omoi-note">
          掲載された想いの取り下げは、<a href="/contact/" class="inline-link">お問い合わせ</a>から、掲載名とおおよその掲載日を添えてご連絡ください。
        </p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <CtaBlock
        title="親なき後の備えについて"
        body="ご家族の備えや、わたしたちの取り組みにご関心のある方は、お気軽にお問い合わせください。"
        primary={{ label: 'お問い合わせフォーム', href: '/contact/' }}
        secondary={{ label: '親なき後トップへ', href: '/post-parent/' }}
        variant="dark"
      />
    </div>
  </section>
</BaseLayout>

<script>
  // お題で絞り込む。JavaScript が無ければ絞り込みは出ず、全件がそのまま読める
  const bar = document.querySelector<HTMLElement>('[data-omoi-filter]');
  if (bar) {
    bar.hidden = false;
    const buttons = [...bar.querySelectorAll<HTMLButtonElement>('button[data-theme]')];
    const cards = [...document.querySelectorAll<HTMLElement>('.omoi-list > li')];
    bar.addEventListener('click', (ev) => {
      const btn = (ev.target as HTMLElement).closest<HTMLButtonElement>('button[data-theme]');
      if (!btn) return;
      const theme = btn.dataset.theme;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      cards.forEach((li) => { li.hidden = theme !== 'all' && li.dataset.theme !== theme; });
    });
  }
</script>

<style>
  .omoi-crumb { font-size: 14px; color: var(--color-ink-mute); margin: 0 0 var(--space-6); }
  .omoi-filter { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-6); }
  .omoi-filter [aria-pressed='true'] { background: var(--color-green-900); color: var(--color-paper); }
  .omoi-list { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-6); }
  .omoi-actions { margin-top: var(--space-7); }
  .omoi-note { margin-top: var(--space-4); font-size: 14px; color: var(--color-ink-mute); }
</style>
```

- [ ] **Step 5: 通ることを確かめる**

Run: `npx playwright test tests/e2e/omoi.spec.ts`
Expected: PASS

- [ ] **Step 6: 投稿ありの表示を、架空のサンプル2件で確かめる**

`src/content/post-parent-omoi/2099-01-01-01.md`（Task 2 Step 3 と同じ内容）と、次の `2099-01-02-01.md` を置く：

```md
---
theme: anshin
relation: oya
penName: 匿名
publishedAt: 2099-01-02
---

架空の二件目です。表示の確認に使います。
```

Run: `npm run build && grep -o 'data-omoi-filter' dist/post-parent/omoi/index.html | head -1 && grep -c 'id="2099-01-02-01"' dist/post-parent/omoi/index.html`
Expected: `data-omoi-filter` が出る。2つ目は `1`。さらに `dist/post-parent/omoi/index.html` で `2099-01-02-01` が `2099-01-01-01` より前にあること（新しい順）を確認する。

- [ ] **Step 7: サンプルを消してコミット**

```bash
rm src/content/post-parent-omoi/2099-01-0*.md
git add src/components/OmoiCard.astro src/pages/post-parent/omoi.astro tests/e2e/omoi.spec.ts
git commit -m "feat: add omoi list page under post-parent"
```

---

### Task 4: 親なき後ページに「私の想い」セクション

**Files:**
- Modify: `src/pages/post-parent.astro`（frontmatter と、`<!-- ===== ゆるく、つながる ...` の直前。`pp-community-title` のセクションの前）
- Test: `tests/e2e/omoi.spec.ts`（追記）

**Interfaces:**
- Consumes: `OmoiCard`（Task 3）、`sortOmoi`・`OMOI_FORM_URL`（Task 1）、コレクション `postParentOmoi`（Task 2）
- Produces: `/post-parent/#omoi`（セクションの id）

- [ ] **Step 1: 失敗する e2e テストを追記する**

`tests/e2e/omoi.spec.ts` の末尾に追加：

```ts
test('post-parent hub shows the omoi section without cards when nothing is published', async ({ page }) => {
  await page.goto('/post-parent/');
  const section = page.locator('#omoi');
  await expect(section.getByRole('heading', { level: 2, name: '私の想い' })).toBeVisible();
  await expect(section.getByText('投稿フォームは準備中です')).toBeVisible();
  // 0件のときは抜粋カードも一覧へのリンクも出さない
  await expect(section.locator('.omoi-card')).toHaveCount(0);
  await expect(section.getByRole('link', { name: 'ほかの想いを読む' })).toHaveCount(0);
});
```

- [ ] **Step 2: 失敗することを確かめる**

Run: `npx playwright test tests/e2e/omoi.spec.ts`
Expected: 追記したテストが FAIL（`#omoi` が無い）

- [ ] **Step 3: セクションを追加する**

`src/pages/post-parent.astro` の frontmatter、`import CtaBlock ...` の次に：

```ts
import OmoiCard from '../components/OmoiCard.astro';
import { OMOI_FORM_URL, sortOmoi } from '../lib/omoi';
```

`const fmtDate = ...` の次に：

```ts
// 「私の想い」の最新3件（抜粋）
const omoiLatest = sortOmoi(await getCollection('postParentOmoi', ({ data }) => !data.draft)).slice(0, 3);
```

`<section class="section section--sand" aria-labelledby="pp-community-title">` の直前に：

```astro
  <!-- ===== 私の想い（ご家族から寄せられた想い） ===== -->
  <section class="section" id="omoi" aria-labelledby="pp-omoi-title">
    <div class="container container--narrow reveal">
      <span class="eyebrow">Voices</span>
      <h2 class="section__title" id="pp-omoi-title">私の想い</h2>
      <p style="font-size:16px; line-height:2; color:var(--color-ink); margin-bottom:var(--space-5);">
        「親なき後」を思うとき、胸にあることを、ご家族のことばで寄せていただくコーナーです。
        同じ立場の誰かが読んで、「わたしだけじゃない」と感じられる場所にしたいと考えています。
        まとまっていない想いも、答えの出ていない迷いも歓迎します。
      </p>
      {omoiLatest.length > 0 && (
        <ul class="pp-omoi-list">
          {omoiLatest.map((e) => <li><OmoiCard entry={e} mode="excerpt" /></li>)}
        </ul>
      )}
      <div class="pp-omoi-actions">
        {OMOI_FORM_URL
          ? <a href={OMOI_FORM_URL} class="btn btn--accent" rel="external" target="_blank">想いを寄せる</a>
          : <p class="text-soft">※ 投稿フォームは準備中です。</p>}
        {omoiLatest.length > 0 && <a href="/post-parent/omoi/" class="btn btn--outline">ほかの想いを読む</a>}
      </div>
    </div>
  </section>

```

同じファイルの `<style>` の末尾（`</style>` の直前）に：

```css
  .pp-omoi-list { list-style: none; margin: 0 0 var(--space-6); padding: 0; display: grid; gap: var(--space-4); }
  .pp-omoi-actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-4); }
```

- [ ] **Step 4: 通ることを確かめる**

Run: `npx playwright test tests/e2e/`
Expected: 既存の smoke を含めすべて PASS

- [ ] **Step 5: 投稿ありの表示を、架空のサンプルで確かめる**

Task 3 Step 6 の2件を置き、`npm run build` のあと：
Run: `grep -c 'omoi-card--link' dist/post-parent/index.html && grep -c 'ほかの想いを読む' dist/post-parent/index.html`
Expected: 1つ目は `2`（抜粋カード2件）、2つ目は `1`。確認したらサンプルを消す（`rm src/content/post-parent-omoi/2099-01-0*.md`）。

- [ ] **Step 6: コミット**

```bash
git add src/pages/post-parent.astro tests/e2e/omoi.spec.ts
git commit -m "feat: add omoi section to post-parent page"
```

---

### Task 5: プライバシーポリシーへの追記

**Files:**
- Modify: `src/pages/privacy.astro`（「Ⅴ. 個人情報の第三者への提供」の `</section>` の後、`<section class="policy__contact">` の前）

**Interfaces:**
- Consumes: なし
- Produces: 見出し「Ⅵ.『私の想い』への投稿について」（Task 6 のフォームの同意文から `https://nponest.com/privacy/` を参照）

- [ ] **Step 1: 節を追加する**

```astro
        <section class="policy__section">
          <h2>Ⅵ.「私の想い」への投稿について</h2>
          <p>
            親なき後ページの「私の想い」コーナーに寄せられた投稿は、次のとおり取り扱います。
          </p>
          <ol>
            <li>寄せられた想いは、当法人の担当者が読み、掲載するかどうかを判断します。投稿がそのまま公開されることはありません。</li>
            <li>掲載にあたっては、個人の特定につながる記述を伏せたり言い換えたりすることがあります。掲載名はペンネームまたは「匿名」とし、実名は掲載しません。</li>
            <li>特定の事業所・機関・個人への不満やご意見は、このコーナーには掲載しません。内容は当法人で受け止め、活動の見直しに生かします。</li>
            <li>「活動への活用」に同意いただいた場合に限り、個人が特定されない形で、勉強会や資料作りなど当法人の活動に生かします。</li>
            <li>ご記入いただいたメールアドレスは、受付のお知らせと掲載前の確認のためにだけ使い、公開しません。</li>
            <li>掲載後の取り下げは、お問い合わせフォームから、掲載名とおおよその掲載日を添えてご連絡ください。ご本人であることを確認できない場合でも、取り下げに応じます。</li>
          </ol>
        </section>
```

- [ ] **Step 2: ビルドして表示を確かめる**

Run: `npm run build && grep -c '「私の想い」への投稿について' dist/privacy/index.html`
Expected: `1`

- [ ] **Step 3: コミット**

```bash
git add src/pages/privacy.astro
git commit -m "docs: add omoi submission handling to privacy policy"
```

---

### Task 6: フォーム作成スクリプト（Apps Script）

**Files:**
- Create: `scripts/create-watashi-no-omoi-form.gs`

**Interfaces:**
- Consumes: プライバシーポリシーの節（Task 5）
- Produces: 実行ログに「公開URL」。河原さんがそれを `src/lib/omoi.ts` の `OMOI_FORM_URL` に貼る（Task 8 の後、別作業）

Apps Script は、このリポジトリでは自動テストを持たない（既存の3本も同じ）。検証は河原さんの Google アカウントでのテスト投稿で行う（Step 3）。

- [ ] **Step 1: スクリプトを書く**

`scripts/create-watashi-no-omoi-form.gs`:

```js
/**
 * 親なき後「私の想い」投稿フォーム 自動生成スクリプト（Google Apps Script）
 * =====================================================================
 *
 * 親なき後ページの「私の想い」コーナーの投稿フォームを Google フォームとして作成し、
 * 審査台帳（スプレッドシート）まで用意する。設計：docs/superpowers/specs/2026-09-28-watashi-no-omoi-design.md
 *
 *   - 1ページ目：お題・想い・お立場・年代・掲載名・掲載の希望
 *   - 「掲載を希望する」を選んだ人だけ、2ページ目（掲載への同意・必須）へ進む
 *   - 最終ページ：活動への活用（任意）・連絡先メール（任意）
 *   - 審査台帳：回答列＋管理列（状態・一次確認者・一次確認メモ・掲載用本文・最終判断メモ・掲載日・掲載ファイル名）
 *   - 送信のたびに：① 担当者と河原さんへ通知 ② 投稿者へ受付確認（メール記入者のみ） ③ 状態を「未確認」に
 *
 * 【使い方】
 *   1. フォームを管理する Google アカウントで https://script.google.com/ を開き「新しいプロジェクト」
 *   2. このファイルの中身を全部貼り付け、NOTIFY_EMAILS に通知先2名を書く
 *   3. 関数「createWatashiNoOmoiForm」を ▶実行（初回は権限を許可）
 *   4. 実行ログの「公開URL」を、サイトの src/lib/omoi.ts の OMOI_FORM_URL に貼ってデプロイ
 *   5. シークレットウィンドウで、ログインなしで回答できるか確認
 *      （求められたら FORM_ID を書いて openOmoiFormToPublic を実行）
 *
 * 【原文の扱い】
 *   原文を読むのは台帳上の担当者と河原さんだけ。サイトに載せる作業には「掲載用本文」列だけを使う。
 */

// ▼▼▼ 通知先（一次確認の担当者・最終判断の河原さん）。空のままでは作成しない ▼▼▼
var NOTIFY_EMAILS = [];
// ▲▲▲

var PRIVACY_URL = 'https://nponest.com/privacy/';
var OMOI_PAGE_URL = 'https://nponest.com/post-parent/omoi/';

// 項目名（作成と送信時処理の両方で使う）
var Q_THEME = 'お題';
var Q_BODY = 'あなたの想い';
var Q_RELATION = 'お立場';
var Q_AGE = '年代（任意）';
var Q_PENNAME = '掲載名（ペンネーム）';
var Q_WISH = '掲載について';
var Q_CONSENT = '掲載への同意';
var Q_USE = '活動への活用（任意）';
var Q_EMAIL = '連絡先メールアドレス（任意・公開しません）';

var WISH_PUBLISH = '掲載を希望する';
var WISH_DELIVER = '掲載は希望せず、nest に届けるだけ';

var STATUSES = ['未確認', '一次確認済', '掲載可', '要本人確認', '見送り', '掲載済', '取り下げ'];
var MANAGED_COLUMNS = ['状態', '一次確認者', '一次確認メモ', '掲載用本文', '最終判断メモ', '掲載日', '掲載ファイル名'];

function createWatashiNoOmoiForm() {
  if (NOTIFY_EMAILS.length === 0) {
    throw new Error('NOTIFY_EMAILS に通知先を書いてから実行してください。');
  }

  var form = FormApp.create('親なき後「私の想い」');
  form.setTitle('親なき後「私の想い」');
  form.setDescription(
    '「親なき後」を思うとき、胸にあることを寄せてください。\n' +
    '同じ立場の誰かが読んで「わたしだけじゃない」と感じられる場所にしたいと考えています。\n' +
    'まとまっていない文章や、答えの出ていない迷いも歓迎します。\n' +
    '\n' +
    '・寄せられた想いは、編集部が読んでから掲載します。すぐには載りません。\n' +
    '・実名、お子さんのお名前、学校名・施設名・事業所名、お住まいの地域は書かないでください。\n' +
    '　書かれていた場合は、編集部が伏せたり言い換えたりします。\n' +
    '・特定の事業所・機関・個人への不満やご意見は、このコーナーには掲載しません。\n' +
    '　お問い合わせフォームで個別にお受けします。\n' +
    '・掲載後に取り下げたいときは、お問い合わせフォームからご連絡ください。'
  );
  form.setConfirmationMessage(
    '想いを寄せてくださり、ありがとうございます。\n' +
    '編集部で大切に読ませていただきます。\n' + OMOI_PAGE_URL
  );
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(true);
  form.setRequireLogin(false);
  form.setLimitOneResponsePerUser(false);

  // --- 1ページ目 ---
  form.addMultipleChoiceItem()
    .setTitle(Q_THEME)
    .setRequired(true)
    .setChoiceValues(['子どもに遺したい言葉', 'いま一番気がかりなこと', 'こうなっていたら安心できる', '自由に']);

  form.addParagraphTextItem()
    .setTitle(Q_BODY)
    .setRequired(true)
    .setHelpText('400〜800字くらいが目安です（長くても短くても構いません。長い場合は1,200字くらいまでを目安に）。');

  form.addMultipleChoiceItem()
    .setTitle(Q_RELATION)
    .setRequired(true)
    .setChoiceValues(['親', 'きょうだい', '祖父母', 'その他の家族']);

  form.addListItem()
    .setTitle(Q_AGE)
    .setChoiceValues(['20代以下', '30代', '40代', '50代', '60代', '70代', '80代以上', '答えない']);

  form.addTextItem()
    .setTitle(Q_PENNAME)
    .setRequired(true)
    .setHelpText('ペンネームを書いてください。名前を出したくない方は「匿名」と書いてください。実名は掲載しません。');

  var wish = form.addMultipleChoiceItem().setTitle(Q_WISH).setRequired(true);

  // --- 2ページ目：掲載への同意（掲載を希望した人だけ） ---
  var pageConsent = form.addPageBreakItem().setTitle('掲載への同意');
  var consent = form.addCheckboxItem();
  consent.setTitle(Q_CONSENT)
    .setRequired(true)
    .setHelpText(
      '掲載にあたり、編集部が個人の特定につながる部分を伏せたり言い換えたりすることがあります。\n' +
      '取り扱いはプライバシーポリシー（' + PRIVACY_URL + '）をご覧ください。'
    )
    .setChoices([consent.createChoice('掲載すること、伏せ字・言い換えをすることに同意します')]);

  // --- 最終ページ ---
  var pageLast = form.addPageBreakItem().setTitle('最後に');
  var use = form.addCheckboxItem();
  use.setTitle(Q_USE)
    .setHelpText('掲載されない場合も含め、個人が特定されない形で、nest の活動（勉強会・資料作りなど）に生かしてよい場合はチェックしてください。')
    .setChoices([use.createChoice('活動に生かしてよい')]);

  var emailValidation = FormApp.createTextValidation()
    .setHelpText('正しいメールアドレスを入力してください。')
    .requireTextIsEmail()
    .build();
  form.addTextItem()
    .setTitle(Q_EMAIL)
    .setHelpText('受付のお知らせと、掲載前に修正した文章を確認していただくためだけに使います。')
    .setValidation(emailValidation);

  // 分岐：掲載を希望 → 同意ページ、届けるだけ → 最終ページ
  wish.setChoices([
    wish.createChoice(WISH_PUBLISH, pageConsent),
    wish.createChoice(WISH_DELIVER, pageLast),
  ]);

  // 審査台帳
  var ss = SpreadsheetApp.create('私の想い_審査台帳');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();
  removeEmptyDefaultSheet_(ss);
  try {
    addManagedColumns_(ss);
  } catch (err) {
    Logger.log('※ 管理列の追加をスキップしました（' + err + '）。フォーム自体は作成済みです。');
  }

  registerOmoiSubmitTrigger_(ss);

  Logger.log('================ 作成完了 ================');
  Logger.log('公開URL（サイトの OMOI_FORM_URL に貼る）: ' + form.getPublishedUrl());
  Logger.log('編集URL                               : ' + form.getEditUrl());
  Logger.log('フォームID                            : ' + form.getId());
  Logger.log('審査台帳URL                           : ' + ss.getUrl());
  Logger.log('通知先                                : ' + NOTIFY_EMAILS.join(', '));
  Logger.log('==========================================');
}

// 管理列を追加し、「状態」列に選択肢の入力規則を付ける
function addManagedColumns_(ss) {
  var sheet = findResponseSheet_(ss);
  if (!sheet || sheet.getLastColumn() < 1) return;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (var i = 0; i < MANAGED_COLUMNS.length; i++) {
    if (headers.indexOf(MANAGED_COLUMNS[i]) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(MANAGED_COLUMNS[i]);
    }
  }
  var statusCol = columnOf_(sheet, '状態');
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build();
  sheet.getRange(2, statusCol, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
}

function columnOf_(sheet, name) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var col = headers.indexOf(name) + 1;
  if (col === 0) {
    col = sheet.getLastColumn() + 1;
    sheet.getRange(1, col).setValue(name);
  }
  return col;
}

function findResponseSheet_(ss) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var a1 = String(sheets[i].getRange(1, 1).getValue());
    if (a1 === 'タイムスタンプ' || a1 === 'Timestamp') return sheets[i];
  }
  for (var j = 0; j < sheets.length; j++) {
    if (sheets[j].getLastColumn() > 0) return sheets[j];
  }
  return null;
}

function removeEmptyDefaultSheet_(ss) {
  var resp = findResponseSheet_(ss);
  if (!resp) return;
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() !== resp.getSheetId() &&
        sheets[i].getLastColumn() === 0 &&
        ss.getSheets().length > 1) {
      ss.deleteSheet(sheets[i]);
    }
  }
}

function registerOmoiSubmitTrigger_(ss) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onOmoiSubmit') ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger('onOmoiSubmit').forSpreadsheet(ss).onFormSubmit().create();
}

/**
 * 送信時：① 通知（担当者・河原さん） ② 受付確認（メール記入者のみ） ③ 状態を「未確認」に
 */
function onOmoiSubmit(e) {
  var r = e.namedValues;
  var get = function (k) { return (r[k] || [''])[0]; };

  // --- ① 通知（原文を含む。宛先は台帳を読む2名だけ） ---
  var lines = Object.keys(r).map(function (k) { return k + '：' + r[k].join(', '); });
  MailApp.sendEmail(
    NOTIFY_EMAILS.join(','),
    '【私の想い】新しい投稿が届きました（' + get(Q_WISH) + '）',
    '親なき後「私の想い」に新しい投稿がありました。\n' +
    '審査台帳で一次確認をお願いします。\n\n' +
    lines.join('\n')
  );

  // --- ② 受付確認 ---
  var email = get(Q_EMAIL);
  if (email) {
    MailApp.sendEmail(
      email,
      '【nest】「私の想い」を受け付けました',
      'この度は「私の想い」に想いを寄せてくださり、ありがとうございます。\n' +
      '編集部で大切に読ませていただきます。\n\n' +
      (get(Q_WISH) === WISH_PUBLISH
        ? '掲載する場合、個人の特定につながる部分を伏せたり言い換えたりしたときは、掲載前にこのアドレスへ確認のご連絡をします。\n' +
          'すべての想いを掲載できるとは限らないことを、ご了承ください。\n\n'
        : '掲載はせず、nest の中で大切に受け止めます。\n\n') +
      OMOI_PAGE_URL + '\n\n' +
      '※ このメールは自動送信です。\n\n' +
      '特定非営利活動法人nest'
    );
  }

  // --- ③ 状態を「未確認」に ---
  var sheet = e.range.getSheet();
  sheet.getRange(e.range.getRow(), columnOf_(sheet, '状態')).setValue('未確認');
}

// ▼▼▼ 作成済みフォームのID（作成時ログの「フォームID」） ▼▼▼
var FORM_ID = '';
// ▲▲▲

/** 【必要なときだけ】作成済みフォームを「ログイン不要」にする（Workspace アカウントで作った場合） */
function openOmoiFormToPublic() {
  var form = FormApp.openById(FORM_ID);
  form.setRequireLogin(false);
  form.setLimitOneResponsePerUser(false);
  Logger.log('ログイン不要に設定しました。公開URL: ' + form.getPublishedUrl());
}
```

- [ ] **Step 2: 構文を確かめる**

Run: `node --check scripts/create-watashi-no-omoi-form.gs 2>&1 || node -e "new Function(require('fs').readFileSync('scripts/create-watashi-no-omoi-form.gs','utf8'))"`
Expected: エラーなし（`.gs` は拡張子で弾かれることがあるため、`new Function` による構文確認を併用する）

- [ ] **Step 3: コミット**

```bash
git add scripts/create-watashi-no-omoi-form.gs
git commit -m "feat: add Apps Script to create omoi submission form"
```

- [ ] **Step 4（河原さんの作業・実装後）: テスト投稿**

通知先を書いて実行し、次を確認する（Claude は結果の報告を受けるだけ）：
1. 「掲載を希望する」で送る → 同意ページが出る／通知メールが2名に届く／台帳の状態が「未確認」
2. 「届けるだけ」で送る → 同意ページを飛ばして最終ページへ
3. メール記入あり → 受付確認メールが届く。記入なし → 届かない
4. シークレットウィンドウで、ログインなしに回答できる
5. テスト投稿の行は台帳から削除する

---

### Task 7: 運用文書（チェックリスト・掲載と取り下げの手順）

**Files:**
- Create: `docs/operations/watashi-no-omoi-checklist.md`
- Create: `docs/operations/watashi-no-omoi-publishing.md`

**Interfaces:**
- Consumes: 台帳の管理列名（Task 6）、コレクションの frontmatter（Task 2）
- Produces: 担当者・掲載作業者向けの手順

- [ ] **Step 1: チェックリストを書く**

`docs/operations/watashi-no-omoi-checklist.md`:

```md
# 「私の想い」一次確認チェックリスト（担当者用）

投稿を読み、次を順に確かめてください。気づいたことは台帳の「一次確認メモ」へ。
伏せ字・言い換えを済ませた文章を「掲載用本文」に書き、「状態」を「一次確認済」にします。
掲載の最終判断は河原さんが行います。

## A. すぐに河原さんへ相談するもの（掲載判断より先に）
- [ ] 命に関わる危機や、虐待の兆候が書かれている

## B. 伏せる・言い換えるもの
- [ ] 人名（本人・家族・支援者・医師など）
- [ ] 学校・施設・事業所・病院の名前
- [ ] 地域（市区町村より細かいもの。市名も内容しだいで伏せる）
- [ ] 年齢・学年・診断名・障害の程度などの**組み合わせ**で、誰のことか分かってしまわないか
- [ ] **身近な人（同じ事業所の家族・支援者）が読んで、誰のことか分かってしまわないか。**
      見知らぬ読者には分からなくても、狭い地域では分かることがあります。
      エピソードの細部を一般化してください。迷ったら「要本人確認」を提案

## C. 掲載しないもの
- [ ] 特定の相手（nest 自身・他の事業所・行政・個人）への不満・批判
  - 投稿全体がそうなら →「見送り」を提案（内容は河原さんが受け止めます）
  - 一部なら → その部分を除いても想いとして成り立つときだけ、除いた本文を作って「要本人確認」を提案
    （連絡先メールが無ければ「見送り」）

## D. 最後に
- [ ] 「掲載について」が「届けるだけ」の投稿は、掲載用本文を作らず「見送り」（活動への活用の同意があるかをメモ）
- [ ] 伏せ字・言い換えをして、連絡先メールがある →「要本人確認」を提案
- [ ] 誤字の修正は最小限に。文体や言い回しは直さない
```

- [ ] **Step 2: 掲載と取り下げの手順を書く**

`docs/operations/watashi-no-omoi-publishing.md`:

````md
# 「私の想い」掲載・取り下げの手順

## 掲載
1. 台帳で「状態」が「掲載可」の行を選ぶ（「要本人確認」は、本人の了承が取れてから「掲載可」になる）
2. **「掲載用本文」列だけ**を使う。原文の列はコピーしない（Claude に渡すときも同じ）
3. `src/content/post-parent-omoi/` に `YYYY-MM-DD-NN.md`（掲載日＋その日の連番。01 から）を作る：

   ```md
   ---
   theme: kigakari          # nokositai-kotoba / kigakari / anshin / jiyu
   relation: oya            # oya / kyodai / sofubo / sonota
   ageRange: 50代           # 「答えない」・未回答なら行ごと消す
   penName: 匿名
   publishedAt: 2026-10-05
   ---

   （掲載用本文。段落の間は空行を1つ）
   ```

   お題とお立場の対応：子どもに遺したい言葉＝nokositai-kotoba、いま一番気がかりなこと＝kigakari、こうなっていたら安心できる＝anshin、自由に＝jiyu／親＝oya、きょうだい＝kyodai、祖父母＝sofubo、その他の家族＝sonota
4. `npm run build` が通ることを確かめる（お題・お立場を書き間違えるとここで止まる）
5. main へ反映してデプロイ
6. 台帳に「掲載日」「掲載ファイル名」を書き、「状態」を「掲載済」にする
7. 連絡先メールがあれば、掲載したことを知らせる（任意）

## 取り下げ
1. お問い合わせで依頼を受けたら、掲載名とおおよその掲載日で台帳を探す
2. 本人であることを確かめられなくても、取り下げる
3. 台帳の「掲載ファイル名」のファイルを削除 → `npm run build` → main へ反映してデプロイ
4. 台帳の「状態」を「取り下げ」にする
````

- [ ] **Step 3: コミット**

```bash
git add docs/operations/watashi-no-omoi-checklist.md docs/operations/watashi-no-omoi-publishing.md
git commit -m "docs: add omoi review checklist and publishing procedure"
```

---

### Task 8: 全体の検証と見た目の確認

**Files:**
- 一時的に作成・削除: `src/content/post-parent-omoi/2099-01-0*.md`（架空のサンプル）
- 記録: `タスク.md`、`作業ログ.md`

- [ ] **Step 1: 架空のサンプル3件を置く**

Task 3 Step 6 の2件に加え、長文の `2099-01-03-01.md`：

```md
---
theme: nokositai-kotoba
relation: sofubo
ageRange: 70代
penName: 長文テスト
publishedAt: 2099-01-03
---

（架空の文章。「これは長文表示の確認のための架空の文章です。」を段落を分けて繰り返し、全体で約1,200字にする）
```

- [ ] **Step 2: ビルドとテスト**

Run: `npm run build && npm test && npx playwright test`
Expected: build 成功、vitest すべて PASS。Playwright は、サンプルがある状態では0件前提の e2e（Task 3・Task 4）が FAIL するのが正しい。**サンプルを消してから** `npx playwright test` を再実行し、すべて PASS を確認する（Step 5）。

- [ ] **Step 3: dist で混入がないことを確かめる**

Run: `ls -d dist/post-parent/column/*/ | wc -l && grep -l '長文テスト' -r dist | sort`
Expected: 1つ目は Task 2 Step 1 と同じ数。2つ目は `dist/post-parent/index.html` と `dist/post-parent/omoi/index.html` の2つだけ（トップ・News・コラムに出ない）

- [ ] **Step 4: 375px / 1280px（と 320px）を撮影して目視**

Playwright（ヘッドレス）で、`/post-parent/#omoi` と `/post-parent/omoi/` を 320・375・1280px で撮影し、`test-results/omoi/` に保存する。確認すること：
- 横スクロールが出ない（`document.documentElement.scrollWidth <= innerWidth`）
- 見出し「私の想い」が文節の途中で折れない
- 長文カードの段落が保たれ、署名行が右下にある
- 絞り込みボタンを押すと、そのお題だけになり、「すべて」で戻る
- 抜粋カードを押すと、一覧ページの該当カードへ飛ぶ

- [ ] **Step 5: サンプルを消して、0件の状態で再確認**

```bash
rm src/content/post-parent-omoi/2099-01-0*.md
npm run build && npx playwright test
git status --short src/content/post-parent-omoi/
```
Expected: e2e すべて PASS。`git status` にサンプルが残っていない（`.gitkeep` のみ追跡）

- [ ] **Step 6: 記録してコミット**

`タスク.md` の該当行を更新し（実装済み・未公開、残りは河原さんの作業：通知先の記入・フォーム作成・テスト投稿・`OMOI_FORM_URL` の設定・最初の2〜3件）、`作業ログ.md` に1エントリ追記する。

```bash
git add タスク.md 作業ログ.md
git commit -m "docs: record watashi-no-omoi implementation"
```

---

## 実装後に残る作業（本計画の範囲外）

- 河原さん：通知先2名を `NOTIFY_EMAILS` に書いてフォームを作成（Task 6 Step 4 のテスト投稿を含む）
- `OMOI_FORM_URL` に公開URLを設定してデプロイ（1行の変更）
- 最初の2〜3件を関係者に書いてもらい、通常の審査を通して掲載
- 公開（main へのマージ）は、河原さんの「公開して」を受けてから
