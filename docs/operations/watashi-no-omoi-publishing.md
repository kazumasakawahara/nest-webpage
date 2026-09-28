# 「私の想い」掲載・取り下げの手順

## 掲載
1. 台帳で「状態」が「掲載可」の行を選ぶ（「要本人確認」は、本人の了承が取れてから「掲載可」になる）
2. **「掲載用本文」列だけ**を使う。原文の列はコピーしない（Claude に渡すときも同じ）
3. `src/content/post-parent-omoi/` に `YYYY-MM-DD-NN.md`（掲載日＋その日の連番。01 から）を作る：

   ```md
   ---
   theme: kigakari          # nokositai-kotoba / kigakari / anshin / jiyu
   relation: oya            # oya / kyodai / sofubo / sonota
   ageRange: 50代           # 「答えない」・未回答なら行ごと消す
   penName: 匿名
   publishedAt: 2026-10-05
   ---

   （掲載用本文。段落の間は空行を1つ）
   ```

   お題とお立場の対応：子どもに遺したい言葉＝nokositai-kotoba、いま一番気がかりなこと＝kigakari、こうなっていたら安心できる＝anshin、自由に＝jiyu／親＝oya、きょうだい＝kyodai、祖父母＝sofubo、その他の家族＝sonota
4. `npm run build` が通ることを確かめる（お題・お立場を書き間違えるとここで止まる）
5. main へ反映してデプロイ
6. 台帳に「掲載日」「掲載ファイル名」を書き、「状態」を「掲載済」にする
7. 連絡先メールがあれば、掲載したことを知らせる（任意）

## 取り下げ
1. お問い合わせで依頼を受けたら、掲載名とおおよその掲載日で台帳を探す
2. 本人であることを確かめられなくても、取り下げる
3. 台帳の「掲載ファイル名」のファイルを削除 → `npm run build` → main へ反映してデプロイ
4. 台帳の「状態」を「取り下げ」にする
