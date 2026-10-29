import React, { useState } from 'react';
import { Crown, Shield, Pickaxe, Wheat, Swords, FlaskConical, User, Star, Info, Hammer, Search } from 'lucide-react';

const ROLE_CONFIG = {
  "King": { max: 1, trim: "Diamond Flow", rank: 1, points: 5, color: "text-blue-300", border: "border-slate-400", bgGlow: "bg-slate-800", icon: Crown, desc: "Absolute ruler of the realm." },
  "Advisor": { max: 2, trim: "Netherite Dune", rank: 2, points: 3, color: "text-stone-300", border: "border-stone-500", bgGlow: "bg-stone-800", icon: Shield, desc: "Provides counsel to the King." },
  "Head Of Resources and Projects": { max: 1, trim: "Amethyst Flow", rank: 3, points: 2, color: "text-purple-300", border: "border-purple-800", bgGlow: "bg-stone-800", icon: Pickaxe, desc: "Resource Management, Production Amount And Money." },
  "Head Of General Purpose Resources": { max: 1, trim: "Amethyst Flow", rank: 3, points: 2, color: "text-purple-300", border: "border-purple-800", bgGlow: "bg-stone-800", icon: Hammer, desc: "Handles Armor and Gear PRODUCTION." },
  "Head Of Agriculture and Justice": { max: 1, trim: "Gold Flow", rank: 4, points: 2, color: "text-amber-500", border: "border-amber-700", bgGlow: "bg-stone-800", icon: Wheat, desc: "Oversees crops, food supply, and kingdom laws." },
  "Head Of Combat And War": { max: 1, trim: "Redstone Flow", rank: 4, points: 2, color: "text-red-400", border: "border-red-800", bgGlow: "bg-stone-800", icon: Swords, desc: "Handles Enchants and protection of gear." },
  "Head Of Medicinal Substances": { max: 1, trim: "Emerald Flow", rank: 4, points: 2, color: "text-emerald-500", border: "border-emerald-800", bgGlow: "bg-stone-800", icon: FlaskConical, desc: "Brewing and distributing potions." },
  "Prince": { max: 1, trim: "Iron Flow Trim", rank: 5, points: 2, color: "text-slate-300", border: "border-slate-500", bgGlow: "bg-stone-800", icon: Star, desc: "Heir to the kingdom." },
  "Citizen": { max: Infinity, trim: "None", rank: 6, points: 1, color: "text-stone-400", border: "border-stone-700", bgGlow: "bg-stone-800", icon: User, desc: "Standard member of the kingdom." }
};

const RANK_TITLES = { 1: "TOP", 2: "SECOND", 3: "THIRD", 4: "FOURTH", 5: "FIFTH", 6: "CITIZENS" };

const INITIAL_MEMBERS = [
  { id: 1, name: 'Will', role: 'King', customDesc: 'The sovereign overlord, whose mere whisper commands the tides of fate and whose iron will binds the very foundations of the realm.' },
  
  { id: 2, name: 'Parker', role: 'Advisor', customDesc: 'Master of whispers and the silent orchestrator of the throne\'s absolute power. He sees all that the light touches, and all that it does not.' },
  
  { id: 3, name: 'Darcy', role: 'Advisor', secondaryRole: 'Head Of Combat And War', customPoints: 3, customDesc: 'The blood-soaked vanguard of the King\'s wrath. A relentless tactician whose enchanted blade has tasted the ruin of a thousand empires.' },
  
  { id: 4, name: 'Harrison', role: 'Head Of Resources and Projects', customDesc: 'The grand architect of prosperity. He bends the very earth to his will, forging unstoppable empires from raw stone and boundless ambition.' },
  
  { id: 5, name: 'Thomas', role: 'Head Of Agriculture and Justice', customDesc: 'The iron-fisted warden of the harvest and the law. He reaps both the golden wheat and the souls of the guilty with equal, merciless judgment.' },
  
  { id: 6, name: 'Nate', role: 'Head Of Medicinal Substances', customDesc: 'An enigmatic alchemist dancing on the razor\'s edge of life and death, brewing volatile elixirs that could either grant immortality or shatter the mind.' },
  
  { id: 7, name: 'Max', role: 'Prince', customDesc: 'The golden heir to the throne, bearing the crushing, inescapable weight of a legacy forged in blood and destined to one day eclipse the stars.' },
  
  { id: 8, name: 'Alex', role: 'Citizen', customDesc: 'A humble soul bound to the dirt, yet harboring the burning, unyielding spirit of a thousand ancestors in the eternal shadow of the crown.' },
  
  { id: 9, name: 'Nicky', role: 'Citizen', customDesc: 'An unsung hero of the cobblestones, whose relentless daily toil weaves the very fabric of the kingdom\'s glorious and unending tapestry.' },
  
  { id: 10, name: 'Poppy', role: 'Citizen', customDesc: 'A fiercely loyal resident whose unwavering devotion to the realm burns brighter than the hottest forge. A true, unstoppable pillar of the kingdom\'s grand destiny.' }
];

export default function KingdomHierarchy() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter members based on search query
  const filteredMembers = INITIAL_MEMBERS.filter(member => {
    const q = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      (member.secondaryRole && member.secondaryRole.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 font-serif selection:bg-stone-700">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-10 border-b border-stone-700 pb-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-stone-100 mb-2 uppercase">Kingdom Hierarchy</h1>
              <p className="text-stone-400 text-lg italic">Official Roster & Power Structure</p>
            </div>
            <div className="bg-stone-800 border border-stone-700 rounded px-4 py-3 flex items-center gap-3 max-w-sm w-full md:w-auto">
              <Info className="text-stone-400 shrink-0" size={20} />
              <p className="text-xs text-stone-300">Citizens are <strong className="text-red-400">strictly forbidden</strong> from wearing armor trims.</p>
            </div>
          </div>
          
          {/* Search Bar Section */}
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-stone-500" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by name, role, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-800 border border-stone-600 rounded-md py-2.5 pl-10 pr-3 text-sm text-stone-200 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all"
            />
          </div>
        </header>

        <div className="flex flex-col gap-10">
          {filteredMembers.length === 0 ? (
            <div className="text-center text-stone-500 py-12 italic border border-stone-800 rounded bg-stone-800/30">
              No members found matching "{searchQuery}"
            </div>
          ) : (
            [1, 2, 3, 4, 5, 6].map((rankNum) => {
              const membersInRank = filteredMembers.filter(m => ROLE_CONFIG[m.role]?.rank === rankNum);
              if (membersInRank.length === 0) return null;

              return (
                <section key={rankNum}>
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest bg-stone-800 px-3 py-1 rounded border border-stone-700">
                      {RANK_TITLES[rankNum]}
                    </h2>
                    <div className="flex-1 h-px bg-stone-700"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {membersInRank.map((member) => {
                      const config = ROLE_CONFIG[member.role];
                      const Icon = config?.icon || User;
                      const secCfg = member.secondaryRole ? ROLE_CONFIG[member.secondaryRole] : null;
                      
                      const pts = member.customPoints !== undefined && member.customPoints !== null 
                        ? member.customPoints 
                        : config?.points + (secCfg ? secCfg.points : 0);

                      const displayDesc = member.customDesc || config?.desc;
                      
                      return (
                        <div key={member.id} className={`bg-stone-800 rounded border ${config?.border} transition-all hover:bg-stone-800/80`}>
                          <div className="p-5 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-4 gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-2 rounded bg-stone-900 border border-stone-700 ${config?.color}`}>
                                  <Icon size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-stone-100 truncate">{member.name}</h3>
                              </div>
                              <div className="bg-stone-900 text-stone-300 px-2.5 py-1 rounded border border-stone-700 text-xs font-bold shrink-0">{pts} Pts</div>
                            </div>
                            
                            <div className="flex-1 space-y-3">
                              <div className="space-y-1 text-sm">
                                <div className="font-medium text-stone-300">{member.role}</div>
                                {config?.trim !== "None" && <div className={`text-xs ${config?.color}`}>✦ {config?.trim}</div>}
                              </div>

                              {member.secondaryRole && secCfg && (
                                <div className="pt-3 border-t border-stone-700 space-y-1 text-sm">
                                  <div className="font-medium text-stone-400">+ {member.secondaryRole}</div>
                                  {secCfg.trim !== "None" && <div className={`text-xs ${secCfg.color}`}>✦ {secCfg.trim}</div>}
                                </div>
                              )}

                              {displayDesc && (
                                <div className="text-xs text-stone-400 italic mt-2 whitespace-pre-wrap border-t border-stone-700/50 pt-2">
                                  {displayDesc}
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