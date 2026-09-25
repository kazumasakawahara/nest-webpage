# www あり・なしの統一（Cloudflare 設定手順）

作成：2026-09-25（評価報告 #11）
作業する人：河原さん（Cloudflare の管理画面での操作。サイトのコード変更はなし）
**実施済み：2026-09-25**（下の「実施記録」参照）
所要時間：10分ほど

---

## なぜやるのか

いま、次の4つのアドレスがどれも**転送されずに**同じサイトを表示しています（2026-09-25 に確認）。

| 入力したアドレス | いまの動き |
|---|---|
| `https://www.nponest.com/` | 表示（正規） |
| `https://nponest.com/` | そのまま表示（転送なし） |
| `http://www.nponest.com/` | そのまま表示（暗号化なしのまま） |
| `http://nponest.com/` | そのまま表示（暗号化なしのまま） |

困ること：

- 検索エンジンから見ると、同じページが2つずつあるように見える（評価が分散しやすい）
- `http://` で開いた人は、暗号化されていない通信のまま閲覧・入力することになる

サイトの正規のアドレスは **`https://www.nponest.com/`** です（canonical・サイトマップ・SNS 共有用のアドレスはすでにこちら）。
そこで、**ほかの3つをすべて `https://www.nponest.com/` へ転送（301）**します。

ページの場所（パス）と `?` 以降は保ったまま転送されます。
例：`nponest.com/about/` → `https://www.nponest.com/about/`

名刺やチラシに `nponest.com` と書いてあっても、そのまま使えます（自動で www 付きに移ります）。

---

## 作業は2つ

1. **Always Use HTTPS をオンにする**（`http://` → `https://`）
2. **Redirect Rule を1つ作る**（`nponest.com` → `www.nponest.com`）

どちらも Cloudflare の管理画面で、`nponest.com` のゾーンを開いて行います。

**注意：** Workers（nest-webpage）の画面にいると、左のメニューに「SSL/TLS」や「ルール」は出てきません。
左のメニューの「**ドメイン**」→「**nponest.com**」を選び、ドメインの画面に切り替えてから進めてください（2026-09-25、河原さんの画面で確認）。

---

## 作業1：Always Use HTTPS をオンにする

1. https://dash.cloudflare.com/ にログイン（アカウント：`Kazumasa.kawahara@lawnest.net`）
2. ドメイン一覧から **`nponest.com`** を選ぶ
3. 左のメニューで **SSL/TLS** → **Edge Certificates**（エッジ証明書）を開く
   - 直接開くリンク：https://dash.cloudflare.com/3ec7d1eea1364d018062807d2c783e30/nponest.com/ssl-tls/edge-certificates
   - 開けないときは公式の案内用リンク（アカウントとドメインを選ぶ画面が出る）：https://dash.cloudflare.com/?to=/:account/:zone/ssl-tls/edge-certificates
4. **Always Use HTTPS**（常に HTTPS を使用）のスイッチを **オン** にする
   - 項目が見当たらないときは、SSL/TLS →「概要」で暗号化モードが「オフ」になっていないか確認（オフだとこの項目は表示されない。公式文書 2026-08-14 更新）

これで `http://…` で開いた人は、すべて `https://…` に移ります。

---

## 作業2：Redirect Rule を作る

1. 同じ `nponest.com` のゾーンで、左のメニューの **Rules**（ルール）→ **Overview**（概要）を開く
2. **Create rule**（ルールを作成）→ **Redirect Rule**（リダイレクトルール）を選ぶ
   - テンプレートの一覧が出たら、**「Redirect from root to WWW」（ルートから WWW へ）**に近いものを選んでもよいです。その場合も、下の値と同じになっているかを確かめてください
3. 次のとおりに入力する

| 項目 | 入力する値 |
|---|---|
| Rule name（ルール名） | `apex to www` |
| When incoming requests match（一致条件） | **Wildcard pattern**（ワイルドカードパターン）を選ぶ |
| Request URL（リクエスト URL） | `http*://nponest.com/*` |
| Then（転送先） URL | `https://www.nponest.com/${2}` |
| Status code（ステータスコード） | **301** |
| Preserve query string（クエリ文字列を保持） | **オン**（チェックを入れる） |

   - 一致条件の `http*` は、`http` と `https` の両方をまとめて受けるための書き方です
   - 転送先の `${2}` は、一致条件の2つ目の `*`（`/` より後ろのパス）がそのまま入る印です。1つ目の `*`（`http` の後ろの `s` の有無）は使いません

4. **Deploy**（デプロイ）を押す

---

## やってはいけないこと

- **Workers の設定から `nponest.com`（www なし）のカスタムドメインを外さない**
  このルールは、`nponest.com` が Cloudflare を通っている（プロキシ済み）ことが前提です。いまはカスタムドメインの割り当てがその役を果たしています。外すと転送も止まります。
  （Cloudflare の文書では、カスタムドメインの Worker は「配信元」として扱われ、転送ルールはその手前で働きます）
- `www.nponest.com` を転送元にしない（無限ループになります）

---

## 設定後の確認

ブラウザで次の4つを開き、どれもアドレス欄が **`https://www.nponest.com/…`** に変わることを確かめます。

- `nponest.com/about/`
- `http://nponest.com/`
- `http://www.nponest.com/`
- `https://nponest.com/?test=1`（`?test=1` が残っていること）

設定が終わったら Claude に知らせてください。4つのアドレスを機械で確かめ、転送先と 301 になっていることを確認します。

---

## 戻し方

- 作業2を取り消す：Rules → Overview で `apex to www` を **無効化**（または削除）
- 作業1を取り消す：SSL/TLS → Edge Certificates で Always Use HTTPS を **オフ**

どちらもすぐに元の状態に戻ります。

---

## 参考（Cloudflare 公式文書）

- Redirect from root to WWW（2026-05-05 更新）
  https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-root-to-www/
- Create a redirect rule in the dashboard（2026-05-05 更新）
  https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-dashboard/
- Workers の Custom Domains（2026-08-14 更新）
  https://developers.cloudflare.com/workers/configuration/routing/custom-domains/

※ 管理画面のメニュー名は Cloudflare 側の変更で変わることがあります。見当たらないときは画面上部の検索で「Redirect Rules」「Always Use HTTPS」と探してください。

---

## 実施記録（2026-09-25）

- 作業1：Always Use HTTPS をオン。ドメインの画面の SSL/TLS → エッジ証明書（Workers の画面からは出てこないので「ドメイン」→「nponest.com」で切り替え）。「リダイレクト ループ」の注意が出るが、配信元（Worker）は http→https の転送をしていないので問題なし
- 作業2：Redirect Rule「apex to www」。デプロイ時に「このルールはあなたのトラフィックには適用されない可能性があります（http のトラフィックがプロキシされていない可能性）」と出たが、「**とにかくルールを無視して展開する**」を選んで展開（新しい DNS レコードは作らない）。apex は Workers のカスタムドメインとして Cloudflare を通っており、実際に転送は効いた
- 確認結果：`https://nponest.com/`・`http://nponest.com/`・`http://www.nponest.com/` はすべて 1 回の 301 で `https://www.nponest.com/…` へ。パス（`/about/`、寄稿記事）とクエリ（`?test=1`、`?utm=x&a=1`）は保持。`https://www.nponest.com/` は 200。会員エリア・サイトマップも www で到達
