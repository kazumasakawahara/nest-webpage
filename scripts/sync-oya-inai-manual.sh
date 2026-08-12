#!/bin/bash
# oya-inai-db の完全導入マニュアル（HTML）を、法人サイトの /internal/ へ取り込む。
#
# サイト側に置くのは「福祉職に GitHub を開かせない」ため。
# ただし実体は oya-inai-db 側が正本なので、あちらを直したら必ずこれを流すこと。
# 流し忘れると、サイトのマニュアルだけ古くなる。
set -eu

SRC="$HOME/Dev-Work/oya-inai-db/docs/manuals/福祉専門職のための完全導入マニュアル.html"
DST="$(cd "$(dirname "$0")/.." && pwd)/public/internal/oya-inai-db-kanzen-manual.html"

if [ ! -f "$SRC" ]; then
  echo "正本が見つかりません: $SRC" >&2
  echo "先に oya-inai-db で scripts/build_manual_html.py を実行してください。" >&2
  exit 1
fi

if cmp -s "$SRC" "$DST" 2>/dev/null; then
  echo "更新なし（サイト側は最新です）"
  exit 0
fi

cp "$SRC" "$DST"
echo "取り込みました: $DST"
echo "  $(wc -c < "$DST" | tr -d ' ') bytes"
echo "コミットを忘れずに。"
