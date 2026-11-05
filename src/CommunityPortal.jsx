import React from 'react';
import { ArrowLeft, Bell, BookOpen, Crown, Users } from 'lucide-react';
import MEMBERS from './data/members.json';
import NOTICES from './data/notices.json';
import PROJECTS from './data/buildProjects.json';
import CONSTITUTION from './data/constitution.json';
import ROLE_CONFIG from './roleConfig.js';
import { getVotingPowerBreakdown } from './rosterUtils.js';

const SECTIONS = [
  { id: 'notices', label: 'Notices', icon: Bell },
  { id: 'projects', label: 'Build projects', icon: BookOpen },
  { id: 'constitution', label: 'Constitution', icon: BookOpen },
  { id: 'profiles', label: 'Profiles', icon: Users },
];

const cardClass = 'rounded-xl border border-stone-800 bg-gradient-to-br from-stone-900/80 to-black/20 p-4';

function sectionUrl(section) {
  return `/?page=community&section=${encodeURIComponent(section)}`;
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
          href={`/?member=${encodeURIComponent(member.id)}`}
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
  const section = SECTIONS.some(item => item.id === requestedSection) ? requestedSection : 'notices';
  const activeSection = SECTIONS.find(item => item.id === section);
  const Icon = activeSection.icon;

  React.useEffect(() => {
    document.title = `${activeSection.label} | Kingdom Hierarchy`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = `${activeSection.label} and public member profiles for the Kingdom Hierarchy.`;
  }, [activeSection.label]);

  return (
    <div className="min-h-screen bg-[#0b0d0b] pb-16 font-serif text-stone-200 selection:bg-amber-900/70 selection:text-amber-50">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(120,83,34,0.13),_transparent_55%)]" />
      <div className="relative mx-auto max-w-5xl px-3 py-6 sm:px-4 md:px-8 md:py-10">
        <header className="mb-6 rounded-2xl border border-stone-800 bg-gradient-to-br from-stone-900 via-[#171812] to-[#11120f] p-5 shadow-2xl sm:p-7">
          <a href="/" className="inline-flex min-h-10 items-center gap-2 font-sans text-xs font-semibold text-stone-400 transition hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70">
            <ArrowLeft aria-hidden="true" size={15} /> Realm roster
          </a>
          <p className="mt-5 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">Kingdom community</p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-wide text-stone-100 sm:text-4xl">Realm Hall</h1>
          <p className="mt-2 max-w-xl text-sm text-stone-400">Royal notices, realm building projects, and the people behind the kingdom.</p>
        </header>

        <nav aria-label="Community pages" className="mb-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 font-sans">
          {SECTIONS.map(({ id, label, icon: SectionIcon }) => (
            <a key={id} href={sectionUrl(id)} aria-current={section === id ? 'page' : undefined} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${section === id ? 'border-amber-400/35 bg-amber-400/[0.1] text-amber-100' : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:border-stone-600 hover:text-stone-200'}`}>
              <SectionIcon aria-hidden="true" size={14} />{label}
            </a>
          ))}
        </nav>

        <main aria-labelledby="community-section-title">
          <div className="mb-4 flex items-center gap-2">
            <Icon aria-hidden="true" className="text-amber-300" size={17} />
            <h2 id="community-section-title" className="text-lg font-bold text-stone-100">{activeSection.label}</h2>
          </div>

          {section === 'notices' && (NOTICES.length === 0 ? (
            <EmptyState>No notices have been posted yet.</EmptyState>
          ) : (
            <div className="grid gap-3">
              {NOTICES.map(notice => (
                <article key={notice.id} className={cardClass}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-amber-100">{notice.title}</h3>
                    <time className="font-sans text-[10px] text-stone-500" dateTime={notice.date}>
                      {new Date(`${notice.date}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-300">{notice.body}</p>
                </article>
              ))}
            </div>
          ))}

          {section === 'projects' && (PROJECTS.length === 0 ? (
            <EmptyState>No build projects have been posted yet.</EmptyState>
          ) : (
            <div className="grid gap-3">
              {PROJECTS.map(project => (
                <article key={project.id} className={cardClass}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-amber-100">{project.title}</h3>
                    <span className="rounded-full border border-stone-700 px-2 py-1 font-sans text-[10px] capitalize text-stone-300">{project.status === 'active' ? 'In progress' : project.status}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-300">{project.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-800">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className="font-sans text-xs tabular-nums text-stone-400">{project.progress}%</span>
                  </div>
                  {project.updatedAt && <time className="mt-3 block font-sans text-[10px] text-stone-500" dateTime={project.updatedAt}>Updated {new Date(`${project.updatedAt}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' })}</time>}
                </article>
              ))}
            </div>
          ))}

          {section === 'constitution' && (
            <div className="space-y-5">
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
              {CONSTITUTION.laws.map(({ id, title, rules }) => (
                <section key={id} aria-labelledby={`law-${id}`} className={cardClass}>
                  <h3 id={`law-${id}`} className="text-base font-bold text-amber-100">{title}</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-300 marker:text-amber-500">
                    {rules.map((rule, index) => <li key={`${id}-${index}`}>{rule}</li>)}
                  </ul>
                </section>
              ))}
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
