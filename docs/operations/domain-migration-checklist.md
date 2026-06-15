# nponest.org 公開・移行チェックリスト（Wix → Cloudflare）

このドキュメントは、NPO法人 nest の公式サイトを **Wix から新サイト（Cloudflare Workers `nest-webpage`）へ切り替えて公開**するための作業メモ。
あわせて、ドメイン（Network Solutions）の管理権限をNPO側で確実に押さえるための手順も含む。

> 調査日: 2026-06-15 時点の実測値に基づく。作業前に最新状態を再確認すること。

---

## 0. 現状サマリ（調査結果）

| 項目 | 状態 |
|---|---|
| ドメイン登録業者（レジストラ） | **Network Solutions, LLC**（2019年登録 / 有効期限 2028-07-29） |
| DNS（ネームサーバー） | **Wix**（`ns12.wixdns.net` / `ns13.wixdns.net`） |
| Webサイト本体 | Wix が配信（`server: Pepyaka` / apex→www へ301転送） |
| WHOIS 登録者 | `PERFECT PRIVACY, LLC`（= Network Solutionsの匿名化サービス。実体はアカウント保有者） |
| 移管ロック | **なし**（Domain Status: ok） |
| メール（MXレコード） | **なし**（nponest.org でメール受信していない → 移行リスク低） |
| TXT/SPF・サブドメイン | なし |

**新サイトの現在地**
- Cloudflare **Workers** プロジェクト `nest-webpage`（個人アカウント `Kazumasa.kawahara@...`）
- GitHub `kazumasakawahara/nest-webpage` 連携で **main への push＝自動デプロイ**
- 確認用URL: `https://nest-webpage.kazumasa-kawahara.workers.dev`
- `astro.config` の正規URL: `https://www.nponest.org`

**ロールバック用に控える現行DNS値（Wix）**
- apex `nponest.org` A: `185.230.63.107` / `185.230.63.171` / `185.230.63.186`
- `www` CNAME: `cdn1.wixdns.net`

---

## 1. 事前チェック（移行前に潰す）

- [ ] **ページ網羅性**: 今のWix公開サイトの全ページが新サイトに揃っているか目視で突き合わせ
- [ ] **フォーム等の動作**: Workerの環境変数（`PUBLIC_SITE_URL`、お問い合わせ/ニュースレターで使う Supabase・Resend 等のキー）が**本番Workerに設定済みか**
  - Cloudflare → Workers & Pages → `nest-webpage` → 設定 → 変数
- [ ] **Network Solutions のログイン情報**（法人名義）を用意できるか
- [ ] メール無しを再確認（`dig MX nponest.org` が空）

---

## 2. ドメイン管理権限の確立（Network Solutions）

Network Solutions の管理権限は2層。**①が実質のマスターキー。**

| 層 | 中身 |
|---|---|
| ① アカウントのログイン（メール＋パスワード） | DNS・移管・更新・連絡先すべてを操作可能 |
| ② WHOIS連絡先（Registrant＝法的所有者 等） | 「誰の持ち物か」。今は匿名プロキシで非公開 |

- [ ] **現アカウント保有者を特定**（`networksolutions.com` にログインできる人。不明なら「パスワード忘れ」で登録メール宛リカバリ）
- [ ] アカウントの**登録メールをNPOの共有アドレス**に（個人の使い捨て不可。属人化回避）
- [ ] **WHOIS Registrant** の Organization を「特定非営利活動法人nest」、メールを法人アドレスに更新（匿名化はONのままでよい）
- [ ] **2段階認証（MFA）** をアカウントに設定
- [ ] **パスワードは強固・固有**にし、NPOで安全に共有保管
- [ ] **自動更新ON**（または更新リマインダ。有効期限2028年。失効＝ドメイン消失）
- [ ] 移行が落ち着いたら **Registrar Lock（移管ロック）をON**（※別アカウントへ移管する時だけ一時的にoff）

> 別アカウント/別レジストラへ集約したい場合は、移管ロック解除＋認証コード（EPP/Auth）取得 → NPO名義の移管先へ移管。
> **Cloudflare Registrar** に移すと登録・DNS・配信が1か所に集約され、WHOIS匿名も無料で最もシンプル（レジストラ移管は60日制限などの条件あり）。

---

## 3. Cloudflare 移行手順（ゼロダウンタイム版）

### フェーズ1: Cloudflareにドメインを載せる
- [ ] Cloudflare → **Websites → Add a site** → `nponest.org` → **Free** プラン
- [ ] スキャン後、**まず apex/www を「今のWix宛て」のまま再現**（切替時の無停止のため）
  - apex `nponest.org` A → `185.230.63.107 / .171 / .186`
  - `www` CNAME → `cdn1.wixdns.net`（Proxy=オフ/グレー雲）
- [ ] Cloudflareが割り当てる**2つのネームサーバー**を控える

### フェーズ2: ネームサーバー切替（Network Solutions側）
- [ ] Network Solutions → `nponest.org` → **ネームサーバーを Wix → Cloudflareの2つ**に変更
- [ ] 反映待ち（通常数十分〜数時間、最大48h）。Cloudflareでゾーンが **Active** になるのを確認
  - この間も手順1で同じ宛先にしてあるためサイトはWix表示のまま＝無停止

### フェーズ3: Workerにカスタムドメイン割り当て
- [ ] Cloudflare → Workers & Pages → `nest-webpage` → **ドメイン → カスタムドメインを追加** → `www.nponest.org`
  - DNSレコードとSSL証明書は**自動発行**（手順1の旧wwwレコードは置き換わる）
- [ ] apex の扱い: **apex→www へリダイレクト**を設定（Cloudflare → Rules → Redirect Rules）。正規URLは `www.nponest.org`

### フェーズ4: 検証 → Wix停止
- [ ] `https://www.nponest.org` で **新サイト表示・SSL有効・主要ページ200・フォーム動作** を確認
- [ ] 数日〜1週間は **Wix契約を残してロールバック保険**に
- [ ] 問題なければ Wix を解約

> **ロールバック**: Network Solutions でネームサーバーを Wix（ns12/ns13.wixdns.net）に戻すだけ。

---

## 4. 補足・前提

- **レジストラ移管は不要**。ネームサーバーをCloudflareに向けるだけで公開できる（Network Solutionsに置いたままでOK。移管は任意）。
- **Cloudflareアカウントは個人のままでも技術的に問題なし**。属人化が気になれば、落ち着いた段階でNPO名義アカウントへゾーン＆Worker移管を検討。
- **本当に死活的なのは Cloudflareアカウント名義より「ドメイン登録（Network Solutions）をNPOが管理していること」**。ここを握れば配信先はいつでも差し替え可能。

## 5. 役割分担（代行可否）

- **Claude側で代行不可**（ログインが要る操作）: Cloudflareダッシュボード操作、Network Solutionsのネームサーバー/連絡先変更
- **Claude側で支援可能**: 環境変数の必要項目の洗い出し、apex→wwwリダイレクト/SSL設定値の助言、切替後の各ページ・フォームのURL叩き検証、`astro.config` の正規URL/sitemap整合確認
