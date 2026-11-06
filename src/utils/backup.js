// ============================================================================
// Full local-data backup / restore
// ----------------------------------------------------------------------------
// An Android app can only be installed over an older build when both APKs are
// signed with the SAME certificate. v1.0 debug builds were signed with an
// ephemeral CI debug key, so moving to a stable release key may require ONE
// uninstall. This module lets users carry stats, bookmarks, wrong answers,
// settings and reading progress across that one-time reinstall — 100% offline.
// ============================================================================

import { APP_DATA_KEYS } from './storage.js';
import { APP_VERSION, compareVersions } from './appVersion.js';

export const BACKUP_SCHEMA_VERSION = 1;
export const BACKUP_FORMAT = 'birochon-backup';

export const collectAppData = () => {
  const keys = new Set(APP_DATA_KEYS);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('birochon_')) keys.add(key);
    }
  } catch (e) {
    /* localStorage may be unavailable — still use the known keys */
  }
  const data = {};
  keys.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return;
      try { data[key] = JSON.parse(raw); } catch (e) { data[key] = raw; }
    } catch (e) { /* skip unreadable key */ }
  });
  return data;
};

export const createBackup = () => ({
  format: BACKUP_FORMAT,
  schemaVersion: BACKUP_SCHEMA_VERSION,
  appVersion: APP_VERSION,
  exportedAt: new Date().toISOString(),
  data: collectAppData()
});

export const serializeBackup = (payload) => JSON.stringify(payload, null, 2);

/** Validate an imported file/JSON text. Never throws. */
export const parseBackup = (text) => {
  try {
    const payload = typeof text === 'string' ? JSON.parse(text) : text;
    if (!payload || typeof payload !== 'object') {
      return { ok: false, error: 'এটি একটি বৈধ ব্যাকআপ ফাইল নয়।' };
    }
    if (payload.format && payload.format !== BACKUP_FORMAT) {
      return { ok: false, error: 'এটি বিরচন সমাহার-এর ব্যাকআপ ফাইল নয়।' };
    }
    if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
      return { ok: false, error: 'ব্যাকআপ ফাইলে কোনো ডেটা পাওয়া যায়নি।' };
    }
    const entries = Object.entries(payload.data).filter(([key]) => key.startsWith('birochon_'));
    if (!entries.length) {
      return { ok: false, error: 'ব্যাকআপ ফাইলে কোনো ডেটা পাওয়া যায়নি।' };
    }
    const futureVersion = !!payload.appVersion &&
      compareVersions(payload.appVersion, APP_VERSION) > 0;
    return {
      ok: true,
      payload,
      count: entries.length,
      futureVersion,
      exportedAt: payload.exportedAt || null,
      sourceVersion: payload.appVersion || 'অজানা'
    };
  } catch (e) {
    return { ok: false, error: 'ফাইলটি পড়া যায়নি — সঠিক JSON ব্যাকআপ ফাইল দিন।' };
  }
};

/** Restore every app-owned key. Old (v1.0) keys are written unchanged. */
export const restoreBackup = (parsed) => {
  const valid = parsed?.ok ? parsed : parseBackup(parsed);
  if (!valid.ok) return { ok: false, error: valid.error, restoredKeys: [] };
  const restoredKeys = [];
  try {
    Object.entries(valid.payload.data).forEach(([key, value]) => {
      if (!key.startsWith('birochon_')) return; // never touch other apps' data
      const raw = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, raw);
      restoredKeys.push(key);
    });
    return { ok: true, restoredKeys, count: restoredKeys.length };
  } catch (e) {
    return { ok: false, error: 'ডেটা সংরক্ষণ করা যায়নি — স্টোরেজ ভর্তি হতে পারে।', restoredKeys };
  }
};

export const backupFileName = () => {
  const d = new Date();
  const stamp = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('');
  return `birochon-backup-v${APP_VERSION}-${stamp}.json`;
};

/** Browser/WebView download. Returns false if downloads are unavailable. */
export const downloadBackup = (payload) => {
  try {
    const blob = new Blob([serializeBackup(payload)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  } catch (e) {
    return false;
  }
};

export const copyBackupToClipboard = async (payload) => {
  try {
    await navigator.clipboard.writeText(serializeBackup(payload));
    return true;
  } catch (e) {
    return false;
  }
};

/** Android / Web Share API, when available. */
export const shareBackup = async (payload) => {
  try {
    if (!navigator.share) return false;
    const text = serializeBackup(payload);
    const file = typeof File !== 'undefined'
      ? new File([text], backupFileName(), { type: 'application/json' })
      : null;
    if (file && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'বিরচন সমাহার — ব্যাকআপ' });
    } else {
      await navigator.share({ title: 'বিরচন সমাহার — ব্যাকআপ', text });
    }
    return true;
  } catch (e) {
    return false; // user cancelled → let the UI offer clipboard instead
  }
};
