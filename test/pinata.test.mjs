import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGatewayUrl, hasPinataSettings, normalizeGateway } from '../js/modern/pinata.mjs';
import { sanitizeSession } from '../js/modern/storage.mjs';

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
  assert.equal(sanitizeSession({ sessionDid: 'did:key:123', expiresAt: future }, future - 1)?.sessionDid, 'did:key:123');
  assert.equal(sanitizeSession({ sessionDid: 'did:key:123', expiresAt: future }, future), null);
});
