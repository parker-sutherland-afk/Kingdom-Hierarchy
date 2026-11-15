import test from 'node:test';
import assert from 'node:assert/strict';
import { searchConstitution } from '../constitutionSearch.js';

const constitution = {
  currency: [
    { item: 'Iron Nugget', value: '1' },
    { item: 'Dragon Egg', value: 'Guaranteed purchase' },
  ],
  laws: [
    { id: 'monarchy', title: 'The Crown', rules: ['The King may veto any action.', 'The King oversees taxation.'] },
    { id: 'tax', title: 'Tax', rules: ['Taxes are collected every Saturday.'] },
  ],
};

test('queries shorter than two characters find nothing', () => {
  assert.deepEqual(searchConstitution(constitution, ''), { laws: [], currency: [], count: 0 });
  assert.equal(searchConstitution(constitution, ' v ').count, 0);
});

test('finds only the matching rules inside an article', () => {
  const result = searchConstitution(constitution, 'veto');
  assert.equal(result.laws.length, 1);
  assert.equal(result.laws[0].id, 'monarchy');
  assert.equal(result.laws[0].article, 1);
  assert.deepEqual(result.laws[0].rules, ['The King may veto any action.']);
  assert.equal(result.count, 1);
});

test('matching ignores case and counts rule and title matches', () => {
  const result = searchConstitution(constitution, 'TAX');
  assert.equal(result.laws.length, 2);
  assert.equal(result.laws[1].titleMatches, true);
  assert.equal(result.count, 3);
});

test('an article can match by title alone', () => {
  const result = searchConstitution(constitution, 'crown');
  assert.equal(result.laws.length, 1);
  assert.equal(result.laws[0].titleMatches, true);
  assert.equal(result.laws[0].rules.length, 0);
  assert.equal(result.count, 1);
});

test('currency entries are searched too', () => {
  const result = searchConstitution(constitution, 'egg');
  assert.equal(result.laws.length, 0);
  assert.deepEqual(result.currency, [{ item: 'Dragon Egg', value: 'Guaranteed purchase' }]);
  assert.equal(result.count, 1);
});
