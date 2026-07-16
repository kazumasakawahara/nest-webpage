# つたえるカード（仮）PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 知的障害のある利用者が選択肢カードを指差して気持ち・体調・意思を伝えられるPWAを nponest.com/apps/tsutaeru/ に構築し、案内ページから配布する。

**Architecture:** 既存 Astro 静的サイトに同居する単一ページアプリ。純TSのモジュール群（データ層 store / 純関数 export / 状態機械 flow / DOM描画 ui）＋ localStorage・IndexedDB（端末内のみ）＋ 自前 Service Worker でオフライン起動。正典仕様: `docs/superpowers/specs/2026-07-16-tsutaeru-choice-app-design.md`。

**Tech Stack:** Astro（既存）/ 素のTypeScript（ランタイム新規依存ゼロ）/ Vitest（devDependencyのみ・追加前に socket depscore ≥0.8 確認）/ Playwright（スモーク）

## Global Constraints

- ランタイム依存の追加は**禁止**。devDependency は vitest（＋@vitest系）のみ許可
- 文言はひらがな中心・ですます調。カードのことばは仕様書§2の表を正典とする
- カードのタップ領域は最小 96px 角、フォントは本人向け画面で 20px 以上
- 配色は既存サイトのパレット（global.css の --color-*）を再利用
- 逃げ道カード「どれもちがう」「わからない」は escape=true の問いに常に自動付与（id `_none` / `_unknown`）
- 個人情報: 名前入力欄を作らない。めじるし欄には「ほんみょうは かかないでください」を必ず併記
- 外部送信・アカウント・解析なし。fetch はアプリ資産の取得のみ
- 作業ブランチ `feature/tsutaeru-app`。main へのマージは河原さんの公開判断後（案内ページからのリンクも同時）
- コミットは `feat(tsutaeru): ...` / `test(tsutaeru): ...` 等の conventional commits・英語

## File Structure

```
src/apps/tsutaeru/
  types.ts        型定義（Card/Question/Theme/HistoryEntry/Settings/Session）
  presets.ts      プリセット7テーマの正典データ（仕様§2を反映）
  store.ts        localStorage 永続化（themes/history/settings、マージと初期化）
  export.ts       履歴→支援記録用テキストの純関数
  flow.ts         セッション状態機械（2段階タップ・分岐・逃げ道・シャッフル）
  speech.ts       Web Speech API ラッパ
  photos.ts       IndexedDB 写真ストア
  ui/screens.ts   画面描画（home/cards/result/history/settings/editor）
  app.ts          起動・画面遷移・本人モード
src/pages/apps/tsutaeru/index.astro   アプリシェル（app.ts を読み込む）
src/pages/apps/index.astro            案内ページ（QR・追加手順・注意）
public/apps/tsutaeru/
  manifest.webmanifest  sw.js  icons/  art/*.svg（絵ライブラリ）
tests/tsutaeru/*.test.ts              vitest 単体
tests/tsutaeru/smoke.spec.ts          Playwright スモーク
```

---

### Task 1: ブランチ作成とアプリシェル

**Files:** Create: `src/pages/apps/tsutaeru/index.astro`, `src/apps/tsutaeru/app.ts`
**Interfaces:** Produces: `#app` ルート要素、`initApp(root: HTMLElement): void`

- [ ] `git switch -c feature/tsutaeru-app`
- [ ] `index.astro`: BaseLayout を使わず素の HTML シェル（`<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`、`<div id="app"></div>`、`<script>import { initApp } from '../../../apps/tsutaeru/app'; initApp(document.getElementById('app')!)</script>`）。`initApp` は仮に「つたえるカード じゅんびちゅう」を描画
- [ ] `npm run build` が通り `dist/client/apps/tsutaeru/index.html` が生成されることを確認
- [ ] Commit: `feat(tsutaeru): scaffold app shell page`

### Task 2: 型とプリセットデータ（＋vitest導入）

**Files:** Create: `src/apps/tsutaeru/types.ts`, `src/apps/tsutaeru/presets.ts`, `tests/tsutaeru/presets.test.ts`; Modify: `package.json`
**Interfaces:** Produces:

```ts
// types.ts（全文）
export interface Card {
  id: string; label: string; speech?: string;
  art?: string; photoId?: string; next?: string; hidden?: boolean;
}
export interface Question {
  id: string; prompt: string; cards: Card[];
  enabled: boolean; escape: boolean; shuffle: boolean;
}
export type Display = 'text' | 'art' | 'photo';
export interface Theme {
  id: string; title: string; icon: string; questions: Question[];
  display: Display; builtin: boolean; hidden?: boolean;
}
export interface Pick { questionId: string; cardId: string; label: string }
export interface HistoryEntry {
  id: string; at: string; themeId: string; themeTitle: string;
  picks: Pick[]; mark?: string;
}
export interface Settings { speech: boolean }
```

- [ ] socket depscore で `vitest` を確認（≥0.8）→ `npm i -D vitest`
- [ ] `presets.ts`: 仕様§2の7テーマを `export const PRESET_THEMES: Theme[]` として全カード実装。要点:
  - きもち `emotion`: 問1 `emo-which`（うれしい/たのしい/おこってる/かなしい/こわい/つかれた、escape）→ 問2 `emo-strength`（すこし/とても、escapeなし）
  - こまった `trouble`・いやだった `dislike`・はい・いいえ `yesno`・おねがい `request`: 各1問（カードは仕様の表のとおり。yesno は escape=false・シャッフルなし——「はい・いいえ・わからない・どっちもいや」自体が正典4枚）
  - ふりかえり `review`: 問1 `rev-day`（たのしかった/ふつう/いやだった）→ 問2 `rev-what`（しごと/ごはん/おやつ/おでかけ/ひと/からだのこと）→ 「からだのこと」カードに `next:'rev-body'`、問3 `rev-body`（ねむれなかった/あたまがいたい/おなかがいたい/つかれている/ムカムカする、enabled=true だが到達は分岐時のみ＝`branchOnly:true` は作らず、queue には enabled な問いのみ並べ、`next` 指定時に挿入する仕様を flow 側で持つため、`rev-body` は `enabled:false` で定義（分岐からのみ到達）
  - からだ `body`: 問0 `body-where`（あたま/おなか/むね/のど/は/うで/あし、**enabled:false**＝デフォルトOFF）→ 問1 `body-how`（ズキズキ/キリキリ/チクチク/ガンガン/ヒリヒリ/ドーンとおもい/ムカムカ/うまくいえない）→ 問2 `body-since`（きょう/きのう/すこしまえ/ずっとまえ）→ 問3 `body-strength`（すこし/とても）
  - art id は `<テーマ略>-<ローマ字>`（例 `emo-ureshii`, `pain-zukizuki`）。全カードに付与
- [ ] `presets.test.ts`: ①テーマ7本 ②id 重複なし ③`next` の参照先が同テーマ内に存在 ④全カードに art がある、を検証 → `npx vitest run` PASS
- [ ] Commit: `feat(tsutaeru): add types and preset theme data`

### Task 3: store（永続化）

**Files:** Create: `src/apps/tsutaeru/store.ts`, `tests/tsutaeru/store.test.ts`
**Interfaces:** Produces:

```ts
export function loadThemes(): Theme[]            // 保存済みがなければ structuredClone(PRESET_THEMES)
export function saveThemes(t: Theme[]): void
export function addHistory(e: HistoryEntry): void
export function listHistory(): HistoryEntry[]    // 新しい順
export function deleteHistory(id: string): void
export function clearHistory(): void
export function loadSettings(): Settings         // 既定 { speech: true }
export function saveSettings(s: Settings): void
export function resetAll(): void                 // 全キー削除
```

- [ ] キーは `tsutaeru.themes.v1` / `tsutaeru.history.v1` / `tsutaeru.settings.v1`。JSON破損時は既定値に戻す（try/catch）
- [ ] テスト（vitest、localStorage は happy-dom か手製モック）: 保存→再読込の往復、破損JSONで既定値、履歴の並び順、resetAll → PASS
- [ ] Commit: `feat(tsutaeru): add localStorage store`

### Task 4: export（書き出し純関数）

**Files:** Create: `src/apps/tsutaeru/export.ts`, `tests/tsutaeru/export.test.ts`
**Interfaces:** Produces:

```ts
export function formatEntry(e: HistoryEntry): string
// => "2026/07/16 14:03 きもち → おこってる → とても"（picks を「 → 」連結。mark があれば行頭に「[め] 」）
export function formatEntries(list: HistoryEntry[]): string
// => 日付見出し（■ 2026/07/16）＋各行、日付の新しい順
```

- [ ] テスト: 単一/複数日/めじるし付き/空リスト（`きろくは まだありません`）→ PASS
- [ ] Commit: `feat(tsutaeru): add history text export`

### Task 5: flow（セッション状態機械）

**Files:** Create: `src/apps/tsutaeru/flow.ts`, `tests/tsutaeru/flow.test.ts`
**Interfaces:** Produces:

```ts
export interface Session {
  theme: Theme; queue: Question[]; index: number;
  picks: Pick[]; pending: Card | null; done: boolean;
}
export function createSession(theme: Theme, rng?: () => number): Session
// queue = enabled な問いのみ。shuffle=true の問いはカードを rng で並べ替え、escape=true なら
// 末尾に どれもちがう(_none)/わからない(_unknown) を付与（この2枚は常に末尾固定）
export function tap(s: Session, cardId: string): Session
// 1度目: pending にセット / 同じカード2度目: 確定（picks に追加し次の問いへ）/ 別カード: pending 差し替え
// 確定時 card.next があればその questionId の問いを queue の直後に挿入（enabled:false でも可）
// 最後の問いを確定したら done=true
export function currentQuestion(s: Session): Question | null
```

- [ ] テスト: 2段階タップ（1回目は確定しない）/ pending差し替え / next分岐（review で「からだのこと」→ rev-body が挟まる）/ body-where が queue に入らない / escape 2枚が末尾 / rng固定でシャッフル再現 / done 遷移 → PASS
- [ ] Commit: `feat(tsutaeru): add session flow engine`

### Task 6: 本人向け画面（home / cards / result）

**Files:** Create: `src/apps/tsutaeru/ui/screens.ts`; Modify: `src/apps/tsutaeru/app.ts`, `src/pages/apps/tsutaeru/index.astro`（`<style>` にアプリCSS）
**Interfaces:** Consumes: store/flow/presets。Produces: `renderHome/renderCards/renderResult(root, ctx)`（ctx にコールバック）

- [ ] home: テーマの大ボタン一覧（icon絵＋題。hidden除く）。右上に小さな歯車（Task 8 で接続）
- [ ] cards: 上部に prompt、カードは2列グリッド（`min-height:96px`、絵＋ことば。display 設定で text/art/photo 切替）。タップで選択枠（terra色4px）＋読み上げ、**同カード再タップで確定**。戻る矢印（1問目では home へ）
- [ ] result: picks のカードを横並びで大表示＋「もういちど」「ホームへ」。確定時に addHistory
- [ ] CSS: 既存パレット変数・ふところ広め・アニメは opacity 0.15s のみ
- [ ] 手動確認: `npm run dev` → きもちテーマを最後まで → 履歴が localStorage に入る（DevTools確認）
- [ ] Commit: `feat(tsutaeru): person-facing screens (home/cards/result)`

### Task 7: 本人モードと読み上げ

**Files:** Create: `src/apps/tsutaeru/speech.ts`; Modify: `ui/screens.ts`, `app.ts`
**Interfaces:** Produces: `speak(text: string): void`（speechSynthesis・ja-JP・cancel後に発話。settings.speech=false なら無音）

- [ ] 本人モード: home のトグルでON。ON中は歯車・戻る導線を隠し、解除は**画面任意点の3秒長押し**（`pointerdown`→タイマー、移動で解除）。状態はメモリのみ（再読込で解除）
- [ ] 手動確認: ON中に設定へ到達できない／長押しで解除トースト
- [ ] Commit: `feat(tsutaeru): kiosk mode and speech`

### Task 8: 履歴画面と書き出し

**Files:** Modify: `ui/screens.ts`, `app.ts`
**Interfaces:** Consumes: listHistory/deleteHistory/clearHistory/formatEntries

- [ ] 歯車 → 支援者ゾーン（タブ: りれき／へんしゅう／せってい）。りれき: 日別一覧、行スワイプなしの明示削除ボタン、全削除（確認2段階）、期間フィルタ（きょう/7日/ぜんぶ）
- [ ] 「コピーする」→ `navigator.clipboard.writeText(formatEntries(絞り込み結果))` → トースト「コピーしました」
- [ ] めじるし: セッション確定時ではなく履歴行の編集で付与（1行input、そばに「ほんみょうは かかないでください」）
- [ ] Commit: `feat(tsutaeru): history screen with text export`

### Task 9: 編集画面（テーマ・カード）

**Files:** Modify: `ui/screens.ts`, `app.ts`
**Interfaces:** Consumes: loadThemes/saveThemes

- [ ] テーマ一覧: 表示/非表示・並び替え（上下ボタン）・display（text/art/photo）切替・問いのON/OFF（body-where 等）・escape/shuffle トグル・「あたらしいテーマ」（1問のカスタムテーマ生成）
- [ ] カード編集: ことば・よみあげ文の変更、非表示、並び替え、追加（絵は内蔵ライブラリからピッカー選択）。プリセットの編集も可（builtin は「もとにもどす」でプリセット復元）
- [ ] Commit: `feat(tsutaeru): supporter editor for themes and cards`

### Task 10: 写真カード（IndexedDB）

**Files:** Create: `src/apps/tsutaeru/photos.ts`, `tests/tsutaeru/photos.test.ts`; Modify: `ui/screens.ts`
**Interfaces:** Produces: `savePhoto(blob: Blob): Promise<string>` / `getPhotoURL(id): Promise<string|null>`（objectURLキャッシュ）/ `deletePhoto(id)`

- [ ] カード編集に「しゃしん」（`<input type="file" accept="image/*" capture="environment">`）。保存時に canvas で長辺 800px に縮小して IndexedDB（DB `tsutaeru`, store `photos`）へ
- [ ] photos.test.ts は fake-indexeddb を使わず、縮小ロジック（純関数 `fitSize(w,h,max)`）のみ単体検証
- [ ] Commit: `feat(tsutaeru): local photo cards`

### Task 11〜13: 絵ライブラリSVG（3便に分割）

**Files:** Create: `public/apps/tsutaeru/art/<id>.svg`（全カード＋テーマアイコン＋逃げ道2枚＋汎用約10）
**スタイル契約（3タスク共通・厳守）:**
- viewBox `0 0 120 120`、ファイル 1〜3KB、`role="img"` と日本語 `aria-label`
- サイトの挿絵と同トーン: `#efe9dd`地・線 `#5f5847` 2.5px・アクセント `#d97757`/`#4a8c3f`/`#ffd15c`、角丸・手描き風のやわらかい形
- 高コントラスト・要素は1モチーフ主義（細部を削る）。表情は口と眉で明確に
- 感情・感覚は仕様§2のたとえ絵（ズキズキ=脈打つ波、キリキリ=ぞうきんねじり…）を正典とする

- [ ] Task 11: きもち6＋つよさ2＋逃げ道2＋テーマアイコン7 ＝ 17枚 → Commit
- [ ] Task 12: こまった8＋いやだった6＋おねがい6＋はい・いいえ4＋ふりかえり(問1)3 ＝ 27枚 → Commit
- [ ] Task 13: ふりかえり(問2)6＋からだのようす5＋オノマトペ8＋いつから4＋どこが7＋汎用10 ＝ 40枚 → Commit
- [ ] 各便の受入: ブラウザで一覧表示し、120px縮小でも判別できること（レビューは指揮者が実施）

### Task 14: PWA化（manifest / Service Worker / アイコン）

**Files:** Create: `public/apps/tsutaeru/manifest.webmanifest`, `public/apps/tsutaeru/sw.js`, `public/apps/tsutaeru/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`; Modify: `index.astro`（link/meta・SW登録）

- [ ] manifest: `name/short_name`（仮称のまま可・未決）、`start_url:"/apps/tsutaeru/"`, `scope:"/apps/tsutaeru/"`, `display:"standalone"`, 背景/テーマ色はサイトの緑
- [ ] sw.js: バージョン定数付きプリキャッシュ（シェル・JS・art全SVG・manifest）＋ cache-first / ナビゲーションは network-first fallback cache。`skipWaiting`+`clients.claim`
- [ ] 検証: `npm run preview` → Chrome DevTools で installability 合格、offline チェックで再読込成功
- [ ] Commit: `feat(tsutaeru): PWA manifest and service worker`

### Task 15: 案内ページ

**Files:** Create: `src/pages/apps/index.astro`, `public/images/apps/tsutaeru-qr.svg`（QRは `https://www.nponest.com/apps/tsutaeru/` を指す。生成は`qrencode`CLIか手元スクリプトで、依存追加なし）

- [ ] 構成: アプリ紹介（意思決定支援の文脈）→ QR＋URL → iPhone/Android の「ホーム画面に追加」図解（教えてAIさんのトーン・図は簡易SVG可）→ 支援者向け注意（同意・個人情報・アクセスガイド・めじるし運用）→ 既製AACアプリの併記
- [ ] サイトナビへのリンクは**張らない**（公開判断時に河原さんと決める＝未決）
- [ ] Commit: `feat(tsutaeru): distribution guide page`

### Task 16: スモークテストと公開ゲート

**Files:** Create: `tests/tsutaeru/smoke.spec.ts`、Modify: `HANDOVER.md`

- [ ] Playwright（既存のローカルCLI）: preview に対し ①home表示 ②きもち完走→result ③履歴に1件④コピー文面 ⑤ふりかえり分岐 の5シナリオ
- [ ] 実機チェックリストを HANDOVER に記載（iPhone Safari/Android Chrome: ホーム画面追加→機内モード起動、本人モード解除、文字サイズ最大、読み上げ）
- [ ] 全 vitest/Playwright green → 河原さんへ実機確認依頼 → **公開判断（アプリ名確定・ナビ位置）→ main へマージ・push**
- [ ] Commit/merge は判断後

## Self-Review 記録

- 仕様§2〜8の全要件にタスク対応あり（§7案内=15、§8テスト=16、写真=10、本人モード=7…）
- プレースホルダなし（カード全文はプリセット正典 presets.ts に集約、絵はスタイル契約＋枚数明細）
- 型・関数名はタスク間で一致（Session/tap/formatEntries 等、Interfaces 欄で固定）
- 実行は subagent-driven（奏者=Opus 4.8、レビュー=指揮者）
