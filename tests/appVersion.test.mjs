import { test } from 'node:test';
import assert from 'node:assert/strict';

const v = await import('../src/utils/appVersion.js');

test('version constants are present', () => {
  assert.match(v.APP_VERSION, /^\d+\.\d+\.\d+$/);
  assert.ok(v.APP_VERSION_CODE >= 1);
  assert.equal(v.GITHUB_REPO, 'TR4842/Birochon-Somahar');
  assert.ok(v.RELEASES_API_URL.startsWith('https://api.github.com/repos/'));
});

test('compareVersions handles prefixes, missing parts and ordering', () => {
  assert.equal(v.compareVersions('1.1.0', '1.1.0'), 0);
  assert.equal(v.compareVersions('v1.2.0', '1.1.9'), 1);
  assert.equal(v.compareVersions('1.0', '1.0.1'), -1);
  assert.equal(v.compareVersions('1.10.0', '1.9.9'), 1);
  assert.equal(v.compareVersions('1.1.0-beta.1', '1.1.0'), 0);
});

test('versionFromTag extracts a numeric version from release tags', () => {
  assert.equal(v.versionFromTag('v1.1.0'), '1.1.0');
  assert.equal(v.versionFromTag('Birochon-Somahar-v1.2.3.apk'), '1.2.3');
  assert.equal(v.versionFromTag('Final-release'), '');
  assert.equal(v.isVersionLikeTag('v2.0'), true);
  assert.equal(v.isVersionLikeTag('Final-release'), false);
});

test('Bengali numerals', () => {
  assert.equal(v.formatBnNumber('v1.1.0'), 'v১.১.০');
  assert.equal(v.formatBnNumber(2026), '২০২৬');
});
