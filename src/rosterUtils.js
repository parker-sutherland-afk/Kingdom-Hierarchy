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

export function filterMembers(members, searchQuery, activeFilter, selectedRole = '') {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return members.filter(member => {
    const searchableText = [
      member.name,
      member.mcName,
      member.role,
      member.secondaryRole,
      member.customDesc,
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesRole = !selectedRole ||
      member.role === selectedRole ||
      member.secondaryRole === selectedRole;

    return searchableText.includes(normalizedQuery) &&
      matchesMemberFilter(member, activeFilter) &&
      matchesRole;
  });
}

export function getVotingPowerBreakdown(member, roleConfig) {
  const roles = [{
    role: member.role,
    points: roleConfig[member.role]?.points ?? 0,
  }];

  return {
    points: roles[0].points,
    roles,
  };
}

export function describeVotingPower(member, roleConfig) {
  const breakdown = getVotingPowerBreakdown(member, roleConfig);
  const primaryRole = breakdown.roles[0];
  return `Primary role — ${primaryRole.role}: ${primaryRole.points} point${primaryRole.points === 1 ? '' : 's'}`;
}

export function sortByName(members) {
  return [...members].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: 'base' })
  );
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
