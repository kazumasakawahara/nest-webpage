---
title: （見本）連載用の新パーツ表示サンプル ― 公開しません
date: 2026-07-13
summary: 連載「AIに道具を持たせる」で使う新パーツ（連載ナビ・AI回答引用ボックス・話者つきふきだし）の表示確認用サンプルです。draft のまま公開しません。
draft: true
---

これは新パーツの**表示確認用サンプル**です。本文は第1回の想定文面を仮置きしています。

## パーツ1｜連載ナビ（callout流用・md内HTML直書き方式）

<div class="callout series-nav">
  <span class="callout__label">連載・中級者編</span>
  <p>この記事は、連載<strong>「AIに道具を持たせる」</strong>（全5回）の第1回です。</p>
  <ol class="series-nav__list">
    <li class="is-current">同じ質問をしたら、ぜんぜん違う答えが返ってきた（この記事）</li>
    <li class="is-upcoming">AIの“手足”になる道具 ― MCPってなに？（近日公開）</li>
    <li class="is-upcoming">現場専用の道具箱 ― WAM NETから一覧表ができるまで（近日公開）</li>
    <li class="is-upcoming">道具だけでは宝の持ち腐れ ― AIのための“台帳”を育てる（近日公開）</li>
    <li class="is-upcoming">貯めた情報が動き出す ― “一覧にして”の一言で終わるまで（近日公開）</li>
  </ol>
</div>

公開済みの回ができたら、`is-upcoming` の行を `<a href="...">` に置き換えて更新します。

## パーツ2｜AI回答の引用ボックス `.ai-answer`

2つ並べたとき、条件ラベルの違いが一目で分かるかをご確認ください。

<figure class="ai-answer ai-answer--gemini">
  <figcaption class="ai-answer__head">
    <span class="ai-answer__ai">Gemini</span>
    <span class="ai-answer__cond">素のまま・道具なし</span>
  </figcaption>
  <div class="ai-answer__body">
    <p>結論から申し上げますと、WAM NETのシステムを利用すれば、ご希望のような条件で事業者情報を収集することは十分に可能です。ただし、私（AI）自身がWAM NETの裏側のデータベースに直接アクセスして、網羅的で正確な一覧リストを自動生成することはできません。最も正確で最新の情報を集めるには、ご自身でWAM NETの検索機能をご利用いただくのが確実です。（以下、人間向けの手順が丁寧に続く）</p>
  </div>
</figure>

<figure class="ai-answer ai-answer--claude">
  <figcaption class="ai-answer__head">
    <span class="ai-answer__ai">Claude</span>
    <span class="ai-answer__cond">道具と台帳あり</span>
  </figcaption>
  <div class="ai-answer__body">
    <p>結論から言うと、<strong>「地域 × サービス種別で事業所を一覧化する」ことは既存の仕組みでほぼ即座に可能</strong>です。ただし「行動障害を伴う知的障害者が入所可能か」という条件だけは、WAM NET単体では絞り込めません。ここが一番重要な論点なので、先に整理します。（以下、自分で実行する前提の工程表が続く）</p>
  </div>
</figure>

## パーツ3｜qaふきだしの話者バリエーション

既存の「🙂／🤖」に加えて、名札つきで Gemini・Claude を区別できます。

<div class="qa">
  <div class="qa__row qa__row--me">
    <div class="qa__who">
      <div class="qa__avatar">🙂</div>
      <span class="qa__name">わたし</span>
    </div>
    <p class="qa__bubble">同じ質問をしたのに、どうしてこんなに答えが違うの？</p>
  </div>
  <div class="qa__row qa__row--ai qa__row--gemini">
    <div class="qa__who">
      <div class="qa__avatar">✨</div>
      <span class="qa__name">Gemini</span>
    </div>
    <p class="qa__bubble">私はWAM NETのデータベースに直接アクセスできないので、確実なのはご自身で検索いただく方法です。手順をご案内しますね。</p>
  </div>
  <div class="qa__row qa__row--ai qa__row--claude">
    <div class="qa__who">
      <div class="qa__avatar">🤖</div>
      <span class="qa__name">Claude</span>
    </div>
    <p class="qa__bubble">既存の仕組みでほぼ即座に可能です。地域さえ決めていただければ、Phase 1〜2まで実行できる状態ですよ。</p>
  </div>
</div>

名札なし（既存記事の書き方）もそのまま使えます。

<div class="qa">
  <div class="qa__row qa__row--ai">
    <div class="qa__avatar">🤖</div>
    <p class="qa__bubble">従来どおりの書き方のふきだしです。表示が変わっていないかご確認ください。</p>
  </div>
</div>
