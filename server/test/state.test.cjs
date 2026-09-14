const test = require('node:test');
const assert = require('node:assert/strict');
const { createRuntimeState, isValidEmail, normalizeEmail } = require('../state.cjs');

test('normalizeEmail trims and lowercases addresses', () => {
  assert.equal(normalizeEmail('  USER@Example.COM '), 'user@example.com');
});

test('isValidEmail accepts simple valid addresses and rejects invalid ones', () => {
  assert.equal(isValidEmail('user@example.com'), true);
  assert.equal(isValidEmail('not-an-email'), false);
});

test('magic links are one-time tokens', () => {
  const state = createRuntimeState();
  const link = state.createMagicLink('user@example.com');

  assert.equal(state.consumeMagicLink(link.token)?.email, 'user@example.com');
  assert.equal(state.consumeMagicLink(link.token), null);
});

test('sessions expire based on the configured ttl', () => {
  let now = 0;
  const state = createRuntimeState({
    sessionTtlSeconds: 1,
    clock: () => now
  });

  const session = state.createSession('user@example.com');
  assert.equal(state.getSession(session.token)?.email, 'user@example.com');

  now = 1001;
  assert.equal(state.getSession(session.token), null);
});
