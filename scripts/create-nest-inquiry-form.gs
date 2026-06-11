/**
 * nest お問い合わせフォーム 自動生成スクリプト（Google Apps Script）
 * =====================================================================
 *
 * これは「お問い合わせフォーム」を Google フォームとして一発で作成するための
 * スクリプトです。フィールド構成・必須設定・回答通知メール（ダミー）まで
 * 全部セットされた状態でフォームが出来上がります。
 *
 * 【使い方】
 *   1. https://script.google.com/ を開き、「新しいプロジェクト」を作成
 *   2. このファイルの中身を全部コピーして、エディタに貼り付け（既存コードは消す）
 *   3. 下の NOTIFY_EMAIL を ―― 後日 ―― 本番の受信アドレスに変更（今はダミーのまま）
 *   4. 関数選択を「createNestInquiryForm」にして ▶実行
 *   5. 初回は権限の承認ダイアログが出るので許可（フォーム作成・メール送信の権限）
 *   6. 実行ログ（表示 → ログ／Ctrl+Enter）に出力される URL を確認：
 *        - 公開URL（回答用）        … QR・共有用
 *        - 埋め込みURL（embedded）    … サイトに貼る用
 *        - 編集URL                   … 後から項目を編集する用
 *   7. ログの「公開URL」を、サイト側 src/pages/contact.astro の
 *        FORM_VIEW_URL = '...'  にそのまま貼り付け → デプロイ
 *      （これだけでページの埋め込みフォームと QR コードが本番表示に切り替わります）
 *
 * 【送信先メールについて】
 *   NOTIFY_EMAIL は現在ダミー（example ドメイン）です。
 *   本番アドレス確定後に書き換えて、もう一度 setNotifyEmailOnly を実行すれば
 *   通知先だけ差し替えられます（フォームを作り直す必要はありません）。
 */

// ▼▼▼ 後日、本番の受信アドレスに変更してください（今はダミー） ▼▼▼
var NOTIFY_EMAIL = 'inquiry@example.nponest.org'; // ← ダミー
// ▲▲▲

var PRIVACY_URL = 'https://（本番ドメイン）/privacy/'; // 同意文の参照先（任意・後日差し替え）

/**
 * メイン：フォームを作成して全項目をセットし、通知トリガーを登録する。
 */
function createNestInquiryForm() {
  var form = FormApp.create('nest お問い合わせフォーム');

  form.setTitle('nest お問い合わせフォーム');
  form.setDescription(
    '特定非営利活動法人nest へのお問い合わせフォームです。\n' +
    '見学・体験のご相談、入会・寄付、取材のご依頼などお気軽にどうぞ。\n' +
    '担当者より後日ご連絡いたします。'
  );
  form.setConfirmationMessage(
    'お問い合わせありがとうございます。\n' +
    '内容を確認のうえ、担当者より後日ご連絡いたします。'
  );
  form.setCollectEmail(false);          // メールはフォーム項目として個別に取得する
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setProgressBar(false);

  // 1. お問い合わせ種別（必須・単一選択）
  form.addMultipleChoiceItem()
    .setTitle('お問い合わせ種別')
    .setRequired(true)
    .setChoiceValues([
      '就労継続支援B型の見学・体験',
      'グループホームの空き状況・入居相談',
      '入会・寄付・ボランティアについて',
      '取材・講演のご依頼',
      '当事者活動（鉄道クラブ・当事者研究）について',
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

  // 8. お問い合わせ内容（必須・長文）
  form.addParagraphTextItem()
    .setTitle('お問い合わせ内容')
    .setRequired(true);

  // 9. 個人情報の取り扱いへの同意（必須）
  var consent = form.addCheckboxItem();
  consent.setTitle('個人情報の取り扱いについて')
    .setHelpText('プライバシーポリシー（' + PRIVACY_URL + '）に同意のうえ送信してください。')
    .setRequired(true)
    .setChoices([consent.createChoice('同意します')]);

  // 回答通知トリガー（送信のたびに NOTIFY_EMAIL へ通知メールを送る）
  registerSubmitTrigger_(form);

  // 出力
  var published = form.getPublishedUrl();
  Logger.log('================ 作成完了 ================');
  Logger.log('公開URL（回答用 / QR・共有用）: ' + published);
  Logger.log('埋め込みURL（サイト用）       : ' + published + '?embedded=true');
  Logger.log('編集URL                       : ' + form.getEditUrl());
  Logger.log('フォームID                    : ' + form.getId());
  Logger.log('通知先メール（要・本番変更）  : ' + NOTIFY_EMAIL);
  Logger.log('==========================================');
  Logger.log('→ 「公開URL」を contact.astro の FORM_VIEW_URL に貼り付けてください。');
}

/**
 * 送信時トリガーを（重複しないように）登録する。
 */
function registerSubmitTrigger_(form) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onNestFormSubmit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('onNestFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
}

/**
 * 送信時に呼ばれる：回答内容を NOTIFY_EMAIL 宛にメール通知する。
 */
function onNestFormSubmit(e) {
  var itemResponses = e.response.getItemResponses();
  var lines = [];
  for (var i = 0; i < itemResponses.length; i++) {
    var r = itemResponses[i];
    var ans = r.getResponse();
    if (Array.isArray(ans)) ans = ans.join(', ');
    lines.push('■ ' + r.getItem().getTitle() + '\n' + ans);
  }
  var body =
    'nest お問い合わせフォームに新しい回答がありました。\n\n' +
    lines.join('\n\n') +
    '\n\n--------------------------------\n' +
    '回答日時: ' + new Date().toLocaleString('ja-JP');

  MailApp.sendEmail(NOTIFY_EMAIL, '【nest】お問い合わせフォームに新着回答', body);
}

/**
 * 通知先メールだけを後から変更したいとき用。
 * 上の NOTIFY_EMAIL を本番アドレスに書き換えてから、この関数を実行すれば
 * トリガーが新しいアドレスを使うようになります（コードを保存するだけでOK）。
 * ※実体は onNestFormSubmit が NOTIFY_EMAIL を参照しているので、
 *   保存さえすれば反映されます。この関数は確認用です。
 */
function setNotifyEmailOnly() {
  Logger.log('現在の通知先: ' + NOTIFY_EMAIL);
  Logger.log('この値で次回以降の回答が通知されます。変更したい場合は NOTIFY_EMAIL を編集して保存してください。');
}
