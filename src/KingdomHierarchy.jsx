import React, { useState } from 'react';
import { Crown, Shield, Pickaxe, Wheat, Swords, FlaskConical, User, Star, Info, Hammer, Search, Users, Scale, X, Copy, Check } from 'lucide-react';

const ROLE_CONFIG = {
  "King": { max: 1, trim: "Diamond Flow", rank: 1, points: 5, color: "text-blue-300", border: "border-slate-500", shadowGlow: "hover:shadow-[0_0_20px_rgba(147,197,253,0.3)] hover:border-blue-400", icon: Crown, desc: "Absolute ruler of the realm." },
  "Advisor": { max: 2, trim: "Netherite Dune", rank: 2, points: 3, color: "text-stone-300", border: "border-stone-500", shadowGlow: "hover:shadow-[0_0_20px_rgba(168,162,158,0.3)] hover:border-stone-400", icon: Shield, desc: "Provides counsel to the King." },
  "Head Of Resources and Projects": { max: 1, trim: "Amethyst Flow", rank: 3, points: 2, color: "text-purple-300", border: "border-purple-800", shadowGlow: "hover:shadow-[0_0_20px_rgba(216,180,254,0.3)] hover:border-purple-400", icon: Pickaxe, desc: "Resource Management, Production Amount And Money." },
  "Head Of General Purpose Resources": { max: 1, trim: "Amethyst Flow", rank: 3, points: 2, color: "text-purple-300", border: "border-purple-800", shadowGlow: "hover:shadow-[0_0_20px_rgba(216,180,254,0.3)] hover:border-purple-400", icon: Hammer, desc: "Handles Armor and Gear PRODUCTION." },
  "Head Of Agriculture and Justice": { max: 1, trim: "Gold Flow", rank: 4, points: 2, color: "text-amber-500", border: "border-amber-700", shadowGlow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:border-amber-400", icon: Wheat, desc: "Oversees crops, food supply, and kingdom laws." },
  "Head Of Combat And War": { max: 1, trim: "Redstone Flow", rank: 4, points: 2, color: "text-red-400", border: "border-red-800", shadowGlow: "hover:shadow-[0_0_20px_rgba(248,113,113,0.3)] hover:border-red-400", icon: Swords, desc: "Handles Enchants and protection of gear." },
  "Head Of Medicinal Substances": { max: 1, trim: "Emerald Flow", rank: 4, points: 2, color: "text-emerald-500", border: "border-emerald-800", shadowGlow: "hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:border-emerald-400", icon: FlaskConical, desc: "Brewing and distributing potions." },
  "Prince": { max: 1, trim: "Iron Flow Trim", rank: 5, points: 2, color: "text-slate-300", border: "border-slate-500", shadowGlow: "hover:shadow-[0_0_20px_rgba(203,213,225,0.3)] hover:border-slate-300", icon: Star, desc: "Heir to the kingdom." },
  "Citizen": { max: Infinity, trim: "None", rank: 6, points: 1, color: "text-stone-400", border: "border-stone-700", shadowGlow: "hover:shadow-[0_0_15px_rgba(120,113,108,0.3)] hover:border-stone-500", icon: User, desc: "Standard member of the kingdom." }
};

const RANK_TITLES = { 1: "TOP", 2: "SECOND", 3: "THIRD", 4: "FOURTH", 5: "FIFTH", 6: "CITIZENS" };

const INITIAL_MEMBERS = [
  { id: 1, name: 'Will', mcName: 'EighthSea6218', role: 'King', customDesc: 'The sovereign overlord, whose mere whisper commands the tides of fate and whose iron will binds the very foundations of the realm.' },
  { id: 2, name: 'Parker', mcName: 'pikkapokaparker', role: 'Advisor', customDesc: 'Master of whispers and the silent orchestrator of the throne\'s absolute power. He sees all that the light touches, and all that it does not.' },
  { id: 3, name: 'Darcy', mcName: 'ImmortalPrince63', role: 'Advisor', secondaryRole: 'Head Of Combat And War', customPoints: 3, customDesc: 'The blood-soaked vanguard of the King\'s wrath. A relentless tactician whose enchanted blade has tasted the ruin of a thousand empires.' },
  { id: 4, name: 'Harrison', mcName: 'paddcake2016', role: 'Head Of Resources and Projects', customDesc: 'The grand architect of prosperity. He bends the very earth to his will, forging unstoppable empires from raw stone and boundless ambition.' },
  { id: 5, name: 'Thomas', mcName: 'HYPERIOUS12', role: 'Head Of Agriculture and Justice', customDesc: 'The iron-fisted warden of the harvest and the law. He reaps both the golden wheat and the souls of the guilty with equal, merciless judgment.' },
  { id: 6, name: 'Nate', mcName: 'DirtGrub58', role: 'Head Of Medicinal Substances', customDesc: 'An enigmatic alchemist dancing on the razor\'s edge of life and death, brewing volatile elixirs that could either grant immortality or shatter the mind.' },
  { id: 7, name: 'Max', mcName: 'maxthaking____', role: 'Prince', customDesc: 'The golden heir to the throne, bearing the crushing, inescapable weight of a legacy forged in blood and destined to one day eclipse the stars.' },
  { id: 8, name: 'Alex', mcName: 'Gamer2143707', role: 'Citizen', customDesc: 'A humble soul bound to the dirt, yet harboring the burning, unyielding spirit of a thousand ancestors in the eternal shadow of the crown.' },
  { id: 9, name: 'Nicky', mcName: 'Chicky31889', role: 'Citizen', customDesc: 'An unsung hero of the cobblestones, whose relentless daily toil weaves the very fabric of the kingdom\'s glorious and unending tapestry.' },
  { id: 10, name: 'Poppy', mcName: 'beastygirl101', role: 'Citizen', customDesc: 'A fiercely loyal resident whose unwavering devotion to the realm burns brighter than the hottest forge. A true, unstoppable pillar of the kingdom\'s grand destiny.' }
];

export default function KingdomHierarchy() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
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

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredMembers = INITIAL_MEMBERS.filter(member => {
    const searchableText = [member.name, member.mcName, member.role, member.secondaryRole, member.customDesc]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesSearch = searchableText.includes(normalizedQuery);
    const rank = ROLE_CONFIG[member.role]?.rank;
    const roles = [member.role, member.secondaryRole].filter(Boolean).join(' ').toLowerCase();
    const matchesFilter = activeFilter === 'All' ||
      (activeFilter === 'High Council' && rank <= 4) ||
      (activeFilter === 'Citizens' && rank === 6) ||
      (activeFilter === 'Military' && /war|combat|military/.test(roles));
    return matchesSearch && matchesFilter;
  });

  const totalSouls = INITIAL_MEMBERS.length;
  const highCouncilCount = INITIAL_MEMBERS.filter(m => ROLE_CONFIG[m.role]?.rank <= 4).length;
  const totalVotingPower = INITIAL_MEMBERS.reduce((sum, member) => {
    const config = ROLE_CONFIG[member.role];
    const secCfg = member.secondaryRole ? ROLE_CONFIG[member.secondaryRole] : null;
    return sum + (member.customPoints !== undefined && member.customPoints !== null ? member.customPoints : config?.points + (secCfg ? secCfg.points : 0));
  }, 0);

  const filterOptions = [
    { label: 'All members', value: 'All', count: totalSouls },
    { label: 'High council', value: 'High Council', count: highCouncilCount },
    { label: 'Military', value: 'Military', count: INITIAL_MEMBERS.filter(member =>
      /war|combat|military/.test([member.role, member.secondaryRole].filter(Boolean).join(' ').toLowerCase())
    ).length },
    { label: 'Citizens', value: 'Citizens', count: INITIAL_MEMBERS.filter(member => ROLE_CONFIG[member.role]?.rank === 6).length },
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
                  { label: 'Council seats', value: highCouncilCount, icon: Crown, color: 'text-amber-300' },
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
            [1, 2, 3, 4, 5, 6].map((rankNum) => {
              const membersInRank = filteredMembers.filter(m => ROLE_CONFIG[m.role]?.rank === rankNum);
              if (membersInRank.length === 0) return null;

              return (
                <section key={rankNum} aria-labelledby={`rank-${rankNum}`}>
                  <div className="mb-5 flex items-center gap-4">
                    <h2 id={`rank-${rankNum}`} className="flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-stone-300">
                      {RANK_TITLES[rankNum]}<span className="text-stone-600">/</span><span className="font-medium tracking-normal text-stone-500">{membersInRank.length}</span>
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-stone-700 to-transparent" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {membersInRank.map((member) => {
                      const config = ROLE_CONFIG[member.role];
                      const Icon = config?.icon || User;
                      const secCfg = member.secondaryRole ? ROLE_CONFIG[member.secondaryRole] : null;
                      const SecIcon = secCfg ? secCfg.icon : null;
                      const pts = member.customPoints !== undefined && member.customPoints !== null
                        ? member.customPoints
                        : config?.points + (secCfg ? secCfg.points : 0);
                      const displayDesc = member.customDesc || config?.desc;
                      
                      return (
                        <article key={member.id} className={`group relative overflow-hidden rounded-xl border border-stone-800 bg-gradient-to-br from-stone-900 to-[#121310] transition duration-300 hover:-translate-y-1 hover:border-stone-600 hover:shadow-xl ${config?.shadowGlow}`}>
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-amber-700/40 via-stone-700/40 to-transparent" />
                          <div className="flex h-full flex-col p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <img
                                  src={`https://minotar.net/helm/${encodeURIComponent(member.mcName)}/64.png`}
                                  alt={`${member.name}'s Minecraft avatar`}
                                  loading="lazy"
                                  className="h-12 w-12 shrink-0 rounded-lg border border-stone-700 bg-stone-950 shadow-md"
                                  onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = 'https://minotar.net/helm/Steve/64.png';
                                  }}
                                />
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
                              <div className="shrink-0 rounded-lg border border-stone-800 bg-stone-950/80 px-2.5 py-1.5 text-xs font-bold text-stone-300">{pts} pts</div>
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
                            {displayDesc && <p className="mt-4 flex-1 border-t border-stone-800/80 pt-4 text-sm leading-relaxed text-stone-400">{displayDesc}</p>}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}