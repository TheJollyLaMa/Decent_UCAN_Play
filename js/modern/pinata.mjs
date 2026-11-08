import { PinataSDK } from 'pinata';
import { sanitizeSession } from './storage.mjs';

const UPLOAD_CONCURRENCY = 3;

export function normalizeGateway(value = '') {
  const gateway = String(value)
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/g, '');
  if (!gateway) return '';
  if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(gateway)) {
    throw new Error('Use a gateway domain only, without credentials, paths, query strings or ports.');
  }
  return gateway.toLowerCase();
}

export function hasPinataSettings(settings) {
  return Boolean(settings?.pinataJwt?.trim() && normalizeGateway(settings?.pinataGateway));
}

export function buildGatewayUrl(settings, cid) {
  const gateway = normalizeGateway(settings?.pinataGateway);

  if (!gateway || !cid || cid === 'pending') {
    return null;
  }

  return `https://${gateway}/ipfs/${cid}`;
}

export function createPinataClient(settings) {
  if (!hasPinataSettings(settings)) {
    throw new Error('Save your Pinata JWT and gateway locally before using the modern path.');
  }

  return new PinataSDK({
    pinataJwt: settings.pinataJwt.trim(),
    pinataGateway: normalizeGateway(settings.pinataGateway)
  });
}

export async function listUploads(settings, ownerDid, limit = 25) {
  const client = createPinataClient(settings);
  const response = await client.files.public.list()
    .keyvalues({ ownerDid })
    .order('DESC')
    .limit(limit);

  return response.files.map((file) => ({
    ...file,
    gatewayUrl: buildGatewayUrl(settings, file.cid)
  }));
}

export async function uploadFiles(settings, identity, session, files) {
  uploadMetadata(identity, session);
  const client = createPinataClient(settings);
  const tasks = files.map((file) => async () => {
    const metadata = uploadMetadata(identity, session);
    const upload = await client.upload.public.file(file)
      .name(file.name)
      .keyvalues(metadata);

    return {
      ...upload,
      gatewayUrl: buildGatewayUrl(settings, upload.cid)
    };
  });

  const uploads = [];
  for (let index = 0; index < tasks.length; index += UPLOAD_CONCURRENCY) {
    const batch = await Promise.all(tasks.slice(index, index + UPLOAD_CONCURRENCY).map((task) => task()));
    uploads.push(...batch);
  }

  return uploads;
}

export function uploadMetadata(identity, session, now = Date.now()) {
  if (!identity?.ownerDid || !sanitizeSession(session, now) || session.ownerDid !== identity.ownerDid) {
    throw new Error('The local session is expired or does not belong to this identity. Start a new session.');
  }
  return {
    ownerDid: identity.ownerDid,
    sessionDid: session.sessionDid,
    delegationCid: session.delegationCid
  };
}
