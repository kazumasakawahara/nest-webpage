import { test, expect } from '@playwright/test';

test('homepage renders', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/nest/);
});

test('post-parent hub renders and links to sub-pages', async ({ page }) => {
  await page.goto('/post-parent/');
  await expect(page.getByRole('heading', { name: '知恵と仕組みを、分かち合う' })).toBeVisible();
  // 入口カード（.pp-entry）の3リンクが正しい子ページを指す。
  // 構想セクションにも tools への inline-link があるため、カードに限定して照合する。
  await expect(page.locator('a.pp-entry', { hasText: '資料室' })).toHaveAttribute('href', '/post-parent/library/');
  await expect(page.locator('a.pp-entry', { hasText: 'ツール・しくみ' })).toHaveAttribute('href', '/post-parent/tools/');
  await expect(page.locator('a.pp-entry', { hasText: '研修アーカイブ' })).toHaveAttribute('href', '/post-parent/seminars/');
});

test('post-parent sub-pages render with PDF modal container', async ({ page }) => {
  for (const path of ['/post-parent/library/', '/post-parent/seminars/']) {
    await page.goto(path);
    // PdfPreview モーダルコンテナが設置されている（既定は hidden）
    await expect(page.locator('#pdfModal')).toBeHidden();
  }
  await page.goto('/post-parent/tools/');
  await expect(page.getByRole('heading', { name: 'ツール・しくみ' })).toBeVisible();
});
