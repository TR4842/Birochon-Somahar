import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import StatsLanding from './components/StatsLanding';
import ReadingTabs from './components/ReadingTabs';
import QuizView from './components/QuizView';
import BookmarksView from './components/BookmarksView';

import birochonData from './data/birochon_data.json';
import { 
  loadStats, 
  saveQuizResult, 
  resetStats, 
  loadBookmarks, 
  toggleBookmark 
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('stats'); // Default landing page is STATISTICS as requested!
  const [stats, setStats] = useState(getInitialStatsState);
  const [bookmarks, setBookmarks] = useState([]);
  const [practiceItem, setPracticeItem] = useState(null);

  function getInitialStatsState() {
    return loadStats();
  }

  useEffect(() => {
    setStats(loadStats());
    setBookmarks(loadBookmarks());
  }, []);

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

  return (
    <div className="min-h-screen bg-cream-50 text-warmcharcoal-300 flex flex-col font-bengali selection:bg-peach-200">
      
      {/* App Top Header */}
      <Header
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetStats={handleResetStats}
      />

      {/* Main Tab Content View */}
      <main className="flex-1">
        {activeTab === 'stats' && (
          <StatsLanding
            stats={stats}
            databaseInfo={birochonData}
            onStartQuiz={() => setActiveTab('quiz')}
            onResetStats={handleResetStats}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'reading' && (
          <ReadingTabs
            databaseData={birochonData}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onPracticeItem={handlePracticeItem}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            databaseData={birochonData}
            onQuizComplete={handleQuizComplete}
            onReturnHome={() => {
              setPracticeItem(null);
              setActiveTab('stats');
            }}
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
      </main>

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'quiz') setPracticeItem(null);
          setActiveTab(tab);
        }}
        bookmarkCount={bookmarks.length}
      />

    </div>
  );
}
