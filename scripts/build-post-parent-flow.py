#!/usr/bin/env -S uv run --quiet python3
# -*- coding: utf-8 -*-
"""親なき後 三部作の全体像（聞く／渡す／引き出す）の図を3枚生成する。

同じ地図を3枚描き、いまいる段だけを強調する。読み手はどの節から入っても
全体のどこにいるかが分かり、3節を見比べると「同じ流れの別の段」だと伝わる。
比率は ServiceZigzag のメディア枠に合わせて 4:3。
"""
import pathlib

OUT = pathlib.Path("public/images/post-parent")
OUT.mkdir(parents=True, exist_ok=True)

C = {
    "cream": "#faf6ef", "sand": "#f0ead8", "paper": "#ffffff",
    "green700": "#2d5a27", "green500": "#4a8c3f", "green100": "#e8efe6",
    "terra700": "#b85f3d", "terra500": "#d97757", "terra100": "#f9e8df",
    "ink": "#2a2620", "mute": "#6b665e", "soft": "#9a948a",
    "line": "#e6e0d4",
}
SANS = "'Noto Sans JP','Hiragino Sans','Yu Gothic',sans-serif"
SERIF = "'Shippori Mincho B1','Hiragino Mincho ProN','Yu Mincho',serif"

STEPS = [
    {
        "key": "kikitori-guide", "no": "①", "name": "聞く",
        "lead": "ふだんどおりに聞き取る",
        "lines": [
            "フェイスシート・面談メモ・会議録",
            "聞き方を変える必要はありません",
            "清書もしません",
        ],
    },
    {
        "key": "oya-inai-template", "no": "②", "name": "渡す",
        "lead": "受付箱に置くだけ",
        "lines": [
            "デスクトップのフォルダに入れる",
            "原本は書き換えできない棚へ移る",
            "置き間違いは記録前なら取り消せる",
        ],
    },
    {
        "key": "kurashi-support", "no": "③", "name": "引き出す",
        "lead": "必要なときに、必要な人へ",
        "lines": [
            "経緯は手元の記録（Obsidian）へ",
            "確実に拾う事実はデータベースへ",
            "緊急時は「してはいけないこと」を先に",
        ],
    },
]

W, H = 800, 600
BOX_X, BOX_W = 56, 688
BOX_H = 118
TOPS = [128, 274, 420]


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build(active_index):
    a = STEPS[active_index]
    p = []
    p.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
             f'width="{W}" height="{H}" role="img" font-family="{SANS}">')
    p.append(f'<rect width="{W}" height="{H}" fill="{C["cream"]}"/>')

    # ヘッダ
    p.append(f'<text x="{W//2}" y="52" text-anchor="middle" font-family="{SERIF}" '
             f'font-size="26" fill="{C["green700"]}">聞く → 渡す → 引き出す</text>')
    p.append(f'<text x="{W//2}" y="80" text-anchor="middle" font-size="14" '
             f'fill="{C["mute"]}">一人の記録が、途切れずに次へつながるまで</text>')
    p.append(f'<line x1="{BOX_X}" y1="98" x2="{BOX_X+BOX_W}" y2="98" stroke="{C["line"]}" stroke-width="1"/>')

    for i, s in enumerate(STEPS):
        y = TOPS[i]
        on = (i == active_index)
        fill = C["paper"] if on else C["cream"]
        stroke = C["green500"] if on else C["line"]
        sw = 2.5 if on else 1
        name_col = C["green700"] if on else C["soft"]
        lead_col = C["ink"] if on else C["soft"]
        body_col = C["mute"] if on else C["soft"]
        op = "1" if on else "0.72"

        p.append(f'<g opacity="{op}">')
        p.append(f'<rect x="{BOX_X}" y="{y}" width="{BOX_W}" height="{BOX_H}" rx="14" '
                 f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
        # 段番号と名前
        p.append(f'<text x="{BOX_X+28}" y="{y+44}" font-family="{SERIF}" font-size="30" '
                 f'fill="{name_col}">{s["no"]}</text>')
        p.append(f'<text x="{BOX_X+70}" y="{y+44}" font-family="{SERIF}" font-size="24" '
                 f'fill="{name_col}">{esc(s["name"])}</text>')
        p.append(f'<text x="{BOX_X+70}" y="{y+70}" font-size="14.5" fill="{lead_col}">'
                 f'{esc(s["lead"])}</text>')
        # 右側の3行
        for j, ln in enumerate(s["lines"]):
            p.append(f'<text x="{BOX_X+322}" y="{y+34+j*27}" font-size="13.5" fill="{body_col}">'
                     f'・{esc(ln)}</text>')
        # 現在地バッジ
        if on:
            p.append(f'<rect x="{BOX_X+BOX_W-96}" y="{y-13}" width="80" height="26" rx="13" '
                     f'fill="{C["terra500"]}"/>')
            p.append(f'<text x="{BOX_X+BOX_W-56}" y="{y+5}" text-anchor="middle" font-size="12.5" '
                     f'font-weight="700" fill="#fff">いまここ</text>')
        p.append('</g>')

        # 矢印
        if i < 2:
            ay = y + BOX_H
            p.append(f'<path d="M{W//2} {ay+6} L{W//2} {ay+22}" stroke="{C["line"]}" '
                     f'stroke-width="2" stroke-linecap="round"/>')
            p.append(f'<path d="M{W//2-6} {ay+17} L{W//2} {ay+24} L{W//2+6} {ay+17}" '
                     f'fill="none" stroke="{C["line"]}" stroke-width="2" '
                     f'stroke-linecap="round" stroke-linejoin="round"/>')

    # 脚注
    p.append(f'<rect x="{BOX_X}" y="{H-84}" width="{BOX_W}" height="46" rx="10" '
             f'fill="{C["green100"]}"/>')
    p.append(f'<text x="{W//2}" y="{H-55}" text-anchor="middle" font-size="13.5" '
             f'fill="{C["green700"]}">実名が入るデータベースへの登録は、必ず人の確認を経てから行います</text>')
    p.append(f'<text x="{W//2}" y="{H-16}" text-anchor="middle" font-size="11.5" '
             f'fill="{C["soft"]}">親なき後の支援 ／ 特定非営利活動法人 nest</text>')
    p.append('</svg>')
    return "\n".join(p)


for i, s in enumerate(STEPS):
    path = OUT / f"flow-{s['key']}.svg"
    path.write_text(build(i), encoding="utf-8")
    print(f"wrote {path} ({path.stat().st_size:,} bytes)")
