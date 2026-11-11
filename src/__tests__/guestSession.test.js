import test from 'node:test';
import assert from 'node:assert/strict';
import { GUEST_DURATION_MS, formatRemaining } from '../guestSession.js';

test('guest preview lasts ten minutes', () => {
  assert.equal(GUEST_DURATION_MS, 10 * 60 * 1000);
});

test('formatRemaining shows minutes and zero-padded seconds', () => {
  assert.equal(formatRemaining(600000), '10:00');
  assert.equal(formatRemaining(65000), '1:05');
  assert.equal(formatRemaining(59001), '1:00');
});

test('formatRemaining never goes below zero', () => {
  assert.equal(formatRemaining(0), '0:00');
  assert.equal(formatRemaining(-5000), '0:00');
});
