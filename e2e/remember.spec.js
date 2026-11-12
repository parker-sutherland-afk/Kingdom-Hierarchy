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

const rememberCookie = context => context.cookies().then(cookies => cookies.find(cookie => cookie.name === 'imperius_signin'));

test('sign-in is remembered across visits with a 30-day cookie until sign out', async ({ page, context }) => {
  await installGoogleSignInMock(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in / Register', exact: true }).click();
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await expect(page.getByText('Signed in as Test Imperium')).toBeVisible();

  const cookie = await rememberCookie(context);
  expect(cookie).toBeTruthy();
  expect(cookie.expires).toBeGreaterThan(Date.now() / 1000 + 29 * 24 * 60 * 60);
  expect(decodeURIComponent(cookie.value)).not.toContain('credential');
  expect(decodeURIComponent(cookie.value)).toContain('citizen@example.com');

  // A new tab starts without this tab's sessionStorage, so it can only sign in through the cookie.
  const revisit = await context.newPage();
  await revisit.goto('/');
  await expect(revisit.getByText('Signed in as Test Imperium')).toBeVisible();

  await revisit.getByRole('button', { name: 'Sign out' }).click();
  await expect(revisit.getByRole('button', { name: 'Sign in / Register', exact: true })).toBeVisible();
  expect(await rememberCookie(context)).toBeUndefined();

  const afterSignOut = await context.newPage();
  await afterSignOut.goto('/');
  await expect(afterSignOut.getByRole('button', { name: 'Sign in / Register', exact: true })).toBeVisible();
});
