/**
 * nest 見学・お問い合わせフォーム 自動生成スクリプト（Google Apps Script）
 * =====================================================================
 *
 * 「見学・お問い合わせフォーム」を Google フォームとして一発で作成し、
 * 回答を集約するスプレッドシートまで自動で用意するスクリプトです。
 * 実行すると次の状態のフォーム＆スプレッドシートが出来上がります：
 *
 *   - 質問9項目（種別・氏名・連絡先・内容・同意 など。必須/任意も設定済み）
 *   - 回答集約用スプレッドシート「見学・お問い合わせ_回答」＋ 事務局管理列
 *   - 送信のたびに自動で動く処理：
 *       ① 担当者（NOTIFY_EMAIL）への通知メール
 *       ② お問い合わせ者への受付確認メール（自動返信）
 *       ③ スプレッドシート「受付状況」を「未対応」に初期化
 *
 * 【使い方】
 *   1. フォームを管理する Google アカウントで https://script.google.com/ を開き、
 *      「新しいプロジェクト」を作成
 *   2. このファイルの中身を全部コピーして、エディタに貼り付け（既存コードは消す）
 *   3. 関数選択を「createNestInquiryForm」にして ▶実行
 *   4. 初回は権限の承認ダイアログが出るので許可
 *      （フォーム作成・スプレッドシート作成・メール送信・トリガーの権限）
 *   5. 実行ログ（表示 → ログ／Ctrl+Enter）に出力される URL を確認：
 *        - 公開URL（回答用）          … QR・共有用
 *        - 埋め込みURL（embedded）     … サイトに貼る用
 *        - 編集URL                    … 後から項目を編集する用
 *        - 回答スプレッドシートURL     … 回答データの保存先
 *   6. ログの「公開URL」を、サイト側 src/pages/contact.astro の
 *        const FORM_VIEW_URL = '...'  にそのまま貼り付け → デプロイ
 *      （これだけでページの埋め込みフォームと QR コードが本番表示に切り替わります）
 *
 * 【通知先メールについて】
 *   NOTIFY_EMAIL 宛に、回答のたびに通知メールが届きます。
 *   後から変更したい場合は NOTIFY_EMAIL を書き換えて保存するだけで反映されます
 *   （onNestInquirySubmit が NOTIFY_EMAIL を参照しているため、フォーム再作成は不要）。
 *   現在値の確認は setNotifyEmailOnly を実行してください。
 *
 * 【テーマカラー・ロゴについて】
 *   テーマカラー（nest 緑 #2D5A27）とヘッダーロゴは Apps Script では設定できません。
 *   作成後、編集URL を開いてパレットアイコンから手動で設定してください（任意）。
 */

// ▼▼▼ 回答の通知先（担当者）メールアドレス ▼▼▼
var NOTIFY_EMAIL = 's.kawasaki@npo-nest.com';
// ▲▲▲

// 同意文・確認メッセージから参照するプライバシーポリシーURL
var PRIVACY_URL = 'https://nponest.com/privacy/';

/**
 * メイン：フォーム＋スプレッドシートを作成し、全項目・確認文・自動処理をセットする。
 */
function createNestInquiryForm() {
  var form = FormApp.create('nest 見学・お問い合わせフォーム');

  form.setTitle('nest 見学・お問い合わせフォーム');
  form.setDescription(
    '特定非営利活動法人nest への見学・お問い合わせフォームです。\n' +
    '就労継続支援B型・グループホームの見学／体験のご相談、入会・寄付、取材のご依頼など\n' +
    'お気軽にどうぞ。担当者より後日ご連絡いたします。\n' +
    'お急ぎの場合はお電話でも承ります：093-582-7018（平日 9:00〜18:00）'
  );
  form.setConfirmationMessage(
    'お問い合わせありがとうございます。\n' +
    '内容を確認のうえ、担当者より後日ご連絡いたします。\n' +
    'ご入力いただいたメールアドレス宛に受付確認メールをお送りしています。'
  );
  form.setCollectEmail(false);          // メールはフォーム項目として個別に取得する
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setProgressBar(true);
  // 一般公開フォーム：ログイン不要・回答回数無制限にする
  // （Workspace アカウントで作ると既定でログイン必須になり、一般の方が回答できないため）
  form.setRequireLogin(false);
  form.setLimitOneResponsePerUser(false);

  // 1. お問い合わせ種別（必須・単一選択）
  form.addMultipleChoiceItem()
    .setTitle('お問い合わせ種別')
    .setRequired(true)
    .setChoiceValues([
      '就労継続支援B型の見学・体験（木町家・nestDesign）',
      'グループホームの空き状況・入居相談',
      '入会・寄付・ボランティアについて',
      '取材・講演のご依頼',
      '当事者活動（鉄道倶楽部・当事者研究）について',
      '親なき後の備え・支援のしくみについて',
      'その他',
    ]);

  // 2. お名前（必須）
  form.addTextItem()
    .setTitle('お名前')
    .setRequired(true);

  // 3. ふりがな（任意）
  form.addTextItem()
    .setTitle('ふりがな');

  // 4. ご所属・団体名（任意）
  form.addTextItem()
    .setTitle('ご所属・団体名（あれば）');

  // 5. メールアドレス（必須・メール形式チェック）
  var emailValidation = FormApp.createTextValidation()
    .setHelpText('正しいメールアドレスを入力してください。')
    .requireTextIsEmail()
    .build();
  form.addTextItem()
    .setTitle('メールアドレス')
    .setRequired(true)
    .setValidation(emailValidation);

  // 6. 電話番号（任意）
  form.addTextItem()
    .setTitle('電話番号（任意）')
    .setHelpText('お電話での連絡をご希望の場合はご記入ください。');

  // 7. ご連絡方法のご希望（任意・単一選択）
  form.addMultipleChoiceItem()
    .setTitle('ご連絡方法のご希望')
    .setChoiceValues(['メール', '電話', 'どちらでも']);

  // 8. お問い合わせ内容・ご希望（必須・長文）
  form.addParagraphTextItem()
    .setTitle('お問い合わせ内容・ご希望（見学希望日時など）')
    .setRequired(true)
    .setHelpText('見学をご希望の場合は、ご希望の日時の候補もあわせてご記入ください。');

  // 9. 個人情報の取り扱いへの同意（必須）
  var consent = form.addCheckboxItem();
  consent.setTitle('個人情報の取り扱いについて')
    .setHelpText(
      'ご入力いただいた個人情報は、お問い合わせへの対応・ご連絡のためにのみ利用し、\n' +
      '法令に基づく場合を除き第三者へ提供することはありません。\n' +
      'プライバシーポリシー（' + PRIVACY_URL + '）に同意のうえ送信してください。'
    )
    .setRequired(true)
    .setChoices([consent.createChoice('同意します')]);

  // 回答集約用スプレッドシートを作成して連携し、事務局管理列を追加する
  var ss = SpreadsheetApp.create('見学・お問い合わせ_回答');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();
  removeEmptyDefaultSheet_(ss);   // 連携で残る空の「シート1」を片付ける
  // 管理列の追加で万一つまずいても、フォーム本体・トリガー・URL出力は止めない
  try {
    addManagementColumns_(ss);
  } catch (err) {
    Logger.log('※ 管理列の追加をスキップしました（' + err + '）。フォーム自体は正常に作成されています。');
  }

  // 送信時トリガー（① 担当者通知 ② 受付確認の自動返信 ③ 受付状況の初期化）
  registerInquirySubmitTrigger_(ss);

  // 出力
  var published = form.getPublishedUrl();
  Logger.log('================ 作成完了 ================');
  Logger.log('公開URL（回答用 / QR・共有用）: ' + published);
  Logger.log('埋め込みURL（サイト用）       : ' + published + '?embedded=true');
  Logger.log('編集URL                       : ' + form.getEditUrl());
  Logger.log('フォームID                    : ' + form.getId());
  Logger.log('回答スプレッドシートURL       : ' + ss.getUrl());
  Logger.log('通知先メール                  : ' + NOTIFY_EMAIL);
  Logger.log('==========================================');
  Logger.log('→ 「公開URL」を contact.astro の FORM_VIEW_URL に貼り付けてください。');
  Logger.log('→ テーマカラー(#2D5A27)・ロゴは編集URLから手動設定してください（任意）。');
}

/**
 * 回答スプレッドシートのフォーム回答シートに、事務局管理列を追加する。
 */
function addManagementColumns_(ss) {
  var sheet = findResponseSheet_(ss);
  if (!sheet) return;
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return; // ヘッダー行が未生成のときは何もしない（安全策）
  var managed = ['受付状況', '対応者', '対応日', '対応メモ'];
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  for (var i = 0; i < managed.length; i++) {
    if (headers.indexOf(managed[i]) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(managed[i]);
    }
  }
}

/**
 * フォームの回答シートを特定する。
 *   1) A1 が「タイムスタンプ」/「Timestamp」のシート（ロケール両対応）を優先
 *   2) 見つからなければ、ヘッダーが入っている（列のある）シート
 *   3) それも無ければ null
 * ※ SpreadsheetApp.create が作る空の「シート1」を誤って掴まないようにするための判定。
 */
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

/**
 * フォーム連携後に残る、空のデフォルトシート（「シート1」など）を削除して整える。
 * 回答シートを取り違える原因になるため取り除く。最低1枚は必ず残す。
 */
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

/**
 * スプレッドシート送信時トリガーを（重複しないように）登録する。
 */
function registerInquirySubmitTrigger_(ss) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onNestInquirySubmit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('onNestInquirySubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
}

/**
 * 送信時に呼ばれる：
 *   ① 担当者（NOTIFY_EMAIL）へ通知メール
 *   ② お問い合わせ者へ受付確認メール（自動返信）
 *   ③ スプレッドシートの「受付状況」を「未対応」に初期化
 */
function onNestInquirySubmit(e) {
  var r = e.namedValues;
  var name  = (r['お名前'] || [''])[0];
  var email = (r['メールアドレス'] || [''])[0];
  var type  = (r['お問い合わせ種別'] || [''])[0];

  // --- ① 担当者への通知 ---
  var lines = Object.keys(r).map(function (k) { return k + '：' + r[k].join(', '); });
  MailApp.sendEmail(
    NOTIFY_EMAIL,
    '【nest お問い合わせ】' + name + ' 様（' + type + '）',
    'nest 見学・お問い合わせフォームに新しい回答がありました。\n\n' +
    lines.join('\n') +
    '\n\nスプレッドシートで詳細を確認してください。'
  );

  // --- ② お問い合わせ者への受付確認（自動返信） ---
  if (email) {
    MailApp.sendEmail(
      email,
      '【nest】お問い合わせを受け付けました',
      name + ' 様\n\n' +
      'この度は特定非営利活動法人nest へお問い合わせいただき、ありがとうございます。\n' +
      '以下の内容で受け付けました。担当者より後日ご連絡いたします。\n\n' +
      '■ お問い合わせ種別：' + type + '\n\n' +
      'お急ぎの場合はお電話でも承ります：093-582-7018（平日 9:00〜18:00）\n\n' +
      '※ このメールは自動送信です。ご返信いただいてもお答えできない場合があります。\n\n' +
      '特定非営利活動法人nest'
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
 * NOTIFY_EMAIL を書き換えて保存すれば、次回以降の通知に反映されます
 * （フォームを作り直す必要はありません）。
 */
function setNotifyEmailOnly() {
  Logger.log('現在の通知先: ' + NOTIFY_EMAIL);
  Logger.log('変更したい場合は NOTIFY_EMAIL を編集して保存してください（フォーム再作成は不要）。');
}

// ▼▼▼ 作成済みフォームのID（作成時ログの「フォームID」を入れる） ▼▼▼
var INQUIRY_FORM_ID = '1mxsWMv0HbbuSvncmnwbahJueadEGCW85ZekVb21F8ho';
// ▲▲▲

/**
 * 【一度だけ実行】作成済みフォームを「誰でも回答可能（ログイン不要）」に開放する。
 * Workspace アカウントで作るとログイン必須になり、一般の方が回答できないため、
 * この関数を実行してログイン不要・回答回数無制限に切り替える。
 * （フォームを作り直す必要はありません。回答・スプレッドシートはそのまま）
 */
function openInquiryFormToPublic() {
  var form = FormApp.openById(INQUIRY_FORM_ID);
  form.setRequireLogin(false);
  form.setLimitOneResponsePerUser(false);
  Logger.log('ログイン不要に設定しました。一般の方が回答できます。');
  Logger.log('公開URL: ' + form.getPublishedUrl());
}
