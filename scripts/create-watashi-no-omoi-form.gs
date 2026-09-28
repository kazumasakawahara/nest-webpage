/**
 * 親なき後「私の想い」投稿フォーム 自動生成スクリプト（Google Apps Script）
 * =====================================================================
 *
 * 親なき後ページの「私の想い」コーナーの投稿フォームを Google フォームとして作成し、
 * 審査台帳（スプレッドシート）まで用意する。設計：docs/superpowers/specs/2026-09-28-watashi-no-omoi-design.md
 *
 *   - 1ページ目：お題・想い・お立場・年代・掲載名・掲載の希望
 *   - 「掲載を希望する」を選んだ人だけ、2ページ目（掲載への同意・必須）へ進む
 *   - 最終ページ：活動への活用（任意）・連絡先メール（任意）
 *   - 審査台帳：回答列＋管理列（状態・一次確認者・一次確認メモ・掲載用本文・最終判断メモ・掲載日・掲載ファイル名）
 *   - 送信のたびに：① 担当者と河原さんへ通知 ② 投稿者へ受付確認（メール記入者のみ） ③ 状態を「未確認」に
 *
 * 【使い方】
 *   1. フォームを管理する Google アカウントで https://script.google.com/ を開き「新しいプロジェクト」
 *   2. このファイルの中身を全部貼り付け、NOTIFY_EMAILS に通知先2名を書く
 *   3. 関数「createWatashiNoOmoiForm」を ▶実行（初回は権限を許可）
 *   4. 実行ログの「公開URL」を、サイトの src/lib/omoi.ts の OMOI_FORM_URL に貼ってデプロイ
 *   5. シークレットウィンドウで、ログインなしで回答できるか確認
 *      （求められたら FORM_ID を書いて openOmoiFormToPublic を実行）
 *
 * 【原文の扱い】
 *   原文を読むのは台帳上の担当者と河原さんだけ。サイトに載せる作業には「掲載用本文」列だけを使う。
 */

// ▼▼▼ 通知先（一次確認の担当者・最終判断の河原さん）。空のままでは作成しない ▼▼▼
var NOTIFY_EMAILS = [];
// ▲▲▲

var PRIVACY_URL = 'https://nponest.com/privacy/';
var OMOI_PAGE_URL = 'https://nponest.com/post-parent/omoi/';

// 項目名（作成と送信時処理の両方で使う）
var Q_THEME = 'お題';
var Q_BODY = 'あなたの想い';
var Q_RELATION = 'お立場';
var Q_AGE = '年代（任意）';
var Q_PENNAME = '掲載名（ペンネーム）';
var Q_WISH = '掲載について';
var Q_CONSENT = '掲載への同意';
var Q_USE = '活動への活用（任意）';
var Q_EMAIL = '連絡先メールアドレス（任意・公開しません）';

var WISH_PUBLISH = '掲載を希望する';
var WISH_DELIVER = '掲載は希望せず、nest に届けるだけ';

var STATUSES = ['未確認', '一次確認済', '掲載可', '要本人確認', '見送り', '掲載済', '取り下げ'];
var MANAGED_COLUMNS = ['状態', '一次確認者', '一次確認メモ', '掲載用本文', '最終判断メモ', '掲載日', '掲載ファイル名'];

function createWatashiNoOmoiForm() {
  if (NOTIFY_EMAILS.length === 0) {
    throw new Error('NOTIFY_EMAILS に通知先を書いてから実行してください。');
  }

  var form = FormApp.create('親なき後「私の想い」');
  form.setTitle('親なき後「私の想い」');
  form.setDescription(
    '「親なき後」を思うとき、胸にあることを寄せてください。\n' +
    '同じ立場の誰かが読んで「わたしだけじゃない」と感じられる場所にしたいと考えています。\n' +
    'まとまっていない文章や、答えの出ていない迷いも歓迎します。\n' +
    '\n' +
    '・寄せられた想いは、編集部が読んでから掲載します。すぐには載りません。\n' +
    '・実名、お子さんのお名前、学校名・施設名・事業所名、お住まいの地域は書かないでください。\n' +
    '　書かれていた場合は、編集部が伏せたり言い換えたりします。\n' +
    '・特定の事業所・機関・個人への不満やご意見は、このコーナーには掲載しません。\n' +
    '　お問い合わせフォームで個別にお受けします。\n' +
    '・掲載後に取り下げたいときは、お問い合わせフォームからご連絡ください。\n' +
    '　サイトからは削除しますが、インターネット上に写しが残る場合があり、完全には消せないことがあります。'
  );
  form.setConfirmationMessage(
    '想いを寄せてくださり、ありがとうございます。\n' +
    '編集部で大切に読ませていただきます。\n' + OMOI_PAGE_URL
  );
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(true);
  form.setRequireLogin(false);
  form.setLimitOneResponsePerUser(false);

  // --- 1ページ目 ---
  form.addMultipleChoiceItem()
    .setTitle(Q_THEME)
    .setRequired(true)
    .setChoiceValues(['子どもに遺したい言葉', 'いま一番気がかりなこと', 'こうなっていたら安心できる', '自由に']);

  form.addParagraphTextItem()
    .setTitle(Q_BODY)
    .setRequired(true)
    .setHelpText('400〜800字くらいが目安です（長くても短くても構いません。長い場合は1,200字くらいまでを目安に）。');

  form.addMultipleChoiceItem()
    .setTitle(Q_RELATION)
    .setRequired(true)
    .setChoiceValues(['親', 'きょうだい', '祖父母', 'その他の家族']);

  form.addListItem()
    .setTitle(Q_AGE)
    .setChoiceValues(['20代以下', '30代', '40代', '50代', '60代', '70代', '80代以上', '答えない']);

  form.addTextItem()
    .setTitle(Q_PENNAME)
    .setRequired(true)
    .setHelpText('ペンネームを書いてください。名前を出したくない方は「匿名」と書いてください。実名は掲載しません。');

  var wish = form.addMultipleChoiceItem().setTitle(Q_WISH).setRequired(true);

  // --- 2ページ目：掲載への同意（掲載を希望した人だけ） ---
  var pageConsent = form.addPageBreakItem().setTitle('掲載への同意');
  var consent = form.addCheckboxItem();
  consent.setTitle(Q_CONSENT)
    .setRequired(true)
    .setHelpText(
      '掲載にあたり、編集部が個人の特定につながる部分を伏せたり言い換えたりすることがあります。\n' +
      '取り扱いはプライバシーポリシー（' + PRIVACY_URL + '）をご覧ください。'
    )
    .setChoices([consent.createChoice('掲載すること、伏せ字・言い換えをすることに同意します')]);

  // --- 最終ページ ---
  var pageLast = form.addPageBreakItem().setTitle('最後に');
  var use = form.addCheckboxItem();
  use.setTitle(Q_USE)
    .setHelpText('掲載されない場合も含め、個人が特定されない形で、nest の活動（勉強会・資料作りなど）に生かしてよい場合はチェックしてください。')
    .setChoices([use.createChoice('活動に生かしてよい')]);

  var emailValidation = FormApp.createTextValidation()
    .setHelpText('正しいメールアドレスを入力してください。')
    .requireTextIsEmail()
    .build();
  form.addTextItem()
    .setTitle(Q_EMAIL)
    .setHelpText('受付のお知らせと、掲載前に修正した文章を確認していただくためだけに使います。')
    .setValidation(emailValidation);

  // 分岐：掲載を希望 → 同意ページ、届けるだけ → 最終ページ
  wish.setChoices([
    wish.createChoice(WISH_PUBLISH, pageConsent),
    wish.createChoice(WISH_DELIVER, pageLast),
  ]);

  // 審査台帳
  var ss = SpreadsheetApp.create('私の想い_審査台帳');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();
  removeEmptyDefaultSheet_(ss);
  try {
    addManagedColumns_(ss);
  } catch (err) {
    Logger.log('※ 管理列の追加をスキップしました（' + err + '）。フォーム自体は作成済みです。');
  }

  registerOmoiSubmitTrigger_(ss);

  Logger.log('================ 作成完了 ================');
  Logger.log('公開URL（サイトの OMOI_FORM_URL に貼る）: ' + form.getPublishedUrl());
  Logger.log('編集URL                               : ' + form.getEditUrl());
  Logger.log('フォームID                            : ' + form.getId());
  Logger.log('審査台帳URL                           : ' + ss.getUrl());
  Logger.log('通知先                                : ' + NOTIFY_EMAILS.join(', '));
  Logger.log('==========================================');
}

// 管理列を追加し、「状態」列に選択肢の入力規則を付ける
function addManagedColumns_(ss) {
  var sheet = findResponseSheet_(ss);
  if (!sheet || sheet.getLastColumn() < 1) return;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (var i = 0; i < MANAGED_COLUMNS.length; i++) {
    if (headers.indexOf(MANAGED_COLUMNS[i]) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(MANAGED_COLUMNS[i]);
    }
  }
  var statusCol = columnOf_(sheet, '状態');
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build();
  sheet.getRange(2, statusCol, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
}

function columnOf_(sheet, name) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var col = headers.indexOf(name) + 1;
  if (col === 0) {
    col = sheet.getLastColumn() + 1;
    sheet.getRange(1, col).setValue(name);
  }
  return col;
}

function findResponseSheet_(ss) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var a1 = String(sheets[i].getRange(1, 1).getValue());
    if (a1 === 'タイムスタンプ' || a1 === 'Timestamp') return sheets[i];
  }
  for (var j = 0; j < sheets.length; j++) {
    if (sheets[j].getLastColumn() > 0) return sheets[j];
  }
  return null;
}

function removeEmptyDefaultSheet_(ss) {
  var resp = findResponseSheet_(ss);
  if (!resp) return;
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() !== resp.getSheetId() &&
        sheets[i].getLastColumn() === 0 &&
        ss.getSheets().length > 1) {
      ss.deleteSheet(sheets[i]);
    }
  }
}

function registerOmoiSubmitTrigger_(ss) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onOmoiSubmit') ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger('onOmoiSubmit').forSpreadsheet(ss).onFormSubmit().create();
}

/**
 * 送信時：① 通知（担当者・河原さん） ② 受付確認（メール記入者のみ） ③ 状態を「未確認」に
 */
function onOmoiSubmit(e) {
  var r = e.namedValues;
  var get = function (k) { return (r[k] || [''])[0]; };

  // --- ① 通知（原文を含む。宛先は台帳を読む2名だけ） ---
  var lines = Object.keys(r).map(function (k) { return k + '：' + r[k].join(', '); });
  MailApp.sendEmail(
    NOTIFY_EMAILS.join(','),
    '【私の想い】新しい投稿が届きました（' + get(Q_WISH) + '）',
    '親なき後「私の想い」に新しい投稿がありました。\n' +
    '審査台帳で一次確認をお願いします。\n\n' +
    lines.join('\n')
  );

  // --- ② 受付確認 ---
  var email = get(Q_EMAIL);
  if (email) {
    MailApp.sendEmail(
      email,
      '【nest】「私の想い」を受け付けました',
      'この度は「私の想い」に想いを寄せてくださり、ありがとうございます。\n' +
      '編集部で大切に読ませていただきます。\n\n' +
      (get(Q_WISH) === WISH_PUBLISH
        ? '掲載する場合、個人の特定につながる部分を伏せたり言い換えたりしたときは、掲載前にこのアドレスへ確認のご連絡をします。\n' +
          'すべての想いを掲載できるとは限らないことを、ご了承ください。\n\n'
        : '掲載はせず、nest の中で大切に受け止めます。\n\n') +
      OMOI_PAGE_URL + '\n\n' +
      '※ このメールは自動送信です。\n\n' +
      '特定非営利活動法人nest'
    );
  }

  // --- ③ 状態を「未確認」に ---
  var sheet = e.range.getSheet();
  sheet.getRange(e.range.getRow(), columnOf_(sheet, '状態')).setValue('未確認');
}

// ▼▼▼ 作成済みフォームのID（作成時ログの「フォームID」） ▼▼▼
var FORM_ID = '';
// ▲▲▲

/** 【必要なときだけ】作成済みフォームを「ログイン不要」にする（Workspace アカウントで作った場合） */
function openOmoiFormToPublic() {
  var form = FormApp.openById(FORM_ID);
  form.setRequireLogin(false);
  form.setLimitOneResponsePerUser(false);
  Logger.log('ログイン不要に設定しました。公開URL: ' + form.getPublishedUrl());
}
