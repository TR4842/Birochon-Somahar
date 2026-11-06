import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

// Minimal browser globals for modules that probe them at import time.
globalThis.window = globalThis.window || { innerHeight: 800, scrollY: 0, addEventListener() {}, removeEventListener() {} };
globalThis.document = globalThis.document || { visibilityState: 'visible', addEventListener() {}, removeEventListener() {}, querySelectorAll: () => [] };

const outFile = path.resolve('node_modules/.cache/birochon-render.cjs');
const bundle = await build({
  entryPoints: ['tests/render-entry.jsx'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  write: false,
  jsx: 'automatic',
  logLevel: 'silent',
  define: {
    __APP_VERSION__: '"1.1.0"',
    __APP_VERSION_CODE__: '2',
    __GITHUB_REPO__: '"TR4842/Birochon-Somahar"',
    __MIN_SUPPORTED_VERSION__: '"1.0.0"'
  }
});
await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, bundle.outputFiles[0].text, 'utf8');
const require = createRequire(import.meta.url);
const { renderAll } = require(outFile);

test('every changed view server-renders without crashing', () => {
  const html = renderAll();
  for (const [name, markup] of Object.entries(html)) {
    assert.ok(typeof markup === 'string' && markup.length > 20, `${name} rendered empty`);
  }
  assert.match(html.app, /বিরচন সমাহার/);
  assert.match(html.reading, /পড়ার অগ্রগতি/);
  assert.match(html.reading, /এখান পর্যন্ত পড়েছি/);
  assert.match(html.reading, /চালিয়ে যান/);
  assert.match(html.progressCard, /চালিয়ে যান/);
  assert.match(html.updateCard, /আপডেট আছে কি দেখুন/);
  assert.match(html.backupCard, /ব্যাকআপ/);
  assert.match(html.about, /সংস্করণ/);
  assert.match(html.item, /পড়া/);
});
