function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readConfig(env = process.env) {
  const pinataJwt = env.PINATA_JWT || '';
  const pinataGateway = env.PINATA_GATEWAY || '';

  return {
    port: toNumber(env.PORT, 8787),
    pinataJwt,
    pinataGateway,
    pinataConfigured: Boolean(pinataJwt && pinataGateway),
    magicLinkBaseUrl: env.MAGIC_LINK_BASE_URL || 'http://localhost:5173/modern.html',
    magicLinkTtlSeconds: toNumber(env.MAGIC_LINK_TTL_SECONDS, 900),
    sessionTtlSeconds: toNumber(env.SESSION_TTL_SECONDS, 86400),
    previewMagicLinks: env.DEV_MAGIC_LINK_PREVIEW !== '0'
  };
}

module.exports = {
  readConfig
};
