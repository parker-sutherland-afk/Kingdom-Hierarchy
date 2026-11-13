import test from 'node:test';
import assert from 'node:assert/strict';
import { tallyVotes } from '../voteMath.js';

const pointsFor = member => member.points;
const members = [
  { id: 1, points: 5 },
  { id: 2, points: 3 },
  { id: 3, points: 2 },
  { id: 4, points: 1 },
];

test('no votes means nothing passes', () => {
  const result = tallyVotes(members, {}, pointsFor);
  assert.equal(result.cast, 0);
  assert.equal(result.total, 11);
  assert.equal(result.notVoting, 11);
  assert.equal(result.share, 0);
  assert.equal(result.passes, false);
});

test('everyone voting yes passes', () => {
  const result = tallyVotes(members, { 1: 'yes', 2: 'yes', 3: 'yes', 4: 'yes' }, pointsFor);
  assert.equal(result.yes, 11);
  assert.equal(result.share, 1);
  assert.equal(result.passes, true);
});

test('a majority of the votes cast can pass without every member voting', () => {
  const result = tallyVotes(members, { 1: 'yes', 3: 'yes', 2: 'no' }, pointsFor);
  assert.equal(result.yes, 7);
  assert.equal(result.no, 3);
  assert.equal(result.cast, 10);
  assert.equal(result.notVoting, 1);
  assert.equal(result.passes, true);
});

test('members who did not vote only count against a motion when asked to', () => {
  const votes = { 1: 'yes' };
  assert.equal(tallyVotes(members, votes, pointsFor).passes, true);
  assert.equal(tallyVotes(members, votes, pointsFor, { countAbsentAsNo: true }).passes, false);
});

test('51 percent is the exact passing line', () => {
  const split = [{ id: 1, points: 51 }, { id: 2, points: 49 }];
  assert.equal(tallyVotes(split, { 1: 'yes', 2: 'no' }, pointsFor).passes, true);
  assert.equal(tallyVotes(split, { 1: 'no', 2: 'yes' }, pointsFor).passes, false);

  const even = [{ id: 1, points: 50 }, { id: 2, points: 50 }];
  assert.equal(tallyVotes(even, { 1: 'yes', 2: 'no' }, pointsFor).passes, false);
});
