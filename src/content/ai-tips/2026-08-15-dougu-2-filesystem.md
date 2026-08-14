---
title: AIに“手”を持たせる ― 最初のコネクタ Filesystem
date: 2026-08-15
summary: Claude Desktopを入れたら、まっ先に欲しい道具がこれ。Filesystem（ファイルシステム）というコネクタを差すと、AIが「許可したフォルダ」のファイルを読んだり書いたりできるようになります。書類を読んでもらう、整理してもらう、成果物をファイルで受け取る——世界がいちばん変わる回です。特集「道具の入手」第2回。
draft: false
kind: dougu
---

前回、AIの専用机（**Claude Desktop**）を用意しました。今回はその机に、最初の道具を差します。何といっても最初に欲しい道具——**Filesystem（ファイルシステム）** です。

<div class="callout series-nav">
  <span class="callout__label">特集・道具の入手コーナー</span>
  <p>この記事は、特集<strong>「道具の入手 ― AIの道具箱をそろえる」</strong>（全4回）の第2回です。</p>
  <ol class="series-nav__list">
    <li><a href="/ai-tips/2026-08-15-dougu-1-claude-desktop/">AIに“専用の机”を用意する ― Claude Desktopを迎え入れる</a></li>
    <li class="is-current">AIに“手”を持たせる ― 最初のコネクタ Filesystem（この記事）</li>
    <li><a href="/ai-tips/2026-08-15-dougu-3-obsidian/">知恵をためる“ノート”を手に入れる ― Obsidianという道具</a></li>
    <li><a href="/ai-tips/2026-08-15-dougu-4-data-center/">ClaudeとObsidianで、自分専用の“データセンター”をつくる</a></li>
  </ol>
</div>

## いまのAIは、目の前の書類に触れない

Claude Desktop を入れた直後のAIは、たとえるなら**手を後ろに組んだまま隣に座っている同僚**です。頭は良いのに、あなたの机の書類の山には一切触れません。

- 「このフォルダの書類、要点をまとめて」→ できない
- 「さっき作った文章、ファイルで保存して」→ できない（画面からコピペするしかない）

これを解決するのが **Filesystem** というコネクタです。差すと、AIに「**許可したフォルダの中**のファイルを読み書きする手」が生まれます。

<div class="callout">
  <span class="callout__label">ことばのメモ</span>
  <p><strong>コネクタ</strong>は、AIに新しい能力を差し足すための「道具」のこと。仕組みの名前としては <strong>MCP（エム・シー・ピー）</strong>とも呼ばれます。当コーナーでは「差込口に道具を差す」イメージで覚えていただければ十分です。Filesystem はその中でもいちばん基本の、公式の道具です。</p>
</div>

## だいじな安心：AIが触れるのは「見せたフォルダ」だけ

先に、いちばん気になるところを。Filesystem を入れても、**AIがパソコンの中を勝手に見て回れるわけではありません**。

- 触れるのは、**あなたが「ここは見ていいよ」と指定したフォルダの中だけ**です
- 練習用には、**新しく専用フォルダを1つ作って、そこだけを見せる**のがおすすめです（例：書類フォルダの中に「AI作業室」）

家に招いた人に「この部屋だけ使ってね」と鍵を1本渡すイメージです。家じゅうの鍵束を渡すわけではありません。

<figure class="mockup mockup--wide">
  <img src="/images/ai-tips/dougu-2-one-key.svg" alt="家の中に3つの部屋がある図。「写真」と「仕事の書類」の部屋には鍵がかかりAIは入れない。「AI作業室」だけ扉が開いていて、ロボットが中で働いている。AIに渡すのは、この部屋だけの鍵1本" width="640" height="300" loading="lazy" decoding="async" />
  <figcaption>▲ AIが入れるのは、鍵を渡した「AI作業室」だけ。ほかの部屋には入れません</figcaption>
</figure>

## 入手のしかた

現在は、アプリの中の**カタログから選んで追加するだけ**です。スマホにアプリを入れる感覚に近いですよ。

### ① 練習用のフォルダを作る

まず、AIに見せる専用フォルダをひとつ作ります（例：書類フォルダの中に「**AI作業室**」）。

### ② 設定の「コネクタ」を開く

画面の隅にある**自分の名前**（アカウントメニュー）を押して、「**設定**」を選びます。

<figure class="mockup mockup--shot">
  <img src="/images/ai-tips/ai-workspace-menu-settings.webp" alt="Claude Desktopのアカウントメニュー。いちばん上に「設定」の項目があり、その下に言語・ヘルプを表示・すべてのプランを表示などが並ぶ" width="528" height="420" loading="lazy" decoding="async" />
  <figcaption>▲ 自分の名前を押すと出てくるメニューから「設定」へ</figcaption>
</figure>

設定画面の左の一覧、「カスタマイズ」の中の「**コネクタ**」を押します。

<figure class="mockup mockup--shot">
  <img src="/images/ai-tips/ai-workspace-settings-sidebar.webp" alt="設定画面の左メニューの「カスタマイズ」の部分。スキル・コネクタ・プラグインが並び、「コネクタ」が選ばれている" width="404" height="312" loading="lazy" decoding="async" />
  <figcaption>▲ 左メニューの「カスタマイズ」→「コネクタ」</figcaption>
</figure>

### ③ カタログから Filesystem を探す

右上の「**追加**」→「**コネクタを参照**」で、道具のカタログが開きます。検索欄に「**file**」と打つと、「**Filesystem**（ファイルシステム）」が見つかります。

<figure class="mockup mockup--shot mockup--wide">
  <img src="/images/ai-tips/ai-workspace-connectors-add.webp" alt="コネクタの設定画面。右上の「追加」ボタンからメニューが開き、「コネクタを参照」と「カスタムコネクタを追加」の2つが表示されている" width="1600" height="349" loading="lazy" decoding="async" />
  <figcaption>▲ 右上の「追加」→「コネクタを参照」でカタログへ</figcaption>
</figure>

<figure class="mockup mockup--shot mockup--wide">
  <img src="/images/ai-tips/ai-workspace-search-filesystem.webp" alt="コネクタのカタログで検索欄に「file」と入力した画面。Files.comとFilesystemの2つのコネクタがカードで表示されている" width="1600" height="366" loading="lazy" decoding="async" />
  <figcaption>▲ 「file」で検索。「Filesystem」が今回の道具です</figcaption>
</figure>

### ④ 提供元を確かめてから、追加する

Filesystem を開いたら、「**Anthropicによって開発**」——Claude を作っている会社本体の提供——であることを確かめてから追加します。道具は提供元を確認してから入れる、が安全習慣です。

<figure class="mockup mockup--shot mockup--wide">
  <img src="/images/ai-tips/ai-workspace-filesystem-detail.webp" alt="Filesystemコネクタの詳細画面。説明文、Anthropicによって開発の表示、read_fileやwrite_fileなどのツール一覧、「必要な要件：すべての要件を満たしています」の表示がある" width="1600" height="987" loading="lazy" decoding="async" />
  <figcaption>▲ 「Anthropicによって開発」を確認してから追加</figcaption>
</figure>

### ⑤ 見せるフォルダを選ぶ

追加の途中で、**どのフォルダをAIに任せるか**を指定する場面があります。ここで①の専用フォルダを選んでください。ここで選んだフォルダ**だけ**が、AIの触れる範囲になります。

<figure class="mockup mockup--wide">
  <img src="/images/ai-tips/ai-workspace-pick-folder.svg" alt="フォルダ選択画面のイメージ図。「任せるフォルダを選んでください」というダイアログで、デスクトップ・書類・ダウンロードではなく、専用フォルダにチェックが付いている" width="640" height="320" loading="lazy" decoding="async" />
  <figcaption>▲ イメージ図。デスクトップや書類ぜんぶではなく、①で作った専用フォルダを選びます</figcaption>
</figure>

<div class="callout">
  <span class="callout__label">うまくいかないときは：「閉じた」と「終了した」は違います</span>
  <p>設定したのに反映されないときは、アプリを<strong>完全に終了して起動し直す</strong>のが特効薬です。ここで「終了したつもり」がよく起きます。<br>
  <strong>Mac</strong>：ウィンドウを閉じる（赤い●）だけでは終了していません。<strong>command + Q</strong> を押してください。<br>
  <strong>Windows</strong>：「×」で閉じてもタスクトレイで動き続けています。画面右下の「^」印の中から Claude のアイコンを探して<strong>右クリック→終了</strong>。見つからなければ <strong>Ctrl + Shift + Esc</strong> でタスクマネージャーを開き、「Claude」を選んで「タスクの終了」を。<br>
  また、アプリのバージョンによっては、この道具が設定の<strong>「拡張機能」</strong>という項目にあることもあります。「コネクタ」に見つからないときは、そちらも見てみてください。</p>
</div>

### つながったか、確かめる

準備ができたら、チャットでこう聞いてみてください。

> 「AI作業室」フォルダの中に、いま何がありますか？

フォルダの中身（空なら「空です」）を答えてくれたら成功です。おめでとうございます——あなたのAIに、手が生えました。

もし設定画面に「拡張機能」も「コネクタ」も見当たらないときは、アプリを最新版に更新してみてください。それでも見つからなければ、Claude 自身に「Filesystem のコネクタを使えるようにしたい。私の画面に沿って案内して」と頼むのが早道です。

## 使えるようになると、なにが嬉しいか

- **書類を「読んで」もらえる** — フォルダに入れた案内文書やPDFを「要点を3行で」「この2つの違いは？」と読み解いてもらえます。ファイルをいちいちチャットに貼らなくても、「あのフォルダの○○を読んで」で通じます
- **成果物を「ファイルで」受け取れる** — 作ってもらった文章や表を、コピペではなくファイルとして保存してもらえます。「さっきの案内文、Wordで開ける形でAI作業室に保存して」——これで画面の外に持ち出せます
- **整理を頼める** — 「このフォルダの写真を日付ごとに分けて」「ファイル名を内容が分かる名前に直して」。人間がやると億劫な作業こそ、AIの得意分野です
- **「置くだけ」の受付箱がつくれる** — 「このフォルダに入れたものは、読んで然るべき場所に整理してね」という約束をAIと結べば、あなたは書類を**放り込むだけ**。この使い方は第4回で本領を発揮します

もっと本格的な使いこなし（AIと共同の作業場を育てる話）は、相棒編の実践記事 [AIと“共同作業場”をつくったら、仕事の相棒になった](/ai-tips/2026-07-16-ai-shared-workspace/) が詳しいです。

<div class="callout">
  <span class="callout__label">ChatGPTをお使いの方へ ― じつは、ここが分かれ道です</span>
  <p>ChatGPT にもコネクタの仕組み自体はあります。ただしそれは<strong>インターネット上のサービス（GmailやGoogleドライブなど）とつなぐためのもの</strong>で、<strong>手元のパソコンのフォルダを見せる「Filesystem」のような公式コネクタは、2026年8月時点で用意されていません</strong>。技術者向けの回り道（自分でサーバーを立てて、インターネット越しに中継する方法）はありますが、手間がかかるうえ、大切なファイルの通り道が増えるので、この連載ではおすすめしません。<br>
  なお、<strong>ファイルを1つずつチャットに添付して読んでもらうことは、ChatGPT でも今までどおりできます</strong>。「フォルダごと任せて、読み書きしてもらう」働き方が、いまは Claude Desktop ならでは、ということです。くわしくは<a href="/ai-tips/2026-08-15-dougu-4-data-center/">第4回のくらべ表</a>へ。</p>
</div>

## 次回は、知恵をためる「ノート」を用意します

手に入れた「手」で読み書きする先として、次回は**ためた知恵の置き場所**——無料のノートアプリ **Obsidian** を手に入れます。ただのフォルダとテキストでできているからこそ、AIと最高に相性のいい道具です。

→ 第3回 [知恵をためる“ノート”を手に入れる ― Obsidianという道具](/ai-tips/2026-08-15-dougu-3-obsidian/)
