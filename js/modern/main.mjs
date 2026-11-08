import { clearSession, clearSettings, clearWorkspace, loadIdentity, loadSession, loadSettings, sanitizeSession, saveIdentity, saveSession, saveSettings } from './storage.mjs';
import { createLocalSession, createRootIdentity, describeIdentity } from './identity.mjs';
import { hasPinataSettings, listUploads, normalizeGateway, uploadFiles } from './pinata.mjs';

const elements = {
  clearSettingsButton: document.getElementById('clearSettingsButton'),
  clearWorkspaceButton: document.getElementById('clearWorkspaceButton'),
  fileInput: document.getElementById('fileInput'),
  identityForm: document.getElementById('identityForm'),
  identityStatus: document.getElementById('identityStatus'),
  identitySummary: document.getElementById('identitySummary'),
  pinataGatewayInput: document.getElementById('pinataGatewayInput'),
  pinataJwtInput: document.getElementById('pinataJwtInput'),
  rememberJwtInput: document.getElementById('rememberJwtInput'),
  publicUploadConsent: document.getElementById('publicUploadConsent'),
  profileEmailInput: document.getElementById('profileEmailInput'),
  profileNameInput: document.getElementById('profileNameInput'),
  refreshUploadsButton: document.getElementById('refreshUploadsButton'),
  sessionSummary: document.getElementById('sessionSummary'),
  settingsForm: document.getElementById('settingsForm'),
  settingsStatus: document.getElementById('settingsStatus'),
  startSessionButton: document.getElementById('startSessionButton'),
  uploadForm: document.getElementById('uploadForm'),
  uploadPanel: document.getElementById('uploadPanel'),
  uploadsList: document.getElementById('uploadsList'),
  uploadsPanel: document.getElementById('uploadsPanel'),
  uploadStatus: document.getElementById('uploadStatus')
};

const state = {
  settings: null,
  identity: null,
  session: null
};

function setStatus(element, message, isError = false) {
  element.setAttribute('aria-live', isError ? 'assertive' : 'polite');
  element.textContent = message;
  element.classList.toggle('error', isError);
}

function canUpload() {
  state.session = sanitizeSession(state.session);
  return Boolean(state.identity && state.session?.ownerDid === state.identity.ownerDid && hasPinataSettings(state.settings));
}

function renderUploads(uploads) {
  elements.uploadsList.innerHTML = '';

  if (!uploads.length) {
    const item = document.createElement('li');
    item.textContent = 'No uploads found for this DID yet.';
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
    meta.textContent = `${upload.cid} · ${upload.size} bytes · ${new Date(upload.created_at || Date.now()).toLocaleString()}`;

    item.appendChild(title);
    item.appendChild(meta);
    elements.uploadsList.appendChild(item);
  });
}

function renderIdentity() {
  const description = describeIdentity(state.identity, state.session);
  elements.identitySummary.innerHTML = '';

  const title = document.createElement('p');
  title.textContent = description.title;
  elements.identitySummary.appendChild(title);

  if (description.detailLines.length) {
    const list = document.createElement('ul');
    description.detailLines.forEach((line) => {
      const item = document.createElement('li');
      item.textContent = line;
      list.appendChild(item);
    });
    elements.identitySummary.appendChild(list);
  }

  const ready = canUpload();
  const activeSession = Boolean(state.session?.sessionDid);
  elements.uploadPanel.hidden = !ready;
  elements.uploadsPanel.hidden = !ready;
  elements.startSessionButton.disabled = !state.identity;
  elements.sessionSummary.textContent = activeSession
    ? `Local UCAN session active until ${new Date(state.session.expiresAt).toLocaleString()}.`
    : 'Start a local UCAN session to enable uploads.';
}

function renderSettings() {
  elements.pinataJwtInput.value = state.settings?.pinataJwt || '';
  elements.pinataGatewayInput.value = state.settings?.pinataGateway || '';
}

async function refreshUploads() {
  if (!canUpload()) {
    renderUploads([]);
    return;
  }

  const uploads = await listUploads(state.settings, state.identity.ownerDid);
  renderUploads(uploads);
}

async function handleSettingsSubmit(event) {
  event.preventDefault();

  const settings = {
    pinataJwt: elements.pinataJwtInput.value.trim(),
    pinataGateway: normalizeGateway(elements.pinataGatewayInput.value)
  };

  if (!hasPinataSettings(settings)) {
    setStatus(elements.settingsStatus, 'Provide both a Pinata JWT and gateway domain.', true);
    return;
  }

  const rememberJwt = elements.rememberJwtInput.checked;
  await saveSettings(settings, { rememberJwt });
  state.settings = settings;
  renderSettings();
  renderIdentity();
  setStatus(elements.settingsStatus, rememberJwt
    ? 'JWT saved unencrypted in IndexedDB by your choice. Use a scoped personal credential, never a shared project secret.'
    : 'JWT kept in this page memory only. The gateway is saved; reload or closing this page requires entering the JWT again.');

  if (canUpload()) {
    await refreshUploads().catch((error) => {
      setStatus(elements.uploadStatus, error.message, true);
    });
  }
}

async function handleIdentitySubmit(event) {
  event.preventDefault();

  if (state.identity && !window.confirm('Replace the existing local DID and end the current session?')) {
    return;
  }

  const identity = await createRootIdentity({
    profileName: elements.profileNameInput.value,
    profileEmail: elements.profileEmailInput.value
  });

  await saveIdentity(identity);
  await clearSession();
  state.identity = identity;
  state.session = null;
  renderIdentity();
  setStatus(elements.identityStatus, 'A new local did:key identity was created in IndexedDB.');
  setStatus(elements.uploadStatus, 'Start a local UCAN session before uploading.');
}

async function handleStartSession() {
  if (!state.identity) {
    setStatus(elements.identityStatus, 'Create a local DID before starting a session.', true);
    return;
  }

  const session = await createLocalSession(state.identity);
  await saveSession(session);
  state.session = session;
  renderIdentity();
  setStatus(elements.identityStatus, 'Local UCAN delegation created for this browser session.');

  if (canUpload()) {
    await refreshUploads().catch((error) => {
      setStatus(elements.uploadStatus, error.message, true);
    });
  }
}

async function handleUploadSubmit(event) {
  event.preventDefault();

  if (!canUpload()) {
    renderIdentity();
    setStatus(elements.uploadStatus, 'Save Pinata settings and start a local UCAN session before uploading.', true);
    return;
  }
  if (!elements.publicUploadConsent.checked) {
    setStatus(elements.uploadStatus, 'Confirm that the selected files may be public before uploading.', true);
    return;
  }

  const files = Array.from(elements.fileInput.files || []);
  if (!files.length) {
    setStatus(elements.uploadStatus, 'Choose at least one file.', true);
    return;
  }

  setStatus(elements.uploadStatus, `Uploading ${files.length} file(s) directly from the browser…`);

  try {
    await uploadFiles(state.settings, state.identity, state.session, files);
    elements.uploadForm.reset();
    setStatus(elements.uploadStatus, `Uploaded ${files.length} file(s) with the current local UCAN session.`);
    await refreshUploads();
  } catch (error) {
    setStatus(elements.uploadStatus, `${error.message} Some files may already have uploaded; check the provider before retrying.`, true);
  }
}

async function handleClearSettings() {
  await clearSettings();
  state.settings = null;
  renderSettings();
  renderIdentity();
  renderUploads([]);
  elements.rememberJwtInput.checked = false;
  setStatus(elements.settingsStatus, 'Local settings and the in-memory JWT cleared. This does not revoke the JWT at Pinata.');
}

async function handleClearWorkspace() {
  if (!window.confirm('Clear the stored Pinata settings, DID identity, and local session from this browser?')) {
    return;
  }

  await clearWorkspace();
  state.settings = null;
  state.identity = null;
  state.session = null;
  elements.identityForm.reset();
  elements.settingsForm.reset();
  renderIdentity();
  renderUploads([]);
  setStatus(elements.identityStatus, 'Local workspace cleared from IndexedDB.');
  setStatus(elements.settingsStatus, '');
  setStatus(elements.uploadStatus, '');
}

async function hydrate() {
  state.settings = await loadSettings();
  elements.rememberJwtInput.checked = Boolean(state.settings?.pinataJwt);
  if (state.settings?.pinataJwt) {
    setStatus(elements.settingsStatus, 'An existing unencrypted JWT was restored from browser storage. Clear settings to remove it; revoke it at Pinata if needed.');
  }
  state.identity = await loadIdentity();
  state.session = await loadSession();

  if (!state.session) {
    await clearSession();
  }

  renderSettings();

  if (state.identity) {
    elements.profileNameInput.value = state.identity.profileName || '';
    elements.profileEmailInput.value = state.identity.profileEmail || '';
  }

  renderIdentity();

  if (canUpload()) {
    await refreshUploads().catch((error) => {
      setStatus(elements.uploadStatus, error.message, true);
    });
  }
}

elements.settingsForm.addEventListener('submit', (event) => {
  handleSettingsSubmit(event).catch((error) => {
    setStatus(elements.settingsStatus, error.message, true);
  });
});

elements.identityForm.addEventListener('submit', (event) => {
  handleIdentitySubmit(event).catch((error) => {
    setStatus(elements.identityStatus, error.message, true);
  });
});

elements.startSessionButton.addEventListener('click', () => {
  handleStartSession().catch((error) => {
    setStatus(elements.identityStatus, error.message, true);
  });
});

elements.uploadForm.addEventListener('submit', (event) => {
  handleUploadSubmit(event).catch((error) => {
    setStatus(elements.uploadStatus, error.message, true);
  });
});

elements.refreshUploadsButton.addEventListener('click', () => {
  refreshUploads().catch((error) => {
    setStatus(elements.uploadStatus, error.message, true);
  });
});

elements.clearSettingsButton.addEventListener('click', () => {
  handleClearSettings().catch((error) => {
    setStatus(elements.settingsStatus, error.message, true);
  });
});

elements.clearWorkspaceButton.addEventListener('click', () => {
  handleClearWorkspace().catch((error) => {
    setStatus(elements.identityStatus, error.message, true);
  });
});

hydrate().catch((error) => {
  setStatus(elements.identityStatus, error.message, true);
});

setInterval(() => {
  if (state.session && !sanitizeSession(state.session)) {
    state.session = null;
    renderIdentity();
    clearSession().catch(error => setStatus(elements.identityStatus, error.message, true));
    setStatus(elements.identityStatus, 'Local session expired. Start a new session to continue.');
  }
}, 10000);
