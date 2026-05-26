# 写真素材ディレクトリ

このディレクトリには JPEG / PNG / WebP / GIF の画像を配置します。
Astro が自動で WebP / AVIF 変換、サイズ最適化を行います。

## 実際の構成

```
public/images/
├── nest-image1/
│   ├── kimachiyayukei.png        木町家 夕景（Hero）
│   ├── kimachiyayakei.png        木町家 夜景
│   ├── kimachiya-gaikan.png      木町家 外観
│   ├── kimachiya-bread-salad.png 木町家 米粉パン＆サラダ
│   ├── kimachiya_working1.png    木町家 作業風景 1
│   ├── kimachiya_working2.png    木町家 作業風景 2
│   ├── kimachiya_working3.png    木町家 作業風景 3
│   ├── kimachiya-logo.png        木町家ロゴ
│   ├── kimachiya-logo-white.png  木町家ロゴ 白版
│   ├── mori_subako1.jpg          森の巣箱 1（法人ロゴ的）
│   ├── mori_subako2.jpg          森の巣箱 2
│   ├── mori_subako3.png          森の巣箱 3
│   └── mori_subako4.png          森の巣箱 4
└── nest-image2/
    ├── nest-logo-01.png          NEST 法人ロゴ
    ├── nest-logo-01-white.png    白版
    ├── nest-logo-02.png          バリエーション
    ├── nest-logo-03.png          バリエーション
    ├── nest-logo-03-white.png    白版
    ├── nestdesign-logo.png       nestDesign ロゴ
    ├── nestdesign-logo-white.png 白版
    ├── nestdesign_working.png    nestDesign 作業風景
    ├── nestdesign_shitsunai.png  nestDesign 室内
    ├── neststation_gaikan.png    nest STATION 外観
    ├── mori_subako5.png          森の巣箱 5
    └── nestmap.gif               所在地マップ（未使用、将来 access ページ用）
```

## 画像差し替え方法

### Hero（各ページの大判背景）

`src/pages/<page>.astro` の `<Hero>` コンポーネントに `image` を指定：

```astro
<Hero
  title="..."
  image="/images/nest-image1/kimachiyayukei.png"
  imagePosition="center"
/>
```

### サービスカード（TOP ページ）

`src/pages/index.astro` の `services` 配列に `image` と `imageAlt` を追加：

```ts
{
  title: 'キッチン＆マルシェ 木町家',
  image: '/images/nest-image1/kimachiya-bread-salad.png',
  imageAlt: '米粉パンとサラダ',
  ...
}
```

## 撮影のアドバイス

- 横向き構図を基本に（ヒーローはレスポンシブ対応のため）
- 自然光を活用（蛍光灯は緑がかるので避ける）
- 解像度は最低 1600px 幅推奨

## 未使用ストック（将来活用候補）

- ロゴ各種：フッターや法人情報ページのマーク
- `nestmap.gif`：アクセスページ用
- 巣箱画像（mori_subako*）：voices セクション or 装飾
