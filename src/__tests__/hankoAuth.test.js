import assert from 'node:assert/strict';
import test from 'node:test';
import { getHankoIdentity, HANKO_API_URL, isHankoEnabled } from '../hankoAuth.js';

test('Hanko sign-in is disabled when no public API URL is configured', () => {
  assert.equal(HANKO_API_URL, '');
  assert.equal(isHankoEnabled, false);
});

test('Hanko identity requires a valid session and uses a verified email', async () => {
  const hanko = {
    validateSession: async () => ({
      is_valid: true,
      expiration_time: new Date(Date.now() + 60_000).toISOString(),
    }),
    getCurrentUser: async () => ({
      name: 'Test Imperium',
      emails: [
        { address: 'unverified@example.com', is_verified: false },
        { address: 'verified@example.com', is_verified: true, is_primary: true },
      ],
    }),
  };

  const identity = await getHankoIdentity(hanko);
  const { expiresAt, ...profile } = identity;
  assert.deepEqual(profile, {
    email: 'verified@example.com',
    name: 'Test Imperium',
    provider: 'hanko',
  });
  assert.ok(expiresAt > Date.now());
});

test('Hanko identity returns null for an invalid session without fetching the user', async () => {
  const hanko = {
    validateSession: async () => ({ is_valid: false }),
    getCurrentUser: async () => {
      throw new Error('Should not fetch users for invalid sessions.');
    },
  };

  assert.equal(await getHankoIdentity(hanko), null);
});

test('Hanko identity accepts valid sessions without optional expiry metadata', async () => {
  const hanko = {
    validateSession: async () => ({ is_valid: true }),
    getCurrentUser: async () => ({ emails: [] }),
  };

  assert.deepEqual(await getHankoIdentity(hanko), {
    email: 'Hanko account',
    name: 'Imperius member',
    provider: 'hanko',
  });
});

test('Hanko identity rejects a valid response with an invalid or expired expiry time', async () => {
  const hanko = {
    validateSession: async () => ({ is_valid: true, expiration_time: new Date(Date.now() - 60_000).toISOString() }),
    getCurrentUser: async () => ({ emails: [] }),
  };

  await assert.rejects(getHankoIdentity(hanko), /invalid or expired session/);
});
