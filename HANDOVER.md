# ⚠️ くらしサポート配布物の正是（2026-08-08 追記・全セッション必読）

**くらしサポートの配布物は `nest-support` ではなく `oya-inai-db` です。**
https://github.com/kazumasakawahara/oya-inai-db （2026-08-08 MIT で public 公開）

- nest-support は河原さんの本番環境（配布しない）。oya-inai-db はそのクリーンルーム切り出し版で、
  Claude Desktop 不要・AIなしでも中核機能が動く・AIは Ollama/Gemini/Claude の選択制（「無償の定義」）。
- post-parent の「くらしサポート」カードの GitHub リンク・マニュアルリンクは oya-inai-db 系に統一済み（2026-08-08）。
  **nest-support へのリンクを復活させないこと。**
- ~~残タスク: サイト内の導入マニュアル v2~~ → **完了（2026-08-08）**: `public/internal/oya-inai-db-hajimete-guide.html`
  （はじめてガイド v1.0・PDF版同梱）を新設し、カードのマニュアルボタンをここへ向けた。
  旧 `nest-support-manual.html` は旧スタック（Claude Desktop前提）の記録として残置（リンクは全て外し済み）。
  図解は簡易SVG。実機スクリーンショットへの差し替えは任意の改善タスク。

# HANDOVER — 2026-09-11 新特集「こんな風にお願いするといいよ」その1

> 河原さん発案の常設コーナー。**うまくいった頼み方を、そのときの文面と返ってきたものごと一つずつ棚に並べる**。その1は「図（HTMLが良い）」の一言で、パソコン版 Google ドライブの同期方式の説明が、ボタンで切り替わる一枚のページになった実例。依頼文は河原さんの原文、お手本 HTML は AI 出力を無加工で同梱。**PR #40 で main にマージ・本番反映確認済み（2026-09-11）。次はその2（B 研修クイズ）の実演から。候補は docs/ai-tips-kikaku-2026-09-11-onegai-ideas.md（A〜G＋締めの H「重なったら Skill に」）。**

## 再開コマンド（コピペで動く）

```bash
cd /Users/k-kawahara/Projects/nest-webpage/.claude/worktrees/amazing-liskov-5dc0a8
git status --short && git log --oneline -3
npm run build && npx vitest run   # 136件
```

## 現在地
- [x] `series: onegai` 追加（content.config.ts）、一覧の特集ブロック（🗣 NEW・既定オープン。kiroku は NEW 解除）、記事バッジ
- [x] 記事 `src/content/ai-tips/2026-09-11-onegai-1-html.md`（kind 未指定＝便利ワザ棚に残したまま特集に併載）
- [x] 看板 `public/images/ai-tips/onegai-1-ugoku-zu.svg`、カード用 `onegai-1-icon.svg`、お手本 `public/downloads/ai-tips/google-drive-desktop-sync.html`
- [x] ポケットにスキット「動く図の注文係」（型に穴を空けた依頼文つき）
- [x] build・vitest・dev 確認（作業ログ 2026-09-11 参照）
- [x] 河原さん承認 → push → PR #40 → マージ（8239cc7）→ 本番確認（同梱 HTML は 307→200 の拡張子落とし転送）
- [ ] その2：B 研修クイズを Claude（道具なし）で実演 → 無加工で同梱 → 執筆。題材は公開資料か架空のもの

## グレーな判断
- 「撮るだけじゃ、もったいない」の NEW を外した（公開翌日）。慣例「NEW は最新の特集1つ」に従ったが、両方 NEW に戻すのは一行の変更
- 記事の「出てきた HTML の開き方」で Claude の「アーティファクト」・Gemini の「Canvas」に触れた。名称・場所は時期で変わるため「見当たらなければ『プレビューで見せて』」と逃げ道を書いた
- お手本 HTML は Google Fonts（BIZ UDPGothic）を外部読み込みする。無加工方針のため残した

## 次の一つを足すとき
- 記事を `YYYY-MM-DD-onegai-N-<slug>.md` で作り `series: [onegai]` を付けるだけで箱に並ぶ（ファイル名順）。ポケットの skits にも1行

---

# HANDOVER — 2026-09-10 特集「撮るだけじゃ、もったいない」番外編「スマホは、放り込むだけ（仮）」

> 全3回が「スマホは放り込む場所、仕分けはパソコン」を前提にしながら、**スマホの Obsidian と PC の保管庫をどうつなぐかを「この特集では踏み込みません」と先送りしている**。河原さん「欠落しているので、分かりやすく、かつ、詳しく説明しなければ」。この穴を番外編 1 本で埋める。2026-09-10 に記事・図版・一覧・ナビまで執筆し、同日夜に **Android＋Mac で一段目の実機確認が通った**。発見を反映して draft を外し、**PR #36 で main にマージ・本番反映確認済み（2026-09-10 夜）**。番外編は公開済み。

## 再開コマンド（コピペで動く）

```bash
cd /Users/k-kawahara/Projects/nest-webpage/.claude/worktrees/smartphone-obsidian-9efbec
git status --short            # タスク.md・作業ログ.md・HANDOVER.md が未コミットのはず
git fetch origin && git log --oneline -3 origin/main
npm run build && npx vitest run   # 執筆後の確認（136件）
```

## 現在地
- 目標: 番外編 1 本（series: kiroku 併載、二段構え）＋図版 SVG 3 点＋一覧の番外編表示＋第1〜3回のナビ・リンク追記 → Android 実機確認を経て公開
- 進捗:
  - [x] 質問の趣旨の確定（スマホと PC の Obsidian の関係。記事化は「欠落を埋める」目的）
  - [x] Obsidian 公式ヘルプ「Sync your notes across devices」「Obsidian Sync / Security and privacy」・料金ページを 2026-09-09 に参照。要点は タスク.md の進行中の行と 作業ログ.md 同日エントリに集約
  - [x] **決定（河原さん「良いでしょうね」）**: 本線は **Google ドライブを「なんでも箱」にする**。Mac は「パソコン版 Google ドライブ」をミラーリング（実体を Mac に置く）にして保管庫または raw をドライブ内に置く。Android はドライブアプリの共有メニューから raw へ送る。**スマホに Obsidian は必須でない**（要るのは raw が Mac に届くこと）
  - [x] 併記の決定: Obsidian Sync（公式・有料・E2E 暗号化・DigitalOcean の中継サーバー、日本からはシンガポール見込み）は「確実にやりたい人へ」。Syncthing（雲を通さない）は注記。iCloud は iPhone＋Mac 向けに併記
  - [x] 不採用: AppSheet をデータベースにする案（.md も `[[ ]]` も失われ、Filesystem から見えず、読者にアプリ作りを求める）
  - [x] 記事 `src/content/ai-tips/2026-09-10-kiroku-ex-sumaho.md`（draft: true、series: [kiroku]）、図版 `public/images/ai-tips/kiroku-ex-{1-shashin,2-hitokoto,3-miru}.svg`、一覧 index.astro（`kiroku-ex-` は全N回に数えず「番」印で末尾）、第1〜3回の連載ナビに番外編の行、第1回・第2回の同期の言及をリンクに、ARTICLE-INVENTORY #58。build・vitest 136件 OK、dev で表示確認済み（2026-09-10）
  - [x] 実機確認メモ `docs/kiroku-demo/e6-android-checklist.md`（一段目 必須 1-1〜1-6／二段目 2-1〜2-8／罠の裏取り）
  - [x] 河原さんレビュー反映（2026-09-10）：「窓」→「フォルダを開くアプリ」（フォルダの木＋表）、Windows の callout、節「なぜ、スマホで完結させないのか」（編集室）、用語統一（雲→クラウド、一言→コメント、札→ショートカット、素の→そのもの）。「全体として、これで良い。進めて」。用語「コメント」は 2026-09-10 夜に第1〜3回もそろえた（AI への頼み方の「一言」と AI の返事の無加工部分は残す）
  - [x] **E6 実機確認・一段目（2026-09-10 夜）**：ミラーリング済（マイドライブ＝`~/GoogleDrive`）、`記録-test/raw` を Finder で作成、Android ドライブアプリ「＋→アップロード」で写真2枚が実体つきで到達、Obsidian と Claude Desktop（Filesystem）で確認。1-6 省略。結果は `docs/kiroku-demo/e6-android-checklist.md`
  - [x] 発見を記事に反映：手順4（ドライブアプリ内の「共有」は人への共有。「＋→アップロード」が正）、時間差の罠に「通信がないと止まる」、罠5「写真の中身は Filesystem の上限（1MB）で読めない→仕分けはコメントで決まる」、約束と二段目冒頭に「二段目は未確認」。draft: false
  - [ ] 二段目（同期アプリ＋Obsidian モバイル）と E5 は未実施。記事は手順を残し「未確認」と明記して公開する方針（河原さん「これで十分」）
  - [x] push → PR #36 → マージ（953c2f5）→ 本番確認（番外編・第1〜2回ナビ・一覧・SVG 3 点、すべて 200）

## グレーな判断
- タスク.md・作業ログ.md・メモリ（河原さんの端末 = Mac＋Android）は承認なしで記録した。コミットはしていない
- 番外編の題「スマホは、放り込むだけ ― なんでも箱を、スマホとパソコンでつなぐ（番外編）」は設計提示に含めて「進めて」を受けたが、題そのものの明示承認はない
- **本番の第1回・第2回の連載ナビに「（近日公開）」が残っていた**（第2回・第3回公開後に未更新）。番外編の行を足す同じリストなので、リンクに直した（承認外）
- 記事の「約束」に「Android と Mac の組み合わせは、公開前に筆者の実機で一度通した範囲だけを書きました」と書いた。**実機確認前に公開すると嘘になる**ので、draft 解除はチェックリスト通過後

## 未決論点
- Android で「一言」を打つ手段の本線。2026-09-10 の整理で **スマホの Obsidian は必須でない**と確定：必須は (1) スマホ内フォルダを雲とそろえる同期アプリ（Android のドライブアプリには Mac のパソコン版ドライブのようなフォルダ丸ごと同期の働きがない。FolderSync／Autosync 系）と (2) そのフォルダに .md を書けるアプリ（Obsidian モバイルが便利、素朴なメモ帳でも可）。Obsidian を入れる利点はノートと地図をスマホで見られること。撮った写真は DCIM に入るので raw へは共有メニューかノート貼りの一手が要る。説明図は artifact「スマホに Obsidian は要るのか」 https://claude.ai/code/artifact/5bfa8d64-cf1c-403c-912b-93b99390da86 （河原さん向けの解説。記事の図版ではない）
- 一覧ブロックの見せ方は実装済み（「全3回」＋4行目に「番」印）。河原さん未確認

## 既知の罠・注意
- **実体なしファイル**: パソコン版ドライブが「ストリーミング」だと raw の写真が雲マーク（プレースホルダ）のままで、Filesystem が中身を読めない。iCloud の「Mac ストレージを最適化」と同じ罠。記事の共通注意に入れる
- 反映の時間差（放り込んだ直後は箱に届いていない）、同じ保管庫を複数の同期サービスに載せない（公式が明記）、「同期は控え（バックアップ）ではない」（公式が繰り返し明記）
- 公式ヘルプは Google ドライブを「Android では機能制限あり」、iOS では非対応扱い。記事では公式の言い回しの範囲で書き、数字（料金）は参照日を添える
- 記事本文で「正直」を使わない（メモリ no-shoujiki-phrasing）

## 次タスク（優先度順）
- A: （済）公開完了。残るのは二段目（同期アプリ＋Obsidian モバイル）と E5 の実機確認。通ったら記事の「未確認」の文言を外す
- B: 試験用の `~/GoogleDrive/記録-test` は残置でよい（本番の保管庫ではない）。複製の「(1).jpg」は河原さんが消してよい
- C: 公開後、nest News に一行追記するか河原さん判断。第2回の録音 callout は番外編へのリンクで足りている

---

# HANDOVER — 2026-09-08 特集「撮るだけじゃ、もったいない」（Issue #24〜#27・Orca 進行）

> 教えてAIさんの新特集。**なんでも箱（Obsidian の raw）に放り込むだけ → AI が仕分けて `[[ ]]` の糸を張る → 最後は箱の中身から AI が旅行記を書く**、全3回（2026-09-09 に4回から再編。副題「旅の記録を作ってみよう」）。親なき後とは切り離した「楽しい AI 活用」。正典は `docs/ai-tips-series-proposal-2026-09-08-kiroku.md`（第3稿・main 取り込み済み）。
> 進め方は **Orca**（Issue ごとに worktree を切り、部屋は検品役）。記事本文の執筆だけは Orca に載せず部屋で行う。

## 再開コマンド（コピペで動く）

```bash
cd /Users/k-kawahara/Projects/nest-webpage
git fetch origin && git branch --list 'kazumasakawahara/*'   # Orca の worktree ブランチ一覧（ai-4＝#25、zip-e2＝#26）
git log --oneline main..kazumasakawahara/zip-e2               # 未取り込みの成果を見る
npm run build && npx vitest run                                # 取り込み後の確認（136件）
```

## 現在地
- 目標: 3回の記事を出すための土台（枠組み・仕分け係スキル・旅行記の実験）を Orca で先に固める
- 進捗:
  - [x] 企画書 第3稿・Issue #24（親）#25 #26 #27 起票・PR #28（docs）main へマージ済み
  - [x] #25 枠組み導入 → ブランチ `kazumasakawahara/ai-4`（bc3b2d9）。部屋で差分・看板 SVG 確認済み。**main 未取り込み**（Orca 上は #24 のタスクとして紐づいている。取り込み後に #25 を手で閉じる）
  - [x] #26 仕分け係 zip＋実験 E2 → ブランチ `kazumasakawahara/zip-e2`（8コミット）。r1 で差し戻し1件（zip のディレクトリ属性 0600）→ 修正 → **r2 で差し戻しなし**。報告は `inspections/2026-09-08-issue26-shiwake-gakari{,-r2}.md`。**main 未取り込み**
  - [ ] #27 旅行記の実験（E3 ノート一冊／E4 Canvas／E7 PDF）。**zip-e2 の保管庫 `docs/kiroku-demo/記録/` が土台**なので、zip-e2 を main に取り込んでから Orca の「開始→」。3案並走向き
  - [x] E1（Claude Desktop＋Filesystem で Obsidian の保管庫を読み書き）は河原さんが別の保管庫で何度も試して問題なし（2026-09-09）。E5（スマホ文字起こし）E6（スマホ→PC 同期）は未
  - [x] 記事 第1回「なんでも箱をつくる」PR #31 で公開（2026-09-09）
  - [x] 記事 第2回「録音も、切符も、一行も、放り込む」PR #32 で公開（同日。「今週どうだった？」の実演 log-weekly.md）
  - [x] 記事 最終回「旅行記を、AIさんに書いてもらう」PR #33（河原さん承認済み・マージ処理中）
  - [x] 仕分け係 v1.1（source を `"[[raw/…]]"` に／テンプレートに生きたリンクを書かない）。試走2回で確認、docs/kiroku-demo/log-v11.md。zip は v1.1 を追加し v1.0 も残す。記事・news のリンクは v1.1 へ
  - [x] nest News の告知（PR #34、2026-09-09）

## グレーな判断
- PR #28 は河原さんの明示依頼でマージ。以後の部屋ブランチのコミット（検品報告2本・HANDOVER・台帳）は push のみで、main への取り込みは河原さん判断（PR #29 を作ってある）
- 検品 r1 の「一字一句」問題：私の勧めは「言葉は変えない。`[[ ]]` の付加は可」で基準を固定。**未承認**
- #26 の保管庫は、Issue 文言（1回目の出力をそのままコミット）ではなく、部屋の勧めで v1.0 SKILL の3回目出力に差し替えた（#27 の土台にするため）。log-E2 に経緯あり

## 未決論点
- ai-4（枠組み＝「近日公開」の空ブロック）を main に入れる時期。部屋の勧めは第1回の原稿ができてから
- zip-e2 を main に入れると `public/downloads/shiwake-gakari-v1.0.zip` が URL で到達可能になる（未リンク）。配布前に Finder のダブルクリック展開を1回実測
- 旅行記のかたち（企画書 §9-2 の A〜F）の本命は #27 の結果で決める。決定は河原さん
- 港のページ名（実演セットで AI が「港に名前があれば」と聞いている）。架空なので決めるだけ

## 既知の罠・注意
- **Orca のタスク入口**：#24（親）から始めると AI が子 Issue を自分で選ぶ。子 Issue の行の「開始→」から始める
- Orca は `--dangerously-skip-permissions` で起動する。避けるなら `claude --permission-mode acceptEdits --prefill '<issue URL>'`。サンドボックスとフックはどちらでも効く
- `--prefill` は URL だけ入る。**URL の後ろに指示文を足してから送信**（「…を読んで実装して。push はしないで」）
- Orca の worktree は main から切られる。**参照させたい docs は先に main へ**（PR #28 の教訓）
- Python zipfile で作った zip はディレクトリエントリの属性が 0600 になり、`unzip` 後にフォルダへ入れない。`external_attr` を明示する（r1 の差し戻し）
- ai-4 と部屋ブランチは タスク.md／作業ログ.md の先頭に行を足しているので、取り込み順によって小さな衝突が出る。両方残せばよい

## 次タスク（優先度順）
- A: v1.1 の公開（PR）と本番の zip 確認 → Issue #24 を閉じる
- B: 実演セット `docs/kiroku-demo/記録/` は v1.0 の出力のまま（記事と一致させるため）。v1.1 で仕分け直すかは任意
- C: 記事本文の「正直」表現は今後使わない（メモリ no-shoujiki-phrasing）

---

# HANDOVER — 2026-07-24（気づきノート実装 ／ 教えてAIさん ／ つたえるカード）

> 次回開始時はこのファイルを最初に読み込んでから作業を再開してください。
> ※ 旧版（2026-05-22・サイト全面リニューアル期）の内容は git 履歴参照。サイトは公開運用中（nponest.com）。
>
> **3系統が並走しています。**
> 1. **支援者の気づきノート PWA**（main、2026-07-24 **本番公開済み**）— 直後の専用セクション。
> 2. **つたえるカード PWA**（2026-07-16 に main へマージ・本番稼働中）。
> 3. **教えてAIさん記事ストリーム**（main、公開運用中）。

## 再開コマンド（コピペで動く）

```bash
cd /Users/k-kawahara/Projects/nest-webpage
npm run dev        # → http://localhost:4321
npm run build      # 本番ビルド（dist/）
npm run preview    # ビルド結果プレビュー
# デプロイ: main へ push すると Cloudflare Workers が自動反映（約1〜2分）
```

---

# 支援者の気づきノート PWA（2026-07-24 本番公開・`6af5ae0`）

意思決定支援の観点から、支援者が月にいちど自分の支援をふりかえる完全ローカル動作の PWA。
9問＋自由記述2問。**点数・合否・集計は思想として持たない**。評定利用禁止フレーズ（河原さん指定文言
「事業者が職員を評定する際に利用するためのものではありません…」）はアプリHome・
意思決定支援ページのカード・aboutページ・news記事の全てに掲載。

## 経緯と問い設計の根拠

- 発端: 支援者を非難せず「自然な気づき→自発的な改善」につなげるセルフチェックの仕組み（河原さん発案）。
- 設計原則（3転換）: ①評価でなく**想起**を求める（具体的場面の想起は自己防衛が働かない）
  ②正解・点数を出さない（点数化すると内省でなく点取り行動になる） ③良い瞬間も記録させる
  （自由記述2問が実質の本体、9問はそこへの呼び水）。
- 問いの枠組み: 厚労省ガイドラインの意思形成→意思表明→意思実現 ＋ 読み取り の4ブロック（A〜D）・9問。
- 選択肢は9問すべて問いごとに個別の語彙（はい/いいえ型の査定感を避ける）。「思い出せない」も正当な回答。
- シグネチャ要素: 記入開始時に**前回の自由記述を表示**（「前回のあなたのことば」）。月次の自己対話装置。
- Q5（誘導への自覚）とQ6（環境・タイミング整備）は動画・図解照合で追加。A-1は「結論でなく過程を支える」
  を反映し「どんな工夫で選べるようにしたか」まで問う形に修正。

## 動画照合の結果（2026-07-24）

- 対象: 意思決定支援ページ掲載の解説動画「意思決定支援の真実と権利」（NotebookLM製・9:50）。
  原稿・スクリプトはリポジトリにないため、ffmpeg シーン検出（閾値0.08）で17フレーム抽出し全数目視。
- 構成: 定義（代行決定との対比）→権利性（憲法13条・権利条約12条）→善意による権利侵害→
  3プロセス→実践の3アプローチ（足場かけ／過程／非対等性・暗黙知）。
- 判定: 図解「意思決定支援の核心」ベースの暫定照合を裏付け。動画固有の追加論点は
  「意思を表しやすい環境・タイミングの整備」のみ→Q6として反映済み。
- 作業残骸: `~/ds-frames`（636KB・抽出フレーム）。削除可否は河原さん未回答のため残置。

## ファイル構成

- `src/pages/apps/kizuki/index.astro` — アプリ本体（単一ファイル。CSS＋TSインライン、5画面:
  home / form / done / history / detail）。データは localStorage キー `kizuki-entries-v1` のみ。
- `src/pages/apps/kizuki/about.astro` — 紹介ページ（`/apps/kizuki/about/`。QR・ホーム画面追加手順・
  運用のお願い4点：提出を求めない／共有は本人の意思／機種変で引継がれない／利用者の本名を書かない）。
- `public/apps/kizuki/` — manifest.webmanifest ／ sw.js（つたえるカードと同方式・VERSION v1）／
  icons/（icon-src.svg から 512/192/apple-touch を生成）。
- `public/images/apps/kizuki-qr.svg` — QR（npx qrcode で生成、https://www.nponest.com/apps/kizuki/ 宛）。
- `src/content/news/2026-07-24-kizuki-note.md` — 公開告知（tag: お知らせ。公開日は frontmatter `date` で調整）。
- 変更: `src/pages/sudachi/decision-support.astro`（「資料・文書」に導線カード、プレースホルダ削除）、
  `src/pages/apps/index.astro`（CTA直前に「支援者向けのアプリもあります」節）。
- デザイン: つたえるカードと同一パレット（cream/green/terra）。design-brief-builder の nest-preset 準拠。
  ビルドは `npm run build` で通ること確認済み（2026-07-24）。

## 公開ゲート（進行状況: 2026-07-24 本番公開済み）

- [x] コミット・push（＝デプロイ）— **河原さんの明示指示（2026-07-24「今日付で本番にUP」）で実施**。
  コミット `6af5ae0`。本番URL全て5本 200・導線・news一覧掲載を curl で確認済み。
  保留中の `scripts/create-nest-inquiry-form.gs` と untracked（.mcp.json 等）はコミットに含めていない。
- [x] news 記事・about ページの文面 — 公開指示に伴い確定扱い（修正があれば随時。文面変更のみなら
  sw.js の VERSION バンプは about/news には不要、アプリ本体に触れたら必要）。
- [ ] ブラウザ動作確認（記入→保存→2回目で「前回のことば」表示／コピー／2段階削除）。
  **本番URL（https://www.nponest.com/apps/kizuki/）で実施可になった。手動確認待ち**。
- [ ] 実機チェック（iPhone Safari / Android Chrome：ホーム追加→機内モード起動、OS文字サイズ最大）。
  万一不具合があってもナビ未リンクの静かな公開のため影響範囲は小。修正デプロイ時は VERSION バンプ必須。

## グレーな判断（2026-07-24・承認未取得）

- スラッグを `/apps/kizuki/` とした（短さ優先。名称「支援者の気づきノート」自体は河原さん決定）。
- アイコンは Claude 自作 SVG（ノート＋若葉）。
- about ページの「お願い」4点と news 記事の文面は Claude 起草（要確認）。
- 選択肢ラベルの個別化・全問任意回答（未回答でも保存可）は設計原則からの Claude 判断。

## 運用の罠（気づきノート）

- **⚠️ sw.js の `VERSION` バンプ**: つたえるカードと同じ罠。アプリに影響するデプロイのたびに
  `public/apps/kizuki/sw.js` の VERSION を手で上げる（上げ忘れるとオフライン利用者が旧版のまま）。
- 記録は端末内のみ＝機種変更で消える（about ページに明記済み。問い合わせが来たらここを案内）。

---

# つたえるカード PWA（2026-07-16 に main へマージ・本番稼働中）

言葉での意思表示が難しい方が、絵カードを2タップ（1タップ目=選択、2タップ目=確定）で選んで
「きもち・こまった・おねがい」等を伝えるための、完全ローカル動作の PWA。写真も履歴も端末内のみ。

## 現在地

- **Task 1〜16 完了＋最終ブランチレビュー修正済み → 2026-07-16 に main へマージ・本番反映済み（静かな公開）**。ナビ未リンク。入口は意思決定支援ページの紹介セクション（`/sudachi/decision-support/` → `/apps/`）のみ。本番でSW registration・オフライン起動（precache 95件）を確認済み。
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

# 単体テスト（全体で136・つたえるは tests/tsutaeru/*.test.ts）
npx vitest run

# スモークE2E（本番ビルド相手・必ず build を先に）
npm run build
npx playwright test --config tests/tsutaeru/playwright.config.ts
```

スモークは dist/client を素の Node 静的サーバ（:5099、spec の beforeAll で起動/afterAll で停止）で配信し、
mobile 390×844 で ①home表示 ②きもち完走→result ③履歴1件 ④コピー文面 ⑤ふりかえり分岐 を検証する。
（`astro preview` は本環境では dev サーバを返すため E2E の対象にしない — Task 14 の教訓。）

## 公開ゲート（進行状況: 静かな公開まで完了・2026-07-16）

- [x] **④ main へマージ → 自動デプロイ**（河原さん承認済み。静かな公開＝ナビ未リンクで本番稼働中）
- [x] **③ サイトナビからのリンク位置** → 当面ナビには張らず、**意思決定支援ページ内の紹介セクションを唯一の導線**とする（河原さん決定）。反応を見てナビ昇格を検討
- [ ] **挿絵の差し替え**: 分かりづらい絵は河原さんが後日提供 → `public/apps/tsutaeru/art/<id>.svg` を差し替え（形式は何でも可・変換はClaude側で）。**差し替え時は sw.js の VERSION を上げる**
- [ ] **① 実機チェックリスト**（iPhone Safari / Android Chrome の両方で）:
  - ホーム画面に追加 → **機内モードで起動**してオフライン動作を確認
  - **本人モード（kiosk）解除の 3 秒長押し**が効くこと（誤操作で抜けないこと）
  - **OS の文字サイズを最大**にしてレイアウトが崩れず操作できること
  - **読み上げ**（Web Speech / 日本語音声）が鳴ること・鳴らない端末でも無音で正常動作すること
  - **カードを素早く2回タップしてもズームしない**（iOS。二段階タップ確定を阻害しないこと）
  - **文字の上でも3秒長押しで本人モードを解除できる**（テキスト選択・ルーペに乗っ取られないこと）
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
