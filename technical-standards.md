# nest ホームページ 技術基準書 v2.0
# 特定非営利活動法人（NPO法人）nest
# 作成日：2026年5月22日

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | nestホームページ リニューアル |
| 対象法人 | 特定非営利活動法人（NPO法人）nest |
| 目的 | 限られた予算でスタッフが自己運営できるサイトの構築 |
| 最終公開先 | Google Sites または GitHub Pages / Netlify（無料ホスティング） |
| 制作方針 | 静的HTML/CSS/JS のみ（CMSや外部フレームワーク不使用） |

---

## 2. ディレクトリ構成

```
nest-website/
├── index.html            トップページ
├── about.html            nestについて
├── b-type.html           就労継続支援B型
├── kimachiya.html        キッチン＆マルシェ木町家
├── nest-design.html      nest Design
├── sudachi.html          地域生活支援の取り組み
├── recruit.html          利用者募集中
├── news.html             nest News
├── join.html             入会・寄付
├── contact.html          お問い合わせ
├── access.html           アクセス
├── members.html          会員の方へ（非公開）
├── privacy.html          プライバシーポリシー
├── css/
│   └── style.css         共通スタイルシート
├── js/
│   └── main.js           共通JavaScript
└── images/
    ├── logo.svg          nestロゴ（テキストロゴまたはSVG）
    ├── hero-placeholder.png  ヒーロー画像プレースホルダー
    └── （その他画像：後で差し替え）
```

---

## 3. デザイン仕様

### 3-1. カラーパレット

| 用途 | カラーコード | 説明 |
|------|------------|------|
| メインカラー | #2d5a27 | ダークグリーン（ロゴ・ヘッダー・ボタン） |
| アクセントカラー | #4a8c3f | ライトグリーン（ホバー・サブ要素） |
| 背景色 | #ffffff | 白（メインコンテンツ背景） |
| サブ背景色 | #f5f9f4 | 薄いグリーン（セクション背景の切り替えに使用） |
| テキストカラー | #333333 | ほぼ黒（本文） |
| サブテキストカラー | #666666 | グレー（注記・キャプション） |
| 実施中ラベル背景 | #2d5a27 | 緑（「実施中」バッジ） |
| 終了ラベル背景 | #888888 | グレー（「終了」バッジ） |
| ボーダーカラー | #e0e0e0 | カード枠線など |

### 3-2. タイポグラフィ

| 用途 | フォント | サイズ | ウェイト |
|------|----------|--------|----------|
| 本文 | Noto Sans JP | 16px | 400 |
| 見出し h1 | Noto Sans JP | 36px (PC) / 28px (SP) | 700 |
| 見出し h2 | Noto Sans JP | 28px (PC) / 22px (SP) | 700 |
| 見出し h3 | Noto Sans JP | 22px (PC) / 18px (SP) | 600 |
| ナビゲーション | Noto Sans JP | 15px | 500 |
| ボタン | Noto Sans JP | 15px | 600 |
| 小文字（注記） | Noto Sans JP | 13px | 400 |

Googleフォント読み込み：
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 3-3. レイアウト

| 項目 | 値 |
|------|-----|
| 最大コンテンツ幅 | 1100px |
| コンテンツ左右パディング（PC） | 40px |
| コンテンツ左右パディング（SP） | 16px |
| カードのborder-radius | 8px |
| ボタンのborder-radius | 4px |
| セクション上下パディング | 60px (PC) / 40px (SP) |
| カードグリッド（2列） | repeat(2, 1fr) |
| カードグリッド（3列） | repeat(3, 1fr) |
| カード間ギャップ | 24px |

---

## 4. CSS 基本設計（style.css）

```css
/* === リセット & ベース === */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 16px;
  color: #333333;
  line-height: 1.8;
  background-color: #ffffff;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: #2d5a27;
  text-decoration: none;
}

a:hover {
  color: #4a8c3f;
}

/* === レイアウト === */
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 40px;
}

.section {
  padding: 60px 0;
}

.section--gray {
  background-color: #f5f9f4;
}

/* === ヘッダー === */
.header {
  background-color: #2d5a27;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header__logo {
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
}

.header__nav a {
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
  padding: 8px 12px;
}

.header__nav a:hover {
  background-color: rgba(255,255,255,0.15);
  border-radius: 4px;
}

/* === ボタン === */
.btn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn--primary {
  background-color: #2d5a27;
  color: #ffffff;
  border: none;
}

.btn--primary:hover {
  background-color: #4a8c3f;
  color: #ffffff;
}

.btn--outline {
  background-color: transparent;
  color: #2d5a27;
  border: 2px solid #2d5a27;
}

.btn--outline:hover {
  background-color: #2d5a27;
  color: #ffffff;
}

/* === カード === */
.card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
}

/* === グリッド === */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* === バッジ（ラベル） === */
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
}

.badge--active {
  background-color: #2d5a27;
  color: #ffffff;
}

.badge--closed {
  background-color: #888888;
  color: #ffffff;
}

/* === 画像プレースホルダー === */
.img-placeholder {
  background-color: #d0d0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 14px;
  border-radius: 8px;
}

/* === ヒーローセクション === */
.hero {
  position: relative;
  min-height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2d5a27;
  color: #ffffff;
  text-align: center;
}

.hero__title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 16px;
}

.hero__subtitle {
  font-size: 20px;
  font-weight: 400;
  opacity: 0.9;
}

/* === 営業情報ボックス === */
.info-box {
  background-color: #f5f9f4;
  border-left: 4px solid #2d5a27;
  border-radius: 4px;
  padding: 24px 28px;
  margin: 32px 0;
}

.info-box__title {
  font-size: 18px;
  font-weight: 700;
  color: #2d5a27;
  margin-bottom: 16px;
}

/* === フッター === */
.footer {
  background-color: #2d5a27;
  color: #ffffff;
  padding: 48px 0 24px;
}

.footer__logo {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
}

.footer__info {
  font-size: 14px;
  line-height: 2;
  opacity: 0.85;
}

.footer__copy {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

/* === iframeプレースホルダー === */
.iframe-placeholder {
  width: 100%;
  min-height: 400px;
  background-color: #f0f0f0;
  border: 2px dashed #cccccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888888;
  font-size: 14px;
  padding: 24px;
  text-align: center;
}

.iframe-placeholder p {
  margin: 4px 0;
}

/* === 会員ページ専用：注意書き === */
.members-notice {
  background-color: #fff3f3;
  border: 1px solid #ffcccc;
  border-radius: 4px;
  padding: 12px 16px;
  color: #cc0000;
  font-size: 14px;
  margin-top: 40px;
}

/* === レスポンシブ === */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .section {
    padding: 40px 0;
  }

  .grid-2,
  .grid-3 {
    grid-template-columns: 1fr;
  }

  .hero__title {
    font-size: 28px;
  }

  .hero__subtitle {
    font-size: 17px;
  }

  .header__nav {
    display: none;
  }

  .header__nav.is-open {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #2d5a27;
    padding: 16px;
  }

  .hamburger {
    display: block;
  }
}

@media (min-width: 769px) {
  .hamburger {
    display: none;
  }
}
```

---

## 5. JavaScript 基本設計（main.js）

```javascript
document.addEventListener('DOMContentLoaded', function () {

  // === ハンバーガーメニュー ===
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.header__nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      hamburger.setAttribute(
        'aria-expanded',
        nav.classList.contains('is-open')
      );
    });
  }

  // === スムーズスクロール ===
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // === 現在のページをナビにアクティブ表示 ===
  const currentPath = window.location.pathname.split('/').pop();
  document.querySelectorAll('.header__nav a').forEach(function (link) {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath ||
        (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('is-active');
    }
  });

});
```

---

## 6. HTMLテンプレート（共通部品）

### 6-1. ページ共通 <head>

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="特定非営利活動法人nestは、発達障害のある人とその家族の暮らしを支援するNPO法人です。北九州市小倉北区を拠点に活動しています。">
  <title>【ページタイトル】 | 特定非営利活動法人nest</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
```

### 6-2. 共通ヘッダー

```html
<header class="header">
  <div class="container">
    <div class="header__inner">
      <a href="index.html" class="header__logo">nest</a>
      <button class="hamburger" aria-label="メニューを開く" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="header__nav" aria-label="メインナビゲーション">
        <a href="index.html">TOP</a>
        <a href="about.html">nestについて</a>
        <div class="nav-dropdown">
          <a href="b-type.html">就労継続支援B型</a>
          <div class="nav-dropdown__menu">
            <a href="kimachiya.html">木町家</a>
            <a href="nest-design.html">nestDesign</a>
          </div>
        </div>
        <a href="sudachi.html">地域生活支援の取り組み</a>
        <a href="recruit.html">利用者募集中</a>
        <a href="news.html">nest News</a>
        <a href="join.html">入会・寄付</a>
        <a href="contact.html">お問い合わせ</a>
        <a href="access.html">アクセス</a>
      </nav>
    </div>
  </div>
</header>
```

### 6-3. 共通フッター

```html
<footer class="footer">
  <div class="container">
    <div class="footer__logo">nest</div>
    <div class="footer__info">
      <p>特定非営利活動法人（NPO法人）nest</p>
      <p>〒803-0851 福岡県北九州市小倉北区木町3丁目6−7</p>
      <p>TEL/FAX：093-582-7018（電話受付 平日8:00〜20:00）</p>
    </div>
    <div class="footer__copy">
      <p>©2019 by 特定非営利活動法人（NPO法人）nest</p>
      <p><a href="privacy.html" style="color:rgba(255,255,255,0.7);">プライバシーポリシー</a></p>
    </div>
  </div>
</footer>
<script src="js/main.js"></script>
```

### 6-4. iframeプレースホルダー（Googleサービス用）

Googleマップ用：
```html
<div class="iframe-placeholder">
  <p>📍 Googleマップ</p>
  <p>ここにGoogleマップのiframeコードを貼り付けてください</p>
  <p style="font-size:12px; margin-top:8px;">
    手順：Google Maps で住所を検索 → 「共有」→「地図を埋め込む」→ HTMLをコピー → このdivと置き換える
  </p>
</div>
```

Googleフォーム用：
```html
<div class="iframe-placeholder">
  <p>📋 Googleフォーム</p>
  <p>ここにGoogleフォームのiframeコードを貼り付けてください</p>
  <p style="font-size:12px; margin-top:8px;">
    手順：Googleフォームを作成 → 「送信」→「リンクのアイコン」→「埋め込む」→ HTMLをコピー → このdivと置き換える
  </p>
</div>
```

Googleカレンダー用：
```html
<div class="iframe-placeholder">
  <p>📅 Googleカレンダー</p>
  <p>ここにGoogleカレンダーのiframeコードを貼り付けてください</p>
  <p style="font-size:12px; margin-top:8px;">
    手順：Googleカレンダーの設定 → 「カレンダーの設定」→「埋め込みコードを取得」→ HTMLをコピー → このdivと置き換える
  </p>
</div>
```

---

## 7. アクセシビリティ要件

| 要件 | 対応方法 |
|------|----------|
| 全画像にaltテキスト | <img alt="説明文"> を必ず設定 |
| 見出し階層の遵守 | h1（ページタイトル1つ）→ h2（セクション）→ h3（サブセクション） |
| フォームのlabel | <label for=""> と <input id=""> を対応させる |
| カラーコントラスト | 白背景 + #333333 テキスト（コントラスト比 12:1以上） |
| キーボード操作 | ナビゲーションはTabキーで操作可能にする |
| スキップリンク | ページ先頭に「メインコンテンツへスキップ」リンクを設置 |
| aria-label | ハンバーガーボタン等にaria-labelを設定 |
| lang属性 | <html lang="ja"> を設定 |

---

## 8. SEO基本設定

各ページのmeta descriptionを設定すること：

| ページ | meta description |
|--------|-----------------|
| index.html | 特定非営利活動法人nestは、発達障害のある人とその家族の暮らしを支援するNPO法人です。北九州市小倉北区を拠点に、グループホーム・就労継続支援B型などの事業を展開しています。 |
| about.html | NPO法人nestの設立経緯・理念・事業概要をご紹介します。発達障害のある子どもの親たちの思いから生まれたNPO法人です。 |
| kimachiya.html | キッチン＆マルシェ木町家は、北九州市小倉北区の就労継続支援B型事業所です。南小倉駅前で美味しいお料理をご提供しています。 |
| news.html | NPO法人nestの最新情報・イベント情報をお届けします。 |
| contact.html | NPO法人nestへのお問い合わせはこちらから。見学・体験のご相談もお気軽にどうぞ。 |

---

## 9. ホスティング・公開方法

### 推奨オプション（無料）

| 方法 | 難易度 | 特徴 |
|------|--------|------|
| Google Sites | ★☆☆ | コード不要・ドラッグ＆ドロップ・日常更新に最適 |
| GitHub Pages | ★★☆ | HTMLをそのまま公開・独自ドメイン対応・完全無料 |
| Netlify | ★★☆ | ドラッグ＆ドロップでHTMLフォルダを公開可能・無料 |

### GitHub Pages での公開手順（初心者向け）
1. https://github.com でアカウント作成
2. 新しいリポジトリを作成（例：nest-website）
3. nest-website フォルダ内のファイルをアップロード
4. Settings → Pages → Source を「main ブランチ」に設定
5. https://（アカウント名）.github.io/nest-website/ で公開完了

### Netlify での公開手順（最も簡単）
1. https://netlify.com でアカウント作成
2. ダッシュボードの「Add new site」→「Deploy manually」
3. nest-website フォルダをそのままドラッグ＆ドロップ
4. 即座に公開完了（URLが自動発行される）

### 独自ドメイン（nponest.org）の継続使用
- 現在のドメイン管理会社でDNS設定を変更
- GitHub Pages / Netlify ともに独自ドメインの無料設定に対応
- 年間ドメイン費用：約2,000〜3,000円のみ

---

## 10. 運用・更新ガイドライン

### 更新担当者向け

| 更新内容 | 方法 | 難易度 |
|----------|------|--------|
| お知らせの追加（news.html） | HTMLファイルをテキストエディタで編集 | ★★☆ |
| 会員ページの更新（members.html） | 同上 | ★★☆ |
| 営業情報の変更 | 同上 | ★★☆ |
| Googleフォームの更新 | Googleフォームを編集するだけ（HTML変更不要） | ★☆☆ |
| カレンダーの更新 | Googleカレンダーに予定を追加するだけ（HTML変更不要） | ★☆☆ |
| 会報PDFの追加 | GoogleドライブにPDFをアップして、リンクURLを更新 | ★☆☆ |

### 推奨する無料テキストエディタ
- Visual Studio Code（https://code.visualstudio.com/）
  ※ 無料・日本語対応・HTMLの色分け表示に対応

### 定期メンテナンス推奨
- 月1回：nest News の更新
- 年1回：営業情報・事業内容の確認・修正
- 都度：会員ページのお知らせ更新・カレンダー追加

---

## 11. Googleサービス設定ガイド

### Googleフォーム（お問い合わせ・申込み・アンケート）
1. forms.google.com でフォームを新規作成
2. 必要な質問項目を追加（例：お名前・電話番号・メッセージ）
3. 右上「送信」→「<>（埋め込み）」タブ → iframeコードをコピー
4. contact.html のプレースホルダー部分と置き換える

### Googleカレンダー（会員向け行事予定）
1. calendar.google.com で「nest行事カレンダー」を新規作成
2. 設定 → 「カレンダーの設定」→「カレンダーの統合」→ 埋め込みコードをコピー
3. members.html のプレースホルダー部分と置き換える
4. ※ 公開範囲を「一般公開」にするか「URLを知っている人のみ」にするか設定すること

### Googleドライブ（会報PDF配布）
1. drive.google.com でPDFをアップロード
2. ファイルを右クリック →「共有」→「リンクを知っている全員」に設定
3. リンクをコピー → members.html の「後で差し替え」箇所に貼り付ける

---

## 12. セキュリティ・プライバシー注意事項

- 会員ページ（members.html）はURLを知っている人だけが閲覧可能
  → パスワード保護が必要な場合はNetlifyのパスワード機能（有料）かGoogleサイトの限定共有機能を使う
- 個人情報を含むフォームデータはGoogleフォームで管理（Googleが暗号化して保管）
- ソースコードをGitHubに公開する場合、個人情報・APIキー等をコードに含めないこと
- プライバシーポリシーページ（privacy.html）を必ず全ページのフッターにリンクすること
