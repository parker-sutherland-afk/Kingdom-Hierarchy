export function validateRoster(members, roleNames) {
  const errors = [];
  const knownRoles = new Set(roleNames);

  if (!Array.isArray(members)) return ['Roster data must be an array.'];
  if (members.length === 0) errors.push('Roster data must include at least one member.');

  const ids = new Set();
  const usernames = new Set();

  members.forEach((member, index) => {
    const label = `Member at index ${index}`;
    if (!member || typeof member !== 'object' || Array.isArray(member)) {
      errors.push(`${label} must be an object.`);
      return;
    }

    if (!Number.isSafeInteger(member.id) || member.id < 1) {
      errors.push(`${label} must have a positive integer id.`);
    } else if (ids.has(member.id)) {
      errors.push(`${label} has duplicate id ${member.id}.`);
    } else {
      ids.add(member.id);
    }

    for (const field of ['name', 'mcName', 'role']) {
      if (typeof member[field] !== 'string' || member[field].trim() === '') {
        errors.push(`${label} must have a non-empty ${field}.`);
      }
    }

    if (typeof member.mcName === 'string' && member.mcName.trim()) {
      const username = member.mcName.trim().toLocaleLowerCase();
      if (usernames.has(username)) errors.push(`${label} has duplicate Minecraft username ${member.mcName}.`);
      usernames.add(username);
    }

    if (typeof member.role === 'string' && !knownRoles.has(member.role)) {
      errors.push(`${label} uses unknown primary role "${member.role}".`);
    }

    if (member.secondaryRole !== undefined) {
      if (typeof member.secondaryRole !== 'string' || member.secondaryRole.trim() === '') {
        errors.push(`${label} must have a non-empty secondaryRole when it is provided.`);
      } else if (!knownRoles.has(member.secondaryRole)) {
        errors.push(`${label} uses unknown secondary role "${member.secondaryRole}".`);
      } else if (member.secondaryRole === member.role) {
        errors.push(`${label} cannot have the same primary and secondary role.`);
      }
    }

    if (member.customDesc !== undefined && typeof member.customDesc !== 'string') {
      errors.push(`${label} customDesc must be a string when it is provided.`);
    }
  });

  return errors;
}
