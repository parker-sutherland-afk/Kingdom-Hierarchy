import React, { useState } from 'react';
import { Crown, Shield, Pickaxe, Wheat, Swords, FlaskConical, User, Star, Info, Hammer, Search, Users, Scale, X, Copy, Check } from 'lucide-react';
import MEMBERS from './data/members.json';
import { describeVotingPower, filterMembers, getVotingPowerBreakdown, matchesMemberFilter, sortByVotingPower } from './rosterUtils.js';

const ROLE_CONFIG = {
  "King": { max: 1, trim: "Diamond Flow", rank: 1, points: 5, color: "text-blue-300", border: "border-slate-500", shadowGlow: "hover:shadow-[0_0_20px_rgba(147,197,253,0.3)] hover:border-blue-400", icon: Crown, desc: "Absolute ruler of the realm." },
  "Advisor": { max: 2, trim: "Netherite Dune", rank: 2, points: 3, color: "text-stone-300", border: "border-stone-500", shadowGlow: "hover:shadow-[0_0_20px_rgba(168,162,158,0.3)] hover:border-stone-400", icon: Shield, desc: "Provides counsel to the King." },
  "Head Of Resources and Projects": { max: 1, trim: "Amethyst Flow", rank: 3, points: 2, color: "text-purple-300", border: "border-purple-800", shadowGlow: "hover:shadow-[0_0_20px_rgba(216,180,254,0.3)] hover:border-purple-400", icon: Pickaxe, desc: "Resource Management, Production Amount And Money." },
  "Head Of General Purpose Resources": { max: 1, trim: "Amethyst Flow", rank: 3, points: 2, color: "text-purple-300", border: "border-purple-800", shadowGlow: "hover:shadow-[0_0_20px_rgba(216,180,254,0.3)] hover:border-purple-400", icon: Hammer, desc: "Handles Armor and Gear PRODUCTION." },
  "Head Of Agriculture and Justice": { max: 1, trim: "Gold Flow", rank: 3, points: 2, color: "text-amber-500", border: "border-amber-700", shadowGlow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:border-amber-400", icon: Wheat, desc: "Oversees crops, food supply, and kingdom laws." },
  "Head Of Combat And War": { max: 1, trim: "Redstone Flow", rank: 3, points: 2, color: "text-red-400", border: "border-red-800", shadowGlow: "hover:shadow-[0_0_20px_rgba(248,113,113,0.3)] hover:border-red-400", icon: Swords, desc: "Handles Enchants and protection of gear." },
  "Head Of Medicinal Substances": { max: 1, trim: "Emerald Flow", rank: 3, points: 2, color: "text-emerald-500", border: "border-emerald-800", shadowGlow: "hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:border-emerald-400", icon: FlaskConical, desc: "Brewing and distributing potions." },
  "Prince": { max: 1, trim: "Iron Flow Trim", rank: 4, points: 2, color: "text-slate-300", border: "border-slate-500", shadowGlow: "hover:shadow-[0_0_20px_rgba(203,213,225,0.3)] hover:border-slate-300", icon: Star, desc: "Heir to the kingdom." },
  "Citizen": { max: Infinity, trim: "None", rank: 5, points: 1, color: "text-stone-400", border: "border-stone-700", shadowGlow: "hover:shadow-[0_0_15px_rgba(120,113,108,0.3)] hover:border-stone-500", icon: User, desc: "Standard member of the kingdom." }
};

const RANK_TITLES = { 1: "KING", 2: "HIGH COUNCIL", 3: "COUNCIL", 4: "PRINCE", 5: "CITIZENS" };

function MemberAvatar({ member }) {
  const [imageFailed, setImageFailed] = useState(false);
  const nameParts = member.name.trim().split(/\s+/);
  const initials = (nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
    : nameParts[0].slice(0, 2)
  ).toUpperCase();

  return (
    <div
      role="img"
      aria-label={`${member.name}'s Minecraft avatar`}
      className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-700 bg-stone-950 font-sans text-sm font-bold text-amber-200 shadow-md"
    >
      {imageFailed ? (
        <span aria-hidden="true">{initials}</span>
      ) : (
        <img
          src={`https://minotar.net/helm/${encodeURIComponent(member.mcName)}/64.png`}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  );
}

export default function KingdomHierarchy() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortMode, setSortMode] = useState('rank');
  const [copiedUsername, setCopiedUsername] = useState('');
  const [copyFailed, setCopyFailed] = useState(false);

  async function copyUsername(username) {
    try {
      await navigator.clipboard.writeText(username);
      setCopiedUsername(username);
      setCopyFailed(false);
    } catch {
      setCopiedUsername('');
      setCopyFailed(true);
    }
  }

  const filteredMembers = filterMembers(MEMBERS, searchQuery, activeFilter);
  const normalizedQuery = searchQuery.trim();
  const totalSouls = MEMBERS.length;
  const highCouncilCount = MEMBERS.filter(member => matchesMemberFilter(member, 'High Council')).length;
  const councilCount = MEMBERS.filter(member => matchesMemberFilter(member, 'Council')).length;
  const totalVotingPower = MEMBERS.reduce(
    (total, member) => total + getVotingPowerBreakdown(member, ROLE_CONFIG).points,
    0
  );
  const displayMembers = sortMode === 'power'
    ? sortByVotingPower(filteredMembers, ROLE_CONFIG)
    : filteredMembers;
  const rankSections = sortMode === 'power'
    ? [{ key: 'power', title: 'VOTING POWER', members: displayMembers }]
    : [1, 2, 3, 4, 5].map(rank => ({
      key: rank,
      title: RANK_TITLES[rank],
      members: filteredMembers.filter(member => ROLE_CONFIG[member.role]?.rank === rank),
    })).filter(section => section.members.length > 0);

  const filterOptions = [
    { label: 'All members', value: 'All', count: totalSouls },
    { label: 'High council', value: 'High Council', count: highCouncilCount },
    { label: 'Council', value: 'Council', count: councilCount },
    { label: 'Military', value: 'Military', count: MEMBERS.filter(member => matchesMemberFilter(member, 'Military')).length },
    { label: 'Citizens', value: 'Citizens', count: MEMBERS.filter(member => matchesMemberFilter(member, 'Citizens')).length },
  ];

  return (
    <div className="min-h-screen bg-[#0b0d0b] text-stone-200 font-serif selection:bg-amber-900/70 selection:text-amber-50 pb-16">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(120,83,34,0.13),_transparent_55%)]" />
      <div className="relative max-w-6xl mx-auto px-4 py-8 md:px-8 md:py-12">
        <header className="mb-10">
          <div className="relative overflow-hidden rounded-2xl border border-stone-800 bg-gradient-to-br from-stone-900 via-[#171812] to-[#11120f] px-6 py-8 shadow-2xl md:px-10 md:py-10">
            <div className="absolute -right-10 -top-14 text-amber-100/[0.035]"><Crown size={260} strokeWidth={0.7} /></div>
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-700/30 bg-amber-950/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Realm records
              </div>
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-[0.08em] text-stone-100 md:text-6xl">Kingdom<br className="sm:hidden" /> Hierarchy</h1>
                  <p className="mt-3 text-base italic text-stone-400 md:text-lg">The people, positions, and power that shape our realm.</p>
                </div>
                <div className="flex max-w-sm items-start gap-3 rounded-xl border border-stone-700/70 bg-black/20 p-4 text-sm leading-relaxed text-stone-400">
                  <Info className="mt-0.5 shrink-0 text-amber-500/80" size={18} />
                  <p>Citizens are <strong className="font-semibold text-stone-200">not permitted to wear armor trims.</strong></p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: 'Realm members', value: totalSouls, icon: Users, color: 'text-stone-300' },
                  { label: 'Council members', value: councilCount, icon: Pickaxe, color: 'text-purple-300' },
                  { label: 'Voting power', value: `${totalVotingPower} pts`, icon: Scale, color: 'text-sky-300' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center gap-4 rounded-xl border border-stone-800 bg-black/25 p-4">
                    <div className={`rounded-lg bg-stone-800/80 p-3 ${color}`}><Icon size={20} /></div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">{label}</div>
                      <div className="mt-0.5 text-2xl font-black text-stone-100">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-start gap-2 rounded-lg border border-stone-800/80 bg-black/20 px-4 py-3 font-sans text-xs leading-relaxed text-stone-400">
                <Scale className="mt-0.5 shrink-0 text-sky-300/80" size={15} />
                <span>Role points add across primary and secondary roles. A custom allocation replaces that total. Use the sort menu to compare members by voting power.</span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-stone-800 bg-stone-900/60 p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div className="relative w-full md:max-w-md">
              <label htmlFor="member-search" className="sr-only">Search members</label>
              <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
              <input
                id="member-search"
                type="search"
                placeholder="Search name, Minecraft username, role..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full appearance-none rounded-xl border border-stone-700 bg-stone-950/80 py-3 pl-10 pr-10 text-sm text-stone-100 placeholder:text-stone-600 focus:border-amber-600/70 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
              />
              {searchQuery && (
                <button type="button" aria-label="Clear search" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-stone-500 hover:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Filter members">
              {filterOptions.map(({ label, value, count }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={activeFilter === value}
                  onClick={() => setActiveFilter(value)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    activeFilter === value
                      ? 'border-amber-600/60 bg-amber-950/50 text-amber-200'
                      : 'border-stone-700 bg-stone-950/50 text-stone-400 hover:border-stone-500 hover:text-stone-200'
                  }`}
                >
                  {label}<span className="rounded-md bg-black/25 px-1.5 py-0.5 text-[10px] opacity-75">{count}</span>
                </button>
              ))}
              <label className="flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-950/50 px-3 py-2 text-xs font-medium text-stone-400">
                Sort
                <select
                  aria-label="Sort members"
                  value={sortMode}
                  onChange={event => setSortMode(event.target.value)}
                  className="bg-transparent text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="rank" className="bg-stone-900">By rank</option>
                  <option value="power" className="bg-stone-900">Voting power</option>
                </select>
              </label>
            </div>
          </div>
          <p className="mt-3 px-1 text-xs text-stone-500" aria-live="polite">
            Showing <span className="font-semibold text-stone-300">{filteredMembers.length}</span> of {totalSouls} members
            {normalizedQuery && <> matching <span className="text-stone-300">“{searchQuery.trim()}”</span></>}
          </p>
          {(copiedUsername || copyFailed) && (
            <p className={`mt-1 px-1 text-xs ${copyFailed ? 'text-rose-300' : 'text-emerald-300'}`} role="status">
              {copyFailed ? 'Could not copy username. Check clipboard permissions and try again.' : `Copied ${copiedUsername} to clipboard.`}
            </p>
          )}
        </header>

        <main className="flex flex-col gap-10">
          {filteredMembers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-700 bg-stone-900/30 px-6 py-16 text-center font-sans">
              <Search className="mx-auto mb-4 text-stone-600" size={28} />
              <h2 className="text-lg font-semibold text-stone-200">No members found</h2>
              <p className="mt-2 text-sm text-stone-500">Try another search or clear the current filters.</p>
              <button type="button" onClick={() => { setSearchQuery(''); setActiveFilter('All'); }} className="mt-5 rounded-lg border border-stone-700 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-amber-600/60 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                Reset search and filters
              </button>
            </div>
          ) : (
            rankSections.map(({ key, title, members: membersInRank }) => (
                <section key={key} aria-labelledby={`rank-${key}`}>
                  <div className="mb-5 flex items-center gap-4">
                    <h2 id={`rank-${key}`} className="flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-stone-300">
                      {title}<span className="text-stone-600">/</span><span className="font-medium tracking-normal text-stone-500">{membersInRank.length}</span>
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-stone-700 to-transparent" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {membersInRank.map((member) => {
                      const config = ROLE_CONFIG[member.role];
                      const Icon = config?.icon || User;
                      const secCfg = member.secondaryRole ? ROLE_CONFIG[member.secondaryRole] : null;
                      const SecIcon = secCfg ? secCfg.icon : null;
                      const votingPower = getVotingPowerBreakdown(member, ROLE_CONFIG);
                      const displayDesc = member.customDesc || config?.desc;
                      
                      return (
                        <article key={member.id} className={`group relative overflow-hidden rounded-xl border border-stone-800 bg-gradient-to-br from-stone-900 to-[#121310] transition duration-300 hover:-translate-y-1 hover:border-stone-600 hover:shadow-xl ${config?.shadowGlow}`}>
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-amber-700/40 via-stone-700/40 to-transparent" />
                          <div className="flex h-full flex-col p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <MemberAvatar member={member} />
                                <div className="min-w-0">
                                  <h3 className="truncate text-lg font-black tracking-wide text-stone-100">{member.name}</h3>
                                  <div className="mt-0.5 flex min-w-0 items-center gap-1 font-sans text-xs text-stone-500">
                                    <span className="truncate">@{member.mcName}</span>
                                    <button
                                      type="button"
                                      aria-label={`Copy ${member.mcName} Minecraft username`}
                                      title={`Copy ${member.mcName}`}
                                      onClick={() => copyUsername(member.mcName)}
                                      className="shrink-0 rounded p-1 text-stone-500 transition hover:bg-stone-800 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                      {copiedUsername === member.mcName && !copyFailed ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="shrink-0 rounded-lg border border-stone-800 bg-stone-950/80 px-2.5 py-1.5 text-right text-xs font-bold text-stone-300">
                                <div>{votingPower.points} pts</div>
                                {votingPower.isCustom && <div className="mt-0.5 text-[9px] font-medium text-amber-300">Custom allocation</div>}
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <div className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-stone-800 bg-black/20 px-2 py-1 font-sans text-xs text-stone-300">
                                <Icon className={config?.color} size={13} /><span className="truncate">{member.role}</span>
                              </div>
                              {member.secondaryRole && secCfg && SecIcon && (
                                <div className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-stone-800 bg-black/20 px-2 py-1 font-sans text-xs text-stone-400">
                                  <SecIcon className={secCfg.color} size={13} /><span className="truncate">{member.secondaryRole}</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-wide">
                              {config?.trim !== 'None' && <span className={`rounded-full border border-stone-800 bg-black/20 px-2 py-1 ${config?.color}`}>✦ {config?.trim}</span>}
                              {secCfg?.trim && secCfg.trim !== 'None' && <span className={`rounded-full border border-stone-800 bg-black/20 px-2 py-1 ${secCfg.color}`}>✦ {secCfg.trim}</span>}
                            </div>
                            <details className="mt-3 border-t border-stone-800/80 pt-3 font-sans text-xs">
                              <summary className="cursor-pointer text-stone-400 transition hover:text-amber-200">Voting points breakdown</summary>
                              <p className="mt-2 leading-relaxed text-stone-500">{describeVotingPower(member, ROLE_CONFIG)}</p>
                            </details>
                            {displayDesc && <p className="mt-4 flex-1 border-t border-stone-800/80 pt-4 text-sm leading-relaxed text-stone-400">{displayDesc}</p>}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))
          )}
        </main>
      </div>
    </div>
  );
}