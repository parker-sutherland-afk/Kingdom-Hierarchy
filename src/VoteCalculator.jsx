import React, { useMemo, useState } from 'react';
import { ChevronDown, RotateCcw, Scale } from 'lucide-react';
import MEMBERS from './data/members.json';
import ROLE_CONFIG from './roleConfig.js';
import { getVotingPowerBreakdown, sortByVotingPower } from './rosterUtils.js';
import { PASS_PERCENT, tallyVotes } from './voteMath.js';

const OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'none', label: 'Skip' },
];

const pointsFor = member => getVotingPowerBreakdown(member, ROLE_CONFIG).points;

function formatPercent(share) {
  return `${Math.round(share * 1000) / 10}%`;
}

export default function VoteCalculator() {
  const [votes, setVotes] = useState({});
  const [countAbsentAsNo, setCountAbsentAsNo] = useState(false);
  const members = useMemo(() => sortByVotingPower(MEMBERS, ROLE_CONFIG), []);
  const result = tallyVotes(members, votes, pointsFor, { countAbsentAsNo });
  const hasVotes = result.cast > 0;

  const verdict = !hasVotes ? 'No votes yet' : result.passes ? 'Motion passes' : 'Motion does not pass';
  const tone = !hasVotes
    ? 'border-stone-700 bg-black/20 text-stone-300'
    : result.passes
      ? 'border-emerald-400/30 bg-emerald-400/[0.07] text-emerald-100'
      : 'border-rose-400/30 bg-rose-400/[0.07] text-rose-100';

  function setVote(memberId, value) {
    setVotes(current => ({ ...current, [memberId]: value }));
  }

  return (
    <section aria-label="Vote calculator" className="bg-[#0b0d0b] px-3 pb-12 font-serif text-stone-200 sm:px-4 md:px-8 print:hidden">
      <div className="mx-auto max-w-6xl">
        <details className="group/calc overflow-hidden rounded-xl border border-stone-800 bg-stone-900/45">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 py-3 font-sans text-xs font-semibold text-stone-300 transition hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 [&::-webkit-details-marker]:hidden">
            <Scale aria-hidden="true" size={15} className="text-sky-300" />
            Vote calculator: does a motion pass?
            <ChevronDown aria-hidden="true" size={14} className="ml-auto text-stone-500 transition-transform group-open/calc:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className="border-t border-stone-800 p-3 sm:p-4">
            <p className="font-sans text-xs leading-relaxed text-stone-400">
              Choose how each member voted. Points come from each member’s primary role on the roster, and a proposal passes when at least {PASS_PERCENT}% of votes favor it. The King’s veto is not included.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 font-sans text-xs">
              <button
                type="button"
                onClick={() => setVotes(Object.fromEntries(members.map(member => [member.id, 'yes'])))}
                className="inline-flex min-h-10 items-center rounded-lg border border-stone-700/80 bg-stone-900/60 px-3 font-semibold text-stone-300 transition hover:border-amber-500/40 hover:text-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
              >
                Everyone votes Yes
              </button>
              <button
                type="button"
                onClick={() => setVotes({})}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-stone-700/80 bg-stone-900/60 px-3 font-semibold text-stone-300 transition hover:border-amber-500/40 hover:text-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
              >
                <RotateCcw aria-hidden="true" size={13} /> Reset votes
              </button>
              <label className="inline-flex min-h-10 items-center gap-2 text-stone-400">
                <input
                  type="checkbox"
                  checked={countAbsentAsNo}
                  onChange={event => setCountAbsentAsNo(event.target.checked)}
                  className="h-4 w-4 accent-amber-400"
                />
                Count members who skip as No
              </label>
            </div>

            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {members.map(member => {
                const config = ROLE_CONFIG[member.role];
                const points = pointsFor(member);
                const vote = votes[member.id] ?? 'none';
                return (
                  <li key={member.id} className="flex items-center justify-between gap-3 rounded-lg border border-stone-800/80 bg-black/20 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-stone-100">{member.name}</p>
                      <p className={`truncate font-sans text-[11px] ${config?.color ?? 'text-stone-400'}`}>{member.role} · {points} pt{points === 1 ? '' : 's'}</p>
                    </div>
                    <div role="group" aria-label={`${member.name}’s vote`} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-stone-700/80 bg-black/20 p-1 font-sans text-[10px]">
                      {OPTIONS.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={vote === option.value}
                          onClick={() => setVote(member.id, option.value)}
                          className={`inline-flex min-h-9 items-center rounded-md px-2.5 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${
                            vote === option.value
                              ? option.value === 'yes'
                                ? 'bg-emerald-400/20 text-emerald-100'
                                : option.value === 'no'
                                  ? 'bg-rose-400/20 text-rose-100'
                                  : 'bg-stone-600/30 text-stone-200'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div role="status" aria-live="polite" className={`mt-4 rounded-xl border p-4 ${tone}`}>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.14em]">{verdict}</p>
              {hasVotes && (
                <p className="mt-1 text-sm">
                  {formatPercent(result.share)} {countAbsentAsNo ? 'of all voting power' : 'of votes cast'} voted Yes. A proposal needs at least {PASS_PERCENT}%.
                </p>
              )}
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center font-sans text-xs">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.14em] opacity-70">Yes</dt>
                  <dd className="mt-0.5 font-bold tabular-nums">{result.yes} pts</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.14em] opacity-70">No</dt>
                  <dd className="mt-0.5 font-bold tabular-nums">{result.no} pts</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.14em] opacity-70">Skipped</dt>
                  <dd className="mt-0.5 font-bold tabular-nums">{result.notVoting} pts</dd>
                </div>
              </dl>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
