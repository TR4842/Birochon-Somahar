#!/usr/bin/env node
// Fails CI when any copy of the version drifts from version.json.
// version.json is the single source of truth for Vite, Gradle and releases.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));

const errors = [];
const info = json('version.json');
const pkg = json('package.json');
const capacitor = json('capacitor.config.json');
const appVersionJs = read('src/utils/appVersion.js');
const releaseNotes = read('RELEASE_NOTES.md');
const gradle = read('android/app/build.gradle');

if (!/^\d+\.\d+\.\d+$/.test(info.version)) errors.push('version.json: version must be x.y.z');
if (!Number.isInteger(info.versionCode) || info.versionCode < 1) errors.push('version.json: versionCode must be a positive integer');
if (pkg.version !== info.version) errors.push(`package.json is ${pkg.version}, expected ${info.version}`);
if (capacitor.appId !== info.package) errors.push(`capacitor.config.json appId ${capacitor.appId} != version.json package ${info.package}`);

const fallbackChecks = [
  ['FALLBACK_VERSION', info.version],
  ['FALLBACK_VERSION_CODE', String(info.versionCode)],
  ['FALLBACK_REPO', info.repo],
  ['FALLBACK_MIN_SUPPORTED', info.minSupportedVersion]
];
for (const [name, expected] of fallbackChecks) {
  const numeric = name === 'FALLBACK_VERSION_CODE';
  const value = numeric ? expected : `'${expected}'`;
  if (!appVersionJs.includes(`const ${name} = ${value}`)) {
    errors.push(`src/utils/appVersion.js: ${name} must be ${value}`);
  }
}

if (!releaseNotes.includes(`## v${info.version}`)) {
  errors.push(`RELEASE_NOTES.md is missing a "## v${info.version}" section`);
}
if (!gradle.includes('../../version.json')) {
  errors.push('android/app/build.gradle must read versionCode/versionName from version.json');
}

if (errors.length) {
  console.error('❌ Version mismatch:');
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`✅ v${info.version} (versionCode ${info.versionCode}) consistent across package.json, Vite fallback, Gradle, Capacitor and release notes.`);
