import { test, expect, type Page } from '@playwright/test';

// 税の話：冒頭の2区分（特別障害者・一般障害者）と「6つの制度」がつながって読めること。
// 区分と金額は e-Gov で確認（所得税法79条・施行令10条、地方税法34条・314条の2、
// 相続税法19条の4・21条の4、相続税法施行令4条の4・4条の8、所得税法施行令31条の2）。

const item = (page: Page, title: string) =>
  page.locator('.pp-tax-item').filter({ has: page.getByRole('heading', { level: 5, name: title, exact: true }) });

const rows = (page: Page, title: string) =>
  item(page, title).locator('li').evaluateAll((lis) => lis.map((li) => li.textContent!.replace(/\s+/g, '')));

test.beforeEach(async ({ page }) => {
  await page.goto('/post-parent/');
});

test('category cards are named 特別障害者 and 一般障害者 with the statutory contents', async ({ page }) => {
  const kubun = page.locator('.pp-tax-kubun__card');
  await expect(kubun.locator('.pp-tax-kubun__tag')).toHaveText(['特別障害者', '一般障害者']);
  // 障害者控除では身体障害者手帳 3〜6級も一般障害者（所得税法施行令10条1項3号）
  await expect(kubun.nth(1)).toContainText('身体障害者手帳 3〜6級');
  await expect(page.locator('#tax')).not.toContainText('一般（特定）');
});

test('the category section says which systems depend on it', async ({ page }) => {
  await expect(page.locator('#tax')).toContainText('この区分で金額が変わるのは、下の6つのうち3つです');
});

test('income and resident tax deduction lists the amount for each category', async ({ page }) => {
  const r = await rows(page, '所得税・住民税の障害者控除');
  expect(r).toContainEqual(expect.stringMatching(/^一般障害者.*所得税27万円.*住民税26万円/));
  expect(r).toContainEqual(expect.stringMatching(/^特別障害者.*所得税40万円.*住民税30万円/));
  expect(r).toContainEqual(expect.stringMatching(/^同居の特別障害者.*所得税75万円.*住民税53万円/));
});

test('inheritance tax deduction lists the amount for each category', async ({ page }) => {
  const r = await rows(page, '相続税の障害者控除');
  expect(r).toContainEqual(expect.stringMatching(/^一般障害者.*1年につき10万円/));
  expect(r).toContainEqual(expect.stringMatching(/^特別障害者.*1年につき20万円/));
});

test('specified gift trust lists the limits and excludes physical-only general cases', async ({ page }) => {
  const r = await rows(page, '特定贈与信託（贈与税の非課税）');
  expect(r).toContainEqual(expect.stringMatching(/^一般障害者のうち知的障害・精神障害の方.*3,000万円/));
  expect(r).toContainEqual(expect.stringMatching(/^特別障害者.*6,000万円/));
  await expect(item(page, '特定贈与信託（贈与税の非課税）')).toContainText('身体障害だけの一般障害者は対象外');
});

test('systems that do not depend on the category say so', async ({ page }) => {
  for (const title of ['少額貯蓄の利子非課税（マル優）', '心身障害者扶養共済（しょうがい共済）']) {
    await expect(item(page, title)).toContainText('特別・一般の区分による違いはありません');
  }
  await expect(item(page, '相続登記の義務化（あわせて確認）')).toContainText('障害の有無に関係なく');
});
