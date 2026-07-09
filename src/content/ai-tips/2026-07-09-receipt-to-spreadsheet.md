---
title: レシートの山、もう手入力しない ― スマホで撮ってAIにExcel／スプレッドシートへまとめてもらう
date: 2026-07-09
summary: レシートや領収書を1枚ずつ手で打ち込んでいませんか。スマホで撮ってAIに渡すと、日付・店名・金額を表にまとめて、ExcelやGoogleスプレッドシートにそのまま貼れます。その手順をAIに聞いてみました。
---

小口の経費や活動費のレシート・領収書。あとでまとめて **Excelやスプレッドシートに手入力**——この地味な作業、けっこう大変ですよね。数字を打ち間違えたり、枚数が多いとそれだけで一日仕事になったり。

今回は、その手入力を **スマホとAIでまるごと省く** ワザです。やることは「撮る → AIに渡す → 貼り付ける」の3ステップだけ。さっそくAIに聞いてみました。

<div class="qa">
  <div class="qa__row qa__row--me">
    <div class="qa__avatar">🙂</div>
    <p class="qa__bubble">レシートの中身をExcelに打ち込むの、地味に大変で……。写真から自動で表にできたりしない？</p>
  </div>
  <div class="qa__row qa__row--ai">
    <div class="qa__avatar">🤖</div>
    <p class="qa__bubble">できますよ！ スマホでレシートを撮って、その画像を私（AI）に渡してください。「日付・店名・金額を<strong>表にして</strong>」とお願いすれば、ExcelやGoogleスプレッドシートに<strong>そのまま貼れる形</strong>で書き出します。何枚かまとめてでもOKです。</p>
  </div>
</div>

<figure class="mockup mockup--wide">
  <img src="/images/ai-tips/receipt-flow.svg" alt="スマホでレシートを撮り、AIが読み取り、表に貼り付ける3ステップの流れ図" width="600" height="210" loading="lazy" decoding="async" />
  <figcaption>▲ やることは「撮る → AIが読み取る → 表に貼る」の3ステップ</figcaption>
</figure>

## やってみよう

1. **撮る** … レシートをスマホで撮影します（コツ＝しわを伸ばす・全体を入れる・明るい場所で・1枚ずつ）。
2. **PCへ送る** … AirDrop、Googleフォト、自分宛メールなど、いつもの方法でPCへ。（※スマホのAIアプリで完結させてもOK）
3. **AIに頼む** … お使いのAI（ChatGPT・Claude・Gemini など）に画像を貼り付けて、こうお願いします。

<div class="ai-prompt">
  <span class="ai-prompt__label">AIへの頼み方の例</span>
  この画像はレシートです。<strong>日付・店名・品目・金額</strong>を読み取って、表計算ソフトに貼り付けられるよう <strong>タブ区切りの表</strong> にしてください。
</div>

4. **貼り付ける** … AIが出した表をコピーして、ExcelやGoogleスプレッドシートのセルを選び、貼り付けます。

<figure class="mockup mockup--shot">
  <img src="/images/ai-tips/receipt-table.svg" alt="AIがレシートから作った表の例。日付・店名・品目・金額の3行と合計行" width="470" height="280" loading="lazy" decoding="async" />
  <figcaption>▲ こんな表になって出てきます（AIの出力例）。あとは表計算ソフトに貼るだけ</figcaption>
</figure>

5. **見直す** … 金額・日付が原本と合っているか確認します（AIはたまに数字を読み間違えます）。

## 貼り付け方（Excel／Googleスプレッドシート 共通）

「タブ区切り」で書き出してもらうと、**貼り付けたときに自動で列が分かれる**のがポイントです。

- **Excel** … 貼り付けたい先のセルをクリックして <span class="kbd">Ctrl</span>＋<span class="kbd">V</span>（Mac は <span class="kbd">⌘ Command</span>＋<span class="kbd">V</span>）。日付・店名・金額がそれぞれの列に入ります。
- **Googleスプレッドシート** … 同じくセルを選んで <span class="kbd">Ctrl</span>＋<span class="kbd">V</span>（Mac は <span class="kbd">⌘ Command</span>＋<span class="kbd">V</span>）。もし列が分かれないときは、メニューの **「データ」→「テキストを列に分割」** で直せます。

**追記していくとき** は、すでにある表の **いちばん下の空いているセル** を選んで貼り付ければOK。月が変わってもどんどん下に足していけます。

## 追記していくと、集計までできる

表がたまってきたら、そのまま続けてAIにお願いできます。

<div class="qa">
  <div class="qa__row qa__row--me">
    <div class="qa__avatar">🙂</div>
    <p class="qa__bubble">10枚分たまったんだけど、合計とか月ごとの集計もできる？</p>
  </div>
  <div class="qa__row qa__row--ai">
    <div class="qa__avatar">🤖</div>
    <p class="qa__bubble">もちろんです。「<strong>合計を出して</strong>」「<strong>月ごとにまとめて</strong>」「<strong>品目ごとに分けて</strong>」とお願いすれば、集計した表にします。Excelやスプレッドシートの合計の数式（SUM）を教えてもらうこともできますよ。</p>
  </div>
</div>

## 気をつけたいこと

便利なぶん、福祉の現場では次の3つに気をつけてください。

<div class="qa">
  <div class="qa__row qa__row--ai">
    <div class="qa__avatar">🤖</div>
    <p class="qa__bubble"><strong>①個人情報・機微な情報は送らない</strong>：レシートには、氏名・通院先（医療機関名）・カード番号の一部などが写ることがあります。とくに <strong>利用者さんの預り金や医療のレシートを、そのままクラウドのAIに渡すのは避けて</strong>ください。写っている名前などは隠してから使いましょう。</p>
  </div>
</div>

- **②数字は必ず原本と照らし合わせる** … 金額や日付の読み間違いは会計では致命的です。合計が合うかもチェックを。
- **③原本は捨てない** … 税務や監査では紙の原本（レシート・領収書）の保管が必要です。AIで表にしても、原本はきちんと残しておきましょう。

> **メモ：** これはあくまで「小口の経費メモ・家計簿・下書き」を楽にするための便利ワザです。正式な会計処理や預り金の管理は、これまでどおりの手順・システムで行ってください。

「こんなこと、パソコンやAIでできる？」というギモンがあれば、[お問い合わせフォーム](/contact/)からぜひ教えてください。次の「教えてAIさん」で取り上げるかもしれません。
