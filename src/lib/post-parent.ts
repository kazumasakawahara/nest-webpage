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

export interface ToolIntro {
  name: string;
  tagline: string;
  forWhom: string;
  body: string;
  image?: string;
  imageAlt?: string;
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

// 研修会アーカイブ
export const seminars: Seminar[] = [
  // TODO(河原さん): 研修会のメタ情報（年・テーマ・講師）と配布資料を追加
];

// ツール・しくみ紹介（概念紹介のみ。実データ・内部構造は載せない）
export const tools: ToolIntro[] = [
  {
    name: 'くらしサポート（親なき後支援データベース）',
    tagline: '親の暗黙知を、支援者みんなで引き継げる形に',
    forWhom: 'nest と、関心のある支援者・法人向け',
    body: '親や家族が積み重ねた「我が子を守る知恵」を、特定の誰かの記憶に頼らず継承するための仕組みです。本人の大切にしていること、緊急時の注意、支えてくれる人のつながりを整理し、必要なときに必要な人へ確実に引き継げる形にします。',
    // image: '/images/post-parent/kurashisupport.png', // 用意でき次第
    links: [
      // GitHub公開可なら追加: { label: 'GitHub で見る', href: 'https://github.com/kazumasakawahara/nest-support', external: true },
      { label: 'この取り組みについて問い合わせる', href: '/contact/' },
    ],
  },
  {
    name: '支援エコマップ',
    tagline: '本人を中心とした支援ネットワークを可視化',
    forWhom: '相談支援専門員・社会福祉士・行政職員向け',
    body: '医療・福祉・権利擁護など、本人を支える人と機関のつながりを、直感的な図として描き・共有できるツールです。支援者間の情報共有を円滑にします。',
    // image: '/images/post-parent/ecomap.png', // 用意でき次第
    links: [
      // フェーズ2でデモを有効化: { label: 'デモを見る（読み取り専用）', href: '/post-parent/tools/eco-map-demo/' },
      { label: 'この取り組みについて問い合わせる', href: '/contact/' },
    ],
  },
];
