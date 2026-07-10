---
title: スライド作成も、AIさんに“1行”お願いするだけ ― NotebookLMで資料づくり
date: 2026-07-10
summary: 会議や研修のスライドづくり、大変ですよね。実は、手元の資料（PDFなど）を渡して「◯◯についてスライドにして」と1行お願いするだけで、AIがたたき台を作ってくれます。今回はGoogleの「NotebookLM」を、AIをあまり使わない方向けにやさしくご紹介します。
---

会議の資料、研修のスライド、活動報告のまとめ——。「作らなきゃいけないのは分かっているけれど、時間がない…」。福祉の現場では、よくある悩みですよね。

今回ご紹介するのは、その **スライドづくり** の話です。しかも、やることは **たった1行お願いするだけ**。手元にある資料（PDFなど）をAIに渡して、「◯◯について、スライドにまとめて」とお願いすると、**たたき台が数分でできあがります**。

<div class="qa">
  <div class="qa__row qa__row--me">
    <div class="qa__avatar">🙂</div>
    <p class="qa__bubble">スライドって、いつも一枚ずつ作っていて…。正直、すごく時間がかかっちゃうんです。</p>
  </div>
  <div class="qa__row qa__row--ai">
    <div class="qa__avatar">🤖</div>
    <p class="qa__bubble">それなら、Googleの <strong>NotebookLM（ノートブック・エルエム）</strong> がぴったりですよ。手元の資料を渡して「これをスライドにして」とお願いするだけ。<strong>資料の中身にそって</strong>、いい感じにまとめてくれます。いっしょにやってみましょう。</p>
  </div>
</div>

## NotebookLM って、なに？

はじめての方のために、かんたんに。

- **NotebookLM（ノートブック・エルエム）** … Google がつくった **無料で使えるAI**。ふつうのAIとの一番のちがいは、**「自分が渡した資料“だけ”をもとに答えてくれる」**こと。
- だから、ネットのどこかの当てにならない情報ではなく、**手元の報告書やマニュアルに書いてあることに沿って**、要約したり、スライドや音声にまとめてくれます。**うそが混じりにくい**のが安心なところです。

むずかしい設定はいりません。**資料を入れて、ふつうの言葉でお願いするだけ**です。

## 今回やってみること

nestの [地域生活支援のページ](/sudachi/) に載せている、**巣立ちプロジェクトの活動報告書（2022年度〜2025年度の4年分）** を資料にして、こんなお願いをしてみます。

<div class="ai-prompt">
  <span class="ai-prompt__label">お願いの1行</span>
  どうして<strong>性に関する取り組み</strong>が必要になったかを説明するスライドを、<strong>7枚にまとめて</strong>作成してください。
</div>

4年分の報告書を人が読み返して、要点を拾って、スライドに起こして…と考えると、なかなかの作業量です。それを **1行のお願いで** やってもらおう、というわけです。

## やってみよう

### ① ノートブックを作って、資料を入れる

NotebookLM（`notebooklm.google.com`）を開き、Googleアカウントでログイン。「ノートブックを作成」→「**ソースを追加**」を押すと、資料の入れ方が選べます。

<figure class="mockup mockup--shot">
  <img src="/images/ai-tips/notebooklm-add-source.png" alt="NotebookLMのソース追加画面。ファイルをアップロード・ウェブサイト・ドライブ・コピーしたテキストから資料を入れられる" width="960" height="617" loading="lazy" decoding="async" />
  <figcaption>▲ 資料の入れ方はいろいろ。今回は報告書のPDFを「ファイルをアップロード」で入れます</figcaption>
</figure>

- **ファイルをアップロード** … パソコンにあるPDFやWord、画像など
- **ウェブサイト** … ホームページのURLや、YouTubeの動画
- **ドライブ** … Googleドライブの中の資料
- **コピーしたテキスト** … コピーした文章をそのまま貼り付け

今回は、報告書のPDFを4つ（2022〜2025年度）アップロードしました。

### ② スライドを選んで、1行お願いする

資料が入ると、右側の **「Studio（スタジオ）」** に、作れるもの（音声解説・**スライド**・動画解説・マインドマップ・レポートなど）が並びます。**「スライド」を選び**、あとはお願いを1行入力するだけ。

<figure class="mockup mockup--shot">
  <img src="/images/ai-tips/notebooklm-slide-request.png" alt="NotebookLMに4年分の報告書PDFを読み込ませ、「どうして性に関する取り組みが必要になったかを説明するスライドを7枚にまとめて作成してください」とお願いしている画面" width="960" height="614" loading="lazy" decoding="async" />
  <figcaption>▲ 左に4年分の報告書。右のStudioで「スライド」を選び、下の入力欄に“1行”お願いするだけ</figcaption>
</figure>

あとは待つだけ。数分で、資料の中身にそったスライドができあがります。

### ③ 数分で、7枚できあがりました

これが、たった1行のお願いから **AIがつくった7枚のスライド** です。4年分の報告書を読み解いて、「表紙 → 支援の出発点 → 自己決定の広がり → 起きている課題 → 包括的性教育へ → 支援者の壁 → 結論」と、**ちゃんと筋の通った流れ**に束ねてくれました。

<div class="slide-gallery">
  <figure><img src="/images/ai-tips/nlm-slide-1.png" alt="スライド1枚目：表紙「障害のある人の『自立』に、なぜ『性』の支援が必要なのか？」" width="800" height="449" loading="lazy" decoding="async" /><figcaption>1. 表紙</figcaption></figure>
  <figure><img src="/images/ai-tips/nlm-slide-2.png" alt="スライド2枚目：「親の願い」から「本人の自己決定」へ" width="800" height="449" loading="lazy" decoding="async" /><figcaption>2. 支援の出発点が変わる</figcaption></figure>
  <figure><img src="/images/ai-tips/nlm-slide-3.png" alt="スライド3枚目：自己決定の広がり「愛する人と暮らしたい」という選択" width="800" height="449" loading="lazy" decoding="async" /><figcaption>3. 自己決定の広がり</figcaption></figure>
  <figure><img src="/images/ai-tips/nlm-slide-4.png" alt="スライド4枚目：現場の現実、教えられないことで起きる負の連鎖" width="800" height="449" loading="lazy" decoding="async" /><figcaption>4. 現場で起きている課題</figcaption></figure>
  <figure><img src="/images/ai-tips/nlm-slide-5.png" alt="スライド5枚目：人権と自己決定の基盤、包括的性教育へのパラダイムシフト" width="800" height="449" loading="lazy" decoding="async" /><figcaption>5. 包括的性教育へ</figcaption></figure>
  <figure><img src="/images/ai-tips/nlm-slide-6.png" alt="スライド6枚目：支援者と社会の課題、寝た子を起こすなの壁を越える" width="800" height="449" loading="lazy" decoding="async" /><figcaption>6. 支援者の壁を越える</figcaption></figure>
  <figure><img src="/images/ai-tips/nlm-slide-7.png" alt="スライド7枚目：結論、豊かな巣立ちを真に支えるための自立ピラミッド" width="800" height="449" loading="lazy" decoding="async" /><figcaption>7. 結論（自立ピラミッド）</figcaption></figure>
</div>

デザインや図解も、AIがいい感じに整えてくれます。もちろん、このあと **文言を直したり、順番を入れかえたり** も自由。「たたき台がゼロから一気に7枚」——ここまでが、数分の出来事です。

## ここが、うれしいところ

- **読み返す手間がない** … 4年分の報告書に、ぜんぶ目を通してくれます。人が全部読み直さなくても、要点を拾ってスライドにしてくれます。
- **資料に“そって”作ってくれる** … NotebookLMは、渡した資料だけを見て作ります。だから、**事実からかけ離れた内容になりにくい**のが安心です。
- **たたき台がすぐできる** … 「まっさらから作る」より、「できあがったものを直す」ほうがずっと楽。枚数（今回は7枚）や切り口も、お願いの言葉で変えられます。

## 気をつけたいこと

とても便利ですが、福祉の現場では次の点を忘れずに。

<div class="qa">
  <div class="qa__row qa__row--ai">
    <div class="qa__avatar">🤖</div>
    <p class="qa__bubble"><strong>①利用者さんの個人情報を含む資料は、そのまま入れない</strong>：氏名・住所・障害や病気のことなどが載った資料は要注意です。入れるのは <strong>公開済みの資料や、個人が分からないように整えたもの</strong> にしましょう。事業所のルールも必ず確認を。</p>
  </div>
</div>

- **②できたスライドは“下書き”です** … そのまま使わず、**最後は必ず人が読み、事実（日付・数字・固有名詞）を確認**してください。AIが取りちがえることもあります。
- **③大事な場面ほど、ひと手間を** … 対外的な発表や公式な報告に使うときほど、内容のチェックと言葉の手直しを大切に。

> **ひとこと：** 今回のように、**自分たちの活動報告そのものを資料にできる**のがポイントです。「4年間、何を積み重ねてきたか」を、AIがきれいに束ねてくれる。日々の記録が、そのまま“伝える力”に変わります。

「こんなこと、パソコンやAIでできる？」というギモンがあれば、[お問い合わせフォーム](/contact/)からぜひ教えてください。次の「教えてAIさん」で取り上げるかもしれません。
