import React, { useState } from 'react';
import { Crown, Shield, Pickaxe, Wheat, Swords, FlaskConical, User, Star, Info, Hammer, Search, Users, Scale } from 'lucide-react';

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
  { id: 7, name: 'Max', mcName: 'Max', role: 'Prince', customDesc: 'The golden heir to the throne, bearing the crushing, inescapable weight of a legacy forged in blood and destined to one day eclipse the stars.' },
  { id: 8, name: 'Alex', mcName: 'Gamer2143707', role: 'Citizen', customDesc: 'A humble soul bound to the dirt, yet harboring the burning, unyielding spirit of a thousand ancestors in the eternal shadow of the crown.' },
  { id: 9, name: 'Nicky', mcName: 'Chicky31889', role: 'Citizen', customDesc: 'An unsung hero of the cobblestones, whose relentless daily toil weaves the very fabric of the kingdom\'s glorious and unending tapestry.' },
  { id: 10, name: 'Poppy', mcName: 'Poppy', role: 'Citizen', customDesc: 'A fiercely loyal resident whose unwavering devotion to the realm burns brighter than the hottest forge. A true, unstoppable pillar of the kingdom\'s grand destiny.' }
];

export default function KingdomHierarchy() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Filter members based on search query AND active button
  const filteredMembers = INITIAL_MEMBERS.filter(member => {
    // 1. Text Search Check
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      (member.secondaryRole && member.secondaryRole.toLowerCase().includes(q));

    // 2. Button Filter Check
    const rank = ROLE_CONFIG[member.role]?.rank;
    let matchesFilter = true;
    
    if (activeFilter === 'High Council') {
      matchesFilter = rank <= 4;
    } else if (activeFilter === 'Citizens') {
      matchesFilter = rank === 6;
    } else if (activeFilter === 'Military') {
      matchesFilter = 
        member.role.includes('War') || member.role.includes('Combat') ||
        (member.secondaryRole && (member.secondaryRole.includes('War') || member.secondaryRole.includes('Combat')));
    }

    return matchesSearch && matchesFilter;
  });

  // Calculate stats dynamically
  const totalSouls = INITIAL_MEMBERS.length;
  const highCouncilCount = INITIAL_MEMBERS.filter(m => ROLE_CONFIG[m.role]?.rank <= 4).length;
  const totalVotingPower = INITIAL_MEMBERS.reduce((sum, member) => {
    const config = ROLE_CONFIG[member.role];
    const secCfg = member.secondaryRole ? ROLE_CONFIG[member.secondaryRole] : null;
    return sum + (member.customPoints !== undefined && member.customPoints !== null ? member.customPoints : config?.points + (secCfg ? secCfg.points : 0));
  }, 0);

  const filterOptions = ['All', 'High Council', 'Military', 'Citizens'];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-serif selection:bg-stone-700 pb-12">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-10 border-b border-stone-800 pb-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-wider text-stone-100 mb-2 uppercase drop-shadow-lg">Kingdom Hierarchy</h1>
              <p className="text-stone-400 text-lg md:text-xl italic">Official Roster & Power Structure</p>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded px-4 py-3 flex items-center gap-3 max-w-sm w-full md:w-auto shadow-lg">
              <Info className="text-stone-500 shrink-0" size={20} />
              <p className="text-xs text-stone-400">Citizens are <strong className="text-red-500 font-bold">strictly forbidden</strong> from wearing armor trims.</p>
            </div>
          </div>
          
          {/* Kingdom Stats Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="bg-stone-900/50 border border-stone-800 rounded-lg p-4 flex items-center gap-4">
              <div className="p-3 bg-stone-800 rounded text-stone-400"><Users size={24} /></div>
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-widest">Total Souls</div>
                <div className="text-2xl font-black text-stone-200">{totalSouls}</div>
              </div>
            </div>
            <div className="bg-stone-900/50 border border-stone-800 rounded-lg p-4 flex items-center gap-4">
              <div className="p-3 bg-stone-800 rounded text-amber-500/80"><Crown size={24} /></div>
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-widest">High Council</div>
                <div className="text-2xl font-black text-stone-200">{highCouncilCount}</div>
              </div>
            </div>
            <div className="bg-stone-900/50 border border-stone-800 rounded-lg p-4 flex items-center gap-4">
              <div className="p-3 bg-stone-800 rounded text-blue-400/80"><Scale size={24} /></div>
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-widest">Voting Power</div>
                <div className="text-2xl font-black text-stone-200">{totalVotingPower} Pts</div>
              </div>
            </div>
          </div>

          {/* Search Bar & Filters Section */}
          <div className="flex flex-col gap-4 max-w-xl w-full mt-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-stone-500" size={18} />
              </div>
              <input
                type="text"
                placeholder="Search by name, role, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-md py-3 pl-10 pr-3 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all shadow-inner"
              />
            </div>
            
            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                    activeFilter === filter
                      ? 'bg-stone-200 text-stone-900 shadow-[0_0_10px_rgba(231,229,228,0.5)]'
                      : 'bg-stone-900 text-stone-400 border border-stone-700 hover:bg-stone-800 hover:text-stone-300'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-10">
          {filteredMembers.length === 0 ? (
            <div className="text-center text-stone-500 py-16 italic border border-stone-800 rounded-lg bg-stone-900/30 font-sans">
              No souls found matching those filters.
            </div>
          ) : (
            [1, 2, 3, 4, 5, 6].map((rankNum) => {
              const membersInRank = filteredMembers.filter(m => ROLE_CONFIG[m.role]?.rank === rankNum);
              if (membersInRank.length === 0) return null;

              return (
                <section key={rankNum}>
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-xs font-black text-stone-500 uppercase tracking-[0.2em] bg-stone-900 px-4 py-1.5 rounded border border-stone-800">
                      {RANK_TITLES[rankNum]}
                    </h2>
                    <div className="flex-1 h-px bg-stone-800"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                        <div key={member.id} className={`bg-stone-900 rounded-lg border ${config?.border} transition-all duration-300 hover:-translate-y-1 ${config?.shadowGlow}`}>
                          <div className="p-5 flex flex-col h-full relative overflow-hidden">
                            
                            <div className="flex items-start justify-between mb-5 gap-3 relative z-10">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="shrink-0 relative">
                                  <img 
                                    src={`https://minotar.net/helm/${member.mcName}/64.png`} 
                                    alt={`${member.name}'s Minecraft Head`}
                                    className="w-12 h-12 rounded bg-stone-950 border border-stone-700 shadow-md"
                                    onError={(e) => { e.target.src = 'https://minotar.net/helm/Steve/64.png' }} 
                                  />
                                </div>
                                <div>
                                  <h3 className="text-xl font-black text-stone-100 truncate tracking-wide">{member.name}</h3>
                                  <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5 font-sans font-medium">
                                    <Icon className={config?.color} size={12} />
                                    <span>{member.role}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-stone-950 text-stone-300 px-3 py-1.5 rounded border border-stone-800 text-xs font-bold shrink-0 shadow-inner">
                                {pts} Pts
                              </div>
                            </div>
                            
                            <div className="flex-1 space-y-3 relative z-10">
                              <div className="space-y-1 text-sm font-sans">
                                {config?.trim !== "None" && (
                                  <div className={`text-xs font-bold tracking-wide ${config?.color}`}>
                                    ✦ {config?.trim}
                                  </div>
                                )}
                              </div>

                              {member.secondaryRole && secCfg && SecIcon && (
                                <div className="pt-3 border-t border-stone-800 space-y-1 text-sm font-sans">
                                  <div className="font-medium text-stone-500 text-xs uppercase tracking-wider">Secondary Role</div>
                                  <div className="flex items-center gap-1.5 text-stone-300">
                                    <SecIcon size={12} className={secCfg.color} />
                                    {member.secondaryRole}
                                  </div>
                                  {secCfg.trim !== "None" && <div className={`text-xs font-bold ${secCfg.color}`}>✦ {secCfg.trim}</div>}
                                </div>
                              )}

                              {displayDesc && (
                                <div className="text-sm text-stone-400 italic mt-3 pt-3 border-t border-stone-800/50 leading-relaxed">
                                  "{displayDesc}"
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}