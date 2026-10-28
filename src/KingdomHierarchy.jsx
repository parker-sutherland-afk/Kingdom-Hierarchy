import React from 'react';
import { Crown, Shield, Pickaxe, Wheat, Swords, FlaskConical, User, Star, Info, Hammer } from 'lucide-react';

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

// EDIT YOUR ROSTER & CUSTOM DESCRIPTIONS HERE:
const INITIAL_MEMBERS = [
  { id: 1, name: 'Will', role: 'King', customDesc: 'The High Sovereign whose absolute authority binds the realm and commands the ultimate destiny of all subjects.' },
  { id: 2, name: 'Parker', role: 'Advisor', customDesc: 'The Grand Strategist, architect of the throne\'s grand designs and master of deep-state diplomacy.' },
  { id: 3, name: 'Darcy', role: 'Advisor', secondaryRole: 'Head Of Combat And War', customPoints: 3, customDesc: 'The Lord Marshal, blending sharp political intellect with a legendary, undefeated record on the frontline.' },
  { id: 4, name: 'Harrison', role: 'Head Of Resources and Projects', customDesc: 'The Grand Architect and Treasurer, constructing the kingdom\'s eternal monuments while securing unimaginable wealth.' },
  { id: 5, name: 'Thomas', role: 'Head Of Agriculture and Justice', customDesc: 'The High Arbiter, an unyielding judge who commands the life-giving harvest and enforces the iron law of the realm.' },
  { id: 6, name: 'Nate', role: 'Head Of Medicinal Substances', customDesc: 'The Arch-Alchemist, custodian of forbidden medical lore, miraculous elixirs, and highly classified chemical secrets.' },
  { id: 7, name: 'Max', role: 'Prince', customDesc: 'The Royal Heir, enduring the brutal crucible of high court intrigue to one day inherit the crown.' },
  { id: 8, name: 'Alex', role: 'Citizen', customDesc: 'A prominent Guildmaster and economic powerhouse, driving the engine of local commerce and industry.' },
  { id: 9, name: 'Nicky', role: 'Citizen', customDesc: 'The Eyes of the Commons, a master informant who maps the city\'s hidden undercurrents and vital street intelligence.' }
];




export default function KingdomHierarchy() {
  const members = INITIAL_MEMBERS;

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 font-serif selection:bg-stone-700">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-12 border-b border-stone-700 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-stone-100 mb-2 uppercase">Kingdom Hierarchy</h1>
            <p className="text-stone-400 text-lg italic">Official Roster & Power Structure</p>
          </div>
          <div className="bg-stone-800 border border-stone-700 rounded px-4 py-3 flex items-center gap-3 max-w-sm">
            <Info className="text-stone-400 shrink-0" size={20} />
            <p className="text-xs text-stone-300">Citizens are <strong className="text-red-400">strictly forbidden</strong> from wearing armor trims.</p>
          </div>
        </header>

        <div className="flex flex-col gap-10">
          {[1, 2, 3, 4, 5, 6].map((rankNum) => {
            const membersInRank = members.filter(m => ROLE_CONFIG[m.role]?.rank === rankNum);
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
                      <div key={member.id} className={`bg-stone-800 rounded border ${config?.border}`}>
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
          })}
        </div>
      </div>
    </div>
  );
}