研修資料の12項目を10問に組み直し、現場で起こりがちな判断ミスを「やりがち」のラベル付きで選択肢に入れました。以下を `.html` として保存すれば、そのまま単体で開けます。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>個人情報クイズ｜潮見町ワークス 職員研修</title>
<style>
  :root{
    --bg:#f6f4ee; --card:#fff; --ink:#2b2b2b; --sub:#666;
    --line:#e2ded4; --accent:#2f6f5e; --accent-soft:#e3f0ea;
    --ok:#1e7f4f; --ok-bg:#e6f5ec; --ng:#c0392b; --ng-bg:#fdecea;
    --warn:#b7791f; --warn-bg:#fff4dc;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
       font-family:"Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP",sans-serif;
       line-height:1.7;font-size:16px}
  header{background:var(--accent);color:#fff;padding:22px 16px 18px;text-align:center}
  header h1{margin:0;font-size:1.35rem;letter-spacing:.04em}
  header p{margin:6px 0 0;font-size:.9rem;opacity:.9}
  .wrap{max-width:720px;margin:0 auto;padding:16px}

  /* 進捗 */
  .progress{position:sticky;top:0;z-index:5;background:var(--bg);padding:10px 0 8px}
  .progress .txt{display:flex;justify-content:space-between;font-size:.85rem;color:var(--sub)}
  .bar{height:8px;background:var(--line);border-radius:99px;overflow:hidden;margin-top:4px}
  .bar i{display:block;height:100%;width:0;background:var(--accent);transition:width .3s}

  /* 設問カード */
  .q{background:var(--card);border:1px solid var(--line);border-radius:14px;
     padding:18px 18px 16px;margin:14px 0;box-shadow:0 1px 3px rgba(0,0,0,.04)}
  .q .num{display:inline-block;background:var(--accent-soft);color:var(--accent);
          font-weight:700;font-size:.8rem;padding:2px 10px;border-radius:99px}
  .q .scene{margin:10px 0 4px;color:var(--sub);font-size:.92rem}
  .q h2{margin:4px 0 12px;font-size:1.08rem;line-height:1.6}

  .opt{display:block;width:100%;text-align:left;background:#fff;border:2px solid var(--line);
       border-radius:10px;padding:12px 14px 12px 46px;margin:8px 0;font:inherit;
       color:var(--ink);cursor:pointer;position:relative;transition:.15s}
  .opt:hover:not(:disabled){border-color:var(--accent);background:#fafcfb}
  .opt:disabled{cursor:default}
  .opt .mark{position:absolute;left:14px;top:12px;width:22px;height:22px;border-radius:50%;
             border:2px solid var(--line);font-size:.8rem;font-weight:700;
             display:flex;align-items:center;justify-content:center;color:var(--sub)}
  .opt.correct{border-color:var(--ok);background:var(--ok-bg)}
  .opt.correct .mark{background:var(--ok);border-color:var(--ok);color:#fff}
  .opt.wrong{border-color:var(--ng);background:var(--ng-bg)}
  .opt.wrong .mark{background:var(--ng);border-color:var(--ng);color:#fff}
  .opt.dim{opacity:.55}
  .opt .why{display:none;margin-top:6px;font-size:.86rem;color:var(--ng);line-height:1.5}
  .opt .tag{display:none;margin-left:6px;font-size:.72rem;background:var(--warn-bg);
            color:var(--warn);border:1px solid var(--warn);border-radius:99px;
            padding:0 8px;vertical-align:middle;white-space:nowrap}
  .q.done .opt .why{display:block}
  .q.done .opt.yarigachi .tag{display:inline-block}

  .exp{display:none;margin-top:12px;border-radius:10px;padding:12px 14px;font-size:.95rem}
  .exp.show{display:block}
  .exp.ok{background:var(--ok-bg);border-left:5px solid var(--ok)}
  .exp.ng{background:var(--ng-bg);border-left:5px solid var(--ng)}
  .exp .verdict{font-weight:700;font-size:1.05rem;margin-bottom:4px}
  .exp.ok .verdict{color:var(--ok)}
  .exp.ng .verdict{color:var(--ng)}
  .exp .rule{display:inline-block;margin-top:8px;font-size:.8rem;color:var(--sub);
             background:#f1efe8;padding:2px 10px;border-radius:99px}

  /* 結果 */
  .result{display:none;background:var(--card);border:2px solid var(--accent);border-radius:14px;
          padding:22px;margin:18px 0;text-align:center}
  .result.show{display:block}
  .result .score{font-size:2.4rem;font-weight:700;color:var(--accent);line-height:1.2}
  .result p{margin:8px 0}
  .btn{background:var(--accent);color:#fff;border:0;border-radius:99px;padding:10px 26px;
       font:inherit;font-weight:700;cursor:pointer;margin-top:8px}
  .btn:hover{opacity:.9}
  footer{text-align:center;color:var(--sub);font-size:.8rem;padding:20px 16px 36px}
  @media (max-width:480px){ body{font-size:15px} .q{padding:14px} .opt{padding-left:42px} }
</style>
</head>
<body>

<header>
  <h1>個人情報の取り扱い 確認クイズ</h1>
  <p>潮見町ワークス 職員向けルール（全10問・三択）</p>
</header>

<div class="wrap">
  <div class="progress">
    <div class="txt"><span id="pAns">回答 0 / 10</span><span id="pScore">正解 0</span></div>
    <div class="bar"><i id="pBar"></i></div>
  </div>

  <div id="quiz"></div>

  <div class="result" id="result">
    <div class="score"><span id="rScore">0</span> / 10</div>
    <p id="rMsg"></p>
    <button class="btn" onclick="location.reload()">もう一度挑戦する</button>
  </div>
</div>

<footer>登場する「Aさん」などは架空の人物です。迷ったときは、自分で判断せず管理者に相談を。</footer>

<script>
const QUIZ = [
  {
    scene: "新人職員から質問されました。",
    q: "「連絡帳は家族とのやりとりだから、個人情報じゃないですよね？」——正しい答えは？",
    opts: [
      { t: "氏名・住所・生年月日だけが個人情報。連絡帳は違う",
        why: "障害の状況・健康状態・家族の情報も個人情報です", yari: true },
      { t: "連絡帳も写真も支援記録も、すべて個人情報", ok: true },
      { t: "支援記録は事業所の業務文書だから個人情報ではない",
        why: "支援記録は本人の状態が最も詳しく書かれた個人情報です" }
    ],
    exp: "利用者の氏名・住所・生年月日・障害の状況・健康状態・家族の情報はすべて個人情報で、支援記録・連絡帳・写真も含まれます。「業務文書だから」「家族向けだから」は理由になりません。",
    rule: "ルール1"
  },
  {
    scene: "支援計画の締切が明日。事業所では集中できません。",
    q: "書類を家に持ち帰って仕上げたい。どうする？",
    opts: [
      { t: "自分の鞄に入れて持ち帰り、翌朝きちんと戻せばよい",
        why: "許可なしの持ち出しは、戻す予定があってもNG", yari: true },
      { t: "紙は危ないので、USBメモリにコピーして持ち帰る",
        why: "USBメモリも「持ち出し」。紙と同じ扱いです", yari: true },
      { t: "原則持ち出さない。必要なら管理者の許可を得て、持ち出し簿に記録する", ok: true }
    ],
    exp: "個人情報を含む書類やUSBメモリは事業所の外へ持ち出しません。どうしても必要なときは、管理者の許可＋持ち出し簿への記録が必須。紛失は通勤途中や車内で起きています。",
    rule: "ルール2"
  },
  {
    scene: "夏祭りの写真を広報紙に載せたい。入所時に「写真撮影に同意します」の書面はもらっています。",
    q: "どうする？",
    opts: [
      { t: "入所時に同意をもらっているので、そのまま使ってよい",
        why: "入所時の同意は「撮影」の同意。広報への掲載は別の用途です", yari: true },
      { t: "顔が小さく写っている写真なら、同意はいらない",
        why: "写り方の大小は関係ありません" },
      { t: "広報に使う用途を伝えて、その都度、本人と家族の同意を取る", ok: true }
    ],
    exp: "写真や動画は、本人と家族の同意なしに撮影・掲示・配布しません。行事の写真を広報に使うときは「何に使うか」を伝えて、その都度同意を取ります。包括的な同意書で済ませないこと。",
    rule: "ルール3"
  },
  {
    scene: "作業中、利用者さんがとてもいい表情。事業所のタブレットが手元にありません。",
    q: "どうする？",
    opts: [
      { t: "自分のスマホで撮って事業所のPCに送り、スマホからは消す",
        why: "職員個人のスマホで撮る時点でNG。クラウド同期で残ることも", yari: true },
      { t: "職員のスマホでは撮らない。事業所のカメラかタブレットを取りに行く", ok: true },
      { t: "自分のスマホで撮り、LINEで同僚に送ってすぐ削除する",
        why: "LINEに送ればさらに複製が増えます" }
    ],
    exp: "利用者の写真は、職員個人のスマートフォンで撮りません。撮影は事業所のカメラかタブレットで。「あとで消す」は、自動バックアップや送信履歴に残るため守れないことが多いです。",
    rule: "ルール4"
  },
  {
    scene: "休日、個人のInstagramに投稿しようとしています。",
    q: "「今日は利用者さんと〇〇公園で清掃作業。みんな頑張った！」（名前なし・後ろ姿の写真）——投稿してよい？",
    opts: [
      { t: "名前を出していないので問題ない",
        why: "場所・日付・状況で本人が特定されます", yari: true },
      { t: "フォロワー限定（鍵アカウント）なら問題ない",
        why: "スクリーンショットや転載で外に出ます", yari: true },
      { t: "名前を伏せていても、利用者のことは個人のSNSに書かない", ok: true }
    ],
    exp: "利用者のことは、個人のSNS（X・Instagram・LINEのタイムライン等）に書きません。名前を伏せても、場所や状況で本人や家族には分かります。鍵アカウントも「外に出ない」保証にはなりません。",
    rule: "ルール5"
  },
  {
    scene: "電話が鳴りました。「Aの兄です。今日、Aは来てますか？ 最近の様子も聞きたくて」",
    q: "どう対応する？",
    opts: [
      { t: "家族なので、在籍と最近の様子を伝える",
        why: "電話では相手が本当に家族か確認できません", yari: true },
      { t: "様子は答えないが、「来ているかどうか」だけなら答える",
        why: "在籍しているかどうか自体が個人情報です", yari: true },
      { t: "その場では答えず、相手の名前と連絡先を聞き、管理者に相談してから折り返す", ok: true }
    ],
    exp: "電話で利用者の在籍や様子を聞かれても、その場では答えません。相手の名前と連絡先を聞き、管理者に相談してから折り返します。家族を名乗る場合も同じです。丁寧に断れば失礼にはなりません。",
    rule: "ルール6"
  },
  {
    scene: "退勤前。机の上に、書きかけの支援記録と、印刷ミスで余分に出た利用者一覧があります。",
    q: "正しい片付けは？",
    opts: [
      { t: "支援記録は鍵のない引き出しへ。利用者一覧は裏紙としてメモ用に使う",
        why: "裏面に個人情報が残ったまま出回ります", yari: true },
      { t: "支援記録は施錠できる棚へ戻し、利用者一覧はシュレッダーにかける", ok: true },
      { t: "支援記録は机の上に裏返して置き、利用者一覧は細かく破いてゴミ箱へ",
        why: "裏返しても放置は放置。手で破いた紙は復元できます", yari: true }
    ],
    exp: "個人情報を含む書類は、机の上に置いたまま離席せず、退勤時は施錠できる棚に戻します。不要になった書類はシュレッダーへ。ゴミ箱にそのまま捨てない、裏紙にしないが鉄則です。",
    rule: "ルール7・8"
  },
  {
    scene: "FAXを送った直後、番号を1桁間違えていたことに気づきました。",
    q: "どうする？",
    opts: [
      { t: "送信先に電話して破棄をお願いし、それで終わりにする",
        why: "相手への連絡は必要ですが、管理者への報告なしで終えてはいけません", yari: true },
      { t: "相手から何も言ってこなければ気づかれていないので、様子を見る",
        why: "時間が経つほど被害が広がり、隠したことも問題になります", yari: true },
      { t: "すぐ管理者に報告する", ok: true }
    ],
    exp: "誤送信に気づいたら、すぐ管理者に報告します。漏らした「かもしれない」段階でも、隠さずその日のうちに報告。報告が早いほど被害を小さくできます。予防は、送信前に宛先を二人で確認すること。",
    rule: "ルール9・10"
  },
  {
    scene: "利用者の家族が来所し、「支援記録を今ここで見せてほしい」と言われました。",
    q: "どう対応する？",
    opts: [
      { t: "本人の家族なので、その場で記録を見せる",
        why: "開示には決まった手続きがあります。その場で見せない", yari: true },
      { t: "「お見せできません」と断って終わりにする",
        why: "断るのではなく、手続きにつなぐのが正解" },
      { t: "その場では見せず、管理者につなぐ", ok: true }
    ],
    exp: "本人や家族から「記録を見せてほしい」と言われたら、その場で見せず管理者につなぎます。開示の手続きが決まっているので、一職員の判断で見せる・断るのどちらもしません。",
    rule: "ルール11"
  },
  {
    scene: "支援記録の文章を、AIチャットで読みやすく整えたいと思っています。",
    q: "どうする？",
    opts: [
      { t: "記録をそのままコピーして貼り付け、整えてもらう",
        why: "実名・支援内容が外部サービスに渡ります", yari: true },
      { t: "名前だけ「Aさん」に変えれば、通院先や住所はそのままでよい",
        why: "通院先や住所からも本人が特定できます", yari: true },
      { t: "名前を伏せ、特定できる情報（住所・通院先・家族構成など）を取り除いてから使う", ok: true }
    ],
    exp: "AIチャットや翻訳サイトに、利用者の実名や支援記録をそのまま貼り付けません。使うときは名前を伏せ、住所・通院先・家族構成など特定につながる情報も取り除きます。「名前を変えただけ」では不十分です。",
    rule: "ルール12"
  }
];

const LABEL = ["A", "B", "C"];
let answered = 0, score = 0;

function build() {
  const root = document.getElementById("quiz");
  QUIZ.forEach((item, i) => {
    const card = document.createElement("section");
    card.className = "q";
    card.id = "q" + i;

    let html = `<span class="num">第${i + 1}問</span>`;
    if (item.scene) html += `<p class="scene">${item.scene}</p>`;
    html += `<h2>${item.q}</h2>`;

    item.opts.forEach((o, j) => {
      html += `<button class="opt${o.yari ? " yarigachi" : ""}" data-q="${i}" data-o="${j}">
        <span class="mark">${LABEL[j]}</span>${o.t}
        <span class="tag">現場でやりがち</span>
        ${o.why ? `<span class="why">→ ${o.why}</span>` : ""}
      </button>`;
    });
    html += `<div class="exp" id="exp${i}"></div>`;
    card.innerHTML = html;
    root.appendChild(card);
  });

  root.addEventListener("click", e => {
    const btn = e.target.closest(".opt");
    if (!btn || btn.disabled) return;
    answer(+btn.dataset.q, +btn.dataset.o);
  });
}

function answer(qi, oi) {
  const item = QUIZ[qi];
  const card = document.getElementById("q" + qi);
  const buttons = card.querySelectorAll(".opt");
  const isOk = !!item.opts[oi].ok;

  buttons.forEach((b, j) => {
    b.disabled = true;
    const o = item.opts[j];
    if (o.ok) {
      b.classList.add("correct");
      b.querySelector(".mark").textContent = "✓";
    } else if (j === oi) {
      b.classList.add("wrong");
      b.querySelector(".mark").textContent = "✕";
    } else {
      b.classList.add("dim");
    }
  });
  card.classList.add("done");

  const exp = document.getElementById("exp" + qi);
  exp.className = "exp show " + (isOk ? "ok" : "ng");
  exp.innerHTML = `<div class="verdict">${isOk ? "正解！" : "残念、不正解"}</div>
    ${item.exp}<br><span class="rule">${item.rule}</span>`;

  answered++;
  if (isOk) score++;
  document.getElementById("pAns").textContent = `回答 ${answered} / ${QUIZ.length}`;
  document.getElementById("pScore").textContent = `正解 ${score}`;
  document.getElementById("pBar").style.width = (answered / QUIZ.length * 100) + "%";

  if (answered === QUIZ.length) showResult();
}

function showResult() {
  const r = document.getElementById("result");
  document.getElementById("rScore").textContent = score;
  let msg;
  if (score === 10) msg = "全問正解。ルールがしっかり身についています。迷ったら「答えない・持ち出さない・すぐ報告」を思い出してください。";
  else if (score >= 8) msg = "よく理解できています。間違えた問題の「現場でやりがち」を、もう一度確認しておきましょう。";
  else if (score >= 5) msg = "基本は押さえています。赤くなった選択肢は、実際の現場で起きやすいパターンです。研修資料を読み直してみてください。";
  else msg = "研修資料をもう一度読んで、再挑戦してみましょう。分からないことは、自分で判断せず管理者に相談するのが一番安全です。";
  document.getElementById("rMsg").textContent = msg;
  r.classList.add("show");
  r.scrollIntoView({ behavior: "smooth", block: "center" });
}

build();
</script>
</body>
</html>
```

補足として、押した瞬間に「正解＝緑・不正解＝赤」で色分けし、現場で起こりがちな誤りには「現場でやりがち」タグと「なぜダメか」の一言が出るようにしています。ルール7と8、9と10はそれぞれ1問にまとめて、12項目を10問に収めました。