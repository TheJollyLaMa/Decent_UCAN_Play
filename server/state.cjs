const crypto = require('node:crypto');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function createRuntimeState({
  magicLinkTtlSeconds = 900,
  sessionTtlSeconds = 86400,
  clock = () => Date.now()
} = {}) {
  const magicLinks = new Map();
  const sessions = new Map();

  function issueToken(store, ttlSeconds, payload) {
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = clock() + (ttlSeconds * 1000);
    store.set(token, { ...payload, expiresAt });
    return { token, expiresAt, ...payload };
  }

  function readToken(store, token, { consume = false } = {}) {
    const record = store.get(token);

    if (!record) {
      return null;
    }

    if (record.expiresAt <= clock()) {
      store.delete(token);
      return null;
    }

    if (consume) {
      store.delete(token);
    }

    return record;
  }

  return {
    createMagicLink(email) {
      return issueToken(magicLinks, magicLinkTtlSeconds, {
        email: normalizeEmail(email)
      });
    },
    consumeMagicLink(token) {
      return readToken(magicLinks, token, { consume: true });
    },
    createSession(email) {
      return issueToken(sessions, sessionTtlSeconds, {
        email: normalizeEmail(email)
      });
    },
    getSession(token) {
      return readToken(sessions, token);
    },
    revokeSession(token) {
      sessions.delete(token);
    }
  };
}

module.exports = {
  createRuntimeState,
  isValidEmail,
  normalizeEmail
};
