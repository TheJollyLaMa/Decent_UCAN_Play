import { del, get, set } from 'idb-keyval';

const SETTINGS_KEY = 'modern.pinata.settings';
const IDENTITY_KEY = 'modern.identity';
const SESSION_KEY = 'modern.session';

export function sanitizeSession(session, now = Date.now()) {
  if (!session || !['ownerDid', 'sessionDid', 'delegationCid'].every(key => typeof session[key] === 'string' && session[key].length > 0) ||
      !Number.isFinite(session.expiresAt)) {
    return null;
  }

  return session.expiresAt > now ? session : null;
}

export async function loadSettings() {
  return (await get(SETTINGS_KEY)) || null;
}

export function settingsForStorage(settings, rememberJwt = false) {
  return {
    pinataGateway: settings.pinataGateway,
    ...(rememberJwt ? { pinataJwt: settings.pinataJwt } : {}),
    updatedAt: Date.now()
  };
}

export async function saveSettings(settings, { rememberJwt = false } = {}) {
  await set(SETTINGS_KEY, settingsForStorage(settings, rememberJwt));
}

export async function clearSettings() {
  await del(SETTINGS_KEY);
}

export async function loadIdentity() {
  return (await get(IDENTITY_KEY)) || null;
}

export async function saveIdentity(identity) {
  await set(IDENTITY_KEY, identity);
}

export async function clearIdentity() {
  await del(IDENTITY_KEY);
}

export async function loadSession() {
  return sanitizeSession(await get(SESSION_KEY));
}

export async function saveSession(session) {
  await set(SESSION_KEY, session);
}

export async function clearSession() {
  await del(SESSION_KEY);
}

export async function clearWorkspace() {
  await Promise.all([
    clearSettings(),
    clearIdentity(),
    clearSession()
  ]);
}
