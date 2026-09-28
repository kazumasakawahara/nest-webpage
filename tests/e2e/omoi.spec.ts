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
