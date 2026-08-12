#!/bin/bash
# 配布物の完全導入マニュアル（HTML）を、法人サイトの /internal/ へ取り込む。
#
# サイト側に置くのは「福祉職に GitHub を開かせない」ため。
# GitHub 上の .html は中身が原稿のまま表示されてしまい、読ませられない。
# ただし実体は各リポジトリ側が正本なので、あちらを直したら必ずこれを流すこと。
# 流し忘れると、サイトのマニュアルだけ古くなる。
#
# 正本を直す手順:
#   cd <各リポジトリ> && uv run --with markdown python3 scripts/build_manual_html.py
set -eu

SITE="$(cd "$(dirname "$0")/.." && pwd)"
CHANGED=0

sync_one() {
  local label="$1" src="$2" dst="$SITE/public/internal/$3"
  if [ ! -f "$src" ]; then
    echo "  [skip] $label: 正本が見つかりません（$src）"
    return
  fi
  if cmp -s "$src" "$dst" 2>/dev/null; then
    echo "  [ok]   $label: 更新なし"
    return
  fi
  cp "$src" "$dst"
  echo "  [更新] $label: $(wc -c < "$dst" | tr -d ' ') bytes"
  CHANGED=1
}

echo "完全導入マニュアルの取り込み"
sync_one "くらしサポート（データベース）" \
  "$HOME/Dev-Work/oya-inai-db/docs/manuals/福祉専門職のための完全導入マニュアル.html" \
  "oya-inai-db-kanzen-manual.html"
sync_one "記録テンプレート（Obsidian）" \
  "$HOME/Dev-Work/oya-inai-keikaku-soudan/docs/福祉専門職のための完全導入マニュアル.html" \
  "oya-inai-template-kanzen-manual.html"

[ "$CHANGED" = "1" ] && echo "コミットを忘れずに。" || echo "サイト側は最新です。"
exit 0
