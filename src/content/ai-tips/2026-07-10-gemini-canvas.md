---
title: “文書づくり”が一変する ― Gemini Canvasで、案内文も議事録も“その場で”仕上げる
date: 2026-07-10
summary: お知らせや案内文、議事録づくり。毎回イチから書くのは大変ですよね。GoogleのAI「Gemini」のCanvasという機能を使うと、話しかけるだけで下書きができて、その場で直せます。AIを使ったことがない方向けに、やさしく紹介します。
series: [google]
---

お知らせ、見学の案内文、会議の議事録、研修の資料——。福祉の現場は、**文書をつくる場面**がとても多いですよね。毎回まっさらな画面から書きはじめるのは、なかなか骨が折れます。

今回は、その文書づくりが **ぐっと楽になる** 方法です。むずかしそうに聞こえるかもしれませんが、やることは **“話しかけるだけ”**。AIを使ったことがない方でも大丈夫。ゆっくりご紹介します。

<div class="qa">
  <div class="qa__row qa__row--me">
    <div class="qa__avatar">🙂</div>
    <p class="qa__bubble">文章を書くのが苦手で、案内文とか毎回すごく時間がかかっちゃう…。AIって、そういうのも手伝ってくれるの？</p>
  </div>
  <div class="qa__row qa__row--ai">
    <div class="qa__avatar">🤖</div>
    <p class="qa__bubble">得意ですよ！ とくに Google の「Gemini（ジェミニ）」というAIの <strong>Canvas（キャンバス）</strong> という機能がぴったり。「こんな文章を作って」と話しかけると下書きを作って、「もう少し短く」などと言えば <strong>その場で直して</strong> くれます。いっしょにやってみましょう。</p>
  </div>
</div>

<div class="callout series-nav">
  <span class="callout__label">🧰 特集・Googleの道具箱</span>
  <p>この記事は、特集<strong>「Googleの道具箱 ― いつものGoogleで、ここまでできる」</strong>（全6回）の第1回です。今回の道具：<strong>机</strong>——Claude 版の「<a href="/ai-tips/2026-08-15-dougu-1-claude-desktop/">Claude Desktop</a>」にあたる、AIと一緒に書類を仕上げる場所。無料の Google アカウントで使えます。</p>
  <ol class="series-nav__list">
    <li class="is-current">Gemini Canvasで、案内文も議事録も“その場で”仕上げる（この記事）</li>
    <li><a href="/ai-tips/2026-07-10-notebooklm-slides/">スライド作成も、AIさんに“1行”お願いするだけ ― Gemini Notebook（旧 NotebookLM）で資料づくり</a></li>
    <li><a href="/ai-tips/2026-07-12-notebooklm-custom-instructions/">AIさんに“最初のお約束”を渡そう ― Gemini Notebook のカスタム指示</a></li>
    <li><a href="/ai-tips/2026-07-19-ai-keys-calendar-mail/">AIに“合鍵”を渡すと、秘書になる ― 手帳とメールをつなぐ</a></li>
    <li><a href="/ai-tips/2026-08-23-google-1-drive-hands/">Googleドライブを、AIの“手”にする ― フォルダごと読ませる3つの道</a></li>
    <li><a href="/ai-tips/2026-08-23-google-2-gem-studio/">Gemをつくる ― うちの事情を覚えたGeminiを、ひとり用意する（発展編：Workspace Studioで“流れ”を組む）</a></li>
  </ol>
</div>

## そもそも「Gemini」「Canvas」って？

はじめての方のために、かんたんに。

- **Gemini（ジェミニ）** … Google がつくった **無料で使えるAI**。パソコンやスマホで、チャット（文字での会話）のように質問やお願いができます。
- **Canvas（キャンバス）** … その Gemini の中にある、**文書をその場で作って直せる“作業スペース”**。ふつうの会話と違って、**画面の右側にできあがった文書がドンと表示され、気になるところだけ直せる**のが便利なところです。

むずかしい言葉は覚えなくて大丈夫。**ふだんの話し言葉でお願いすればOK**です。

## やってみよう

1. **Gemini を開く** … パソコンで `gemini.google.com` を開き、お持ちの Google アカウントでログインします（スマホのアプリでもOK）。
2. **Canvas をオンにする** … 「Gemini に相談」と書かれた入力欄の **左にある「＋」ボタン** を押し、開いたメニューから **「Canvas」を選びます**（メニューに見当たらないときは、「その他のツール」の中にあります）。入力欄に「Canvas」の札が付けばOKです。

<figure class="mockup mockup--wide mockup--shot">
  <img src="/images/ai-tips/canvas-00-home.webp" alt="Gemini の最初の画面。「Gemini に相談」の入力欄の左にある＋ボタンを赤枠で示している" width="850" height="250" loading="lazy" decoding="async" />
  <figcaption>▲ ① 「Gemini に相談」の左の「＋」を押します</figcaption>
</figure>

<figure class="mockup mockup--wide mockup--shot">
  <img src="/images/ai-tips/canvas-01-menu.webp" alt="＋を押して開いたメニュー。ファイルをアップロード、ドライブから追加、画像を作成などの項目の中に Canvas があり、見当たらない場合は「その他のツール」の中にあることを赤枠で示している" width="540" height="400" loading="lazy" decoding="async" />
  <figcaption>▲ ② メニューの「Canvas」。無ければ「その他のツール」→「Canvas」</figcaption>
</figure>

<figure class="mockup mockup--wide mockup--shot">
  <img src="/images/ai-tips/canvas-02-chip.webp" alt="入力欄に「Canvas」の札が付いた状態。案内文が「一緒に文章を書いたり、コンテンツを作成したりしましょう」に変わっている" width="740" height="130" loading="lazy" decoding="async" />
  <figcaption>▲ ③ 入力欄に「Canvas」の札が付きました</figcaption>
</figure>

3. **お願いする** … あとは、作ってほしい文書を **ふつうの言葉で** 頼むだけ。たとえば——

<div class="ai-prompt">
  <span class="ai-prompt__label">お願いの例</span>
  就労継続支援B型の事業所の、<strong>見学のご案内文</strong>を作ってください。やさしく、あたたかい感じで。連絡先を書く欄も入れてください。
</div>

4. **画面を見てみる** … すると、**左側で会話しながら、右側にできあがった文書**が表示されます。

<figure class="mockup mockup--full mockup--shot">
  <img src="/images/ai-tips/canvas-03-open.webp" alt="Canvas が開いた実際の画面。左でお願いの会話、右に「あきの えんそくの おしらせ」という文書が表示されている。右上に印刷・作成・共有のボタン" width="1300" height="750" loading="lazy" decoding="async" />
  <figcaption>▲ ④ 左＝お願いする／右＝できた文書（「秋の遠足のお知らせ」を頼んだ例）。右の文書は、話しかけるだけで何度でも直せます</figcaption>
</figure>

5. **直す** … できた文書は、次のように自由に直せます。むずかしい操作はいりません。
   - **自分で直接打ち直す** … 右の文書は、ふつうの文書と同じように **カーソルを置いて自分で書き換え** られます。ちょっとした誤字はここでサッと直せます。
   - **選んだ部分だけAIに直してもらう** … 直したいところを **マウスでなぞって選び**、「**この部分を、もっとやさしく直して**」のようにお願いすると、**その箇所だけ** を直してくれます。文書全体を作り直さなくていいので、とても手軽です。
   - **全体をまとめてお願い** … 「もう少し短く」「やさしい言葉に」「箇条書きに」「日付の欄を足して」なども、話しかけるだけ。

<figure class="mockup mockup--wide mockup--shot">
  <img src="/images/ai-tips/canvas-04-select.webp" alt="Canvas の文書で一文をなぞって選ぶと、すぐ下に「Gemini に相談」という小さな入力欄が出る実際の画面" width="800" height="400" loading="lazy" decoding="async" />
  <figcaption>▲ ⑤ 直したい所をなぞると「Gemini に相談」が出ます。「この部分をもっとやさしく」と頼めば、その箇所だけ直してくれます</figcaption>
</figure>

6. **仕上げる** … 気に入ったら、文書の右上にある **共有ボタン**から **「Google ドキュメントにエクスポート」**（書き出し）を選ぶか、「内容をコピー」して Word などに貼り付けて完成です。

<figure class="mockup mockup--wide mockup--shot">
  <img src="/images/ai-tips/canvas-05-export.webp" alt="共有ボタンを押して出るメニュー。Google ドライブで共有、Google ドキュメントにエクスポート（赤枠）、内容をコピー" width="345" height="190" loading="lazy" decoding="async" />
  <figcaption>▲ ⑥ 「Google ドキュメントにエクスポート」で、いつものドキュメントに</figcaption>
</figure>

<div class="callout">
  <span class="callout__label">画面は変わります</span>
  <p>この記事の画面は 2026年8月に撮ったものです。Gemini はボタンの場所や名前がときどき変わります。見つからないときは、<strong>「＋」の中を探す</strong>、それでも無ければ <strong>Gemini 自身に「Canvas はどこ？」と聞く</strong>のが早道です。</p>
</div>

## Canvas のうれしいところ

ふつうのAIとの会話は、返事が下へ下へと流れていって「さっきの文章どこ？」となりがちです。Canvas は **文書がいつも右側に表示されたまま**なので、

- **自分で直接** 打ち直すことも、**選んだところだけAIに直してもらう**こともできる
- 気に入らないところ **だけ** をピンポイントで直せる（全部を作り直さなくていい）
- 「やっぱり前のほうがよかった」もやり直せて、完成形を **見ながら** 進められる

——と、まさに“**清書しながら相談できる**”感覚。これが文書づくりに向いている理由です。

## こんなときに

- **お知らせ・案内文**（見学、行事、募集）
- **議事録の清書**（走り書きのメモを渡して「読みやすく整えて」）
- **研修資料のたたき台**
- **家族へのお手紙**の下書き
- **申請書類**の文章の下書き

## 気をつけたいこと

とても便利ですが、福祉の現場では次の3つを忘れずに。

<div class="qa">
  <div class="qa__row qa__row--ai">
    <div class="qa__avatar">🤖</div>
    <p class="qa__bubble"><strong>①利用者さんの個人情報は入れない</strong>：氏名・住所・障害や病気のことなどは、そのままAIに書き込まないでください。「Aさん」などに置きかえて相談を。</p>
  </div>
</div>

- **②AIの文章は“下書き”です** … そのまま使わず、**最後は必ず自分の目で読み、自分の言葉で仕上げて**ください。事実（日付・金額・固有名詞）も確認を。
- **③公式な書類は要件の確認を** … 助成金の申請などは、決まった書き方・必要項目があります。AIの下書きは出発点として使い、**正式な要件は必ず原本・募集要項で確認**してください。

> **ひとこと：** AIは「代わりに全部やってくれる魔法」ではなく、**“いつでも相談できる下書き係”**。最後の主役は、いつも書き手であるあなたです。肩の力を抜いて、まずは一度、話しかけてみてください。

「こんなこと、パソコンやAIでできる？」というギモンがあれば、[お問い合わせフォーム](/contact/)からぜひ教えてください。次の「教えてAIさん」で取り上げるかもしれません。
