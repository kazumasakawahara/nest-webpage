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
  video?: string;   // 紹介動画（mp4）例: /videos/kurashi-support-ai.mp4
  poster?: string;  // 動画のポスター画像（任意。未指定なら video の先頭フレーム）
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

// ツール・しくみ紹介（概念紹介のみ。実データ・内部構造は載せない）
export const tools: ToolIntro[] = [
  {
    name: 'くらしサポート（親なき後支援データベース）',
    tagline: '親の暗黙知を、支援者みんなで引き継げる形に',
    forWhom: 'nest と、関心のある支援者・法人向け',
    body: '親や家族が積み重ねた「我が子を守る知恵」を、特定の誰かの記憶に頼らず継承するための仕組みです。本人の大切にしていること、緊急時の注意、支えてくれる人のつながりを整理し、必要なときに必要な人へ確実に引き継げる形にします。',
    video: '/videos/kurashi-support-ai.mp4',
    poster: '/videos/kurashi-support-ai-poster.jpg',
    links: [
      // GitHub公開可なら追加: { label: 'GitHub で見る', href: 'https://github.com/kazumasakawahara/nest-support', external: true },
      { label: 'この取り組みについて問い合わせる', href: '/contact/' },
    ],
  },
  {
    name: '親なき後・引き継ぎテンプレート（Obsidian）',
    tagline: '親の「我が子を守る知恵」を、無料で・誰でも残せる形に',
    forWhom: '障がいのある子をもつご家族・相談支援専門員向け',
    body: '専用システムがなくても、今日から始められる無料のテンプレートです。無料アプリ Obsidian に取り込むだけで、本人の「これだけは」を1枚にまとめたり、好き嫌い・関わり方・試行錯誤を記録できます。書いたメモは手元に残り、次の支援者へ引き継げます。「くらしサポート」の考え方を、誰もが手元で始められる軽量版にしたものです。',
    image: '/images/post-parent/oya-inai-template.png',
    imageAlt: '「親なき後・引き継ぎテンプレート」の画面例',
    links: [
      { label: '入手のしかた（画像つき手順）', href: '/post-parent/tools/oya-inai-start/' },
      { label: 'GitHubで入手する（無料）', href: 'https://github.com/kazumasakawahara/oya-inai', external: true },
      { label: 'この取り組みについて問い合わせる', href: '/contact/' },
    ],
  },
  {
    name: '支援エコマップ',
    tagline: '本人を中心とした支援ネットワークを可視化',
    forWhom: '相談支援専門員・社会福祉士・行政職員向け',
    body: '医療・福祉・権利擁護など、本人を支える人と機関のつながりを、直感的な図として描き・共有できるツールです。支援者間の情報共有を円滑にします。',
    image: '/images/post-parent/ecomap.png',
    imageAlt: '本人を中心に、医療・福祉・権利擁護・家族などの支援ネットワークをノードとつながりで可視化したエコマップの例',
    links: [
      // フェーズ2でデモを有効化: { label: 'デモを見る（読み取り専用）', href: '/post-parent/tools/eco-map-demo/' },
      { label: 'この取り組みについて問い合わせる', href: '/contact/' },
    ],
  },
];
