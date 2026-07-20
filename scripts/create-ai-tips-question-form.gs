/**
 * 教えてAIさん 質問箱フォーム 自動生成スクリプト（Google Apps Script）
 * =====================================================================
 *
 * 「教えてAIさん」コーナーの質問募集フォームを Google フォームとして一発で作成し、
 * 回答を集約するスプレッドシートまで自動で用意するスクリプトです。
 * 実行すると次の状態のフォーム＆スプレッドシートが出来上がります：
 *
 *   - 質問6項目（質問内容・お立場・AI経験・お名前・メール・記事化同意）
 *   - 回答集約用スプレッドシート「教えてAIさん質問箱_回答」＋ 編集部管理列
 *   - 送信のたびに自動で動く処理：
 *       ① 担当者（NOTIFY_EMAIL）への通知メール
 *       ② 質問者への受付確認メール（メール記入者のみ・自動返信）
 *       ③ スプレッドシート「対応状況」を「未対応」に初期化
 *
 * 【使い方】
 *   1. フォームを管理する Google アカウントで https://script.google.com/ を開き、
 *      「新しいプロジェクト」を作成
 *   2. このファイルの中身を全部コピーして、エディタに貼り付け（既存コードは消す）
 *   3. 関数選択を「createAiTipsQuestionForm」にして ▶実行
 *   4. 初回は権限の承認ダイアログが出るので許可
 *      （フォーム作成・スプレッドシート作成・メール送信・トリガーの権限）
 *   5. 実行ログ（表示 → ログ／Ctrl+Enter）に出力される URL を確認：
 *        - 公開URL（回答用）          … サイトのボタン・QR・共有用
 *        - 編集URL                    … 後から項目を編集する用
 *        - 回答スプレッドシートURL     … 質問データの保存先
 *   6. ログの「公開URL」を、サイト側 src/components/AiTipsQuestionBox.astro の
 *        const FORM_VIEW_URL = '...'  にそのまま貼り付け → デプロイ
 *      （これだけで教えてAIさんの一覧・各記事に質問ボタンが表示されます）
 *
 * 【通知先メールについて】
 *   NOTIFY_EMAIL 宛に、質問が届くたびに通知メールが届きます。
 *   後から変更したい場合は NOTIFY_EMAIL を書き換えて保存するだけで反映されます
 *   （onAiTipsQuestionSubmit が NOTIFY_EMAIL を参照しているため、フォーム再作成は不要）。
 *
 * 【Workspace アカウントで作成する場合の注意】
 *   既定でログイン必須になることがあります。作成後に一般の方が回答できるか
 *   シークレットウィンドウで必ず確認し、ログインを求められる場合は
 *   openQuestionFormToPublic を実行してください（見学フォームと同じ手順）。
 *
 * 【テーマカラー・ロゴについて】
 *   テーマカラー（nest 緑 #2D5A27）とヘッダーロゴは Apps Script では設定できません。
 *   作成後、編集URL を開いてパレットアイコンから手動で設定してください（任意）。
 */

// ▼▼▼ 質問の通知先（編集担当）メールアドレス ▼▼▼
// ※ 現在は事務局宛。教えてAIさんの編集担当に届けたい場合はここを書き換える
var NOTIFY_EMAIL = 's.kawasaki@npo-nest.com';
// ▲▲▲

// 同意文・確認メッセージから参照するプライバシーポリシーURL
var PRIVACY_URL = 'https://nponest.com/privacy/';

/**
 * メイン：フォーム＋スプレッドシートを作成し、全項目・確認文・自動処理をセットする。
 */
function createAiTipsQuestionForm() {
  var form = FormApp.create('教えてAIさん 質問箱');

  form.setTitle('教えてAIさん 質問箱');
  form.setDescription(
    'nest公式サイトのコーナー「教えてAIさん」の質問募集フォームです。\n' +
    'パソコンやAIについて、「こんなことできるの？」「ここで困っている」を\n' +
    'ひとことでも構いませんので、お気軽にお寄せください。\n' +
    '\n' +
    'いただいた質問は、個人が特定されない形に書き直したうえで、\n' +
    '記事として取り上げてお答えすることがあります。\n' +
    '（すべての質問に個別のお返事をお約束するものではありません）'
  );
  form.setConfirmationMessage(
    '質問ありがとうございます！\n' +
    'いただいた質問は編集部で拝見し、記事で取り上げる形でお答えしていきます。\n' +
    '「教えてAIさん」の更新をどうぞお楽しみに。\n' +
    'https://nponest.com/ai-tips/'
  );
  form.setCollectEmail(false);          // メールはフォーム項目として個別に取得する
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(true); // 質問は何度でも歓迎
  form.setProgressBar(false);           // 項目が少ないので出さない
  // 一般公開フォーム：ログイン不要・回答回数無制限にする
  form.setRequireLogin(false);
  form.setLimitOneResponsePerUser(false);

  // 1. 質問・困りごと（必須・長文）
  form.addParagraphTextItem()
    .setTitle('AIやパソコンについて、聞いてみたいこと・困っていること')
    .setRequired(true)
    .setHelpText('ひとことでもOKです。「そもそも何から始めれば…」という質問も大歓迎です。');

  // 2. お立場（任意・単一選択）
  form.addMultipleChoiceItem()
    .setTitle('よろしければ、お立場を教えてください')
    .setChoiceValues([
      '福祉・介護の仕事をしている',
      '利用者のご家族',
      'ご本人（当事者）',
      'nestの職員・関係者',
      'その他',
    ]);

  // 3. AIの経験（任意・単一選択）
  form.addMultipleChoiceItem()
    .setTitle('AI（ChatGPT・Geminiなど）を使ったことはありますか？')
    .setChoiceValues([
      'まだ使ったことがない',
      '少し触ってみたことがある',
      'ときどき使っている',
      'ほぼ毎日使っている',
    ]);

  // 4. お名前・ニックネーム（任意）
  form.addTextItem()
    .setTitle('お名前・ニックネーム（任意）')
    .setHelpText('記事で紹介する際は「〇〇さんからの質問」のようには書かず、匿名で扱います。');

  // 5. メールアドレス（任意・メール形式チェック）
  var emailValidation = FormApp.createTextValidation()
    .setHelpText('正しいメールアドレスを入力してください。')
    .requireTextIsEmail()
    .build();
  form.addTextItem()
    .setTitle('メールアドレス（任意）')
    .setHelpText('記事で取り上げた際にお知らせを希望する場合はご記入ください。')
    .setValidation(emailValidation);

  // 6. 記事化への同意（必須）
  var consent = form.addCheckboxItem();
  consent.setTitle('質問の取り扱いについて')
    .setHelpText(
      'いただいた質問は、個人・事業所が特定されない形に書き直したうえで、\n' +
      '「教えてAIさん」の記事で紹介することがあります。\n' +
      '個人情報はプライバシーポリシー（' + PRIVACY_URL + '）に基づき適切に取り扱います。'
    )
    .setRequired(true)
    .setChoices([consent.createChoice('同意します')]);

  // 回答集約用スプレッドシートを作成して連携し、編集部管理列を追加する
  var ss = SpreadsheetApp.create('教えてAIさん質問箱_回答');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();
  removeEmptyDefaultSheet_(ss);   // 連携で残る空の「シート1」を片付ける
  // 管理列の追加で万一つまずいても、フォーム本体・トリガー・URL出力は止めない
  try {
    addEditorialColumns_(ss);
  } catch (err) {
    Logger.log('※ 管理列の追加をスキップしました（' + err + '）。フォーム自体は正常に作成されています。');
  }

  // 送信時トリガー（① 担当者通知 ② 受付確認の自動返信 ③ 対応状況の初期化）
  registerQuestionSubmitTrigger_(ss);

  // 出力
  var published = form.getPublishedUrl();
  Logger.log('================ 作成完了 ================');
  Logger.log('公開URL（回答用 / ボタン・QR用）: ' + published);
  Logger.log('編集URL                         : ' + form.getEditUrl());
  Logger.log('フォームID                      : ' + form.getId());
  Logger.log('回答スプレッドシートURL         : ' + ss.getUrl());
  Logger.log('通知先メール                    : ' + NOTIFY_EMAIL);
  Logger.log('==========================================');
  Logger.log('→ 「公開URL」を AiTipsQuestionBox.astro の FORM_VIEW_URL に貼り付けてください。');
  Logger.log('→ シークレットウィンドウで、ログインなしで回答できるか必ず確認してください。');
}

/**
 * 回答スプレッドシートのフォーム回答シートに、編集部管理列を追加する。
 */
function addEditorialColumns_(ss) {
  var sheet = findResponseSheet_(ss);
  if (!sheet) return;
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return; // ヘッダー行が未生成のときは何もしない（安全策）
  var managed = ['対応状況', '記事化予定', '掲載記事URL', 'メモ'];
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
function registerQuestionSubmitTrigger_(ss) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onAiTipsQuestionSubmit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('onAiTipsQuestionSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
}

/**
 * 送信時に呼ばれる：
 *   ① 担当者（NOTIFY_EMAIL）へ通知メール
 *   ② 質問者へ受付確認メール（メールアドレス記入者のみ・自動返信）
 *   ③ スプレッドシートの「対応状況」を「未対応」に初期化
 */
function onAiTipsQuestionSubmit(e) {
  var r = e.namedValues;
  var question = (r['AIやパソコンについて、聞いてみたいこと・困っていること'] || [''])[0];
  var email = (r['メールアドレス（任意）'] || [''])[0];

  // --- ① 担当者への通知 ---
  var lines = Object.keys(r).map(function (k) { return k + '：' + r[k].join(', '); });
  MailApp.sendEmail(
    NOTIFY_EMAIL,
    '【教えてAIさん】新しい質問が届きました',
    '教えてAIさん質問箱に新しい質問がありました。\n\n' +
    lines.join('\n') +
    '\n\nスプレッドシートで詳細を確認してください。'
  );

  // --- ② 質問者への受付確認（メール記入者のみ・自動返信） ---
  if (email) {
    MailApp.sendEmail(
      email,
      '【nest 教えてAIさん】質問を受け付けました',
      'この度は「教えてAIさん」に質問をお寄せいただき、ありがとうございます。\n' +
      '以下の内容で受け付けました。\n\n' +
      '■ ご質問：\n' + question + '\n\n' +
      'いただいた質問は編集部で拝見し、記事で取り上げる形でお答えしていきます。\n' +
      'https://nponest.com/ai-tips/\n\n' +
      '※ このメールは自動送信です。ご返信いただいてもお答えできない場合があります。\n\n' +
      '特定非営利活動法人nest「教えてAIさん」編集部'
    );
  }

  // --- ③ 対応状況を「未対応」に初期化 ---
  var sheet = e.range.getSheet();
  var row = e.range.getRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var col = headers.indexOf('対応状況') + 1;
  if (col === 0) {
    col = sheet.getLastColumn() + 1;
    sheet.getRange(1, col).setValue('対応状況');
  }
  sheet.getRange(row, col).setValue('未対応');
}

// ▼▼▼ 作成済みフォームのID（作成時ログの「フォームID」を入れる） ▼▼▼
var QUESTION_FORM_ID = '';
// ▲▲▲

/**
 * 【必要なときだけ実行】作成済みフォームを「誰でも回答可能（ログイン不要）」に開放する。
 * Workspace アカウントで作るとログイン必須になり、一般の方が回答できないため、
 * シークレットウィンドウでの確認でログインを求められた場合に実行する。
 * （フォームを作り直す必要はありません。回答・スプレッドシートはそのまま）
 */
function openQuestionFormToPublic() {
  var form = FormApp.openById(QUESTION_FORM_ID);
  form.setRequireLogin(false);
  form.setLimitOneResponsePerUser(false);
  Logger.log('ログイン不要に設定しました。一般の方が回答できます。');
  Logger.log('公開URL: ' + form.getPublishedUrl());
}
