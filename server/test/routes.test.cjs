const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../index.cjs');

async function withServer(fn) {
  const { app } = createApp({
    port: 0,
    pinataConfigured: false,
    pinataJwt: '',
    pinataGateway: '',
    magicLinkBaseUrl: 'http://localhost:5173/modern.html',
    magicLinkTtlSeconds: 900,
    sessionTtlSeconds: 86400,
    previewMagicLinks: true
  });

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

async function requestJson(baseUrl, path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: ['Bearer', token].join(' ') } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  return {
    status: response.status,
    body: await response.json()
  };
}

async function createSessionToken(baseUrl) {
  const linkResponse = await requestJson(baseUrl, '/api/v2/auth/request-link', {
    method: 'POST',
    body: { email: 'user@example.com' }
  });
  const token = new URL(linkResponse.body.previewUrl).searchParams.get('token');
  const verifyResponse = await requestJson(baseUrl, '/api/v2/auth/verify', {
    method: 'POST',
    body: { token }
  });

  return verifyResponse.body.sessionToken;
}

test('upload route rejects a missing file name', async () => {
  await withServer(async (baseUrl) => {
    const sessionToken = await createSessionToken(baseUrl);
    const response = await requestJson(baseUrl, '/api/v2/uploads/signed-url', {
      method: 'POST',
      token: sessionToken,
      body: {
        name: '',
        mimeType: 'text/plain',
        size: 5
      }
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'A file name is required.');
  });
});

test('upload route rejects a non-positive file size', async () => {
  await withServer(async (baseUrl) => {
    const sessionToken = await createSessionToken(baseUrl);
    const response = await requestJson(baseUrl, '/api/v2/uploads/signed-url', {
      method: 'POST',
      token: sessionToken,
      body: {
        name: 'hello.txt',
        mimeType: 'text/plain',
        size: 0
      }
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'A positive file size is required.');
  });
});

test('magic link verification is one-time use at the route level', async () => {
  await withServer(async (baseUrl) => {
    const linkResponse = await requestJson(baseUrl, '/api/v2/auth/request-link', {
      method: 'POST',
      body: { email: 'user@example.com' }
    });
    const token = new URL(linkResponse.body.previewUrl).searchParams.get('token');

    const firstVerify = await requestJson(baseUrl, '/api/v2/auth/verify', {
      method: 'POST',
      body: { token }
    });
    const secondVerify = await requestJson(baseUrl, '/api/v2/auth/verify', {
      method: 'POST',
      body: { token }
    });

    assert.equal(firstVerify.status, 200);
    assert.equal(typeof firstVerify.body.sessionToken, 'string');
    assert.equal(secondVerify.status, 400);
    assert.equal(secondVerify.body.error, 'The magic link is invalid or has expired.');
  });
});

test('protected routes reject missing bearer tokens', async () => {
  await withServer(async (baseUrl) => {
    const response = await requestJson(baseUrl, '/api/v2/uploads');

    assert.equal(response.status, 401);
    assert.equal(response.body.error, 'Your session is missing or has expired.');
  });
});
