const API_ROOT = '/api/v2';

async function request(path, { method = 'GET', body, sessionToken } = {}) {
  const authorizationHeader = sessionToken
    ? { Authorization: ['Bearer', sessionToken].join(' ') }
    : {};

  const response = await fetch(`${API_ROOT}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authorizationHeader
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => ({
    ok: false,
    error: 'The server returned an unreadable response.'
  }));

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || 'Request failed.');
  }

  return payload;
}

export function getHealth() {
  return request('/health');
}

export function requestMagicLink(email) {
  return request('/auth/request-link', {
    method: 'POST',
    body: { email }
  });
}

export function verifyMagicLink(token) {
  return request('/auth/verify', {
    method: 'POST',
    body: { token }
  });
}

export function getUploads(sessionToken) {
  return request('/uploads', { sessionToken });
}

export function createSignedUploadUrl(sessionToken, file) {
  return request('/uploads/signed-url', {
    method: 'POST',
    sessionToken,
    body: {
      name: file.name,
      mimeType: file.type,
      size: file.size
    }
  });
}

export function logout(sessionToken) {
  return request('/auth/logout', {
    method: 'POST',
    sessionToken
  });
}
