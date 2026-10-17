# usage-band（Claude Code mod）

プロンプト入力欄の直上に、気分顔・セッション累計コスト・5時間/7日間のレート上限バー・
コンテキスト使用量バーを4行で描く mod です。データはエンジンの `session.measure`
イベント（毎ターン押されてくる正式な数値）から取り、自前で推定はしません。

```
(=^・ω・^=) ごきげん  💰$9.42
🌍 5時間    ▰▰▱▱▱▱▱▱▱▱▱▱▱▱ ┆ ▱▱▱▱ ┆ ▱▱  8% ✨
🌍 7日間    ▰▰▰▰▱▱▱▱▱▱▱▱▱▱ ┆ ▱▱▱▱ ┆ ▱▱  18% ✨
🍙 セッション ▰▰▰▰▰▱▱▱▱▱▱▱▱▱ ┆ ▱▱▱▱ ┆ ▱▱  25% 255k/1.0M ✨
```

- 20目盛り。区切り線は 70% と 90%。70% 未満は緑、70〜90% は黄、90% 以上は赤。
- 気分顔は全指標の最大値で変化（ごきげん → まずまず → そわそわ → ひやひや）。
- `/usage-band` で表示／非表示を切り替え。
- 帯はターミナルとデスクトップアプリの画面に出ます（アンケート表示中は譲ります）。

## インストール（クラウドセッション・デスクトップアプリ・ターミナル共通）

このリポジトリ直下の `.claude-plugin/marketplace.json` が marketplace になっているので、
一行で入ります。ターミナルのセッションのプロンプトで:

```
/plugin install usage-band --marketplace kazumasakawahara/nest-webpage
```

続けて `y`（marketplace の追加）→ スコープ（user を推奨）を選ぶと、そのセッションから
帯が出ます。シェルからなら `claude plugin install usage-band --marketplace kazumasakawahara/nest-webpage`。

デスクトップアプリでは `/plugin` が使えないので、プロンプト横の「+」→ Plugins →
Add marketplace に `kazumasakawahara/nest-webpage` → Add plugin で usage-band を選びます。

クラウドセッション（claude.ai/code）で毎回使うには、環境のセットアップスクリプトに
`claude plugin marketplace add kazumasakawahara/nest-webpage && claude plugin install usage-band@nest-webpage`
を入れます（private リポジトリなので、GitHub 連携が有効な環境で動きます）。

CLI の statusLine（シェルスクリプト方式）を既に使っている場合、CLI にこの mod を入れると
帯と statusLine の二重表示になるので、CLI には入れず、クラウドとアプリだけで使うのが
おすすめです。

### 開発中にフォルダから直接読む場合

```json
{ "env": { "CLAUDE_CODE_PLUGIN_DIRS": "~/path/to/nest-webpage/tools/mods/usage-band" } }
```

を `~/.claude/settings.json` に置くか、`claude --plugin-dir <フォルダ>` で起動します。

## 開発

```
claude plugin validate tools/mods/usage-band
claude plugin test tools/mods/usage-band
```

初回読み込み後は `tools/mods/usage-band/.claude-plugin/types/` にエンジンが型定義を
書き出すので、`tsc -p tools/mods/usage-band` で型チェックできます（この types/ は
エンジン生成物のためコミットしません）。
