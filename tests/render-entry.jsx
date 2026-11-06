import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../src/App.jsx';
import ReadingTabs from '../src/components/ReadingTabs.jsx';
import ReadingProgressCard from '../src/components/ReadingProgressCard.jsx';
import UpdateCard from '../src/components/UpdateCard.jsx';
import BackupCard from '../src/components/BackupCard.jsx';
import AboutView from '../src/components/AboutView.jsx';
import ItemCard from '../src/components/ItemCard.jsx';
import Navbar from '../src/components/Navbar.jsx';
import data from '../src/data/birochon_data.json';
import { installStorage } from './helpers.mjs';

// Server-render every changed view: catches bad imports / undefined props
// without needing a browser. Effects (scroll, fetch) do not run in SSR.
export function renderAll() {
  installStorage();
  const noop = () => {};
  const out = {};
  out.app = renderToString(<App />);
  out.reading = renderToString(
    <ReadingTabs databaseData={data} bookmarks={[]} onToggleBookmark={noop} onPracticeItem={noop} />
  );
  out.progressCard = renderToString(
    <ReadingProgressCard databaseData={data} readingProgress={{ lastCategoryId: 'bagdhara', categories: {} }} onResumeReading={noop} />
  );
  out.updateCard = renderToString(<UpdateCard />);
  out.backupCard = renderToString(<BackupCard />);
  out.about = renderToString(<AboutView />);
  out.navbar = renderToString(<Navbar activeTab="about" setActiveTab={noop} updateBadge="নতুন" />);
  out.item = renderToString(
    <ItemCard
      item={data.items.bagdhara[0]}
      isBookmarked={false}
      onToggleBookmark={noop}
      onPracticeItem={noop}
      isRead
      isMarkedHere
      onMarkReadUpTo={noop}
    />
  );
  return out;
}
