const DEFAULT_VIEW = {
  searchQuery: '',
  activeFilter: 'All',
  selectedRole: '',
  sortMode: 'rank',
  viewMode: 'comfortable',
};

export function readRosterUrl(search, members, roleNames) {
  const params = search instanceof URLSearchParams
    ? search
    : new URLSearchParams(search);
  const memberId = params.get('member');
  const parsedMemberId = memberId && /^\d+$/.test(memberId) ? Number(memberId) : null;

  return {
    searchQuery: params.get('q') ?? DEFAULT_VIEW.searchQuery,
    activeFilter: ['All', 'High Council', 'Council', 'Military', 'Citizens'].includes(params.get('group'))
      ? params.get('group')
      : DEFAULT_VIEW.activeFilter,
    selectedRole: roleNames.includes(params.get('role')) ? params.get('role') : DEFAULT_VIEW.selectedRole,
    sortMode: ['rank', 'name', 'power'].includes(params.get('sort'))
      ? params.get('sort')
      : DEFAULT_VIEW.sortMode,
    viewMode: params.get('view') === 'compact' ? 'compact' : DEFAULT_VIEW.viewMode,
    selectedMember: members.find(member => member.id === parsedMemberId) ?? null,
  };
}

export function createRosterUrl(currentUrl, state, { includeMember = true } = {}) {
  const url = new URL(currentUrl);
  const params = url.searchParams;
  const values = [
    ['q', state.searchQuery.trim()],
    ['group', state.activeFilter === 'All' ? '' : state.activeFilter],
    ['role', state.selectedRole],
    ['sort', state.sortMode === 'rank' ? '' : state.sortMode],
    ['view', state.viewMode === 'compact' ? 'compact' : ''],
    ['member', includeMember && state.selectedMember ? String(state.selectedMember.id) : ''],
  ];

  values.forEach(([key, value]) => {
    if (value) params.set(key, value);
    else params.delete(key);
  });

  return url;
}
