const HIGH_COUNCIL_ROLES = ['King', 'Advisor'];
const MILITARY_ROLE_PATTERN = /war|combat|military/i;

function memberRoles(member) {
  return [member.role, member.secondaryRole].filter(Boolean);
}

export function matchesMemberFilter(member, filter) {
  const roles = memberRoles(member);

  if (filter === 'High Council') {
    return roles.some(role => HIGH_COUNCIL_ROLES.includes(role));
  }

  if (filter === 'Council') {
    return roles.some(role =>
      HIGH_COUNCIL_ROLES.includes(role) || role.startsWith('Head Of ')
    );
  }

  if (filter === 'Citizens') {
    return member.role === 'Citizen';
  }

  if (filter === 'Military') {
    return roles.some(role => MILITARY_ROLE_PATTERN.test(role));
  }

  return true;
}

export function filterMembers(members, searchQuery, activeFilter) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return members.filter(member => {
    const searchableText = [
      member.name,
      member.mcName,
      member.role,
      member.secondaryRole,
      member.customDesc,
    ].filter(Boolean).join(' ').toLowerCase();

    return searchableText.includes(normalizedQuery) &&
      matchesMemberFilter(member, activeFilter);
  });
}

export function getVotingPowerBreakdown(member, roleConfig) {
  const roles = memberRoles(member).map(role => ({
    role,
    points: roleConfig[role]?.points ?? 0,
  }));
  const roleTotal = roles.reduce((total, item) => total + item.points, 0);
  const hasCustomPoints = member.customPoints !== undefined && member.customPoints !== null;

  return {
    points: hasCustomPoints ? member.customPoints : roleTotal,
    roleTotal,
    roles,
    isCustom: hasCustomPoints,
  };
}

export function describeVotingPower(member, roleConfig) {
  const breakdown = getVotingPowerBreakdown(member, roleConfig);
  const roleDescription = breakdown.roles
    .map(({ role, points }) => `${role}: ${points}`)
    .join(' + ');

  if (breakdown.isCustom) {
    return `Custom allocation: ${breakdown.points} points (role total: ${breakdown.roleTotal}; ${roleDescription})`;
  }

  return roleDescription;
}

export function sortByVotingPower(members, roleConfig) {
  return [...members].sort((left, right) => {
    const pointsDifference =
      getVotingPowerBreakdown(right, roleConfig).points -
      getVotingPowerBreakdown(left, roleConfig).points;

    if (pointsDifference !== 0) return pointsDifference;

    const rankDifference =
      (roleConfig[left.role]?.rank ?? Infinity) -
      (roleConfig[right.role]?.rank ?? Infinity);

    return rankDifference || left.name.localeCompare(right.name);
  });
}
