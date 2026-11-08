import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalSession, createRootIdentity } from '../js/modern/identity.mjs';

test('createRootIdentity returns a did:key owner identity', async () => {
  const identity = await createRootIdentity({
    profileName: 'Operator',
    profileEmail: 'operator@example.com'
  });

  assert.match(identity.ownerDid, /^did:key:/);
  assert.equal(identity.profileName, 'Operator');
  assert.equal(identity.profileEmail, 'operator@example.com');
  assert.equal(typeof identity.ownerKey, 'string');
});

test('createLocalSession delegates browser-local upload capabilities', async () => {
  const identity = await createRootIdentity({ profileName: 'Operator' });
  const session = await createLocalSession(identity, { ttlSeconds: 120 });

  assert.equal(session.ownerDid, identity.ownerDid);
  assert.match(session.sessionDid, /^did:key:/);
  assert.notEqual(session.sessionDid, identity.ownerDid);
  assert.equal(session.capabilities.length, 2);
  assert.equal(session.capabilities[0].can, 'pinata/upload');
  assert.ok(session.expiresAt > Date.now());
  assert.equal(session.delegation.issuerDid, identity.ownerDid);
  assert.equal(session.delegation.audienceDid, session.sessionDid);
});
