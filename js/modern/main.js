import { PinataSDK } from 'pinata';
import { createSignedUploadUrl, getHealth, getUploads, requestMagicLink, verifyMagicLink } from './api.js';
import { clearSession, loadSession, saveSession } from './session.js';

const elements = {
  authStatus: document.getElementById('authStatus'),
  emailInput: document.getElementById('emailInput'),
  fileInput: document.getElementById('fileInput'),
  loginForm: document.getElementById('loginForm'),
  magicLinkAnchor: document.getElementById('magicLinkAnchor'),
  magicLinkPreview: document.getElementById('magicLinkPreview'),
  refreshUploads: document.getElementById('refreshUploads'),
  sessionInfo: document.getElementById('sessionInfo'),
  sessionPanel: document.getElementById('sessionPanel'),
  uploadForm: document.getElementById('uploadForm'),
  uploadsList: document.getElementById('uploadsList'),
  uploadsPanel: document.getElementById('uploadsPanel'),
  uploadStatus: document.getElementById('uploadStatus')
};

let health = null;
let session = loadSession();

function setStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('error', isError);
}

function renderSession() {
  const active = Boolean(session?.sessionToken);
  elements.sessionPanel.hidden = !active;
  elements.uploadsPanel.hidden = !active;

  if (!active) {
    elements.sessionInfo.textContent = '';
    return;
  }

  elements.sessionInfo.textContent = `Signed in as ${session.email}. Session expires ${new Date(session.expiresAt).toLocaleString()}.`;
}

function renderUploads(uploads) {
  elements.uploadsList.innerHTML = '';

  if (!uploads.length) {
    const item = document.createElement('li');
    item.textContent = 'No uploads found for this email yet.';
    elements.uploadsList.appendChild(item);
    return;
  }

  uploads.forEach((upload) => {
    const item = document.createElement('li');
    const title = document.createElement(upload.gatewayUrl ? 'a' : 'span');

    title.textContent = upload.name || upload.cid;
    if (upload.gatewayUrl) {
      title.href = upload.gatewayUrl;
      title.target = '_blank';
      title.rel = 'noopener noreferrer';
    }

    const meta = document.createElement('small');
    meta.textContent = `${upload.cid} · ${upload.size} bytes · ${new Date(upload.created_at).toLocaleString()}`;

    item.appendChild(title);
    item.appendChild(meta);
    elements.uploadsList.appendChild(item);
  });
}

async function refreshUploadsList() {
  if (!session?.sessionToken) {
    return;
  }

  const response = await getUploads(session.sessionToken);
  renderUploads(response.uploads);
}

async function handleMagicLinkFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    return;
  }

  setStatus(elements.authStatus, 'Verifying your magic link…');
  params.delete('token');
  const query = params.toString();
  window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);

  try {
    const verified = await verifyMagicLink(token);
    session = verified;
    saveSession(session);
    renderSession();
    await refreshUploadsList();
    setStatus(elements.authStatus, 'Magic link verified. You can upload files now.');
  } catch (error) {
    clearSession();
    session = null;
    renderSession();
    setStatus(elements.authStatus, error.message, true);
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  elements.magicLinkPreview.hidden = true;
  setStatus(elements.authStatus, 'Requesting a magic link…');

  try {
    const response = await requestMagicLink(elements.emailInput.value);
    setStatus(elements.authStatus, response.message);

    if (response.previewUrl) {
      elements.magicLinkAnchor.href = response.previewUrl;
      elements.magicLinkAnchor.textContent = response.previewUrl;
      elements.magicLinkPreview.hidden = false;
    }
  } catch (error) {
    setStatus(elements.authStatus, error.message, true);
  }
}

async function handleUploadSubmit(event) {
  event.preventDefault();

  if (!session?.sessionToken) {
    setStatus(elements.uploadStatus, 'Sign in before uploading.', true);
    return;
  }

  const files = Array.from(elements.fileInput.files || []);
  if (!files.length) {
    setStatus(elements.uploadStatus, 'Choose at least one file.', true);
    return;
  }

  setStatus(elements.uploadStatus, `Uploading ${files.length} file(s)…`);

  try {
    for (const file of files) {
      const { signedUrl } = await createSignedUploadUrl(session.sessionToken, file);
      const pinata = new PinataSDK({
        pinataGateway: health?.pinataGateway || undefined,
        uploadUrl: signedUrl
      });
      await pinata.upload.public.file(file);
    }

    elements.uploadForm.reset();
    setStatus(elements.uploadStatus, `Uploaded ${files.length} file(s) to Pinata.`);
    await refreshUploadsList();
  } catch (error) {
    setStatus(elements.uploadStatus, error.message, true);
  }
}

async function init() {
  health = await getHealth().catch((error) => {
    setStatus(elements.authStatus, error.message, true);
    return null;
  });

  renderSession();

  if (!health) {
    return;
  }

  if (session?.sessionToken) {
    try {
      await refreshUploadsList();
    } catch (error) {
      clearSession();
      session = null;
      renderSession();
      setStatus(elements.authStatus, error.message, true);
    }
  }

  await handleMagicLinkFromUrl();

  if (health && !health.pinataConfigured) {
    setStatus(elements.uploadStatus, 'Pinata is not configured yet. Add PINATA_JWT and PINATA_GATEWAY to run the modern flow.', true);
  }
}

elements.loginForm.addEventListener('submit', handleLoginSubmit);
elements.uploadForm.addEventListener('submit', handleUploadSubmit);
elements.refreshUploads.addEventListener('click', () => {
  refreshUploadsList().catch((error) => {
    setStatus(elements.uploadStatus, error.message, true);
  });
});

init();
