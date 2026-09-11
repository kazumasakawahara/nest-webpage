印刷プレビューでの2枚目はみ出しと「キッチン＆マルシ／エ」の改行、両方直しました。字の大きさはほぼ維持したまま、縦方向の無駄（会場・料金・出演・定員がそれぞれ別の大きな箱だった部分）を1つの一覧枠にまとめて、A4一枚に収めています。

主な変更点：
- 題名「風と歌とピアノと」を2行→1行に（44pt のまま。横幅に余裕があります）
- 会場・料金・出演・定員を「見出し＋内容」の横並び4行にまとめ、縦を大きく節約
- 用紙を 297mm 固定・はみ出し禁止にして、絶対に2枚目に送られないように
- 「キッチン＆マルシェ」「木町家」を改行禁止（`white-space: nowrap`）にし、折り返すときは語ごとまとめて動くように

```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>木町家 秋の音楽会 お知らせ</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #e8e2d8; }
  body {
    font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
    color: #3a2a1e;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  ruby { ruby-position: over; }
  ruby rt { font-size: 0.42em; font-weight: normal; letter-spacing: 0; color: inherit; }
  .nw { white-space: nowrap; }

  /* 用紙：A4 一枚に固定（はみ出し禁止） */
  .sheet {
    width: 210mm; height: 297mm;
    margin: 10mm auto; padding: 9mm 12mm;
    background: #fffaf0;
    box-shadow: 0 4px 20px rgba(0,0,0,.18);
    display: flex; flex-direction: column; justify-content: space-between; gap: 3mm;
    border: 6px double #c9773b;
    overflow: hidden;
  }
  @media print {
    html, body { background: #fff; width: 210mm; height: 297mm; overflow: hidden; }
    .sheet {
      margin: 0; box-shadow: none; height: 296mm;
      page-break-after: avoid; page-break-inside: avoid;
    }
  }

  /* 見出し */
  .head { text-align: center; }
  .head .shop {
    display: inline-block; white-space: nowrap;
    font-size: 18pt; font-weight: bold;
    padding: 1.5mm 8mm; border-radius: 999px; background: #c9773b; color: #fff;
  }
  .head .sub { font-size: 21pt; font-weight: bold; margin-top: 2mm; letter-spacing: 0.1em; }
  .head .title {
    font-size: 44pt; font-weight: 900; line-height: 1.3; margin-top: 1mm;
    white-space: nowrap; color: #7a3b12; letter-spacing: 0.02em;
  }
  .head .title .note { color: #c9773b; font-size: 0.8em; }

  /* 日付 */
  .date {
    text-align: center; background: #7a3b12; color: #fff;
    border-radius: 4mm; padding: 2mm;
    font-size: 34pt; font-weight: 900; line-height: 1.3;
  }
  .date rt { color: #ffe3c4; }
  .date .dow {
    display: inline-block; font-size: 0.7em; background: #fff; color: #7a3b12;
    border-radius: 3mm; padding: 0 3mm; margin-left: 3mm; vertical-align: middle;
  }

  /* 時間 */
  .times { display: flex; gap: 4mm; }
  .times div {
    flex: 1; text-align: center; border: 3px solid #c9773b; border-radius: 4mm;
    padding: 1.5mm 1mm; background: #fff;
  }
  .times .lab { font-size: 16pt; font-weight: bold; color: #7a3b12; }
  .times .val { font-size: 30pt; font-weight: 900; line-height: 1.2; }
  .times .small { font-size: 11pt; color: #6b5a4a; }

  /* 会場・料金・出演・定員（一覧） */
  .info {
    background: #fff; border-radius: 4mm; border-left: 8px solid #c9773b;
    padding: 1mm 4mm;
  }
  .info .r {
    display: flex; align-items: center; gap: 4mm;
    padding: 2mm 0; border-bottom: 2px dashed #e6cdb3;
  }
  .info .r:last-child { border-bottom: none; }
  .info .lab {
    flex: 0 0 30mm; text-align: center;
    font-size: 15pt; font-weight: bold; color: #fff; background: #c9773b;
    border-radius: 2mm; padding: 1mm 0; line-height: 1.3;
  }
  .info .val { flex: 1; font-size: 24pt; font-weight: 900; line-height: 1.3; }
  .info .val .big { font-size: 1.45em; color: #7a3b12; }
  .info .val .tax { font-size: 0.6em; font-weight: bold; }
  .info .val .add { display: inline-block; font-size: 14pt; font-weight: bold; margin-left: 2mm; }
  .info .val .sep { color: #c9773b; margin: 0 1mm; }
  .info .val .num { font-size: 1.45em; color: #b8321a; }
  .info .val .sm { display: inline-block; font-size: 15pt; font-weight: bold; margin-left: 2mm; }

  /* 申し込み */
  .contact {
    text-align: center; background: #7a3b12; color: #fff; border-radius: 4mm; padding: 2.5mm 2mm;
  }
  .contact rt { color: #ffe3c4; }
  .contact .lab { font-size: 18pt; font-weight: bold; }
  .contact .tel { font-size: 40pt; font-weight: 900; line-height: 1.15; letter-spacing: 0.04em; }
  .contact .hours { font-size: 15pt; margin-top: 1mm; }
</style>
</head>
<body>
<div class="sheet">

  <!-- 見出し -->
  <div class="head">
    <div class="shop">キッチン＆マルシェ <ruby>木町家<rt>きまちや</rt></ruby></div>
    <div class="sub">♪ <ruby>秋<rt>あき</rt></ruby>の<ruby>音楽会<rt>おんがくかい</rt></ruby> ♪</div>
    <div class="title">
      <span class="note">「</span><ruby>風<rt>かぜ</rt></ruby>と<ruby>歌<rt>うた</rt></ruby>とピアノと<span class="note">」</span>
    </div>
  </div>

  <!-- 日付 -->
  <div class="date">
    2026<ruby>年<rt>ねん</rt></ruby> 10<ruby>月<rt>がつ</rt></ruby> 17<ruby>日<rt>にち</rt></ruby>
    <span class="dow"><ruby>土<rt>ど</rt></ruby></span>
  </div>

  <!-- 時間 -->
  <div class="times">
    <div>
      <div class="lab"><ruby>開場<rt>かいじょう</rt></ruby></div>
      <div class="val">17:00</div>
      <div class="small">ドアが<ruby>開<rt>あ</rt></ruby>きます</div>
    </div>
    <div>
      <div class="lab"><ruby>開演<rt>かいえん</rt></ruby></div>
      <div class="val">17:30</div>
      <div class="small"><ruby>演奏<rt>えんそう</rt></ruby>が<ruby>始<rt>はじ</rt></ruby>まります</div>
    </div>
    <div>
      <div class="lab"><ruby>終演<rt>しゅうえん</rt></ruby>（<ruby>予定<rt>よてい</rt></ruby>）</div>
      <div class="val">19:20</div>
      <div class="small"><ruby>終<rt>お</rt></ruby>わります</div>
    </div>
  </div>

  <!-- 会場・料金・出演・定員 -->
  <div class="info">
    <div class="r">
      <div class="lab"><ruby>会場<rt>かいじょう</rt></ruby></div>
      <div class="val"><span class="nw">キッチン＆マルシェ</span> <span class="nw"><ruby>木町家<rt>きまちや</rt></ruby></span></div>
    </div>
    <div class="r">
      <div class="lab"><ruby>料金<rt>りょうきん</rt></ruby></div>
      <div class="val">
        <span class="nw"><span class="big">2,500</span><ruby>円<rt>えん</rt></ruby><span class="tax">（<ruby>税込<rt>ぜいこみ</rt></ruby>）</span></span>
        <span class="add"><ruby>木町家<rt>きまちや</rt></ruby><ruby>手作<rt>てづく</rt></ruby>りパン＆ドリンク<ruby>付<rt>つ</rt></ruby>き</span>
      </div>
    </div>
    <div class="r">
      <div class="lab"><ruby>出演<rt>しゅつえん</rt></ruby></div>
      <div class="val">♪ ホルン<span class="sep">・</span>テノール<span class="sep">・</span>ピアノ</div>
    </div>
    <div class="r">
      <div class="lab"><ruby>定員<rt>ていいん</rt></ruby></div>
      <div class="val">
        <span class="nw"><span class="num">40</span><ruby>名様<rt>めいさま</rt></ruby><ruby>限定<rt>げんてい</rt></ruby></span>
        <span class="sm">（<ruby>定員<rt>ていいん</rt></ruby>になり<ruby>次第<rt>しだい</rt></ruby>、<ruby>締<rt>し</rt></ruby>め<ruby>切<rt>き</rt></ruby>ります）</span>
      </div>
    </div>
  </div>

  <!-- 申し込み -->
  <div class="contact">
    <div class="lab">☎ お<ruby>申<rt>もう</rt></ruby>し<ruby>込<rt>こ</rt></ruby>みは お<ruby>電話<rt>でんわ</rt></ruby>で</div>
    <div class="tel">093-592-0331</div>
    <div class="hours"><ruby>受付<rt>うけつけ</rt></ruby> 10<ruby>時<rt>じ</rt></ruby>〜17<ruby>時<rt>じ</rt></ruby></div>
  </div>

</div>
</body>
</html>
```

補足を3点。

- 印刷設定は前回と同じく「用紙 A4・余白なし（または「デフォルト」）・拡大縮小 100%・背景のグラフィックを印刷 ON」でお願いします。「ページに合わせる」等の自動縮小は不要です。
- 縦に2cm前後の余裕を見て組んでいるので、ブラウザの字送りの違いがあっても一枚に収まる想定です。万一まだ窮屈なときは、印刷ダイアログの「拡大/縮小」を 95% にするのが一番簡単です。
- 画面上でも用紙と同じ高さで表示されるようにしたので、ブラウザで開いた見た目がそのまま印刷結果になります。