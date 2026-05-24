# 写真素材ディレクトリ

このディレクトリにJPEG/PNG/WebPの写真を配置してください。

## ディレクトリ構成

```
public/images/
├── hero/                 ヒーロー用大判写真（推奨 1920×1080 以上）
│   ├── home.jpg          トップページ
│   ├── about.jpg         nestについて
│   ├── kimachiya.jpg     木町家
│   ├── nest-design.jpg   nest Design
│   ├── recruit.jpg       利用者募集中
│   ├── sudachi.jpg       地域生活支援
│   ├── join.jpg          入会・寄付
│   └── contact.jpg       お問い合わせ
├── services/             事業カード用（推奨 800×500）
│   ├── kimachiya.jpg
│   ├── nest-design.jpg
│   ├── grouphome.jpg
│   ├── activity.jpg
│   ├── sudachi.jpg
│   └── support.jpg
├── voices/               「声」セクション用 顔写真 / シルエット（300×300 正方形）
│   ├── voice-1.jpg
│   ├── voice-2.jpg
│   └── voice-3.jpg
└── news/                 ニュース記事用サムネイル
```

## 画像差し替え方法

### Hero（各ページの大判ヒーロー）

`src/pages/<page>.astro` の `<Hero>` コンポーネントに `image` プロパティを追加：

```astro
<Hero
  title="..."
  image="/images/hero/kimachiya.jpg"
  imagePosition="center"
/>
```

### サービスカード（トップページ）

`src/pages/index.astro` の `services` 配列の各オブジェクトに `image` を追加：

```ts
{
  title: 'キッチン＆マルシェ 木町家',
  image: '/images/services/kimachiya.jpg',
  imageAlt: '木町家の店内風景',
  ...
}
```

### 「声」セクション

`src/lib/site.ts` の `voices` 配列の `photo` を更新：

```ts
{
  quote: '...',
  name: '利用者・Aさん',
  photo: '/images/voices/voice-1.jpg',
  ...
}
```

## 撮影のアドバイス

- **横向き構図**を基本に（ヒーローはレスポンシブ対応のため）
- **自然光**を活用（蛍光灯は緑がかるので避ける）
- **手元・後ろ姿・物の写真**も歓迎（肖像権配慮）
- **米粉パン、シフォン、料理、アート作品**などモノの写真は単独でも強い印象
- 解像度は最低 **1600px幅** 推奨（Astro が自動でWebP変換します）

## 画像最適化（自動）

Astro が自動で WebP / AVIF 変換、サイズ最適化を行います。元ファイルはオリジナル品質で OK。
