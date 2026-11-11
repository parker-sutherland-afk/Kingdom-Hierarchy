import React from 'react';
import { Lock, Timer } from 'lucide-react';
import { formatRemaining } from './guestSession.js';

const APP_BASE = import.meta.env.BASE_URL;

export function GuestBanner({ expiresAt, onSignIn }) {
  const [remaining, setRemaining] = React.useState(() => expiresAt - Date.now());

  React.useEffect(() => {
    const tick = () => setRemaining(expiresAt - Date.now());
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [expiresAt]);

  const lowTime = remaining <= 60_000;

  return (
    <div className="sticky top-0 z-[70] border-b border-amber-900/40 bg-[#1a150b]/95 px-3 py-2 backdrop-blur sm:px-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 font-sans text-[10px] sm:text-xs">
        <p className="flex min-w-0 items-center gap-2 text-amber-100">
          <Timer aria-hidden="true" size={14} className={`shrink-0 ${lowTime ? 'text-red-300' : 'text-amber-400'}`} />
          <span className="truncate">
            Guest preview ·{' '}
            <span role="timer" className={`font-semibold tabular-nums ${lowTime ? 'text-red-300' : 'text-amber-200'}`}>
              {formatRemaining(remaining)}
            </span>{' '}
            left
          </span>
        </p>
        <button
          type="button"
          onClick={onSignIn}
          className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-amber-500/40 bg-amber-400/[0.09] px-3 font-semibold text-amber-100 transition hover:border-amber-300/70 hover:bg-amber-400/[0.16] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
        >
          Sign in
        </button>
      </div>
      <p className="mx-auto mt-1 max-w-6xl font-sans text-[9px] text-amber-200/60">Some features are locked until you sign in.</p>
    </div>
  );
}

export function GuestLocked({ feature, onSignIn }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#0b0d0b] px-4 py-16 font-serif text-stone-200">
      <section aria-labelledby="guest-locked-title" className="w-full max-w-md rounded-2xl border border-amber-900/40 bg-gradient-to-br from-stone-900 via-[#171812] to-[#10110f] p-6 text-center shadow-2xl sm:p-8">
        <Lock aria-hidden="true" className="mx-auto text-amber-400" size={28} />
        <h1 id="guest-locked-title" className="mt-4 text-2xl font-black uppercase tracking-wide text-stone-100">{feature} locked</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">This page isn’t available in the guest preview. Sign in to unlock it.</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onSignIn}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-400/[0.09] px-5 font-sans text-xs font-bold text-amber-100 transition hover:border-amber-300/70 hover:bg-amber-400/[0.16] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
          >
            Sign in
          </button>
          <a
            href={APP_BASE}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-700 px-5 font-sans text-xs font-semibold text-stone-300 transition hover:border-stone-500 hover:text-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
          >
            Back to roster
          </a>
        </div>
      </section>
    </main>
  );
}
