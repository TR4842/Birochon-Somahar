// ============================================================================
// Per-category reading progress (v1.1.0)
// ----------------------------------------------------------------------------
// Goal: a reader should never have to scroll to find where they stopped.
//
//  * Every one of the 5 categories keeps its OWN independent state: last
//    category, filters, page, scroll position, "resume here" anchor and the
//    "read up to here" tick mark.
//  * The tick mark sets `readThroughIndex`: every item before (and including)
//    that position counts as read, and the next session resumes from the first
//    unread item.
//  * Both an item ID and an index are stored. If a future database update adds
//    or removes rows, the ID wins, so marks never silently jump to the wrong
//    word. Corrupt / older / missing data is normalised instead of throwing.
// ============================================================================

import { READING_KEY, saveSettings } from './storage.js';

export const READING_SCHEMA_VERSION = 1;
export const CATEGORY_IDS = Object.freeze([
  'bagdhara',
  'biporit',
  'paribhashik',
  'ekkothay',
  'somarthok'
]);

export const DEFAULT_FILTERS = Object.freeze({
  searchQuery: '',
  letterFilter: 'ALL',
  onlyBookmarks: false,
  isShuffle: false,
  shuffleSeed: null
});

export const DEFAULT_VIEW = Object.freeze({
  ...DEFAULT_FILTERS,
  currentPage: 1
});

const clampInt = (value, min, max, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
};

export const makeCategoryProgress = () => ({
  resumeId: null,          // item to continue from (first unread)
  resumeIndex: 0,          // canonical (unfiltered) index of that item
  readThroughId: null,     // tick mark: everything up to this item is read
  readThroughIndex: -1,    // -1 = nothing marked yet
  page: 1,
  scrollY: 0,
  filters: { ...DEFAULT_FILTERS },
  updatedAt: null
});

const normalizeFilters = (raw) => {
  const f = raw && typeof raw === 'object' ? raw : {};
  return {
    searchQuery: typeof f.searchQuery === 'string' ? f.searchQuery.slice(0, 120) : '',
    letterFilter: typeof f.letterFilter === 'string' ? f.letterFilter.slice(0, 4) : 'ALL',
    onlyBookmarks: !!f.onlyBookmarks,
    isShuffle: !!f.isShuffle,
    shuffleSeed: Number.isFinite(Number(f.shuffleSeed)) && Number(f.shuffleSeed) > 0
      ? Math.floor(Number(f.shuffleSeed))
      : null
  };
};

const normalizeCategory = (raw) => {
  const e = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return {
    resumeId: typeof e.resumeId === 'string'
      ? e.resumeId
      : (typeof e.lastItemId === 'string' ? e.lastItemId : null),
    resumeIndex: clampInt(e.resumeIndex ?? e.lastIndex, 0, 1000000, 0),
    readThroughId: typeof e.readThroughId === 'string' ? e.readThroughId : null,
    readThroughIndex: clampInt(e.readThroughIndex, -1, 1000000, -1),
    page: clampInt(e.page ?? e.currentPage, 1, 100000, 1),
    scrollY: clampInt(e.scrollY, 0, 10000000, 0),
    filters: normalizeFilters(e.filters || e),
    updatedAt: typeof e.updatedAt === 'string' ? e.updatedAt : null
  };
};

/** Turn any stored / legacy / broken shape into the current schema. */
export const normalizeProgress = (raw) => {
  const safe = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const categories = {};
  CATEGORY_IDS.forEach((id) => {
    const entry = safe.categories?.[id] ?? safe[id] ?? {};
    categories[id] = normalizeCategory(entry);
  });
  const last = safe.lastCategoryId || safe.lastCategory || safe.activeCategory;
  return {
    schemaVersion: READING_SCHEMA_VERSION,
    lastCategoryId: CATEGORY_IDS.includes(last) ? last : CATEGORY_IDS[0],
    categories
  };
};

// v1.0.0 had no reading progress key. Still, tolerate old experiments / future
// downgrades: pick up simple "category -> index" maps from legacy keys.
const LEGACY_KEYS = [
  'birochon_reading_v0',
  'birochon_reading_position_v1',
  'birochon_last_read_v1'
];

const readLegacyProgress = () => {
  try {
    for (const key of LEGACY_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') continue;
      const categories = {};
      CATEGORY_IDS.forEach((id) => {
        const value = parsed.categories?.[id] ?? parsed[id];
        if (value === undefined || value === null) return;
        const entry = typeof value === 'object' ? value : { resumeIndex: value, readThroughIndex: value - 1 };
        categories[id] = normalizeCategory(entry);
      });
      if (Object.keys(categories).length) return { categories, lastCategoryId: parsed.lastCategoryId };
    }
  } catch (e) {
    /* ignore broken legacy data */
  }
  return null;
};

export const loadReadingProgress = () => {
  let parsed = null;
  try {
    const raw = localStorage.getItem(READING_KEY);
    parsed = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error loading reading progress', e);
  }

  let state;
  if (parsed) {
    state = normalizeProgress(parsed);
    // Older builds stored the toggles inside the progress object; lift them
    // into the settings key once, without losing anything.
    if (parsed.settings && typeof parsed.settings === 'object') {
      const { autoResume, autoMarkRead } = parsed.settings;
      const patch = {};
      if (typeof autoResume === 'boolean') patch.autoResume = autoResume;
      if (typeof autoMarkRead === 'boolean') patch.autoMarkRead = autoMarkRead;
      if (Object.keys(patch).length) saveSettings(patch);
    }
  } else {
    const legacy = readLegacyProgress();
    state = normalizeProgress(legacy || {});
    if (legacy) saveReadingProgress(state);
  }
  return state;
};

export const saveReadingProgress = (state) => {
  const normalized = normalizeProgress(state);
  try {
    localStorage.setItem(READING_KEY, JSON.stringify(normalized));
  } catch (e) {
    console.error('Error saving reading progress', e);
  }
  return normalized;
};

export const getCategoryProgress = (state, categoryId) =>
  normalizeProgress(state).categories[categoryId] || makeCategoryProgress();

export const hasAnyProgress = (state) => {
  const s = normalizeProgress(state);
  return CATEGORY_IDS.some((id) => {
    const c = s.categories[id];
    return c.readThroughIndex >= 0 || c.resumeId || c.scrollY > 0 || c.page > 1;
  });
};

/** Returns a NEW saved state (never mutates the input). */
export const updateCategoryProgress = (state, categoryId, patch = {}) => {
  const base = normalizeProgress(state);
  const prev = base.categories[categoryId] || makeCategoryProgress();
  const nextCategory = {
    ...prev,
    ...patch,
    filters: { ...prev.filters, ...(patch.filters || {}) },
    updatedAt: new Date().toISOString()
  };
  const next = {
    ...base,
    categories: { ...base.categories, [categoryId]: normalizeCategory(nextCategory) }
  };
  return saveReadingProgress(next);
};

export const setLastCategory = (state, categoryId) => {
  const base = normalizeProgress(state);
  if (!CATEGORY_IDS.includes(categoryId)) return base;
  return saveReadingProgress({ ...base, lastCategoryId: categoryId });
};

/** "Tick" an item: everything up to it is read, resume from the next one. */
export const markReadUpTo = (state, categoryId, { itemId, index, nextId = null, page } = {}) => {
  const i = clampInt(index, 0, 1000000, 0);
  const patch = {
    readThroughId: itemId || null,
    readThroughIndex: i,
    resumeId: nextId,
    resumeIndex: i + 1
  };
  if (Number.isFinite(Number(page))) patch.page = clampInt(page, 1, 100000, 1);
  return updateCategoryProgress(state, categoryId, patch);
};

/** Clear the tick mark / resume point for one category (or all of them). */
export const resetCategoryProgress = (state, categoryId = null) => {
  const base = normalizeProgress(state);
  const targets = categoryId ? [categoryId] : CATEGORY_IDS;
  const categories = { ...base.categories };
  targets.forEach((id) => {
    if (CATEGORY_IDS.includes(id)) categories[id] = makeCategoryProgress();
  });
  return saveReadingProgress({ ...base, categories });
};

/**
 * Resolve stored IDs/indices against the CURRENT database so that adding new
 * words in a future release cannot shift a user's read marks.
 */
export const resolveCategoryProgress = (state, categoryId, items = []) => {
  const cp = getCategoryProgress(state, categoryId);
  const indexById = new Map();
  items.forEach((item, i) => indexById.set(item.id, i));
  const total = items.length;

  const byIdOrIndex = (id, index, fallback) => {
    if (id && indexById.has(id)) return indexById.get(id);
    const value = Number.isFinite(Number(index)) ? Math.floor(Number(index)) : fallback;
    return clampInt(value, 0, Math.max(total, 1), fallback);
  };

  const readThroughIndex = cp.readThroughIndex < 0
    ? -1
    : Math.min(total - 1, byIdOrIndex(cp.readThroughId, cp.readThroughIndex, -1));
  const resumeIndex = byIdOrIndex(cp.resumeId, cp.resumeIndex, 0);
  const readCount = readThroughIndex < 0 ? 0 : Math.min(total, readThroughIndex + 1);

  return {
    ...cp,
    readThroughIndex,
    resumeIndex,
    readCount,
    total,
    percent: total ? Math.round((readCount / total) * 100) : 0,
    isComplete: total > 0 && readCount >= total,
    indexById
  };
};

/** Deterministic shuffle: a saved seed keeps order stable across sessions. */
export const seededShuffle = (items, seed) => {
  const result = [...items];
  let state = (Number(seed) || 1) >>> 0;
  const random = () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const makeShuffleSeed = () => Math.floor(Math.random() * 2147483646) + 1;

/** Which page contains the resume anchor in the CURRENT filtered list. */
export const computeResumePage = (filteredItems, resolved, indexById, itemsPerPage = 30) => {
  const maxPage = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const savedPage = Math.min(maxPage, Math.max(1, resolved.page || 1));
  let index = filteredItems.findIndex((item) => item.id === resolved.resumeId);
  if (index < 0 && filteredItems.length) {
    const target = resolved.resumeIndex;
    index = filteredItems.findIndex((item) => (indexById.get(item.id) ?? -1) >= target);
  }
  if (index < 0) return savedPage;
  return Math.min(maxPage, Math.floor(index / itemsPerPage) + 1);
};
