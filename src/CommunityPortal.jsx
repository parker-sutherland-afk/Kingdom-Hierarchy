import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Crown,
  Hammer,
  Landmark,
  ScrollText,
  Sparkles,
  Users,
} from 'lucide-react';
import MEMBERS from './data/members.json';
import NOTICES from './data/notices.json';
import PROJECTS from './data/buildProjects.json';
import CONSTITUTION from './data/constitution.json';
import ROSTER_METADATA from './data/rosterMetadata.json';
import ROLE_CONFIG from './roleConfig.js';
import { getVotingPowerBreakdown } from './rosterUtils.js';

const SECTIONS = [
  { id: 'general', label: 'Realm Hall', icon: Crown },
  { id: 'notices', label: 'Notices', icon: Bell },
  { id: 'projects', label: 'Build projects', icon: BookOpen },
  { id: 'constitution', label: 'Constitution', icon: ScrollText },
  { id: 'profiles', label: 'Profiles', icon: Users },
];

const APP_BASE = import.meta.env.BASE_URL;
const cardClass = 'rounded-xl border border-stone-800 bg-gradient-to-br from-stone-900/80 to-black/20 p-4';
const actionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 font-sans text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70';

function sectionUrl(section) {
  return `${APP_BASE}?page=community&section=${encodeURIComponent(section)}`;
}

function formatDate(date) {
  if (!date) return 'Date unavailable';
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function getLatestUpdateDate() {
  return [ROSTER_METADATA.lastUpdated, ...NOTICES.map(item => item.date), ...PROJECTS.map(item => item.updatedAt)]
    .filter(Boolean)
    .sort()
    .at(-1);
}

function MemberProfileCard({ member }) {
  const config = ROLE_CONFIG[member.role];
  const votingPower = getVotingPowerBreakdown(member, ROLE_CONFIG).points;
  const initials = member.name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();

  return (
    <article className={`${cardClass} flex h-full flex-col`}>
      <div className="flex items-start gap-3">
        <div aria-hidden="true" className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-stone-700 bg-stone-950 font-sans text-sm font-bold ${config?.color}`}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-stone-100">{member.name}</h3>
          <p className={`mt-1 truncate font-sans text-xs ${config?.color}`}>{member.role}</p>
          {member.secondaryRole && <p className="mt-1 truncate font-sans text-[11px] text-stone-500">{member.secondaryRole}</p>}
        </div>
        {member.role === 'King' && <Crown aria-label="King" className="shrink-0 text-amber-300" size={16} />}
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-stone-400">{member.customDesc || config?.desc}</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-800 pt-3">
        <span className="font-sans text-[10px] text-stone-500">{votingPower} voting point{votingPower === 1 ? '' : 's'}</span>
        <a
          href={`${APP_BASE}?member=${encodeURIComponent(member.id)}`}
          className="inline-flex min-h-10 items-center rounded-lg border border-stone-700 px-3 font-sans text-xs font-semibold text-stone-300 transition hover:border-amber-400/40 hover:text-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
        >
          Full profile
        </a>
      </div>
    </article>
  );
}

function EmptyState({ children }) {
  return <div className={`${cardClass} py-12 text-center font-sans text-sm text-stone-400`}>{children}</div>;
}

export default function CommunityPortal() {
  const params = new URLSearchParams(window.location.search);
  const requestedSection = params.get('section');
  const section = SECTIONS.some(item => item.id === requestedSection) ? requestedSection : 'general';
  const activeSection = SECTIONS.find(item => item.id === section);
  const Icon = activeSection.icon;
  const latestNotice = [...NOTICES].sort((a, b) => b.date.localeCompare(a.date))[0];
  const featuredProject = PROJECTS.find(project => project.status === 'active') || PROJECTS[0];
  const latestUpdateDate = getLatestUpdateDate();

  React.useEffect(() => {
    document.title = `${activeSection.label} | Kingdom Hierarchy`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = section === 'general'
      ? 'Official notices, build plans, the Constitution, and public profiles of Imperius.'
      : `${activeSection.label} and public member profiles for the Kingdom Hierarchy.`;
  }, [activeSection.label]);

  return (
    <div className="min-h-screen bg-[#0b0d0b] pb-16 font-serif text-stone-200 selection:bg-amber-900/70 selection:text-amber-50">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(120,83,34,0.13),_transparent_55%)]" />
      <a href="#community-main" className="sr-only z-[100] rounded-lg bg-amber-300 px-4 py-3 font-sans font-bold text-stone-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to community content
      </a>
      <div className="relative mx-auto max-w-6xl px-3 py-5 sm:px-4 md:px-8 md:py-10">
        <header className="relative mb-6 overflow-hidden rounded-2xl border border-amber-900/40 bg-gradient-to-br from-[#211d13] via-[#171812] to-[#10110f] p-5 shadow-2xl sm:p-7 md:p-9">
          <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 text-amber-100/[0.035]"><Crown size={230} strokeWidth={0.7} /></div>
          <a href={APP_BASE} className="relative inline-flex min-h-10 items-center gap-2 font-sans text-xs font-semibold text-stone-400 transition hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70">
            <ArrowLeft aria-hidden="true" size={15} /> Realm roster
          </a>
          <div className="relative mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-amber-400">The official halls of Imperius</p>
              <h1 className="mt-2 text-4xl font-black uppercase tracking-[0.07em] text-stone-100 sm:text-5xl md:text-6xl">Realm Hall</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-300 sm:text-base">By crown, council, and the hands of its citizens, Imperius builds its future. Find royal notices, works in progress, the laws of the realm, and the people who make it home.</p>
              <p className="mt-3 font-serif text-sm italic text-amber-200/80">One realm. Many hands. A legacy still being written.</p>
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-stone-700/80 bg-black/25 px-4 py-3">
              <CalendarDays aria-hidden="true" className="shrink-0 text-amber-300" size={18} />
              <div>
                <p className="font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-stone-500">Realm records updated</p>
                <time className="mt-0.5 block text-sm font-bold text-stone-100" dateTime={latestUpdateDate}>{formatDate(latestUpdateDate)}</time>
              </div>
            </div>
          </div>
        </header>

        <nav aria-label="Community pages" className="mb-7 -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 font-sans">
          {SECTIONS.map(({ id, label, icon: SectionIcon }) => (
            <a key={id} href={sectionUrl(id)} aria-current={section === id ? 'page' : undefined} className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${section === id ? 'border-amber-400/35 bg-amber-400/[0.1] text-amber-100' : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:border-stone-600 hover:text-stone-200'}`}>
              <SectionIcon aria-hidden="true" size={14} />{label}
            </a>
          ))}
        </nav>

        <main
          id="community-main"
          aria-label={section === 'general' ? 'Realm Hall overview' : undefined}
          aria-labelledby={section !== 'general' ? 'community-section-title' : undefined}
        >
          {section === 'general' && (
            <div className="space-y-6">
              <section aria-labelledby="realm-update-title" className="grid gap-3 md:grid-cols-3">
                <article className={`${cardClass} relative overflow-hidden border-amber-900/30 md:col-span-2`}>
                  <div aria-hidden="true" className="absolute right-4 top-4 text-amber-200/10"><Sparkles size={42} /></div>
                  <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Latest royal notice</p>
                  {latestNotice ? (
                    <>
                      <h2 id="realm-update-title" className="mt-2 pr-10 text-xl font-black text-stone-100 sm:text-2xl">{latestNotice.title}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-300">{latestNotice.body}</p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <time className="font-sans text-[10px] text-stone-500" dateTime={latestNotice.date}>{formatDate(latestNotice.date)}</time>
                        <a href={sectionUrl('notices')} className={`${actionClass} border-amber-500/30 bg-amber-400/[0.08] text-amber-100 hover:border-amber-400/60`}>All notices <ArrowRight aria-hidden="true" size={14} /></a>
                      </div>
                    </>
                  ) : <p id="realm-update-title" className="mt-2 text-sm text-stone-400">No royal notices have been posted yet.</p>}
                </article>
                <article className={`${cardClass} flex flex-col justify-between`}>
                  <div>
                    <span className="inline-flex rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-2 text-amber-300"><Users aria-hidden="true" size={17} /></span>
                    <p className="mt-4 font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">The realm</p>
                    <p className="mt-1 text-3xl font-black text-stone-100">{MEMBERS.length} <span className="text-lg text-stone-400">members</span></p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-400">A kingdom made stronger by every citizen and every shared ambition.</p>
                  </div>
                  <a href={sectionUrl('profiles')} className={`${actionClass} mt-5 w-full border-stone-700 text-stone-200 hover:border-amber-400/40 hover:text-amber-100`}>Meet the people <ArrowRight aria-hidden="true" size={14} /></a>
                </article>
              </section>

              <section aria-label="Realm highlights" className="grid gap-3 sm:grid-cols-2">
                <article className={`${cardClass} flex flex-col`}>
                  <div className="flex items-center gap-2 text-amber-300"><Hammer aria-hidden="true" size={17} /><p className="font-sans text-[10px] font-bold uppercase tracking-[0.18em]">On the drawing board</p></div>
                  {featuredProject ? (
                    <>
                      <h2 className="mt-3 text-lg font-bold text-stone-100">{featuredProject.title}</h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-400">{featuredProject.description}</p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="rounded-full border border-stone-700 px-2.5 py-1 font-sans text-[10px] capitalize text-stone-300">{featuredProject.status === 'active' ? 'In progress' : featuredProject.status}</span>
                        <a href={sectionUrl('projects')} className="inline-flex min-h-10 items-center gap-1 font-sans text-xs font-bold text-amber-200 hover:text-amber-100">See all plans <ArrowRight aria-hidden="true" size={14} /></a>
                      </div>
                    </>
                  ) : <p className="mt-3 text-sm text-stone-400">New works will be announced here.</p>}
                </article>
                <article className={`${cardClass} flex flex-col`}>
                  <div className="flex items-center gap-2 text-amber-300"><Landmark aria-hidden="true" size={17} /><p className="font-sans text-[10px] font-bold uppercase tracking-[0.18em]">The law of the land</p></div>
                  <h2 className="mt-3 text-lg font-bold text-stone-100">A realm guided by its Constitution</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-400">Explore the departments, powers, laws, and traditions that shape life in Imperius.</p>
                  <a href={sectionUrl('constitution')} className="mt-4 inline-flex min-h-10 items-center gap-1 self-start font-sans text-xs font-bold text-amber-200 hover:text-amber-100">Read the Constitution <ArrowRight aria-hidden="true" size={14} /></a>
                </article>
              </section>
            </div>
          )}

          {section !== 'general' && (
            <div className="mb-4 flex items-center gap-2">
              <Icon aria-hidden="true" className="text-amber-300" size={17} />
              <h2 id="community-section-title" className="text-lg font-bold text-stone-100">{activeSection.label}</h2>
            </div>
          )}

          {section === 'notices' && (NOTICES.length === 0 ? (
            <EmptyState>No notices have been posted yet.</EmptyState>
          ) : (
            <div className="grid gap-3">
              {NOTICES.map(notice => (
                <article key={notice.id} className={`${cardClass} relative overflow-hidden ${notice.featured ? 'border-amber-700/40 bg-gradient-to-br from-amber-950/30 via-stone-900/80 to-black/20' : ''}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/[0.07] px-2 py-1 font-sans text-[9px] font-bold uppercase tracking-[0.12em] text-amber-300"><Sparkles aria-hidden="true" size={11} /> {notice.category || 'Royal notice'}</span>
                      <h3 className="mt-2 text-lg font-bold text-amber-100">{notice.title}</h3>
                    </div>
                    <time className="shrink-0 font-sans text-[10px] text-stone-500" dateTime={notice.date}>{formatDate(notice.date)}</time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-300">{notice.body}</p>
                </article>
              ))}
            </div>
          ))}

          {section === 'projects' && (PROJECTS.length === 0 ? (
            <EmptyState>No build projects have been posted yet.</EmptyState>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {PROJECTS.map(project => (
                <article key={project.id} className={`${cardClass} flex flex-col`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-sans text-[9px] font-bold uppercase tracking-[0.17em] text-amber-500/80">Realm project</p>
                      <h3 className="mt-1 text-base font-bold text-amber-100">{project.title}</h3>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold capitalize ${project.status === 'active' ? 'border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-200' : project.status === 'completed' ? 'border-sky-500/30 bg-sky-500/[0.07] text-sky-200' : 'border-stone-700 text-stone-300'}`}>{project.status === 'active' ? 'In progress' : project.status}</span>
                  </div>
                  <p className="mt-3 flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-300">{project.description}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-800">
                      <div className={`h-full rounded-full ${project.status === 'completed' ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-600 to-amber-300'}`} style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className="font-sans text-xs tabular-nums text-stone-400">{project.progress}%</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-stone-800 pt-3">
                    <span className="font-sans text-[10px] text-stone-500">A future chapter of Imperius</span>
                    {project.updatedAt && <time className="font-sans text-[10px] text-stone-500" dateTime={project.updatedAt}>Updated {formatDate(project.updatedAt)}</time>}
                  </div>
                </article>
              ))}
            </div>
          ))}

          {section === 'constitution' && (
            <div className="space-y-5">
              <section aria-labelledby="constitution-title" className={cardClass}>
                <h3 id="constitution-title" className="text-xl font-black uppercase tracking-wide text-stone-100">Constitution of Imperius</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-400">{CONSTITUTION.preamble}</p>
              </section>
              <section aria-labelledby="currency-title" className={cardClass}>
                <h3 id="currency-title" className="text-base font-bold text-amber-100">Kingdom Currency</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-400">The kingdom's listed item values, from everyday trade to treasures fit for a throne.</p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-left font-sans text-sm">
                    <thead>
                      <tr className="border-b border-stone-700 text-[10px] uppercase tracking-wider text-stone-500">
                        <th scope="col" className="px-3 py-2">Item</th>
                        <th scope="col" className="px-3 py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CONSTITUTION.currency.map(({ item, value }) => (
                        <tr key={item} className="border-b border-stone-800 last:border-0">
                          <th scope="row" className="px-3 py-2.5 font-medium text-stone-200">{item}</th>
                          <td className="px-3 py-2.5 tabular-nums text-amber-200">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <nav aria-label="Constitution sections" className={`${cardClass} flex flex-wrap gap-2`}>
                <a href="#currency-title" className={`${actionClass} min-h-9 border-stone-700 px-3 text-[10px] text-stone-300 hover:border-amber-400/40 hover:text-amber-100`}>Currency</a>
                {CONSTITUTION.laws.map(({ id, title }) => (
                  <a
                    key={id}
                    href={`#law-${id}`}
                    onClick={() => {
                      const section = document.getElementById(`law-${id}`);
                      if (section instanceof HTMLDetailsElement) section.open = true;
                    }}
                    className={`${actionClass} min-h-9 border-stone-700 px-3 text-[10px] text-stone-300 hover:border-amber-400/40 hover:text-amber-100`}
                  >
                    {title}
                  </a>
                ))}
              </nav>
              <div className="space-y-3">
                {CONSTITUTION.laws.map(({ id, title, rules }, index) => (
                  <details key={id} id={`law-${id}`} className={`${cardClass} group scroll-mt-4 open:border-amber-900/40`}>
                    <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-left marker:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 [&::-webkit-details-marker]:hidden">
                      <span>
                        <span className="block font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-amber-500/80">Article {String(index + 1).padStart(2, '0')}</span>
                        <h3 className="mt-1 text-base font-bold text-amber-100">{title}</h3>
                      </span>
                      <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-700 text-lg text-amber-300 transition group-open:rotate-45">+</span>
                    </summary>
                    <ul className="mt-4 list-disc space-y-3 border-t border-stone-800 pt-4 pl-5 text-sm leading-relaxed text-stone-300 marker:text-amber-500 sm:pl-6">
                      {rules.map((rule, index) => <li key={`${id}-${index}`}>{rule}</li>)}
                    </ul>
                  </details>
                ))}
              </div>
            </div>
          )}

          {section === 'profiles' && (
            <>
              <p className="mb-4 font-sans text-xs leading-relaxed text-stone-500">Public roster profiles are read-only. Select a member to open their full roster profile.</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {MEMBERS.map(member => <MemberProfileCard key={member.id} member={member} />)}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
