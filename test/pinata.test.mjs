import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGatewayUrl, hasPinataSettings, normalizeGateway, uploadFiles, uploadMetadata } from '../js/modern/pinata.mjs';
import { sanitizeSession, settingsForStorage } from '../js/modern/storage.mjs';

test('normalizeGateway strips protocols and trailing slashes', () => {
  assert.equal(normalizeGateway('https://example.mypinata.cloud/'), 'example.mypinata.cloud');
});

test('hasPinataSettings requires both jwt and gateway', () => {
  assert.equal(hasPinataSettings({ pinataJwt: 'token', pinataGateway: 'example.mypinata.cloud' }), true);
  assert.equal(hasPinataSettings({ pinataJwt: '', pinataGateway: 'example.mypinata.cloud' }), false);
});

test('buildGatewayUrl returns null for pending cids and formats active cids', () => {
  assert.equal(buildGatewayUrl({ pinataGateway: 'example.mypinata.cloud' }, 'pending'), null);
  assert.equal(
    buildGatewayUrl({ pinataGateway: 'example.mypinata.cloud' }, 'bafy123'),
    'https://example.mypinata.cloud/ipfs/bafy123'
  );
});

test('sanitizeSession drops expired sessions', () => {
  const future = Date.now() + 1000;
  const session = { ownerDid: 'did:key:owner', sessionDid: 'did:key:123', delegationCid: 'bafydelegation', expiresAt: future };
  assert.equal(sanitizeSession(session, future - 1)?.sessionDid, 'did:key:123');
  assert.equal(sanitizeSession(session, future), null);
  for (const expiresAt of [Infinity, NaN, String(future), null]) assert.equal(sanitizeSession({ ...session, expiresAt }, future - 1), null);
  for (const key of ['ownerDid', 'sessionDid', 'delegationCid']) assert.equal(sanitizeSession({ ...session, [key]: '' }, future - 1), null);
});

test('JWT persistence is opt-in and does not copy unrelated profile or secret fields', () => {
  const settings = { pinataJwt: 'test-only', pinataGateway: 'example.com', extra: 'private' };
  assert.equal('pinataJwt' in settingsForStorage(settings), false);
  assert.equal(settingsForStorage(settings, true).pinataJwt, 'test-only');
  assert.equal('extra' in settingsForStorage(settings, true), false);
});

test('gateway input cannot smuggle credentials, paths, schemes or query strings', () => {
  for (const value of ['javascript:alert(1)', 'example.com/path', 'user:pass@example.com', 'example.com?token=secret', 'example.com:8080', 'example.com#fragment']) {
    assert.throws(() => normalizeGateway(value), /domain only/);
  }
});

test('upload metadata excludes personal profile data and keys; sessions must be current and match the owner', async () => {
  const identity = { ownerDid: 'did:key:owner', profileName: 'Private name', profileEmail: 'private@example.test', ownerKey: 'secret' };
  const session = { ownerDid: identity.ownerDid, sessionDid: 'did:key:session', delegationCid: 'bafydelegation', expiresAt: 2000, sessionKey: 'secret' };
  assert.deepEqual(uploadMetadata(identity, session, 1000), {
    ownerDid: identity.ownerDid, sessionDid: session.sessionDid, delegationCid: session.delegationCid
  });
  assert.throws(() => uploadMetadata(identity, session, 2000), /expired/);
  assert.throws(() => uploadMetadata(identity, { ...session, ownerDid: 'did:key:other' }, 1000), /identity/);
  assert.throws(() => uploadMetadata(identity, { ...session, expiresAt: Infinity }), /expired/);
  await assert.rejects(uploadFiles({}, identity, { ...session, expiresAt: 1 }, []), /expired/);
});
