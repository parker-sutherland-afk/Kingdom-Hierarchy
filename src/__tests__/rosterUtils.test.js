import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  describeVotingPower,
  filterMembers,
  getVotingPowerBreakdown,
  matchesMemberFilter,
  splitSearchHighlights,
  sortByName,
  sortByVotingPower,
} from '../rosterUtils.js';
import ROLE_CONFIG from '../roleConfig.js';
import { validateRoster } from '../rosterValidation.js';
import { createRosterUrl, readRosterUrl } from '../rosterUrl.js';
import { getMinecraftAvatarSources } from '../avatarSources.js';

const members = JSON.parse(
  readFileSync(new URL('../data/members.json', import.meta.url), 'utf8')
);
const rosterMetadata = JSON.parse(
  readFileSync(new URL('../data/rosterMetadata.json', import.meta.url), 'utf8')
);

const roleConfig = {
  King: { points: 5, rank: 1 },
  Advisor: { points: 3, rank: 2 },
  'Head Of Resources and Projects': { points: 2, rank: 3 },
  'Head Of General Purpose Resources': { points: 2, rank: 3 },
  'Head Of Agriculture and Justice': { points: 2, rank: 3 },
  'Head Of Combat And War': { points: 2, rank: 3 },
  'Head Of Medicinal Substances': { points: 2, rank: 3 },
  Prince: { points: 2, rank: 4 },
  Citizen: { points: 1, rank: 5 },
};

test('Council includes High Council and department heads once each', () => {
  const council = members.filter(member => matchesMemberFilter(member, 'Council'));

  assert.equal(council.length, 6);
  assert.deepEqual(council.map(member => member.name), [
    'Will', 'Parker', 'Darcy', 'Harrison', 'Thomas', 'Nate',
  ]);
});

test('High Council and Military filters include matching secondary roles', () => {
  assert.deepEqual(
    members.filter(member => matchesMemberFilter(member, 'High Council')).map(member => member.name),
    ['Will', 'Parker', 'Darcy']
  );
  assert.deepEqual(
    members.filter(member => matchesMemberFilter(member, 'Military')).map(member => member.name),
    ['Darcy']
  );
});

test('search includes Minecraft usernames and descriptions', () => {
  assert.deepEqual(filterMembers(members, 'eighthsea6218', 'All').map(member => member.name), ['Will']);
  assert.deepEqual(filterMembers(members, 'sovereign overlord', 'All').map(member => member.name), ['Will']);
});

test('search highlighting safely matches case-insensitive text and literal regex characters', () => {
  assert.deepEqual(splitSearchHighlights('Darcy Advisor', 'advisor'), [
    { text: 'Darcy ', matched: false },
    { text: 'Advisor', matched: true },
  ]);
  assert.deepEqual(splitSearchHighlights('A.B and Axb', 'a.b'), [
    { text: 'A.B', matched: true },
    { text: ' and Axb', matched: false },
  ]);
  assert.deepEqual(splitSearchHighlights('Parker', ''), [
    { text: 'Parker', matched: false },
  ]);
});

test('exact role filtering matches primary and secondary role assignments', () => {
  assert.deepEqual(
    filterMembers(members, '', 'All', 'Head Of Combat And War').map(member => member.name),
    ['Darcy']
  );
  assert.deepEqual(
    filterMembers(members, '', 'All', 'Head Of General Purpose Resources'),
    []
  );
  assert.deepEqual(
    filterMembers(members, '', 'Council', 'Advisor').map(member => member.name),
    ['Parker', 'Darcy']
  );
});

test('name sorting is alphabetical without changing the source order', () => {
  const sortedNames = sortByName(members).map(member => member.name);

  assert.deepEqual(sortedNames, [
    'Alex', 'Darcy', 'Harrison', 'Max', 'Nate', 'Nicky', 'Parker', 'Poppy', 'Thomas', 'Will',
  ]);
  assert.equal(members[0].name, 'Will');
});

test('voting power comes only from the primary role', () => {
  const king = getVotingPowerBreakdown(members[0], roleConfig);
  const darcy = members.find(member => member.name === 'Darcy');
  const darcyBreakdown = getVotingPowerBreakdown({ ...darcy, customPoints: 99 }, roleConfig);
  const total = members.reduce(
    (sum, member) => sum + getVotingPowerBreakdown(member, roleConfig).points,
    0
  );

  assert.equal(king.points, 5);
  assert.equal(darcyBreakdown.points, 3);
  assert.deepEqual(darcyBreakdown.roles, [{ role: 'Advisor', points: 3 }]);
  assert.match(describeVotingPower(darcy, roleConfig), /Primary role — Advisor: 3 points/);
  assert.equal(total, 22);
});

test('voting-power sorting is descending with rank and name tie-breakers', () => {
  const sortedNames = sortByVotingPower(members, roleConfig).map(member => member.name);

  assert.deepEqual(sortedNames, [
    'Will', 'Darcy', 'Parker', 'Harrison', 'Nate', 'Thomas', 'Max',
    'Alex', 'Nicky', 'Poppy',
  ]);
});

test('published roster passes structural and role validation', () => {
  assert.deepEqual(validateRoster(members, Object.keys(ROLE_CONFIG), rosterMetadata), []);
});

test('roster validation reports duplicate identities, invalid roles, and missing fields', () => {
  const invalidRoster = [
    { id: 1, name: 'Will', mcName: 'PlayerOne', role: 'King' },
    { id: 1, name: '', mcName: 'playerone', role: 'Unknown', secondaryRole: 'King' },
    { id: 2, name: 'Alex', mcName: 'PlayerTwo', role: 'Citizen', secondaryRole: 'Citizen' },
  ];

  assert.deepEqual(validateRoster(invalidRoster, Object.keys(ROLE_CONFIG)), [
    'Member at index 1 has duplicate id 1.',
    'Member at index 1 must have a non-empty name.',
    'Member at index 1 has duplicate Minecraft username playerone.',
    'Member at index 1 uses unknown primary role "Unknown".',
    'Member at index 2 cannot have the same primary and secondary role.',
  ]);
});

test('roster links preserve search, group, role, sort, and member profile state', () => {
  const state = {
    searchQuery: '  Darcy  ',
    activeFilter: 'Council',
    selectedRole: 'Advisor',
    sortMode: 'name',
    viewMode: 'comfortable',
    selectedMember: members[2],
  };
  const url = createRosterUrl('https://example.test/roster?campaign=summer#members', state);

  assert.equal(url.searchParams.get('campaign'), 'summer');
  assert.equal(url.hash, '#members');
  assert.deepEqual(readRosterUrl(url.search, members, Object.keys(ROLE_CONFIG)), {
    searchQuery: 'Darcy',
    activeFilter: 'Council',
    selectedRole: 'Advisor',
    sortMode: 'name',
    viewMode: 'comfortable',
    selectedMember: members[2],
  });
});

test('share-view links preserve filters but omit an open profile', () => {
  const url = createRosterUrl('https://example.test/roster?member=3', {
    searchQuery: 'advisor',
    activeFilter: 'High Council',
    selectedRole: '',
    sortMode: 'power',
    viewMode: 'comfortable',
    selectedMember: members[2],
  }, { includeMember: false });

  assert.equal(url.searchParams.get('q'), 'advisor');
  assert.equal(url.searchParams.get('group'), 'High Council');
  assert.equal(url.searchParams.get('sort'), 'power');
  assert.equal(url.searchParams.has('member'), false);
  assert.equal(readRosterUrl(url.search, members, Object.keys(ROLE_CONFIG)).selectedMember, null);
});

test('roster links safely fall back from invalid view and profile parameters', () => {
  const state = readRosterUrl(
    '?group=unknown&role=Unknown&sort=invalid&member=999',
    members,
    Object.keys(ROLE_CONFIG)
  );

  assert.deepEqual(state, {
    searchQuery: '',
    activeFilter: 'All',
    selectedRole: '',
    sortMode: 'rank',
    viewMode: 'comfortable',
    selectedMember: null,
  });
});

test('compact roster view is preserved in shareable links', () => {
  const url = createRosterUrl('https://example.test/roster', {
    searchQuery: '',
    activeFilter: 'All',
    selectedRole: '',
    sortMode: 'rank',
    viewMode: 'compact',
    selectedMember: null,
  });

  assert.equal(url.searchParams.get('view'), 'compact');
  assert.equal(
    readRosterUrl(url.search, members, Object.keys(ROLE_CONFIG)).viewMode,
    'compact'
  );
});

test('roster metadata rejects impossible calendar dates', () => {
  assert.deepEqual(validateRoster(members, Object.keys(ROLE_CONFIG), {
    lastUpdated: '2026-02-31',
  }), ['Roster metadata lastUpdated must be a valid YYYY-MM-DD date.']);
});

test('king-away status requires a boolean and a listed King and Advisor', () => {
  assert.deepEqual(validateRoster(members, Object.keys(ROLE_CONFIG), {
    lastUpdated: '2026-11-03',
    kingAway: true,
  }), []);
  assert.deepEqual(validateRoster(members, Object.keys(ROLE_CONFIG), {
    lastUpdated: '2026-11-03',
    kingAway: 'true',
  }), ['Roster metadata kingAway must be a boolean when it is provided.']);
  assert.deepEqual(validateRoster(members.filter(member => member.role !== 'Advisor'), Object.keys(ROLE_CONFIG), {
    lastUpdated: '2026-11-03',
    kingAway: true,
  }), ['Roster metadata cannot mark the King away when no Advisors are listed.']);
});

test('Minecraft avatar sources use four independent HTTPS providers in fallback order', () => {
  assert.deepEqual(
    getMinecraftAvatarSources('Player Name').map(({ provider, src }) => [provider, src]),
    [
      ['Minotar', 'https://minotar.net/helm/Player%20Name/64.png'],
      ['Cravatar', 'https://cravatar.eu/helmavatar/Player%20Name/64.png'],
      ['MineSkin', 'https://mineskin.eu/helm/Player%20Name/64.png'],
      ['MC-Heads', 'https://mc-heads.net/avatar/Player%20Name/64'],
    ]
  );
});

test('avatar retries bypass provider image caches', () => {
  assert.ok(getMinecraftAvatarSources('Player', 2).every(({ src }) => src.endsWith('?retry=2')));
});
