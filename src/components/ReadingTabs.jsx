import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search, Star, BookOpen, Shuffle, X, ChevronLeft, ChevronRight,
  CheckCheck, RotateCcw, MapPin, Settings2, Check, Play
} from 'lucide-react';
import ItemCard from './ItemCard.jsx';
import {
  CATEGORY_IDS, DEFAULT_VIEW,
  loadReadingProgress, getCategoryProgress, updateCategoryProgress,
  setLastCategory, markReadUpTo, resetCategoryProgress,
  resolveCategoryProgress, getContinuePoint, seededShuffle, makeShuffleSeed,
  computeResumePage
} from '../utils/readingProgress.js';
import { loadSettings, saveSettings } from '../utils/storage.js';
import { formatBnNumber } from '../utils/appVersion.js';

const ITEMS_PER_PAGE = 30;
const HEADER_OFFSET = 96; // sticky header + a little breathing room

const bengaliLetters = ['ALL', 'অ', 'আ', 'ই', 'ঈ', 'উ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ', 'ক', 'খ', 'গ', 'ঘ', 'চ', 'ছ', 'জ', 'ঝ', 'ট', 'ঠ', 'ড', 'ঢ', 'ত', 'থ', 'দ', 'ধ', 'ন', 'প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 'শ', 'ষ', 'স', 'হ'];
const englishLetters = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const viewFromProgress = (state, categoryId) => {
  const cp = getCategoryProgress(state, categoryId);
  return { ...DEFAULT_VIEW, ...cp.filters, currentPage: cp.page || 1 };
};

export default function ReadingTabs({
  databaseData,
  bookmarks,
  onToggleBookmark,
  onPracticeItem,
  initialSubTab = 'bagdhara',
  onCategoryChange,
  onProgressChange,
  forceContinueOnMount = false
}) {
  // progressRef is the always-fresh source of truth (scroll updates are written
  // straight to storage without re-rendering the whole list). `progress` state
  // is only bumped for visible changes such as tick marks / resets.
  const progressRef = useRef(null);
  if (progressRef.current === null) progressRef.current = loadReadingProgress();

  const initialCategory = CATEGORY_IDS.includes(initialSubTab)
    ? initialSubTab
    : (progressRef.current.lastCategoryId || 'bagdhara');

  const [progress, setProgress] = useState(progressRef.current);
  const [subTab, setSubTab] = useState(initialCategory);
  const subTabRef = useRef(initialCategory);
  const [view, setView] = useState(() => viewFromProgress(progressRef.current, initialCategory));
  const viewRef = useRef(view);
  const [settings, setSettings] = useState(() => loadSettings());
  const settingsRef = useRef(settings);
  const [toast, setToast] = useState(null);
  const [resumeNotice, setResumeNotice] = useState(null);
  const resumePendingRef = useRef(true);
  const mountedRef = useRef(true);
  const timersRef = useRef([]);
  const ctxRef = useRef({});
  // Always points at the newest jump implementation, so effects never capture
  // a stale `filteredItems` / `view` closure.
  const jumpToPointRef = useRef(null);

  const subTabs = [
    { id: 'bagdhara', name: 'বাগধারা', count: databaseData.categories.bagdhara.count, color: 'peach' },
    { id: 'biporit', name: 'বিপরীত শব্দ', count: databaseData.categories.biporit.count, color: 'mint' },
    { id: 'paribhashik', name: 'পারিভাষিক শব্দ', count: databaseData.categories.paribhashik.count, color: 'babyblue' },
    { id: 'ekkothay', name: 'এককথায় প্রকাশ', count: databaseData.categories.ekkothay.count, color: 'retrogold' },
    { id: 'somarthok', name: 'সমার্থক শব্দ', count: databaseData.categories.somarthok.count, color: 'retrorose' }
  ];

  const filterLetters = subTab === 'paribhashik' ? englishLetters : bengaliLetters;

  // -------------------------------------------------------------------------
  // Data + derived views
  // -------------------------------------------------------------------------
  const baseItems = useMemo(() => databaseData.items[subTab] || [], [databaseData, subTab]);
  const indexById = useMemo(() => {
    const map = new Map();
    baseItems.forEach((item, i) => map.set(item.id, i));
    return map;
  }, [baseItems]);

  const filteredItems = useMemo(() => {
    let items = baseItems;

    if (view.searchQuery.trim()) {
      const q = view.searchQuery.trim().toLowerCase();
      items = items.filter(item =>
        (item.term || '').toLowerCase().includes(q) ||
        (item.meaning || '').toLowerCase().includes(q)
      );
    }

    if (view.letterFilter !== 'ALL') {
      items = items.filter(item =>
        (item.term || '').trim().toUpperCase().startsWith(view.letterFilter)
      );
    }

    if (view.onlyBookmarks) {
      items = items.filter(item => bookmarks.includes(item.id));
    }

    // Seeded shuffle: stable across sessions and re-renders (unlike Math.random)
    if (view.isShuffle) {
      items = seededShuffle(items, view.shuffleSeed || 1);
    }

    return items;
  }, [baseItems, view.searchQuery, view.letterFilter, view.onlyBookmarks, view.isShuffle, view.shuffleSeed, bookmarks]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (view.currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, view.currentPage]);

  const resolved = useMemo(
    () => resolveCategoryProgress(progressRef.current, subTab, baseItems),
    [progress, subTab, baseItems] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Keep scroll handlers free of stale closures.
  ctxRef.current = { subTab, view, baseItems, indexById, paginatedItems, settings: settingsRef.current };

  // -------------------------------------------------------------------------
  // Persistence helpers
  // -------------------------------------------------------------------------
  const commitProgress = useCallback((next, notify = false) => {
    progressRef.current = next;
    if (notify) {
      setProgress(next);
      onProgressChange?.(next);
    }
  }, [onProgressChange]);

  const applyView = useCallback((next, { persist = true } = {}) => {
    viewRef.current = next;
    setView(next);
    if (persist) {
      const saved = updateCategoryProgress(progressRef.current, subTabRef.current, {
        filters: {
          searchQuery: next.searchQuery,
          letterFilter: next.letterFilter,
          onlyBookmarks: next.onlyBookmarks,
          isShuffle: next.isShuffle,
          shuffleSeed: next.shuffleSeed
        },
        page: next.currentPage
      });
      commitProgress(saved);
    }
  }, [commitProgress]);

  const patchView = useCallback((patch, resetPage = false) => {
    const next = {
      ...viewRef.current,
      ...patch,
      currentPage: resetPage ? 1 : (patch.currentPage ?? viewRef.current.currentPage)
    };
    applyView(next);
  }, [applyView]);

  const showToast = useCallback((text) => {
    setToast(text);
    const timer = setTimeout(() => {
      if (mountedRef.current) setToast(null);
    }, 3800);
    timersRef.current.push(timer);
  }, []);

  /**
   * Move the view to `point` (the first unread item). The explicit
   * "চালিয়ে যান" button clears filters so the canonical list is guaranteed;
   * the automatic session resume keeps saved filters when the target is there.
   * The scroll is retried because the target page renders one tick later.
   */
  const jumpToPoint = (point, { resetFilters = false, noticeText = null } = {}) => {
    if (!point?.id) return false;

    const inFiltered = filteredItems.some((item) => item.id === point.id);
    const clearFilters = resetFilters || !inFiltered;
    let nextView;
    let page;

    if (clearFilters) {
      const maxPage = Math.max(1, Math.ceil(baseItems.length / ITEMS_PER_PAGE));
      page = Math.min(maxPage, Math.floor(point.index / ITEMS_PER_PAGE) + 1);
      nextView = { ...DEFAULT_VIEW, currentPage: page };
    } else {
      page = computeResumePage(
        filteredItems,
        { resumeId: point.id, resumeIndex: point.index, page: viewRef.current.currentPage },
        indexById,
        ITEMS_PER_PAGE
      );
      nextView = { ...viewRef.current, currentPage: page };
    }

    viewRef.current = nextView;
    setView(nextView);

    const saved = updateCategoryProgress(progressRef.current, subTabRef.current, {
      filters: {
        searchQuery: nextView.searchQuery,
        letterFilter: nextView.letterFilter,
        onlyBookmarks: nextView.onlyBookmarks,
        isShuffle: nextView.isShuffle,
        shuffleSeed: nextView.shuffleSeed
      },
      page,
      resumeId: point.id,
      resumeIndex: point.index
    });
    commitProgress(saved, true);

    const text = noticeText || (point.hasMark
      ? `${formatBnNumber(point.readCount)} নম্বর পর্যন্ত পড়া হয়েছে — ${formatBnNumber(point.index + 1)} নম্বর থেকে চালিয়ে যাওয়া হচ্ছে।`
      : `গতবার যেখানে ছেড়েছিলেন সেখান থেকে শুরু করা হচ্ছে (${formatBnNumber(point.index + 1)} নম্বর)।`);

    let attempts = 0;
    const attemptScroll = () => {
      if (!mountedRef.current) return;
      const cards = Array.from(document.querySelectorAll('[data-reading-item]'));
      const anchor = cards.find((el) => el.getAttribute('data-item-id') === point.id);
      if (anchor) {
        const top = anchor.getBoundingClientRect().top + (window.scrollY || 0) - HEADER_OFFSET;
        window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
        setResumeNotice(text);
        return;
      }
      if (attempts++ < 6) {
        const t = setTimeout(attemptScroll, 120);
        timersRef.current.push(t);
      }
    };
    const t0 = setTimeout(attemptScroll, 90);
    timersRef.current.push(t0);
    return true;
  };
  jumpToPointRef.current = jumpToPoint;

  const recordPosition = useCallback(() => {
    if (!mountedRef.current) return;
    const ctx = ctxRef.current;
    if (!ctx.paginatedItems?.length) return;
    const cards = Array.from(document.querySelectorAll('[data-reading-item]'));
    if (!cards.length) return;

    let best = null;
    let bestDist = Infinity;
    for (const el of cards) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < HEADER_OFFSET || rect.top > window.innerHeight - 24) continue;
      const dist = Math.abs(rect.top - HEADER_OFFSET);
      if (dist < bestDist) { bestDist = dist; best = el; }
    }
    if (!best) return;

    const visibleId = best.getAttribute('data-item-id');
    const visibleIndex = Number(best.getAttribute('data-index')) || 0;
    const patch = {
      page: ctx.view.currentPage,
      scrollY: Math.round(window.scrollY || window.pageYOffset || 0)
    };

    // ROOT-CAUSE FIX: the tick mark is authoritative. If the user scrolled back
    // into already-read content (or the auto-jump scroll event fires), do NOT
    // replace the "next unread" anchor with that older card.
    const continuePoint = getContinuePoint(progressRef.current, ctx.subTab, ctx.baseItems);
    if (!continuePoint.hasMark || visibleIndex >= continuePoint.index) {
      patch.resumeId = visibleId;
      patch.resumeIndex = visibleIndex;
    }

    if (ctx.settings.autoMarkRead) {
      let lastRead = -1;
      for (const el of cards) {
        const rect = el.getBoundingClientRect();
        const i = Number(el.getAttribute('data-index'));
        if (rect.bottom <= HEADER_OFFSET && Number.isFinite(i) && i > lastRead) lastRead = i;
      }
      const cp = getCategoryProgress(progressRef.current, ctx.subTab);
      if (lastRead > (cp.readThroughIndex ?? -1)) {
        patch.readThroughIndex = lastRead;
        patch.readThroughId = ctx.baseItems[lastRead]?.id || null;
      }
    }

    const saved = updateCategoryProgress(progressRef.current, ctx.subTab, patch);
    // Only auto-mark needs an immediate re-render (to show the read styling).
    commitProgress(saved, patch.readThroughIndex !== undefined);
  }, [commitProgress]);

  // -------------------------------------------------------------------------
  // Effects: flush scroll position, auto-resume on mount / category switch
  // -------------------------------------------------------------------------
  useEffect(() => {
    mountedRef.current = true;
    // React StrictMode (dev) mounts twice: re-arm the one-shot auto-resume so
    // the second mount still performs the jump.
    resumePendingRef.current = true;
    const allTimers = timersRef.current;
    return () => {
      mountedRef.current = false;
      allTimers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    let timer = null;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      timer = setTimeout(() => { ticking = false; recordPosition(); }, 300);
    };
    const onHide = () => recordPosition();
    const onVisibility = () => { if (document.visibilityState === 'hidden') recordPosition(); };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVisibility);
      recordPosition();
    };
  }, [recordPosition]);

  useEffect(() => {
    if (progressRef.current.lastCategoryId !== subTabRef.current) {
      commitProgress(setLastCategory(progressRef.current, subTabRef.current));
    }
  }, [commitProgress]);

  useEffect(() => {
    if (!resumePendingRef.current) return;
    resumePendingRef.current = false;

    const freshSettings = loadSettings();
    settingsRef.current = freshSettings;
    setSettings(freshSettings);

    // An explicit "চালিয়ে যান" from the home dashboard always jumps, even if
    // the user turned automatic resume off.
    if (!forceContinueOnMount && !freshSettings.autoResume) return;

    const point = getContinuePoint(progressRef.current, subTab, baseItems);
    const cp = resolveCategoryProgress(progressRef.current, subTab, baseItems);
    const hasHistory = cp.readThroughIndex >= 0 || cp.resumeId || cp.scrollY > 0 || cp.page > 1;
    if (!forceContinueOnMount && !hasHistory) return;
    if (!point.id) return;

    jumpToPointRef.current?.(point, { resetFilters: false });
  }, [subTab, baseItems, filteredItems, indexById, forceContinueOnMount]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleSubTabChange = (tabId) => {
    if (tabId === subTabRef.current) return;
    recordPosition(); // save the category we are leaving
    subTabRef.current = tabId;
    setSubTab(tabId);
    const nextView = viewFromProgress(progressRef.current, tabId);
    viewRef.current = nextView;
    setView(nextView);
    commitProgress(setLastCategory(progressRef.current, tabId));
    onCategoryChange?.(tabId);
    resumePendingRef.current = true;
    setResumeNotice(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleMarkReadUpTo = (item) => {
    const index = indexById.get(item.id);
    if (index === undefined) return;
    const nextId = baseItems[index + 1]?.id || null;
    const saved = markReadUpTo(progressRef.current, subTabRef.current, {
      itemId: item.id,
      index,
      nextId,
      page: viewRef.current.currentPage
    });
    commitProgress(saved, true);
    setResumeNotice(null);
    showToast(
      nextId
        ? `${formatBnNumber(index + 1)} টি শব্দ পড়া হিসেবে চিহ্নিত — পরের সেশন শুরু হবে ${formatBnNumber(index + 2)} নম্বর থেকে।`
        : `সম্পূর্ণ বিষয়টি পড়া হিসেবে চিহ্নিত হয়েছে — অভিনন্দন!`
    );
  };

  const handleMarkPageRead = () => {
    if (!paginatedItems.length) return;
    let last = paginatedItems[0];
    let lastIndex = indexById.get(last.id) ?? 0;
    paginatedItems.forEach((item) => {
      const i = indexById.get(item.id) ?? -1;
      if (i >= lastIndex) { last = item; lastIndex = i; }
    });
    handleMarkReadUpTo(last);
  };

  /** Explicit "চালিয়ে যান" — ALWAYS goes to the first item AFTER the mark. */
  const handleContinue = () => {
    const point = getContinuePoint(progressRef.current, subTabRef.current, baseItems);
    if (!point.id) {
      showToast('এই বিষয়ে দেখানোর মতো কোনো শব্দ নেই।');
      return;
    }
    setResumeNotice(null);
    // Keep the user's filters when the target is visible in them; otherwise
    // jumpToPoint clears them automatically so the target is guaranteed.
    jumpToPointRef.current?.(point, {
      resetFilters: false,
      noticeText: point.isComplete
        ? 'এই বিষয়ের সব শব্দ পড়া হয়েছে — শেষ আইটেমে নিয়ে যাওয়া হয়েছে। নতুন করে শুরু করতে "চিহ্ন মুছুন" চাপুন।'
        : point.hasMark
          ? `${formatBnNumber(point.readCount)} নম্বর পর্যন্ত পড়া হয়েছে — ${formatBnNumber(point.index + 1)} নম্বর (প্রথম অপঠিত শব্দ) থেকে চালিয়ে যান।`
          : `গতবার যেখানে ছিলেন সেখান থেকেই চালিয়ে যান (${formatBnNumber(point.index + 1)} নম্বর)।`
    });
  };

  const handleResetProgress = () => {
    commitProgress(resetCategoryProgress(progressRef.current, subTabRef.current), true);
    applyView({ ...DEFAULT_VIEW }, { persist: false });
    resumePendingRef.current = false;
    setResumeNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('এই বিষয়ের পড়ার চিহ্ন ও শেষ অবস্থান মুছে ফেলা হয়েছে।');
  };

  const toggleSetting = (key) => {
    const next = saveSettings({ [key]: !settingsRef.current[key] });
    settingsRef.current = next;
    setSettings(next);
  };

  const goToStart = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setResumeNotice(null);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-4 pb-24 pt-4 px-4 max-w-4xl mx-auto">

      {/* Category Sub-Tabs — each keeps its own independent position */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {subTabs.map((tab) => {
          const isActive = subTab === tab.id;
          const tabRead = getCategoryProgress(progress, tab.id).readThroughIndex;
          return (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id)}
              title={tabRead >= 0 ? `${formatBnNumber(tabRead + 1)} টি পর্যন্ত পড়া হয়েছে` : 'এখনও শুরু করা হয়নি'}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-xs sm:text-sm transition-all ${
                isActive
                  ? 'bg-peach-300 text-white border-peach-400 shadow-retro scale-105'
                  : 'bg-cream-100 text-warmcharcoal-200 border-peach-200 hover:bg-peach-100 hover:text-warmcharcoal-300'
              }`}
            >
              {tabRead >= 0 && <Check className="w-3 h-3 text-mint-500" />}
              <span>{tab.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-white/30 text-white' : 'bg-cream-200 text-warmcharcoal-200'
              }`}>
                {formatBnNumber(tab.count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Session resume banner */}
      {resumeNotice && (
        <div className="bg-mint-50 border border-mint-300 rounded-2xl shadow-retro-sm px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-warmcharcoal-300">
            <MapPin className="w-4 h-4 text-mint-500 flex-shrink-0 mt-0.5" />
            <span>{resumeNotice}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleContinue}
              className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-peach-400 text-white hover:bg-peach-500 shadow-retro-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              চালিয়ে যান
            </button>
            <button onClick={goToStart} className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-cream-100 border border-mint-300 text-warmcharcoal-300 hover:bg-mint-100">
              শুরু থেকে
            </button>
            <button onClick={() => setResumeNotice(null)} className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-mint-400 text-white hover:bg-mint-500">
              ঠিক আছে
            </button>
          </div>
        </div>
      )}

      {/* Per-category reading progress + tick controls */}
      <div className="bg-cream-100 p-4 rounded-2xl border border-peach-200 shadow-retro space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-peach-500" />
            <h3 className="text-sm font-bold text-warmcharcoal-300">পড়ার অগ্রগতি</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-peach-100 border border-peach-200 text-warmcharcoal-200 font-bold">
              {subTabs.find(t => t.id === subTab)?.name}
            </span>
          </div>
          <div className="text-xs font-bold text-warmcharcoal-300">
            {formatBnNumber(resolved.readCount)} / {formatBnNumber(resolved.total)}
            <span className="text-warmcharcoal-100 font-normal"> ({formatBnNumber(resolved.percent)}%)</span>
          </div>
        </div>

        <div className="w-full bg-cream-300 h-2.5 rounded-full overflow-hidden">
          <div className="bg-mint-400 h-full rounded-full transition-all duration-500" style={{ width: `${resolved.percent}%` }} />
        </div>

        {resolved.isComplete ? (
          <p className="text-[11px] text-mint-500 font-bold">🎉 এই বিষয়ের সব শব্দ পড়া হয়েছে! নতুন করে শুরু করতে "চিহ্ন মুছুন" চাপুন।</p>
        ) : (
          <p className="text-[11px] text-warmcharcoal-100">
            যেকোনো কার্ডের <span className="font-bold text-warmcharcoal-300">✓ এখান পর্যন্ত পড়েছি</span> চাপলে তার আগের সব শব্দ পড়া হয়ে যাবে।{' '}
            <span className="font-bold text-warmcharcoal-300">চালিয়ে যান</span> বাটন (বা পরের সেশন) স্বয়ংক্রিয়ভাবে{' '}
            <span className="font-bold text-peach-500">{formatBnNumber(resolved.continueIndex + 1)} নম্বর</span> — প্রথম অপঠিত শব্দ — থেকে শুরু করবে।
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-cream-200">
          <button
            onClick={handleContinue}
            disabled={!resolved.continueId}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-peach-400 hover:bg-peach-500 text-white border border-peach-500 shadow-retro-sm transition-all hover:scale-105 disabled:opacity-40"
            title="যে পর্যন্ত পড়া হয়েছে, তার ঠিক পরের অংশে নিয়ে যান"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            চালিয়ে যান
            <span className="text-[10px] font-normal opacity-90">
              ({formatBnNumber(resolved.continueIndex + 1)} নম্বর থেকে)
            </span>
          </button>
          <button
            onClick={handleMarkPageRead}
            disabled={!paginatedItems.length}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-xl bg-mint-100 border border-mint-300 text-warmcharcoal-400 hover:bg-mint-200 disabled:opacity-40"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            এই পাতা পর্যন্ত পড়েছি
          </button>
          <button
            onClick={handleResetProgress}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-xl bg-cream-50 border border-cream-300 text-warmcharcoal-200 hover:bg-peach-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            চিহ্ন মুছুন
          </button>
          <div className="ml-auto flex items-center gap-1.5 text-warmcharcoal-100">
            <Settings2 className="w-3.5 h-3.5" />
            <button
              onClick={() => toggleSetting('autoResume')}
              className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border ${
                settings.autoResume ? 'bg-peach-200 border-peach-300 text-warmcharcoal-400' : 'bg-cream-50 border-cream-300'
              }`}
              title="নতুন সেশনে স্বয়ংক্রিয়ভাবে শেষ পড়ার জায়গায় ফিরে যান"
            >
              অটো-রিজিউম {settings.autoResume ? 'চালু' : 'বন্ধ'}
            </button>
            <button
              onClick={() => toggleSetting('autoMarkRead')}
              className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border ${
                settings.autoMarkRead ? 'bg-peach-200 border-peach-300 text-warmcharcoal-400' : 'bg-cream-50 border-cream-300'
              }`}
              title="স্ক্রলে উপরে চলে যাওয়া শব্দগুলো স্বয়ংক্রিয়ভাবে পড়া হিসেবে চিহ্নিত করুন"
            >
              অটো-টিক {settings.autoMarkRead ? 'চালু' : 'বন্ধ'}
            </button>
          </div>
        </div>
      </div>

      {/* Transient toast */}
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 px-4 py-2.5 rounded-xl bg-warmcharcoal-300 text-cream-50 text-xs font-bold shadow-retro max-w-[92vw] text-center">
          {toast}
        </div>
      )}

      {/* Search and Filter Control Bar */}
      <div className="bg-cream-100 p-4 rounded-2xl border border-peach-200 shadow-retro space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-warmcharcoal-100 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={view.searchQuery}
            onChange={(e) => patchView({ searchQuery: e.target.value }, true)}
            placeholder={
              subTab === 'paribhashik'
                ? "ইংরেজি বা বাংলা অর্থ লিখে খুঁজুন... (e.g. Secretary)"
                : "শব্দ বা অর্থ লিখে যেকোনো বিষয় খুঁজুন..."
            }
            className="w-full pl-11 pr-10 py-3 bg-cream-50 rounded-xl border border-peach-200 focus:border-peach-400 focus:bg-white text-sm text-warmcharcoal-300 placeholder:text-warmcharcoal-100 outline-none transition-all"
          />
          {view.searchQuery && (
            <button
              onClick={() => patchView({ searchQuery: '' }, true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-warmcharcoal-100 hover:text-warmcharcoal-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-cream-200 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => patchView({ onlyBookmarks: !view.onlyBookmarks }, true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-colors ${
                view.onlyBookmarks
                  ? 'bg-retrogold text-warmcharcoal-400 border-yellow-500'
                  : 'bg-cream-50 text-warmcharcoal-200 border-cream-300 hover:bg-cream-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${view.onlyBookmarks ? 'fill-current' : ''}`} />
              চিহ্নিত শব্দসমূহ
            </button>

            <button
              onClick={() => patchView({
                isShuffle: !view.isShuffle,
                shuffleSeed: view.shuffleSeed || makeShuffleSeed()
              }, true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-colors ${
                view.isShuffle
                  ? 'bg-peach-200 text-warmcharcoal-400 border-peach-300'
                  : 'bg-cream-50 text-warmcharcoal-200 border-cream-300 hover:bg-cream-200'
              }`}
              title="এলোমেলোভাবে সাজান (পরের সেশনেও একই ক্রম থাকবে)"
            >
              <Shuffle className="w-3.5 h-3.5" />
              র্যান্ডম
            </button>
          </div>

          <div className="text-warmcharcoal-100 text-[11px]">
            ফলাফল: <span className="font-bold text-warmcharcoal-300">{formatBnNumber(filteredItems.length)}</span> টি
          </div>
        </div>

        <div className="pt-2 border-t border-cream-200">
          <div className="text-[11px] text-warmcharcoal-100 mb-1 font-semibold">বর্ণমালা দিয়ে ফিল্টার করুন:</div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
            {filterLetters.map((letter) => {
              const isSel = view.letterFilter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => patchView({ letterFilter: letter }, true)}
                  className={`flex-shrink-0 w-8 h-8 rounded-lg font-bold border transition-colors flex items-center justify-center ${
                    isSel
                      ? 'bg-peach-400 text-white border-peach-500 shadow-retro-sm'
                      : 'bg-cream-50 text-warmcharcoal-200 border-cream-300 hover:bg-peach-100'
                  }`}
                >
                  {letter === 'ALL' ? 'সব' : letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Item Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4 bg-cream-100 rounded-2xl border border-peach-200 shadow-retro">
          <BookOpen className="w-10 h-10 text-peach-300 mx-auto mb-2" />
          <h4 className="font-bold text-warmcharcoal-300 text-base">কোনো শব্দ খুঁজে পাওয়া যায়নি!</h4>
          <p className="text-xs text-warmcharcoal-200 mt-1">অনুগ্রহ করে আপনার অনুসন্ধানের শব্দ বা ফিল্টার পরিবর্তন করুন।</p>
          <button
            onClick={() => applyView({ ...DEFAULT_VIEW })}
            className="mt-4 px-4 py-2 bg-peach-300 hover:bg-peach-400 text-white font-bold text-xs rounded-xl shadow-retro transition-all"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {paginatedItems.map((item) => {
            const i = indexById.get(item.id) ?? -1;
            const isRead = resolved.readThroughIndex >= 0 && i <= resolved.readThroughIndex;
            return (
              <div
                key={item.id}
                data-reading-item
                data-item-id={item.id}
                data-index={i}
                className="h-full scroll-mt-24"
              >
                <ItemCard
                  item={item}
                  isBookmarked={bookmarks.includes(item.id)}
                  onToggleBookmark={onToggleBookmark}
                  onPracticeItem={onPracticeItem}
                  isRead={isRead}
                  isMarkedHere={resolved.readThroughIndex >= 0 && i === resolved.readThroughIndex}
                  isResumePoint={item.id === resolved.resumeId && !isRead}
                  onMarkReadUpTo={handleMarkReadUpTo}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-cream-100 p-3 rounded-2xl border border-peach-200 shadow-retro text-xs font-bold text-warmcharcoal-300">
          <button
            disabled={view.currentPage === 1}
            onClick={() => patchView({ currentPage: Math.max(view.currentPage - 1, 1) })}
            className="flex items-center gap-1 px-3 py-1.5 bg-cream-50 hover:bg-peach-100 rounded-xl border border-peach-200 disabled:opacity-40 disabled:hover:bg-cream-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            পূর্ববর্তী
          </button>

          <span>পৃষ্ঠা {formatBnNumber(view.currentPage)} / {formatBnNumber(totalPages)}</span>

          <button
            disabled={view.currentPage === totalPages}
            onClick={() => patchView({ currentPage: Math.min(view.currentPage + 1, totalPages) })}
            className="flex items-center gap-1 px-3 py-1.5 bg-cream-50 hover:bg-peach-100 rounded-xl border border-peach-200 disabled:opacity-40 disabled:hover:bg-cream-50 transition-colors"
          >
            পরবর্তী
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
