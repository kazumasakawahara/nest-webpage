# 「親なき後」ページ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 「お金ではなく暗黙知と支援の仕組みを遺す」という nest の理念を伝えるハブページ `/post-parent/` を新設し、グローバルナビに追加する。

**Architecture:** 新規 Astro ページ `src/pages/post-parent.astro` を、既存コンポーネント（`BaseLayout` / `Hero` / `CtaBlock`）と既存グローバルCSSクラス（`.section` / `.section--sand` / `.container--narrow` / `.eyebrow` / `.section__title` / `.reveal`）のみで構成（`group-home.astro` と同じ骨格）。`src/lib/site.ts` の `navLinks` に1項目を追加。新規CSSは書かない。実在の利用者・家族の個人情報や実支援データは一切載せない。

**Tech Stack:** Astro v6（SSR / Cloudflare adapter）、グローバルCSSカスタムプロパティ。ページの自動テストフレームワークは無いため、検証は `npm run build` の成功・出力の grep・目視で行う。

仕様: `docs/superpowers/specs/2026-05-30-post-parent-page-design.md`

---

### Task 1: navLinks に「親なき後」を追加する

**Files:**
- Modify: `src/lib/site.ts`（`navLinks` 配列、`グループホーム` 項目の直後）

注意: `site.ts` には既存の未コミットWIP（tagline 等）がある。**本タスクは navLinks への1行追加に限定し、他の行には一切触れない。**

- [ ] **Step 1: navLinks にエントリを追加する**

`src/lib/site.ts` の以下の箇所:

```ts
  { label: 'グループホーム', href: '/group-home/' },
  {
    label: '就労継続支援B型',
```

を、次のように変更する（`親なき後` の1行を挿入）:

```ts
  { label: 'グループホーム', href: '/group-home/' },
  { label: '親なき後', href: '/post-parent/' },
  {
    label: '就労継続支援B型',
```

- [ ] **Step 2: 追加されたことを確認する**

Run: `grep -n "post-parent" src/lib/site.ts`
Expected: `{ label: '親なき後', href: '/post-parent/' },` の1行がマッチする。

---

### Task 2: post-parent.astro を作成する

**Files:**
- Create: `src/pages/post-parent.astro`

参照（編集しない、流用元の確認用）:
- `src/components/Hero.astro` — props: `eyebrow, title, titleSub, lead, size, image, placeholderLabel`
- `src/components/CtaBlock.astro` — props: `title, body?, primary?, secondary?, showTel?, variant?`
- `src/pages/group-home.astro` — 同じ骨格の先行実装

- [ ] **Step 1: ページを以下の内容で新規作成する**

`src/pages/post-parent.astro` を次の内容で作成する:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import CtaBlock from '../components/CtaBlock.astro';
---

<BaseLayout
  title="親なき後"
  description="NPO法人nestは、親なき後に向けて「お金」ではなく、親や家族の暗黙知と支援者の経験知を遺し、本人支援が続く仕組みづくりに取り組んでいます。"
>
  <Hero
    eyebrow="Post-Parent Support"
    title="親なき後"
    lead="遺すのは、お金ではない。"
    size="md"
    placeholderLabel="POST-PARENT SUPPORT"
  />

  <!-- ===== 理念（主役） ===== -->
  <section class="section">
    <div class="container container--narrow reveal">
      <span class="eyebrow">Our Belief</span>
      <h2 class="section__title">お金より、遺すべきものがある</h2>
      <p style="font-size:16px; line-height:2; color:var(--color-ink); margin-bottom:var(--space-5);">
        「親がいなくなったら、この子のことを一番に考えてくれるのは誰だろう」——障害のある子をもつ親にとって、これは切実な問いです。
      </p>
      <p style="font-size:16px; line-height:2; color:var(--color-ink); margin-bottom:var(--space-5);">
        多くの場合、その備えとしてまず「お金」が考えられます。けれどもわたしたちは、お金を遺すことが必ずしも本人の幸せにつながるとは限らない、と考えています。
        本当に必要なのは、親や家族が長い年月をかけて積み重ねてきた「我が子を守るための知恵」——どんなときに不安になるのか、何を大切にしているのか、誰が支えてくれるのか——そうした暗黙知を、言葉にして遺すことです。
      </p>
      <p style="font-size:16px; line-height:2; color:var(--color-ink);">
        nest がめざすのは、その知恵と、支援者たちの経験を持ち寄り、親なき後も本人の暮らしを支え続けられる「仕組み」をつくることです。
      </p>
    </div>
  </section>

  <!-- ===== くらしサポートネット（人のネットワーク） ===== -->
  <section class="section section--sand">
    <div class="container container--narrow reveal">
      <span class="eyebrow">People Network</span>
      <h2 class="section__title">人と人とで、支え合う</h2>
      <p style="font-size:16px; line-height:2; color:var(--color-ink);">
        「nestくらしサポートネット」は、本人と家族、そして支援者がゆるやかにつながり、互いの経験を持ち寄って支え合うための取り組みです。
        ひとつの家族だけで抱え込むのではなく、地域のネットワークとして本人の暮らしを見守っていく——その土台づくりを続けています。
      </p>
    </div>
  </section>

  <!-- ===== 構想：暗黙知をデジタルで継承する ===== -->
  <section class="section">
    <div class="container container--narrow reveal">
      <span class="eyebrow">Our Challenge</span>
      <h2 class="section__title">知恵を、引き継げる形に</h2>
      <p style="font-size:16px; line-height:2; color:var(--color-ink); margin-bottom:var(--space-5);">
        わたしたちは、親や支援者が蓄積してきた知恵を、特定の誰かの記憶だけに頼らず、支援に関わる人たちみんなで引き継いでいけるようにする仕組みづくりに取り組んでいます。
      </p>
      <p style="font-size:16px; line-height:2; color:var(--color-ink); margin-bottom:var(--space-5);">
        本人の医療・生活の情報、大切にしていること、緊急時に気をつけること、支えてくれる人のつながり——こうした情報を整理して残し、必要なときに必要な人へ確実に引き継げる形にする。
        それが、親なき後も途切れない支援を実現するための、nest 発の挑戦です。
      </p>
      <p style="font-size:14px; line-height:1.9; color:var(--color-ink-mute);">
        ※ この仕組みは現在開発中です。実際の利用者・ご家族の情報を本ウェブサイト上で扱うことはありません。
      </p>
    </div>
  </section>

  <!-- ===== 問い合わせ動線 ===== -->
  <section class="section">
    <div class="container">
      <CtaBlock
        title="親なき後の備えについて"
        body="ご家族の備えや、わたしたちの取り組みにご関心のある方は、お気軽にお問い合わせください。"
        primary={{ label: 'お問い合わせフォーム', href: '/contact/' }}
        secondary={{ label: 'nestについて', href: '/about/' }}
        variant="dark"
      />
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: ビルドが通ることを確認する**

Run: `npm run build`
Expected: エラーなく完了し、`/post-parent/index.html` が生成される。

- [ ] **Step 3: プライバシー確認（実在の個人情報・住所が無い）**

Run: `grep -nE "原町|弁天|木町|丁目|〒|様$" src/pages/post-parent.astro`
Expected: 何もマッチしない（出力ゼロ）。

- [ ] **Step 4: 「開発中」と実データ非掲載の明示を確認する**

Run: `grep -c "開発中" src/pages/post-parent.astro`
Expected: `1`（構想セクションに「現在開発中」の明示が1箇所ある）。

- [ ] **Step 5: コミットする**

```bash
git add src/lib/site.ts src/pages/post-parent.astro
git commit -m "feat(post-parent): add 親なき後 page on inheriting tacit knowledge over money

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

- **Spec coverage:** §3-1 ヒーロー → Task2 Hero ✓ / §3-2 理念 → 理念 section（3段落）✓ / §3-3 くらしサポートネット → People Network section ✓ / §3-4 構想（開発中明示・実データ非掲載）→ Our Challenge section ＋ 注記 ✓ / §3-5 問い合わせ → CtaBlock ✓ / §5 navLinks 追加（グループホーム直後・他WIP不干渉）→ Task1 ✓ / §2 プライバシー → Task2 Step3 grep ✓ / §7 検証（build・nav・grep・開発中明示）→ Task1 Step2＋Task2 Step2-4 ✓。
- **Placeholder scan:** TODO/TBD なし。コピーは §4 草案（くらしサポートネットは §6 のとおり汎用コピーをそのまま採用）。全ステップに実コード／実コマンドと期待値あり。
- **Type consistency:** Hero/CtaBlock の prop 名は各コンポーネント定義（`eyebrow/title/lead/size/placeholderLabel`、`title/body/primary/secondary/variant`）と一致。navLinks のオブジェクト形 `{ label, href }` は既存エントリと一致。新規CSSなし。
- **注記:** §6 の「くらしサポートネット事実確認」は、確認できない場合は汎用コピーのまま掲載する方針（仕様合意済み）。実装をブロックしない。
