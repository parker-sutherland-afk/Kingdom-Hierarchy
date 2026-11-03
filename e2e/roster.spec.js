import { expect, test } from '@playwright/test';

test('role guide explains each role and its primary-role points', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Role guide and primary-role voting points').click();

  const guide = page.locator('details.group\\/guide');
  await expect(guide.getByText('King', { exact: true })).toBeVisible();
  await expect(guide.getByText('5 primary-role points')).toBeVisible();
  await expect(guide.getByText('Advisor', { exact: true })).toBeVisible();
  await expect(guide.getByText('3 primary-role points')).toBeVisible();
});

test('compact mode is shareable and the copied view restores the active filters', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search the roster' }).fill('Darcy');
  await page.getByRole('button', { name: /Military/ }).click();
  await page.getByRole('button', { name: 'Compact', exact: true }).click();

  await expect(page.getByRole('button', { name: 'Compact', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/q=Darcy/);
  await expect(page).toHaveURL(/group=Military/);
  await expect(page).toHaveURL(/view=compact/);
  await expect(page.getByRole('status').first()).toContainText('Showing 1 of 10 members');

  await page.getByRole('button', { name: 'Share view' }).click();
  await expect(page.getByText('Filtered view link copied.')).toBeVisible();
  const sharedUrl = new URL(await page.evaluate(() => navigator.clipboard.readText()));
  expect(sharedUrl.searchParams.get('q')).toBe('Darcy');
  expect(sharedUrl.searchParams.get('group')).toBe('Military');
  expect(sharedUrl.searchParams.get('view')).toBe('compact');
  expect(sharedUrl.searchParams.has('member')).toBe(false);

  await page.goto(sharedUrl.href);
  await expect(page.getByRole('searchbox', { name: 'Search the roster' })).toHaveValue('Darcy');
  await expect(page.getByRole('button', { name: 'Compact', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status').first()).toContainText('Showing 1 of 10 members');
});

test('filter state survives opening a member profile and browser back/forward', async ({ page }) => {
  await page.goto('/?q=Darcy&group=Council&role=Advisor&sort=name&view=compact');
  await page.getByRole('button', { name: 'Profile', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveURL(/member=3/);
  await expect(page).toHaveURL(/group=Council/);
  await page.goBack();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Search the roster' })).toHaveValue('Darcy');
  await page.goForward();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Darcy' })).toBeVisible();
});

test('local avatars need no external image and failed remote skins can be retried', async ({ page }) => {
  let avatarRequests = 0;
  await page.route('https://minotar.net/**', async route => {
    avatarRequests += 1;
    await route.abort();
  });
  await page.goto('/');

  await expect(page.getByRole('group', { name: "Will's Minecraft avatar" })).toContainText('WI');
  await expect(page.locator('img[src*="minotar.net"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Minecraft', exact: true }).click();
  const retryButton = page.getByRole('button', { name: "Retry loading Will's avatar" });
  await expect(retryButton).toBeVisible();
  const failedRequestCount = avatarRequests;
  await retryButton.click();
  await expect.poll(() => avatarRequests).toBeGreaterThan(failedRequestCount);
  await expect(retryButton).toBeVisible();

  await page.getByRole('button', { name: 'Local', exact: true }).click();
  await expect(page.getByRole('group', { name: "Will's Minecraft avatar" })).toContainText('WI');
  await expect(page.getByRole('button', { name: "Retry loading Will's avatar" })).toBeHidden();
  await expect(page.locator('img[src*="minotar.net"]')).toHaveCount(0);
});

test('compact layout fits a phone width and profile dialog stays in the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Compact', exact: true }).click();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);

  await page.getByRole('button', { name: 'Profile', exact: true }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(bounds.height).toBeLessThanOrEqual(844);
});

test('print view includes active search and filters but hides interactive controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search the roster' }).fill('Darcy');
  await page.getByRole('button', { name: /Military/ }).click();
  await page.emulateMedia({ media: 'print' });

  const summary = page.getByTestId('print-roster-summary');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('Showing 1 of 10 members.');
  await expect(summary).toContainText('Search: “Darcy”');
  await expect(summary).toContainText('Group: Military');
  await expect(page.getByRole('region', { name: 'Find a member' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Print roster' })).toBeHidden();
});
