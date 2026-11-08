import React from 'react';
import { Crown, ShieldAlert } from 'lucide-react';

const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';
const GOOGLE_SESSION_KEY = 'imperius.google.identity';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? '';
export const isGoogleSignInEnabled = Boolean(GOOGLE_CLIENT_ID);

let googleScriptPromise;

function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`);
    const script = existingScript || document.createElement('script');

    script.addEventListener('load', () => {
      if (window.google?.accounts?.id) resolve(window.google);
      else reject(new Error('Google Identity Services loaded without its sign-in API.'));
    }, { once: true });
    script.addEventListener('error', () => {
      googleScriptPromise = null;
      reject(new Error('Google sign-in could not load. Check your connection and try again.'));
    }, { once: true });

    if (!existingScript) {
      script.src = GOOGLE_IDENTITY_SCRIPT;
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = 'true';
      document.head.appendChild(script);
    }
  });

  return googleScriptPromise;
}

function decodeGoogleCredential(credential) {
  const payload = credential.split('.')[1];
  if (!payload) throw new Error('Google returned an invalid sign-in credential.');

  let claims;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    claims = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error('Google returned a sign-in credential that could not be read.');
  }

  if (
    claims.aud !== GOOGLE_CLIENT_ID ||
    !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss) ||
    !claims.email ||
    claims.email_verified !== true ||
    typeof claims.exp !== 'number' ||
    claims.exp * 1000 <= Date.now()
  ) {
    throw new Error('Sign in with a verified Google account and try again.');
  }

  return {
    email: claims.email,
    name: claims.name || claims.email,
    expiresAt: claims.exp * 1000,
  };
}

export function readGoogleBrowserSession() {
  try {
    const rawSession = sessionStorage.getItem(GOOGLE_SESSION_KEY);
    if (!rawSession) return null;

    const session = JSON.parse(rawSession);
    if (
      typeof session.email !== 'string' ||
      typeof session.name !== 'string' ||
      !Number.isFinite(session.expiresAt) ||
      session.expiresAt <= Date.now()
    ) {
      sessionStorage.removeItem(GOOGLE_SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    sessionStorage.removeItem(GOOGLE_SESSION_KEY);
    return null;
  }
}

export default function SignInPortal({ onSuccess }) {
  const buttonContainerRef = React.useRef(null);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(isGoogleSignInEnabled);

  React.useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;

    let active = true;
    loadGoogleIdentity()
      .then(google => {
        if (!active || !buttonContainerRef.current) return;

        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: response => {
            if (!response.credential) {
              setError('Google did not return a sign-in credential. Please try again.');
              return;
            }

            try {
              const identity = decodeGoogleCredential(response.credential);
              sessionStorage.setItem(GOOGLE_SESSION_KEY, JSON.stringify(identity));
              onSuccess(identity);
            } catch (credentialError) {
              setError(credentialError instanceof Error ? credentialError.message : 'Google sign-in failed.');
            }
          },
          auto_select: false,
          context: 'signin',
        });
        google.accounts.id.renderButton(buttonContainerRef.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: Math.floor(Math.min(320, buttonContainerRef.current.clientWidth)),
        });
        setIsLoading(false);
      })
      .catch(loadError => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Google sign-in could not load.');
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
      buttonContainerRef.current?.replaceChildren();
    };
  }, [onSuccess]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d0b] px-4 py-10 font-serif text-stone-200 selection:bg-amber-900/70 selection:text-amber-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(120,83,34,0.2),_transparent_60%)]" />
      <section aria-labelledby="signin-title" className="relative w-full max-w-lg rounded-2xl border border-amber-900/40 bg-gradient-to-br from-stone-900 via-[#171812] to-[#10110f] p-6 shadow-2xl sm:p-9">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-700/30 bg-amber-950/30 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
          <Crown aria-hidden="true" size={13} /> Imperius Realm Access
        </div>
        <h1 id="signin-title" className="text-3xl font-black uppercase tracking-wide text-stone-100 sm:text-4xl">Welcome to the Realm</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">Sign in with Google to continue to the Kingdom Hierarchy.</p>

        {GOOGLE_CLIENT_ID ? (
          <>
            {isLoading && <p role="status" className="mt-6 font-sans text-xs text-stone-400">Loading Google sign-in…</p>}
            <div className="mt-3 min-h-11" ref={buttonContainerRef} aria-label="Google sign-in" />
          </>
        ) : (
          <div role="status" className="mt-7 rounded-xl border border-amber-700/30 bg-amber-950/20 p-4 text-sm leading-relaxed text-amber-100">
            Google sign-in is not configured yet. The site owner must set the <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">VITE_GOOGLE_CLIENT_ID</code> GitHub Actions variable.
          </div>
        )}

        {error && <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-950/30 p-3 font-sans text-xs leading-relaxed text-red-200">{error}</p>}

        <aside className="mt-7 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert aria-hidden="true" className="mt-0.5 shrink-0 text-amber-400" size={17} />
            <p className="text-xs leading-relaxed text-stone-300">
              <strong className="text-amber-100">Public-site notice:</strong> Google sign-in remembers the signed-in identity in this browser session; it does not secure the public site. Anyone can still access its pages and files directly. Do not put private information here.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
