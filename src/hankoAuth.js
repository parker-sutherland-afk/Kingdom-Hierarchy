import { register } from '@teamhanko/hanko-elements';

export const HANKO_API_URL = import.meta.env?.VITE_HANKO_API_URL?.trim().replace(/\/+$/, '') ?? '';
export const isHankoEnabled = Boolean(HANKO_API_URL);

let hankoPromise;

export function initializeHanko() {
  if (!isHankoEnabled) {
    return Promise.reject(new Error('Hanko email sign-in is not configured.'));
  }

  if (!hankoPromise) {
    hankoPromise = register(HANKO_API_URL)
      .then(({ hanko }) => hanko)
      .catch(error => {
        hankoPromise = null;
        throw error;
      });
  }

  return hankoPromise;
}

export async function getHankoIdentity(hanko) {
  const session = await hanko.validateSession();
  if (!session.is_valid) return null;

  const user = await hanko.getCurrentUser();
  const verifiedEmail = user.emails?.find(email => email.is_primary && email.is_verified)
    ?? user.emails?.find(email => email.is_verified);
  const email = verifiedEmail?.address;
  const expiresAt = Date.parse(session.expiration_time);

  if (session.expiration_time && (!Number.isFinite(expiresAt) || expiresAt <= Date.now())) {
    throw new Error('Hanko returned an invalid or expired session.');
  }

  return {
    email: email ?? 'Hanko account',
    name: user.name || email || 'Imperius member',
    provider: 'hanko',
    ...(Number.isFinite(expiresAt) ? { expiresAt } : {}),
  };
}
