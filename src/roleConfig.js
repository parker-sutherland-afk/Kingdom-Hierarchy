import { Crown, Shield, Pickaxe, Wheat, Swords, FlaskConical, User, Star, Hammer } from 'lucide-react';

const ROLE_CONFIG = {
  King: {
    trim: 'Diamond Flow', rank: 1, points: 5, color: 'text-blue-300', nameHover: 'group-hover:text-blue-200',
    badge: 'border-blue-400/30 bg-blue-400/10 text-blue-200 group-hover:border-blue-300/60 group-hover:bg-blue-400/20',
    accent: 'hover:border-blue-300/70 hover:ring-blue-300/20 hover:shadow-[0_0_34px_rgba(96,165,250,0.24)] focus-within:border-blue-300/70 focus-within:ring-blue-300/25',
    line: 'from-cyan-200 via-blue-400/50 to-transparent',
    wash: 'from-blue-400/[0.13] via-blue-400/[0.03] to-transparent',
    icon: Crown, desc: 'The crowned sovereign, whose decrees shape the realm and whose command stands above every court and council.'
  },
  Advisor: {
    trim: 'Netherite Dune', rank: 2, points: 3, color: 'text-stone-300', nameHover: 'group-hover:text-stone-100',
    badge: 'border-stone-400/30 bg-stone-300/[0.06] text-stone-200 group-hover:border-stone-300/60 group-hover:bg-stone-300/[0.12]',
    accent: 'hover:border-stone-300/60 hover:ring-stone-300/15 hover:shadow-[0_0_30px_rgba(214,211,209,0.16)] focus-within:border-stone-300/60 focus-within:ring-stone-300/20',
    line: 'from-stone-200 via-stone-400/40 to-transparent',
    wash: 'from-stone-300/[0.10] via-stone-300/[0.02] to-transparent',
    icon: Shield, desc: 'A trusted voice at the throne, turning hard-won wisdom and careful counsel into guidance for the King and the realm.'
  },
  'Head Of Resources and Projects': {
    trim: 'Amethyst Flow', rank: 3, points: 2, color: 'text-purple-300', nameHover: 'group-hover:text-purple-200',
    badge: 'border-purple-400/30 bg-purple-400/[0.08] text-purple-200 group-hover:border-purple-300/60 group-hover:bg-purple-400/[0.16]',
    accent: 'hover:border-purple-400/70 hover:ring-purple-400/20 hover:shadow-[0_0_32px_rgba(192,132,252,0.22)] focus-within:border-purple-400/70 focus-within:ring-purple-400/25',
    line: 'from-fuchsia-200 via-purple-400/50 to-transparent',
    wash: 'from-purple-400/[0.12] via-purple-400/[0.03] to-transparent',
    icon: Pickaxe, desc: 'Commands the flow of resources, production, and the kingdom coffers, laying the material foundations of prosperity.'
  },
  'Head Of General Purpose Resources': {
    trim: 'Amethyst Flow', rank: 3, points: 2, color: 'text-purple-300', nameHover: 'group-hover:text-purple-200',
    badge: 'border-purple-400/30 bg-purple-400/[0.08] text-purple-200 group-hover:border-purple-300/60 group-hover:bg-purple-400/[0.16]',
    accent: 'hover:border-purple-400/70 hover:ring-purple-400/20 hover:shadow-[0_0_32px_rgba(192,132,252,0.22)] focus-within:border-purple-400/70 focus-within:ring-purple-400/25',
    line: 'from-fuchsia-200 via-purple-400/50 to-transparent',
    wash: 'from-purple-400/[0.12] via-purple-400/[0.03] to-transparent',
    icon: Hammer, desc: 'Oversees the forging and production of armor and gear, equipping the realm for whatever trials lie beyond its walls.'
  },
  'Head Of Agriculture and Justice': {
    trim: 'Gold Flow', rank: 3, points: 2, color: 'text-amber-300', nameHover: 'group-hover:text-amber-200',
    badge: 'border-amber-400/30 bg-amber-400/[0.08] text-amber-200 group-hover:border-amber-300/60 group-hover:bg-amber-400/[0.16]',
    accent: 'hover:border-amber-400/70 hover:ring-amber-400/20 hover:shadow-[0_0_32px_rgba(251,191,36,0.2)] focus-within:border-amber-400/70 focus-within:ring-amber-400/25',
    line: 'from-yellow-100 via-amber-400/50 to-transparent',
    wash: 'from-amber-400/[0.12] via-amber-400/[0.03] to-transparent',
    icon: Wheat, desc: 'Guards the harvest, food supply, and kingdom laws, balancing full granaries with order worthy of the crown.'
  },
  'Head Of Combat And War': {
    trim: 'Redstone Flow', rank: 3, points: 2, color: 'text-red-300', nameHover: 'group-hover:text-red-200',
    badge: 'border-red-400/30 bg-red-400/[0.08] text-red-200 group-hover:border-red-300/60 group-hover:bg-red-400/[0.16]',
    accent: 'hover:border-red-400/70 hover:ring-red-400/20 hover:shadow-[0_0_32px_rgba(248,113,113,0.2)] focus-within:border-red-400/70 focus-within:ring-red-400/25',
    line: 'from-rose-200 via-red-400/50 to-transparent',
    wash: 'from-red-400/[0.12] via-red-400/[0.03] to-transparent',
    icon: Swords, desc: 'Prepares enchanted gear and the kingdom\'s defenses, ensuring its fighters meet danger with steel, skill, and resolve.'
  },
  'Head Of Medicinal Substances': {
    trim: 'Emerald Flow', rank: 3, points: 2, color: 'text-emerald-300', nameHover: 'group-hover:text-emerald-200',
    badge: 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200 group-hover:border-emerald-300/60 group-hover:bg-emerald-400/[0.16]',
    accent: 'hover:border-emerald-400/70 hover:ring-emerald-400/20 hover:shadow-[0_0_32px_rgba(52,211,153,0.2)] focus-within:border-emerald-400/70 focus-within:ring-emerald-400/25',
    line: 'from-teal-100 via-emerald-400/50 to-transparent',
    wash: 'from-emerald-400/[0.12] via-emerald-400/[0.03] to-transparent',
    icon: FlaskConical, desc: 'Brews and distributes potions, bringing careful craft and a touch of alchemical wonder to the realm.'
  },
  Prince: {
    trim: 'Iron Flow Trim', rank: 4, points: 2, color: 'text-slate-300', nameHover: 'group-hover:text-slate-100',
    badge: 'border-slate-300/30 bg-slate-300/[0.06] text-slate-200 group-hover:border-slate-200/60 group-hover:bg-slate-300/[0.12]',
    accent: 'hover:border-slate-300/60 hover:ring-slate-300/15 hover:shadow-[0_0_30px_rgba(203,213,225,0.16)] focus-within:border-slate-300/60 focus-within:ring-slate-300/20',
    line: 'from-slate-100 via-slate-300/40 to-transparent',
    wash: 'from-slate-300/[0.10] via-slate-300/[0.02] to-transparent',
    icon: Star, desc: 'The royal heir, carrying the promise of a new chapter for the kingdom and the weight of a crown yet to come.'
  },
  Citizen: {
    trim: 'None', rank: 5, points: 1, color: 'text-stone-400', nameHover: 'group-hover:text-stone-200',
    badge: 'border-stone-500/30 bg-stone-400/[0.04] text-stone-300 group-hover:border-stone-400/50 group-hover:bg-stone-400/[0.08]',
    accent: 'hover:border-stone-400/50 hover:ring-stone-400/10 hover:shadow-[0_0_24px_rgba(168,162,158,0.12)] focus-within:border-stone-400/50 focus-within:ring-stone-400/15',
    line: 'from-stone-300/80 via-stone-500/30 to-transparent',
    wash: 'from-stone-400/[0.08] via-stone-400/[0.02] to-transparent',
    icon: User, desc: 'The backbone of the realm: an everyday citizen whose presence, effort, and loyalty help the whole kingdom endure.'
  }
};

export const ROLE_NAMES = Object.keys(ROLE_CONFIG);
export default ROLE_CONFIG;
