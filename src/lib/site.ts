export const site = {
  name: '特定非営利活動法人nest',
  shortName: 'nest',
  tagline: '本人の巣立ちを見守り、支援する。',
  description:
    '特定非営利活動法人nestは、発達障がいのある人とその家族の暮らしを支援するNPO法人です。北九州市小倉北区を拠点に、グループホーム・就労継続支援B型などの事業を展開しています。',
  address: '〒803-0851 福岡県北九州市小倉北区木町3丁目6−7',
  tel: '093-582-7018',
  telHours: '平日 8:00 〜 20:00',
  established: '平成18年（2006年）8月15日',
  representative: '林 澄江',
  instagram: 'https://instagram.com/kimachi_ya/',
  legacyUrl: 'https://www.nponest.org/',
  copyright: '©2019 by 特定非営利活動法人（NPO法人）nest',
} as const;

export type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const navLinks: NavLink[] = [
  { label: 'TOP', href: '/' },
  { label: 'nestについて', href: '/about/' },
  {
    label: '就労継続支援B型',
    href: '/b-type/',
    children: [
      { label: '木町家', href: '/kimachiya/' },
      { label: 'nestDesign', href: '/nest-design/' },
    ],
  },
  { label: 'グループホーム', href: '/group-home/' },
  { label: '地域生活支援', href: '/sudachi/' },
  { label: '親なき後', href: '/post-parent/' },
  { label: '利用者募集中', href: '/recruit/' },
  { label: 'nest News', href: '/news/' },
  { label: '入会・寄付', href: '/join/' },
  { label: 'お問い合わせ', href: '/contact/' },
  { label: 'アクセス', href: '/access/' },
];

export const stats = [
  { value: 19, suffix: '年', label: '設立から', sub: '平成18年（2006年）〜' },
  { value: 12, suffix: '拠点', label: 'グループホーム', sub: 'STATION / BRANCH / SATELLITE' },
  { value: 2, suffix: 'カ所', label: '就労継続支援B型', sub: '木町家・nestDesign' },
  { value: 4, suffix: '本柱', label: '当事者活動', sub: '鉄道・研究・余暇・学習' },
] as const;

export const voices = [
  {
    quote:
      '初めは「就職」というゴールが見えなくて不安でした。でも、木町家のキッチンで「ありがとう」と言われる経験を重ねるうちに、自分にもできることがある、と思えるようになりました。',
    name: '利用者・Aさん',
    role: '木町家 勤続5年',
    photo: null,
  },
  {
    quote:
      'うちの子は人見知りで、外に出ること自体が大きな挑戦でした。nestのスタッフは決して急かさず、本人のペースを大切にしてくれます。家族としてこれほど心強い場所はありません。',
    name: 'ご家族・Bさん',
    role: '利用者のお母さま',
    photo: null,
  },
  {
    quote:
      '「巣立ち」は、誰かが完璧になることではなく、地域全体で支え合う仕組みが整うこと。私たちは20年近くかけて、その仕組みを少しずつ育ててきました。',
    name: '林 澄江',
    role: 'nest 代表',
    photo: null,
  },
] as const;
