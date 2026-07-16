# HANDOVER — 2026-07-16（教えてAIさん公開 ＋ つたえるカード開発）

> 次回開始時はこのファイルを最初に読み込んでから作業を再開してください。
> ※ 旧版（2026-05-22・サイト全面リニューアル期）の内容は git 履歴参照。サイトは公開運用中（nponest.com）。
>
> **このセッションは2系統が並走しています。**
> 1. **教えてAIさん記事ストリーム**（main、公開運用中）— 以下「現在地」以降。
> 2. **つたえるカード PWA 開発**（`feature/tsutaeru-app` ブランチ、**未マージ**）— 直後の専用セクション。

## 再開コマンド（コピペで動く）

```bash
cd /Users/k-kawahara/Projects/nest-webpage
npm run dev        # → http://localhost:4321
npm run build      # 本番ビルド（dist/）
npm run preview    # ビルド結果プレビュー
# デプロイ: main へ push すると Cloudflare Workers が自動反映（約1〜2分）
```

---

# つたえるカード PWA（`feature/tsutaeru-app`・未マージ）

言葉での意思表示が難しい方が、絵カードを2タップ（1タップ目=選択、2タップ目=確定）で選んで
「きもち・こまった・おねがい」等を伝えるための、完全ローカル動作の PWA。写真も履歴も端末内のみ。

## 現在地

- **Task 1〜16 まですべて完了**（`feature/tsutaeru-app` ブランチ）。**main へは未マージ**（下記「公開ゲート」が河原さんの判断待ち）。
- コード: `src/apps/tsutaeru/`（ロジック）＋ `src/pages/apps/tsutaeru/index.astro`（画面・CSS）＋ `public/apps/tsutaeru/`（manifest / sw.js / アイコン / art SVG 85本）。
- 案内ページ: `src/pages/apps/index.astro`（Task 15）。
- テスト: `tests/tsutaeru/*.test.ts`（vitest・単体）＋ `tests/tsutaeru/smoke.spec.ts`（Playwright・本番ビルド相手のE2E 5シナリオ、Task 16）。
- 参照ドキュメント:
  - 設計スペック: `docs/superpowers/specs/2026-07-16-tsutaeru-choice-app-design.md`
  - 作業計画: `docs/superpowers/plans/2026-07-16-tsutaeru-app.md`
  - 進捗ログ（Task 1〜16 の逐次記録）: `.superpowers/sdd/progress.md` ＋ `.superpowers/sdd/task-*-report.md`
    — **注意: `.superpowers/` は gitignore 対象のスクラッチ**（コミットされない作業ノート。参照はローカルのみ）。

## ローカルで動かす・テストする

```bash
cd /Users/k-kawahara/Projects/nest-webpage
git switch feature/tsutaeru-app

# 開発サーバで画面を触る
npm run dev            # → http://localhost:4321/apps/tsutaeru/

# 単体テスト（全体で126・つたえるは tests/tsutaeru/*.test.ts）
npx vitest run

# スモークE2E（本番ビルド相手・必ず build を先に）
npm run build
npx playwright test --config tests/tsutaeru/playwright.config.ts
```

スモークは dist/client を素の Node 静的サーバ（:5099、spec の beforeAll で起動/afterAll で停止）で配信し、
mobile 390×844 で ①home表示 ②きもち完走→result ③履歴1件 ④コピー文面 ⑤ふりかえり分岐 を検証する。
（`astro preview` は本環境では dev サーバを返すため E2E の対象にしない — Task 14 の教訓。）

## 公開ゲート（河原さんの判断待ち）

- [ ] **① 実機チェックリスト**（iPhone Safari / Android Chrome の両方で）:
  - ホーム画面に追加 → **機内モードで起動**してオフライン動作を確認
  - **本人モード（kiosk）解除の 3 秒長押し**が効くこと（誤操作で抜けないこと）
  - **OS の文字サイズを最大**にしてレイアウトが崩れず操作できること
  - **読み上げ**（Web Speech / 日本語音声）が鳴ること・鳴らない端末でも無音で正常動作すること
- [ ] **② アプリ名の確定**（現在は仮称「つたえるカード」）→ 確定後、`manifest.webmanifest` の `name` / `short_name`、案内ページ、アプリヘッダー（index.astro の `app-title` / `apple-mobile-web-app-title`）を更新
- [ ] **③ サイトナビからのリンク位置**（トップ／メニューのどこから `/apps/` または `/apps/tsutaeru/` へ導線を張るか）
- [ ] **④ main へマージ → 自動デプロイ**（マージは河原さんの判断後。実装エージェントは行わない）

## 運用の罠（つたえるカード）

- **⚠️ Service Worker の `VERSION` 定数バンプ**: `public/apps/tsutaeru/sw.js` の `VERSION` を、
  **アプリに影響するデプロイのたびに手で上げること**。上げ忘れると、
  **一度ホーム画面に追加したオフライン利用者は旧バージョンのまま更新されない**（activate で旧キャッシュを破棄する設計のため、
  VERSION が変わって初めて新シェル／新バンドルを取り込む）。オンライン閲覧者は常に最新なので、この取りこぼしは気づきにくい。

---

## 現在地

- 目標: 連載「AIに道具を持たせる」（全5回・中級者編）の執筆・公開 → **完結**
- 進捗:
  - [x] Phase 0 共通基盤（qa話者バリエーション・`.ai-answer`・連載ナビ・テーブルCSS・`.series-pager`）— `5df81d5`
  - [x] Phase 1〜5 全5記事執筆（`src/content/ai-tips/2026-07-13-ai-tools-1〜5-*.md`）
  - [x] Phase 6 **全5回一挙公開（河原さん指示）**＋各回末尾の1〜5番号ページャー（**河原さん指示**）— `9238bf2`
  - [x] 見本記事削除・一覧ソートの同日タイブレーク追加 — `5411ac8`
  - [x] 本番URL全5本・挿絵SVG・一覧の並びを確認済み
  - [x] **番外編「ブラウザにAIが“住み込み”で働く ― Claude in Chrome」を執筆・公開（2026-07-14）**。企画書 `docs/superpowers/specs/2026-07-14-claude-in-chrome-article-plan.md`。第2回「身近な第一歩」節末尾に関連記事リンクを追記。連載ナビ・ページャーには加えていない（企画どおり）
  - [x] **番外編第2弾「AIと“申し送りノート”を持つ ― 共有フォルダ」を改稿・画像実装（2026-07-16、draft: true のまま）**。指示書＋設計メモ `docs/planning/2026-07-16-ai-shared-workspace-article-spec.md` §6。スクショ加工 webp 5点＋図解 SVG 2点（`ai-workspace-*`）。原本PNGと加工中間物は `media-src/ai-shared-workspace/`（gitignore対象）。build成功・preview目視・リンク疎通・太字残骸ゼロ確認済み
  - [x] **指示書#2: 同記事に節「GeminiやChatGPTでも、できるの？」を追加（2026-07-16）**。一次情報での再検証結果と設計判断は `docs/planning/2026-07-16-ai-shared-workspace-part2-other-ais-spec.md` §7。比較図 `ai-workspace-three-shelves.svg` 追加。要点: ChatGPT=公式にMCPサーバー設定UI（OS別断定は回避）／Gemini=ドライブ連携は**読み取り専用**と公式明記→「読むのはAI・書くのは人間」と正直に記述
- 詳細な進捗表: `docs/superpowers/plans/2026-07-13-ai-tips-series.md` §5
- 設計書・作業指示書・reviewスクショは**河原さんの明示指示（2026-07-13）で公開リポジトリにコミット済み**（9829c67。設計書にAI会話ログ全文と内部ツール名が含まれる点は河原さん認識済み）

## グレーな判断（報告済み・河原さんから異議なし）

- 第2回「身近な第一歩」: 特定アプリの画面手順に踏み込まず一般的に記述（スクショなし。UI変化で古びない形）
- 第5回デモ出力: 実在事業所名を出さず**完全架空化**（本文に架空である旨を明記）
- 第3回「nestでの実装例」callout: 実名は wamnet-provider-sync / Neo4j の2つのみの控えめな記述
- 種明かしふきだしの「河原さん」名指し回避は**河原さんの明示指示**（グレーではない・記録）
- 番外編（2026-07-14）: 執筆時の裏取りで **ChatGPT Atlas の提供終了発表（2026-07-10、終了は2026-08-09予定）** を検出。企画書§6の下調べ（「Atlasという専用ブラウザ」）と異なるため、本文は「Atlasを終了しChatGPTアプリ内蔵ブラウザへ移行」と記述し、`ai-chrome-three-ways.svg` の文言を「専用ブラウザ（Atlas）」→「専用ブラウザ・アプリ内蔵」に微修正（構図は不変）
- 番外編スクショ3枚: ブックマークバーの映り込みは**トリミングでなく背景色マスク**で処理して webp 化（原本PNGは `media-src/claude-in-chrome/` に配置。media-src は gitignore 対象）。ブラウザ画面が横長のため `mockup--shot mockup--wide` の複合クラスを初使用（CSS変更なし・既存定義の組み合わせ）

- 共有フォルダ記事（2026-07-16）: 指示書の前提「config.json直接追記が必要」に対し、実スクショ5枚は**コネクタUIルート**（設定→コネクタ→追加→コネクタを参照→file検索→Filesystem）の記録だった。河原さん承認の上で**案1（コネクタUI主役）**に改稿し、config.jsonコピペはQA部品の補足に降格。PII対応：メールアドレス・アカウント名・カスタム指示本文・既存コネクタ一覧はすべて**トリミングで除去**（設計メモ§6-1に台帳）

## 未決論点

- **共有フォルダ記事は 2026-07-16 公開済み**（河原さん指示「現状で公開してよい」）。フォルダ指定ステップは実スクショの代わりに**イメージ図SVG**（`ai-workspace-pick-folder.svg`、キャプションに「イメージ図」と明記。canvas-screen.svg 等と同じ流儀）で対応。接続確認ステップは文章のみ。今後、河原さんから実スクショの提供があればイメージ図の差し替えを検討（任意）。「フォルダを指定する場面があります」の一文は実機スクショでは未確認のまま（イメージ図明記で吸収）

- アイキャッチ（frontmatter `image`）の要否（設計書 §7-5、既存記事は未使用が多い）
- `scripts/create-nest-inquiry-form.gs` の「性についての問題」追加は**引き続きコミット保留**（2026-07-09からの持ち越し。反映には公開中Googleフォーム本体の手動編集が別途必要）
- `.mcp.json` が untracked のまま（意図確認未了。触らない）

## 既知の罠・注意

- **Markdownの太字 `**…**` は境界がCJK括弧・引用符（「」（）“”）に接すると解釈されない**（CommonMarkのflanking規則）。太字の内側は文字で始め文字で終える。公開前に `grep -o '\*\*' dist/client/...` で生き残りを検査すると確実
- `draft: true` の記事は dev サーバーでも表示されない（`getStaticPaths` と一覧の両方で除外）。表示確認は一時的に `draft: false` にして戻す
- Playwright の fullPage スクショは lazy-load 画像（SVG挿絵）が空白に写ることがある。要素までスクロールしてviewport撮影で確認
- 稀に `.git/index.lock` が0バイトで残留してgit操作が失敗する（プロセス不在を確認して手動削除でOK）
- **つたえるカードのスモークE2Eは「本番ビルドの静的配信（dist/client）」を対象にすること**。`astro preview` は本環境では dev サーバを返し `/_astro/` ハッシュ資産を持たないため、SW/オフライン挙動が本番とずれる。専用 config（`tests/tsutaeru/playwright.config.ts`）が spec 内で静的サーバを起動する。`.spec.ts` / `.config.ts` は vitest の include（`*.test.ts`）に拾われない命名

## 教えてAIさん一覧の再構成（2026-07-16）

- 一覧を3ブロック化: 「まず読むなら、これ」（編集部ピック3本・`index.astro` 冒頭の `pickDefs` 配列で差し替え）／「連載でじっくり」（連載5本の番号付きボックス＋実践編バッジ2本）／「単発の便利ワザ」（従来リスト）
- スキーマに任意項目 `kind: series | practice` を追加（`src/content.config.ts`）。**未指定の新規記事は自動的に「単発」に入る**ので、通常の記事追加フローは従来どおり
- タグ＋絞り込みUIは30本超えたら検討（2026-07-16の相談で合意した方針）

## 次タスク（優先度順）

- B: 連載を読んだ反応を見て、第2回に実画面スクショを差し込むか判断（河原さん撮影の提供があれば `public/images/ai-tips/` に配置して差し替え）
- C: 旧サイト（Wix）への移転案内（2026-06-17からの持ち越しタスク）
