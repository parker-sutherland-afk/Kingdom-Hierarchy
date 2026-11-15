import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRosterCsv, csvCell } from '../rosterCsv.js';

test('plain values are left as they are', () => {
  assert.equal(csvCell('Will'), 'Will');
  assert.equal(csvCell(5), '5');
  assert.equal(csvCell(null), '');
  assert.equal(csvCell(undefined), '');
});

test('commas, quotes and line breaks are quoted', () => {
  assert.equal(csvCell('a,b'), '"a,b"');
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  assert.equal(csvCell('two\nlines'), '"two\nlines"');
});

test('values that look like spreadsheet formulas are defused', () => {
  assert.equal(csvCell('=SUM(A1)'), "'=SUM(A1)");
  assert.equal(csvCell('+1'), "'+1");
  assert.equal(csvCell('@cmd'), "'@cmd");
});

test('the roster CSV has a header row and one row per member', () => {
  const members = [
    { name: 'Will', role: 'King', mcName: 'WillMC' },
    { name: 'Max', role: 'Prince', secondaryRole: 'Builder' },
  ];
  const csv = buildRosterCsv(members, member => (member.role === 'King' ? 5 : 2));
  assert.equal(
    csv,
    'Name,Role,Secondary role,Minecraft username,Voting points\r\nWill,King,,WillMC,5\r\nMax,Prince,Builder,,2\r\n',
  );
});
