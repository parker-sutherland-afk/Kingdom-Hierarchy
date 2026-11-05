import React, { useEffect, useRef, useState } from 'react';
import { Crown, Pickaxe, Info, Search, Users, Scale, X, Copy, Check, ChevronDown, SlidersHorizontal, Link2, RefreshCw, Printer, User, LayoutGrid, Rows3, BookOpen, Network, MessageSquare } from 'lucide-react';
import MEMBERS from './data/members.json';
import ROSTER_METADATA from './data/rosterMetadata.json';
import ROLE_CONFIG, { ROLE_NAMES } from './roleConfig.js';
import { describeVotingPower, filterMembers, getRosterSectionRank, getVotingPowerBreakdown, matchesMemberFilter, sortByName, sortByVotingPower, splitSearchHighlights } from './rosterUtils.js';
import { createRosterUrl, readRosterUrl } from './rosterUrl.js';
import { getMinecraftAvatarSources } from './avatarSources.js';

const RANK_TITLES = { 1: "KING", 2: "HIGH COUNCIL", 3: "COUNCIL", 4: "PRINCE", 5: "CITIZENS" };
const APP_BASE = import.meta.env.BASE_URL;
const RANK_ACCENTS = {
  1: 'text-blue-200 border-blue-400/25 bg-blue-400/[0.07]',
  2: 'text-stone-200 border-stone-400/25 bg-stone-400/[0.05]',
  3: 'text-purple-200 border-purple-400/25 bg-purple-400/[0.06]',
  4: 'text-slate-200 border-slate-300/25 bg-slate-300/[0.05]',
  5: 'text-stone-300 border-stone-600/50 bg-stone-800/60',
};

function updateMemberUrl(memberId, method, viewState) {
  const url = createRosterUrl(window.location.href, {
    ...viewState,
    selectedMember: memberId === null ? null : { id: memberId },
  });
  const nextState = { ...(window.history.state ?? {}) };
  if (memberId === null) delete nextState.memberProfileId;
  else nextState.memberProfileId = memberId;
  window.history[`${method}State`](nextState, '', url);
}

function HighlightedText({ text, query }) {
  return splitSearchHighlights(text, query).map((part, index) => (
    part.matched
      ? <mark key={index} className="rounded-sm bg-amber-300/20 px-0.5 text-amber-100">{part.text}</mark>
      : <React.Fragment key={index}>{part.text}</React.Fragment>
  ));
}

function MemberAvatar({ member, config, avatarMode, showRetry = true, sizeClass = 'h-12 w-12' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [providerIndex, setProviderIndex] = useState(0);
  const avatarSources = getMinecraftAvatarSources(member.mcName, retryCount);
  const currentSource = avatarSources[providerIndex];
  const nameParts = member.name.trim().split(/\s+/);
  const initials = (nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
    : nameParts[0].slice(0, 2)
  ).toUpperCase();

  useEffect(() => {
    setImageFailed(false);
    setRetryCount(0);
    setProviderIndex(0);
  }, [member.mcName, avatarMode]);

  return (
    <div role="group" aria-label={`${member.name}'s Minecraft avatar`} className={`relative shrink-0 ${sizeClass}`}>
      <div className={`flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-stone-700 bg-stone-950 font-sans text-sm font-bold shadow-md transition duration-300 group-hover:scale-105 motion-reduce:transition-none ${config?.color} ${config?.accent}`}>
        {avatarMode === 'local' || imageFailed || !member.mcName ? (
          <span aria-hidden="true">{initials}</span>
        ) : (
          <img
            key={`${currentSource.src}`}
            src={currentSource.src}
            alt={`${member.name}'s Minecraft skin`}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => {
              if (providerIndex < avatarSources.length - 1) {
                setProviderIndex(providerIndex + 1);
              } else {
                setImageFailed(true);
              }
            }}
          />
        )}
      </div>
      {showRetry && imageFailed && member.mcName && avatarMode === 'minecraft' && (
        <button
          type="button"
          aria-label={`Retry loading ${member.name}'s avatar`}
          title="Retry avatar"
          onClick={() => {
            setImageFailed(false);
            setRetryCount(count => count + 1);
            setProviderIndex(0);
          }}
          className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-stone-600 bg-stone-900 text-amber-300 shadow-lg transition hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 print:hidden"
        >
          <RefreshCw aria-hidden="true" size={12} />
        </button>
      )}
    </div>
  );
}

function ThemedDropdown({ id, label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [opensUpward, setOpensUpward] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const focusIndex = useRef(null);
  const typeahead = useRef({ query: '', time: 0 });
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const updatePlacement = () => {
      const bounds = triggerRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const estimatedMenuHeight = Math.min(320, options.length * 40 + 12);
      const spaceAbove = bounds.top;
      const spaceBelow = window.innerHeight - bounds.bottom;
      setOpensUpward(
        spaceBelow < Math.min(estimatedMenuHeight, window.innerHeight * 0.5) &&
        spaceAbove > spaceBelow
      );
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    updatePlacement();
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;
    const index = focusIndex.current ?? selectedIndex;
    optionRefs.current[index]?.focus();
    focusIndex.current = null;
  }, [open, selectedIndex]);

  function closeAndRestoreFocus() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function findTypeaheadMatch(key, currentIndex = selectedIndex) {
    const now = Date.now();
    const previousQuery = now - typeahead.current.time < 700 ? typeahead.current.query : '';
    const query = previousQuery + key.toLocaleLowerCase();
    typeahead.current = { query, time: now };
    const startIndex = Math.max(0, currentIndex + 1);
    const orderedIndexes = [
      ...options.map((_, index) => (startIndex + index) % options.length),
    ];
    const matchingIndex = orderedIndexes.find(index =>
      options[index].label.toLocaleLowerCase().startsWith(query)
    );

    if (matchingIndex !== undefined) return matchingIndex;
    typeahead.current = { query: key.toLocaleLowerCase(), time: now };
    return options.findIndex(option =>
      option.label.toLocaleLowerCase().startsWith(typeahead.current.query)
    );
  }

  function handleTriggerKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusIndex.current = event.key === 'ArrowUp' ? options.length - 1 : selectedIndex;
      setOpen(true);
    } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const match = findTypeaheadMatch(event.key, selectedIndex - 1);
      if (match >= 0) {
        event.preventDefault();
        focusIndex.current = match;
        setOpen(true);
      }
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      closeAndRestoreFocus();
    }
  }

  function handleOptionKeyDown(event, index) {
    let nextIndex = index;
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % options.length;
    else if (event.key === 'ArrowUp') nextIndex = (index - 1 + options.length) % options.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = options.length - 1;
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      chooseOption(options[index]);
      return;
    } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const match = findTypeaheadMatch(event.key, index);
      if (match >= 0) {
        event.preventDefault();
        optionRefs.current[match]?.focus();
      }
      return;
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeAndRestoreFocus();
      return;
    } else if (event.key === 'Tab') {
      setOpen(false);
      return;
    } else {
      return;
    }

    event.preventDefault();
    optionRefs.current[nextIndex]?.focus();
  }

  function chooseOption(option) {
    onChange(option.value);
    closeAndRestoreFocus();
  }

  return (
    <div
      ref={rootRef}
      className={`relative ${open ? 'z-30' : ''}`}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        id={`${id}-trigger`}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        onClick={() => {
          focusIndex.current = selectedIndex;
          setOpen(current => !current);
        }}
        onKeyDown={handleTriggerKeyDown}
        className={`flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-black/30 px-3 text-left font-sans text-xs transition focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
          open
            ? 'border-amber-400/50 text-amber-100'
            : 'border-stone-700/90 text-stone-200 hover:border-stone-600'
        }`}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown aria-hidden="true" size={15} className={`shrink-0 text-amber-500/70 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          id={`${id}-options`}
          role="listbox"
          aria-label={label}
          className={`absolute left-0 right-0 z-50 max-h-[min(20rem,50vh)] overflow-y-auto rounded-xl border border-stone-700 bg-[#151610] p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.65)] ring-1 ring-amber-400/10 ${
            opensUpward ? 'bottom-[calc(100%+0.5rem)]' : 'top-[calc(100%+0.5rem)]'
          }`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                ref={element => { optionRefs.current[index] = element; }}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => chooseOption(option)}
                onKeyDown={event => handleOptionKeyDown(event, index)}
                className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left font-sans text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
                  isSelected
                    ? 'bg-amber-400/[0.12] text-amber-100'
                    : 'text-stone-300 hover:bg-stone-800/80 hover:text-stone-100'
                }`}
              >
                <span className="min-w-0 break-words">{option.label}</span>
                {isSelected && <Check aria-hidden="true" size={14} className="shrink-0 text-amber-300" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function KingdomHierarchy() {
  const initialUrlState = useRef(null);
  if (!initialUrlState.current) {
    initialUrlState.current = readRosterUrl(window.location.search, MEMBERS, ROLE_NAMES);
  }
  const [searchQuery, setSearchQuery] = useState(initialUrlState.current.searchQuery);
  const [activeFilter, setActiveFilter] = useState(initialUrlState.current.activeFilter);
  const [sortMode, setSortMode] = useState(initialUrlState.current.sortMode);
  const [viewMode, setViewMode] = useState(initialUrlState.current.viewMode);
  const [layoutMode, setLayoutMode] = useState(initialUrlState.current.layoutMode);
  const [avatarMode, setAvatarMode] = useState('minecraft');
  const [selectedRole, setSelectedRole] = useState(initialUrlState.current.selectedRole);
  const [copiedUsername, setCopiedUsername] = useState('');
  const [copyFailed, setCopyFailed] = useState(false);
  const [profileLinkStatus, setProfileLinkStatus] = useState('');
  const [viewLinkStatus, setViewLinkStatus] = useState('');
  const [selectedMember, setSelectedMember] = useState(initialUrlState.current.selectedMember);
  const profileDialogRef = useRef(null);
  const searchInputRef = useRef(null);
  const restoringHistoryRef = useRef(false);
  const members = MEMBERS;
  const actingLeaders = ROSTER_METADATA.kingAway
    ? members.filter(member => member.role === 'Advisor')
    : [];
  const actingLeaderIds = new Set(actingLeaders.map(member => member.id));

  useEffect(() => {
    const handlePopState = () => {
      const state = readRosterUrl(window.location.search, members, ROLE_NAMES);
      restoringHistoryRef.current = true;
      setSearchQuery(state.searchQuery);
      setActiveFilter(state.activeFilter);
      setSortMode(state.sortMode);
      setViewMode(state.viewMode);
      setLayoutMode(state.layoutMode);
      setSelectedRole(state.selectedRole);
      setProfileLinkStatus('');
      setViewLinkStatus('');
      setSelectedMember(state.selectedMember);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [members]);

  useEffect(() => {
    if (restoringHistoryRef.current) {
      restoringHistoryRef.current = false;
      return;
    }

    const url = createRosterUrl(window.location.href, {
      searchQuery,
      activeFilter,
      sortMode,
      viewMode,
      layoutMode,
      selectedRole,
      selectedMember,
    });
    const nextState = { ...(window.history.state ?? {}) };
    if (selectedMember) nextState.memberProfileId = selectedMember.id;
    else delete nextState.memberProfileId;
    window.history.replaceState(nextState, '', url);
  }, [searchQuery, activeFilter, sortMode, viewMode, layoutMode, selectedRole, selectedMember]);

  useEffect(() => {
    function handleSearchShortcut(event) {
      if (event.key !== '/' || event.altKey || event.ctrlKey || event.metaKey) return;
      if (profileDialogRef.current?.open) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      ) return;

      event.preventDefault();
      searchInputRef.current?.focus();
    }

    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  useEffect(() => {
    const dialog = profileDialogRef.current;
    if (!dialog) return;

    if (selectedMember && !dialog.open) {
      dialog.showModal();
    } else if (!selectedMember && dialog.open) {
      dialog.close();
    }
  }, [selectedMember]);

  useEffect(() => {
    const description = document.querySelector('meta[name="description"]');
    document.title = selectedMember
      ? `${selectedMember.name} | Kingdom Hierarchy`
      : 'Kingdom Hierarchy';

    if (description) {
      description.content = selectedMember
        ? `${selectedMember.name} is listed as ${selectedMember.role} in the Kingdom Hierarchy roster.`
        : 'Explore the members, roles, and voting power of the kingdom.';
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

  function openMemberProfile(member) {
    if (selectedMember?.id === member.id) return;
    updateMemberUrl(member.id, 'push', {
      searchQuery,
      activeFilter,
      sortMode,
      viewMode,
      layoutMode,
      selectedRole,
    });
    setProfileLinkStatus('');
    setSelectedMember(member);
  }

  function closeMemberProfile() {
    profileDialogRef.current?.close();
  }

  function handleProfileDialogClose() {
    if (new URLSearchParams(window.location.search).has('member')) {
      updateMemberUrl(null, 'replace', {
        searchQuery,
        activeFilter,
        sortMode,
        viewMode,
        layoutMode,
        selectedRole,
      });
    }
    setSelectedMember(null);
  }

  async function copyMemberProfileLink() {
    const url = createRosterUrl(window.location.href, {
      searchQuery,
      activeFilter,
      sortMode,
      viewMode,
      layoutMode,
      selectedRole,
      selectedMember,
    });

    try {
      await navigator.clipboard.writeText(url.href);
      setProfileLinkStatus('Profile link copied.');
    } catch (error) {
      setProfileLinkStatus(
        `Could not copy the profile link: ${error instanceof Error ? error.message : 'clipboard access is unavailable.'}`
      );
    }
  }

  async function copyViewLink() {
    const url = createRosterUrl(window.location.href, {
      searchQuery,
      activeFilter,
      sortMode,
      viewMode,
      layoutMode,
      selectedRole,
      selectedMember: null,
    }, { includeMember: false });

    try {
      await navigator.clipboard.writeText(url.href);
      setViewLinkStatus('Filtered view link copied.');
    } catch (error) {
      setViewLinkStatus(
        `Could not copy the view link: ${error instanceof Error ? error.message : 'clipboard access is unavailable.'}`
      );
    }
  }

  function filterByRole(role) {
    setSelectedRole(role);
    setActiveFilter('All');
  }

  const filteredMembers = filterMembers(members, searchQuery, activeFilter, selectedRole);
  const normalizedQuery = searchQuery.trim();
  const lastUpdatedDate = new Date(`${ROSTER_METADATA.lastUpdated}T00:00:00Z`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const totalSouls = members.length;
  const highCouncilCount = members.filter(member => matchesMemberFilter(member, 'High Council')).length;
  const councilCount = members.filter(member => matchesMemberFilter(member, 'Council')).length;
  const totalVotingPower = members.reduce(
    (total, member) => total + getVotingPowerBreakdown(member, ROLE_CONFIG).points,
    0
  );
  const displayMembers = sortMode === 'power'
    ? sortByVotingPower(filteredMembers, ROLE_CONFIG)
    : sortMode === 'name'
      ? sortByName(filteredMembers)
      : filteredMembers;
  const rankSections = sortMode === 'rank'
    ? [1, 2, 3, 4, 5].map(rank => ({
      key: rank,
      title: RANK_TITLES[rank],
      members: filteredMembers.filter(member => getRosterSectionRank(member, ROLE_CONFIG) === rank),
    })).filter(section => section.members.length > 0)
    : [{
      key: sortMode,
      title: sortMode === 'power' ? 'VOTING POWER' : 'A–Z',
      members: displayMembers,
    }];
  const hierarchySections = [1, 2, 3, 4, 5].map(rank => ({
    key: rank,
    title: RANK_TITLES[rank],
    members: filteredMembers.filter(member => getRosterSectionRank(member, ROLE_CONFIG) === rank),
  })).filter(section => section.members.length > 0).map(section => ({
    ...section,
    members: sortMode === 'power'
      ? sortByVotingPower(section.members, ROLE_CONFIG)
      : sortMode === 'name'
        ? sortByName(section.members)
        : section.members,
  }));

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
      <a href="#member-roster" className="sr-only z-[100] rounded-lg bg-amber-300 px-4 py-3 font-sans font-bold text-stone-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to member roster
      </a>
      <div className="relative mx-auto max-w-6xl px-3 py-6 sm:px-4 md:px-8 md:py-12">
        <header className="mb-10">
          <div className="relative overflow-hidden rounded-2xl border border-stone-800 bg-gradient-to-br from-stone-900 via-[#171812] to-[#11120f] px-4 py-6 shadow-2xl sm:px-6 sm:py-8 md:px-10 md:py-10">
            <div className="absolute -right-10 -top-14 text-amber-100/[0.035]"><Crown size={260} strokeWidth={0.7} /></div>
            <div className="relative">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-700/30 bg-amber-950/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Realm records
                </div>
                <a href={`${APP_BASE}?page=community&section=general`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-400/[0.09] px-4 font-sans text-xs font-bold text-amber-100 shadow-sm shadow-amber-950/30 transition hover:border-amber-300/70 hover:bg-amber-400/[0.16] hover:text-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70">
                  <MessageSquare aria-hidden="true" size={14} /> Community
                </a>
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
              <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Realm members', value: totalSouls, icon: Users, color: 'text-stone-300' },
                  { label: 'Council members', value: councilCount, icon: Pickaxe, color: 'text-purple-300' },
                  { label: 'Voting power', value: `${totalVotingPower} pts`, icon: Scale, color: 'text-sky-300' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="group/metric min-w-0 rounded-lg border border-stone-800/80 bg-black/15 px-2.5 py-3 sm:flex sm:items-center sm:gap-3 sm:px-4">
                    <Icon aria-hidden="true" size={15} className={`mb-1.5 sm:mb-0 ${color}`} />
                    <div className="min-w-0">
                      <div className="truncate font-sans text-[8px] font-bold uppercase tracking-[0.12em] text-stone-500 sm:text-[10px] sm:tracking-[0.18em]">{label}</div>
                      <div className="mt-0.5 truncate text-lg font-black text-stone-100 sm:text-xl">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
              {ROSTER_METADATA.kingAway && (
                <section
                  aria-label="Leadership status"
                  role="status"
                  className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3"
                >
                  <p className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-amber-200">
                    King away
                  </p>
                  <p className="mt-1 text-sm text-stone-200">
                    Acting leadership: {actingLeaders.map(member => member.name).join(' and ')}.
                  </p>
                  <p className="mt-1 font-sans text-xs text-stone-400">
                    Their permanent roles and voting points are unchanged.
                  </p>
                </section>
              )}
            </div>
          </div>

          <section aria-labelledby="roster-controls-title" className="group/controls relative mt-6 rounded-2xl border border-stone-800 bg-gradient-to-br from-[#1a1914] via-[#131410] to-[#10110f] shadow-xl shadow-black/20">
            <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
            <div className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl border border-amber-400/20 bg-amber-400/[0.07] p-2.5 text-amber-300">
                    <SlidersHorizontal size={17} />
                  </span>
                  <div>
                    <h2 id="roster-controls-title" className="text-sm font-bold text-stone-100">Find a member</h2>
                    <p className="mt-0.5 font-sans text-[11px] text-stone-500">Search, filter, or arrange the realm roster.</p>
                  </div>
                </div>
                <div className="inline-flex w-fit items-center gap-1 rounded-lg border border-stone-700/80 bg-black/20 p-1 font-sans text-[10px]" role="group" aria-label="Roster display">
                  <button
                    type="button"
                    aria-pressed={layoutMode === 'roster'}
                    onClick={() => setLayoutMode('roster')}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${layoutMode === 'roster' ? 'bg-amber-400/15 text-amber-100' : 'text-stone-400 hover:text-stone-200'}`}
                  >
                    <Rows3 aria-hidden="true" size={13} /> Roster
                  </button>
                  <button
                    type="button"
                    aria-pressed={layoutMode === 'hierarchy'}
                    onClick={() => setLayoutMode('hierarchy')}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${layoutMode === 'hierarchy' ? 'bg-amber-400/15 text-amber-100' : 'text-stone-400 hover:text-stone-200'}`}
                  >
                    <Network aria-hidden="true" size={13} /> Hierarchy
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.85fr)_minmax(0,0.85fr)]">
                <div>
                  <label htmlFor="member-search" className="mb-1.5 flex items-center justify-between font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">
                    Search the roster
                    <span className="hidden items-center gap-1 font-medium normal-case tracking-normal text-stone-400 sm:inline-flex">
                      <kbd className="rounded border border-stone-700 bg-black/30 px-1.5 py-0.5 text-[9px]">/</kbd> to focus
                    </span>
                  </label>
                  <div className="relative">
                    <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/70" size={16} />
                    <input
                      ref={searchInputRef}
                      id="member-search"
                      type="search"
                      placeholder="Name, username, or role..."
                      aria-keyshortcuts="/"
                      aria-describedby="search-shortcut-hint"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="h-11 w-full rounded-xl border border-stone-700/90 bg-black/30 py-2.5 pl-10 pr-10 font-sans text-sm text-stone-100 placeholder:text-stone-600 transition placeholder:transition-colors hover:border-stone-600 hover:placeholder:text-stone-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/15"
                    />
                    <span id="search-shortcut-hint" className="sr-only">Press slash to focus search. The shortcut is ignored while typing in a text field.</span>
                    {searchQuery && (
                      <button type="button" aria-label="Clear search" onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-800 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="block min-w-0">
                  <span className="mb-1.5 block font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">Position</span>
                  <ThemedDropdown
                    id="role-filter"
                    label="Filter by exact role"
                    value={selectedRole}
                    onChange={setSelectedRole}
                    options={[
                      { value: '', label: 'All positions' },
                      ...ROLE_NAMES.map(role => ({ value: role, label: role })),
                    ]}
                  />
                </div>
                <div className="block min-w-0">
                  <span className="mb-1.5 block font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">Arrange by</span>
                  <ThemedDropdown
                    id="member-sort"
                    label="Sort members"
                    value={sortMode}
                    onChange={setSortMode}
                    options={[
                      { value: 'rank', label: 'Rank order' },
                      { value: 'name', label: 'Name (A–Z)' },
                      { value: 'power', label: 'Voting power' },
                    ]}
                  />
                </div>
              </div>
              <details className={`group/display mt-3 rounded-lg border border-stone-800/80 bg-black/15 font-sans text-xs ${layoutMode === 'hierarchy' ? 'hidden' : ''}`}>
                <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 px-3 py-2 text-stone-400 transition hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 [&::-webkit-details-marker]:hidden">
                  <SlidersHorizontal aria-hidden="true" size={13} className="text-stone-500" />
                  Display options
                  <span className="text-stone-600">· {viewMode === 'compact' ? 'Compact cards' : 'Comfortable cards'} · {avatarMode === 'minecraft' ? 'Minecraft avatars' : 'Initials'}</span>
                  <ChevronDown aria-hidden="true" size={14} className="ml-auto shrink-0 text-stone-500 transition-transform group-open/display:rotate-180 motion-reduce:transition-none" />
                </summary>
                <div className="flex flex-wrap gap-3 border-t border-stone-800/80 px-3 py-3">
                  <div className="inline-flex items-center gap-1 rounded-lg border border-stone-700/80 bg-black/20 p-1" role="group" aria-label="Card density">
                    <button
                      type="button"
                      aria-pressed={viewMode === 'comfortable'}
                      onClick={() => setViewMode('comfortable')}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${viewMode === 'comfortable' ? 'bg-amber-400/15 text-amber-100' : 'text-stone-400 hover:text-stone-200'}`}
                    >
                      <Rows3 aria-hidden="true" size={13} /> Comfortable
                    </button>
                    <button
                      type="button"
                      aria-pressed={viewMode === 'compact'}
                      onClick={() => setViewMode('compact')}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${viewMode === 'compact' ? 'bg-amber-400/15 text-amber-100' : 'text-stone-400 hover:text-stone-200'}`}
                    >
                      <LayoutGrid aria-hidden="true" size={13} /> Compact
                    </button>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-lg border border-stone-700/80 bg-black/20 p-1" role="group" aria-label="Avatar source">
                    <button
                      type="button"
                      aria-pressed={avatarMode === 'local'}
                      onClick={() => setAvatarMode('local')}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${avatarMode === 'local' ? 'bg-amber-400/15 text-amber-100' : 'text-stone-400 hover:text-stone-200'}`}
                    >
                      <User aria-hidden="true" size={13} /> Local
                    </button>
                    <button
                      type="button"
                      aria-pressed={avatarMode === 'minecraft'}
                      onClick={() => setAvatarMode('minecraft')}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${avatarMode === 'minecraft' ? 'bg-amber-400/15 text-amber-100' : 'text-stone-400 hover:text-stone-200'}`}
                    >
                      Minecraft
                    </button>
                  </div>
                </div>
              </details>
            </div>

            <div className="border-t border-stone-800/80 bg-black/15 px-4 py-3 sm:px-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400">Browse by group</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={copyViewLink}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-stone-700/80 bg-stone-900/60 px-3 font-sans text-[10px] font-semibold text-stone-300 transition hover:border-amber-500/40 hover:text-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
                  >
                    <Link2 aria-hidden="true" size={13} /> Share view
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-stone-700/80 bg-stone-900/60 px-3 font-sans text-[10px] font-semibold text-stone-300 transition hover:border-amber-500/40 hover:text-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
                  >
                    <Printer aria-hidden="true" size={13} /> Print roster
                  </button>
                  {(activeFilter !== 'All' || selectedRole || searchQuery || sortMode !== 'rank') && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setActiveFilter('All'); setSelectedRole(''); setSortMode('rank'); }}
                      className="min-h-10 px-2 font-sans text-[10px] font-semibold text-amber-400/80 transition hover:text-amber-200 focus:outline-none focus-visible:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible" role="group" aria-label="Filter member groups">
                {filterOptions.map(({ label, value, count }) => {
                  const isActive = activeFilter === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setActiveFilter(value)}
                      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 font-sans text-[11px] font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 motion-reduce:transition-none ${
                        isActive
                          ? 'border-amber-400/40 bg-gradient-to-b from-amber-300/[0.13] to-amber-500/[0.06] text-amber-100 shadow-[inset_0_1px_0_rgba(252,211,77,0.08)]'
                          : 'border-stone-700/70 bg-stone-900/45 text-stone-400 hover:border-amber-400/25 hover:bg-amber-400/[0.04] hover:text-stone-200'
                      }`}
                    >
                      {isActive && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.55)]" />}
                      {label}
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] tabular-nums ${isActive ? 'bg-amber-200/10 text-amber-200/80' : 'bg-black/25 text-stone-500'}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
          <div className="print-roster-summary hidden" data-testid="print-roster-summary">
            <h2>Kingdom Hierarchy — Roster</h2>
            <p>Showing {filteredMembers.length} of {totalSouls} members.</p>
            {normalizedQuery && <p>Search: “{searchQuery.trim()}”</p>}
            {activeFilter !== 'All' && <p>Group: {activeFilter}</p>}
            {selectedRole && <p>Role: {selectedRole}</p>}
            <p>Sorted by: {sortMode === 'rank' ? 'Rank order' : sortMode === 'name' ? 'Name (A–Z)' : 'Voting power'}</p>
            <p>Layout: {layoutMode === 'hierarchy' ? 'Hierarchy' : 'Roster'}</p>
            <p>View: {viewMode === 'compact' ? 'Compact' : 'Comfortable'}</p>
          </div>
          <p className="mt-3 px-1 text-xs text-stone-400" role="status" aria-live="polite">
            Showing <span className="font-semibold text-stone-300">{filteredMembers.length}</span> of {totalSouls} members
            {normalizedQuery && <> matching <span className="text-stone-300">“{searchQuery.trim()}”</span></>}
            {selectedRole && <> with role <span className="text-stone-300">{selectedRole}</span></>}
          </p>
          {(copiedUsername || copyFailed) && (
            <p className={`mt-1 px-1 text-xs ${copyFailed ? 'text-rose-300' : 'text-emerald-300'}`} role="status">
              {copyFailed ? 'Could not copy username. Check clipboard permissions and try again.' : `Copied ${copiedUsername} to clipboard.`}
            </p>
          )}
          {viewLinkStatus && (
            <p className={`mt-1 px-1 text-xs ${viewLinkStatus.startsWith('Could not') ? 'text-rose-300' : 'text-emerald-300'}`} role="status" aria-live="polite">
              {viewLinkStatus}
            </p>
          )}
        </header>

        <main id="member-roster" data-view-mode={viewMode} data-layout-mode={layoutMode} tabIndex={-1} aria-label="Kingdom member roster" className="scroll-mt-6 flex flex-col gap-10 focus:outline-none">
          {filteredMembers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-700 bg-stone-900/30 px-6 py-16 text-center font-sans">
              <Search className="mx-auto mb-4 text-stone-600" size={28} />
              <h2 className="text-lg font-semibold text-stone-200">No members found</h2>
              <p className="mt-2 text-sm text-stone-500">Try another search or clear the current filters.</p>
              <button type="button" onClick={() => { setSearchQuery(''); setActiveFilter('All'); setSelectedRole(''); }} className="mt-5 min-h-11 rounded-lg border border-stone-700 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-amber-600/60 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                Reset search and filters
              </button>
            </div>
          ) : layoutMode === 'hierarchy' ? (
            hierarchySections.map(({ key, title, members: membersInRank }) => {
              const tierWidth = {
                1: 'max-w-md',
                2: 'max-w-2xl',
                3: 'max-w-4xl',
                4: 'max-w-3xl',
                5: 'max-w-5xl',
              }[key];
              return (
                <section key={key} aria-labelledby={`hierarchy-rank-${key}`} className={`mx-auto w-full ${tierWidth}`}>
                  <div className={`mb-3 flex items-center justify-between border-b px-1 pb-2 ${key === 1 ? 'border-blue-400/25' : key === 2 ? 'border-stone-400/20' : key === 3 ? 'border-purple-400/20' : key === 4 ? 'border-slate-300/20' : 'border-stone-700/70'}`}>
                    <h2 id={`hierarchy-rank-${key}`} className={`text-[10px] font-black uppercase tracking-[0.2em] ${RANK_ACCENTS[key].split(' ')[0]}`}>
                      {title}
                    </h2>
                    <span className="font-sans text-[10px] tabular-nums text-stone-500">{membersInRank.length}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
                    {membersInRank.map(member => {
                      const config = ROLE_CONFIG[member.role];
                      return (
                        <button
                          key={member.id}
                          type="button"
                          aria-label={`Open ${member.name}'s profile`}
                          onClick={() => openMemberProfile(member)}
                          className={`flex min-h-[4.5rem] w-full items-center gap-3 rounded-xl border border-stone-800 bg-gradient-to-br from-stone-900 to-[#121310] px-3 py-2.5 text-left shadow-md shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 sm:w-auto sm:min-w-48 sm:max-w-full ${config?.accent}`}
                        >
                          <MemberAvatar
                            member={member}
                            config={config}
                            avatarMode="minecraft"
                            showRetry={false}
                            sizeClass="h-10 w-10"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-stone-100">{member.name}</span>
                            <span className={`mt-0.5 block truncate font-sans text-[10px] ${config?.color}`}>{member.role}</span>
                          </span>
                          {actingLeaderIds.has(member.id) && (
                            <span className="shrink-0 rounded-full border border-amber-400/25 bg-amber-400/[0.08] px-2 py-1 font-sans text-[8px] font-bold uppercase tracking-wide text-amber-200">
                              Acting
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })
          ) : (
            rankSections.map(({ key, title, members: membersInRank }) => (
                <section key={key} aria-labelledby={`rank-${key}`} className="group/rank">
                  <div className="mb-5 flex items-center gap-4">
                    <h2 id={`rank-${key}`} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black uppercase tracking-[0.18em] transition-colors group-hover/rank:brightness-125 ${key === 'power' ? 'border-sky-400/25 bg-sky-400/[0.06] text-sky-200' : key === 'name' ? 'border-amber-400/25 bg-amber-400/[0.06] text-amber-200' : RANK_ACCENTS[key]}`}>
                      {title}<span className="opacity-50">/</span><span className="font-medium tracking-normal opacity-70">{membersInRank.length}</span>
                    </h2>
                    <div className={`h-px flex-1 bg-gradient-to-r ${key === 'power' ? 'from-sky-400/60' : key === 'name' ? 'from-amber-400/60' : key === 1 ? 'from-blue-400/60' : key === 2 ? 'from-stone-300/50' : key === 3 ? 'from-purple-400/60' : key === 4 ? 'from-slate-300/50' : 'from-stone-600'} to-transparent transition-colors group-hover/rank:to-stone-800`} />
                  </div>
                  
                  <div className={`grid gap-4 ${viewMode === 'compact' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                    {membersInRank.map((member) => {
                      const config = ROLE_CONFIG[member.role];
                      const Icon = config?.icon || User;
                      const secCfg = member.secondaryRole ? ROLE_CONFIG[member.secondaryRole] : null;
                      const SecIcon = secCfg ? secCfg.icon : null;
                      const votingPower = getVotingPowerBreakdown(member, ROLE_CONFIG);
                      const displayDesc = member.customDesc || config?.desc;
                      
                      return (
                        <article key={member.id} data-view-mode={viewMode} className={`group relative isolate overflow-hidden rounded-2xl border border-stone-800 bg-gradient-to-br from-stone-900 to-[#121310] shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-[#0b0d0b] motion-reduce:transform-none motion-reduce:transition-none ${config?.accent}`}>
                          <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${config?.wash} opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none`} />
                          <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${config?.line} opacity-50 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100`} />
                          <div className={`relative flex h-full flex-col ${viewMode === 'compact' ? 'p-3' : 'p-4 sm:p-5'}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <MemberAvatar member={member} config={config} avatarMode={avatarMode} />
                                <div className="min-w-0">
                                  <h3 className={`truncate font-black tracking-wide text-stone-100 transition-colors ${viewMode === 'compact' ? 'text-sm' : 'text-lg'} ${config?.nameHover}`}><HighlightedText text={member.name} query={normalizedQuery} /></h3>
                                  {actingLeaderIds.has(member.id) && (
                                    <span className="mt-1 inline-flex rounded-full border border-amber-400/25 bg-amber-400/[0.08] px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-[0.1em] text-amber-200">
                                      Acting leader
                                    </span>
                                  )}
                                  <div className={`mt-0.5 min-w-0 items-center gap-1 font-sans text-xs text-stone-500 ${viewMode === 'compact' || !member.mcName ? 'hidden' : 'flex'}`}>
                                    <span className="truncate">@<HighlightedText text={member.mcName} query={normalizedQuery} /></span>
                                    <button
                                      type="button"
                                      aria-label={`Copy ${member.mcName} Minecraft username`}
                                      title={`Copy ${member.mcName}`}
                                      onClick={() => copyUsername(member.mcName)}
                                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-800 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
                                    >
                                      {copiedUsername === member.mcName && !copyFailed ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div
                                aria-label={`${votingPower.points} voting point${votingPower.points === 1 ? '' : 's'} from ${member.role} primary role`}
                                title={`Voting power from primary role: ${member.role}`}
                                className={`shrink-0 rounded-lg border border-stone-700/70 bg-black/20 text-right font-sans text-[10px] font-semibold text-stone-400 ${viewMode === 'compact' ? 'px-2 py-1' : 'px-2.5 py-1.5'}`}
                              >
                                <div>{votingPower.points} pts</div>
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <span className="font-sans text-[9px] font-bold uppercase tracking-[0.14em] text-stone-500">Primary role</span>
                                <button
                                  type="button"
                                  aria-label={`Filter roster by primary role ${member.role}`}
                                  aria-pressed={selectedRole === member.role}
                                  onClick={() => filterByRole(member.role)}
                                  className={`inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-md border px-2 py-1 font-sans text-xs transition-colors hover:brightness-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${config?.badge}`}
                                >
                                  <Icon aria-hidden="true" className={config?.color} size={13} /><span className="truncate"><HighlightedText text={member.role} query={normalizedQuery} /></span>
                                </button>
                              </div>
                            </div>
                            <details className={`mt-3 border-t border-stone-800/80 pt-2 font-sans text-xs ${viewMode === 'compact' ? 'hidden' : ''}`}>
                              <summary className="min-h-10 cursor-pointer py-2 text-stone-500 transition hover:text-amber-200 focus:outline-none focus-visible:text-amber-200 focus-visible:underline">
                                More about {member.name}
                              </summary>
                              <div className="grid gap-3 pb-2">
                                {member.secondaryRole && secCfg && SecIcon && (
                                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    <span className="w-[4.5rem] shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] text-stone-500">Secondary</span>
                                    <button
                                      type="button"
                                      aria-label={`Filter roster by secondary role ${member.secondaryRole}`}
                                      aria-pressed={selectedRole === member.secondaryRole}
                                      onClick={() => filterByRole(member.secondaryRole)}
                                      className={`inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-md border px-2 py-1 font-sans text-xs transition-colors hover:brightness-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${secCfg.badge}`}
                                    >
                                      <SecIcon aria-hidden="true" className={secCfg.color} size={13} /><span className="truncate"><HighlightedText text={member.secondaryRole} query={normalizedQuery} /></span>
                                    </button>
                                  </div>
                                )}
                                {(config?.trim !== 'None' || (secCfg?.trim && secCfg.trim !== 'None')) && (
                                  <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                                    {config?.trim !== 'None' && <span className={`rounded-full border px-2 py-1 ${config?.badge}`}>✦ {config?.trim}</span>}
                                    {secCfg?.trim && secCfg.trim !== 'None' && <span className={`rounded-full border px-2 py-1 ${secCfg.badge}`}>✦ {secCfg.trim}</span>}
                                  </div>
                                )}
                                <p className="leading-relaxed text-stone-500">{describeVotingPower(member, ROLE_CONFIG)}</p>
                              </div>
                            </details>
                            {displayDesc && viewMode !== 'compact' && <p className="mt-4 flex-1 border-t border-stone-800/80 pt-4 text-sm leading-relaxed text-stone-400 line-clamp-3"><HighlightedText text={displayDesc} query={normalizedQuery} /></p>}
                            <button
                              type="button"
                              onClick={() => openMemberProfile(member)}
                              className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-950 ${config?.badge} ${config?.accent}`}
                            >
                              {viewMode === 'compact' ? 'Profile' : 'View full profile'} <span aria-hidden="true">→</span>
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
        <details className="group/guide mt-8 overflow-hidden rounded-xl border border-stone-800 bg-stone-900/45 print:hidden">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 py-3 font-sans text-xs font-semibold text-stone-300 transition hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 [&::-webkit-details-marker]:hidden">
            <BookOpen aria-hidden="true" size={15} className="text-amber-400" />
            Role guide and primary-role voting points
            <ChevronDown aria-hidden="true" size={14} className="ml-auto text-stone-500 transition-transform group-open/guide:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className="border-t border-stone-800 p-3">
            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              <p className="flex items-start gap-2 rounded-lg border border-stone-800/80 bg-black/20 px-3 py-2.5 text-xs leading-relaxed text-stone-400">
                <Scale aria-hidden="true" className="mt-0.5 shrink-0 text-sky-300/80" size={15} />
                <span>Voting power comes from each member’s primary role only. Secondary roles do not add voting points.</span>
              </p>
              <p className="flex items-start gap-2 rounded-lg border border-stone-800/80 bg-black/20 px-3 py-2.5 text-xs leading-relaxed text-stone-400">
                <Info aria-hidden="true" className="mt-0.5 shrink-0 text-amber-400/80" size={15} />
                <span>Citizens are <strong className="font-semibold text-stone-200">not permitted to wear armor trims.</strong></span>
              </p>
            </div>
            <p className="mb-3 font-sans text-[11px] text-stone-500">
              Roster last updated <time dateTime={ROSTER_METADATA.lastUpdated}>{lastUpdatedDate}</time>. Data is maintained in <code className="rounded border border-stone-700 bg-black/30 px-1.5 py-0.5 text-amber-200/80">src/data/members.json</code>.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ROLE_NAMES.map(role => {
                const config = ROLE_CONFIG[role];
                const Icon = config.icon;
                return (
                  <div key={role} className={`flex min-w-0 items-start gap-3 rounded-lg border p-3 ${config.badge}`}>
                    <Icon aria-hidden="true" size={16} className={`mt-0.5 shrink-0 ${config.color}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold">{role}</p>
                      <p className="mt-1 text-[11px] leading-relaxed opacity-80">{config.desc}</p>
                      <p className="mt-1 font-sans text-[10px] font-semibold opacity-80">
                        {config.points} primary-role point{config.points === 1 ? '' : 's'} · {config.trim}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </details>
        <dialog
          ref={profileDialogRef}
          aria-labelledby="member-profile-title"
          aria-describedby="member-profile-description"
          onClose={handleProfileDialogClose}
          onClick={event => {
            if (event.target === event.currentTarget) closeMemberProfile();
          }}
          className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-[42rem] overscroll-contain overflow-y-auto rounded-2xl border border-stone-700 bg-[#11120f] p-0 text-stone-200 shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm sm:max-h-[min(85dvh,48rem)] sm:w-[calc(100%-1.5rem)]"
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
                <div className="relative p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="scale-110 sm:scale-125"><MemberAvatar member={selectedMember} config={config} avatarMode={avatarMode} /></div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Member profile</p>
                        <h2 id="member-profile-title" className={`mt-1 truncate text-2xl font-black ${config?.color}`}>{selectedMember.name}</h2>
                        {actingLeaderIds.has(selectedMember.id) && (
                          <span className="mt-1 inline-flex rounded-full border border-amber-400/25 bg-amber-400/[0.08] px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-[0.1em] text-amber-200">
                            Acting leader
                          </span>
                        )}
                        {selectedMember.mcName && <p className="mt-1 truncate font-sans text-sm text-stone-400">@{selectedMember.mcName}</p>}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Close member profile"
                      onClick={closeMemberProfile}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-stone-700 bg-stone-900/80 p-2 text-stone-400 transition hover:border-stone-500 hover:text-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
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

                  <div className="mt-6 border-t border-stone-800/80 pt-4">
                    <button
                      type="button"
                      onClick={copyMemberProfileLink}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-stone-700 bg-stone-900/70 px-4 py-2 font-sans text-xs font-semibold text-stone-200 transition hover:border-amber-500/50 hover:text-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
                    >
                      <Link2 aria-hidden="true" size={15} />
                      Copy profile link
                    </button>
                    {profileLinkStatus && (
                      <p className={`mt-2 text-xs ${profileLinkStatus.startsWith('Could not') ? 'text-rose-300' : 'text-emerald-300'}`} role="status" aria-live="polite">
                        {profileLinkStatus}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </dialog>
      </div>
    </div>
  );
}