import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  describeVotingPower,
  filterMembers,
  getRankVotingTotals,
  getRoleCoverage,
  getVotingPowerBreakdown,
  matchesMemberFilter,
  sortByVotingPower,
  validateRoster,
} from '../rosterUtils.js';

const members = JSON.parse(
  readFileSync(new URL('../data/members.json', import.meta.url), 'utf8')
);

const roleConfig = {
  King: { points: 5, rank: 1, max: 1 },
  Advisor: { points: 3, rank: 2, max: 2 },
  'Head Of Resources and Projects': { points: 2, rank: 3, max: 1 },
  'Head Of General Purpose Resources': { points: 2, rank: 3, max: 1 },
  'Head Of Agriculture and Justice': { points: 2, rank: 3, max: 1 },
  'Head Of Combat And War': { points: 2, rank: 3, max: 1 },
  'Head Of Medicinal Substances': { points: 2, rank: 3, max: 1 },
  Prince: { points: 2, rank: 4, max: 1 },
  Citizen: { points: 1, rank: 5, max: Infinity },
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

test('a vacancy role filter returns only members assigned that role', () => {
  assert.deepEqual(
    filterMembers(members, '', 'All', 'Head Of Combat And War').map(member => member.name),
    ['Darcy']
  );
  assert.deepEqual(
    filterMembers(members, '', 'All', 'Head Of General Purpose Resources'),
    []
  );
});

test('voting power adds role points unless custom points override them', () => {
  const king = getVotingPowerBreakdown(members[0], roleConfig);
  const darcy = members.find(member => member.name === 'Darcy');
  const darcyBreakdown = getVotingPowerBreakdown(darcy, roleConfig);
  const total = members.reduce(
    (sum, member) => sum + getVotingPowerBreakdown(member, roleConfig).points,
    0
  );

  assert.equal(king.points, 5);
  assert.equal(king.isCustom, false);
  assert.equal(darcyBreakdown.roleTotal, 5);
  assert.equal(darcyBreakdown.points, 3);
  assert.equal(darcyBreakdown.isCustom, true);
  assert.match(describeVotingPower(darcy, roleConfig), /role total: 5/);
  assert.equal(total, 22);
});

test('voting-power sorting is descending with rank and name tie-breakers', () => {
  const sortedNames = sortByVotingPower(members, roleConfig).map(member => member.name);

  assert.deepEqual(sortedNames, [
    'Will', 'Darcy', 'Parker', 'Harrison', 'Nate', 'Thomas', 'Max',
    'Alex', 'Nicky', 'Poppy',
  ]);
});

test('role coverage counts secondary assignments and reports open seats', () => {
  const coverage = getRoleCoverage(members, roleConfig);
  const vacantRoles = coverage.filter(role => role.vacant > 0);

  assert.deepEqual(vacantRoles, [
    {
      role: 'Head Of General Purpose Resources',
      capacity: 1,
      filled: 0,
      vacant: 1,
    },
  ]);
  assert.equal(coverage.find(role => role.role === 'Head Of Combat And War').filled, 1);
});

test('rank voting totals attribute each member once and sum to total power', () => {
  const totals = getRankVotingTotals(members, roleConfig, {
    1: 'KING',
    2: 'HIGH COUNCIL',
    3: 'COUNCIL',
    4: 'PRINCE',
    5: 'CITIZENS',
  });

  assert.deepEqual(totals.map(({ title, memberCount, votingPower }) => ({
    title, memberCount, votingPower,
  })), [
    { title: 'KING', memberCount: 1, votingPower: 5 },
    { title: 'HIGH COUNCIL', memberCount: 2, votingPower: 6 },
    { title: 'COUNCIL', memberCount: 3, votingPower: 6 },
    { title: 'PRINCE', memberCount: 1, votingPower: 2 },
    { title: 'CITIZENS', memberCount: 3, votingPower: 3 },
  ]);
  assert.equal(totals.reduce((sum, section) => sum + section.votingPower, 0), 22);
});

test('roster validation accepts current data and rejects duplicate IDs and overfilled seats', () => {
  assert.equal(validateRoster(members, roleConfig), null);
  assert.match(validateRoster([], roleConfig), /at least one member/);
  assert.match(validateRoster([members[0], { ...members[1], id: members[0].id }], roleConfig), /unique/);
  assert.match(
    validateRoster([
      members[0],
      members[1],
      { ...members[2], id: 11 },
      { ...members[1], id: 12, name: 'Extra Advisor' },
    ], roleConfig),
    /Advisor has 3 assignments but only 2 available seats/
  );
});
