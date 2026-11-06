import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

const originalFetch = globalThis.fetch;
const originalNavigator = globalThis.navigator;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalNavigator === undefined) delete globalThis.navigator;
  else globalThis.navigator = originalNavigator;
});
beforeEach(() => {
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: true }, configurable: true, writable: true
  });
});

const { checkForUpdate, shouldAutoCheck, describeUpdateError } = await import('../src/utils/updater.js');
const { APP_VERSION } = await import('../src/utils/appVersion.js');

const mockFetch = (releases, ok = true, status = 200) => {
  globalThis.fetch = async () => ({ ok, status, json: async () => releases });
};

const release = (tag_name, extra = {}) => ({
  tag_name,
  name: tag_name,
  draft: false,
  prerelease: false,
  html_url: `https://github.com/TR4842/Birochon-Somahar/releases/tag/${tag_name}`,
  published_at: '2026-11-06T00:00:00Z',
  body: 'নতুন ফিচার',
  assets: [],
  ...extra
});

test('picks the highest versioned release and ignores the old "Final-release" tag', async () => {
  mockFetch([
    release('Final-release', { assets: [{ name: 'old.apk', browser_download_url: 'https://x/old.apk' }] }),
    release('v1.1.0'),
    release('v2.0.0', {
      body: ' big update ',
      assets: [{ name: 'Birochon-Somahar-v2.0.0.apk', browser_download_url: 'https://x/new.apk', size: 1234 }]
    })
  ]);
  const info = await checkForUpdate();
  assert.equal(info.ok, true);
  assert.equal(info.latestVersion, '2.0.0');
  assert.equal(info.updateAvailable, true);
  assert.equal(info.currentVersion, APP_VERSION);
  assert.equal(info.apkName, 'Birochon-Somahar-v2.0.0.apk');
  assert.equal(info.downloadUrl, 'https://x/new.apk');
  assert.equal(info.notes, 'big update');
});

test('already up to date → no update', async () => {
  mockFetch([release(`v${APP_VERSION}`)]);
  const info = await checkForUpdate();
  assert.equal(info.latestVersion, APP_VERSION);
  assert.equal(info.updateAvailable, false);
});

test('legacy releases with no version tag report noVersionedRelease, not a crash', async () => {
  mockFetch([release('Final-release')]);
  const info = await checkForUpdate();
  assert.equal(info.noVersionedRelease, true);
  assert.equal(info.updateAvailable, false);
});

test('a version encoded in the APK filename works even without a version tag', async () => {
  mockFetch([release('Final-release', {
    assets: [{ name: 'Birochon-Somahar-v3.1.0.apk', browser_download_url: 'https://x/v3.apk' }]
  })]);
  const info = await checkForUpdate();
  assert.equal(info.latestVersion, '3.1.0');
  assert.equal(info.updateAvailable, true);
});

test('offline does not make any request', async () => {
  Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, configurable: true });
  let called = false;
  globalThis.fetch = async () => { called = true; throw new Error('should not fetch'); };
  await assert.rejects(() => checkForUpdate(), (e) => e.code === 'OFFLINE');
  assert.equal(called, false);
  assert.match(describeUpdateError({ code: 'OFFLINE' }), /ইন্টারনেট/);
});

test('auto-check is opt-in and throttled', () => {
  assert.equal(shouldAutoCheck({ autoCheckUpdates: false }), false);
  assert.equal(shouldAutoCheck({ autoCheckUpdates: true, lastUpdateCheckAt: Date.now() }), false);
  assert.equal(shouldAutoCheck({ autoCheckUpdates: true, lastUpdateCheckAt: 0 }), true);
});
