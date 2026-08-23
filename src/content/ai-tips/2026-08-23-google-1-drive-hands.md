---
title: Googleドライブを、AIの“手”にする ― フォルダごと読ませる3つの道
date: 2026-08-23
summary: 「このフォルダの書類、ぜんぶ読んで要点をまとめて」——Claude なら Filesystem という“手”で実現した頼みごとを、Google の道具でもやってみます。道は3つ。Gemini アプリにドライブのファイルを渡す、Gemini Notebook にドライブをつないで自動で追いかけさせる、そしてドライブの中で Gemini にフォルダを指定する。無料でできるものと、有料の Workspace が要るものを、正直に分けてご紹介します。特集「Googleの道具箱」第5回。
draft: false
kind: practice
series: [google]
---

「道具の入手」の第2回で、Claude に **Filesystem** という道具を差しました。許可したフォルダの中を AI が読み書きできる、“手”にあたる道具です。あの回を読んで、こう思った方がいらっしゃるはずです。

「うちは Google なんだけど……同じこと、できないの？」

できます。ただし、**Google の“手”は1本ではなく3本**あって、それぞれ届く範囲と値段が違います。今回はその3本を、無料で使えるものから順に見ていきます。

<div class="callout series-nav">
  <span class="callout__label">🧰 特集・Googleの道具箱</span>
  <p>この記事は、特集<strong>「Googleの道具箱 ― いつものGoogleで、ここまでできる」</strong>（全6回）の第5回です。今回の道具：<strong>手</strong>——Claude 版の「<a href="/ai-tips/2026-08-15-dougu-2-filesystem/">Filesystem</a>」にあたる、フォルダの中を読ませる仕組み。</p>
  <ol class="series-nav__list">
    <li><a href="/ai-tips/2026-07-10-gemini-canvas/">Gemini Canvasで、案内文も議事録も“その場で”仕上げる</a></li>
    <li><a href="/ai-tips/2026-07-10-notebooklm-slides/">スライド作成も、AIさんに“1行”お願いするだけ ― Gemini Notebook（旧 NotebookLM）で資料づくり</a></li>
    <li><a href="/ai-tips/2026-07-12-notebooklm-custom-instructions/">AIさんに“最初のお約束”を渡そう ― Gemini Notebook のカスタム指示</a></li>
    <li><a href="/ai-tips/2026-07-19-ai-keys-calendar-mail/">AIに“合鍵”を渡すと、秘書になる ― 手帳とメールをつなぐ</a></li>
    <li class="is-current">Googleドライブを、AIの“手”にする ― フォルダごと読ませる3つの道（この記事）</li>
    <li><a href="/ai-tips/2026-08-23-google-2-gem-studio/">Gemをつくる ― うちの事情を覚えたGeminiを、ひとり用意する（発展編：Workspace Studioで“流れ”を組む）</a></li>
  </ol>
</div>

## 手がないと、AIは「貼った分」しか読めない

おさらいです。ふつうに Gemini と話すとき、AI が読めるのは **チャットに貼ったもの、添付したもの** だけ。事業所の書類が 30 本あっても、1 本ずつ渡さなければ読めません。「フォルダの中、ぜんぶ見て」が通じないのです。

Claude では、パソコンの中のフォルダを1つ許可することで、これを解決しました。Google の場合、書類はパソコンの中ではなく **Google ドライブ（雲の上）** にあることが多い。だから“手”も、ドライブに向かって伸ばします。

<figure class="mockup mockup--wide">
  <img src="/images/ai-tips/google-toolbox.svg" alt="Claudeの道具箱とGoogleの道具箱の対応表。手の行に、Filesystem と Googleドライブ＋Gemini が対応している" width="640" height="230" loading="lazy" decoding="async" />
  <figcaption>▲ 「手」の行が今回。Claude の Filesystem に対して、Google はドライブ＋Gemini です</figcaption>
</figure>

## 道① Gemini アプリに、ドライブのファイルを渡す【無料】

いちばん手軽な道です。Gemini アプリ（gemini.google.com やスマホアプリ）のチャット欄にある **「＋」** から、パソコンのファイルだけでなく **Google ドライブの中のファイル** を選んで渡せます。ドキュメント、スプレッドシート、PDF など、ドライブに置いてあるものをその場で読ませられます。

<div class="ai-prompt">
  <span class="ai-prompt__label">お願いの例（ドライブから書類を1本渡して）</span>
  この書類を読んで、①何についての文書か　②職員が今週までにやることは何か　③分かりにくい言葉があればやさしく言い換えて、の順で教えてください。
</div>

ただし、これは「手」というより **「1本ずつ手渡し」** です。フォルダごと、とはいきません。毎回選ぶのが面倒になってきたら、次の道へ。

## 道② Gemini Notebook に、ドライブをつないでおく【無料】

第2回・第3回でご紹介した NotebookLM——2026年7月から **Gemini Notebook** という名前になりました——は、資料を「ソース」として入れておき、そこから答えたり作ったりする道具でした。

このソースに、ドライブの **ドキュメント・スプレッドシート・スライド** を入れておくと、**ドライブ側でファイルを直したときに、ノートブックの中身も自動で追いかけてくれる** ようになりました（2026年5月末から順次）。以前は「ドライブで直したら、ノートブック側でも入れ直し」だったのが、入れっぱなしでよくなったわけです。

<div class="ai-prompt">
  <span class="ai-prompt__label">やること</span>
  Gemini Notebook で新しいノートブックを作る → 「ソースを追加」→「Google ドライブ」→ 読ませたい書類を選ぶ。あとは、ふだんどおり質問するだけ。
</div>

<div class="callout">
  <span class="callout__label">ここは正直に</span>
  <p>自動で追いかけてくれるのは、<strong>Google の形式（ドキュメント・スプレッドシート・スライド）</strong>のファイルです。PDF や画像は入れられますが、直しても自動では追いかけません。また、入れるのは<strong>ファイル単位</strong>です。「フォルダを指定したら中身ぜんぶ」ではないので、書類が増えたら足してください（2026年8月23日時点の確認。今後変わる可能性があります）。</p>
</div>

“申し送りノート”の Google 版を作るなら、この道がいちばん近い。「相談の要点」「決まったこと」をドキュメントに書きためておき、そのドキュメントをソースに入れておく。ドキュメントに1行足せば、ノートブックの AI もそれを知っている——という形になります。

## 道③ ドライブの中で、Gemini にフォルダを指定する【有料 Workspace】

3本目が、いちばん Filesystem に近い道です。職場で **有料の Google Workspace**（Business Standard 以上）をお使いなら、ドライブの画面に **Gemini のサイドパネル** が出ます。ここで **フォルダを指定** して「このフォルダの中で」と頼むと、フォルダの中のファイルをまとめて読んで、要約したり、探したり、横断して答えたりしてくれます。フォルダを開いたときに出る「このフォルダを要約」のようなボタンが入口です。

<div class="ai-prompt">
  <span class="ai-prompt__label">お願いの例（フォルダを指定して）</span>
  このフォルダの中の書類から、「送迎」について書いてあるところをぜんぶ拾って、ファイル名つきで一覧にしてください。
</div>

<div class="callout">
  <span class="callout__label">プランのこと</span>
  <p>ドライブやドキュメントの中に出る Gemini のサイドパネルは、2026年8月時点では <strong>Business Standard・Business Plus・Enterprise</strong> の各プランに含まれています。いちばん安い Business Starter や、無料の個人アカウントでは出ません。職場のプランは、Google 管理者の方か契約書でご確認ください。</p>
</div>

## 3本の手を、並べてみると

| 道 | 読ませ方 | 届く範囲 | 費用 |
|---|---|---|---|
| ① Gemini アプリ | ドライブから1本ずつ渡す | 渡した分だけ | 無料 |
| ② Gemini Notebook | ソースに入れておく（Google形式は自動で追いかける） | 入れた分だけ。直しは自動 | 無料 |
| ③ ドライブのサイドパネル | フォルダを指定する | フォルダの中ぜんぶ | 有料 Workspace（Business Standard 以上） |

Claude の Filesystem とのいちばんの違いは、**「書く」側**です。Filesystem は AI がフォルダの中に新しいファイルを作れました（だから「申し送りを書いておいて」が成立した）。Google の3本の手は、どれも **「読む」が主役**。AI に書かせたものは、Canvas（第1回）からドキュメントに書き出す、という一手間が要ります。この「書く」を自動にする話が、次回の発展編に出てくる Workspace Studio です。

<div class="qa">
  <div class="qa__row qa__row--me">
    <div class="qa__avatar">🙂</div>
    <p class="qa__bubble">無料の②だけでも、けっこう近いところまで行けるんですね。</p>
  </div>
  <div class="qa__row qa__row--ai">
    <div class="qa__avatar">🤖</div>
    <p class="qa__bubble">はい。「うちの事情を書いたドキュメント」を1本作って、Gemini Notebook のソースに入れておく——それだけで、私はその事業所のことを知っている状態から話を始められます。<strong>フォルダまるごと</strong>が要るかどうかは、書類が増えてから考えれば大丈夫ですよ。</p>
  </div>
</div>

## 気をつけたいこと ― “見せるフォルダ”の作法は、同じ

- **専用のフォルダ・専用の書類にする** —— Filesystem のときと同じです。ドライブの全部ではなく、「AI に見せる」と決めたものだけを1か所に。
- **個人情報の線引きは、ここでも同じ** —— 利用者さんの名前・生年月日・健康のことが書かれた書類を、そのまま AI に渡さない。[AIに話していいこと、いけないこと](/ai-tips/2026-07-28-ai-privacy-line/) の置きかえの考え方を、書類にも当てはめてください。
- **職場で使うなら、職場のルールを先に** —— 有料 Workspace の場合、AI に何を見せてよいかは管理者の設定と職場の方針で決まります。

## むすびに ― 手は伸びた。次は“うちのやり方”を覚えさせる

これで Google の道具箱にも、机（Canvas）・ノート（Gemini Notebook）・合鍵（手帳とメール）・手（ドライブ）がそろいました。最後に足りないのは、「毎回説明しなくても、うちのやり方で動いてくれる」こと——Claude でいう **スキル** です。次回は、Google 版のレシピカード **Gem** を作ります。そして発展編として、有料 Workspace で“流れ”そのものを組む **Workspace Studio** まで。

あわせて読みたい：[AIに“手”を持たせる ― 最初のコネクタ Filesystem（Claude 版）](/ai-tips/2026-08-15-dougu-2-filesystem/)／[AIと“申し送りノート”を持つ](/ai-tips/2026-07-16-ai-shared-workspace/)

「こんなこと、パソコンやAIでできる？」というギモンがあれば、[お問い合わせフォーム](/contact/)からぜひ教えてください。次の「教えてAIさん」で取り上げるかもしれません。
