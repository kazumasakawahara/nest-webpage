import { test, expect } from '@playwright/test';

// 最初の掲載（2026-09-29-01）とフォームURL未設定の表示
test('omoi list page shows the first post with its title', async ({ page }) => {
  await page.goto('/post-parent/omoi/');
  // PageIntro は見出しを h2 で出す（資料室など既存の子ページと同じ）
  await expect(page.getByRole('heading', { level: 2, name: '私の想い' })).toBeVisible();
  const card = page.locator('article[id="2026-09-29-01"]');
  // 投稿の見出しはページの h2 の下なので h3
  await expect(card.getByRole('heading', { level: 3, name: '何が何でも病気にはなれません' })).toBeVisible();
  await expect(card).toContainText('いま一番気がかりなこと');
  await expect(card).toContainText('親／匿名');
  await expect(page.getByText('まだ掲載はありません')).toHaveCount(0);
  await expect(page.getByText('投稿フォームは準備中です')).toBeVisible();
  // 絞り込みは2種類以上のお題があるときだけ
  await expect(page.locator('[data-omoi-filter]')).toHaveCount(0);
});

test('post-parent hub lists titles and opens the full text in place', async ({ page }) => {
  await page.goto('/post-parent/');
  const section = page.locator('#omoi');
  // 章「声を聴く」（h2）の中のブロックなので h3
  await expect(section.getByRole('heading', { level: 3, name: '私の想い' })).toBeVisible();
  // 見出しの横の「見る」を押すと、ページを移らずに全文が開く
  const post = section.locator('details[id="omoi-2026-09-29-01"]');
  const toggle = post.locator('summary');
  await expect(toggle).toContainText('何が何でも病気にはなれません');
  await expect(toggle).toContainText('見る');
  const lastLine = post.getByText('私は何が何でも病気にはなれません。', { exact: true });
  await expect(lastLine).toBeHidden();
  await toggle.click();
  await expect(lastLine).toBeVisible();
  await expect(post).toContainText('親／匿名');
  await expect(toggle).toContainText('閉じる');
  await toggle.click();
  await expect(lastLine).toBeHidden();
  // 抜粋のリンクカードはもう出さない
  await expect(section.locator('a.omoi-card')).toHaveCount(0);
  await expect(section.getByRole('link', { name: 'ほかの想いを読む' })).toHaveAttribute('href', '/post-parent/omoi/');
  await expect(section.getByText('投稿フォームは準備中です')).toBeVisible();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  // 全文の開閉はブラウザ標準の部品なので、JavaScript がなくても開ける
  test('post-parent hub opens the full text', async ({ page }) => {
    await page.goto('/post-parent/');
    const post = page.locator('#omoi details[id="omoi-2026-09-29-01"]');
    await post.locator('summary').click();
    await expect(post.getByText('私は何が何でも病気にはなれません。', { exact: true })).toBeVisible();
  });

  // 絞り込みは JavaScript でしか動かないので、無いときはボタンを見せない（全件はそのまま読める）
  test('omoi list page does not show the theme filter', async ({ page }) => {
    await page.goto('/post-parent/omoi/');
    const filter = page.locator('[data-omoi-filter]');
    if ((await filter.count()) > 0) await expect(filter).toBeHidden();
  });
});
