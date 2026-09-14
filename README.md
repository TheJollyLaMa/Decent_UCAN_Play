# Decent UCAN Play

![Horus Background](img/Horus.png)

## Overview

This repository now ships with **two clearly separated application paths**:

- **Legacy path** — the original browser-only Web3.Storage/UCAN experience remains available at `/index.html` and is preserved as-is for backwards reference.
- **Modern path** — a new Pinata-first flow is available at `/modern.html`, backed by a lightweight Node sidecar that issues email magic links and short-lived Pinata signed upload URLs.

The goal of the split is to keep the old implementation accessible while introducing a safer, maintainable replacement flow that avoids the deprecated packages previously installed through npm.

## Why the revamp was needed

The original project depended on npm packages that are now deprecated or fragile for new work:

- `@web3-storage/w3up-client` and `@web3-storage/access` were part of the previous runtime direction and are no longer used by the modern path.
- `ipfs-http-client` is deprecated in favor of newer IPFS tooling.
- The legacy page also relied on a remotely hosted browser bundle, which made the current npm dependency set misleading compared with the actual runtime.

The revamp keeps the **legacy page intact** while moving the new path to a cleaner split:

- **frontend:** Vite-served static UI at `modern.html`
- **backend sidecar:** `server/index.cjs`
- **provider:** Pinata signed uploads with the JWT kept server-side only

## Version map

| Path | Purpose | Notes |
| --- | --- | --- |
| `/index.html` | Legacy app | Preserved legacy flow and UI |
| `/modern.html` | New app | Magic-link sign-in + Pinata signed uploads |
| `/server/index.cjs` | Modern sidecar | Issues preview magic links, sessions, and Pinata signed URLs |

## Modern architecture

1. The user requests a magic link from the modern UI.
2. The sidecar creates a one-time token and, in local preview mode, returns a verification URL directly.
3. Visiting the verification URL exchanges the token for a short-lived session.
4. The browser requests a **signed upload URL** from the sidecar.
5. The browser uploads directly to Pinata without ever receiving the account JWT.
6. The sidecar lists recent uploads for the authenticated email by filtering Pinata metadata.

## Pinata-first decision

Because you already have a Pinata account, Pinata is the default provider for the new path and is a practical fit **as long as the JWT stays on the server**.

### Why Pinata is feasible here

- The modern path uses **short-lived signed upload URLs**.
- `PINATA_JWT` never needs to be exposed to the browser.
- The browser can still upload directly to Pinata, so the sidecar stays small.

### More decentralized alternative

If you later want a more decentralized stack than a managed pinning provider, the strongest follow-up option is:

- **Helia in the browser + self-hosted Kubo/IPFS Cluster**

That option gives you more infrastructure control and reduces provider lock-in, but it also adds operational complexity, auth work, and content persistence responsibilities. For this repo revamp, Pinata is the smallest coherent upgrade.

## Local installation

Use Node.js 18+.

```bash
git clone https://github.com/yourusername/Decent_UCAN_Play.git
cd Decent_UCAN_Play
npm install
```

## Environment for the modern path

Copy the example file and fill in your Pinata values:

```bash
cp .env.example .env
```

Required values:

- `PINATA_JWT` — your server-side Pinata JWT
- `PINATA_GATEWAY` — your Pinata gateway domain

Helpful defaults already included:

- `PORT=8787`
- `MAGIC_LINK_BASE_URL=http://localhost:5173/modern.html`
- `DEV_MAGIC_LINK_PREVIEW=1`

## Usage

### Legacy path

```bash
npm run dev
```

Then open `http://localhost:5173/index.html`.

### Modern path

Run the Pinata sidecar in one terminal:

```bash
npm run server
```

Run Vite in another terminal:

```bash
npm run dev
```

Then open `http://localhost:5173/modern.html`.

If `DEV_MAGIC_LINK_PREVIEW=1`, the server returns a preview link directly in the UI so you can complete the sign-in flow without wiring an email provider first.

## Available scripts

- `npm run dev` — serve both the legacy and modern frontend entries with Vite
- `npm run build` — build both `index.html` and `modern.html`
- `npm run server` — run the Pinata sidecar
- `npm test` — run focused server state and API route tests

## Notes on production hardening

The modern flow is intentionally small, but you will likely want to extend it before production use:

- Replace preview-mode magic links with a real mailer integration.
- Swap the in-memory token/session store for durable storage.
- Expand the current in-memory request throttling into durable rate limiting and audit logging if you deploy the sidecar beyond local use.
- Tighten upload rules further if you only accept specific MIME types.

## License

This project is licensed under the [MIT License](LICENSE).
