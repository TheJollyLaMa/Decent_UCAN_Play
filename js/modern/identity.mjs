import * as Principal from '@ucanto/principal';
import { delegate } from '@ucanto/core';

const SESSION_LIFETIME_SECONDS = 60 * 60;

const DEFAULT_CAPABILITIES = [
  {
    with: 'storage:pinata',
    can: 'pinata/upload',
    nb: {
      scope: 'public',
      localFirst: true
    }
  },
  {
    with: 'storage:pinata',
    can: 'pinata/list',
    nb: {
      scope: 'public',
      localFirst: true
    }
  }
];

function serializeSigner(signer) {
  return Principal.ed25519.format(signer);
}

function parseSigner(serializedSigner) {
  return Principal.ed25519.parse(serializedSigner);
}

export async function createRootIdentity({ profileName = '', profileEmail = '' } = {}) {
  const signer = await Principal.ed25519.generate();

  return {
    ownerDid: signer.did(),
    ownerKey: serializeSigner(signer),
    profileName: profileName.trim(),
    profileEmail: profileEmail.trim(),
    createdAt: Date.now()
  };
}

export async function createLocalSession(identity, { ttlSeconds = SESSION_LIFETIME_SECONDS } = {}) {
  const ownerSigner = parseSigner(identity.ownerKey);
  const sessionSigner = await Principal.ed25519.generate();
  const expiration = Math.floor(Date.now() / 1000) + ttlSeconds;
  const delegation = await delegate({
    issuer: ownerSigner,
    audience: sessionSigner,
    expiration,
    capabilities: DEFAULT_CAPABILITIES,
    facts: [
      {
        ownerDid: identity.ownerDid,
        profileName: identity.profileName || '',
        profileEmail: identity.profileEmail || ''
      }
    ]
  });

  return {
    ownerDid: identity.ownerDid,
    sessionDid: sessionSigner.did(),
    sessionKey: serializeSigner(sessionSigner),
    delegationCid: delegation.cid.toString(),
    capabilities: delegation.capabilities.map((capability) => ({
      with: capability.with,
      can: capability.can,
      nb: capability.nb || null
    })),
    expiresAt: delegation.expiration * 1000,
    createdAt: Date.now(),
    delegation: {
      cid: delegation.cid.toString(),
      issuerDid: ownerSigner.did(),
      audienceDid: sessionSigner.did(),
      expiration: delegation.expiration,
      capabilities: delegation.capabilities.map((capability) => ({
        with: capability.with,
        can: capability.can,
        nb: capability.nb || null
      }))
    }
  };
}

export function describeIdentity(identity, session) {
  if (!identity) {
    return {
      title: 'No local DID stored yet.',
      detailLines: []
    };
  }

  const detailLines = [
    `Owner DID: ${identity.ownerDid}`
  ];

  if (identity.profileName) {
    detailLines.push(`Profile: ${identity.profileName}`);
  }

  if (identity.profileEmail) {
    detailLines.push(`Metadata email: ${identity.profileEmail}`);
  }

  if (session?.sessionDid) {
    detailLines.push(`Session DID: ${session.sessionDid}`);
    detailLines.push(`Delegation CID: ${session.delegationCid}`);
    detailLines.push(`Session expires: ${new Date(session.expiresAt).toLocaleString()}`);
  }

  return {
    title: 'Local identity ready.',
    detailLines
  };
}
