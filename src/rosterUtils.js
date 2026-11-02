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
      memberRoles(member).includes(selectedRole);

    return searchableText.includes(normalizedQuery) &&
      matchesMemberFilter(member, activeFilter) &&
      matchesRole;
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

export function getRoleCoverage(members, roleConfig) {
  return Object.entries(roleConfig)
    .filter(([, config]) => Number.isFinite(config.max))
    .map(([role, config]) => {
      const filled = members.filter(member => memberRoles(member).includes(role)).length;

      return {
        role,
        capacity: config.max,
        filled,
        vacant: Math.max(0, config.max - filled),
      };
    });
}

export function getRankVotingTotals(members, roleConfig, rankTitles) {
  return Object.entries(rankTitles)
    .map(([rank, title]) => {
      const rankMembers = members.filter(
        member => roleConfig[member.role]?.rank === Number(rank)
      );

      return {
        rank: Number(rank),
        title,
        memberCount: rankMembers.length,
        votingPower: rankMembers.reduce(
          (total, member) => total + getVotingPowerBreakdown(member, roleConfig).points,
          0
        ),
      };
    })
    .filter(section => section.memberCount > 0);
}

export function validateRoster(members, roleConfig) {
  if (!Array.isArray(members)) return 'Roster data must be a list of members.';
  if (members.length === 0) return 'Roster must include at least one member.';

  const memberIds = new Set();
  const roleAssignments = new Map();

  for (const [index, member] of members.entries()) {
    const position = `Member ${index + 1}`;

    if (!member || typeof member !== 'object' || Array.isArray(member)) {
      return `${position} must be a valid member record.`;
    }

    if (!Number.isSafeInteger(member.id) || member.id < 1 || memberIds.has(member.id)) {
      return `${position} needs a unique positive whole-number ID.`;
    }
    memberIds.add(member.id);

    if (typeof member.name !== 'string' || !member.name.trim()) {
      return `${position} needs a display name.`;
    }
    if (typeof member.mcName !== 'string' || !member.mcName.trim()) {
      return `${position} needs a Minecraft username.`;
    }
    if (!Object.hasOwn(roleConfig, member.role)) {
      return `${member.name} has an unknown primary role.`;
    }
    if (member.secondaryRole && !Object.hasOwn(roleConfig, member.secondaryRole)) {
      return `${member.name} has an unknown secondary role.`;
    }
    if (member.secondaryRole === member.role) {
      return `${member.name} cannot have the same primary and secondary role.`;
    }
    if (
      member.customPoints !== undefined &&
      member.customPoints !== null &&
      (!Number.isFinite(member.customPoints) || member.customPoints < 0)
    ) {
      return `${member.name} needs a non-negative number for custom voting points.`;
    }
    if (member.customDesc !== undefined && typeof member.customDesc !== 'string') {
      return `${member.name}'s description must be text.`;
    }

    for (const role of memberRoles(member)) {
      roleAssignments.set(role, (roleAssignments.get(role) ?? 0) + 1);
    }
  }

  for (const [role, assigned] of roleAssignments) {
    const capacity = roleConfig[role].max;
    if (Number.isFinite(capacity) && assigned > capacity) {
      return `${role} has ${assigned} assignments but only ${capacity} available seat${capacity === 1 ? '' : 's'}.`;
    }
  }

  return null;
}
