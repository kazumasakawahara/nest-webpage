# 旧・ご家族向け「親なき後」資料（退避）

2026-08-11 に、親なき後ページの「ツール・しくみ」を**計画相談支援の担当者・意思決定支援に関わる方向け**に一本化した際、
ここへ退避したものです。**サイトからは配信されていません**（`legacy/` はビルド対象外）。

## 退避したもの

| ファイル | もとの場所 | 中身 |
|---|---|---|
| `kikitori-guide.astro` | `src/pages/post-parent/tools/` | 家族聴き取りガイド（1340行）。7つのまとまり・約50の問いを、ご家族の言葉に翻訳したもの。原典は nest の「家族からの聴き取りマニュアル」 |
| `oya-inai-start.astro` | `src/pages/post-parent/tools/` | 旧テンプレート（`oya-inai`）の入手手順ページ（画像つき） |
| `kikitori-sheet.pdf` | `public/downloads/` | 記入シート（A4 2ページ。「まず、3つだけ」＋チェックリスト） |
| `kikitori-manual-v1.0.docx` | `public/docs/post-parent/` | 原典の業務マニュアル（Word） |
| `kikitori-guide.svg` | `public/images/post-parent/` | ガイドのカード画像 |
| `oya-inai-template.png` | `public/images/post-parent/` | 旧テンプレートのカード画像 |

## なぜ消さずに残したか

**ご家族向けは、別プロジェクトとして作り直す予定**だからです。
構想は「障害のある子をもつ**若い親たち**が、これから我が子の歴史を作り上げていく」というもので、
Obsidian ＋ AI の組み合わせで別途配布します。そのときに、
**この1340行の問い集がそのまま素材になります**（読み手も目的も変わるので、そのまま出すことはありません）。

あわせて、若い親向けには **Obsidian の育て方ガイド**が別途必要になる見込みです。

## 復帰させるとき

`git mv` で戻せば元の場所に復元されます。ただし、そのまま戻すと
現行の支援者向け3段（聞く → 渡す → 引き出す）と読み手が混ざるため、
**別の入口（別ページ・別の棚）として立てる**ことを想定しています。

なお、旧テンプレートのリポジトリは `github.com/kazumasakawahara/oya-inai`、
現行の支援者向けは `github.com/kazumasakawahara/oya-inai-keikaku-soudan` です。混同にご注意ください。

---
*退避日: 2026-08-11*
