import React from 'react';
import { FileText } from 'lucide-react';

export const LEGAL_URL =
  'https://parker-sutherland-afk.github.io/Terms-of-Service-and-public-privacy-policy-for-Kingdom-Hierarchy/';

export function LegalLink({ className = '', children = 'Terms of Service and Privacy Policy' }) {
  return (
    <a
      href={LEGAL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline decoration-stone-600 underline-offset-2 transition hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${className}`}
    >
      {children}
    </a>
  );
}

export default function LegalFooter() {
  return (
    <footer
      aria-label="Legal"
      className="relative border-t border-stone-800/80 bg-[#0b0d0b] px-4 py-2 text-center font-sans text-[11px] text-stone-500 print:hidden"
    >
      <LegalLink className="inline-flex min-h-10 items-center gap-1.5 no-underline hover:underline">
        <FileText aria-hidden="true" size={12} className="text-amber-500/70" />
        Terms of Service and Privacy Policy
      </LegalLink>
    </footer>
  );
}
