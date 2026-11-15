import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import CONSTITUTION from './data/constitution.json';
import { splitSearchHighlights } from './rosterUtils.js';
import { searchConstitution } from './constitutionSearch.js';

const cardClass = 'rounded-xl border border-stone-800 bg-gradient-to-br from-stone-900/80 to-black/20 p-4';

function Highlighted({ text, query }) {
  return splitSearchHighlights(text, query).map((part, index) => (
    part.matched
      ? <mark key={index} className="rounded-sm bg-amber-300/20 px-0.5 text-amber-100">{part.text}</mark>
      : <React.Fragment key={index}>{part.text}</React.Fragment>
  ));
}

function openLaw(id) {
  const law = document.getElementById(`law-${id}`);
  if (law instanceof HTMLDetailsElement) law.open = true;
}

export default function ConstitutionSearch() {
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const result = searchConstitution(CONSTITUTION, trimmed);
  const searching = trimmed.length >= 2;

  const status = !searching
    ? ''
    : result.count === 0
      ? `No matches for “${trimmed}”.`
      : `${result.count} match${result.count === 1 ? '' : 'es'}.`;

  return (
    <section aria-labelledby="constitution-search-title" className={cardClass}>
      <h3 id="constitution-search-title" className="text-base font-bold text-amber-100">Search the Constitution</h3>
      <label htmlFor="constitution-search" className="sr-only">Search laws, rules, and currency</label>
      <div className="relative mt-3">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/70" size={16} />
        <input
          id="constitution-search"
          type="search"
          placeholder="Try veto, tax, court, or Netherite..."
          value={query}
          onChange={event => setQuery(event.target.value)}
          className="h-11 w-full rounded-xl border border-stone-700/90 bg-black/30 py-2.5 pl-10 pr-10 font-sans text-sm text-stone-100 placeholder:text-stone-600 transition hover:border-stone-600 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear constitution search"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-800 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <p role="status" aria-live="polite" className="mt-2 min-h-4 font-sans text-xs text-stone-400">{status}</p>

      {searching && result.count > 0 && (
        <ul className="mt-2 space-y-3">
          {result.laws.map(law => (
            <li key={law.id} className="rounded-lg border border-stone-800 bg-black/20 p-3">
              <a
                href={`#law-${law.id}`}
                onClick={() => openLaw(law.id)}
                className="font-sans text-xs font-bold text-amber-200 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
              >
                Article {String(law.article).padStart(2, '0')}: <Highlighted text={law.title} query={trimmed} />
              </a>
              {law.rules.length > 0 && (
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-300 marker:text-amber-500">
                  {law.rules.map((rule, index) => (
                    <li key={`${law.id}-${index}`}><Highlighted text={rule} query={trimmed} /></li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          {result.currency.length > 0 && (
            <li className="rounded-lg border border-stone-800 bg-black/20 p-3">
              <a href="#currency-title" className="font-sans text-xs font-bold text-amber-200 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70">
                Currency values
              </a>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-300 marker:text-amber-500">
                {result.currency.map(({ item, value }) => (
                  <li key={item}><Highlighted text={item} query={trimmed} />: <Highlighted text={value} query={trimmed} /></li>
                ))}
              </ul>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
