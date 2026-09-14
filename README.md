# Decent UCAN Play

![Horus Background](img/Horus.png)

## Overview

This repository now ships with **two clearly separated application paths**:

- **Legacy path** — the original browser-only Web3.Storage/UCAN experience remains available at `/index.html` and is preserved as-is for backwards reference.
- **Modern path** — a zero-backend, local-first browser app is available at `/modern.html` with bring-your-own Pinata credentials, local DID generation, and client-side UCAN session delegation.

The goal of the split is to keep the old implementation accessible while introducing a safer replacement path without destructive changes to the legacy flow.

## Why the revamp was needed

The original npm runtime depended on packages that are no longer a good fit for the new path:

- `ipfs-http-client` is deprecated in favor of newer IPFS tooling.
- The legacy experience depends on older Web3.Storage-era browser behavior that should remain available for reference, but it should not block a cleaner replacement path.

The revamp therefore keeps the **legacy page intact** while moving the new path to a simpler browser-only split:

- **legacy:** `/index.html`
- **modern:** `/modern.html`
- **browser storage:** IndexedDB via `idb-keyval`
- **provider:** Pinata BYOK in the browser
- **local authorization envelope:** `@ucanto/principal` + `@ucanto/core`

## Version map

| Path | Purpose | Notes |
| --- | --- | --- |
| `/index.html` | Legacy app | Preserved legacy flow and UI |
| `/modern.html` | New app | Zero-backend Pinata BYOK + local DID/UCAN session |

## Modern architecture

1. The user saves their own Pinata JWT and gateway domain in IndexedDB.
2. The browser creates and stores a root `did:key` identity locally.
3. When the user starts a session, the browser generates a second `did:key` and creates a UCAN delegation from the root identity to that session identity.
4. The browser uploads directly to Pinata using the locally stored BYOK credentials.
5. The browser lists prior uploads for the current DID by filtering Pinata metadata tagged with that DID.

## Pinata-first decision

Because you already have a Pinata account and requested a zero-backend app, Pinata is the practical default for the new path.

### Why Pinata is feasible here

- The app can run 100% statically.
- Each user brings their own JWT instead of relying on a shared backend secret.
- Uploads and listing calls go directly from the browser to Pinata.

### UCAN tradeoff in a zero-backend Pinata flow

Pinata's browser flow is credential-driven, not UCAN-native. In this revamp, UCAN is still used meaningfully for **local DID generation and delegated browser session state**, but Pinata itself does not enforce the UCAN proof remotely. That is the tradeoff that keeps the app static and BYOK.

### More decentralized alternative

If you later want a more decentralized remote-storage path than a managed pinning provider, the strongest follow-up option is:

- **Helia in the browser + self-hosted Kubo/IPFS Cluster**

That path reduces provider dependence, but it adds operational complexity, persistence responsibilities, and extra auth work compared with Pinata BYOK.

## Local installation

Use Node.js 20+.

```bash
git clone https://github.com/yourusername/Decent_UCAN_Play.git
cd Decent_UCAN_Play
npm install
```

## Usage

### Legacy path

```bash
npm run dev
```

Then open `http://localhost:5173/index.html`.

### Modern path

```bash
npm run dev
```

Then open `http://localhost:5173/modern.html`.

From there:

1. Paste your Pinata JWT and gateway domain and save them locally.
2. Create or rotate a browser-local DID.
3. Start a local UCAN session.
4. Upload directly to Pinata from the browser.

## Available scripts

- `npm run dev` — serve both the legacy and modern frontend entries with Vite
- `npm run build` — build both `index.html` and `modern.html`
- `npm test` — run focused modern-path unit tests

## Notes on local-first security

The modern flow is intentionally browser-only. Keep these tradeoffs in mind:

- Your Pinata JWT is stored only in this browser's IndexedDB, but anyone with access to the same unlocked browser profile can use it.
- The local UCAN session is an app-level capability envelope for this browser flow; it is not remotely enforced by Pinata.
- For stronger protection, pair this pattern with browser profile isolation, device-level security, or a future passkey/encrypted-key workflow.

## License

This project is licensed under the [MIT License](LICENSE).
