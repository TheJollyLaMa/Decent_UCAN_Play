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

1. The user supplies their own scoped Pinata JWT and gateway domain. The JWT stays in page memory by default; remembering it unencrypted in IndexedDB requires an explicit checkbox.
2. The browser creates and stores a root `did:key` identity locally.
3. When the user starts a session, the browser generates a second `did:key` and creates a UCAN delegation from the root identity to that session identity.
4. The browser uploads directly to Pinata using BYOK credentials, after public-upload consent and a current owner-matching local session check.
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

1. Enter a personal, scoped Pinata JWT and gateway domain. Leave "Remember JWT" unchecked on shared devices; without opt-in, reloading requires re-entering the JWT.
2. Create or rotate a browser-local DID.
3. Start a local UCAN session.
4. Confirm the selected files may be public, then upload directly to Pinata from the browser.

## Available scripts

- `npm run dev` — serve both the legacy and modern frontend entries with Vite
- `npm run build` — build both `index.html` and `modern.html`
- `npm test` — run focused modern-path unit tests

## Notes on local-first security

The modern flow is intentionally browser-only. Keep these tradeoffs in mind:

- The JWT goes directly to Pinata over HTTPS. Opt-in persistent JWTs and DID private keys are **not encrypted at rest**. Page scripts, browser extensions or someone with access to the unlocked browser profile may obtain them. Do not use shared project credentials.
- Previously saved JWTs are restored with a visible warning for compatibility. Clear settings removes the stored/in-memory credential; revoke it in Pinata to revoke provider access. Clearing this browser does not unpin provider files or delete other IPFS copies.
- Uploads are public and **not encrypted**. Do not upload confidential NDA plaintext, secrets or personal student records. Filenames, content and DID/delegation-CID metadata go to Pinata; optional profile name/email are no longer automatically attached to upload metadata.
- Uploads reject expired or owner-mismatched local sessions, including after a page stays open. This is a local UX guard, not provider authorization. Listing by DID is a discoverability filter, not an access-control boundary.
- The local UCAN session is an app-level capability envelope for this browser flow; it is not remotely enforced by Pinata.
- For stronger protection, pair this pattern with browser profile isolation, device-level security, or a future passkey/encrypted-key workflow.

## Reuse and readiness

Adapted the existing zero-backend revamp, PR #1 head
`fad5b1e4b04bdfb0c78d18c1a86654db7081a2f2`, specifically
`js/modern/{identity,storage,pinata,main}.mjs` and `modern.html`.
No new backend, delegated provider authorization or cross-repository storage
integration is claimed. This is a teaching/demo path, not NDA confidential
storage or a credential-management service.

`npm test` covers DID/delegation generation, JWT persistence policy,
gateway-domain validation, personal-metadata exclusion and expiry/owner guards;
`npm run build` builds both preserved legacy and modern entries. These tests use
no real JWTs, provider uploads or remote revocation.

The existing lockfile's development tools currently produce high-severity npm
audit advisories (Vite, picomatch and source-map-js). `npm audit --omit=dev`
reports no runtime advisories in the validated install. Keep any local preview
bound to loopback; dependency remediation and provider integration validation
remain release gates, not silently applied upgrades in this change.

## Local DecentHeader integration

Entries: `index.html` (legacy) and `modern.html`. One gold/blue native header
offers click-only wallet identity, project About and explicit Pinata/Kubo
connectivity verification; no DBusk widget. The wallet is independent of the
local DID/UCAN session. Header provider selection/credentials do not alter
modern app settings: BYOK public-only upload consent and the default
session-only JWT policy remain unchanged. The host backup action only opens
the existing modern BYOK settings panel; it does not serialize/upload app data.
Legacy provider-bundle failure is now explicit and leaves the header/modern
link usable; the waiting overlay is hidden until an actual legacy login waits.

Manager verification passed 22 unit checks, the Vite build and the persisted
receiver browser protocol on both built entries. The modern browser check
also creates a local DID/session, refuses upload before public consent,
surfaces a synthetic provider upload failure after consent, and verifies
that reloading does not restore a memory-only JWT or enable uploads.
All provider responses and files in this check are synthetic; no real upload
or remotely enforced UCAN authorization is claimed.

Reuse/adapt: DecentHead `00691c4fe93fd280f5aec780bdc4fac651bfcdb1`
`js/main.js:DecentHead`, `js/wallet.js:WalletSession`, `Header.js`,
`Header/{WalletConnect,IPFSControls,IPFSStatus,AboutModal}.js`, and its
`docs/ADOPTING.md` manifest. Apache LICENSE/NOTICE, CC-BY artwork and ethers
attribution are preserved under `vendor/decent-head/2.0.0` (separate from this
app's MIT license); `provenance.json` records the adaptations. V6 is module-local
and never replaces an existing global ethers; nullable chain guards prevent
guessed contract-network prompts. CSS clips horizontal orbit paint.
Vite preserves the static header module and copies its pinned assets into
`dist`, avoiding broken donor-relative image/docs URLs after bundling.

Read-only verification additionally reuses **uncommitted** shared
`_wt/header-provider-connect` source based on that commit:
`IPFSSession.verifyConnection()` and `IPFSControls`' verify-provider handler.
Pinata authentication or loopback Kubo version response is connectivity only,
not provider-enforced UCAN, upload permission, backup, replication, rewards or
retention proof. Header credentials remain in memory. Public replication and
generic header uploads/pinning remain unavailable. Canopy curated leads,
receiving worktrees/issues and the open modern-flow PR were inspected read-only;
saved modern work is preserved, not replaced by a new storage framework.

Validation: `npm test`, `npm run build`, and
`node scripts/header-browser-smoke.mjs` with an existing `PLAYWRIGHT_MODULE`.
The browser test serves built `dist` and covers both actual entries at 375px:
wallet rejection/lifecycle, v6 isolation, explicit unconfigured/401/network/
Pinata/Kubo probes without uploads, About Escape/focus, and legacy failure.
App JWT/public-only behavior remains covered by the existing receiver tests.
Helpers self-stop; no deployments, public backups, funds or UCAN enforcement
claims.

## License

This project is licensed under the [MIT License](LICENSE).
