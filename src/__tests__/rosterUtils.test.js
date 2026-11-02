import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  describeVotingPower,
  filterMembers,
  getVotingPowerBreakdown,
  matchesMemberFilter,
  sortByVotingPower,
} from '../rosterUtils.js';

const members = JSON.parse(
  readFileSync(new URL('../data/members.json', import.meta.url), 'utf8')
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
