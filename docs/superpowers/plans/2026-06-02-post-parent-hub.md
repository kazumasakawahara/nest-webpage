# 親なき後ハブ化（フェーズ1）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 公開「親なき後」ページを、理念ページから「資料の無償配布・ツール紹介・研修アーカイブ・ゆるい公開入口」を束ねるハブへ発展させる（フェーズ1＝基盤）。

**Architecture:** 既存の静的Astroサイト上に、親ハブ `/post-parent/`（現ページ発展）＋3子ページ（library/tools/seminars）を追加。PDFはモーダルでその場プレビュー（sudachiの実装を共通コンポーネント化）。会員エリア（`members/**`）には一切触れない。実コンテンツ（PDF・スクショ・GitHub URL・フォーム）は未確定のため、**データ駆動＋「準備中」空状態**で枠を先に作り、素材が揃い次第データ配列へ差し込む。

**Tech Stack:** Astro 6（static / Cloudflare adapter）、既存 global.css トークン、TypeScript データモジュール、Playwright（E2Eスモーク）。

**検証方針（静的サイト向けTDDの読み替え）:** ロジックの単体テスト対象がほぼ無いため、各タスクのゲートは `npm run build`（Astro/TS/ルート衝突を検出し、生成ルートを一覧表示）。インタラクション（PDFモーダル等）と回遊は最終タスクで Playwright スモークにより検証する。

**前提コンテンツ依存（実装と並行して河原さんが準備）:** 仕様書 §7 参照。未準備でも「準備中」状態で本タスク群は完了でき、後からデータ追加のみで反映される。

---

## File Structure

- **Create** `src/lib/post-parent.ts` — library/seminars/tools のデータと型。単一の責務＝親なき後ハブの構造化データ。
- **Create** `src/components/PdfPreview.astro` — PDFプレビュー用モーダル（マークアップ＋スクリプト＋CSS）。1ページに1回設置。sudachi のインライン実装を共通化（sudachi 本体は本フェーズでは変更しない）。
- **Create** `src/components/PdfDocCard.astro` — 1資料カード（表紙＋表題＋メタ＋「読む」トリガ＋DLリンク）。library と seminars で再利用。
- **Modify** `src/pages/post-parent.astro` — 入口カード（grid-3）＋ゆるいつながり＋入会ブリッジを追加。既存の理念/くらしサポートネット/構想/CTAは維持。
- **Create** `src/pages/post-parent/library.astro` — 資料室（年次報告／研修資料）。
- **Create** `src/pages/post-parent/tools.astro` — ツール・しくみ紹介。
- **Create** `src/pages/post-parent/seminars.astro` — 研修アーカイブ。
- **Modify** `tests/e2e/smoke.spec.ts` — 4ルートの描画・回遊・モーダル設置のスモーク追加。

> Astroルーティング注意：`src/pages/post-parent.astro`（→`/post-parent/`）と `src/pages/post-parent/library.astro`（→`/post-parent/library/`）は共存可能。`src/pages/post-parent/index.astro` は**作らない**（衝突回避）。

---

## Task 0: ブランチ作成と仕様コミット

**Files:**
- Commit: `docs/superpowers/specs/2026-06-02-post-parent-hub-design.md`（作成済み・未コミット）
- Commit: `docs/superpowers/plans/2026-06-02-post-parent-hub.md`（本ファイル）

- [ ] **Step 1: feature ブランチを作成**

```bash
cd /Users/k-kawahara/Projects/nest-webpage
git checkout -b feature/post-parent-hub
```

- [ ] **Step 2: 仕様書と実装計画をコミット**

```bash
git add docs/superpowers/specs/2026-06-02-post-parent-hub-design.md docs/superpowers/plans/2026-06-02-post-parent-hub.md
git commit -m "docs(planning): add post-parent hub design spec and implementation plan"
```

---

## Task 1: データモジュール `src/lib/post-parent.ts`

**Files:**
- Create: `src/lib/post-parent.ts`

- [ ] **Step 1: 型とデータ配列を作成**

```ts
// 親なき後ハブの構造化データ。
// 実ファイル（PDF）は public/docs/post-parent/ 以下に配置し、各 file パスを指す。
// 素材が未準備の配列は空のままでよい（各ページが「準備中」を表示する）。

export interface PdfDoc {
  title: string;
  file: string;      // 例: /docs/post-parent/annual-2025.pdf
  cover?: string;    // 表紙画像（任意）例: /images/post-parent/annual-2025-cover.png
  meta?: string;     // 例: 2025年度 ・ PDF
  note?: string;     // 例: 講師の許諾を得て公開
}

export interface Seminar {
  year: string;      // 例: 2024
  theme: string;     // 研修テーマ
  lecturer: string;  // 講師名
  materials: PdfDoc[];
}

export interface ToolLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface ToolIntro {
  name: string;
  tagline: string;
  forWhom: string;
  body: string;
  image?: string;
  imageAlt?: string;
  links: ToolLink[];
}

// 年次報告（アニュアル）
export const annualReports: PdfDoc[] = [
  // TODO(河原さん): 公開する年次報告PDFを public/docs/post-parent/ に置き、ここへ追加
];

// 研修資料・その他
export const trainingDocs: PdfDoc[] = [
  // TODO(河原さん): 配布許諾済みの研修資料を追加（note に「講師の許諾を得て公開」など）
];

// 研修会アーカイブ
export const seminars: Seminar[] = [
  // TODO(河原さん): 研修会のメタ情報（年・テーマ・講師）と配布資料を追加
];

// ツール・しくみ紹介（概念紹介のみ。実データ・内部構造は載せない）
export const tools: ToolIntro[] = [
  {
    name: 'くらしサポート（親なき後支援データベース）',
    tagline: '親の暗黙知を、支援者みんなで引き継げる形に',
    forWhom: 'nest と、関心のある支援者・法人向け',
    body: '親や家族が積み重ねた「我が子を守る知恵」を、特定の誰かの記憶に頼らず継承するための仕組みです。本人の大切にしていること、緊急時の注意、支えてくれる人のつながりを整理し、必要なときに必要な人へ確実に引き継げる形にします。',
    // image: '/images/post-parent/kurashisupport.png', // 用意でき次第
    links: [
      // GitHub公開可なら追加: { label: 'GitHub で見る', href: 'https://github.com/kazumasakawahara/nest-support', external: true },
      { label: 'この取り組みについて問い合わせる', href: '/contact/' },
    ],
  },
  {
    name: '支援エコマップ',
    tagline: '本人を中心とした支援ネットワークを可視化',
    forWhom: '相談支援専門員・社会福祉士・行政職員向け',
    body: '医療・福祉・権利擁護など、本人を支える人と機関のつながりを、直感的な図として描き・共有できるツールです。支援者間の情報共有を円滑にします。',
    // image: '/images/post-parent/ecomap.png', // 用意でき次第
    links: [
      // フェーズ2でデモを有効化: { label: 'デモを見る（読み取り専用）', href: '/post-parent/tools/eco-map-demo/' },
      { label: 'この取り組みについて問い合わせる', href: '/contact/' },
    ],
  },
];
```

- [ ] **Step 2: 型エラーがないことを確認**

Run: `npm run build`
Expected: ビルド成功（このモジュールはまだどこからも import されていないが、TS構文エラーがないことを確認）。

- [ ] **Step 3: コミット**

```bash
git add src/lib/post-parent.ts
git commit -m "feat(post-parent): add hub data module (library/seminars/tools)"
```

---

## Task 2: `PdfPreview.astro` コンポーネント

**Files:**
- Create: `src/components/PdfPreview.astro`

> 出自：`src/pages/sudachi.astro` のモーダル（マークアップ L183-195／スクリプト L198-237／CSS L411-503）を共通化。文言のみ「報告書」→「資料」に一般化。sudachi 本体は本フェーズでは変更しない（将来のDRY整理として別途）。

- [ ] **Step 1: コンポーネントを作成**

```astro
---
// 公開ページ用 PDF プレビューモーダル。
// 同一ページ内の `a.js-pdf-view`（href=PDF, data-title=表題）クリックでこのモーダルが開く。
// 1ページにつき1回だけ設置する。
---
<div class="pdf-modal" id="pdfModal" hidden>
  <div class="pdf-modal__backdrop" data-close></div>
  <div class="pdf-modal__panel" role="dialog" aria-modal="true" aria-labelledby="pdfModalTitle">
    <div class="pdf-modal__bar">
      <span class="pdf-modal__title" id="pdfModalTitle">資料プレビュー</span>
      <a class="pdf-modal__dl" id="pdfModalDl" href="#" download>
        ダウンロード<span aria-hidden="true"> ↓</span>
      </a>
      <button class="pdf-modal__close" type="button" data-close aria-label="プレビューを閉じる">✕</button>
    </div>
    <iframe class="pdf-modal__frame" id="pdfModalFrame" title="資料PDFプレビュー" src="about:blank"></iframe>
  </div>
</div>

<script>
  const modal = document.getElementById('pdfModal');
  if (modal) {
    const frame = document.getElementById('pdfModalFrame');
    const titleEl = document.getElementById('pdfModalTitle');
    const dlEl = document.getElementById('pdfModalDl');
    const closeBtn = modal.querySelector('.pdf-modal__close');
    let lastFocus = null;

    const openModal = (href, title) => {
      if (!href) return;
      lastFocus = document.activeElement;
      frame.src = href;
      titleEl.textContent = title || '資料プレビュー';
      dlEl.href = href;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    const closeModal = () => {
      modal.hidden = true;
      frame.src = 'about:blank';
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };

    document.querySelectorAll('.js-pdf-view').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(el.getAttribute('href'), el.dataset.title);
      });
    });

    modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }
</script>

<style>
  .pdf-modal[hidden] { display: none; }

  .pdf-modal {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-5);
  }

  .pdf-modal__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(26, 38, 32, 0.6);
    backdrop-filter: blur(2px);
  }

  .pdf-modal__panel {
    position: relative;
    width: min(960px, 100%);
    height: min(90vh, 100%);
    display: flex;
    flex-direction: column;
    background: var(--color-paper);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-hi);
    overflow: hidden;
  }

  .pdf-modal__bar {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-line);
    background: var(--color-cream);
  }

  .pdf-modal__title {
    flex: 1;
    min-width: 0;
    font-family: var(--font-hand);
    font-size: 16px;
    color: var(--color-green-900);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pdf-modal__dl {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-green-700);
    white-space: nowrap;
  }

  .pdf-modal__dl:hover { color: var(--color-terra-500); }

  .pdf-modal__close {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: var(--color-ink-mute);
    background: transparent;
    flex-shrink: 0;
  }

  .pdf-modal__close:hover {
    background: var(--color-line-soft);
    color: var(--color-green-900);
  }

  .pdf-modal__frame {
    flex: 1;
    width: 100%;
    border: 0;
    background: var(--color-sand);
  }

  @media (max-width: 768px) {
    .pdf-modal { padding: 0; }
    .pdf-modal__panel {
      width: 100%;
      height: 100%;
      border-radius: 0;
    }
  }
</style>
```

- [ ] **Step 2: ビルドが通ることを確認**

Run: `npm run build`
Expected: 成功（未使用コンポーネントだが構文エラーがないこと）。

- [ ] **Step 3: コミット**

```bash
git add src/components/PdfPreview.astro
git commit -m "feat(post-parent): add reusable PdfPreview modal component"
```

---

## Task 3: `PdfDocCard.astro` コンポーネント

**Files:**
- Create: `src/components/PdfDocCard.astro`

> `.dl-cover`（sudachi CSS L349-391）を参考に、表紙クリックで `js-pdf-view` トリガを出す資料カード。

- [ ] **Step 1: コンポーネントを作成**

```astro
---
import type { PdfDoc } from '../lib/post-parent';
type Props = PdfDoc;
const { title, file, cover, meta, note } = Astro.props as Props;
---
<article class="doc-card">
  <a class="doc-card__cover js-pdf-view" href={file} target="_blank" rel="noopener"
     data-title={title} aria-label={`${title}（PDF）を開いて読む`}>
    {cover
      ? <img src={cover} alt={`${title} の表紙`} />
      : <span class="doc-card__fallback" aria-hidden="true">PDF</span>}
    <span class="doc-card__hint" aria-hidden="true">クリックで読む</span>
  </a>
  <div class="doc-card__info">
    <h3 class="doc-card__title">{title}</h3>
    {meta && <p class="doc-card__meta">{meta}</p>}
    {note && <p class="doc-card__note">{note}</p>}
    <a class="btn btn--outline" href={file} download>
      ダウンロード<span class="btn__icon" aria-hidden="true"> ↓</span>
    </a>
  </div>
</article>

<style>
  .doc-card {
    display: flex;
    gap: var(--space-5);
    align-items: flex-start;
  }

  .doc-card__cover {
    display: block;
    position: relative;
    flex-shrink: 0;
    width: 124px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    box-shadow: var(--shadow-soft);
    border: 1px solid var(--color-line);
    transition: transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
  }

  .doc-card__cover img { display: block; width: 124px; height: auto; }

  .doc-card__fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 124px;
    height: 160px;
    background: var(--color-cream);
    color: var(--color-green-700);
    font-family: var(--font-mono);
    letter-spacing: 0.1em;
  }

  .doc-card__hint {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 5px 4px;
    background: rgba(26, 38, 32, 0.74);
    color: #fff;
    font-size: 11px;
    text-align: center;
    letter-spacing: 0.04em;
  }

  .doc-card__hint::before { content: '🔍 '; }

  .doc-card__cover:hover { transform: translateY(-3px); box-shadow: var(--shadow-card); }
  .doc-card__cover:hover .doc-card__hint { background: var(--color-terra-500); }

  .doc-card__info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .doc-card__title {
    font-family: var(--font-hand);
    font-size: 18px;
    font-weight: 600;
    color: var(--color-green-900);
  }

  .doc-card__meta {
    font-size: var(--fs-small);
    color: var(--color-ink-soft);
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
  }

  .doc-card__note { font-size: var(--fs-small); color: var(--color-ink-mute); }

  .doc-card__info .btn__icon { transition: transform var(--dur-fast) var(--ease-out); }
  .doc-card__info .btn:hover .btn__icon { transform: translateY(3px); }
</style>
```

- [ ] **Step 2: ビルドが通ることを確認**

Run: `npm run build`
Expected: 成功。

- [ ] **Step 3: コミット**

```bash
git add src/components/PdfDocCard.astro
git commit -m "feat(post-parent): add PdfDocCard component for document listings"
```

---

## Task 4: 資料室ページ `/post-parent/library/`

**Files:**
- Create: `src/pages/post-parent/library.astro`

- [ ] **Step 1: ページを作成**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PageIntro from '../../components/PageIntro.astro';
import PdfDocCard from '../../components/PdfDocCard.astro';
import PdfPreview from '../../components/PdfPreview.astro';
import CtaBlock from '../../components/CtaBlock.astro';
import { annualReports, trainingDocs } from '../../lib/post-parent';
---
<BaseLayout
  title="資料室｜親なき後"
  description="NPO法人nestが作成・公開している年次報告や研修資料を、どなたでも無償でご覧いただけます。"
>
  <PageIntro
    eyebrow="Library"
    title="資料室"
    lead="nestがこれまでに作成・公開してきた資料を、どなたでも無償でご覧・ダウンロードいただけます。"
  />

  <section class="section">
    <div class="container container--narrow reveal">
      <h2 class="section__title">年次報告（アニュアル）</h2>
      {annualReports.length === 0
        ? <p class="text-soft">現在準備中です。公開でき次第、こちらに掲載します。</p>
        : <div class="doc-list">{annualReports.map((d) => <PdfDocCard {...d} />)}</div>}
    </div>
  </section>

  <section class="section section--sand">
    <div class="container container--narrow reveal">
      <h2 class="section__title">研修資料・その他</h2>
      {trainingDocs.length === 0
        ? <p class="text-soft">現在準備中です。公開でき次第、こちらに掲載します。</p>
        : <div class="doc-list">{trainingDocs.map((d) => <PdfDocCard {...d} />)}</div>}
    </div>
  </section>

  <PdfPreview />

  <section class="section">
    <div class="container">
      <CtaBlock
        title="資料について"
        body="掲載資料へのご質問や、活用のご相談はお気軽にどうぞ。"
        primary={{ label: 'お問い合わせフォーム', href: '/contact/' }}
        secondary={{ label: '親なき後トップへ', href: '/post-parent/' }}
        variant="dark"
      />
    </div>
  </section>
</BaseLayout>

<style>
  .doc-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); }
  @media (max-width: 768px) { .doc-list { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 2: ビルドしてルート生成を確認**

Run: `npm run build`
Expected: 成功し、出力ログに `/post-parent/library/index.html` が現れる。ルート衝突警告が出ないこと。

- [ ] **Step 3: コミット**

```bash
git add src/pages/post-parent/library.astro
git commit -m "feat(post-parent): add library page for free document distribution"
```

---

## Task 5: 研修アーカイブページ `/post-parent/seminars/`

**Files:**
- Create: `src/pages/post-parent/seminars.astro`

- [ ] **Step 1: ページを作成**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PageIntro from '../../components/PageIntro.astro';
import PdfDocCard from '../../components/PdfDocCard.astro';
import PdfPreview from '../../components/PdfPreview.astro';
import CtaBlock from '../../components/CtaBlock.astro';
import { seminars } from '../../lib/post-parent';
---
<BaseLayout
  title="研修アーカイブ｜親なき後"
  description="日本財団の助成を受けて実施した研修会の資料を、講師の許諾を得て無償で公開しています。"
>
  <PageIntro
    eyebrow="Seminars"
    title="研修アーカイブ"
    lead="日本財団の助成を受けて実施した研修会の講師資料を、講師の許諾を得て公開しています。"
  />

  <section class="section">
    <div class="container container--narrow">
      {seminars.length === 0
        ? <p class="text-soft reveal">現在準備中です。講師の許諾を得た資料から順次公開します。</p>
        : seminars.map((s) => (
            <article class="seminar reveal">
              <p class="seminar__meta">{s.year} ・ 講師：{s.lecturer}</p>
              <h2 class="section__title">{s.theme}</h2>
              {s.materials.length > 0 && (
                <div class="doc-list">
                  {s.materials.map((m) => <PdfDocCard {...m} />)}
                </div>
              )}
            </article>
          ))}
    </div>
  </section>

  <PdfPreview />

  <section class="section section--sand">
    <div class="container">
      <CtaBlock
        title="研修・講演のご相談"
        body="親なき後の備えや支援の仕組みについて、研修・講演のご依頼も承っています。"
        primary={{ label: 'お問い合わせフォーム', href: '/contact/' }}
        secondary={{ label: '親なき後トップへ', href: '/post-parent/' }}
        variant="dark"
      />
    </div>
  </section>
</BaseLayout>

<style>
  .seminar { margin-bottom: var(--space-8); }
  .seminar__meta {
    font-size: var(--fs-small);
    color: var(--color-ink-soft);
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    margin-bottom: var(--space-2);
  }
  .doc-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); margin-top: var(--space-5); }
  @media (max-width: 768px) { .doc-list { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 2: ビルドしてルート生成を確認**

Run: `npm run build`
Expected: 成功し、`/post-parent/seminars/index.html` が生成される。

- [ ] **Step 3: コミット**

```bash
git add src/pages/post-parent/seminars.astro
git commit -m "feat(post-parent): add seminars archive page"
```

---

## Task 6: ツール紹介ページ `/post-parent/tools/`

**Files:**
- Create: `src/pages/post-parent/tools.astro`

- [ ] **Step 1: ページを作成**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PageIntro from '../../components/PageIntro.astro';
import CtaBlock from '../../components/CtaBlock.astro';
import { tools } from '../../lib/post-parent';
---
<BaseLayout
  title="ツール・しくみ｜親なき後"
  description="親の暗黙知の継承や、支援ネットワークの可視化に取り組む、nest発のしくみをご紹介します。"
>
  <PageIntro
    eyebrow="Tools & Systems"
    title="ツール・しくみ"
    lead="親なき後も支援が途切れないために。nestが取り組んでいる、知恵をつなぐためのしくみです。"
  />

  <section class="section">
    <div class="container container--narrow">
      {tools.map((t, i) => (
        <article class:list={['tool', { 'tool--alt': i % 2 === 1 }]} >
          <div class="tool__media">
            {t.image
              ? <img src={t.image} alt={t.imageAlt ?? t.name} />
              : <div class="tool__placeholder" aria-hidden="true">準備中</div>}
          </div>
          <div class="tool__body">
            <p class="tool__for">{t.forWhom}</p>
            <h2 class="tool__title">{t.name}</h2>
            <p class="tool__tagline">{t.tagline}</p>
            <p class="tool__text">{t.body}</p>
            <div class="tool__links">
              {t.links.map((l) => (
                <a class="btn btn--outline" href={l.href} {...(l.external ? { rel: 'external', target: '_blank' } : {})}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>

  <section class="section section--sand">
    <div class="container">
      <CtaBlock
        title="しくみづくりにご関心のある方へ"
        body="支援者・法人の方で、こうしたしくみの活用や共同にご関心があれば、お気軽にご相談ください。"
        primary={{ label: 'お問い合わせフォーム', href: '/contact/' }}
        secondary={{ label: '親なき後トップへ', href: '/post-parent/' }}
        variant="dark"
      />
    </div>
  </section>
</BaseLayout>

<style>
  .tool {
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
    gap: var(--space-6);
    align-items: center;
    margin-bottom: var(--space-8);
  }
  .tool--alt .tool__media { order: 2; }

  .tool__media img,
  .tool__placeholder {
    width: 100%;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-soft);
    display: block;
  }
  .tool__placeholder {
    aspect-ratio: 4 / 3;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-cream);
    color: var(--color-ink-soft);
    font-family: var(--font-mono);
    letter-spacing: 0.1em;
  }

  .tool__for {
    font-size: var(--fs-small);
    color: var(--color-green-700);
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    margin-bottom: var(--space-2);
  }
  .tool__title {
    font-family: var(--font-hand);
    font-size: 24px;
    font-weight: 600;
    color: var(--color-green-900);
    margin-bottom: var(--space-2);
  }
  .tool__tagline { font-size: 16px; color: var(--color-ink); margin-bottom: var(--space-4); }
  .tool__text { font-size: 15px; line-height: var(--lh-normal); color: var(--color-ink-mute); margin-bottom: var(--space-5); }
  .tool__links { display: flex; flex-wrap: wrap; gap: var(--space-3); }

  @media (max-width: 768px) {
    .tool { grid-template-columns: 1fr; }
    .tool--alt .tool__media { order: 0; }
  }
</style>
```

- [ ] **Step 2: ビルドしてルート生成を確認**

Run: `npm run build`
Expected: 成功し、`/post-parent/tools/index.html` が生成される。

- [ ] **Step 3: コミット**

```bash
git add src/pages/post-parent/tools.astro
git commit -m "feat(post-parent): add tools & systems intro page"
```

---

## Task 7: 親ハブ `/post-parent/` の発展

**Files:**
- Modify: `src/pages/post-parent.astro`

> 既存の理念／くらしサポートネット／構想／CTA は維持し、(A) 入口カード、(B) ゆるいつながり、(C) 入会ブリッジ を追加する。挿入位置は「構想セクション」と「問い合わせ動線（CtaBlock）」の間。

- [ ] **Step 1: 入口カード＋ゆるいつながりセクションを挿入**

`src/pages/post-parent.astro` の「構想：暗黙知をデジタルで継承する」セクションの閉じ `</section>` の直後、`<!-- ===== 問い合わせ動線 ===== -->` の直前に、次を挿入：

```astro
  <!-- ===== リソースへの入口 ===== -->
  <section class="section section--cream" aria-labelledby="pp-resources-title">
    <div class="container">
      <div class="section-head section-head--center reveal">
        <span class="eyebrow eyebrow--center">Resources</span>
        <h2 class="section__title section__title--center" id="pp-resources-title">知恵と仕組みを、分かち合う</h2>
        <p class="section__lead section__lead--center">
          nestがこれまでに積み重ねてきた資料・しくみ・研修を、<br />
          どなたでも無償でご活用いただけます。
        </p>
      </div>

      <div class="grid-3">
        <a class="card pp-entry reveal" href="/post-parent/library/" data-delay="1">
          <h3 class="card__title">資料室</h3>
          <p class="card__text">年次報告（アニュアル）や各種資料を、無償でご覧・ダウンロードいただけます。</p>
          <span class="pp-entry__more" aria-hidden="true">資料を見る →</span>
        </a>
        <a class="card pp-entry reveal" href="/post-parent/tools/" data-delay="2">
          <h3 class="card__title">ツール・しくみ</h3>
          <p class="card__text">暗黙知の継承や支援ネットワークの可視化に取り組む、nest発のしくみを紹介します。</p>
          <span class="pp-entry__more" aria-hidden="true">しくみを見る →</span>
        </a>
        <a class="card pp-entry reveal" href="/post-parent/seminars/" data-delay="3">
          <h3 class="card__title">研修アーカイブ</h3>
          <p class="card__text">日本財団の助成を受けて実施した研修会の資料を、講師の許諾を得て公開しています。</p>
          <span class="pp-entry__more" aria-hidden="true">研修を見る →</span>
        </a>
      </div>
    </div>
  </section>

  <!-- ===== ゆるいつながり（公開コミュニティ入口） ===== -->
  <section class="section section--sand" aria-labelledby="pp-community-title">
    <div class="container container--narrow reveal">
      <span class="eyebrow">Stay Connected</span>
      <h2 class="section__title" id="pp-community-title">ゆるく、つながる</h2>
      <p style="font-size:16px; line-height:2; color:var(--color-ink); margin-bottom:var(--space-5);">
        「親なき後」について、一緒に考えていきませんか。勉強会のお知らせや、新しい資料の公開情報を、ゆるやかにお届けします。
        登録は任意で、いつでも解除できます。
      </p>
      {NEWSLETTER_FORM_URL
        ? <a href={NEWSLETTER_FORM_URL} class="btn btn--accent" rel="external" target="_blank">お知らせを受け取る</a>
        : <p class="text-soft">※ 登録フォームは準備中です。当面は<a href="/contact/" class="inline-link">お問い合わせ</a>からご連絡ください。</p>}
      <p style="margin-top:var(--space-5); font-size:14px; color:var(--color-ink-mute);">
        もっと深く関わりたい方は、<a href="/join/" class="inline-link">入会のご案内</a>もご覧ください。
      </p>
    </div>
  </section>
```

- [ ] **Step 2: フロントマターに定数を追加**

`src/pages/post-parent.astro` 冒頭のフロントマター（`---` 内）に追加：

```astro
// ゆるい公開入口の登録フォーム（用意でき次第 URL を設定。空文字なら「準備中」を表示）
const NEWSLETTER_FORM_URL = '';
```

- [ ] **Step 3: 入口カード用の最小スタイルを追加**

`src/pages/post-parent.astro` 末尾（`</BaseLayout>` の後）に `<style>` ブロックが無ければ追加、あれば追記：

```astro
<style>
  .pp-entry { text-decoration: none; }
  .pp-entry__more {
    margin-top: auto;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-green-700);
  }
  .pp-entry:hover .pp-entry__more { color: var(--color-terra-500); }
</style>
```

- [ ] **Step 4: ビルド確認**

Run: `npm run build`
Expected: 成功。`/post-parent/index.html` 再生成。`inline-link` クラスは sudachi で既出のグローバル想定だが、未定義でもリンクは機能する（装飾のみ）。

- [ ] **Step 5: コミット**

```bash
git add src/pages/post-parent.astro
git commit -m "feat(post-parent): turn page into hub with resource entries and community opt-in"
```

---

## Task 8: E2E スモークテストと最終検証

**Files:**
- Modify: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: スモークテストを追記**

`tests/e2e/smoke.spec.ts` に以下を追加（既存の `homepage renders` は残す）：

```ts
test('post-parent hub renders and links to sub-pages', async ({ page }) => {
  await page.goto('/post-parent/');
  await expect(page.getByRole('heading', { name: '知恵と仕組みを、分かち合う' })).toBeVisible();
  // 入口カードの3リンクが存在する
  await expect(page.getByRole('link', { name: /資料を見る/ })).toHaveAttribute('href', '/post-parent/library/');
  await expect(page.getByRole('link', { name: /しくみを見る/ })).toHaveAttribute('href', '/post-parent/tools/');
  await expect(page.getByRole('link', { name: /研修を見る/ })).toHaveAttribute('href', '/post-parent/seminars/');
});

test('post-parent sub-pages render with PDF modal container', async ({ page }) => {
  for (const path of ['/post-parent/library/', '/post-parent/seminars/']) {
    await page.goto(path);
    // PdfPreview モーダルコンテナが設置されている（既定は hidden）
    await expect(page.locator('#pdfModal')).toBeHidden();
  }
  await page.goto('/post-parent/tools/');
  await expect(page.getByRole('heading', { name: 'ツール・しくみ' })).toBeVisible();
});
```

- [ ] **Step 2: E2E を実行**

Run: `npm run test:e2e`
Expected: 追加した2テスト＋既存テストが PASS。

> 注：`annualReports`/`trainingDocs`/`seminars` が空のうちは「準備中」が表示され、`PdfDocCard` は描画されない。実データ追加後、モーダルの開閉（`.js-pdf-view` クリック→ `#pdfModal` が表示・iframe src 更新）を手動またはテスト追記で確認する。

- [ ] **Step 3: 会員エリア非汚染を確認**

Run: `git diff --name-only main -- src/pages/members src/components/members`
Expected: 出力なし（会員エリアに変更が無い）。

- [ ] **Step 4: 個人情報・未許諾リンクの混入が無いか確認**

Run: `npm run build` が成功したうえで、目視で tools/library/seminars に実在の利用者・家族名や未許諾資料・未公開リポジトリへの実リンクが無いことを確認。

- [ ] **Step 5: コミット**

```bash
git add tests/e2e/smoke.spec.ts
git commit -m "test(post-parent): add e2e smoke for hub and sub-pages"
```

---

## Self-Review（spec との突合）

- **§3 スコープ（フェーズ1基盤）**：Task 4-7 で library/tools/seminars/hub を実装。エコマップ静的デモ（フェーズ2）は本計画外＝§10 後続として明記済み。✅
- **§4-1 ハブ**：Task 7 で入口カード＋ゆるいつながり＋入会ブリッジ。既存セクション維持。✅
- **§4-2 library / §4-3 tools / §4-4 seminars**：Task 4/6/5。✅
- **§4-5 ナビ据え置き**：navLinks 変更タスク無し（意図どおり）。✅
- **§2 会員棲み分け**：Task 8 Step 3 で members 非汚染を検証。✅
- **§5 PDF静的・完全オープン**：file は `/docs/post-parent/...` 静的パス、DLは `download` 属性で常時可能（no-JSフォールバック）。✅
- **§5 コミュニティ入口**：Task 7 で任意opt-in、フォーム未設定時は「準備中」。✅
- **§6 プライバシー**：Task 8 Step 4 で混入チェック。ツール紹介は概念のみ。✅
- **§7 コンテンツ依存**：データ配列を空＋TODOコメントで用意、素材到着後に追記のみで反映。✅
- **PDFモーダル共通化**：Task 2 で `PdfPreview`、Task 3 で `PdfDocCard`。sudachi 本体は不変（DRY整理は将来）。✅

**Placeholder スキャン**：本計画内の「準備中」「TODO(河原さん)」は、実コンテンツ未確定という仕様上の意図的な空状態であり、計画自体の未完ではない（全タスクは空状態で完結・検証可能）。

**型整合**：`PdfDoc`（Task1）を `PdfDocCard`（Task3）・library/seminars（Task4/5）で一貫使用。`tools`/`ToolIntro` を Task6 で使用。プロパティ名（title/file/cover/meta/note、name/tagline/forWhom/body/links）一致。✅
