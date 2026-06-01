# グループホームページ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ナビにある `/group-home/` の「準備中」スタブを、nest のグループホーム運営理念（施設ではなく町内に点在する賃貸住宅で地域生活を支える）を案内程度に伝える本ページに置き換える。

**Architecture:** 単一の Astro ページ（`src/pages/group-home.astro`）を、既存コンポーネント（`BaseLayout` / `Hero` / `CtaBlock`）とグローバルCSSクラス（`.section` / `.section--sand` / `.container--narrow` / `.eyebrow` / `.section__title` / `.grid-3` / `.card` / `.reveal`）のみで構成する。**新規CSSは書かない。** 個人情報（住所・個別拠点名・氏名・定員）は一切載せない。

**Tech Stack:** Astro v6（SSR / Cloudflare adapter）、グローバルCSSカスタムプロパティ。ページに対する自動テストフレームワークは本プロジェクトに無いため、検証は `npm run build` の成功・出力HTMLの grep・目視で行う。

仕様: `docs/superpowers/specs/2026-05-29-group-home-page-design.md`

---

### Task 1: group-home.astro を本ページに置き換える

**Files:**
- Modify（全置換）: `src/pages/group-home.astro`（現状は準備中スタブ。git 未追跡）

参照（編集しない、流用元の確認用）:
- `src/components/Hero.astro` — props: `eyebrow, title, titleSub, lead, size, image, placeholderLabel`
- `src/components/CtaBlock.astro` — props: `title, body?, primary?, secondary?, showTel?, variant?`
- `src/styles/global.css` — `.grid-3`（880px 以下で1カラムに自動折返し）/ `.card` / `.card__title` / `.card__text`

- [ ] **Step 1: ページを以下の内容で全置換する**

`src/pages/group-home.astro` の全内容を次に置き換える:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import CtaBlock from '../components/CtaBlock.astro';

const steps = [
  {
    name: 'STATION',
    body: '世話人が常駐する拠点です。手厚い支援を受けながら、暮らしの基盤をつくります。',
  },
  {
    name: 'BRANCH',
    body: 'STATION の近くにある居室です。サポートを受けつつ、少しずつ自分のペースで暮らします。',
  },
  {
    name: 'SATELLITE',
    body: 'より一人暮らしに近い住まいです。自立した生活を見据えて、その人らしく過ごします。',
  },
];
---

<BaseLayout
  title="グループホーム"
  description="NPO法人nestのグループホームは、町内に点在する賃貸住宅の居室で、利用者が地域の一員として暮らすことを支えています。"
>
  <Hero
    eyebrow="Group Home"
    title="グループホーム"
    lead="地域で暮らす、を支える住まい"
    size="md"
    placeholderLabel="GROUP HOME"
  />

  <!-- ===== 理念（主役） ===== -->
  <section class="section">
    <div class="container container--narrow reveal">
      <span class="eyebrow">Our Approach</span>
      <h2 class="section__title">施設ではなく、地域の暮らしの中で</h2>
      <p style="font-size:16px; line-height:2; color:var(--color-ink); margin-bottom:var(--space-5);">
        nest のグループホームは、ひとつの施設に利用者を集めて運営するものではありません。
        わたしたちは、町内に点在する賃貸マンションの居室を法人で借り上げ、
        そのひと部屋ひと部屋を利用者の住まいとしています。
      </p>
      <p style="font-size:16px; line-height:2; color:var(--color-ink); margin-bottom:var(--space-5);">
        だからこそ、利用者は特別な場所に隔離されることなく、ご近所との何気ない挨拶や、
        近くのお店での買い物といった、当たり前の地域の暮らしの中で日々を送ることができます。
        「本人が地域で暮らす」——それが、わたしたち nest の願いです。
      </p>
      <p style="font-size:16px; line-height:2; color:var(--color-ink);">
        また、利用者の中には強いこだわりを持つ方も少なくありません。
        大人数での集団生活がむずかしい方も、分散した住まいであれば、
        一人ひとりの個性とペースを尊重しながら、その人らしい暮らしを支えることができます。
      </p>
    </div>
  </section>

  <!-- ===== 住まいの段階（概念） ===== -->
  <section class="section section--sand">
    <div class="container">
      <div class="reveal" style="text-align:center; margin-bottom:var(--space-7);">
        <span class="eyebrow eyebrow--center">Three Steps</span>
        <h2 class="section__title section__title--center">自立度に応じた、3つの住まい方</h2>
      </div>

      <div class="grid-3">
        {
          steps.map((s, i) => (
            <article class="card reveal" data-delay={(i % 3) + 1}>
              <h3 class="card__title">{s.name}</h3>
              <p class="card__text">{s.body}</p>
            </article>
          ))
        }
      </div>

      <p class="reveal" style="text-align:center; margin-top:var(--space-6); font-size:14px; color:var(--color-ink-mute);">
        現在、町内に <strong style="color:var(--color-green-900);">12の住まい</strong> を運営しています。
      </p>
    </div>
  </section>

  <!-- ===== 問い合わせ動線 ===== -->
  <section class="section">
    <div class="container">
      <CtaBlock
        title="見学・ご相談について"
        body="ご利用の検討・見学は個別にご対応します。お気軽にお問い合わせください。"
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
Expected: エラーなく完了し、`dist/` に出力される（`/group-home/` ルートが生成される）。

- [ ] **Step 3: プライバシー方針（住所・個別拠点名・氏名が無い）を確認する**

Run: `grep -nE "原町|弁天|木町|STATION／|丁目|〒|定員|番地" src/pages/group-home.astro`
Expected: 何もマッチしない（出力ゼロ）。STATION/BRANCH/SATELLITE という概念名のみで、地域名・個別拠点名・住所・定員が含まれていないこと。
（注: 概念カードの "STATION" 等の英語名は `STATION／` のような区切り付き拠点名表記ではないためマッチしない。）

- [ ] **Step 4: 「準備中」表記が消えたことを確認する**

Run: `grep -n "準備中" src/pages/group-home.astro`
Expected: 何もマッチしない（出力ゼロ）。

- [ ] **Step 5: コミットする**

```bash
git add src/pages/group-home.astro
git commit -m "feat(group-home): publish group-home page emphasizing community-based living

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

- **Spec coverage:** §3-1 ヒーロー → Hero ブロック ✓ / §3-2 理念ブロック（3段落・こだわり配慮含む）→ 理念 section ✓ / §3-3 住まいの段階＋「12の住まい」→ grid-3/card ＋ 末尾文 ✓ / §3-4 問い合わせ → CtaBlock ✓ / §2 プライバシー → Step 3 で grep 検証 ✓ / §6 検証（build・grep・準備中除去）→ Step 2-4 ✓。
- **Placeholder scan:** TODO/TBD なし。全ステップに実コードまたは実コマンドと期待値を記載。
- **Type consistency:** Hero/CtaBlock の prop 名は各コンポーネント定義（`eyebrow/title/lead/size/placeholderLabel`、`title/body/primary/secondary/variant`）と一致。`.grid-3`/`.card`/`.card__title`/`.card__text` はグローバル定義済みクラス。新規CSSなし。
- **注記:** 本プロジェクトのページには自動テストが無いため、TDD のユニットテスト工程に代えて build＋grep による検証を採用している。
