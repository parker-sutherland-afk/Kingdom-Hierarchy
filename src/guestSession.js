const GUEST_SESSION_KEY = 'imperius.guest.session';
const GUEST_ENDED_KEY = 'imperius.guest.ended';

export const GUEST_DURATION_MS = 10 * 60 * 1000;

function guestIdentity(expiresAt) {
  return { provider: 'guest', name: 'Guest', isGuest: true, expiresAt };
}

// True once this browser session has used (or run out of) its guest preview.
export function hasGuestPreviewEnded() {
  try {
    return sessionStorage.getItem(GUEST_ENDED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function startGuestSession() {
  const expiresAt = Date.now() + GUEST_DURATION_MS;
  try {
    sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify({ expiresAt }));
  } catch {
    // Storage can be unavailable (e.g. private mode); the preview still runs for this page load.
  }
  return guestIdentity(expiresAt);
}

export function readGuestSession() {
  try {
    const rawSession = sessionStorage.getItem(GUEST_SESSION_KEY);
    if (!rawSession) return null;

    const { expiresAt } = JSON.parse(rawSession);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      endGuestSession();
      return null;
    }

    return guestIdentity(expiresAt);
  } catch {
    return null;
  }
}

// Ends the guest preview and records that this browser session has used it.
export function endGuestSession() {
  try {
    sessionStorage.removeItem(GUEST_SESSION_KEY);
    sessionStorage.setItem(GUEST_ENDED_KEY, 'true');
  } catch {
    // Ignore storage errors.
  }
}

// Clears the guest session without marking the preview as used (after a real sign-in).
export function clearGuestSession() {
  try {
    sessionStorage.removeItem(GUEST_SESSION_KEY);
  } catch {
    // Ignore storage errors.
  }
}

export function formatRemaining(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
