import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const googleTestClientId = 'playwright-test.apps.googleusercontent.com';
const googleTestCredential = `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({
  aud: googleTestClientId,
  iss: 'https://accounts.google.com',
  email: 'citizen@example.com',
  email_verified: true,
  name: 'Test Imperium',
  sub: 'test-google-user',
  exp: Math.floor(Date.now() / 1000) + 3600,
})).toString('base64url')}.test-signature`;

async function installGoogleSignInMock(page) {
  await page.route('https://accounts.google.com/gsi/client', route => route.fulfill({
    contentType: 'application/javascript',
    body: `
      window.google = { accounts: { id: {
        initialize(options) { window.__imperiusGoogleCallback = options.callback; },
        renderButton(container) {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = 'Continue with Google';
          button.addEventListener('click', () => window.__imperiusGoogleCallback({
            credential: ${JSON.stringify(googleTestCredential)}
          }));
          container.append(button);
        }
      } } };
    `,
  }));
}

async function signInWithGoogle(page) {
  await installGoogleSignInMock(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in / Register', exact: true }).click();
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await expect(page.getByText('Signed in as Test Imperium')).toBeVisible();
}

test('vote calculator reports whether a motion passes', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Vote calculator: does a motion pass?').click();
  await expect(page.getByRole('status').filter({ hasText: 'No votes yet' })).toBeVisible();

  await page.getByRole('button', { name: 'Everyone votes Yes' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Motion passes' })).toBeVisible();

  await page.getByRole('button', { name: 'Reset votes' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'No votes yet' })).toBeVisible();

  await page.getByRole('group', { name: 'Will’s vote' }).getByRole('button', { name: 'No' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Motion does not pass' })).toBeVisible();
});

test('tapping a locked profile and then signing in opens that profile', async ({ page }) => {
  await installGoogleSignInMock(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'View full profile' }).first().click();
  await page.getByRole('button', { name: 'Sign in or register' }).click();
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await expect(page.getByText('Signed in as Test Imperium')).toBeVisible();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveURL(/member=/);
});

test('tapping the locked Community button and then signing in opens the Community pages', async ({ page }) => {
  await installGoogleSignInMock(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Community (sign in required)' }).click();
  await page.getByRole('button', { name: 'Sign in or register' }).click();
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await expect(page.getByText('Signed in as Test Imperium')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Realm Hall', exact: true })).toBeVisible();
});

test('constitution search finds rules across articles and opens the matching article', async ({ page }) => {
  await signInWithGoogle(page);
  await page.goto('/?page=community&section=constitution');

  const search = page.getByRole('region', { name: 'Search the Constitution' });
  const box = search.getByRole('searchbox', { name: 'Search laws, rules, and currency' });
  await box.fill('veto');
  await expect(search.getByRole('link', { name: /The Crown & Royal Powers/ })).toBeVisible();
  await expect(search.getByRole('link', { name: /Parliament/ })).toBeVisible();

  await search.getByRole('link', { name: /The Crown & Royal Powers/ }).click();
  await expect(page.locator('#law-monarchy')).toHaveAttribute('open', '');

  await box.fill('zzzzzz');
  await expect(search.getByRole('status')).toContainText('No matches');
});

test('signed-in members can download the roster as a CSV file', async ({ page }) => {
  await signInWithGoogle(page);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download roster' }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^kingdom-roster-\d{4}-\d{2}-\d{2}\.csv$/);

  const csv = await readFile(await download.path(), 'utf8');
  expect(csv).toContain('Name,Role,Secondary role,Minecraft username,Voting points');
  expect(csv).toContain('Will,King');
});
