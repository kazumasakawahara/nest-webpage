# 引き継ぎ書 — nest 公式サイト リニューアル

> 最終更新：2026-05-22（金）終業時／作成者：Claude（前回セッション）
> 次回開始時はこのファイルを最初に読み込んでから作業を再開してください。

---

## 0. このセッションでの結論（一目で）

- 旧 静的HTML 13本 を `legacy/` に退避し、**Astro v6** で全面リニューアル済み
- デザイン方針：**A. 温かいエディトリアル**（Shippori Mincho × Noto Sans JP / 緑 × クリーム × テラコッタ）
- **「声」セクション** を新規実装済み（仮テキスト）
- 全13ページ＋News個別3ページ＝ **16ページ build 成功**（450ms）
- 写真は未配置。プレースホルダーで動作。**写真調達は河原さん担当**

---

## 1. 再開コマンド（コピペで動く）

```bash
cd /Users/k-kawahara/Projects/nest-webpage

# 1) 依存はインストール済み。dev サーバ起動：
npm run dev
# → http://localhost:4321 で確認

# 2) 本番ビルド：
npm run build       # → dist/ に静的書き出し

# 3) ビルド結果プレビュー：
npm run preview
```

---

## 2. 進捗状況

### ✅ 完了

| # | 内容 | 場所 |
|---|---|---|
| 1 | Astro v6 初期化 | `astro.config.mjs`, `package.json` |
| 2 | 旧HTML退避 | `legacy/` 配下に13本のHTML + 旧 css/js/images |
| 3 | デザインシステム | `src/styles/global.css`（CSS変数・タイポ・モーション） |
| 4 | サイト情報の一元化 | `src/lib/site.ts`（法人情報・ナビ・stats・voices） |
| 5 | レイアウト | `src/layouts/BaseLayout.astro`（SEO/OG/フォント/JS フック） |
| 6 | 共通部品 | `src/components/` 配下12本 |
| 7 | News Content Collection | `src/content/news/*.md` + `src/content.config.ts` |
| 8 | 全ページ Astro 化 | `src/pages/` 配下15本 |
| 9 | プレースホルダー整備 | `public/images/README.md` で差し替え手順を明記 |
| 10 | ブラウザ動作確認 | トップページの hero / mission / stats / 各セクション目視確認 |

### ⏳ 未着手・要対応

| 優先度 | 内容 | 担当 | 備考 |
|---|---|---|---|
| ★★★ | **写真素材の収集と配置** | 河原さん | `public/images/README.md` に必要な写真リスト |
| ★★★ | 各ページの `<Hero image="...">` への画像パス追記 | Claude（明日以降） | 写真到着後 |
| ★★ | 「声」セクションの本文確定（仮テキスト） | 河原さん／林代表に確認 | `src/lib/site.ts` の `voices` 配列 |
| ★★ | プライバシーポリシー本文確認 | 河原さん→林代表 | 現行 nponest.org の本文と差異があれば差し替え |
| ★★ | Googleフォーム埋め込みコード貼付 | 河原さん | contact / members ページ |
| ★★ | Googleマップ埋め込みコード貼付 | 河原さん | access ページ |
| ★★ | Googleカレンダー埋め込みコード貼付 | 河原さん | members ページ |
| ★ | 寄付申込書PDF・巣箱バックナンバーPDF（Googleドライブリンク） | 河原さん | join / about / members ページ |
| ★ | デプロイ先決定（Cloudflare Pages推奨 / Netlify / Vercel） | 河原さん判断 | 全て無料枠で可能 |
| ★ | 独自ドメイン（nponest.org）の移管手配 | 河原さん | 公開時 |
| ★ | OG画像（`/og-image.png`）の作成 | Claude（明日以降） | favicon と同じ世界観で |
| ★ | favicon の `.ico` 形式も追加（古いブラウザ向け） | Claude（明日以降） | 任意 |

---

## 3. 採用済みデザイン方針（変更時は要相談）

### 配色トークン
```
--color-green-900: #1a3d18    深緑（フッター・ヒーロー背景）
--color-green-700: #2d5a27    nest 緑（メインカラー）
--color-green-500: #4a8c3f    アクセント緑
--color-cream:     #faf6ef    ページ背景（暖かみのある白）
--color-sand:      #f0ead8    セクション切り替え背景
--color-terra-500: #d97757    テラコッタ（CTA・アクセント）
--color-ink:       #2a2620    本文（茶系の濃グレー）
```

### タイポグラフィ
- 見出し：**Shippori Mincho B1**（明朝） — 温度と品格
- 本文：**Noto Sans JP** — 可読性
- 数字・英字：**Inter** — モダンなアクセント
- 全てGoogleフォントから読み込み

### モーション
- 全アニメは `prefers-reduced-motion: reduce` を尊重
- `.reveal` クラスは `js-enabled` ガード済み（JS無効時もコンテンツは見える）

---

## 4. ファイル所在（よくアクセスするもの）

| やりたいこと | ファイル |
|---|---|
| サイト共通情報（法人名・住所・電話）の変更 | `src/lib/site.ts` |
| ナビゲーション項目の増減 | `src/lib/site.ts` の `navLinks` |
| 「数字で見るnest」の数値変更 | `src/lib/site.ts` の `stats` |
| 「声」セクションの内容変更 | `src/lib/site.ts` の `voices` |
| 配色・フォントの調整 | `src/styles/global.css`（冒頭の `:root`） |
| 共通ヘッダー編集 | `src/components/Header.astro` |
| 共通フッター編集 | `src/components/Footer.astro` |
| トップページ編集 | `src/pages/index.astro` |
| News 追加 | `src/content/news/YYYY-MM-DD-スラッグ.md` を新規作成 |
| 写真の配置 | `public/images/<hero\|services\|voices\|news>/` |

---

## 5. 次回セッション冒頭でやること（推奨手順）

```
1. このファイル（HANDOVER.md）を読む
2. spec.md / technical-standards.md は仕様の原典として保全（変更しない）
3. README.md でスタッフ向け運用手順を確認
4. npm run dev でローカル起動して現状を目視確認
5. 「§2 未着手・要対応」の中から着手するタスクを宣言
6. 完了したらこのファイルの該当行を [x] にチェック更新
```

### 次セッションへの依頼テンプレ
```
@HANDOVER.md を読んで、引き継ぎ通り作業を再開してください。
今日は以下を進めたいです：
- （例）写真素材を配置したので、各ページの Hero に組み込んでください
- （例）「声」セクションの本文を差し替えたいので、相談に乗ってください
- （例）Cloudflare Pages にデプロイしたいので、手順を案内してください
```

---

## 6. このセッションで Claude が判断・採用した「グレー」事項

これらは河原さんと事前合意なしに進めた事項です。引き継ぎ後に確認してください。

| 項目 | Claude の判断 | 確認したいこと |
|---|---|---|
| プライバシーポリシー本文 | 現行サイトに本文掲載なし／spec.md に項目だけあったため、**標準NPO雛形を生成** | 林代表に内容確認 → 必要なら差し替え |
| 「声」セクションの引用文 | **仮の文章**を Claude が作成（利用者A / ご家族B / 林代表） | 実際の声に差し替える or 林代表の許諾の元で公開可否を決める |
| 数字セクションの値 | 設立19年 / GH 12拠点 / B型 2 / 当事者活動 4本柱 — **spec.md から推算** | 林代表に正確な数値を確認 |
| Newsサンプル3本 | リニューアル告知・募集案内・ニュースレター告知 — **Claude 生成** | 本番リリース前に差し替え or 削除 |
| News サンプル日付 | 2026-02/04/05 の3本 | 公開時に古いものは削除 |
| Astro の prefetch 設定 | `prefetchAll: true, defaultStrategy: 'viewport'` | パフォーマンス検証で問題あれば調整 |
| サイト URL（canonical） | `astro.config.mjs` で `site: 'https://www.nponest.org'` 仮設定 | 移管先が決まったら更新 |
| favicon | SVG（n の文字を緑グラデで配置）— Claude 暫定生成 | nest 公式ロゴが届いたら差し替え |

---

## 7. 既知の課題・将来検討

| 課題 | 対応案 |
|---|---|
| Googleフォーム / マップ / カレンダー の埋込はプレースホルダー | 各 iframe コード差し替え（手順は `public/images/README.md` の冒頭に説明あり） |
| 写真がないと事業カードが寂しい | サービス用画像 6枚（木町家・nest Design・グループホーム・当事者活動・地域生活支援・支援/寄付）が最重要 |
| News 個別記事に画像未対応 | `content.config.ts` に `image:` フィールドは追加済み。`[...slug].astro` で表示処理を後日追加可能 |
| スタッフが Markdown を直接書ける運用 | VS Code + GitHub での更新フローを別途整理（README に概要のみ記載） |
| 非エンジニアの編集導線 | 将来的に **Decap CMS / Sveltia CMS** を追加すれば管理画面化可能（任意） |
| Instagram フィード埋込 | フッターにリンクのみ。直近投稿の埋込は Phase 2 で検討 |
| 巣立ちストーリー（タイムライン）セクション | 今回未実装。利用者の歩みを取材できたら追加候補 |
| ダークモード | 未対応。NPOサイトなので優先度低 |

---

## 8. legacy/ ディレクトリの扱い

旧 静的HTML（v2 仕様のままのもの）を `legacy/` に保全しています。これは：
- 仕様の照合用 reference
- もし Astro 化を巻き戻したくなったときの保険
- 写真の置き場所参照（旧 `images/` がそのまま残っている）

**新版が公開後に問題なく運用できることを 1〜2 ヶ月確認できたら、`legacy/` ごと削除可能。**

---

## 9. デプロイの推奨手順（参考）

### Cloudflare Pages（推奨）
```
1. GitHub にリポジトリ作成して push
2. Cloudflare Pages で「Connect to Git」
3. ビルドコマンド: npm run build
4. 出力ディレクトリ: dist
5. push する度に自動デプロイ
6. 独自ドメイン設定（nponest.org）
```

### Netlify
```
1. https://app.netlify.com → 「Add new site」
2. Git 連携 or dist/ をドラッグ&ドロップ
3. ビルド設定は Astro 自動検知
```

### Vercel
```
vercel CLI で：
$ vercel
（プロジェクト名は nest-webpage 推奨）
```

---

## 10. 連絡・参照先

- **法人サイト現行版（移行元）**：https://www.nponest.org/
- **Instagram（木町家）**：https://instagram.com/kimachi_ya/
- **事務局**：093-582-7018（平日 8:00〜20:00）
- **代表 / 個人情報管理者**：林 澄江
- **所在地**：〒803-0851 福岡県北九州市小倉北区木町3丁目6−7

---

## 付録：このセッションで作成したファイル一覧（参考）

```
新規追加:
├── astro.config.mjs                 (改修)
├── package.json                     (改修)
├── README.md                        (改修)
├── HANDOVER.md                      (このファイル)
├── tsconfig.json
├── public/favicon.svg               (改修)
├── public/images/README.md
├── src/
│   ├── styles/global.css
│   ├── lib/site.ts
│   ├── content.config.ts
│   ├── content/news/
│   │   ├── 2026-02-15-newsletter-vol13.md
│   │   ├── 2026-04-10-recruit-tour.md
│   │   └── 2026-05-22-website-renewal.md
│   ├── layouts/BaseLayout.astro
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── StickyCallBar.astro
│   │   ├── Hero.astro
│   │   ├── StatsSection.astro
│   │   ├── VoiceSection.astro
│   │   ├── ServiceZigzag.astro
│   │   ├── ServiceCardGrid.astro
│   │   ├── NewsList.astro
│   │   ├── CtaBlock.astro
│   │   ├── IframePlaceholder.astro
│   │   └── PageIntro.astro
│   └── pages/
│       ├── index.astro
│       ├── about.astro
│       ├── b-type.astro
│       ├── kimachiya.astro
│       ├── nest-design.astro
│       ├── sudachi.astro
│       ├── recruit.astro
│       ├── join.astro
│       ├── contact.astro
│       ├── access.astro
│       ├── members.astro
│       ├── privacy.astro
│       └── news/
│           ├── index.astro
│           └── [...slug].astro

退避:
└── legacy/  (旧静的HTML 13本 + 旧 css/js/images)
```

以上。お疲れさまでした 🌱
