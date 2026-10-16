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

## Mac での使い方

1. このフォルダを Mac の任意の場所に置く（例: `~/claude-mods/usage-band`）。
   リポジトリを clone してあるなら、そのパスをそのまま使えます。
2. `~/.claude/settings.json` の `env` に次を足す（デスクトップアプリ起動のセッションにも効く方式）:

   ```json
   { "env": { "CLAUDE_CODE_PLUGIN_DIRS": "~/claude-mods/usage-band" } }
   ```

   ターミナルから一回だけ試すなら `claude --plugin-dir ~/claude-mods/usage-band` でも可。
3. Claude Code を起動し直す。

## 開発

```
claude plugin validate tools/mods/usage-band
claude plugin test tools/mods/usage-band
```

初回読み込み後は `tools/mods/usage-band/.claude-plugin/types/` にエンジンが型定義を
書き出すので、`tsc -p tools/mods/usage-band` で型チェックできます（この types/ は
エンジン生成物のためコミットしません）。
