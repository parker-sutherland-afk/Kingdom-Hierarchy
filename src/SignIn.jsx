
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
                  <MessageSquare aria-hidden="true" size={14} /> 
                </a>
              </div>
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-[0.06em] text-stone-100 sm:text-4xl md:text-6xl">Sign In<br className="sm:hidden" /> Page</h1>
                  <p className="mt-3 text-base italic text-stone-400 md:text-lg"></p>
                </div>
                <div className="flex max-w-sm items-start gap-3 rounded-xl border border-stone-700/70 bg-black/20 p-4 text-sm leading-relaxed text-stone-400">
                  <Info className="mt-0.5 shrink-0 text-amber-500/80" size={18} />
                  <p>All members of Imperius</p><strong className="font-semibold text-stone-200">are allowed to use the Sign In Portal</strong></p>
                </div>

                <iframe src="raspha16.github.io/Imperius-Sign-In/" title="Imperius Login Page" width="480" height="66" style="border:0;max-width:100%" loading="lazy" allow="clipboard-write"></iframe>
