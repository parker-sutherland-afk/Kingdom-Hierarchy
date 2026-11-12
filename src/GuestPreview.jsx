import React from 'react';
import { Lock, LogIn } from 'lucide-react';

const APP_BASE = import.meta.env.BASE_URL;

export function GuestBar({ onSignIn }) {
  return (
    <div className="sticky top-0 z-[70] border-b border-stone-800 bg-[#11120f]/95 px-3 py-2 backdrop-blur sm:px-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 font-sans text-[10px] sm:text-xs">
        <button
          type="button"
          onClick={onSignIn}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-400/[0.09] px-3 font-semibold text-amber-100 transition hover:border-amber-300/70 hover:bg-amber-400/[0.16] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
        >
          <LogIn aria-hidden="true" size={14} /> Sign in / Register
        </button>
        <p className="min-w-0 truncate text-right text-stone-500">Browsing as a guest</p>
      </div>
    </div>
  );
}

export function GuestLocked({ feature, onSignIn }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#0b0d0b] px-4 py-16 font-serif text-stone-200">
      <section aria-labelledby="guest-locked-title" className="w-full max-w-md rounded-2xl border border-amber-900/40 bg-gradient-to-br from-stone-900 via-[#171812] to-[#10110f] p-6 text-center shadow-2xl sm:p-8">
        <Lock aria-hidden="true" className="mx-auto text-amber-400" size={28} />
        <h1 id="guest-locked-title" className="mt-4 text-2xl font-black uppercase tracking-wide text-stone-100">{feature} locked</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">You need to be signed in to view this page.</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onSignIn}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-400/[0.09] px-5 font-sans text-xs font-bold text-amber-100 transition hover:border-amber-300/70 hover:bg-amber-400/[0.16] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
          >
            Sign in or register
          </button>
          <a
            href={APP_BASE}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-700 px-5 font-sans text-xs font-semibold text-stone-300 transition hover:border-stone-500 hover:text-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
          >
            Back to home
          </a>
        </div>
      </section>
    </main>
  );
}
