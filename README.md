# NPO法人 nest 公式サイト

Astro v6 + Vanilla CSS（CSS Variables）製の静的サイトです。

- デザイン方針：**温かいエディトリアル**（Shippori Mincho B1 × Noto Sans JP）
- 配色：nest緑 + クリーム + サンド + テラコッタ
- 出力：完全静的（CDN/オブジェクトストレージ どこでもOK）

## ディレクトリ

```
nest-webpage/
├── astro.config.mjs
├── package.json
├── public/                 静的アセット（画像 / favicon）
│   └── images/             写真置き場（README参照）
├── src/
│   ├── components/         共通部品
│   ├── content/news/       お知らせ Markdown 投稿
│   ├── content.config.ts   Content Collections スキーマ
│   ├── layouts/            ベースレイアウト
│   ├── lib/site.ts         サイト情報・ナビ・stats・voices
│   ├── pages/              各ページ（.astro）
│   └── styles/global.css   デザインシステム本体
├── spec.md                 仕様書 v2
├── technical-standards.md  技術基準書 v2
└── legacy/                 旧バージョン静的HTML（参照用）
```

## ローカル開発

```sh
npm install        # 初回のみ
npm run dev        # http://localhost:4321
npm run build      # ./dist に静的書き出し
npm run preview    # ビルド結果を確認
```

## お知らせの追加（スタッフ向け）

`src/content/news/` に `.md` ファイルを作るだけで反映されます。

```md
---
title: お知らせのタイトル
date: 2026-06-01
tag: お知らせ          # お知らせ | イベント | 事業所 | メディア のいずれか
summary: 一覧用の要約（任意）
---

ここに本文（Markdown）を書きます。

- 箇条書き
- **強調**

[リンク](/contact/) なども使えます。
```

ファイル名は `YYYY-MM-DD-スラッグ.md` の形式を推奨。

## 写真の差し替え

`public/images/README.md` を参照してください。Astro が自動で WebP / AVIF 変換します。

## デプロイ

`npm run build` で `dist/` に出力されます。以下いずれにもデプロイ可能：

- **Netlify**：dist フォルダをドラッグ＆ドロップ
- **Cloudflare Pages**：GitHub連携で push 時に自動ビルド
- **Vercel**：同上
- **GitHub Pages**：build outputs を公開

## デザイン方針メモ

- 見出し：Shippori Mincho B1（明朝）でnest独自の温度感
- 本文：Noto Sans JP
- アクセント：Inter（数字・英字のみ）
- すべてのアニメーションは `prefers-reduced-motion: reduce` を尊重
- モバイルでは画面下に常設「電話 / お問い合わせ」スティッキーCTA
