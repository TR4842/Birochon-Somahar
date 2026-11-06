import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installStorage } from './helpers.mjs';

let storage;
beforeEach(() => { storage = installStorage(); });

const rp = await import('../src/utils/readingProgress.js');
const storageModule = await import('../src/utils/storage.js');
const items = Array.from({ length: 10 }, (_, i) => ({ id: `bag_${i + 1}`, term: `শব্দ ${i + 1}` }));

test('progress starts empty and every category is isolated', () => {
  const initial = rp.loadReadingProgress();
  assert.equal(rp.hasAnyProgress(initial), false);
  const after = rp.markReadUpTo(initial, 'bagdhara', { itemId: 'bag_4', index: 3, nextId: 'bag_5' });
  assert.equal(rp.getCategoryProgress(after, 'bagdhara').readThroughIndex, 3);
  assert.equal(rp.getCategoryProgress(after, 'biporit').readThroughIndex, -1);
  assert.equal(rp.getCategoryProgress(after, 'bagdhara').resumeId, 'bag_5');
  assert.equal(rp.getCategoryProgress(after, 'bagdhara').resumeIndex, 4);
});

test('tick mark counts all previous items as read and resolves percentages', () => {
  const state = rp.markReadUpTo(rp.loadReadingProgress(), 'bagdhara', { itemId: 'bag_4', index: 3, nextId: 'bag_5' });
  const resolved = rp.resolveCategoryProgress(state, 'bagdhara', items);
  assert.equal(resolved.readCount, 4);
  assert.equal(resolved.percent, 40);
  assert.equal(resolved.resumeIndex, 4);
  assert.equal(resolved.isComplete, false);
  assert.equal(resolved.indexById.get('bag_7'), 6);
});

test('marks survive database updates because IDs win over indices', () => {
  const state = rp.markReadUpTo(rp.loadReadingProgress(), 'bagdhara', { itemId: 'bag_4', index: 3, nextId: 'bag_5' });
  const shifted = [{ id: 'bag_new', term: 'নতুন' }, ...items];
  const resolved = rp.resolveCategoryProgress(state, 'bagdhara', shifted);
  assert.equal(resolved.readThroughIndex, 4, 'bag_4 is now at index 4');
  assert.equal(resolved.readCount, 5);
  assert.equal(resolved.resumeIndex, 5);
});

test('completion: marking the last item gives 100% and no resume id', () => {
  const state = rp.markReadUpTo(rp.loadReadingProgress(), 'bagdhara', { itemId: 'bag_10', index: 9, nextId: null });
  const resolved = rp.resolveCategoryProgress(state, 'bagdhara', items);
  assert.equal(resolved.percent, 100);
  assert.equal(resolved.isComplete, true);
  assert.equal(resolved.resumeId, null);
});

test('moving the marker backwards un-marks later items', () => {
  const first = rp.markReadUpTo(rp.loadReadingProgress(), 'bagdhara', { itemId: 'bag_8', index: 7, nextId: 'bag_9' });
  const second = rp.markReadUpTo(first, 'bagdhara', { itemId: 'bag_2', index: 1, nextId: 'bag_3' });
  assert.equal(rp.resolveCategoryProgress(second, 'bagdhara', items).readCount, 2);
});

test('filters + page + scroll are stored per category', () => {
  const a = rp.updateCategoryProgress(rp.loadReadingProgress(), 'paribhashik', {
    filters: { searchQuery: 'secretary', letterFilter: 'S', isShuffle: true, shuffleSeed: 42 },
    page: 7,
    scrollY: 1234,
    resumeId: 'par_180',
    resumeIndex: 179
  });
  const b = rp.setLastCategory(a, 'paribhashik');
  assert.equal(b.lastCategoryId, 'paribhashik');
  const loaded = rp.loadReadingProgress();
  assert.equal(loaded.categories.paribhashik.filters.searchQuery, 'secretary');
  assert.equal(loaded.categories.paribhashik.filters.letterFilter, 'S');
  assert.equal(loaded.categories.paribhashik.filters.shuffleSeed, 42);
  assert.equal(loaded.categories.paribhashik.page, 7);
  assert.equal(loaded.categories.paribhashik.scrollY, 1234);
  assert.equal(loaded.categories.bagdhara.page, 1, 'other category untouched');
});

test('corrupt / legacy data is normalised instead of throwing', () => {
  storage.setItem(storageModule.READING_KEY, '{not json');
  assert.equal(rp.hasAnyProgress(rp.loadReadingProgress()), false);

  storage.clear();
  storage.setItem('birochon_reading_v0', JSON.stringify({ bagdhara: 120, lastCategoryId: 'ekkothay' }));
  const migrated = rp.loadReadingProgress();
  assert.equal(migrated.categories.bagdhara.resumeIndex, 120);
  assert.equal(migrated.categories.bagdhara.readThroughIndex, 119);
  assert.equal(migrated.lastCategoryId, 'ekkothay');
  assert.ok(storage.getItem(storageModule.READING_KEY), 'migrated state was persisted');
});

test('legacy progress-level settings are lifted into the settings key', () => {
  storage.setItem(storageModule.READING_KEY, JSON.stringify({
    lastCategoryId: 'biporit',
    settings: { autoResume: false, autoMarkRead: true }
  }));
  rp.loadReadingProgress();
  const settings = storageModule.loadSettings();
  assert.equal(settings.autoResume, false);
  assert.equal(settings.autoMarkRead, true);
});

test('seeded shuffle is deterministic and keeps every item', () => {
  const one = rp.seededShuffle(items, 12345);
  const two = rp.seededShuffle(items, 12345);
  assert.deepEqual(one, two);
  assert.equal(one.length, items.length);
  assert.equal(new Set(one.map(i => i.id)).size, items.length);
  assert.notDeepEqual(one, items);
});

test('computeResumePage finds the anchor in a filtered list', () => {
  const resolved = { resumeId: 'bag_8', resumeIndex: 7, page: 1 };
  const indexById = new Map(items.map((item, i) => [item.id, i]));
  assert.equal(rp.computeResumePage(items, resolved, indexById, 3), 3);
  assert.equal(rp.computeResumePage(items.slice(7), resolved, indexById, 3), 1);
  assert.equal(
    rp.computeResumePage(items, { ...resolved, resumeId: null }, indexById, 3),
    3,
    'falls back to the canonical resume index when the anchor id is gone'
  );
  assert.equal(
    rp.computeResumePage(items, { resumeId: null, resumeIndex: 999, page: 2 }, indexById, 3),
    2,
    'falls back to the saved page when no position can be resolved'
  );
});

test('BUGFIX: the tick mark wins over a stale last-scrolled position', () => {
  const marked = rp.markReadUpTo(rp.loadReadingProgress(), 'bagdhara', {
    itemId: 'bag_4', index: 3, nextId: 'bag_5'
  });
  // Simulate what scroll tracking used to do: write an OLDER visible card back
  // into resumeId/resumeIndex, which previously broke "start after the mark".
  const clobbered = rp.updateCategoryProgress(marked, 'bagdhara', {
    resumeId: 'bag_1', resumeIndex: 0, scrollY: 0, page: 1
  });

  const point = rp.getContinuePoint(clobbered, 'bagdhara', items);
  assert.equal(point.hasMark, true);
  assert.equal(point.index, 4);
  assert.equal(point.id, 'bag_5');
  assert.equal(point.readCount, 4);

  const resolved = rp.resolveCategoryProgress(clobbered, 'bagdhara', items);
  assert.equal(resolved.continueIndex, 4);
  assert.equal(resolved.continueId, 'bag_5');
  assert.equal(resolved.resumeIndex, 0, 'last-viewed position kept, but not used for continuing');
});

test('without a mark, the continue point is the last viewed item', () => {
  const state = rp.updateCategoryProgress(rp.loadReadingProgress(), 'bagdhara', {
    resumeId: 'bag_7', resumeIndex: 6
  });
  const point = rp.getContinuePoint(state, 'bagdhara', items);
  assert.equal(point.hasMark, false);
  assert.equal(point.index, 6);
  assert.equal(point.id, 'bag_7');
});

test('continue point follows the mark ID after a database insert', () => {
  const state = rp.markReadUpTo(rp.loadReadingProgress(), 'bagdhara', {
    itemId: 'bag_4', index: 3, nextId: 'bag_5'
  });
  const shifted = [{ id: 'bag_new', term: 'নতুন' }, ...items];
  const point = rp.getContinuePoint(state, 'bagdhara', shifted);
  assert.equal(point.id, 'bag_5');
  assert.equal(point.index, 5);
});

test('a fully read category clamps the continue point to the last item', () => {
  const state = rp.markReadUpTo(rp.loadReadingProgress(), 'bagdhara', {
    itemId: 'bag_10', index: 9, nextId: null
  });
  const point = rp.getContinuePoint(state, 'bagdhara', items);
  assert.equal(point.isComplete, true);
  assert.equal(point.index, 9);
  assert.equal(point.id, 'bag_10');
});

test('resetting one category leaves the others intact', () => {
  const a = rp.markReadUpTo(rp.loadReadingProgress(), 'bagdhara', { itemId: 'bag_3', index: 2, nextId: 'bag_4' });
  const b = rp.markReadUpTo(a, 'biporit', { itemId: 'bip_5', index: 4, nextId: 'bip_6' });
  const reset = rp.resetCategoryProgress(b, 'bagdhara');
  assert.equal(rp.getCategoryProgress(reset, 'bagdhara').readThroughIndex, -1);
  assert.equal(rp.getCategoryProgress(reset, 'biporit').readThroughIndex, 4);
});
