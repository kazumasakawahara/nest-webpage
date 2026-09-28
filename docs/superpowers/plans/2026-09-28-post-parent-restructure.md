# 「親なき後」ページ 構成見直し Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/post-parent/` を「目次＋4章（わたしたちの考え／声を聴く／いま、備える／資料とつながり）」に組み直し、見出しの階層を整える。本文と見出しの見た目は変えない。

**Architecture:** 1ページのまま、既存のブロック（`<section>`）を切り出して新しい順に並べ直す。ヒーロー直後に目次（`<nav>`）、各章の頭に番号つきの区切り（新規コンポーネント `PpChapterHead.astro`、章題は h2）を置く。既存ブロックの見出しは1段ずつ下げ、タグ名で指定している CSS を新しいタグに合わせる。検証は e2e（構造・順序・見出しの階層）と、変更前後の見出しの計算済みスタイルの比較で行う。

**Tech Stack:** Astro 6、Playwright（e2e・計測）、Python（ブロックの組み替えスクリプト）

**Spec:** `docs/superpowers/specs/2026-09-28-post-parent-restructure-design.md`

## Global Constraints

- 本文（文章）は1文字も変えない。変えるのは並び・見出しのタグ・目次・章の区切り・背景の付け直しだけ
- 第3章「知恵を、引き継げる形に」の段落は**並べ替えない**（spec §3 の修正。「そして」「その仕組みを」が前の段落を受けているため）
- ページ内リンクの位置 `#tax`・`#column`・`#omoi` を残す。新しい位置は `#toc`・`#belief`・`#voices`・`#prepare`・`#connect`
- 目次は画面上部に固定しない。子ページに分けない
- 既存ブロックの見出しの見た目（大きさ・書体・太さ・行の高さ・字間・色・余白・折り返し指定）は変えない。変わってよいのは「寄稿」の見出しだけ（小さな欄の題から、他のブロックと同じ `section__title` になるため）
- 色・余白は既存のトークンだけを使う（`--space-1`〜`--space-10`、`--color-*`、`--font-serif` など）
- 文言で「正直」を使わない
- e2e は、この作業場所の dev サーバー（`preview_start` の `astro-dev`、autoPort）に `E2E_BASE_URL` を向け、砂場の外で実行する（ポート 4321 は別の作業場所のサーバー、Chromium は砂場内で起動できない）
- dev サーバーは起動後に追加・削除した投稿ファイルを拾わないことがある。投稿ファイルを出し入れしたら再起動する
- `npx playwright test` は `test-results/` を消す。撮影画像は最後のテスト実行の後に保存する
- 架空のサンプル投稿（`src/content/post-parent-omoi/2099-01-0*.md`、未追跡）はコミットしない。`git add` は必ずファイル名を指定する。Task 4 の最後に削除する

## Review Focus

1. **ほかのページから `#tax`・`#column` で来た人**が、該当ブロックに着地し、見出しがヘッダーに隠れない → Task 2 の e2e（位置の存在）、Task 4 の計測（`#tax` 着地時の位置）
2. **寄稿が0件**のとき：第2章は私の想いだけになり、`#column` が無くなる（寄稿の記事ページからの戻りリンクは章の頭に着かない）。現状1件あるので今は起きないが、0件でもページが壊れないこと → Task 2 で `posts.length > 0` の条件を残す
3. **見出しを下げたことで見た目が変わる**（ブラウザ既定の h5 の余白、グローバルの `h1〜h4` にだけ付いている字間・折り返し指定の欠落） → Task 3 の計測比較
4. **スマホ幅（320px）で章の区切りが詰まる**（番号・章題・「目次へ戻る」の3つが1行に入らない） → Task 2 の CSS（480px 以下で2段）、Task 4 の撮影
5. **読み上げソフト**：見出しの階層が h1 → h2（章）→ h3（ブロック）→ h4 → h5 と飛ばずに並ぶ → Task 3 の e2e

---

## ファイル構成

| ファイル | 役割 |
|---|---|
| `src/components/PpChapterHead.astro`（新規） | 章の区切り（番号・章題 h2・目次へ戻る） |
| `src/pages/post-parent.astro`（変更） | 章データ・目次・ブロックの並べ替え・寄稿の独立・見出しの階層・CSS |
| `tests/e2e/post-parent-structure.spec.ts`（新規） | 目次・章の順・位置・見出しの階層 |
| `tests/e2e/omoi.spec.ts`（変更） | 私の想いの見出しレベル h2 → h3 |
| 作業用（コミットしない）: `<workspace>/measure-headings.mjs`、`baseline.json`、`after.json`、`shot.mjs` | 変更前後の見出しスタイルの比較、撮影 |

`<workspace>` は `superpowers/skills/subagent-driven-development/scripts/sdd-workspace <この計画>` が出すディレクトリ（git 管理外）。

---

### Task 1: 変更前の見出しスタイルを測る

**Files:**
- Create（作業用・コミットしない）: `<workspace>/measure-headings.mjs`、`<workspace>/baseline.json`

**Interfaces:**
- Produces: `baseline.json`（`{ "375": { "<見出しの文>": { fontSize, … } }, "1280": { … }, "texts": [本文の文字列（並べ替え済み）] }`）。Task 2・Task 3 が同じスクリプトで `after.json` を作り比べる

- [ ] **Step 1: 計測スクリプトを書く**

`<workspace>/measure-headings.mjs`:

```js
// 見出しの計算済みスタイルを JSON に書き出す。使い方: node measure-headings.mjs <BASE_URL> <OUT_JSON>
import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [BASE, OUT] = process.argv.slice(2);
const TEXTS = [
  'お金より、遺すべきものがある',
  '「親なき後」を希望に変える',
  '「本気」のスタートが切り開いた自立への道',
  'めざすネットワークを、一枚の地図に',
  '知恵を、引き継げる形に',
  'とはいえ、知っておきたい税の話',
  'まず、「区分」を知る',
  '所得税・住民税の障害者控除',
  '知恵と仕組みを、分かち合う',
  '資料室',
  '私の想い',
  'ゆるく、つながる',
];
const PROPS = ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing', 'color',
  'marginTop', 'marginBottom', 'textWrapStyle', 'wordBreak', 'textAlign'];

const browser = await chromium.launch({ args: ['--single-process'] });
const page = await browser.newPage();
const out = {};
for (const width of [375, 1280]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE}/post-parent/`, { waitUntil: 'networkidle' });
  out[width] = await page.evaluate(([texts, props]) => Object.fromEntries(texts.map((t) => {
    const el = [...document.querySelectorAll('main h2, main h3, main h4, main h5')].find((h) => h.textContent.trim() === t);
    if (!el) return [t, null];
    const cs = getComputedStyle(el);
    return [t, Object.fromEntries(props.map((p) => [p, cs[p]]))];
  })), [TEXTS, PROPS]);
}
// 本文（段落・箇条書き）の文字列。目次と章の区切りは新しく足すものなので除く
out.texts = await page.evaluate(() =>
  [...document.querySelectorAll('main p, main li')]
    .filter((e) => !e.closest('#toc, .pp-chapter'))
    .map((e) => e.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .sort());
writeFileSync(OUT, JSON.stringify(out, null, 1));
await browser.close();
```

- [ ] **Step 2: 変更前のページで測る**

dev サーバー（`preview_start` `astro-dev`）のポートを `<PORT>` として：

Run: `node <workspace>/measure-headings.mjs http://localhost:<PORT> <workspace>/baseline.json && python3 -c "import json;d=json.load(open('<workspace>/baseline.json'));print([k for k,v in d['375'].items() if v is None])"`
Expected: `[]`（12個すべての見出しが見つかる）。`texts` に本文の段落が並んでいる

（コミットなし）

---

### Task 2: 目次・章の区切り・ブロックの並べ替え

**Files:**
- Create: `src/components/PpChapterHead.astro`
- Modify: `src/pages/post-parent.astro`
- Test: `tests/e2e/post-parent-structure.spec.ts`

**Interfaces:**
- Consumes: なし
- Produces: 章の要素 `.pp-chapter`（id＝章の位置、中に `h2.pp-chapter__title`）、目次 `nav[aria-label="このページの目次"]`、`#toc`。寄稿は独立した `<section id="column">`（見出しはこの時点では h2.section__title、Task 3 で h3）

- [ ] **Step 1: 失敗する e2e を書く**

`tests/e2e/post-parent-structure.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('post-parent page has a table of contents for four chapters', async ({ page }) => {
  await page.goto('/post-parent/');
  const links = page.getByRole('navigation', { name: 'このページの目次' }).getByRole('link');
  await expect(links).toHaveCount(4);
  expect(await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual([
    '#belief',
    '#voices',
    '#prepare',
    '#connect',
  ]);
});

test('chapters are h2 headings in the planned order', async ({ page }) => {
  await page.goto('/post-parent/');
  await expect(page.locator('.pp-chapter h2')).toHaveText(['わたしたちの考え', '声を聴く', 'いま、備える', '資料とつながり']);
});

test('blocks follow the chapter order and existing anchors remain', async ({ page }) => {
  await page.goto('/post-parent/');
  const inOrder = await page.evaluate(() => {
    const byText = (t: string) =>
      [...document.querySelectorAll('main h2, main h3')].find((h) => h.textContent?.trim() === t) ?? null;
    const els = [
      document.getElementById('toc'),
      document.getElementById('belief'),
      byText('お金より、遺すべきものがある'),
      byText('「親なき後」を希望に変える'),
      document.getElementById('voices'),
      document.getElementById('omoi'),
      document.getElementById('column'),
      document.getElementById('prepare'),
      byText('知恵を、引き継げる形に'),
      document.getElementById('tax'),
      document.getElementById('connect'),
      document.getElementById('pp-resources-title'),
      document.getElementById('pp-community-title'),
    ];
    if (els.some((e) => !e)) return `missing: ${els.findIndex((e) => !e)}`;
    for (let i = 1; i < els.length; i++) {
      if (!(els[i - 1]!.compareDocumentPosition(els[i]!) & Node.DOCUMENT_POSITION_FOLLOWING)) return `out of order at ${i}`;
    }
    return 'ok';
  });
  expect(inOrder).toBe('ok');
});
```

- [ ] **Step 2: 失敗することを確かめる**

Run: `E2E_BASE_URL=http://localhost:<PORT> npx playwright test tests/e2e/post-parent-structure.spec.ts`
Expected: 3件とも FAIL（目次・`.pp-chapter` が無い／`missing: 0`）

- [ ] **Step 3: 章の区切りコンポーネントを書く**

`src/components/PpChapterHead.astro`:

```astro
---
// 親なき後ページの章の区切り（番号・章題・目次へ戻る）。章題は h2、中のブロックの見出しは h3
interface Props {
  id: string;
  num: string;
  title: string;
  // 直後のブロックと同じ背景にして、章の頭として一体に見せる
  bg?: 'sand' | 'cream';
}
const { id, num, title, bg } = Astro.props;
---

<div class:list={['pp-chapter', bg && `section--${bg}`]} id={id}>
  <div class="container container--narrow pp-chapter__inner">
    <p class="pp-chapter__num" aria-hidden="true">{num}</p>
    <h2 class="pp-chapter__title">{title}</h2>
    <a class="pp-chapter__toc" href="#toc">目次へ戻る ↑</a>
  </div>
</div>

<style>
  .pp-chapter {
    padding: var(--space-8) 0 0;
    scroll-margin-top: 80px;
  }
  .pp-chapter__inner {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: baseline;
    gap: var(--space-4);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--color-line);
  }
  .pp-chapter__num {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 32px;
    line-height: 1;
    color: var(--color-terra-500);
  }
  .pp-chapter__title {
    margin: 0;
    font-size: clamp(22px, 5vw, 28px);
  }
  .pp-chapter__toc {
    font-size: 13px;
    color: var(--color-ink-mute);
    white-space: nowrap;
  }
  .pp-chapter__toc:hover { color: var(--color-terra-500); }
  @media (max-width: 480px) {
    .pp-chapter__inner { grid-template-columns: auto 1fr; }
    .pp-chapter__toc { grid-column: 1 / -1; justify-self: end; }
  }
</style>
```

- [ ] **Step 4: 章データ・import・目次を追加する**

`src/pages/post-parent.astro` の frontmatter、`import { OMOI_FORM_URL, sortOmoi } from '../lib/omoi';` の次に：

```ts
import PpChapterHead from '../components/PpChapterHead.astro';
```

`const omoiLatest = …` の行の次に：

```ts

// ページの章立て（目次と各章の区切りで使う）。共感を先に、実用を後に並べる
const CHAPTERS = [
  { id: 'belief', num: '01', title: 'わたしたちの考え', lead: 'お金より遺すべきもの。nest の15年の歩み' },
  { id: 'voices', num: '02', title: '声を聴く', lead: 'ご家族から寄せられた想いと、寄稿' },
  { id: 'prepare', num: '03', title: 'いま、備える', lead: '知恵を引き継ぐ道具と、知っておきたい税の話' },
  { id: 'connect', num: '04', title: '資料とつながり', lead: '資料室・研修アーカイブと、お知らせの登録' },
] as const;
const [chBelief, chVoices, chPrepare, chConnect] = CHAPTERS;
```

- [ ] **Step 5: ブロックを組み替えるスクリプトを実行する**

作業用に `<workspace>/restructure.py` を置いて実行する（コミットしない）。既存ブロックは切り出して並べ直すだけで、中身は変えない。寄稿だけは理念の中から取り出して独立したブロックにする。

```python
# -*- coding: utf-8 -*-
# 親なき後ページのブロックを「目次＋4章」の順に組み替える（中身は変えない）
p = 'src/pages/post-parent.astro'
s = open(p, encoding='utf-8').read()

M_BELIEF = '  <!-- ===== 理念（主役） ===== -->\n'
M_HISTORY = '  <!-- ===== 親なき後問題への15年の取り組み（記事） ===== -->\n'
M_IDEA = '  <!-- ===== 構想：暗黙知をデジタルで継承する ===== -->\n'
M_TAX = '  <!-- ===== とはいえ、知っておきたい税の話 ===== -->\n'
M_RES = '  <!-- ===== リソースへの入口 ===== -->\n'
M_COMM_COMMENT = '  <!-- ===== ゆるいつながり（公開コミュニティ入口） ===== -->\n'
M_OMOI = '  <!-- ===== 私の想い（ご家族から寄せられた想い） ===== -->\n'
M_COMM_SEC = '  <section class="section section--sand" aria-labelledby="pp-community-title">\n'
M_CTA = '  <!-- ===== 問い合わせ動線 ===== -->\n'

def cut(a, b):
    i, j = s.index(a), s.index(b)
    assert i < j, (a, b)
    return s[i:j]

belief = cut(M_BELIEF, M_HISTORY)
history = cut(M_HISTORY, M_IDEA)
idea = cut(M_IDEA, M_TAX)
tax = cut(M_TAX, M_RES)
res = cut(M_RES, M_COMM_COMMENT)
omoi = cut(M_OMOI, M_COMM_SEC)
comm = cut(M_COMM_SEC, M_CTA)

# 理念の中の寄稿（空行＋コメント〜条件の閉じ）を取り出す
C_START = '\n      <!-- 寄稿（理念を掘り下げる読みもの） -->\n'
C_END = '      )}\n'
ci = belief.index(C_START)
cj = belief.index(C_END, ci) + len(C_END)
column_old = belief[ci:cj]
belief = belief[:ci] + belief[cj:]
ul_start = column_old.index('          <ul class="ds-posts">\n')
ul_end = column_old.index('          </ul>\n') + len('          </ul>\n')
ul = ''.join(line[2:] + '\n' for line in column_old[ul_start:ul_end].splitlines())

column = (
    '  <!-- ===== 寄稿（親なき後にかかわる読みもの） ===== -->\n'
    '  {posts.length > 0 && (\n'
    '    <section class="section section--sand" id="column" aria-labelledby="pp-column-title">\n'
    '      <div class="container container--narrow reveal">\n'
    '        <span class="eyebrow">Column</span>\n'
    '        <h2 class="section__title" id="pp-column-title">寄稿</h2>\n'
    '        <p class="pp-column__lead">親なき後にかかわる読みものを掲載しています。</p>\n'
    + ul +
    '      </div>\n'
    '    </section>\n'
    '  )}\n\n'
)

toc = '''  <!-- ===== 目次 ===== -->
  <section class="section section--cream pp-toc-section" id="toc" aria-labelledby="pp-toc-title">
    <div class="container container--narrow">
      <h2 class="pp-toc__title" id="pp-toc-title">このページの内容</h2>
      <nav aria-label="このページの目次">
        <ol class="pp-toc">
          {CHAPTERS.map((c) => (
            <li>
              <a class="pp-toc__item" href={`#${c.id}`}>
                <span class="pp-toc__num" aria-hidden="true">{c.num}</span>
                <span class="pp-toc__name">{c.title}</span>
                <span class="pp-toc__lead">{c.lead}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <p class="pp-toc__note">支援者の方は、03 の『3つの道具』と 04 の資料室からご覧ください。</p>
    </div>
  </section>

'''

def chapter(var, bg=None):
    extra = f' bg="{bg}"' if bg else ''
    return f'  <PpChapterHead id={{{var}.id}} num={{{var}.num}} title={{{var}.title}}{extra} />\n'

body = (
    toc
    + '  <!-- ============ 01 わたしたちの考え ============ -->\n' + chapter('chBelief') + '\n'
    + belief + history
    + '  <!-- ============ 02 声を聴く ============ -->\n' + chapter('chVoices') + '\n'
    + omoi + column
    + '  <!-- ============ 03 いま、備える ============ -->\n' + chapter('chPrepare') + '\n'
    + idea + tax
    + '  <!-- ============ 04 資料とつながり ============ -->\n' + chapter('chConnect', 'cream') + '\n'
    + res + M_COMM_COMMENT + comm
)
start, end = s.index(M_BELIEF), s.index(M_CTA)
s = s[:start] + body + s[end:]
open(p, 'w', encoding='utf-8').write(s)
print('ok')
```

Run: `python3 <workspace>/restructure.py`
Expected: `ok`

- [ ] **Step 6: CSS を追加・整理する**

`src/pages/post-parent.astro` の `<style>` で：

1. 寄稿が独立したことで使われなくなった `.pp-column { … }` と `.pp-column__title { … }` の2つのルールを削除する（`.pp-column__lead` は残す）
2. `</style>` の直前に追加：

```css
  /* 目次（ヒーロー直後に一度だけ。画面上部には固定しない） */
  .pp-toc-section { padding-block: var(--space-7); }
  .pp-toc__title { font-size: 20px; margin: 0 0 var(--space-4); }
  .pp-toc {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }
  .pp-toc__item {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: var(--space-3);
    height: 100%;
    padding: var(--space-4) var(--space-5);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-lg);
    background: var(--color-paper);
    color: var(--color-ink);
    text-decoration: none;
  }
  .pp-toc__item:hover { border-color: var(--color-terra-500); }
  .pp-toc__num {
    grid-row: span 2;
    font-family: var(--font-serif);
    font-size: 22px;
    line-height: 1.2;
    color: var(--color-terra-500);
  }
  .pp-toc__name { font-family: var(--font-serif); font-size: 17px; font-weight: 600; color: var(--color-green-900); }
  .pp-toc__lead { font-size: 13px; line-height: 1.7; color: var(--color-ink-mute); }
  .pp-toc__note { margin: var(--space-4) 0 0; font-size: 14px; color: var(--color-ink-mute); }
  @media (max-width: 768px) { .pp-toc { grid-template-columns: 1fr; } }

  /* 章の区切りの直後のブロックは、上の余白を詰めて章の頭と一体に見せる */
  :global(.pp-chapter) + .section { padding-top: var(--space-6); }
```

- [ ] **Step 7: 通ることを確かめる**

Run: `npm run build && E2E_BASE_URL=http://localhost:<PORT> npx playwright test tests/e2e/`
Expected: build 成功。e2e は新しい3件を含めすべて PASS（既存の `omoi.spec.ts`・`smoke.spec.ts` も、見出しレベルはまだ変えていないので PASS）

- [ ] **Step 8: 本文が変わっていないことを確かめる**

Run:
```bash
node <workspace>/measure-headings.mjs http://localhost:<PORT> <workspace>/after-t2.json
python3 -c "
import json
b=json.load(open('<workspace>/baseline.json'))['texts']; a=json.load(open('<workspace>/after-t2.json'))['texts']
print('same', b==a); print('only before', [t[:40] for t in b if t not in a]); print('only after', [t[:40] for t in a if t not in b])"
```
Expected: `same True`（本文の段落・箇条書きが1つも増減・変化していない。寄稿の案内文「親なき後にかかわる読みものを掲載しています。」も同じ文のまま移っている）

- [ ] **Step 9: コミット**

```bash
git add src/components/PpChapterHead.astro src/pages/post-parent.astro tests/e2e/post-parent-structure.spec.ts
git commit -m "feat: reorganize post-parent page into toc and four chapters"
```

---

### Task 3: 見出しの階層を1段ずつ下げる

**Files:**
- Modify: `src/pages/post-parent.astro`
- Modify: `tests/e2e/omoi.spec.ts`
- Test: `tests/e2e/post-parent-structure.spec.ts`（追記）

**Interfaces:**
- Consumes: Task 2 の構成（本文の領域は `  <!-- ============ 01 わたしたちの考え ============ -->` から `  <!-- ===== 問い合わせ動線 ===== -->` の手前まで）、Task 1 の `measure-headings.mjs` と `baseline.json`
- Produces: ブロックの見出し h3、記事内・税・資料カードの小見出し h4、税の制度名 h5

- [ ] **Step 1: 失敗する e2e を追記する**

`tests/e2e/post-parent-structure.spec.ts` の末尾に：

```ts
test('headings step down from chapter h2 to block h3 and below', async ({ page }) => {
  await page.goto('/post-parent/');
  for (const name of [
    'お金より、遺すべきものがある',
    '「親なき後」を希望に変える',
    '私の想い',
    '寄稿',
    '知恵を、引き継げる形に',
    'とはいえ、知っておきたい税の話',
    '知恵と仕組みを、分かち合う',
    'ゆるく、つながる',
  ]) {
    await expect(page.getByRole('heading', { level: 3, name, exact: true })).toHaveCount(1);
  }
  for (const name of ['「本気」のスタートが切り開いた自立への道', 'めざすネットワークを、一枚の地図に', 'まず、「区分」を知る', '資料室']) {
    await expect(page.getByRole('heading', { level: 4, name, exact: true })).toHaveCount(1);
  }
  await expect(page.getByRole('heading', { level: 5, name: '所得税・住民税の障害者控除', exact: true })).toHaveCount(1);
});
```

`tests/e2e/omoi.spec.ts` の親なき後ページのテスト（`post-parent hub shows the omoi section …`）の中の：

```ts
  await expect(section.getByRole('heading', { level: 2, name: '私の想い' })).toBeVisible();
```

を次に変える：

```ts
  // 章「声を聴く」（h2）の中のブロックなので h3
  await expect(section.getByRole('heading', { level: 3, name: '私の想い' })).toBeVisible();
```

- [ ] **Step 2: 失敗することを確かめる**

Run: `E2E_BASE_URL=http://localhost:<PORT> npx playwright test tests/e2e/post-parent-structure.spec.ts tests/e2e/omoi.spec.ts`
Expected: 追記したテストと、変更した omoi のテストが FAIL（まだ h2）

- [ ] **Step 3: 見出しのタグを下げ、CSS を合わせる**

`<workspace>/demote.py`（コミットしない）：

```python
# -*- coding: utf-8 -*-
# 本文の領域（01 章の区切り〜問い合わせ動線の手前）の見出しを1段ずつ下げ、タグ名で指定しているCSSを合わせる
import re
p = 'src/pages/post-parent.astro'
s = open(p, encoding='utf-8').read()
start = s.index('  <!-- ============ 01 わたしたちの考え ============ -->\n')
end = s.index('  <!-- ===== 問い合わせ動線 ===== -->\n')
region = s[start:end]
n_before = len(re.findall(r'<h[2-4][\s>]', region))
region = re.sub(r'<(/?)h([2-4])(?=[\s>])', lambda m: f'<{m.group(1)}h{int(m.group(2)) + 1}', region)
s = s[:start] + region + s[end:]

# タグ名で指定しているスタイル
assert s.count('.pp-article h3') >= 1 and s.count('.pp-tax-item h4') >= 1
s = s.replace('.pp-article h3', '.pp-article h4')
s = s.replace('.pp-tax-item h4 {', '.pp-tax-item h5 {\n    /* h5 はグローバルの h1〜h4 の指定（字間・折り返し）から外れるので、ここで同じものを付ける */\n    letter-spacing: 0.02em;\n    text-wrap: balance;\n    word-break: auto-phrase;', 1)
open(p, 'w', encoding='utf-8').write(s)
print('headings shifted:', n_before)
```

Run: `python3 <workspace>/demote.py && grep -n "pp-article h\|pp-tax-item h" src/pages/post-parent.astro`
Expected: `headings shifted: 24`（h2 が8：理念・希望に変える・私の想い・寄稿・知恵を・税・分かち合う・ゆるく、h3 が10：記事内3・地図1・税3・資料カード3、h4 が6：税の制度名。目次と章の区切りは領域外・コンポーネントなので含まない）。grep の結果に `h3`/`h4` の旧セレクタが残っていない（`.pp-tax-item h4` が別のルールでも使われていれば、それも `h5` に直す）

- [ ] **Step 4: 通ることを確かめる**

Run: `npm run build && E2E_BASE_URL=http://localhost:<PORT> npx playwright test tests/e2e/`
Expected: build 成功、e2e すべて PASS

- [ ] **Step 5: 見出しの見た目が変わっていないことを比べる**

Run:
```bash
node <workspace>/measure-headings.mjs http://localhost:<PORT> <workspace>/after.json
python3 -c "
import json
b=json.load(open('<workspace>/baseline.json')); a=json.load(open('<workspace>/after.json'))
print('texts same', b.pop('texts')==a.pop('texts'))
diff=[(w,t,k,b[w][t][k],a[w][t][k]) for w in b for t in b[w] if b[w][t] and a[w][t] for k in b[w][t] if b[w][t][k]!=a[w][t][k]]
missing=[(w,t) for w in b for t in b[w] if a[w].get(t) is None]
print('missing',missing); print('diff',diff)"
```
Expected: `texts same True`、`missing []`、`diff []`。差があれば、その見出しの CSS を元の値に合わせて Step 4 から繰り返す（例：h5 の `marginTop` が変わった → `.pp-tax-item h5` の `margin` が効いているか確認）

- [ ] **Step 6: コミット**

```bash
git add src/pages/post-parent.astro tests/e2e/post-parent-structure.spec.ts tests/e2e/omoi.spec.ts
git commit -m "feat: step down post-parent headings under chapter h2"
```

---

### Task 4: 見た目の確認と記録

**Files:**
- Create（作業用）: `<workspace>/shot.mjs`
- 撮影画像: `test-results/post-parent/`（最後のテスト実行の後に保存）
- 記録: `タスク.md`、`作業ログ.md`

- [ ] **Step 1: 撮影・計測スクリプトを書く**

`<workspace>/shot.mjs`:

```js
// 親なき後ページの構成見直しの確認。使い方: node shot.mjs <BASE_URL> <OUT_DIR>
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [BASE, OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ['--single-process'] });
const page = await browser.newPage();
const results = [];

const reveal = () => page.evaluate(() => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible')));

for (const width of [320, 375, 1280]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE}/post-parent/`, { waitUntil: 'networkidle' });
  await reveal();
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => {
    const tops = [...document.querySelectorAll('.pp-toc > li')].map((li) => Math.round(li.getBoundingClientRect().top));
    // 「目次へ戻る」が章題の下の段に回っているか（狭い画面では下の段、広い画面では同じ段）
    const tocBelow = [...document.querySelectorAll('.pp-chapter__inner')].map((el) =>
      el.querySelector('.pp-chapter__toc').getBoundingClientRect().top >= el.querySelector('h2').getBoundingClientRect().bottom - 1);
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      tocColumns: tops.filter((t) => t === tops[0]).length,
      tocBelow,
    };
  });
  await page.locator('#toc').screenshot({ path: `${OUT}/toc-${width}.png` });
  await page.locator('#prepare').screenshot({ path: `${OUT}/chapter-${width}.png` });
  await page.screenshot({ path: `${OUT}/full-${width}.png`, fullPage: true });

  // 目次から 03 へ、外から #tax へ：着地した見出しがヘッダーに隠れない
  const header = await page.evaluate(() => Math.round(document.querySelector('header')?.getBoundingClientRect().bottom ?? 0));
  await page.locator('.pp-toc__item[href="#prepare"]').click();
  await page.waitForTimeout(600);
  const prepareTop = await page.evaluate(() => Math.round(document.querySelector('#prepare h2').getBoundingClientRect().top));
  await page.goto(`${BASE}/post-parent/#tax`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const taxTop = await page.evaluate(() => Math.round(document.querySelector('#tax h3').getBoundingClientRect().top));
  results.push({ width, ...m, header, prepareTop, taxTop });
}
console.log(JSON.stringify(results));
await browser.close();
```

- [ ] **Step 2: 最後の e2e を実行し、その後に撮影する**

架空のサンプル投稿が置かれている状態で（無ければ `src/content/post-parent-omoi/2099-01-0{1,2,3}-01.md` を置き、dev サーバーを再起動）：

Run:
```bash
E2E_BASE_URL=http://localhost:<PORT> npx playwright test tests/e2e/post-parent-structure.spec.ts
node <workspace>/shot.mjs http://localhost:<PORT> test-results/post-parent
```
Expected:
- e2e PASS
- 各幅で `overflow` が 0
- `tocColumns`：320・375 は 1、1280 は 2
- `tocBelow`：320・375 は各章 true（目次へ戻るが下の段）、1280 は各章 false（同じ段）
- `prepareTop` と `taxTop` が `header` 以上（ヘッダーに隠れない）

画像（`toc-*.png`・`chapter-*.png`・`full-375.png`）を開いて目視：章の区切りがはっきり見える、見出しが文節の途中で折れない、背景の色が隣り合うブロックで同じにならない。

- [ ] **Step 3: サンプルを消して、0件の状態で全体を確かめる**

```bash
rm src/content/post-parent-omoi/2099-01-0*.md
```

dev サーバーを再起動し（新しいポートを `<PORT>` に）：

Run: `npm run build && npm test && E2E_BASE_URL=http://localhost:<PORT> npx playwright test`
Expected: すべて PASS。`git status --short` に `2099-` のファイルが無い

（`npx playwright test` で `test-results/` が消えるので、Step 2 の画像が必要なら、先に作業用ディレクトリへ退避しておき、このあと戻す）

- [ ] **Step 4: 記録してコミット**

`タスク.md` の「親なき後ページの構成見直し」の行を更新し（実装済み・未公開、段落の並べ替えを取りやめた理由、確認結果）、`作業ログ.md` に1エントリ追記する。

```bash
git add タスク.md 作業ログ.md
git commit -m "docs: record post-parent restructure implementation"
```
