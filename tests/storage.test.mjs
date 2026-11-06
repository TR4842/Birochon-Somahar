import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installStorage } from './helpers.mjs';

let storage;
beforeEach(() => { storage = installStorage(); });

const s = await import('../src/utils/storage.js');

test('v1.0 data keys are unchanged and survive an upgrade untouched', () => {
  const rawStats = JSON.stringify({ totalQuizzes: 3, totalRight: 11, categoryStats: { bagdhara: { right: 1, wrong: 0, total: 1 } } });
  const rawBookmarks = JSON.stringify(['bag_1']);
  const rawWrong = JSON.stringify([{ itemId: 'bag_2' }]);
  storage.setItem('birochon_quiz_stats_v1', rawStats);
  storage.setItem('birochon_bookmarks_v1', rawBookmarks);
  storage.setItem('birochon_wrong_v1', rawWrong);

  const migration = s.runAppMigration('1.1.0');
  assert.equal(migration.isUpgrade, true);
  assert.equal(migration.previousVersion, '1.0.0');
  assert.equal(migration.dataPreserved, true);
  assert.equal(storage.getItem('birochon_quiz_stats_v1'), rawStats);
  assert.equal(storage.getItem('birochon_bookmarks_v1'), rawBookmarks);
  assert.equal(storage.getItem('birochon_wrong_v1'), rawWrong);
  assert.equal(s.loadStats().totalQuizzes, 3);
  assert.deepEqual(s.loadBookmarks(), ['bag_1']);
  assert.equal(s.loadWrongAnswers().length, 1);
});

test('running migration twice with the same version is not an upgrade', () => {
  s.runAppMigration('1.1.0');
  assert.equal(s.runAppMigration('1.1.0').isUpgrade, false);
  assert.equal(s.runAppMigration('1.2.0').isUpgrade, true);
});

test('settings default to offline-first and merge future fields', () => {
  assert.equal(s.loadSettings().autoCheckUpdates, false);
  assert.equal(s.loadSettings().autoResume, true);
  const saved = s.saveSettings({ autoCheckUpdates: true });
  assert.equal(saved.autoResume, true);
  assert.equal(s.loadSettings().autoCheckUpdates, true);
  storage.setItem('birochon_settings_v1', '{broken');
  assert.equal(s.loadSettings().autoMarkRead, false);
});

test('new categories appear for a v1.0 stats object', () => {
  storage.setItem('birochon_quiz_stats_v1', JSON.stringify({
    totalQuizzes: 1,
    categoryStats: { bagdhara: { right: 1, wrong: 0, total: 1 } }
  }));
  const stats = s.loadStats();
  assert.equal(stats.categoryStats.somarthok.total, 0);
  assert.equal(stats.categoryStats.bagdhara.right, 1);
});
