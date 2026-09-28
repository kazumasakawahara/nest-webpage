import { test, expect } from '@playwright/test';

// 掲載0件・フォームURL未設定（初期状態）の表示
test('omoi list page renders the empty state', async ({ page }) => {
  await page.goto('/post-parent/omoi/');
  // PageIntro は見出しを h2 で出す（資料室など既存の子ページと同じ）
  await expect(page.getByRole('heading', { level: 2, name: '私の想い' })).toBeVisible();
  await expect(page.getByText('まだ掲載はありません')).toBeVisible();
  await expect(page.getByText('投稿フォームは準備中です')).toBeVisible();
  // 絞り込みは2種類以上のお題があるときだけ
  await expect(page.locator('[data-omoi-filter]')).toHaveCount(0);
});

test('post-parent hub shows the omoi section without cards when nothing is published', async ({ page }) => {
  await page.goto('/post-parent/');
  const section = page.locator('#omoi');
  await expect(section.getByRole('heading', { level: 2, name: '私の想い' })).toBeVisible();
  await expect(section.getByText('投稿フォームは準備中です')).toBeVisible();
  // 0件のときは抜粋カードも一覧へのリンクも出さない
  await expect(section.locator('.omoi-card')).toHaveCount(0);
  await expect(section.getByRole('link', { name: 'ほかの想いを読む' })).toHaveCount(0);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  // 絞り込みは JavaScript でしか動かないので、無いときはボタンを見せない（全件はそのまま読める）
  test('omoi list page does not show the theme filter', async ({ page }) => {
    await page.goto('/post-parent/omoi/');
    const filter = page.locator('[data-omoi-filter]');
    if ((await filter.count()) > 0) await expect(filter).toBeHidden();
  });
});
