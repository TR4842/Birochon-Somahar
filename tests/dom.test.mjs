import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { build } from 'esbuild';
import { writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/'
});
// React's scheduler keeps MessagePort handles referenced forever in a Node +
// jsdom environment. Close jsdom and exit shortly after the TAP output has
// flushed, preserving a non-zero code if any assertion failed.
after(() => {
  dom.window.close();
  setTimeout(() => process.exit(process.exitCode || 0), 150);
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator, configurable: true, writable: true
});
globalThis.Element = dom.window.Element;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.Node = dom.window.Node;
globalThis.getComputedStyle = dom.window.getComputedStyle;

// React's scheduler creates a MessageChannel whose ports keep Node's event
// loop alive forever. Unref them so `node --test` can exit after the tests.
const NativeMessageChannel = globalThis.MessageChannel;
if (NativeMessageChannel) {
  globalThis.MessageChannel = class extends NativeMessageChannel {
    constructor() {
      super();
      this.port1?.unref?.();
      this.port2?.unref?.();
    }
  };
}

const outFile = path.resolve('node_modules/.cache/birochon-dom.cjs');
const bundle = await build({
  entryPoints: ['tests/dom-entry.jsx'],
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
const { runScenario } = require(outFile);

test('new session auto-starts on the first unread item, never on an older scroll position', async () => {
  const { firstResult, targetId } = await runScenario();
  assert.equal(firstResult.hasTarget, true, `page must contain ${targetId} (first unread item)`);
  assert.equal(firstResult.hasFirstItem, false, 'must NOT still be on page 1');
  assert.ok(firstResult.scrollCalls > 0, 'auto-resume must scroll to the anchor');
  assert.equal(firstResult.savedResumeId, targetId, 'resume anchor must be repaired');
  assert.ok(firstResult.continueButtonCount >= 1, 'a চালিয়ে যান button must be present');
});

test('the চালিয়ে যান button re-jumps to the first unread item', async () => {
  const { afterClick, targetId } = await runScenario();
  assert.equal(afterClick.clicked, true);
  assert.ok(afterClick.scrollCalls > 0, 'clicking the button must scroll');
  assert.equal(afterClick.savedResumeId, targetId);
  assert.equal(afterClick.stillHasTarget, true);
});
