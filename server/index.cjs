const express = require('express');
const { readConfig } = require('./config.cjs');
const { createRuntimeState, isValidEmail, normalizeEmail } = require('./state.cjs');
const { createSignedUploadUrl, listUploads } = require('./pinata.cjs');

function createRateLimiter({ limit = 5, windowMs = 60_000, now = () => Date.now() } = {}) {
  const buckets = new Map();

  return {
    allow(key) {
      const windowStart = now() - windowMs;
      const recentHits = (buckets.get(key) || []).filter((value) => value > windowStart);

      if (recentHits.length >= limit) {
        buckets.set(key, recentHits);
        return false;
      }

      recentHits.push(now());
      buckets.set(key, recentHits);
      return true;
    }
  };
}

function createApp(config = readConfig(), services = { createSignedUploadUrl, listUploads }) {
  const app = express();
  const state = createRuntimeState(config);
  const requestLinkLimiter = createRateLimiter();

  app.use(express.json());

  app.get('/api/v2/health', (_req, res) => {
    res.json({
      ok: true,
      pinataConfigured: config.pinataConfigured,
      pinataGateway: config.pinataGateway || null
    });
  });

  app.post('/api/v2/auth/request-link', (req, res) => {
    const email = normalizeEmail(req.body?.email);

    if (!isValidEmail(email)) {
      return res.status(400).json({
        ok: false,
        error: 'Please provide a valid email address.'
      });
    }

    const requestKey = `${req.ip}:${email}`;
    if (!requestLinkLimiter.allow(requestKey)) {
      return res.status(429).json({
        ok: false,
        error: 'Too many magic link requests. Please wait and try again.'
      });
    }

    const magicLink = state.createMagicLink(email);
    const separator = config.magicLinkBaseUrl.includes('?') ? '&' : '?';
    const previewUrl = `${config.magicLinkBaseUrl}${separator}token=${magicLink.token}`;

    console.info(`[modern-auth] Magic link requested for ${email}; expires at ${new Date(magicLink.expiresAt).toISOString()}`);

    return res.json({
      ok: true,
      email,
      expiresAt: magicLink.expiresAt,
      previewUrl: config.previewMagicLinks ? previewUrl : null,
      message: config.previewMagicLinks
        ? 'Preview mode is enabled. Open the returned magic link to complete sign-in.'
        : 'Magic link created. Deliver it through your email provider integration.'
    });
  });

  app.post('/api/v2/auth/verify', (req, res) => {
    const token = String(req.body?.token || '');
    const magicLink = state.consumeMagicLink(token);

    if (!magicLink) {
      return res.status(400).json({
        ok: false,
        error: 'The magic link is invalid or has expired.'
      });
    }

    const session = state.createSession(magicLink.email);

    return res.json({
      ok: true,
      email: session.email,
      sessionToken: session.token,
      expiresAt: session.expiresAt,
      provider: 'pinata',
      gatewayBaseUrl: config.pinataGateway ? `https://${config.pinataGateway}/ipfs/` : null
    });
  });

  function requireSession(req, res, next) {
    const authHeader = req.get('authorization') || '';
    const sessionToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';
    const session = state.getSession(sessionToken);

    if (!session) {
      return res.status(401).json({
        ok: false,
        error: 'Your session is missing or has expired.'
      });
    }

    req.session = {
      token: sessionToken,
      email: session.email,
      expiresAt: session.expiresAt
    };
    next();
  }

  app.post('/api/v2/auth/logout', requireSession, (req, res) => {
    state.revokeSession(req.session.token);
    res.json({ ok: true });
  });

  app.get('/api/v2/uploads', requireSession, async (req, res, next) => {
    try {
      const uploads = await services.listUploads(config, { email: req.session.email });
      res.json({ ok: true, uploads });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/v2/uploads/signed-url', requireSession, async (req, res, next) => {
    const name = String(req.body?.name || '').trim();
    const mimeType = String(req.body?.mimeType || '').trim();
    const size = Number(req.body?.size || 0);

    if (!name) {
      return res.status(400).json({
        ok: false,
        error: 'A file name is required.'
      });
    }

    if (!Number.isFinite(size) || size <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'A positive file size is required.'
      });
    }

    try {
      const signedUrl = await services.createSignedUploadUrl(config, {
        email: req.session.email,
        name,
        mimeType,
        size
      });

      res.json({
        ok: true,
        signedUrl,
        provider: 'pinata'
      });
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    const isConfigurationError = /not configured/i.test(message);
    const status = isConfigurationError ? 503 : 500;

    res.status(status).json({
      ok: false,
      error: isConfigurationError ? message : 'Unexpected server error.'
    });
  });

  return { app, config };
}

if (require.main === module) {
  const { app, config } = createApp();
  app.listen(config.port, () => {
    console.log(`Pinata sidecar listening on http://localhost:${config.port}`);
  });
}

module.exports = {
  createApp,
  createRateLimiter
};
