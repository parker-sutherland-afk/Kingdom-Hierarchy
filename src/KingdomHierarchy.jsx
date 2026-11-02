import React, { useEffect, useRef, useState } from 'react';
import { Crown, Shield, Pickaxe, Wheat, Swords, FlaskConical, User, Star, Info, Hammer, Search, Users, Scale, X, Copy, Check, DoorOpen, Pencil } from 'lucide-react';
import MEMBERS from './data/members.json';
import RosterEditor from './RosterEditor.jsx';
import { describeVotingPower, filterMembers, getRankVotingTotals, getRoleCoverage, getVotingPowerBreakdown, matchesMemberFilter, sortByVotingPower, validateRoster } from './rosterUtils.js';

const ROLE_CONFIG = {
  King: {
    max: 1, trim: 'Diamond Flow', rank: 1, points: 5, color: 'text-blue-300', nameHover: 'group-hover:text-blue-200',
    badge: 'border-blue-400/30 bg-blue-400/10 text-blue-200 group-hover:border-blue-300/60 group-hover:bg-blue-400/20',
    accent: 'hover:border-blue-300/70 hover:ring-blue-300/20 hover:shadow-[0_0_34px_rgba(96,165,250,0.24)] focus-within:border-blue-300/70 focus-within:ring-blue-300/25',
    line: 'from-cyan-200 via-blue-400/50 to-transparent',
    wash: 'from-blue-400/[0.13] via-blue-400/[0.03] to-transparent',
    icon: Crown, desc: 'Absolute ruler of the realm.'
  },
  Advisor: {
    max: 2, trim: 'Netherite Dune', rank: 2, points: 3, color: 'text-stone-300', nameHover: 'group-hover:text-stone-100',
    badge: 'border-stone-400/30 bg-stone-300/[0.06] text-stone-200 group-hover:border-stone-300/60 group-hover:bg-stone-300/[0.12]',
    accent: 'hover:border-stone-300/60 hover:ring-stone-300/15 hover:shadow-[0_0_30px_rgba(214,211,209,0.16)] focus-within:border-stone-300/60 focus-within:ring-stone-300/20',
    line: 'from-stone-200 via-stone-400/40 to-transparent',
    wash: 'from-stone-300/[0.10] via-stone-300/[0.02] to-transparent',
    icon: Shield, desc: 'Provides counsel to the King.'
  },
  'Head Of Resources and Projects': {
    max: 1, trim: 'Amethyst Flow', rank: 3, points: 2, color: 'text-purple-300', nameHover: 'group-hover:text-purple-200',
    badge: 'border-purple-400/30 bg-purple-400/[0.08] text-purple-200 group-hover:border-purple-300/60 group-hover:bg-purple-400/[0.16]',
    accent: 'hover:border-purple-400/70 hover:ring-purple-400/20 hover:shadow-[0_0_32px_rgba(192,132,252,0.22)] focus-within:border-purple-400/70 focus-within:ring-purple-400/25',
    line: 'from-fuchsia-200 via-purple-400/50 to-transparent',
    wash: 'from-purple-400/[0.12] via-purple-400/[0.03] to-transparent',
    icon: Pickaxe, desc: 'Resource Management, Production Amount And Money.'
  },
  'Head Of General Purpose Resources': {
    max: 1, trim: 'Amethyst Flow', rank: 3, points: 2, color: 'text-purple-300', nameHover: 'group-hover:text-purple-200',
    badge: 'border-purple-400/30 bg-purple-400/[0.08] text-purple-200 group-hover:border-purple-300/60 group-hover:bg-purple-400/[0.16]',
    accent: 'hover:border-purple-400/70 hover:ring-purple-400/20 hover:shadow-[0_0_32px_rgba(192,132,252,0.22)] focus-within:border-purple-400/70 focus-within:ring-purple-400/25',
    line: 'from-fuchsia-200 via-purple-400/50 to-transparent',
    wash: 'from-purple-400/[0.12] via-purple-400/[0.03] to-transparent',
    icon: Hammer, desc: 'Handles Armor and Gear PRODUCTION.'
  },
  'Head Of Agriculture and Justice': {
    max: 1, trim: 'Gold Flow', rank: 3, points: 2, color: 'text-amber-300', nameHover: 'group-hover:text-amber-200',
    badge: 'border-amber-400/30 bg-amber-400/[0.08] text-amber-200 group-hover:border-amber-300/60 group-hover:bg-amber-400/[0.16]',
    accent: 'hover:border-amber-400/70 hover:ring-amber-400/20 hover:shadow-[0_0_32px_rgba(251,191,36,0.2)] focus-within:border-amber-400/70 focus-within:ring-amber-400/25',
    line: 'from-yellow-100 via-amber-400/50 to-transparent',
    wash: 'from-amber-400/[0.12] via-amber-400/[0.03] to-transparent',
    icon: Wheat, desc: 'Oversees crops, food supply, and kingdom laws.'
  },
  'Head Of Combat And War': {
    max: 1, trim: 'Redstone Flow', rank: 3, points: 2, color: 'text-red-300', nameHover: 'group-hover:text-red-200',
    badge: 'border-red-400/30 bg-red-400/[0.08] text-red-200 group-hover:border-red-300/60 group-hover:bg-red-400/[0.16]',
    accent: 'hover:border-red-400/70 hover:ring-red-400/20 hover:shadow-[0_0_32px_rgba(248,113,113,0.2)] focus-within:border-red-400/70 focus-within:ring-red-400/25',
    line: 'from-rose-200 via-red-400/50 to-transparent',
    wash: 'from-red-400/[0.12] via-red-400/[0.03] to-transparent',
    icon: Swords, desc: 'Handles Enchants and protection of gear.'
  },
  'Head Of Medicinal Substances': {
    max: 1, trim: 'Emerald Flow', rank: 3, points: 2, color: 'text-emerald-300', nameHover: 'group-hover:text-emerald-200',
    badge: 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200 group-hover:border-emerald-300/60 group-hover:bg-emerald-400/[0.16]',
    accent: 'hover:border-emerald-400/70 hover:ring-emerald-400/20 hover:shadow-[0_0_32px_rgba(52,211,153,0.2)] focus-within:border-emerald-400/70 focus-within:ring-emerald-400/25',
    line: 'from-teal-100 via-emerald-400/50 to-transparent',
    wash: 'from-emerald-400/[0.12] via-emerald-400/[0.03] to-transparent',
    icon: FlaskConical, desc: 'Brewing and distributing potions.'
  },
  Prince: {
    max: 1, trim: 'Iron Flow Trim', rank: 4, points: 2, color: 'text-slate-300', nameHover: 'group-hover:text-slate-100',
    badge: 'border-slate-300/30 bg-slate-300/[0.06] text-slate-200 group-hover:border-slate-200/60 group-hover:bg-slate-300/[0.12]',
    accent: 'hover:border-slate-300/60 hover:ring-slate-300/15 hover:shadow-[0_0_30px_rgba(203,213,225,0.16)] focus-within:border-slate-300/60 focus-within:ring-slate-300/20',
    line: 'from-slate-100 via-slate-300/40 to-transparent',
    wash: 'from-slate-300/[0.10] via-slate-300/[0.02] to-transparent',
    icon: Star, desc: 'Heir to the kingdom.'
  },
  Citizen: {
    max: Infinity, trim: 'None', rank: 5, points: 1, color: 'text-stone-400', nameHover: 'group-hover:text-stone-200',
    badge: 'border-stone-500/30 bg-stone-400/[0.04] text-stone-300 group-hover:border-stone-400/50 group-hover:bg-stone-400/[0.08]',
    accent: 'hover:border-stone-400/50 hover:ring-stone-400/10 hover:shadow-[0_0_24px_rgba(168,162,158,0.12)] focus-within:border-stone-400/50 focus-within:ring-stone-400/15',
    line: 'from-stone-300/80 via-stone-500/30 to-transparent',
    wash: 'from-stone-400/[0.08] via-stone-400/[0.02] to-transparent',
    icon: User, desc: 'Standard member of the kingdom.'
  }
};

const RANK_TITLES = { 1: "KING", 2: "HIGH COUNCIL", 3: "COUNCIL", 4: "PRINCE", 5: "CITIZENS" };
const RANK_ACCENTS = {
  1: 'text-blue-200 border-blue-400/25 bg-blue-400/[0.07]',
  2: 'text-stone-200 border-stone-400/25 bg-stone-400/[0.05]',
  3: 'text-purple-200 border-purple-400/25 bg-purple-400/[0.06]',
  4: 'text-slate-200 border-slate-300/25 bg-slate-300/[0.05]',
  5: 'text-stone-300 border-stone-600/50 bg-stone-800/60',
};

const ROSTER_STORAGE_KEY = 'kingdom-hierarchy.roster.v1';
const ROLE_NAMES = Object.keys(ROLE_CONFIG);

function readRosterState() {
  try {
    const savedRoster = window.localStorage.getItem(ROSTER_STORAGE_KEY);
    if (savedRoster === null) return { members: MEMBERS, isModified: false, error: '' };

    const parsedRoster = JSON.parse(savedRoster);
    const validationError = validateRoster(parsedRoster, ROLE_CONFIG);
    if (validationError) {
      return {
        members: MEMBERS,
        isModified: false,
        error: `Saved browser roster was invalid and has not been loaded: ${validationError}`,
      };
    }

    return { members: parsedRoster, isModified: true, error: '' };
  } catch (error) {
    return {
      members: MEMBERS,
      isModified: false,
      error: `Could not read the saved browser roster: ${error instanceof Error ? error.message : 'unknown storage error'}`,
    };
  }
}

function MemberAvatar({ member, config }) {
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
      className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-700 bg-stone-950 font-sans text-sm font-bold shadow-md transition duration-300 group-hover:scale-105 motion-reduce:transition-none ${config?.color} ${config?.accent}`}
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
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [rosterState, setRosterState] = useState(readRosterState);
  const [editorOpen, setEditorOpen] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState('');
  const [copyFailed, setCopyFailed] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const profileDialogRef = useRef(null);
  const rosterRef = useRef(null);
  const members = rosterState.members;

  useEffect(() => {
    const dialog = profileDialogRef.current;
    if (!dialog) return;

    if (selectedMember && !dialog.open) {
      dialog.showModal();
    } else if (!selectedMember && dialog.open) {
      dialog.close();
    }
  }, [selectedMember]);

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

  function saveRoster(nextMembers) {
    const validationError = validateRoster(nextMembers, ROLE_CONFIG);
    if (validationError) throw new Error(validationError);

    try {
      window.localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(nextMembers));
    } catch (error) {
      throw new Error(`Could not save roster in this browser: ${error instanceof Error ? error.message : 'storage unavailable'}`);
    }

    setRosterState({ members: nextMembers, isModified: true, error: '' });
  }

  function resetRoster() {
    try {
      window.localStorage.removeItem(ROSTER_STORAGE_KEY);
    } catch (error) {
      throw new Error(`Could not reset the saved roster: ${error instanceof Error ? error.message : 'storage unavailable'}`);
    }

    setRosterState({ members: MEMBERS, isModified: false, error: '' });
    setSelectedRoleFilter('');
    setActiveFilter('All');
    setSearchQuery('');
  }

  function filterByRole(role) {
    setSelectedRoleFilter(role);
    setActiveFilter('All');
    requestAnimationFrame(() => rosterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  const filteredMembers = filterMembers(members, searchQuery, activeFilter, selectedRoleFilter);
  const normalizedQuery = searchQuery.trim();
  const totalSouls = members.length;
  const highCouncilCount = members.filter(member => matchesMemberFilter(member, 'High Council')).length;
  const councilCount = members.filter(member => matchesMemberFilter(member, 'Council')).length;
  const roleCoverage = getRoleCoverage(members, ROLE_CONFIG);
  const vacantRoles = roleCoverage.filter(role => role.vacant > 0);
  const openSeatCount = vacantRoles.reduce((total, role) => total + role.vacant, 0);
  const rankVotingTotals = getRankVotingTotals(members, ROLE_CONFIG, RANK_TITLES);
  const totalVotingPower = members.reduce(
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
    { label: 'Military', value: 'Military', count: members.filter(member => matchesMemberFilter(member, 'Military')).length },
    { label: 'Citizens', value: 'Citizens', count: members.filter(member => matchesMemberFilter(member, 'Citizens')).length },
  ];

  return (
    <div className="min-h-screen bg-[#0b0d0b] text-stone-200 font-serif selection:bg-amber-900/70 selection:text-amber-50 pb-16">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(120,83,34,0.13),_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-3 py-6 sm:px-4 md:px-8 md:py-12">
        <header className="mb-10">
          <div className="relative overflow-hidden rounded-2xl border border-stone-800 bg-gradient-to-br from-stone-900 via-[#171812] to-[#11120f] px-4 py-6 shadow-2xl sm:px-6 sm:py-8 md:px-10 md:py-10">
            <div className="absolute -right-10 -top-14 text-amber-100/[0.035]"><Crown size={260} strokeWidth={0.7} /></div>
            <div className="relative">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-700/30 bg-amber-950/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Realm records
                </div>
                <button
                  type="button"
                  onClick={() => setEditorOpen(true)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-100 transition hover:border-amber-300/60 hover:bg-amber-400/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <Pencil size={14} /> Edit roster
                  {rosterState.isModified && <span className="rounded-full bg-amber-300 px-1.5 py-0.5 text-[9px] font-black text-stone-950">SAVED HERE</span>}
                </button>
              </div>
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-[0.06em] text-stone-100 sm:text-4xl md:text-6xl">Kingdom<br className="sm:hidden" /> Hierarchy</h1>
                  <p className="mt-3 text-base italic text-stone-400 md:text-lg">The people, positions, and power that shape our realm.</p>
                </div>
                <div className="flex max-w-sm items-start gap-3 rounded-xl border border-stone-700/70 bg-black/20 p-4 text-sm leading-relaxed text-stone-400">
                  <Info className="mt-0.5 shrink-0 text-amber-500/80" size={18} />
                  <p>Citizens are <strong className="font-semibold text-stone-200">not permitted to wear armor trims.</strong></p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Realm members', value: totalSouls, icon: Users, color: 'text-stone-300' },
                  { label: 'Council members', value: councilCount, icon: Pickaxe, color: 'text-purple-300' },
                  { label: 'Voting power', value: `${totalVotingPower} pts`, icon: Scale, color: 'text-sky-300' },
                  { label: 'Open seats', value: openSeatCount, icon: DoorOpen, color: openSeatCount ? 'text-amber-300' : 'text-emerald-300' },
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
              {rosterState.error && <p className="mt-3 rounded-lg border border-rose-400/25 bg-rose-400/[0.06] px-4 py-3 text-xs leading-relaxed text-rose-200" role="alert">{rosterState.error}</p>}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section aria-labelledby="vacancies-title" className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300/80">Realm staffing</p>
                  <h2 id="vacancies-title" className="mt-1 text-lg font-bold text-stone-100">Open positions</h2>
                </div>
                <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${openSeatCount ? 'border-amber-400/25 bg-amber-400/10 text-amber-200' : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'}`}>
                  {openSeatCount ? `${openSeatCount} open` : 'Fully staffed'}
                </span>
              </div>
              {vacantRoles.length ? (
                <ul className="mt-4 space-y-2">
                  {vacantRoles.map(({ role, capacity, filled, vacant }) => (
                    <li key={role}>
                      <button
                        type="button"
                        aria-label={`Show members assigned as ${role}; ${vacant} seat${vacant === 1 ? '' : 's'} open`}
                        aria-pressed={selectedRoleFilter === role}
                        onClick={() => filterByRole(role)}
                        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-400 ${selectedRoleFilter === role ? 'border-amber-400/50 bg-amber-400/[0.08]' : 'border-stone-800 bg-black/20 hover:border-amber-400/30 hover:bg-amber-400/[0.04]'}`}
                      >
                        <span className="text-sm text-stone-300">{role}</span>
                        <span className="shrink-0 text-xs tabular-nums text-amber-200">{filled}/{capacity} filled <span className="text-stone-600">·</span> {vacant} open</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.04] px-3 py-3 text-sm text-stone-400">Every limited-seat role is currently filled.</p>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-stone-600">Secondary role assignments count toward that role’s seat limit. Unlimited roles are not listed.</p>
            </section>

            <section aria-labelledby="rank-power-title" className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300/80">Voting overview</p>
                  <h2 id="rank-power-title" className="mt-1 text-lg font-bold text-stone-100">Power by rank</h2>
                </div>
                <Scale className="mt-1 text-sky-300" size={18} />
              </div>
              <ul className="mt-4 space-y-2">
                {rankVotingTotals.map(({ rank, title, memberCount, votingPower }) => (
                  <li key={rank} className="flex items-center justify-between gap-3 rounded-lg border border-stone-800 bg-black/20 px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${rank === 1 ? 'bg-blue-300' : rank === 2 ? 'bg-stone-300' : rank === 3 ? 'bg-purple-300' : rank === 4 ? 'bg-slate-300' : 'bg-stone-500'}`} />
                      <span className="truncate text-sm text-stone-300">{title}</span>
                      <span className="text-xs text-stone-600">{memberCount}</span>
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-sky-200">{votingPower} pts</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] leading-relaxed text-stone-600">Each member is counted once under their primary role’s rank; totals add up to realm voting power.</p>
            </section>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-stone-800 bg-stone-900/60 p-3 sm:p-4 md:flex-row md:items-center md:justify-between md:p-5">
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
                  onClick={() => { setActiveFilter(value); setSelectedRoleFilter(''); }}
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
            {selectedRoleFilter && <> in role <span className="text-stone-300">{selectedRoleFilter}</span></>}
          </p>
          {selectedRoleFilter && (
            <button type="button" onClick={() => setSelectedRoleFilter('')} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg border border-amber-400/30 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-400/10 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <X size={13} /> Clear role filter
            </button>
          )}
          {(copiedUsername || copyFailed) && (
            <p className={`mt-1 px-1 text-xs ${copyFailed ? 'text-rose-300' : 'text-emerald-300'}`} role="status">
              {copyFailed ? 'Could not copy username. Check clipboard permissions and try again.' : `Copied ${copiedUsername} to clipboard.`}
            </p>
          )}
        </header>

        <main ref={rosterRef} id="member-roster" className="scroll-mt-6 flex flex-col gap-10">
          {filteredMembers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-700 bg-stone-900/30 px-6 py-16 text-center font-sans">
              <Search className="mx-auto mb-4 text-stone-600" size={28} />
              <h2 className="text-lg font-semibold text-stone-200">{selectedRoleFilter ? 'No members assigned to this role' : 'No members found'}</h2>
              <p className="mt-2 text-sm text-stone-500">{selectedRoleFilter ? `${selectedRoleFilter} is currently an open position.` : 'Try another search or clear the current filters.'}</p>
              <button type="button" onClick={() => { setSearchQuery(''); setActiveFilter('All'); setSelectedRoleFilter(''); }} className="mt-5 min-h-11 rounded-lg border border-stone-700 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-amber-600/60 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                Reset search and filters
              </button>
            </div>
          ) : (
            rankSections.map(({ key, title, members: membersInRank }) => (
                <section key={key} aria-labelledby={`rank-${key}`} className="group/rank">
                  <div className="mb-5 flex items-center gap-4">
                    <h2 id={`rank-${key}`} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black uppercase tracking-[0.18em] transition-colors group-hover/rank:brightness-125 ${key === 'power' ? 'border-sky-400/25 bg-sky-400/[0.06] text-sky-200' : RANK_ACCENTS[key]}`}>
                      {title}<span className="opacity-50">/</span><span className="font-medium tracking-normal opacity-70">{membersInRank.length}</span>
                    </h2>
                    <div className={`h-px flex-1 bg-gradient-to-r ${key === 'power' ? 'from-sky-400/60' : key === 1 ? 'from-blue-400/60' : key === 2 ? 'from-stone-300/50' : key === 3 ? 'from-purple-400/60' : key === 4 ? 'from-slate-300/50' : 'from-stone-600'} to-transparent transition-colors group-hover/rank:to-stone-800`} />
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
                        <article key={member.id} className={`group relative isolate overflow-hidden rounded-xl border border-stone-800 bg-gradient-to-br from-stone-900 to-[#121310] transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:ring-1 hover:shadow-2xl focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-[#0b0d0b] motion-reduce:transform-none motion-reduce:transition-none ${config?.accent}`}>
                          <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${config?.wash} opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none`} />
                          <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${config?.line} opacity-50 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100`} />
                          <div className="relative flex h-full flex-col p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <MemberAvatar member={member} config={config} />
                                <div className="min-w-0">
                                  <h3 className={`truncate text-lg font-black tracking-wide text-stone-100 transition-colors ${config?.nameHover}`}>{member.name}</h3>
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
                              <div className={`shrink-0 rounded-lg border bg-stone-950/80 px-2.5 py-1.5 text-right text-xs font-bold text-stone-300 transition-colors ${config?.badge}`}>
                                <div>{votingPower.points} pts</div>
                                {votingPower.isCustom && <div className="mt-0.5 text-[9px] font-medium text-amber-300">Custom allocation</div>}
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <div className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 font-sans text-xs transition-colors ${config?.badge}`}>
                                <Icon className={config?.color} size={13} /><span className="truncate">{member.role}</span>
                              </div>
                              {member.secondaryRole && secCfg && SecIcon && (
                                <div className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 font-sans text-xs transition-colors ${secCfg.badge}`}>
                                  <SecIcon className={secCfg.color} size={13} /><span className="truncate">{member.secondaryRole}</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-wide">
                              {config?.trim !== 'None' && <span className={`rounded-full border px-2 py-1 transition-colors ${config?.badge}`}>✦ {config?.trim}</span>}
                              {secCfg?.trim && secCfg.trim !== 'None' && <span className={`rounded-full border px-2 py-1 transition-colors ${secCfg.badge}`}>✦ {secCfg.trim}</span>}
                            </div>
                            <details className="mt-3 border-t border-stone-800/80 pt-3 font-sans text-xs">
                              <summary className="cursor-pointer text-stone-400 transition hover:text-amber-200">Voting points breakdown</summary>
                              <p className="mt-2 leading-relaxed text-stone-500">{describeVotingPower(member, ROLE_CONFIG)}</p>
                            </details>
                            {displayDesc && <p className="mt-4 flex-1 border-t border-stone-800/80 pt-4 text-sm leading-relaxed text-stone-400">{displayDesc}</p>}
                            <button
                              type="button"
                              onClick={() => setSelectedMember(member)}
                              className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-950 ${config?.badge} ${config?.accent}`}
                            >
                              View full profile <span aria-hidden="true">→</span>
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))
          )}
        </main>
        <dialog
          ref={profileDialogRef}
          aria-labelledby="member-profile-title"
          aria-describedby="member-profile-description"
          onClose={() => setSelectedMember(null)}
          className="max-h-[85vh] w-[min(42rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-stone-700 bg-[#11120f] p-0 text-stone-200 shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
        >
          {selectedMember && (() => {
            const config = ROLE_CONFIG[selectedMember.role];
            const secondaryConfig = selectedMember.secondaryRole
              ? ROLE_CONFIG[selectedMember.secondaryRole]
              : null;
            const votingPower = getVotingPowerBreakdown(selectedMember, ROLE_CONFIG);

            return (
              <div className="relative overflow-hidden">
                <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${config?.line}`} />
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config?.wash}`} />
                <div className="relative p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="scale-125"><MemberAvatar member={selectedMember} config={config} /></div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Member profile</p>
                        <h2 id="member-profile-title" className={`mt-1 truncate text-2xl font-black ${config?.color}`}>{selectedMember.name}</h2>
                        <p className="mt-1 truncate font-sans text-sm text-stone-400">@{selectedMember.mcName}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Close member profile"
                      onClick={() => profileDialogRef.current?.close()}
                      className="rounded-lg border border-stone-700 bg-stone-900/80 p-2 text-stone-400 transition hover:border-stone-500 hover:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className={`rounded-xl border p-4 ${config?.badge}`}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">Primary role</p>
                      <p className="mt-1 text-sm font-semibold">{selectedMember.role}</p>
                      {config?.trim !== 'None' && <p className="mt-1 text-xs opacity-80">✦ {config?.trim}</p>}
                    </div>
                    {selectedMember.secondaryRole && (
                      <div className={`rounded-xl border p-4 ${secondaryConfig?.badge}`}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">Secondary role</p>
                        <p className="mt-1 text-sm font-semibold">{selectedMember.secondaryRole}</p>
                        {secondaryConfig?.trim && secondaryConfig.trim !== 'None' && <p className="mt-1 text-xs opacity-80">✦ {secondaryConfig.trim}</p>}
                      </div>
                    )}
                  </div>

                  <section className="mt-4 rounded-xl border border-sky-400/20 bg-sky-400/[0.04] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-sky-100">Voting power</h3>
                      <span className="text-lg font-black tabular-nums text-sky-200">{votingPower.points} pts</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-stone-400">{describeVotingPower(selectedMember, ROLE_CONFIG)}</p>
                  </section>

                  <section className="mt-5">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">About</h3>
                    <p id="member-profile-description" className="mt-2 text-sm leading-relaxed text-stone-300">
                      {selectedMember.customDesc || config?.desc}
                    </p>
                  </section>
                </div>
              </div>
            );
          })()}
        </dialog>
        <RosterEditor
          open={editorOpen}
          members={members}
          publishedMembers={MEMBERS}
          roleNames={ROLE_NAMES}
          roleConfig={ROLE_CONFIG}
          onClose={() => setEditorOpen(false)}
          onSave={saveRoster}
          onReset={resetRoster}
        />
      </div>
    </div>
  );
}