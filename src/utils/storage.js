// Storage helper for offline persistence

const STATS_KEY = 'birochon_quiz_stats_v1';
const BOOKMARKS_KEY = 'birochon_bookmarks_v1';
const SETTINGS_KEY = 'birochon_settings_v1';

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
        categoryName: quizResult.categoryName || 'সকল বিষয়',
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
    return raw ? JSON.parse(raw) : [];
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
