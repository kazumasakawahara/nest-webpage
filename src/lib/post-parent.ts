// 親なき後ハブの構造化データ。
// 実ファイル（PDF）は public/docs/post-parent/ 以下に配置し、各 file パスを指す。
// 素材が未準備の配列は空のままでよい（各ページが「準備中」を表示する）。

export interface PdfDoc {
  title: string;
  file: string;      // 例: /docs/post-parent/annual-2025.pdf
  cover?: string;    // 表紙画像（任意）例: /images/post-parent/annual-2025-cover.png
  meta?: string;     // 例: 2025年度 ・ PDF
  note?: string;     // 例: 講師の許諾を得て公開
}

export interface Seminar {
  year: string;      // 例: 2024
  theme: string;     // 研修テーマ
  lecturer: string;  // 講師名
  materials: PdfDoc[];
}

export interface ToolLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface ToolManual {
  intro: string;    // 福祉職に配慮した、ハードルを下げる導入紹介文
  href: string;     // 例: /internal/... または外部URL（GitHub等）
  label: string;    // ボタン文言
  meta?: string;    // 例: 画面でそのまま読めます（別ページで開きます）
}

export interface ToolIntro {
  id?: string;      // ページ内アンカー用（例: kurashi-support → /post-parent/tools/#kurashi-support）
  step?: string;    // 「聞く → 書く → 残す・共有する」の3段のどこに位置するか
  name: string;
  tagline: string;
  forWhom: string;
  body: string;
  icon?: string;    // アプリ風アイコン（ストア風カード表示用）例: /images/post-parent/kurashi-support-icon.svg
  chips?: string[]; // 特徴チップ（ストア風カード表示用）例: 'GitHubで無料公開'
  image?: string;
  imageAlt?: string;
  video?: string;   // 紹介動画（mp4）例: /videos/kurashi-support-ai.mp4
  poster?: string;  // 動画のポスター画像（任意。未指定なら video の先頭フレーム）
  manual?: ToolManual; // 導入マニュアルへの誘導（任意）
  links: ToolLink[];
}

// 年次報告（アニュアル）
export const annualReports: PdfDoc[] = [
  // TODO(河原さん): 公開する年次報告PDFを public/docs/post-parent/ に置き、ここへ追加
];

// 研修資料・その他
export const trainingDocs: PdfDoc[] = [
  // TODO(河原さん): 配布許諾済みの研修資料を追加（note に「講師の許諾を得て公開」など）
];

// 地域生活支援（巣立ちプロジェクト）活動報告書
// 実体は /pdfs/newsletter-archive/ に配置済み。地域生活支援ページと同じPDFを共有する。
export const sudachiReports: PdfDoc[] = [
  {
    title: '巣立ちプロジェクトⅣ 2025報告書',
    file: '/pdfs/newsletter-archive/%E5%B7%A3%E7%AB%8B%E3%81%A1%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%882025%E5%A0%B1%E5%91%8A%E6%9B%B8.pdf',
    cover: '/images/newsletter/2025-report-cover.jpg',
    meta: '2025年度 ・ PDF 24ページ ・ 約16MB',
  },
  {
    title: '巣立ちプロジェクトⅢ 2024報告書',
    file: '/pdfs/newsletter-archive/%E5%B7%A3%E7%AB%8B%E3%81%A1%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%882024%E5%A0%B1%E5%91%8A%E6%9B%B8.pdf',
    cover: '/images/newsletter/2024-report-cover.jpg',
    meta: '2024年度 ・ PDF 20ページ ・ 約10MB',
  },
  {
    title: '巣立ちプロジェクトⅡ 2023報告書',
    file: '/pdfs/newsletter-archive/%E5%B7%A3%E7%AB%8B%E3%81%A1%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%882023%E5%A0%B1%E5%91%8A%E6%9B%B8.pdf',
    cover: '/images/newsletter/2023-report-cover.jpg',
    meta: '2023年度 ・ PDF 16ページ ・ 約8.5MB',
  },
];

// 研修会アーカイブ
export const seminars: Seminar[] = [
  // TODO(河原さん): 研修会のメタ情報（年・テーマ・講師）と配布資料を追加
];

// ツール・しくみ紹介（概念紹介のみ。実データ・内部構造は載せない）。
// 読み手は計画相談の担当者・意思決定支援者に統一（2026-08-11）。
// ご家族向け（旧 oya-inai ・家族聴き取りガイド）はこの3段から外し、別プロジェクトとして後日再登場させる。
// 旧ページ（tools/kikitori-guide・tools/oya-inai-start）は削除せずに残してある（家族版で再利用するため）。
export const tools: ToolIntro[] = [
  // ── ① 聞く ─────────────────────────────────────────────
  {
    id: 'kikitori-guide',
    step: '聞く',
    name: '支援者のための記録ガイド',
    tagline: '聞いたことを、活かし続けるために',
    forWhom: '計画相談支援の担当者・意思決定支援に関わる方向け',
    chips: ['聞き方の手引きではありません', '資料は丸ごと渡すだけ', '転記は不要', '印刷して使えます'],
    image: '/images/post-parent/flow-kikitori-guide.svg',
    imageAlt: '聞く・渡す・引き出すの3段を並べた全体図。いまは1段目の「聞く」を示している',
    body:
      '初回のアセスメントで、みなさんはすでに時間をかけて丁寧に聞き取っておられます。' +
      'このガイドは、聞き方の手引きではありません。扱うのは2つだけです。' +
      'ひとつは、作った資料をどう渡すか。フェイスシートも計画も診断書も、転記せずに丸ごと渡していただければ、' +
      '禁忌・引き金・手順・期限といった単位に交通整理され、手元の記録と支援データベースへ振り分けられます。' +
      'もうひとつは、その情報をどう古びさせないか。フェイスシートは作った日の姿で止まります。' +
      'モニタリングのたびに同じ3つ——「前の対応は今も同じか・効いたか」「要らなくなったことは」「新しく気づいたことは」' +
      '——を置くだけで、情報が古くならずに済みます。',
    links: [
      { label: 'ガイドを読む', href: '/internal/shien-kikitori-guide.html' },
      { label: 'この取り組みについて問い合わせる', href: '/contact/' },
    ],
  },

  // ── ② 渡す ─────────────────────────────────────────────
  {
    id: 'oya-inai-template',
    step: '渡す',
    name: '記録テンプレートと、ひとつの入力',
    tagline: '清書せずに渡すと、あとは振り分けられます',
    forWhom: '計画相談支援の担当者・意思決定支援に関わる方向け',
    chips: ['GitHubで無料公開（MIT）', 'Obsidian だけでも使えます', '記入例つき', 'Mac・Windows対応'],
    image: '/images/post-parent/flow-oya-inai-template.svg',
    imageAlt: '聞く・渡す・引き出すの3段を並べた全体図。いまは2段目の「渡す」を示している',
    body:
      '面談メモの走り書きでも、事業所から届いた支援記録でも、清書せずにそのまま渡していただけば十分です。' +
      '「これは禁忌か、引き金か」「どのページに書くか」を担当者が判断する必要はありません。' +
      '手元の記録（無料アプリ Obsidian のテンプレート）と、下の支援データベースの両方へ、それぞれの流儀で振り分けられます——' +
      '「なぜ・どう変わってきたか」の経緯は手元へ、機械が漏れなく拾う必要のある事実はデータベースへ。' +
      '振り分けの結果は先に宣言され、違っていれば訂正できます。実名が入るデータベース側への登録は、必ず人の確認を経てから行います。' +
      'テンプレートだけを使って、Obsidian 単体で運用することもできます（データベースは不要です）。' +
      '架空の利用者を例にした記入例を同梱しているので、実際の書きぶりを見てから始められます。',
    links: [
      { label: 'GitHubで入手する（無料）', href: 'https://github.com/kazumasakawahara/oya-inai-keikaku-soudan', external: true },
      { label: 'この取り組みについて問い合わせる', href: '/contact/' },
    ],
  },

  // ── ③ 引き出す ───────────────────────────────────
  {
    id: 'kurashi-support',
    step: '引き出す',
    name: 'くらしサポート（親なき後支援データベース）',
    tagline: '必要なときに、必要な人へ、確実に',
    forWhom: '計画相談支援の担当者・意思決定支援に関わる方・関心のある法人向け',
    icon: '/images/post-parent/kurashi-support-icon.svg',
    chips: ['GitHubで無料公開（MIT）', 'Mac・Windows対応', '緊急時の禁忌をまっ先に表示', 'Claude から登録・照会'],
    image: '/images/post-parent/flow-kurashi-support.svg',
    imageAlt: '聞く・渡す・引き出すの3段を並べた全体図。いまは3段目の「引き出す」を示している',
    body:
      '親や家族が積み重ねた「我が子を守る知恵」を、特定の誰かの記憶に頼らず継承するための仕組みです。' +
      '本人の大切にしていること、緊急時の注意、支えてくれる人のつながりを整理し、必要なときに必要な人へ確実に引き継げる形にします。' +
      '緊急時には「してはいけないこと」をまっ先に表示して二次被害を防ぎ、日々の記録は現場のスタッフが画面から短く残せます。' +
      '禁忌・推奨ケア・キーパーソン・手帳や受給者証の期限——聴き取りで集まる事実が、そのままこのしくみの骨格になっています。' +
      'しくみ全体は「oya-inai-db」としてGitHubで無料公開（MITライセンス）しています。有料ソフトの購入は不要ですが、' +
      '登録も引き出しも Claude にお願いする設計のため、Claude の有料プランが実質的な導入要件になります。' +
      '無料プランは入力した内容がサービスの改善に用いられうるため、利用者の情報を扱う用途ではお使いいただけません。' +
      '関心のある支援者・法人の方はどなたでも導入いただけます。',
    video: '/videos/kurashi-support-ai.mp4',
    poster: '/videos/kurashi-support-ai-poster.jpg',
    manual: {
      intro:
        '「システム」や「データベース」と聞くと、少し身構えてしまうかもしれません。でも、心配はいりません。パソコンの操作に不慣れな支援員・相談員の方を想定した「はじめてガイド」を用意しました。ことばの説明から毎日の使い方、うまくいかないときのQ&Aまで、ゼロからひとつずつ進められます。むずかしいのは初日だけ。2日目からはダブルクリックだけで使えます。',
      href: '/internal/oya-inai-db-hajimete-guide.html',
      label: 'はじめてガイドを読む',
      meta: '画面でそのまま読めます（印刷用PDFつき・別ページで開きます）',
    },
    links: [
      { label: 'GitHub で見る（無料公開）', href: 'https://github.com/kazumasakawahara/oya-inai-db', external: true },
      { label: 'この取り組みについて問い合わせる', href: '/contact/' },
    ],
  },
  // 支援エコマップのカードは 2026-08-11 に外した。
  // 理由：3段（聞く・渡す・引き出す）とカードを3枚で 1対1 にするため。
  // エコマップ自体をやめたわけではなく、配布物が揃った段階で「引き出す」へ戻せる
  // （画像 `public/images/post-parent/ecomap.png` は残してある）。
];
