---
title: Gemをつくる ― うちの事情を覚えたGeminiを、ひとり用意する（発展編：Workspace Studioで“流れ”を組む）
date: 2026-08-23
summary: 「前も同じ説明をしたのに……」Gemini にも、“うちのやり方”を先に覚えさせる仕組みがあります。その名も Gem（ジェム）。名前と指示を書くだけ、無料で作れて、プログラミングは要りません。後半は発展編——有料の Google Workspace なら、「毎朝7時に」「フォームに回答が来たら」といった“きっかけ”から自動で動く流れを、Workspace Studio で組めます。特集「Googleの道具箱」最終回。
draft: false
kind: practice
series: [google]
---

「道具の入手」の締めくくりは、道具を組み合わせて「話すだけでたまる」仕組みを動かすことでした。Google の道具箱も、ここで仕上げます。足りない最後の道具は、**“うちのやり方”を先に渡しておくカード**——Claude でいう[スキル（レシピカード）](/ai-tips/2026-07-17-ai-skills-recipe-card/)です。

Google では、これを **Gem（ジェム）** と呼びます。

<div class="callout series-nav">
  <span class="callout__label">🧰 特集・Googleの道具箱</span>
  <p>この記事は、特集<strong>「Googleの道具箱 ― いつものGoogleで、ここまでできる」</strong>（全6回）の第6回・最終回です。今回の道具：<strong>レシピカード（その2）</strong>——Claude 版の「スキル」にあたる Gem。発展編として、<strong>目覚まし時計</strong>——Claude 版の「<a href="/ai-tips/2026-07-20-ai-alarm-scheduled-tasks/">定期タスク</a>」にあたる Workspace Studio も。</p>
  <ol class="series-nav__list">
    <li><a href="/ai-tips/2026-07-10-gemini-canvas/">Gemini Canvasで、案内文も議事録も“その場で”仕上げる</a></li>
    <li><a href="/ai-tips/2026-07-10-notebooklm-slides/">スライド作成も、AIさんに“1行”お願いするだけ ― Gemini Notebook（旧 NotebookLM）で資料づくり</a></li>
    <li><a href="/ai-tips/2026-07-12-notebooklm-custom-instructions/">AIさんに“最初のお約束”を渡そう ― Gemini Notebook のカスタム指示</a></li>
    <li><a href="/ai-tips/2026-07-19-ai-keys-calendar-mail/">AIに“合鍵”を渡すと、秘書になる ― 手帳とメールをつなぐ</a></li>
    <li><a href="/ai-tips/2026-08-23-google-1-drive-hands/">Googleドライブを、AIの“手”にする ― フォルダごと読ませる3つの道</a></li>
    <li class="is-current">Gemをつくる ― うちの事情を覚えたGeminiを、ひとり用意する（この記事）</li>
  </ol>
</div>

## Gem とは ― 「役と約束」を先に渡した、専用の Gemini

ふだんの Gemini は、毎回まっさらな状態で話が始まります。だから「うちは就労継続支援B型で、お知らせはふりがな付きで、敬語は『です・ます』で……」と、毎回説明することになる。

Gem は、その **説明を先に書いておいた、専用の Gemini** です。「お知らせ書き係」「記録のたたき台係」のように名前を付けて、役割と約束（指示）を登録しておく。次からはその Gem を開くだけで、説明なしに“うちのやり方”で動きます。第3回の Gemini Notebook の「カスタム指示」と同じ考え方を、Gemini 本体でやるものと思ってください。

<div class="qa">
  <div class="qa__row qa__row--me">
    <div class="qa__avatar">🙂</div>
    <p class="qa__bubble">Claude のスキルと、同じものですか？</p>
  </div>
  <div class="qa__row qa__row--ai">
    <div class="qa__avatar">🤖</div>
    <p class="qa__bubble">役どころは同じです。<strong>「うちのやり方を、先に渡しておく」</strong>。違いは入れ物で、スキルは文章のファイル、Gem は Gemini の画面の中に保存する設定——そのぶん、Gem のほうが<strong>作るのがさらに簡単</strong>です。名前と指示を書いて保存、それだけですから。</p>
  </div>
</div>

## 作り方 ― 名前と指示を書いて、保存するだけ【無料】

実際の画面で、順番に見ていきましょう（画面は 2026年8月のもの。赤い番号は、本文の番号と対応しています）。無料の Google アカウントでも作れます（使える回数や AI の種類に上限があります）。

**① 「Gem」を開く** — パソコンで **gemini.google.com** を開き、左上のメニューを広げて **「Gem」** を選びます。

<figure class="mockup mockup--wide mockup--shot">
  <img src="/images/ai-tips/gem-01-sidebar.webp" alt="Gemini の左メニュー。チャットを新規作成・チャットを検索・画像・動画・ライブラリの下にある「Gem」を赤枠で示した画面" width="640" height="290" loading="lazy" decoding="async" />
  <figcaption>▲ ① 左のメニューのいちばん下、「Gem」</figcaption>
</figure>

**② 「Gem を作成」を押す** — 「Gem マネージャー」という画面が開きます。上には Google が用意した Gem が並んでいて（介護記録向けの「ケア記録アシスト」もあります）、その下の **「＋ Gem を作成」** を押します。

<figure class="mockup mockup--full mockup--shot">
  <img src="/images/ai-tips/gem-02-manager.webp" alt="Gem マネージャーの画面。Google が作成した Gem（コーディング パートナー、Storybook、アイデア出しのプロ、ケア記録アシスト）の下に、マイ Gem と「Gem を作成」ボタンがあり、ボタンを赤枠で示している" width="1084" height="430" loading="lazy" decoding="async" />
  <figcaption>▲ ② 右側の「＋ Gem を作成」</figcaption>
</figure>

**③〜⑥ 名前・説明・指示を書いて、保存** — 新しい Gem の画面です。**③名前**（例：お知らせ書き係）、**④説明**（ひとこと）、**⑤カスタム指示**（役割と約束。下に例を置きました）を書いて、右上の **⑥保存**。「知識」の欄に、事業所の書き方見本や用語集のファイルを添えることもできます。

<figure class="mockup mockup--full mockup--shot">
  <img src="/images/ai-tips/gem-03-form.webp" alt="新しい Gem の作成画面。左に名前・説明・カスタム指示の入力欄（赤枠で③④⑤）、右にプレビュー、右上に保存ボタン（赤枠で⑥）" width="1240" height="720" loading="lazy" decoding="async" />
  <figcaption>▲ ③名前 ④説明 ⑤カスタム指示 を書いて、⑥保存。右側はプレビューです</figcaption>
</figure>

<div class="ai-prompt">
  <span class="ai-prompt__label">⑤ 指示の例 ― 「お知らせ書き係」</span>
  あなたは、就労継続支援B型事業所の「お知らせ書き係」です。私が用件を箇条書きで渡したら、利用者さんとご家族向けのお知らせ文を作ってください。約束：①一文は短く、むずかしい言葉はやさしい言葉に②漢字には（　）でふりがな③日付・場所・持ち物は最初にまとめて④最後に「わからないことは職員に聞いてください」を入れる⑤敬語は「です・ます」。個人名や個人情報は、私が渡しても文面には入れず「〇〇さん」のままにしてください。
</div>

**⑦ 「チャットを開始」** — 保存すると「Gem『お知らせ書き係』を作成しました」と出ます。**「チャットを開始」** を押すと、その Gem との会話が始まります。

<figure class="mockup mockup--wide mockup--shot">
  <img src="/images/ai-tips/gem-04-saved.webp" alt="「Gem『お知らせ書き係』を作成しました」のダイアログ。共有と、チャットを開始（赤枠で⑦）のボタン" width="560" height="334" loading="lazy" decoding="async" />
  <figcaption>▲ ⑦ 「チャットを開始」</figcaption>
</figure>

**⑧ 用件を渡す** — Gem の名前と説明が出た画面で、下の入力欄に **用件を箇条書きで** 入れるだけ。説明はもう要りません。

<figure class="mockup mockup--full mockup--shot">
  <img src="/images/ai-tips/gem-05-start.webp" alt="作成した Gem「お知らせ書き係」の画面。名前と説明の下に入力欄があり、赤枠で⑧" width="1340" height="580" loading="lazy" decoding="async" />
  <figcaption>▲ ⑧ 「・9月12日（金）に避難訓練 ・10時に玄関前に集合 ・動きやすい靴 ・雨なら中止、朝8時に連絡」と入れてみました</figcaption>
</figure>

<figure class="mockup mockup--full mockup--shot">
  <img src="/images/ai-tips/gem-06-result.webp" alt="Gem の回答。利用者（りようしゃ）のみなさん、ご家族（かぞく）のみなさまへ、と漢字にふりがなが付き、日にちと時間・場所・持ち物が最初にまとめられたお知らせ文" width="1340" height="640" loading="lazy" decoding="async" />
  <figcaption>▲ 約束どおり、ふりがな付きで、日付・場所・持ち物が最初に。ここから先は「もう少し短く」と話しかけて直すだけです</figcaption>
</figure>

指示を自分で書くのが大変なら、**Gemini 本人に書かせる**のがいちばん早い方法です。

<div class="ai-prompt">
  <span class="ai-prompt__label">お願いの一言</span>
  福祉事業所で「お知らせをやさしい日本語に書き換える係」の Gem を作りたい。役割・約束・出力の形を決めた指示文を、そのまま Gem の指示欄に貼れる形で書いて。
</div>

こうして作った Gem は、Google ドライブでファイルを共有するのと同じ要領で **同僚に共有** できます（2025年9月から。職場の Workspace では、外部共有の可否は管理者の設定に従います）。「うちのやり方」を、人が変わっても引き継げる——レシピカードを引き出しに入れた状態です。

## どんな Gem から始めるか ― 現場向けの3枚

- **お知らせ書き係** —— 上の例。[“やさしい日本語”の回](/ai-tips/2026-08-07-ai-easy-japanese/)の頼み方を、Gem に焼き込んだもの
- **記録のたたき台係** —— 「今日あったことを話すと、記録の形式に整える」。ただし、[個人情報の線引き](/ai-tips/2026-07-28-ai-privacy-line/)を指示の中に必ず書く（名前は入れない、ぼかす）
- **問い合わせ返信係** —— 見学・問い合わせへの返信の下書き。「事業所の基本情報」を知識ファイルとして添えておく

## 発展編 ― Workspace Studio で、“流れ”を組む【有料 Workspace】

ここから先は、職場で **有料の Google Workspace** をお使いの方向けです。

Gem は「開いて、頼む」道具でした。呼べば来る。でも、実践編の最終回で[目覚まし時計](/ai-tips/2026-07-20-ai-alarm-scheduled-tasks/)の話をしたとおり、本当の秘書は **呼ばれる前に動きます**。Google でそれを担うのが、2025年12月から提供されている **Workspace Studio（ワークスペース・スタジオ）** です。

やることは、**「きっかけ」と「やること」を並べる** だけ。Workspace Studio の画面では、きっかけを **スターター**、やることを **ステップ** と呼びます。

<figure class="mockup mockup--wide">
  <img src="/images/ai-tips/google-2-studio-flow.svg" alt="Workspace Studio の流れの図。スターター（きっかけ：毎朝7時に／フォームに回答が来たら）→ ステップ（やること：未読メールを要約／返信の下書き）→ 結果（Chat に届く／シートにたまる）" width="640" height="200" loading="lazy" decoding="async" />
  <figcaption>▲ きっかけ → やること → 結果。これが1本の“流れ”です</figcaption>
</figure>

- **スターター（きっかけ）** —— 「毎朝7時に」といった時刻、「フォームに回答が来たら」「メールが届いたら」といった出来事、あるいは手動のボタン
- **ステップ（やること）** —— 「未読メールを要約する」「返信の下書きを作る」「スプレッドシートに1行追加する」「Chat に知らせる」など。Gmail・ドライブ・ドキュメント・スプレッドシート・フォーム・Chat・ToDo リストの道具が用意されていて、いくつでもつなげられます
- **作り方** —— ひな型から選ぶか、**やりたいことを言葉で書く** と Gemini が流れの案を組み立ててくれます。プログラミングは要りません

現場で組むなら、たとえばこんな流れです。

| きっかけ | やること | 結果 |
|---|---|---|
| 毎朝7時 | 未読メールのうち、返事が要るものを要約 | Chat に「今日の返事リスト」が届く |
| 見学申込フォームに回答が来たら | 内容をスプレッドシートに1行追加 → 返信の下書きを作る | 下書きを人が確認して送る |
| 毎週金曜17時 | 今週の「決まったこと」ドキュメントを要約 | 申し送り用の要約が Chat に届く |

<div class="callout">
  <span class="callout__label">プランと、確認したこと</span>
  <p>Workspace Studio は <strong>Business Starter・Standard・Plus、Enterprise Standard・Plus、Education の各プラン</strong>で使えます（2025年12月の Google の案内）。無料の個人アカウントでは使えません。流れを何回動かせるかの上限や、どの道具（ステップ）を職員に使わせるかは、プランと <strong>Google 管理者の設定</strong> によって変わります。導入前に管理者の方にご相談ください（2026年8月23日時点の確認。画面や名称は変わることがあります）。</p>
</div>

## 気をつけたいこと ― “見ていない間に動く”ということ

目覚まし時計の回と、まったく同じです。

- **最初は「知らせるだけ」から** —— 送信や削除など取り消しにくいことは、最初は人が確認してから。「下書きを作る」で止めて、送るのは人
- **個人情報は、流れの中にも入れない** —— フォームの回答やメールには利用者さんの情報が混じります。流れの中で AI に渡す部分は、[個人情報の線引き](/ai-tips/2026-07-28-ai-privacy-line/)をそのまま当てはめてください
- **職場のルールを先に** —— 自動で動く仕組みは、作った人がいなくなっても動き続けます。「誰が作って、何が動いているか」を一覧にしておくのが、長く使うコツです

## むすびに ― 道具箱は、2つそろった

これで **Google の道具箱** が一式そろいました。机（Canvas）、ノート（Gemini Notebook）、合鍵（手帳とメール）、手（ドライブ）、レシピカード（Gem）、そして目覚まし時計（Workspace Studio）。[道具の入手](/ai-tips/#dougu)でそろえた Claude の道具箱と、役どころはひとつずつ対応しています。

どちらの道具箱を開けるかは、お使いの環境しだい。**大事なのは道具の名前ではなく、「AI に何を持たせるか」という考え方のほう**です。その考え方は、[連載「AIに道具を持たせる」](/ai-tips/2026-07-13-ai-tools-1-same-question/)でお話ししたとおり、Claude でも Google でも変わりません。

あわせて読みたい：[AIに“技”を覚えてもらう ― スキルという名のレシピカード（Claude 版）](/ai-tips/2026-07-17-ai-skills-recipe-card/)／[AIに“目覚まし時計”を持たせる](/ai-tips/2026-07-20-ai-alarm-scheduled-tasks/)／[無料と有料、なにが違う？](/ai-tips/2026-08-07-ai-free-vs-paid/)

「こんなこと、パソコンやAIでできる？」というギモンがあれば、[お問い合わせフォーム](/contact/)からぜひ教えてください。次の「教えてAIさん」で取り上げるかもしれません。
