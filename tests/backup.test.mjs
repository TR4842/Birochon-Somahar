import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installStorage } from './helpers.mjs';

let storage;
beforeEach(() => { storage = installStorage(); });

const backup = await import('../src/utils/backup.js');
const storageModule = await import('../src/utils/storage.js');

const seedV1Data = () => {
  storage.setItem('birochon_quiz_stats_v1', JSON.stringify({ totalQuizzes: 7, totalRight: 42 }));
  storage.setItem('birochon_bookmarks_v1', JSON.stringify(['bag_1', 'par_9']));
  storage.setItem('birochon_wrong_v1', JSON.stringify([{ itemId: 'bag_2' }]));
  storage.setItem('birochon_reading_progress_v1', JSON.stringify({ lastCategoryId: 'biporit' }));
};

test('a backup captures every birochon_ key, including future ones', () => {
  seedV1Data();
  storage.setItem('birochon_future_feature_v9', JSON.stringify({ hello: 'world' }));
  const payload = backup.createBackup();
  assert.equal(payload.format, 'birochon-backup');
  assert.equal(payload.data['birochon_quiz_stats_v1'].totalQuizzes, 7);
  assert.deepEqual(payload.data['birochon_bookmarks_v1'], ['bag_1', 'par_9']);
  assert.equal(payload.data['birochon_future_feature_v9'].hello, 'world');
});

test('round-trip: export → wipe → restore brings all data back unchanged', () => {
  seedV1Data();
  const text = backup.serializeBackup(backup.createBackup());
  storage.clear();

  const parsed = backup.parseBackup(text);
  assert.equal(parsed.ok, true);
  assert.ok(parsed.count >= 4);
  const result = backup.restoreBackup(parsed);
  assert.equal(result.ok, true);
  assert.equal(storageModule.loadStats().totalQuizzes, 7);
  assert.deepEqual(storageModule.loadBookmarks(), ['bag_1', 'par_9']);
  assert.equal(storageModule.loadWrongAnswers().length, 1);
});

test('invalid backups are rejected without touching existing data', () => {
  seedV1Data();
  assert.equal(backup.parseBackup('not json').ok, false);
  assert.equal(backup.parseBackup('{"format":"other-app","data":{}}').ok, false);
  assert.equal(backup.parseBackup('{"data":{"unrelated":"x"}}').ok, false);
  assert.equal(backup.restoreBackup(backup.parseBackup('nope')).ok, false);
  assert.equal(storageModule.loadStats().totalRight, 42);
});

test('foreign localStorage keys are never restored', () => {
  const payload = { format: 'birochon-backup', data: { other_app: 'x', birochon_settings_v1: { autoResume: false } } };
  const result = backup.restoreBackup(backup.parseBackup(JSON.stringify(payload)));
  assert.equal(result.ok, true);
  assert.equal(storage.getItem('other_app'), null);
  assert.equal(storageModule.loadSettings().autoResume, false);
});

test('backups from a newer app version are flagged', () => {
  const payload = { format: 'birochon-backup', appVersion: '99.0.0', data: { birochon_settings_v1: {} } };
  assert.equal(backup.parseBackup(JSON.stringify(payload)).futureVersion, true);
});
