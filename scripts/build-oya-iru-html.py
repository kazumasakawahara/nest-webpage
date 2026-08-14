#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""oya-iru-wiki の親向け Markdown → 法人サイト /internal/ の HTML を再生成する。

背景: 配布物（~/Dev-Work/oya-iru-wiki）の docs を直したのに、サイト側の HTML を
流し忘れて片方だけ古くなる事故が実際に起きた（2026-08-14）。再生成を手作業の
scratchpad ではなくこのスクリプトに固定して、手順を1本に寄せる。

使い方:
    uv run --with markdown python3 scripts/build-oya-iru-html.py
    uv run --with markdown python3 scripts/build-oya-iru-html.py --check   # 差分の有無だけ見る

組版（CSS・ヘッダ・フッタ）は既存の生成済み HTML から取り出して使い回す。
CSS をこのスクリプトに書き写すと、サイト側の見た目と二重管理になるため。
"""
import html as htmllib
import pathlib
import re
import subprocess
import sys

import markdown

SITE = pathlib.Path(__file__).resolve().parent.parent
OUT = SITE / "public" / "internal"
SRC = pathlib.Path.home() / "Dev-Work" / "oya-iru-wiki" / "docs"

GUIDE_DIR = "くわしい手順"
MANUAL_MD = "親のための完全導入マニュアル.md"
MANUAL_HTML = "oya-iru-wiki-oya-manual.html"

# くわしい手順書: (Markdown ファイル名, 出力名)
GUIDES = [
    ("01_テンプレートを手に入れる.md", "oya-iru-wiki-guide-01-github.html"),
    ("02_Obsidianを入れてVaultとして開く.md", "oya-iru-wiki-guide-02-obsidian.html"),
    ("03_Claudeを用意してフォルダを見せる.md", "oya-iru-wiki-guide-03-claude.html"),
    ("04_黒い画面をこわがらない.md", "oya-iru-wiki-guide-04-terminal.html"),
    ("05_スマホの写真を受付箱に入れる.md", "oya-iru-wiki-guide-05-smartphone.html"),
]

# 文書間リンクの .md → サイト内 .html 対応表
LINK_MAP = {MANUAL_MD: MANUAL_HTML}
for md_name, html_name in GUIDES:
    LINK_MAP[md_name] = html_name

BRAND = "日記からつくる、わが子のバイブル（oya-iru-wiki）"


def gh_slugify(value, separator):
    """GitHub の見出しアンカーと同じ規則で id を作る（姉妹版 build_manual_html.py と同じ）。"""
    v = value.strip().lower().replace("　", "")
    v = re.sub(r"[^\w\s-]", "", v, flags=re.UNICODE)
    return re.sub(r"\s", separator, v)


def load_template(path):
    """既存の生成済み HTML から、head（style込み）と footer を取り出す。"""
    if not path.exists():
        sys.exit(f"組版のもとになる {path.name} がありません。git から復元してください。")
    t = path.read_text(encoding="utf-8")
    head = t[: t.index("<title>")]
    tail_head = t[t.index("</title>") + len("</title>") : t.index('<header class="doc">')]
    footer = t[t.index('<footer class="doc">') :]
    return head, tail_head, footer


def rewrite_links(md_text):
    """Markdown 内の文書間リンクをサイト内 .html へ向け直す。"""
    def sub(mo):
        target = mo.group(1)
        anchor = mo.group(2) or ""
        name = target.split("/")[-1]
        if name in LINK_MAP:
            return "](" + LINK_MAP[name] + anchor + ")"
        return mo.group(0)

    return re.sub(r"\]\(([^)#]+\.md)(#[^)]*)?\)", sub, md_text)


def build(md_path, out_name, sub_text, template):
    head, tail_head, footer = template
    text = rewrite_links(md_path.read_text(encoding="utf-8"))

    m = re.match(r"#\s+(.+?)\n", text)
    title = m.group(1).strip() if m else md_path.stem
    body_md = text[m.end() :] if m else text

    body = markdown.markdown(
        body_md,
        extensions=["tables", "fenced_code", "toc", "sane_lists", "attr_list"],
        extension_configs={"toc": {"slugify": gh_slugify, "separator": "-"}},
        output_format="html5",
    )

    def fix_id(mo):
        tag, attrs, inner = mo.group(1), mo.group(2), mo.group(3)
        plain = re.sub(r"<[^>]+>", "", inner)
        attrs = re.sub(r'\s*id="[^"]*"', "", attrs)
        return f'<{tag}{attrs} id="{gh_slugify(plain, "-")}">{inner}</{tag}>'

    body = re.sub(r"<(h[1-6])([^>]*)>(.*?)</\1>", fix_id, body, flags=re.S)

    out = (
        head
        + "<title>"
        + htmllib.escape(title)
        + "</title>"
        + tail_head
        + '<header class="doc">\n'
        + f"  <h1>{htmllib.escape(title)}</h1>\n"
        + f'  <p class="sub">{sub_text}</p>\n'
        + "</header>\n"
        + body
        + "\n"
        + footer
    )
    return out_name, out


def main():
    check_only = "--check" in sys.argv
    manual_tpl = load_template(OUT / MANUAL_HTML)
    guide_tpl = load_template(OUT / "oya-iru-wiki-guide-04-terminal.html")

    jobs = [
        (
            SRC / MANUAL_MD,
            MANUAL_HTML,
            f"{BRAND}／ このページは配布物同梱の Markdown 版から生成しています",
            manual_tpl,
        )
    ]
    total = len(GUIDES)
    for i, (md_name, out_name) in enumerate(GUIDES, start=1):
        jobs.append(
            (
                SRC / GUIDE_DIR / md_name,
                out_name,
                f"{BRAND}／ くわしい手順書 全{total}冊の{i}冊目",
                guide_tpl,
            )
        )

    changed = []
    for md_path, out_name, sub_text, tpl in jobs:
        if not md_path.exists():
            sys.exit(f"正本が見つかりません: {md_path}")
        name, out = build(md_path, out_name, sub_text, tpl)
        dst = OUT / name
        old = dst.read_text(encoding="utf-8") if dst.exists() else None
        if old == out:
            print(f"  [ok]   {name}: 更新なし")
            continue
        changed.append(name)
        if check_only:
            print(f"  [差分] {name}")
        else:
            dst.write_text(out, encoding="utf-8")
            print(f"  [更新] {name}: {len(out):,} bytes")

    # 文書間リンクの .md 残存チェック（.html に書き換え損ねると読者が GitHub の生原稿に飛ぶ）
    leftovers = []
    for _, out_name in [(None, MANUAL_HTML)] + [(None, n) for _, n in GUIDES]:
        p = OUT / out_name
        if not p.exists():
            continue
        for mo in re.finditer(r'href="([^"]+\.md)"', p.read_text(encoding="utf-8")):
            leftovers.append(f"{out_name}: {mo.group(1)}")
    if leftovers:
        print("\n.md リンクが残っています（要修正）:")
        for l in leftovers:
            print("  " + l)
        sys.exit(1)
    print("\n.md リンクの残存: 0")

    if changed and not check_only:
        print("コミットを忘れずに。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
