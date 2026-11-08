import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const repo = path.basename(root).replace('marathon-', '');
const entries = {
  escrow: ['index.html', 'default/index.html'],
  invoice: ['index.html', 'default/index.html'],
  subscriptions: ['public/index.html', 'default/index.html'],
  nda: ['index.html', 'private-agreement.html'],
  airdrop: ['index.html'],
  ucan: ['index.html', 'modern.html'],
}[repo];
const serveRoot = repo === 'ucan' ? path.join(root, 'dist') : root;
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(serveRoot, `.${pathname}`);
    if (!file.startsWith(serveRoot + path.sep)) { res.writeHead(403).end(); return; }
    if (pathname === '/default/config.json') {
      const config = JSON.parse(await readFile(file, 'utf8'));
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ...config, mode: 'wallet', chainId: 10, address: '0x' + '3'.repeat(40) }));
      return;
    }
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
try {
  for (const entry of entries) {
    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    const external = [];
    const errors = [];
    const probes = [];
    let probeMode = 'unauthorized';
    const publicUploads = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      if (new URL(route.request().url()).origin === base) return route.continue();
      if (entry === 'modern.html' && ['api.pinata.cloud', 'uploads.pinata.cloud'].includes(
        new URL(route.request().url()).hostname) && new URL(route.request().url()).pathname === '/v3/files') {
        if (route.request().method() === 'GET') {
          return route.fulfill({ json: { data: { files: [] } } });
        }
        publicUploads.push(route.request().url());
        return route.fulfill({ status: 503, json: { error: 'Synthetic upload refused by provider' } });
      }
      if (route.request().url() === 'https://api.pinata.cloud/data/testAuthentication') {
        assert.equal(route.request().method(), 'GET');
        assert.equal(route.request().postData(), null);
        assert.equal(route.request().headers().authorization, 'Bearer synthetic-browser-only');
        probes.push('pinata');
        if (probeMode === 'network-failure') return route.abort('failed');
        return route.fulfill({ status: probeMode === 'authenticated' ? 200 : 401,
          json: probeMode === 'authenticated' ? { message: 'Congratulations! You are communicating with the Pinata API!' } : { error: 'Unauthorized' } });
      }
      if (route.request().url() === 'http://127.0.0.1:5001/api/v0/version') {
        assert.equal(route.request().method(), 'POST');
        assert.equal(route.request().postData(), null);
        assert.equal(route.request().headers().authorization, undefined);
        probes.push('local');
        return route.fulfill({ json: { Version: '0.34.0' } });
      }
      external.push(route.request().url());
      if (route.request().url().includes('ethers.esm.min.js')) {
        return route.fulfill({ contentType: 'text/javascript', body: 'export const ethers = globalThis.ethers;' });
      }
      if (route.request().url().includes('ethers.umd.min.js')) {
        return route.fulfill({ contentType: 'text/javascript', body: '/* Synthetic legacy ethers provided by test fixture. */' });
      }
      return route.abort();
    });
    await page.addInitScript(() => {
      const handlers = new Map(), requests = [];
      let chain = '0xa', accounts = ['0x' + '1'.repeat(40)];
      window.walletTest = { requests, reject: true, emit(name, value) {
        if (name === 'chainChanged') chain = value;
        if (name === 'accountsChanged') accounts = value;
        for (const callback of handlers.get(name) || []) callback(value);
      } };
      window.ethereum = {
        async request({ method }) {
          requests.push(method);
          if (method === 'eth_requestAccounts') {
            if (window.walletTest.reject) throw Object.assign(new Error('Rejected by user'), { code: 4001 });
            return accounts;
          }
          if (method === 'eth_chainId') return chain;
          if (method === 'eth_accounts') return accounts;
          if (method === 'eth_getCode') return '0x';
          throw new Error('Synthetic wallet operation unavailable: ' + method);
        },
        on(name, callback) {
          if (!handlers.has(name)) handlers.set(name, new Set());
          handlers.get(name).add(callback);
        },
        removeListener(name, callback) { handlers.get(name)?.delete(callback); },
      };
      window.ethers = {
        version: 'ethers/5.7.2-synthetic-sentinel',
        providers: { Web3Provider: class {
          constructor(raw) { this.raw = raw; }
          async getNetwork() { return { chainId: Number(BigInt(await this.raw.request({ method: 'eth_chainId' }))) }; }
          async getCode() { return '0x'; }
          getSigner() { return { getAddress: async () => (await this.raw.request({ method: 'eth_accounts' }))[0] }; }
          async send(method) { return this.raw.request({ method }); }
        } },
        Contract: class { async owner() { throw new Error('Synthetic legacy deployment unavailable'); } },
        utils: { formatUnits: value => String(value), formatEther: value => String(value) },
      };
    });
    await page.goto(`${base}/${entry}`);
    if (entry.includes('private-agreement')) {
      await page.locator('#agreement-text').fill('Synthetic confidential agreement: never include in any header request.');
      await page.locator('#encrypt-passphrase').fill('synthetic-passphrase-for-test-only-1234');
    }
    const header = page.locator('decent-header');
    await header.getByRole('button', { name: 'Connect wallet', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => walletTest.requests.includes('eth_requestAccounts')), false);
    await header.getByRole('button', { name: 'Connect wallet', exact: true }).click();
    await header.getByText(/Rejected by user/).waitFor();
    assert.equal(await page.evaluate(() => DecentHead.getWallet().snapshot().connected), false);
    await page.evaluate(() => { walletTest.reject = false; });
    await header.getByRole('button', { name: 'Connect wallet', exact: true }).click();
    await header.getByRole('button', { name: 'Disconnect wallet', exact: true }).waitFor();
    await header.locator('wallet-connect').getByText(/Optimism/).waitFor();
    if (entry.includes('default/')) {
      await page.locator('main #connect').click();
      await page.locator('main #status').getByText(/No contract code/).waitFor();
      assert.equal(await page.evaluate(() => walletTest.requests.filter(method => method === 'eth_requestAccounts').length), 2);
      assert.equal(await page.locator('#create-form button').isDisabled(), true);
    }
    assert.equal(await page.evaluate(() => window.ethers.version), 'ethers/5.7.2-synthetic-sentinel');
    await page.evaluate(() => walletTest.emit('accountsChanged', ['0x' + '2'.repeat(40)]));
    assert.equal(await page.evaluate(() => DecentHead.getWallet().snapshot().address), '0x' + '2'.repeat(40));
    await page.evaluate(() => walletTest.emit('chainChanged', '0x270f'));
    assert.equal(await page.evaluate(() => DecentHead.getWallet().snapshot().chainId), '0x270f');
    await header.locator('wallet-connect').getByText(/chain 9999/i).waitFor();
    if (entry.includes('default/')) {
      await page.locator('main #connect').click();
      await page.locator('main #status').getByText(/Wrong chain/).waitFor();
      assert.equal(await page.locator('#create-form button').isDisabled(), true);
    }
    await header.getByRole('button', { name: 'Disconnect wallet', exact: true }).click();
    await header.getByRole('button', { name: 'Connect wallet', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => DecentHead.getWallet().snapshot().connected), false);
    const title = header.locator('app-title').getByRole('button');
    await title.click();
    await header.locator('about-modal').getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await title.evaluate(button => button.getRootNode().activeElement === button), true);
    await header.getByRole('button', { name: 'Open IPFS controls', exact: true }).click();
    const ipfs = header.locator('ipfs-controls');
    await ipfs.getByRole('dialog').waitFor();
    await ipfs.locator('#provider-settings > summary').click();
    await ipfs.locator('#provider').selectOption('local');
    await ipfs.getByRole('button', { name: 'Use provider', exact: true }).click();
    await ipfs.getByText(/local selected; not yet verified/).waitFor();
    assert.equal(await page.evaluate(() => DecentHead.getIpfs().snapshot().provider), 'local');
    await ipfs.locator('#provider').selectOption('pinata');
    await ipfs.getByRole('button', { name: 'Use provider', exact: true }).click();
    assert.equal(await page.evaluate(() => DecentHead.getIpfs().snapshot().credentialsConfigured), false);
    assert.deepEqual(probes, []);
    await ipfs.locator('#verify-provider').click();
    await ipfs.locator('#provider-message').filter({ hasText: /personal Pinata JWT/ }).waitFor();
    assert.deepEqual(probes, []);
    await ipfs.locator('#jwt').fill('synthetic-browser-only');
    await ipfs.getByRole('button', { name: 'Use provider', exact: true }).click();
    assert.equal(await page.evaluate(() => DecentHead.getIpfs().snapshot().credentialsConfigured), true);
    assert.equal(await page.evaluate(() => DecentHead.getIpfs().snapshot().connection.state), 'unverified');
    assert.deepEqual(probes, []);
    const providerMessage = ipfs.locator('#provider-message');
    await ipfs.locator('#verify-provider').click();
    await providerMessage.filter({ hasText: /HTTP 401/ }).waitFor();
    assert.equal(await page.evaluate(() => DecentHead.getIpfs().snapshot().connection.state), 'error');
    probeMode = 'network-failure';
    await ipfs.locator('#verify-provider').click();
    await providerMessage.filter({ hasText: /failed or timed out/ }).waitFor();
    assert.equal(await page.evaluate(() => DecentHead.getIpfs().snapshot().connection.state), 'error');
    probeMode = 'authenticated';
    await ipfs.locator('#verify-provider').click();
    await providerMessage.filter({ hasText: /Pinata authenticated/ }).waitFor();
    assert.equal(await page.evaluate(() => DecentHead.getIpfs().snapshot().connection.state), 'ready');
    assert.equal(await header.locator('ipfs-status .orb').getAttribute('data-state'), 'ready');
    await ipfs.locator('#provider').selectOption('local');
    await ipfs.getByRole('button', { name: 'Use provider', exact: true }).click();
    assert.equal(await page.evaluate(() => DecentHead.getIpfs().snapshot().connection.state), 'unverified');
    await ipfs.locator('#verify-provider').click();
    await providerMessage.filter({ hasText: /Local Kubo version endpoint responded/ }).waitFor();
    assert.equal(await page.evaluate(() => DecentHead.getIpfs().snapshot().connection.state), 'ready');
    assert.deepEqual(probes, ['pinata', 'pinata', 'pinata', 'local']);
    if (entry === 'modern.html') {
      assert.equal(await page.locator('#pinataJwtInput').inputValue(), '');
      assert.equal(await page.locator('#rememberJwtInput').isChecked(), false);
      await ipfs.getByRole('button', { name: 'Open app backups controls', exact: true }).click();
      assert.equal(await page.locator('#pinataJwtInput').evaluate(input => document.activeElement === input), true);
      await header.getByRole('button', { name: 'Open IPFS controls', exact: true }).click();
    }
    const box = await ipfs.getByRole('dialog').boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= 375, JSON.stringify(box));
    await page.keyboard.press('Escape');
    assert.equal(await header.getByRole('button', { name: 'Open IPFS controls', exact: true }).evaluate(button => button.getRootNode().activeElement === button), true);
    assert.equal(await page.evaluate(() => walletTest.requests.some(method => /wallet_switch|wallet_add/.test(method))), false);
    const headerBox = await header.boundingBox();
    assert.ok(headerBox.width <= 375, JSON.stringify(headerBox));
    if (entry === 'modern.html') {
      await page.locator('#pinataJwtInput').fill('synthetic-app-only-jwt');
      await page.locator('#pinataGatewayInput').fill('example.mypinata.cloud');
      await page.locator('#settingsForm button[type="submit"]').click();
      await page.locator('#settingsStatus').filter({ hasText: /page memory only/ }).waitFor();
      await page.locator('#identityForm button[type="submit"]').click();
      await page.locator('#identityStatus').filter({ hasText: /new local did:key/ }).waitFor();
      await page.locator('#startSessionButton').click();
      await page.locator('#identityStatus').filter({ hasText: /Local UCAN delegation created/ }).waitFor();
      await page.locator('#uploadPanel').waitFor({ state: 'visible' });
      assert.deepEqual(publicUploads, []);
      await page.locator('#fileInput').setInputFiles({
        name: 'synthetic-public-test.txt', mimeType: 'text/plain', buffer: Buffer.from('Synthetic public test only')
      });
      await page.locator('#uploadForm').evaluate(form => {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
      await page.locator('#uploadStatus').filter({ hasText: /Confirm that the selected files may be public/ }).waitFor();
      assert.deepEqual(publicUploads, []);
      await page.locator('#publicUploadConsent').check();
      await page.locator('#uploadForm button[type="submit"]').click();
      await page.locator('#uploadStatus.error').filter({ hasText: /check the provider before retrying/ }).waitFor();
      assert.equal(publicUploads.length, 1, JSON.stringify({
        status: await page.locator('#uploadStatus').innerText(), external
      }));
      await page.reload();
      await page.locator('#identitySummary').filter({ hasText: /did:key:/ }).waitFor();
      assert.equal(await page.locator('#pinataJwtInput').inputValue(), '');
      assert.equal(await page.locator('#rememberJwtInput').isChecked(), false);
      assert.equal(await page.locator('#uploadPanel').isHidden(), true);
      assert.equal(publicUploads.length, 1);
    }
    if (entry.includes('private-agreement')) {
      const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
      assert.ok(csp.includes('connect-src https://api.pinata.cloud/data/testAuthentication http://127.0.0.1:5001/api/v0/version;'));
      assert.equal(csp.includes('pinFileToIPFS'), false);
      const blocked = await page.evaluate(async () => {
        try { await DecentHead.getIpfs().upload({ synthetic: true }); return false; }
        catch (error) { return /NDA public upload.*disabled/.test(error.message); }
      });
      assert.equal(blocked, true);
    }
    assert.deepEqual(errors, []);
    console.log(`PASS ${repo}/${entry}: 375px wallet lifecycle, v5 isolation, explicit provider unconfigured/401/network/Pinata-ready/Kubo-ready without automatic uploads, About Escape/focus${entry === 'modern.html' ? ', local DID/session, explicit public consent, synthetic upload failure and memory-only JWT reload' : ''}; legacy resources mocked/blocked (${external.length})`);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
