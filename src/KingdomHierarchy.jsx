import React, { useState, useEffect, useMemo } from 'react';
import { Crown, Shield, Pickaxe, Wheat, Swords, FlaskConical, User, Star, Trash2, Edit2, Check, X, AlertCircle, Info, Hammer, RotateCcw } from 'lucide-react';

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

const DEFAULT_MEMBERS = [
  { id: 1, name: 'Will', role: 'King' },
  { id: 2, name: 'Parker', role: 'Advisor' },
  { id: 3, name: 'Darcy', role: 'Advisor', secondaryRole: 'Head Of Combat And War', customPoints: 3 },
  { id: 4, name: 'Harrison', role: 'Head Of Resources and Projects' },
  { id: 5, name: 'Thomas', role: 'Head Of Agriculture and Justice' },
  { id: 6, name: 'Nate', role: 'Head Of Medicinal Substances' },
  { id: 7, name: 'Max', role: 'Prince' },
  { id: 8, name: 'Alex', role: 'Citizen' },
  { id: 9, name: 'Nicky', role: 'Citizen' }
];

export default function KingdomHierarchy() {
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('kingdom_roster');
    return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
  });

  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Auto-save changes to local storage whenever members update
  useEffect(() => {
    localStorage.setItem('kingdom_roster', JSON.stringify(members));
  }, [members]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const resetToDefault = () => {
    if (window.confirm("Reset roster back to default?")) {
      setMembers(DEFAULT_MEMBERS);
      localStorage.removeItem('kingdom_roster');
      showToast("Roster reset to default.");
    }
  };

  const roleCounts = useMemo(() => {
    const counts = {};
    members.forEach(member => {
      counts[member.role] = (counts[member.role] || 0) + 1;
      if (member.secondaryRole) counts[member.secondaryRole] = (counts[member.secondaryRole] || 0) + 1;
    });
    return counts;
  }, [members]);

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newRole) return;
    if (roleCounts[newRole] >= ROLE_CONFIG[newRole].max) {
      showToast(`Cannot add! The role of "${newRole}" is full.`);
      return;
    }
    setMembers([...members, { id: Date.now(), name: newName.trim(), role: newRole, customDesc: '' }]);
    setNewName('');
    setNewRole(''); 
  };

  const handleDelete = (id) => {
    const member = members.find(m => m.id === id);
    if (member.role === 'King') {
      return showToast("Treason! You cannot delete the King.");
    }
    setMembers(members.filter(m => m.id !== id));
    if (editingId === id) cancelEdit();
  };

  const startEdit = (member) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditRole(member.role);
    setEditDesc(member.customDesc || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditRole('');
    setEditDesc('');
  };

  const saveEdit = (id) => {
    const member = members.find(m => m.id === id);
    if (!editName.trim()) return showToast("Name cannot be empty!");
    
    if (member.role === 'King' && editRole !== 'King') {
      return showToast("Treason! The King cannot be demoted.");
    }
    
    if (member.role !== editRole && roleCounts[editRole] >= ROLE_CONFIG[editRole].max) {
      return showToast(`Cannot move to "${editRole}", the position is full!`);
    }
    setMembers(members.map(m => m.id === id ? { ...m, name: editName.trim(), role: editRole, customDesc: editDesc.trim() } : m));
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 font-serif selection:bg-stone-700">
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-red-950 border border-red-800 text-red-200 px-6 py-3 rounded shadow-lg flex items-center gap-3">
            <AlertCircle size={18} />
            <span className="font-medium text-sm">{toastMsg}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="mb-12 border-b border-stone-700 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-stone-100 mb-2 uppercase">Kingdom Hierarchy</h1>
            <p className="text-stone-400 text-lg italic">Official Roster & Power Structure</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={resetToDefault} className="bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-400 hover:text-stone-200 p-2.5 rounded transition-colors" title="Reset Roster">
              <RotateCcw size={18} />
            </button>
            <div className="bg-stone-800 border border-stone-700 rounded px-4 py-3 flex items-center gap-3 max-w-sm">
              <Info className="text-stone-400 shrink-0" size={20} />
              <p className="text-xs text-stone-300">Citizens are <strong className="text-red-400">strictly forbidden</strong> from wearing armor trims.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col gap-10">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {membersInRank.map((member) => {
                      const config = ROLE_CONFIG[member.role];
                      const Icon = config?.icon || User;
                      const isEditing = editingId === member.id;
                      const secCfg = member.secondaryRole ? ROLE_CONFIG[member.secondaryRole] : null;
                      
                      const pts = member.customPoints !== undefined && member.customPoints !== null 
                        ? member.customPoints 
                        : config?.points + (secCfg ? secCfg.points : 0);

                      const displayDesc = member.customDesc || config?.desc;
                      
                      return (
                        <div key={member.id} className={`group bg-stone-800 rounded border transition-colors ${isEditing ? 'border-amber-600' : config?.border}`}>
                          <div className="p-5 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-4 gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`p-2 rounded bg-stone-900 border border-stone-700 ${config?.color}`}>
                                  <Icon size={20} />
                                </div>
                                {isEditing ? (
                                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-stone-900 border border-stone-600 rounded px-2 py-1 text-stone-100 w-full" />
                                ) : (
                                  <h3 className="text-xl font-bold text-stone-100 truncate">{member.name}</h3>
                                )}
                              </div>
                              <div className="bg-stone-900 text-stone-300 px-2.5 py-1 rounded border border-stone-700 text-xs font-bold shrink-0">{pts} Pts</div>
                            </div>
                            
                            <div className="flex-1 space-y-3">
                              {isEditing ? (
                                <>
                                  <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-sm text-stone-200">
                                    {Object.entries(ROLE_CONFIG).map(([rName, rCfg]) => (
                                      <option key={rName} value={rName} disabled={roleCounts[rName] >= rCfg.max && rName !== member.role}>
                                        {rName} {roleCounts[rName] >= rCfg.max && rName !== member.role ? '(Full)' : ''}
                                      </option>
                                    ))}
                                  </select>
                                  <textarea 
                                    value={editDesc} 
                                    onChange={(e) => setEditDesc(e.target.value)} 
                                    placeholder="Custom description (optional)..." 
                                    className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-2 text-sm text-stone-200 resize-none h-20 placeholder:text-stone-600" 
                                  />
                                </>
                              ) : (
                                <div className="space-y-1 text-sm">
                                  <div className="font-medium text-stone-300">{member.role}</div>
                                  {config?.trim !== "None" && <div className={`text-xs ${config?.color}`}>✦ {config?.trim}</div>}
                                </div>
                              )}

                              {!isEditing && member.secondaryRole && secCfg && (
                                <div className="pt-3 border-t border-stone-700 space-y-1 text-sm">
                                  <div className="font-medium text-stone-400">+ {member.secondaryRole}</div>
                                  {secCfg.trim !== "None" && <div className={`text-xs ${secCfg.color}`}>✦ {secCfg.trim}</div>}
                                </div>
                              )}

                              {!isEditing && displayDesc && <div className="text-xs text-stone-400 italic mt-2 whitespace-pre-wrap">{displayDesc}</div>}
                            </div>
                            
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-stone-700">
                              {isEditing ? (
                                <>
                                  <button onClick={() => saveEdit(member.id)} className="text-emerald-500 hover:text-emerald-400 p-1"><Check size={18} /></button>
                                  <button onClick={cancelEdit} className="text-stone-500 hover:text-stone-300 p-1"><X size={18} /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => startEdit(member)} className="text-stone-500 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><Edit2 size={16} /></button>
                                  {member.role !== 'King' && (
                                    <button onClick={() => handleDelete(member.id)} className="text-stone-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash2 size={16} /></button>
                                  )}
                                </>
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

          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-stone-800 border border-stone-700 rounded p-5 sticky top-8">
              <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider mb-5 flex items-center gap-2">
                <User size={16} className="text-stone-400"/> Enlist Member
              </h3>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 mb-1 uppercase">Name</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter name..." className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-sm text-stone-200" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 mb-1 uppercase">Position</label>
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-sm text-stone-200" required>
                    <option value="" disabled>Select role...</option>
                    {Object.entries(ROLE_CONFIG).map(([rName, config]) => (
                      <option key={rName} value={rName} disabled={roleCounts[rName] >= config.max}>
                        {roleCounts[rName] >= config.max ? `[LOCKED] ${rName}` : rName}
                      </option>
                    ))}
                  </select>
                </div>
                {newRole && ROLE_CONFIG[newRole] && (
                  <div className={`mt-3 p-3 rounded border bg-stone-900 ${ROLE_CONFIG[newRole].border}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-stone-500">Trim</span>
                      <span className={`text-xs ${ROLE_CONFIG[newRole].color}`}>{ROLE_CONFIG[newRole].trim}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-stone-500">Voting Power</span>
                      <span className="text-xs font-bold text-stone-300">{ROLE_CONFIG[newRole].points} Pts</span>
                    </div>
                  </div>
                )}
                <button type="submit" disabled={!newName || !newRole} className="w-full mt-2 bg-stone-700 hover:bg-stone-600 disabled:opacity-50 text-stone-200 text-sm font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors">
                  <Check size={16} /> Add to Roster
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}