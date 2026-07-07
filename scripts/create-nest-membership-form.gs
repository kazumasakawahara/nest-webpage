/**
 * nest 入会申込フォーム 自動生成スクリプト（Google Apps Script）
 * =====================================================================
 *
 * 「入会申込フォーム」を Google フォームとして一発で作成するスクリプトです。
 * 手順書（public/internal/google-form-setup-guide.html）の STEP 1〜6 を
 * すべて自動化します。実行すると次の状態のフォームが出来上がります：
 *
 *   - 質問15項目（会員区分・氏名・連絡先・同意 など。必須/任意も設定済み）
 *   - 個人情報の越境移転についての同意文（米国サーバ経由の明示）
 *   - 送信後の確認メッセージ（会費案内つき）
 *   - 回答集約用スプレッドシート「入会申込_回答」＋ 事務局管理列
 *   - 送信のたびに自動で動く Level 2 処理：
 *       ① 事務局への通知メール
 *       ② 申込者への会費案内メール（自動返信）
 *       ③ スプレッドシート「受付状況」を「未対応」に初期化
 *
 * 【使い方】
 *   1. 事務局共用 Google アカウントで https://script.google.com/ を開き、
 *      「新しいプロジェクト」を作成
 *   2. このファイルの中身を全部コピーして、エディタに貼り付け（既存コードは消す）
 *   3. 下の OFFICE_EMAIL が通知先（担当者）のアドレスになっているか確認
 *   4. 関数選択を「createNestMembershipForm」にして ▶実行
 *   5. 初回は権限の承認ダイアログが出るので許可
 *      （フォーム作成・スプレッドシート作成・メール送信・トリガーの権限）
 *   6. 実行ログ（表示 → ログ／Ctrl+Enter）に出力される URL を確認：
 *        - 公開URL（回答用）        … QR・共有用
 *        - 埋め込みURL（embedded）    … サイトに貼る用
 *        - 編集URL                   … 後から項目を編集する用
 *   7. ログの「公開URL」を河原さんに伝える
 *      → サイト側（join.astro）への QR コード配置・動線実装（Phase C）に進む
 *
 * 【テーマカラー・ロゴについて】
 *   テーマカラー（nest 緑 #2D5A27）とヘッダーロゴは Apps Script では設定できません。
 *   作成後、編集URL を開いてパレットアイコンから手動で設定してください（任意）。
 *
 * 【通知先メールを後で変えるとき】
 *   OFFICE_EMAIL を書き換えて保存するだけで反映されます
 *   （onNestMembershipSubmit が OFFICE_EMAIL を参照しているため、フォーム再作成は不要）。
 *   確認用に setOfficeEmailOnly を実行すると現在値をログに出します。
 */

// ▼▼▼ 回答の通知先（担当者）メールアドレス ▼▼▼
var OFFICE_EMAIL = 's.kawasaki@npo-nest.com';
// ▲▲▲

// 紙の申込書（同意文・確認メッセージから参照）
var PAPER_FORM_URL = 'https://www.nponest.com/pdfs/forms/membership-application.html';

/**
 * メイン：フォーム＋スプレッドシートを作成し、全項目・確認文・自動処理をセットする。
 */
function createNestMembershipForm() {
  var form = FormApp.create('NPO法人 nest 入会申込フォーム');

  form.setTitle('NPO法人 nest 入会申込フォーム');
  form.setDescription(
    'NPO法人 nest の活動を支えてくださる会員を募集しています。\n' +
    '下記フォームにご記入のうえ送信してください。\n' +
    'ご不明な点は事務局（093-582-7018／平日 9:00〜18:00）まで。\n' +
    '※ 紙の申込書をご希望の方は、こちらから印刷できます：\n' +
    PAPER_FORM_URL
  );
  form.setConfirmationMessage(
    'お申し込みありがとうございます。\n' +
    '内容を確認のうえ、事務局よりご連絡いたします。\n\n' +
    '【会費のお支払いについて】\n' +
    '当面は現金でのお支払いをお願いしております。\n' +
    '事務局へご持参いただくか、行事の際にお渡しください。\n' +
    '（オンライン決済は今後対応予定です）\n\n' +
    '・正会員：入会金 ¥1,000 ＋ 年会費 ¥2,000\n' +
    '・賛助会員（個人・団体）：年会費 ¥2,000\n\n' +
    'ご不明な点は事務局まで：093-582-7018（平日 9:00〜18:00）'
  );
  form.setCollectEmail(false);          // メールはフォーム項目として個別に取得する
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setProgressBar(false);
  // 一般公開フォーム：ログイン不要・回答回数無制限にする
  // （Workspace アカウントで作ると既定でログイン必須になり、一般の方が回答できないため）
  form.setRequireLogin(false);
  form.setLimitOneResponsePerUser(false);

  // 1. 会員区分（必須・単一選択）
  form.addMultipleChoiceItem()
    .setTitle('会員区分')
    .setRequired(true)
    .setChoiceValues([
      '正会員（入会金¥1,000＋年会費¥2,000）',
      '賛助会員（個人）（年会費¥2,000）',
      '賛助会員（団体）（年会費¥2,000）',
    ]);

  // 2. お名前（団体の場合は団体名）（必須）
  form.addTextItem()
    .setTitle('お名前（団体の場合は団体名）')
    .setRequired(true);

  // 3. お名前（ふりがな）（必須）
  form.addTextItem()
    .setTitle('お名前（ふりがな）')
    .setRequired(true);

  // 4. メールアドレス（必須・メール形式チェック）
  var emailValidation = FormApp.createTextValidation()
    .setHelpText('正しいメールアドレスを入力してください。')
    .requireTextIsEmail()
    .build();
  form.addTextItem()
    .setTitle('メールアドレス')
    .setRequired(true)
    .setValidation(emailValidation);

  // 5. 電話番号（必須）
  form.addTextItem()
    .setTitle('電話番号')
    .setRequired(true);

  // 6. 郵便番号（必須）
  form.addTextItem()
    .setTitle('郵便番号')
    .setRequired(true);

  // 7. 住所（必須）
  form.addTextItem()
    .setTitle('住所')
    .setRequired(true);

  // 8. 生年月日（任意・年を含む）
  form.addDateItem()
    .setTitle('生年月日')
    .setIncludesYear(true);

  // 9. ご職業・ご所属（任意）
  form.addTextItem()
    .setTitle('ご職業・ご所属');

  // 10. nest を知ったきっかけ（任意・複数選択）
  form.addCheckboxItem()
    .setTitle('nest を知ったきっかけ')
    .setChoiceValues([
      'Webサイト',
      '知人の紹介',
      'イベント・講演会',
      'SNS',
      'その他',
    ]);

  // 11. 入会の動機・nest への期待（任意・長文）
  form.addParagraphTextItem()
    .setTitle('入会の動機・nest への期待');

  // 12. ボランティア参加への意向（任意・単一選択）
  form.addMultipleChoiceItem()
    .setTitle('ボランティア参加への意向')
    .setChoiceValues(['希望する', '応相談', '希望しない']);

  // 13. 緊急連絡先（任意・長文）
  form.addParagraphTextItem()
    .setTitle('緊急連絡先（任意）')
    .setHelpText('お名前・続柄・電話番号をご記入ください。');

  // 14. その他のご要望・ご質問（任意・長文）
  form.addParagraphTextItem()
    .setTitle('その他のご要望・ご質問');

  // 15. 個人情報の取り扱いへの同意（必須・越境移転の明示）
  var consent = form.addCheckboxItem();
  consent.setTitle('個人情報の取り扱いへの同意')
    .setHelpText(
      '本フォームに入力いただいた個人情報は、Google LLC（米国）が運営する\n' +
      'Google Forms のサーバを経由して NPO法人 nest が受信・保管します。\n' +
      '【利用目的】会員管理、会報誌の送付、行事のご案内\n' +
      '【保管期間】会員として在籍している期間\n' +
      '【第三者提供】法令に基づく場合を除き、行いません\n' +
      '米国サーバを経由することへの同意が難しい場合は、紙の申込書をご利用ください：\n' +
      PAPER_FORM_URL
    )
    .setRequired(true)
    .setChoices([consent.createChoice('上記に同意します')]);

  // 回答集約用スプレッドシートを作成して連携し、事務局管理列を追加する
  var ss = SpreadsheetApp.create('入会申込_回答');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();
  addManagementColumns_(ss);

  // 送信時トリガー（① 事務局通知 ② 申込者へ自動返信 ③ 受付状況の初期化）
  registerMembershipSubmitTrigger_(ss);

  // 出力
  var published = form.getPublishedUrl();
  Logger.log('================ 作成完了 ================');
  Logger.log('公開URL（回答用 / QR・共有用）: ' + published);
  Logger.log('埋め込みURL（サイト用）       : ' + published + '?embedded=true');
  Logger.log('編集URL                       : ' + form.getEditUrl());
  Logger.log('フォームID                    : ' + form.getId());
  Logger.log('回答スプレッドシートURL       : ' + ss.getUrl());
  Logger.log('通知先メール（担当者）        : ' + OFFICE_EMAIL);
  Logger.log('==========================================');
  Logger.log('→ 「公開URL」を河原さんに伝えてください（Phase C：QR・join.astro 実装へ）。');
  Logger.log('→ テーマカラー(#2D5A27)・ロゴは編集URLから手動設定してください（任意）。');
}

/**
 * 回答スプレッドシートのフォーム回答シートに、事務局管理列を追加する。
 */
function addManagementColumns_(ss) {
  var sheet = findResponseSheet_(ss);
  if (!sheet) return;
  var managed = ['受付状況', '会費確認', 'nest登録日', '会員番号', '事務局メモ'];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (var i = 0; i < managed.length; i++) {
    if (headers.indexOf(managed[i]) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(managed[i]);
    }
  }
}

/**
 * フォームの回答シートを特定する（A1 が「タイムスタンプ」のシート）。
 */
function findResponseSheet_(ss) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var a1 = sheets[i].getRange(1, 1).getValue();
    if (a1 === 'タイムスタンプ') return sheets[i];
  }
  // 見つからなければ末尾シート（連携で追加されたシート）を返す
  return sheets.length ? sheets[sheets.length - 1] : null;
}

/**
 * スプレッドシート送信時トリガーを（重複しないように）登録する。
 */
function registerMembershipSubmitTrigger_(ss) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onNestMembershipSubmit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('onNestMembershipSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
}

/**
 * 送信時に呼ばれる（Level 2 自動処理）：
 *   ① 事務局へ通知メール
 *   ② 申込者へ会費案内メール（自動返信）
 *   ③ スプレッドシートの「受付状況」を「未対応」に初期化
 */
function onNestMembershipSubmit(e) {
  var r = e.namedValues;
  var name  = (r['お名前（団体の場合は団体名）'] || [''])[0];
  var email = (r['メールアドレス'] || [''])[0];
  var type  = (r['会員区分'] || [''])[0];

  // --- ① 事務局への通知 ---
  var lines = Object.keys(r).map(function (k) { return k + '：' + r[k].join(', '); });
  MailApp.sendEmail(
    OFFICE_EMAIL,
    '【入会申込】' + name + ' 様（' + type + '）',
    '新しい入会申込がありました。\n\n' + lines.join('\n') +
    '\n\nスプレッドシートで詳細を確認してください。'
  );

  // --- ② 申込者への会費案内（自動返信） ---
  if (email) {
    var fee = (type.indexOf('正会員') >= 0)
      ? '入会金 ¥1,000 ＋ 年会費 ¥2,000（初年度 ¥3,000、次年度以降 ¥2,000）'
      : '年会費 ¥2,000';
    MailApp.sendEmail(
      email,
      '【nest】入会申込を受け付けました',
      name + ' 様\n\n' +
      'この度は NPO法人 nest への入会をお申し込みいただき、ありがとうございます。\n' +
      '以下の内容で受け付けました。\n\n' +
      '■ 会員区分：' + type + '\n' +
      '■ お支払い金額：' + fee + '\n\n' +
      '【お支払い方法】\n' +
      '当面は現金でのお支払いをお願いしております。\n' +
      '事務局までご持参いただくか、行事の際にお渡しください。\n' +
      '（オンライン決済は今後対応予定です）\n\n' +
      'ご不明な点は事務局まで：093-582-7018（平日 9:00〜18:00）\n\n' +
      'NPO法人 nest'
    );
  }

  // --- ③ 受付状況を「未対応」に初期化 ---
  var sheet = e.range.getSheet();
  var row = e.range.getRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var col = headers.indexOf('受付状況') + 1;
  if (col === 0) {
    col = sheet.getLastColumn() + 1;
    sheet.getRange(1, col).setValue('受付状況');
  }
  sheet.getRange(row, col).setValue('未対応');
}

/**
 * 通知先メールだけを後から確認・変更したいとき用。
 * OFFICE_EMAIL を本番アドレスに書き換えて保存すれば、次回以降の通知に反映されます。
 */
function setOfficeEmailOnly() {
  Logger.log('現在の通知先: ' + OFFICE_EMAIL);
  Logger.log('変更したい場合は OFFICE_EMAIL を編集して保存してください（フォーム再作成は不要）。');
}
