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
