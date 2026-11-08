window.DECENT_CONFIG = {
  version: '2.0.0', appName: 'Decent UCAN Play', subtitle: 'Local identity · public-only BYOK storage',
  chain: null, ens: { enabled: false },
  theme: { accent: '#e7bf73', 'accent-2': '#95dce4', 'bg-1': '#172738', 'bg-2': '#293349', 'bg-3': '#344155' },
  about: { title: 'About Decent UCAN Play', summary: 'Local-first DID/session exploration and explicit public-only Pinata uploads.',
    sections: [{ title: 'Authorization reality', body: 'A local UCAN session is not provider-enforced authorization. Pinata uses your own JWT. The modern app keeps JWTs session-only by default; optional unencrypted persistence must be explicitly chosen in app settings. Wallet identity does not replace the DID session; the header wallet is observation-only here and never signs, sends transactions or switches chains for this app.' },
      { title: 'Public data only', body: 'Use only intentionally public files. Never upload NDA plaintext, secrets or personal records. Header Pinata/Kubo selection is a separate session, not app provider migration, upload success or retention proof.' }] },
  ipfsAdapter: { version: 1, label: 'UCAN public-only app controls',
    capabilities: { backup: { open: () => {
      const form = document.getElementById('settingsForm');
      if (!form) throw new Error('Use modern.html for BYOK public-file controls');
      form.scrollIntoView({ block: 'center' });
      document.getElementById('pinataJwtInput').focus();
    } } },
    getStatus: async () => ({ backup: { state: document.getElementById('settingsForm') ? 'idle' : 'unavailable',
      detail: 'Modern app BYOK public-file controls only. Header selection does not alter app settings or upload data. JWT session-only default is retained.' },
      replication: { state: 'unavailable', detail: 'No public replication adapter or provider-enforced UCAN capability.' } }) },
  links: [{ label: 'Project source', url: 'https://github.com/TheJollyLaMa/Decent_UCAN_Play' }],
};
