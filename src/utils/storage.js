// Storage helper for offline persistence
//
// IMPORTANT (upgrade safety): the keys below are the SAME keys that shipped in
// v1.0.0. Never rename or reshape them — an app update is installed on top of
// the old APK and the WebView localStorage must survive untouched. New features
// get NEW keys, and every reader below tolerates missing / malformed / older
// data so a v1.0 install can open v1.1+ without any migration wipe.

const STATS_KEY = 'birochon_quiz_stats_v1';
const BOOKMARKS_KEY = 'birochon_bookmarks_v1';
const SETTINGS_KEY = 'birochon_settings_v1';
// Persistent list of questions the user got wrong across quizzes. Used to
// offer a "re-practice from wrong answers" quiz mode.
const WRONG_KEY = 'birochon_wrong_v1';
export const READING_KEY = 'birochon_reading_progress_v1';
const META_KEY = 'birochon_app_meta_v1';

export const APP_SCHEMA_VERSION = 2;

// Every key owned by this app. Used by the backup/restore feature so a user can
// carry their data across a reinstall (needed only if the signing key changes).
export const APP_DATA_KEYS = Object.freeze([
  STATS_KEY,
  BOOKMARKS_KEY,
  WRONG_KEY,
  SETTINGS_KEY,
  READING_KEY,
  META_KEY
]);

export const getInitialStats = () => {
  return {
    totalQuizzes: 0,
    totalQuestions: 0,
    totalRight: 0,
    totalWrong: 0,
    totalTimeSpentSeconds: 0,
    currentStreak: 0,
    lastQuizDate: null,
    categoryStats: {
      bagdhara: { right: 0, wrong: 0, total: 0 },
      biporit: { right: 0, wrong: 0, total: 0 },
      paribhashik: { right: 0, wrong: 0, total: 0 },
      ekkothay: { right: 0, wrong: 0, total: 0 },
      somarthok: { right: 0, wrong: 0, total: 0 }
    },
    history: []
  };
};

export const loadStats = () => {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return getInitialStats();
    const parsed = JSON.parse(raw);
    // Merge saved categoryStats over defaults so newly added categories appear for existing users
    return {
      ...getInitialStats(),
      ...parsed,
      categoryStats: { ...getInitialStats().categoryStats, ...(parsed.categoryStats || {}) }
    };
  } catch (e) {
    console.error('Error loading stats', e);
    return getInitialStats();
  }
};

export const saveQuizResult = (quizResult) => {
  try {
    const current = loadStats();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    let newStreak = current.currentStreak || 0;
    if (!current.lastQuizDate) {
      newStreak = 1;
    } else {
      const lastDate = new Date(current.lastQuizDate);
      const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    const updatedCategoryStats = { ...current.categoryStats };
    if (quizResult.categoryBreakdown) {
      Object.entries(quizResult.categoryBreakdown).forEach(([catKey, counts]) => {
        if (!updatedCategoryStats[catKey]) {
          updatedCategoryStats[catKey] = { right: 0, wrong: 0, total: 0 };
        }
        updatedCategoryStats[catKey].right += counts.right || 0;
        updatedCategoryStats[catKey].wrong += counts.wrong || 0;
        updatedCategoryStats[catKey].total += (counts.right || 0) + (counts.wrong || 0);
      });
    }

    const newHistory = [
      {
        id: 'qhist_' + Date.now(),
        date: now.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        categoryName: quizResult.categoryName || 'সকল বিষয়',
        totalQuestions: quizResult.totalQuestions,
        rightCount: quizResult.rightCount,
        wrongCount: quizResult.wrongCount,
        accuracy: quizResult.accuracy,
        timeSpentSeconds: quizResult.timeSpentSeconds,
        details: quizResult.details || []
      },
      ...current.history
    ].slice(0, 50);

    const newStats = {
      totalQuizzes: current.totalQuizzes + 1,
      totalQuestions: current.totalQuestions + quizResult.totalQuestions,
      totalRight: current.totalRight + quizResult.rightCount,
      totalWrong: current.totalWrong + quizResult.wrongCount,
      totalTimeSpentSeconds: current.totalTimeSpentSeconds + (quizResult.timeSpentSeconds || 0),
      currentStreak: newStreak,
      lastQuizDate: dateStr,
      categoryStats: updatedCategoryStats,
      history: newHistory
    };

    localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    return newStats;
  } catch (e) {
    console.error('Error saving quiz result', e);
    return loadStats();
  }
};

export const resetStats = () => {
  const initial = getInitialStats();
  localStorage.setItem(STATS_KEY, JSON.stringify(initial));
  return initial;
};

export const loadBookmarks = () => {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const toggleBookmark = (itemId) => {
  const bookmarks = loadBookmarks();
  const index = bookmarks.indexOf(itemId);
  let updated;
  if (index > -1) {
    updated = bookmarks.filter(id => id !== itemId);
  } else {
    updated = [...bookmarks, itemId];
  }
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  return updated;
};

// ============================================================================
// "Wrong answer" persistence
// ----------------------------------------------------------------------------
// We keep a flat array of saved "wrong entries" (one per question-item id).
// Each entry stores everything needed to re-render the question later without
// having to look up the live database — including the prompt, correct answer,
// and the originating category.
// ============================================================================

export const loadWrongAnswers = () => {
  try {
    const raw = localStorage.getItem(WRONG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading wrong answers', e);
    return [];
  }
};

// Add (or refresh) wrong entries. `entries` is an array of:
//   { itemId, category, categoryName, term, meaning, correctAnswer, prompt, options }
// We de-dupe by `itemId` so a question that the user keeps getting wrong only
// appears once in the "re-practice from wrong" list.
export const addWrongAnswers = (entries) => {
  if (!Array.isArray(entries) || entries.length === 0) return loadWrongAnswers();
  try {
    const current = loadWrongAnswers();
    const map = new Map();
    // Existing entries first (so we keep the original add-date).
    current.forEach(e => { if (e && e.itemId) map.set(e.itemId, e); });
    entries.forEach(e => {
      if (!e || !e.itemId) return;
      // Refresh fields but keep the original `addedAt` if already present.
      const existing = map.get(e.itemId);
      map.set(e.itemId, {
        ...e,
        addedAt: existing?.addedAt || new Date().toISOString(),
        lastWrongAt: new Date().toISOString()
      });
    });
    const merged = Array.from(map.values());
    localStorage.setItem(WRONG_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('Error saving wrong answers', e);
    return loadWrongAnswers();
  }
};

// Remove a single wrong entry (e.g. user got it right on a re-practice quiz).
export const removeWrongAnswer = (itemId) => {
  try {
    const current = loadWrongAnswers();
    const updated = current.filter(e => e.itemId !== itemId);
    localStorage.setItem(WRONG_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error removing wrong answer', e);
    return loadWrongAnswers();
  }
};

// Remove all wrong entries (e.g. user cleared history).
export const clearWrongAnswers = () => {
  try {
    localStorage.removeItem(WRONG_KEY);
    return [];
  } catch (e) {
    console.error('Error clearing wrong answers', e);
    return [];
  }
};

// ============================================================================
// Settings + in-place upgrade bookkeeping
// ----------------------------------------------------------------------------
// Settings live in their own key so new options can be added later without ever
// rewriting stats / bookmarks / wrong-answer data from an older install.
// ============================================================================

export const DEFAULT_SETTINGS = Object.freeze({
  // Offline-first: network is only used when the user turns this on (or taps
  // the "check for update" button).
  autoCheckUpdates: false,
  lastUpdateCheckAt: 0,
  dismissedUpdateTag: '',
  // Reading: jump back to the last position automatically on a new session.
  autoResume: true,
  // Reading: optionally mark cards as read as they scroll off the top.
  autoMarkRead: false
});

export const loadSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ...DEFAULT_SETTINGS };
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
};

export const saveSettings = (patch = {}) => {
  const updated = { ...loadSettings(), ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving settings', e);
  }
  return updated;
};

// Read-only metadata about the installed build. Called once at startup.
// It records an upgrade without touching any of the user's existing data, and
// lets the UI reassure users that their progress survived the update.
export const runAppMigration = (currentVersion) => {
  const now = new Date().toISOString();
  try {
    const raw = localStorage.getItem(META_KEY);
    let meta = null;
    try { meta = raw ? JSON.parse(raw) : null; } catch (e) { meta = null; }

    const hadOldData = [STATS_KEY, BOOKMARKS_KEY, WRONG_KEY].some(
      (key) => localStorage.getItem(key) !== null
    );
    const previousVersion = meta?.appVersion || (hadOldData ? '1.0.0' : null);
    const isUpgrade = !!previousVersion && previousVersion !== currentVersion;
    const isFreshInstall = !meta && !hadOldData;

    const nextMeta = {
      schemaVersion: APP_SCHEMA_VERSION,
      appVersion: currentVersion,
      previousVersion: meta?.appVersion || null,
      firstInstalledAt: meta?.firstInstalledAt || now,
      upgradedAt: isUpgrade ? now : (meta?.upgradedAt || null)
    };
    localStorage.setItem(META_KEY, JSON.stringify(nextMeta));

    return {
      isUpgrade,
      isFreshInstall,
      previousVersion,
      currentVersion,
      dataPreserved: true
    };
  } catch (e) {
    console.error('Error running app migration', e);
    return {
      isUpgrade: false,
      isFreshInstall: false,
      previousVersion: null,
      currentVersion,
      dataPreserved: true
    };
  }
};

export const loadAppMeta = () => {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};
