import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Navbar from './components/Navbar.jsx';
import StatsLanding from './components/StatsLanding.jsx';
import ReadingTabs from './components/ReadingTabs.jsx';
import QuizView from './components/QuizView.jsx';
import BookmarksView from './components/BookmarksView.jsx';
import AboutView from './components/AboutView.jsx';

import birochonData from './data/birochon_data.json';
import {
  loadStats,
  saveQuizResult,
  resetStats,
  loadBookmarks,
  toggleBookmark,
  loadSettings,
  saveSettings,
  runAppMigration
} from './utils/storage.js';
import { CATEGORY_IDS, loadReadingProgress } from './utils/readingProgress.js';
import { APP_VERSION } from './utils/appVersion.js';
import { shouldAutoCheck, checkForUpdate } from './utils/updater.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('stats'); // Default landing page is STATISTICS as requested!
  const [stats, setStats] = useState(getInitialStatsState);
  const [bookmarks, setBookmarks] = useState([]);
  const [practiceItem, setPracticeItem] = useState(null);
  const [readingProgress, setReadingProgress] = useState(() => loadReadingProgress());
  const [readingCategory, setReadingCategory] = useState(() => loadReadingProgress().lastCategoryId || 'bagdhara');
  const [readingSession, setReadingSession] = useState(0);
  const [forceContinue, setForceContinue] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [upgradeNotice, setUpgradeNotice] = useState(null);

  function getInitialStatsState() {
    return loadStats();
  }

  useEffect(() => {
    setStats(loadStats());
    setBookmarks(loadBookmarks());

    // Non-destructive upgrade bookkeeping: v1.0 keys are left exactly as they
    // are, we only add a small metadata record.
    const migration = runAppMigration(APP_VERSION);
    if (migration.isUpgrade) {
      setUpgradeNotice(`v${APP_VERSION} আপডেট সফল — পরিসংখ্যান, বুকমার্ক ও পড়ার অগ্রগতি অক্ষত আছে।`);
      setTimeout(() => setUpgradeNotice(null), 8000);
    }

    // Optional, opt-in daily update check. Offline users never see a request.
    const settings = loadSettings();
    if (shouldAutoCheck(settings)) {
      checkForUpdate()
        .then((result) => {
          saveSettings({ lastUpdateCheckAt: Date.now() });
          setUpdateInfo(
            settings.dismissedUpdateTag === result.latestVersion
              ? { ...result, dismissed: true }
              : result
          );
        })
        .catch(() => { /* stay silent offline */ });
    }
  }, []);

  // ReadingTabs writes straight to localStorage while scrolling; refresh the
  // home dashboard whenever the user comes back to it.
  useEffect(() => {
    setReadingProgress(loadReadingProgress());
  }, [activeTab]);

  const handleQuizComplete = (quizResult) => {
    const updatedStats = saveQuizResult(quizResult);
    setStats(updatedStats);
  };

  const handleResetStats = () => {
    const freshStats = resetStats();
    setStats(freshStats);
  };

  const handleToggleBookmark = (itemId) => {
    const updated = toggleBookmark(itemId);
    setBookmarks(updated);
  };

  const handlePracticeItem = (item) => {
    setPracticeItem(item);
    setActiveTab('quiz');
  };

  const handleResumeReading = (categoryId) => {
    const target = CATEGORY_IDS.includes(categoryId) ? categoryId : readingCategory;
    setReadingCategory(target);
    setReadingSession((n) => n + 1); // remount → perform the jump
    // This is an explicit "চালিয়ে যান" request: jump even when auto-resume is
    // switched off, and clear any saved filters so the target is guaranteed.
    setForceContinue(true);
    setActiveTab('reading');
  };

  const navigateTo = (tab) => {
    // Only the explicit "চালিয়ে যান" shortcut forces a jump; any ordinary
    // navigation clears the flag so a later visit honours the user's setting.
    setForceContinue(false);
    if (tab !== 'quiz') setPracticeItem(null);
    setActiveTab(tab);
  };

  const handleUpdateChecked = (info) => setUpdateInfo(info);
  const updateBadge = updateInfo?.updateAvailable && !updateInfo.dismissed ? 'নতুন' : null;

  return (
    <div className="min-h-screen bg-cream-50 text-warmcharcoal-300 flex flex-col font-bengali selection:bg-peach-200">

      {/* One-time, non-intrusive "your data survived the update" message */}
      {upgradeNotice && (
        <div className="fixed top-[70px] left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-mint-400 text-white text-xs font-bold rounded-xl shadow-retro max-w-[92vw] text-center">
          {upgradeNotice}
        </div>
      )}

      {/* App Top Header */}
      <Header
        stats={stats}
        activeTab={activeTab}
        setActiveTab={navigateTo}
        onResetStats={handleResetStats}
      />

      {/* Main Tab Content View */}
      <main className="flex-1">
        {activeTab === 'stats' && (
          <StatsLanding
            stats={stats}
            databaseInfo={birochonData}
            onStartQuiz={() => navigateTo('quiz')}
            onResetStats={handleResetStats}
            setActiveTab={navigateTo}
            readingProgress={readingProgress}
            onResumeReading={handleResumeReading}
          />
        )}

        {activeTab === 'reading' && (
          <ReadingTabs
            key={readingSession}
            databaseData={birochonData}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onPracticeItem={handlePracticeItem}
            initialSubTab={readingCategory}
            onCategoryChange={setReadingCategory}
            onProgressChange={setReadingProgress}
            forceContinueOnMount={forceContinue}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            databaseData={birochonData}
            onQuizComplete={handleQuizComplete}
            onReturnHome={() => navigateTo('stats')}
            initialItemToPractice={practiceItem}
          />
        )}

        {activeTab === 'bookmarks' && (
          <BookmarksView
            databaseData={birochonData}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onPracticeItem={handlePracticeItem}
          />
        )}

        {activeTab === 'about' && (
          <AboutView
            updateInfo={updateInfo}
            onUpdateChecked={handleUpdateChecked}
          />
        )}
      </main>

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={navigateTo}
        bookmarkCount={bookmarks.length}
        updateBadge={updateBadge}
      />
    </div>
  );
}
