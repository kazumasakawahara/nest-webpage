# 公開 PDF ディレクトリ

ここに置いた PDF は **誰でもダウンロードできる公開資料** として `https://www.nponest.org/pdfs/<...>` で配信されます。

## ディレクトリ構成

```
public/pdfs/
├── README.md               このファイル
├── forms/                  申込書類（入会・寄付・ボランティア等）
├── newsletter-archive/     機関誌「巣箱」公開バックナンバー
└── research/               研修会・シンポジウム資料、啓発資料
```

## URL の例

| ファイル配置 | 配信 URL |
|---|---|
| `public/pdfs/forms/membership.pdf` | `https://www.nponest.org/pdfs/forms/membership.pdf` |
| `public/pdfs/newsletter-archive/subako-vol13.pdf` | `https://www.nponest.org/pdfs/newsletter-archive/subako-vol13.pdf` |
| `public/pdfs/research/2024-sympo.pdf` | `https://www.nponest.org/pdfs/research/2024-sympo.pdf` |

## ファイル命名のおすすめ

- 小文字 + ハイフン区切り（URL エンコード不要のため）
- 日付を入れる場合は `YYYY-MM-DD-` プレフィックス
- 機関誌は `subako-vol14.pdf` のように号数をファイル名に含めると分かりやすい

## ⚠️ ここに置くものと、置かないもの

| 種別 | 配置場所 | 理由 |
|---|---|---|
| 入会申込書、寄付申込書 | **ここ（forms/）** | 誰でも DL できないと使えない |
| 機関誌「巣箱」最新号 | **Supabase Storage**（`newsletters` バケット） | 会員特典として配信 |
| 機関誌の **公開号**（広報目的） | **ここ（newsletter-archive/）** | 一般向け広報なら公開 OK |
| シンポジウム・研修の **公開資料** | **ここ（research/）** | 啓発活動の一環 |
| 研修会の **内部資料**・議事録 | **Supabase Storage**（要に応じて新バケット） | 内部限定 |
| 利用者・家族の個人情報を含む資料 | **絶対にここに置かない**（Supabase 会員限定エリアか紙運用）| 公開 = 即漏洩 |

## ファイル追加から公開までの流れ

1. PDF を上記のいずれかのディレクトリにコピー
2. `git add public/pdfs/...` でステージング
3. `git commit -m "docs: add ..."` でコミット
4. main にマージしてデプロイ → 自動的に公開 URL で配信開始

## 関連

- 会員限定 PDF：Supabase Storage 経由（管理画面 `/members/admin/newsletters` 等）
- ローカル作業場：プロジェクトルートの `.pdfs-staging/`（git 管理外、Supabase アップ前の整理用）
