import { test, expect } from '@playwright/test';

// 満席になったイベント（frontmatter の soldOut: true）は、一覧と記事ページで目立つ形で知らせる
const CONCERT = '/news/2026-09-02-kimachiya-autumn-concert/';

test('news list marks the sold-out event and only that one', async ({ page }) => {
  await page.goto('/news/');
  const concert = page.locator(`a[href="${CONCERT}"]`);
  await expect(concert.locator('.badge--sold-out')).toHaveText('満席');
  await expect(page.locator('.news-list .badge--sold-out')).toHaveCount(1);
});

test('sold-out event page shows a notice that booking has closed', async ({ page }) => {
  await page.goto(CONCERT);
  await expect(page.locator('.news-article__head .badge--sold-out')).toHaveText('満席');
  const notice = page.getByRole('note');
  await expect(notice).toContainText('満席となりました');
  await expect(notice).toContainText('お申し込みの受付は終了しています');
  await expect(page.locator('.news-article__body')).toContainText('満席のため、受付は終了しました');
});

test('other news pages show no sold-out notice', async ({ page }) => {
  await page.goto('/news/2026-08-30-zei-no-tokurei/');
  await expect(page.locator('.badge--sold-out')).toHaveCount(0);
  await expect(page.getByRole('note')).toHaveCount(0);
});
