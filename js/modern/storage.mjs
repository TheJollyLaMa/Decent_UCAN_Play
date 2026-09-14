import { del, get, set } from 'idb-keyval';

const SETTINGS_KEY = 'modern.pinata.settings';
const IDENTITY_KEY = 'modern.identity';
const SESSION_KEY = 'modern.session';

export function sanitizeSession(session, now = Date.now()) {
  if (!session?.sessionDid || !session?.expiresAt) {
    return null;
  }

  return Number(session.expiresAt) > now ? session : null;
}

export async function loadSettings() {
  return (await get(SETTINGS_KEY)) || null;
}

export async function saveSettings(settings) {
  await set(SETTINGS_KEY, {
    ...settings,
    updatedAt: Date.now()
  });
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
