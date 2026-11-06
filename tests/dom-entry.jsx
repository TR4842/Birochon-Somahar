import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import ReadingTabs from '../src/components/ReadingTabs.jsx';
import data from '../src/data/birochon_data.json';
import { installStorage } from './helpers.mjs';
import {
  loadReadingProgress, markReadUpTo, updateCategoryProgress
} from '../src/utils/readingProgress.js';
import { READING_KEY } from '../src/utils/storage.js';

/**
 * Reproduces the reported bug end-to-end:
 *   1. user ticks item #45 (index 44) as "read up to here"
 *   2. scroll tracking writes an OLDER card (#1) into the stored resume anchor
 *   3. a NEW session must still open on the page containing item #46
 *      (the first unread one), and "চালিয়ে যান" must exist / work.
 */
export async function runScenario() {
  installStorage();
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  const items = data.items.bagdhara;
  let state = markReadUpTo(loadReadingProgress(), 'bagdhara', {
    itemId: items[44].id,
    index: 44,
    nextId: items[45].id,
    page: 2
  });
  state = updateCategoryProgress(state, 'bagdhara', {
    resumeId: items[0].id,
    resumeIndex: 0,
    scrollY: 0,
    page: 1
  });
  localStorage.setItem(READING_KEY, JSON.stringify(state));

  const scrollCalls = [];
  Object.defineProperty(window, 'scrollTo', {
    value: (opts) => scrollCalls.push(opts), configurable: true, writable: true
  });
  // jsdom has no layout: all rects are zero. Our anchor lookup uses attributes,
  // so the scroll call is still observable.
  window.Element.prototype.getBoundingClientRect = () => ({
    top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0
  });

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <ReadingTabs
        databaseData={data}
        bookmarks={[]}
        onToggleBookmark={() => {}}
        onPracticeItem={() => {}}
      />
    );
  });
  // allow the auto-resume jump timers (90ms + retries) to run
  await act(async () => { await new Promise((r) => setTimeout(r, 500)); });

  const shown = Array.from(container.querySelectorAll('[data-reading-item]'))
    .map((el) => el.getAttribute('data-item-id'));
  const buttons = Array.from(container.querySelectorAll('button'));
  const continueButton = buttons.find((b) => b.textContent.includes('চালিয়ে যান'));

  const firstResult = {
    shown,
    scrollCalls: scrollCalls.length,
    hasTarget: shown.includes(items[45].id),
    hasFirstItem: shown.includes(items[0].id),
    continueButtonCount: buttons.filter((b) => b.textContent.includes('চালিয়ে যান')).length,
    savedResumeId: JSON.parse(localStorage.getItem(READING_KEY)).categories.bagdhara.resumeId
  };

  // Now press "চালিয়ে যান" explicitly — it must re-jump to the same first
  // unread item even though the user is already inside the reading section.
  scrollCalls.length = 0;
  if (continueButton) {
    await act(async () => {
      continueButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    });
    await act(async () => { await new Promise((r) => setTimeout(r, 500)); });
  }
  const afterClick = {
    clicked: !!continueButton,
    scrollCalls: scrollCalls.length,
    savedResumeId: JSON.parse(localStorage.getItem(READING_KEY)).categories.bagdhara.resumeId,
    stillHasTarget: Array.from(container.querySelectorAll('[data-reading-item]'))
      .some((el) => el.getAttribute('data-item-id') === items[45].id)
  };

  await act(async () => root.unmount());
  container.remove();
  return { firstResult, afterClick, targetId: items[45].id };
}
