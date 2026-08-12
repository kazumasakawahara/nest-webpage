#!/usr/bin/env -S uv run --quiet python3
# -*- coding: utf-8 -*-
"""親なき後 三部作の全体像（聞く／渡す／引き出す）の図を3枚生成する。

同じ地図を3枚描き、いまいる段だけを強調する。読み手はどの節から入っても
全体のどこにいるかが分かり、3節を見比べると「同じ流れの別の段」だと伝わる。

各段に絵を添える。②の受付箱は、この流れの要（原本の唯一の入口）なので、
他の2つより大きく描く。比率は ServiceZigzag のメディア枠に合わせて 4:3。
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


# ── 絵 ───────────────────────────────────────────────
def icon_docs(cx, cy, s, col, fill):
    """聞く: 重ねた書類（フェイスシート・面談メモ・会議録）"""
    return f'''<g transform="translate({cx},{cy}) scale({s})" stroke="{col}"
      stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
      <rect x="-26" y="-26" width="36" height="48" rx="4" fill="{fill}" transform="rotate(-10)"/>
      <rect x="-20" y="-25" width="36" height="48" rx="4" fill="{fill}" transform="rotate(5)"/>
      <rect x="-17" y="-24" width="36" height="48" rx="4" fill="{fill}"/>
      <line x1="-9" y1="-12" x2="11" y2="-12"/>
      <line x1="-9" y1="-2" x2="11" y2="-2"/>
      <line x1="-9" y1="8" x2="3" y2="8"/>
    </g>'''


def icon_inbox(cx, cy, s, col, fill, accent):
    """渡す: 受付箱。原本の唯一の入口なので大きく描く"""
    return f'''<g transform="translate({cx},{cy}) scale({s})" stroke="{col}"
      stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
      <rect x="-15" y="-40" width="30" height="26" rx="3" fill="{fill}"/>
      <line x1="-8" y1="-32" x2="8" y2="-32"/>
      <line x1="-8" y1="-24" x2="4" y2="-24"/>
      <path d="M0,-14 L-6,-21 M0,-14 L6,-21" stroke-width="2.4"/>
      <path d="M-36,-8 L36,-8 L27,28 L-27,28 Z" fill="{accent}"/>
      <path d="M-36,-8 L-28,0 L28,0 L36,-8" fill="none"/>
      <rect x="-38" y="-13" width="76" height="9" rx="4" fill="{fill}"/>
    </g>'''


def icon_out(cx, cy, s, col, fill):
    """引き出す: 手元の記録（ノート）と、データベース"""
    return f'''<g transform="translate({cx},{cy}) scale({s})" stroke="{col}"
      stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
      <rect x="-34" y="-22" width="28" height="42" rx="3" fill="{fill}"/>
      <line x1="-27" y1="-12" x2="-13" y2="-12"/>
      <line x1="-27" y1="-3" x2="-13" y2="-3"/>
      <line x1="-27" y1="6" x2="-19" y2="6"/>
      <ellipse cx="17" cy="-18" rx="16" ry="6" fill="{fill}"/>
      <path d="M1,-18 L1,13 A16,6 0 0 0 33,13 L33,-18" fill="{fill}"/>
      <path d="M1,-4 A16,6 0 0 0 33,-4" fill="none"/>
    </g>'''


STEPS = [
    {
        "key": "kikitori-guide", "no": "①", "name": "聞く",
        "lead": "ふだんどおりに聞き取る",
        "lines": [
            "フェイスシート・面談メモ・会議録",
            "聞き方を変える必要はありません",
            "清書せず、そのまま受付箱へ",
        ],
        "icon": "docs",
    },
    {
        "key": "oya-inai-template", "no": "②", "name": "渡す",
        "lead": "受付箱に置くだけ",
        "lines": [
            "デスクトップの箱に入れる",
            "原本は書き換えできない棚へ移る",
            "置き間違いは記録前なら取り消せる",
        ],
        "icon": "inbox",
    },
    {
        "key": "kurashi-support", "no": "③", "name": "引き出す",
        "lead": "必要なときに、必要な人へ",
        "lines": [
            "経緯は手元の記録（Obsidian）へ",
            "確実に拾う事実はデータベースへ",
            "緊急時は「してはいけないこと」を先に",
        ],
        "icon": "out",
    },
]

W, H = 800, 600
BOX_X, BOX_W = 48, 704
BOX_H = 124
TOPS = [104, 246, 388]
ICON_CX = BOX_X + 68
TEXT_X = BOX_X + 132
LINE_X = BOX_X + 356


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build(active_index):
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'width="{W}" height="{H}" role="img" font-family="{SANS}">',
         f'<rect width="{W}" height="{H}" fill="{C["cream"]}"/>']

    p.append(f'<text x="{W//2}" y="46" text-anchor="middle" font-family="{SERIF}" '
             f'font-size="26" fill="{C["green700"]}">聞く → 渡す → 引き出す</text>')
    p.append(f'<text x="{W//2}" y="72" text-anchor="middle" font-size="14" '
             f'fill="{C["mute"]}">一人の記録が、途切れずに次へつながるまで</text>')
    p.append(f'<line x1="{BOX_X}" y1="88" x2="{BOX_X+BOX_W}" y2="88" '
             f'stroke="{C["line"]}" stroke-width="1"/>')

    for i, s in enumerate(STEPS):
        y = TOPS[i]
        on = (i == active_index)
        card_fill = C["paper"] if on else C["cream"]
        stroke = C["green500"] if on else C["line"]
        sw = 2.5 if on else 1
        name_col = C["green700"] if on else C["soft"]
        lead_col = C["ink"] if on else C["soft"]
        body_col = C["mute"] if on else C["soft"]
        ic = C["green700"] if on else C["soft"]
        ifill = C["paper"] if on else C["cream"]
        iacc = C["green100"] if on else C["cream"]
        op = "1" if on else "0.7"
        cy = y + BOX_H // 2

        p.append(f'<g opacity="{op}">')
        p.append(f'<rect x="{BOX_X}" y="{y}" width="{BOX_W}" height="{BOX_H}" rx="14" '
                 f'fill="{card_fill}" stroke="{stroke}" stroke-width="{sw}"/>')

        if s["icon"] == "docs":
            p.append(icon_docs(ICON_CX, cy, 0.86, ic, ifill))
        elif s["icon"] == "inbox":
            # 受付箱はこの流れの要。ひとまわり大きく
            p.append(icon_inbox(ICON_CX, cy + 4, 1.06, ic, ifill, iacc))
        else:
            p.append(icon_out(ICON_CX, cy, 0.86, ic, ifill))

        p.append(f'<text x="{TEXT_X}" y="{y+50}" font-family="{SERIF}" font-size="28" '
                 f'fill="{name_col}">{s["no"]}</text>')
        p.append(f'<text x="{TEXT_X+40}" y="{y+50}" font-family="{SERIF}" font-size="23" '
                 f'fill="{name_col}">{esc(s["name"])}</text>')
        p.append(f'<text x="{TEXT_X}" y="{y+78}" font-size="14" fill="{lead_col}">'
                 f'{esc(s["lead"])}</text>')
        for j, ln in enumerate(s["lines"]):
            p.append(f'<text x="{LINE_X}" y="{y+38+j*27}" font-size="13.5" fill="{body_col}">'
                     f'・{esc(ln)}</text>')
        if on:
            p.append(f'<rect x="{BOX_X+BOX_W-98}" y="{y-13}" width="82" height="26" rx="13" '
                     f'fill="{C["terra500"]}"/>')
            p.append(f'<text x="{BOX_X+BOX_W-57}" y="{y+5}" text-anchor="middle" '
                     f'font-size="12.5" font-weight="700" fill="#fff">いまここ</text>')
        p.append('</g>')

        if i < 2:
            ay = y + BOX_H
            p.append(f'<path d="M{ICON_CX} {ay+3} L{ICON_CX} {ay+15}" stroke="{C["line"]}" '
                     f'stroke-width="2" stroke-linecap="round"/>')
            p.append(f'<path d="M{ICON_CX-6} {ay+10} L{ICON_CX} {ay+17} L{ICON_CX+6} {ay+10}" '
                     f'fill="none" stroke="{C["line"]}" stroke-width="2" '
                     f'stroke-linecap="round" stroke-linejoin="round"/>')

    p.append(f'<rect x="{BOX_X}" y="{H-70}" width="{BOX_W}" height="42" rx="10" '
             f'fill="{C["green100"]}"/>')
    p.append(f'<text x="{W//2}" y="{H-43}" text-anchor="middle" font-size="13.5" '
             f'fill="{C["green700"]}">実名が入るデータベースへの登録は、必ず人の確認を経てから行います</text>')
    p.append(f'<text x="{W//2}" y="{H-10}" text-anchor="middle" font-size="11.5" '
             f'fill="{C["soft"]}">親なき後の支援 ／ 特定非営利活動法人 nest</text>')
    p.append('</svg>')
    return "\n".join(p)


for i, s in enumerate(STEPS):
    path = OUT / f"flow-{s['key']}.svg"
    path.write_text(build(i), encoding="utf-8")
    print(f"wrote {path} ({path.stat().st_size:,} bytes)")
