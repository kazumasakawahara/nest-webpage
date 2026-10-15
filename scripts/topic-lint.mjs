#!/usr/bin/env node
// トピック記事（src/content/topics/*.md）の機械検査。
// 使い方: node scripts/topic-lint.mjs <記事.md> --type <1-6> [--no-fetch] [--published] [--json]
// 基準は docs/topics-editorial-policy.md。違反は件数で出し、違反があれば終了コード 1。
// 回帰確認: 公開済み記事（--published）が 0 件で通り、scripts/topic-lint-fixtures/bad-type3.md が多数の違反で落ちること。
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? (args[i + 1] ?? true) : d; };
const TYPE = Number(opt('--type', 1));
const NO_FETCH = args.includes('--no-fetch');
const PUBLISHED = args.includes('--published'); // 公開時の検査（draft: true を要求しない）
const JSON_OUT = args.includes('--json');
if (!file || !(TYPE >= 1 && TYPE <= 6)) {
  console.error('使い方: node scripts/topic-lint.mjs <記事.md> --type <1-6> [--no-fetch] [--published] [--json]');
  process.exit(2);
}

const src = readFileSync(file, 'utf8');
const lines = src.split('\n');
const violations = []; // {rule, line, msg}
const warnings = [];
const info = [];
const V = (rule, line, msg) => violations.push({ rule, line, msg });
const W = (rule, line, msg) => warnings.push({ rule, line, msg });

// ---------- frontmatter ----------
let fmEnd = -1;
const fm = {};
if (lines[0] === '---') {
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { fmEnd = i; break; }
    const m = lines[i].match(/^(\w+):\s*(.*)$/);
    if (m) fm[m[1]] = m[2].trim();
  }
}
if (fmEnd < 0) V('frontmatter', 1, 'frontmatter（--- で囲んだ先頭部）がない');
for (const k of ['title', 'date', 'summary']) if (!fm[k]) V('frontmatter', 1, `frontmatter に ${k} がない`);
if (!PUBLISHED && fm.draft !== 'true') V('frontmatter', 1, 'draft: true になっていない（公開判断は河原さん。--published で公開時検査）');
if (fm.title && /について$|とは$|のポイント$|解説$/.test(fm.title.replace(/['"]/g, ''))) V('frontmatter', 1, `title が中身を言っていない: 「${fm.title}」（「〜について」「〜とは」でなく、何が変わるかを言い切る）`);
if (fm.summary && (fm.summary.length < 60 || fm.summary.length > 220)) W('frontmatter', 1, `summary が ${fm.summary.length} 字（目安 60〜220）`);

const body = lines.slice(fmEnd + 1);
const bodyOffset = fmEnd + 2; // 1-indexed line number of body[0]

// ---------- ブロック分類 ----------
// prose: 文章として検査する行。taisho（条文）・figure・table・html のみの行は除く
const kind = []; // per body line: 'prose' | 'taisho' | 'figure' | 'table' | 'heading' | 'list' | 'html' | 'blank' | 'code'
{
  let inTaisho = 0, inFigure = false, inCode = false, inToc = false, inSchedule = false, inLawref = false, divDepth = 0;
  for (let i = 0; i < body.length; i++) {
    const l = body[i];
    const t = l.trim();
    if (t.startsWith('```')) { inCode = !inCode; kind[i] = 'code'; continue; }
    if (inCode) { kind[i] = 'code'; continue; }
    if (/<div class="taisho"/.test(t)) inTaisho = 1;
    if (/<figure/.test(t)) inFigure = true;
    if (/<nav class="topic-toc"/.test(t)) inToc = true;
    if (/<div class="topic-schedule"/.test(t)) inSchedule = true;
    if (/<div class="topic-lawref"/.test(t)) inLawref = true;
    let k;
    if (inTaisho) k = 'taisho';
    else if (inFigure) k = 'figure';
    else if (inToc) k = 'html';
    else if (inSchedule || inLawref) k = 'html';
    else if (t === '') k = 'blank';
    else if (/^#{1,6}\s/.test(t)) k = 'heading';
    else if (/^\|/.test(t)) k = 'table';
    else if (/^([-*]|\d+\.)\s/.test(t) || /^<li\b/.test(t)) k = 'list';
    else if (/^<[^>]+>$/.test(t) || /^<\/?(div|dl|dt|dd|ol|ul|nav|p class=|hr)/.test(t) && !/[ぁ-んァ-ン一-龥]/.test(t.replace(/<[^>]+>/g, ''))) k = 'html';
    else k = 'prose';
    kind[i] = k;
    if (inTaisho) { divDepth += (t.match(/<div\b/g) || []).length; divDepth -= (t.match(/<\/div>/g) || []).length; if (divDepth <= 0) { inTaisho = 0; divDepth = 0; } }
    if (/<\/figure>/.test(t)) inFigure = false;
    if (/<\/nav>/.test(t)) inToc = false;
    if (inSchedule && /<\/div>/.test(t) && !/<div/.test(t)) inSchedule = false;
    if (inLawref && /<\/div>/.test(t)) inLawref = false;
  }
}
const stripTags = (s) => s.replace(/<[^>]+>/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*/g, '').replace(/&nbsp;| /g, ' ');
const proseLines = body.map((l, i) => ({ l, i, n: i + bodyOffset })).filter((x) => kind[x.i] === 'prose');
const proseAndList = body.map((l, i) => ({ l, i, n: i + bodyOffset })).filter((x) => kind[x.i] === 'prose' || kind[x.i] === 'list' || kind[x.i] === 'table');
const proseText = proseLines.map((x) => stripTags(x.l)).join('\n');
const allText = body.filter((_, i) => kind[i] !== 'taisho' && kind[i] !== 'code').map(stripTags).join('\n');
const headings = body.map((l, i) => ({ l, i, n: i + bodyOffset })).filter((x) => kind[x.i] === 'heading').map((x) => ({ ...x, text: x.l.replace(/^#+\s*/, '').trim(), level: x.l.match(/^#+/)[0].length }));

// ---------- 文字数 ----------
const charCount = allText.replace(/\s/g, '').length;
const RANGE = { 1: [4000, 8000], 2: [2000, 4000], 3: [2500, 5000], 4: [2000, 4000], 5: [2500, 5000], 6: [1500, 3000] }[TYPE];
info.push(`本文の文字数: ${charCount}（類型${TYPE}の目安 ${RANGE[0]}〜${RANGE[1]}）`);
if (charCount < RANGE[0] * 0.8 || charCount > RANGE[1] * 1.25) V('文字数', bodyOffset, `本文 ${charCount} 字。類型${TYPE}の目安 ${RANGE[0]}〜${RANGE[1]} から 2 割以上外れている`);
else if (charCount < RANGE[0] || charCount > RANGE[1]) W('文字数', bodyOffset, `本文 ${charCount} 字。目安 ${RANGE[0]}〜${RANGE[1]} の外`);

// ---------- 文の長さ・語尾 ----------
const sentences = []; // {text, n}
for (const x of proseLines) {
  const t = stripTags(x.l).trim();
  if (!t) continue;
  const parts = t.split(/(?<=[。！？])/).map((s) => s.trim()).filter(Boolean);
  for (const p of parts) sentences.push({ text: p, n: x.n });
}
for (const s of sentences) if (s.text.length > 120) V('文長', s.n, `1文が ${s.text.length} 字（上限 120）: 「${s.text.slice(0, 30)}…」`);
const ending = (s) => {
  const t = s.replace(/[。！？」』）)]+$/, '');
  if (/ました$/.test(t)) return 'ました';
  if (/でした$/.test(t)) return 'でした';
  if (/ません$/.test(t)) return 'ません';
  if (/でしょう$/.test(t)) return 'でしょう';
  if (/ます$/.test(t)) return 'ます';
  if (/です$/.test(t)) return 'です';
  return 'その他';
};
{
  // 語尾の分布（1種類が 70% を超えたら単調）と、同じ段落内で同じ語尾が 6 文続く箇所
  const dist = {};
  for (const s of sentences) { const e = ending(s.text); dist[e] = (dist[e] || 0) + 1; }
  const total = sentences.length || 1;
  info.push(`語尾の分布: ${Object.entries(dist).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(v / total * 100).toFixed(0)}%`).join(' / ')}`);
  for (const [k, v] of Object.entries(dist)) if (k !== 'その他' && v / total > 0.7) V('語尾', bodyOffset, `語尾「${k}」が全体の ${(v / total * 100).toFixed(0)}%（上限 70%）。言い換えで散らす`);
  let run = 1, prev = null, prevLine = null;
  for (const s of sentences) {
    const e = ending(s.text);
    const samePara = prevLine !== null && s.n - prevLine <= 1;
    if (samePara && e !== 'その他' && e === prev) { run++; if (run === 6) V('語尾', s.n, `同じ段落で語尾「${e}」が6文続く`); }
    else run = 1;
    prev = e; prevLine = s.n;
  }
}
// 1文だけの段落の連続
{
  let oneSentenceRun = 0;
  for (let i = 0; i < body.length; i++) {
    if (kind[i] !== 'prose') { if (kind[i] !== 'blank') oneSentenceRun = 0; continue; }
    const t = stripTags(body[i]).trim();
    const cnt = (t.match(/[。！？]/g) || []).length;
    if (cnt <= 1 && t.length > 0) { oneSentenceRun++; if (oneSentenceRun === 3) V('段落', i + bodyOffset, '1文だけの段落が3つ続く（箇条書きの代わりに段落を並べている）'); }
    else oneSentenceRun = 0;
  }
}

// ---------- 禁止表現 ----------
const BANNED = [
  { re: /いかがでした|いかがでしょうか/g, max: 0, name: 'いかがでしたか' },
  { re: /まとめると|^まとめ$/gm, max: 0, name: 'まとめ' },
  { re: /と言えるでしょう|といえるでしょう|と言えます(?!か)|といえます(?!か)/g, max: 0, name: '〜と言えるでしょう' },
  { re: /していきましょう|しましょう|見ていきましょう/g, max: 0, name: '〜しましょう' },
  { re: /重要です|大切です|ポイントです/g, max: 1, name: '重要です・大切です' },
  { re: /注目されています|求められます|期待されます|求められています|期待されています|欠かせません/g, max: 0, name: '求められます・期待されます' },
  { re: /することが可能です|することも可能です/g, max: 0, name: '〜することが可能です' },
  { re: /について解説します|について見ていき|本記事では|この記事では/g, max: 0, name: '前置き（本記事では・解説します）' },
  { re: /さまざまな|様々な|多様な|適切な|しっかり|きちんと/g, max: 2, name: '中身のない修飾（さまざまな・適切な・しっかり）' },
  { re: /一方で/g, max: 3, name: '一方で' },
  { re: /(^|。)\s*また、/gm, max: 7, name: '文頭の「また、」' },
  { re: /ではないでしょうか|かもしれません/g, max: 3, name: '留保の連発（かもしれません）' },
  { re: /！/g, max: 0, name: '感嘆符' },
  { re: /〜/g, max: 999, name: '' },
];
for (const b of BANNED) {
  if (!b.name) continue;
  const hits = [];
  for (const x of proseAndList) { const t = stripTags(x.l); let m; const re = new RegExp(b.re.source, b.re.flags); while ((m = re.exec(t))) hits.push({ n: x.n, s: m[0] }); }
  if (hits.length > b.max) V('禁止表現', hits[0].n, `「${b.name}」が ${hits.length} 回（上限 ${b.max}）: 行 ${[...new Set(hits.map((h) => h.n))].slice(0, 8).join(', ')}`);
}
// 「など」の段落内 3 回
{
  let para = [], paraStart = null;
  const flush = () => { if (para.length) { const t = stripTags(para.join('')); const c = (t.match(/など/g) || []).length; if (c >= 3) V('禁止表現', paraStart, `1段落に「など」が ${c} 回`); } para = []; paraStart = null; };
  for (let i = 0; i < body.length; i++) { if (kind[i] === 'prose') { if (!para.length) paraStart = i + bodyOffset; para.push(body[i]); } else flush(); }
  flush();
}
// 見出しの型
for (const h of headings) {
  if (/とは$|について$|のポイント$|^まとめ$|^おわりに$|^はじめに$/.test(h.text)) V('見出し', h.n, `見出しが中身を言っていない: 「${h.text}」`);
}

// ---------- 太字 ----------
{
  // CommonMark: 開きの ** は直後が空白でなく、直後が約物なら直前が空白か約物か行頭。閉じの ** は直前が空白でなく、直前が約物なら直後が空白か約物か行末。
  const isP = (c) => !!c && /[\p{P}\p{S}]/u.test(c);
  const isWS = (c) => !c || /\s/.test(c);
  let count = 0;
  for (const x of body.map((l, i) => ({ l, i, n: i + bodyOffset })).filter((x) => kind[x.i] !== 'taisho' && kind[x.i] !== 'code' && kind[x.i] !== 'table')) {
    const segs = x.l.split('**');
    if (segs.length > 1 && segs.length % 2 === 0) V('太字', x.n, '`**` の数が奇数で、太字が閉じていない');
    for (let k = 1; k + 1 < segs.length; k += 2) {
      count++;
      const pb = segs[k - 1].slice(-1), na = segs[k].slice(0, 1);
      const pc = segs[k].slice(-1), nc = segs[k + 1].slice(0, 1);
      if (isWS(na) || (isP(na) && !(isWS(pb) || isP(pb)))) V('太字', x.n, `開きの \`**\` が効かない（直前「${pb}」直後「${na}」）。約物で始まる太字は直前を句読点・空白にする`);
      if (isWS(pc) || (isP(pc) && !(isWS(nc) || isP(nc)))) V('太字', x.n, `閉じの \`**\` が効かない（直前「${pc}」直後「${nc}」）。約物で終わる太字は直後を句読点・空白にする`);
    }
    count += (x.l.match(/<b>|<strong>/g) || []).length;
  }
  const per1000 = count / Math.max(charCount, 1) * 1000;
  info.push(`太字の箇所（条文の対照を除く）: ${count}（1000 字あたり ${per1000.toFixed(1)}、目安 7 以下）`);
  if (per1000 > 7) W('太字', bodyOffset, `太字が 1000 字あたり ${per1000.toFixed(1)} 箇所（目安 7 以下）`);
}

// ---------- 箇条書き率 ----------
{
  const contentLines = body.filter((_, i) => ['prose', 'list'].includes(kind[i])).length;
  const listLines = body.filter((_, i) => kind[i] === 'list').length;
  const ratio = contentLines ? listLines / contentLines : 0;
  info.push(`箇条書きの行の割合: ${(ratio * 100).toFixed(0)}%（${listLines}/${contentLines}）`);
  if (ratio > 0.35) V('箇条書き', bodyOffset, `箇条書きの行が本文の ${(ratio * 100).toFixed(0)}%（上限 35%）`);
}

// ---------- 構造 ----------
const has = (re) => re.test(src);
const slug = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s/g, '-');
const h2s = headings.filter((h) => h.level === 2);
const common = {
  lawref: has(/class="topic-lawref"/),
  schedule: has(/class="topic-schedule"/),
  toc: has(/class="topic-toc"/),
  taisho: (src.match(/<div class="taisho"/g) || []).length,
  point: has(/class="point"/),
  chui: has(/class="chui"/),
  table: body.some((l) => /^\|\s*-{3,}/.test(l.trim())),
  figure: has(/class="topic-figure"/),
  lastH2: h2s.length ? h2s[h2s.length - 1].text : '',
  sources: /\n---\n[\s\S]*?(出典|参考)/.test(src) || headings.some((h) => /出典|参考/.test(h.text)),
  disclaimer: /原典|個別の事案|ご確認ください/.test(allText),
};
// 目次のアンカー
if (common.toc) {
  const anchors = [...src.matchAll(/<a href="#([^"]+)">/g)].map((m) => decodeURIComponent(m[1]));
  const slugs = new Set(headings.map((h) => slug(h.text)));
  for (const a of anchors) if (!slugs.has(a)) V('目次', bodyOffset, `目次のアンカー #${a} に対応する見出しがない（見出しの slug: ${[...slugs].slice(0, 3).join(' / ')} …）`);
  if (h2s.length && anchors.length < h2s.length) W('目次', bodyOffset, `目次の項目 ${anchors.length} に対し ## 見出しが ${h2s.length}`);
}
// 導入: 最初の prose 段落
{
  const first = proseLines[0];
  if (!first) V('導入', bodyOffset, '本文の段落がない');
  else if (first.i > 12) W('導入', first.n, '本文の最初の段落が frontmatter から 12 行以上離れている（導入を先に）');
}
if (!common.sources) V('出典', bodyOffset, '末尾の出典（--- の後の「出典」または「参考」）がない');
if (!common.disclaimer) V('出典', bodyOffset, '免責の但し書き（原典の確認を促す一文）がない');
// 類型別
const need = (cond, msg) => { if (!cond) V(`類型${TYPE}`, bodyOffset, msg); };
const kangae = /考えておくこと|考えておきたいこと|備えておくこと/.test(common.lastH2);
switch (TYPE) {
  case 1:
    need(common.lawref, 'topic-lawref（法令名・番号・成立/公布日の枠）がない');
    need(common.schedule, 'topic-schedule（施行日の表）がない');
    need(common.toc, 'topic-toc（目次）がない');
    need(common.taisho >= 1, '新旧対照（.taisho）が1か所もない');
    need(headings.some((h) => /利用している人|どうなるか|経過措置/.test(h.text)), '「いま利用している人はどうなるか」（経過措置）の見出しがない');
    need(kangae, `最後の ## 見出しが「〜が考えておくこと」でない（現在: 「${common.lastH2}」）`);
    break;
  case 2:
    need(common.lawref, 'topic-lawref（発出日・発出元・宛先・文書番号の枠）がない');
    need(/(令和|平成)\d+年\d+月\d+日/.test(stripTags(src)), '発出日（令和○年○月○日）がない');
    need(/変わらない/.test(allText), '「変わらないこと」への言及がない（変わること／変わらないことの対比）');
    need(/義務|努力義務|技術的助言/.test(allText), '義務・努力義務・技術的助言の別を書いていない');
    need(kangae, `最後の ## 見出しが「〜が考えておくこと」でない（現在: 「${common.lastH2}」）`);
    break;
  case 3:
    need(common.lawref, 'topic-lawref（告示・省令名と公布日の枠）がない');
    need(common.schedule, 'topic-schedule（適用日・経過措置の終期）がない');
    need(common.table, '変更点の表（旧→新）がない');
    need(/経過措置/.test(allText), '経過措置への言及がない');
    need(/対象(となる|の)サービス|対象サービス|対象事業/.test(allText), '対象サービスの明示がない');
    need(kangae, `最後の ## 見出しが「〜が考えておくこと」でない（現在: 「${common.lastH2}」）`);
    break;
  case 4: {
    const n = allText.length; const head = allText.slice(0, Math.floor(n * 0.3)); const tail = allText.slice(Math.floor(n * 0.7));
    const undecided = /決まったこと?ではありません|まだ決まっていません|案の段階|確定していません/;
    need(undecided.test(head), '冒頭 3 割に「決まったことではない」の明示がない');
    need(undecided.test(tail), '末尾 3 割に「決まったことではない」の明示がない');
    need(common.chui, '.chui（案の段階である注意）がない');
    need(common.schedule, 'topic-schedule（締切）がない');
    need(/意見(を|の)(提出|出し方|募集)/.test(allText) && /https?:\/\/[^\s)]*e-gov\.go\.jp/.test(src), '意見の出し方（e-Gov の URL）がない');
    break; }
  case 5:
    need(/使える人|対象(となる|になる)(人|方)|当てはまる/.test(allText), '「使える人の条件」の記述がない');
    need(/手続き|手続の流れ|申請/.test(allText), '手続きの流れの記述がない');
    need(/費用|手数料|報酬|税/.test(allText), '費用・税の扱いの記述がない');
    need(common.chui, '.chui（よくある誤解）がない');
    need(/相談/.test(allText), '相談先への言及がない');
    break;
  case 6:
    need(/時点/.test(allText), '数字の時点（○年○月時点）がない');
    need(/前年|前回|比べ|増え|減り|増加|減少/.test(allText), '前年・前回との比較がない');
    need(/言えないこと|言えること|読み取れないこと|分からないこと/.test(allText), '「数字から言えないこと」の段落がない');
    need(common.table || common.figure, '表または図がない');
    break;
}

// ---------- 出典 URL ----------
const urls = [...new Set([...src.matchAll(/https?:\/\/[^\s)"'>]+/g)].map((m) => m[0].replace(/[。、）]+$/, '')))];
const PRIMARY = /(\.|^)(go\.jp|lg\.jp|courts\.go\.jp|nponest\.com)$/;
for (const u of urls) {
  let host; try { host = new URL(u).hostname; } catch { V('出典URL', bodyOffset, `URL が不正: ${u}`); continue; }
  if (!PRIMARY.test(host)) V('出典URL', bodyOffset, `一次情報でないドメイン: ${host}（go.jp / lg.jp / courts.go.jp 以外。調査の手がかりに使うのはよいが出典にしない）`);
}
info.push(`外部 URL: ${urls.length} 件`);
const unconfirmed = (allText.match(/（未確認）/g) || []).length;
info.push(`「（未確認）」の記述: ${unconfirmed} 件（0 件なら、本当に全部確認できたかを河原さんが見る）`);

async function checkUrls() {
  if (NO_FETCH) return;
  for (const u of urls) {
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 10000);
      let r = await fetch(u, { method: 'HEAD', redirect: 'follow', signal: ctl.signal });
      if (r.status === 405 || r.status === 403) r = await fetch(u, { method: 'GET', redirect: 'follow', signal: ctl.signal });
      clearTimeout(t);
      if (r.status >= 400) V('出典URL', bodyOffset, `HTTP ${r.status}: ${u}`);
    } catch (e) {
      W('出典URL', bodyOffset, `到達できず（この環境の通信制限の可能性。Mac で再確認）: ${u}`);
    }
  }
}

await checkUrls();

// ---------- 出力 ----------
if (JSON_OUT) { console.log(JSON.stringify({ file, type: TYPE, violations, warnings, info }, null, 2)); }
else {
  console.log(`# topic-lint: ${file}（類型 ${TYPE}）`);
  for (const s of info) console.log(`  i ${s}`);
  for (const w of warnings) console.log(`  ! [警告] ${w.rule} L${w.line}: ${w.msg}`);
  for (const v of violations) console.log(`  x [違反] ${v.rule} L${v.line}: ${v.msg}`);
  console.log(`違反 ${violations.length} 件（警告 ${warnings.length} 件）`);
}
process.exit(violations.length ? 1 : 0);
