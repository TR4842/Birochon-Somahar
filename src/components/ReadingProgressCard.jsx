import React from 'react';
import { BookOpenCheck, Play, MapPin, ArrowLeftRight } from 'lucide-react';
import { CATEGORY_IDS, resolveCategoryProgress } from '../utils/readingProgress.js';
import { formatBnNumber } from '../utils/appVersion.js';

/** Home-page shortcut: resume reading in any category, right where you stopped. */
export default function ReadingProgressCard({ databaseData, readingProgress, onResumeReading }) {
  if (!databaseData || !readingProgress || !onResumeReading) return null;

  const rows = CATEGORY_IDS.map((id) => {
    const items = databaseData.items[id] || [];
    return {
      id,
      name: databaseData.categories[id]?.name || id,
      ...resolveCategoryProgress(readingProgress, id, items)
    };
  });
  const active = rows.find((r) => r.id === readingProgress.lastCategoryId) || rows[0];
  const hasAny = rows.some((r) => r.readCount > 0 || r.continueIndex > 0 || r.resumeId || r.scrollY > 0 || r.page > 1);
  const totalRead = rows.reduce((sum, r) => sum + r.readCount, 0);

  return (
    <div className="bg-gradient-to-r from-mint-50 via-cream-100 to-peach-50 p-5 rounded-2xl border border-mint-200 shadow-retro">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-warmcharcoal-300 flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-mint-500" />
            পড়ার অগ্রগতি
          </h3>
          <p className="text-xs text-warmcharcoal-200 mt-0.5">
            {hasAny
              ? `মোট ${formatBnNumber(totalRead)} টি শব্দ পড়া হয়েছে — প্রতিটি বিষয়ের নিজস্ব "চালিয়ে যান" বিন্দু সংরক্ষিত।`
              : 'পড়া শুরু করলে শেষ অবস্থান এখানে স্বয়ংক্রিয়ভাবে মনে রাখা হবে।'}
          </p>
        </div>
        <button
          onClick={() => onResumeReading(active.id)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-mint-400 hover:bg-mint-500 text-white font-bold text-xs rounded-xl shadow-retro-sm transition-all hover:scale-105"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {active.name} — চালিয়ে যান
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {rows.map((row) => (
          <div
            key={row.id}
            className="bg-cream-50 hover:bg-cream-100 p-3 rounded-xl border border-mint-200 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-warmcharcoal-300 truncate">{row.name}</span>
              <span className="text-[10px] font-bold text-warmcharcoal-200 flex-shrink-0 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-peach-500" />
                {formatBnNumber(Math.min(row.continueIndex + 1, row.total || 1))} / {formatBnNumber(row.total)}
              </span>
            </div>
            <div className="w-full bg-cream-300 h-1.5 rounded-full overflow-hidden">
              <div className="bg-mint-400 h-full rounded-full" style={{ width: `${row.percent}%` }} />
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
              <div className="text-[10px] text-warmcharcoal-100 leading-tight">
                {row.readCount > 0
                  ? `${formatBnNumber(row.readCount)} টি পড়া • ${formatBnNumber(row.percent)}% · পরবর্তী ${formatBnNumber(row.continueIndex + 1)}`
                  : `এখনও চিহ্নিত হয়নি · ${formatBnNumber(row.continueIndex + 1)} নম্বর থেকে`}
              </div>
              <button
                onClick={() => onResumeReading(row.id)}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-peach-300 hover:bg-peach-400 text-white font-bold text-[10px] rounded-lg shadow-retro-sm transition-colors"
                title={`${row.name}: ${row.continueIndex + 1} নম্বর (পড়া চিহ্নের পরের অংশ) থেকে চালিয়ে যান`}
              >
                <Play className="w-3 h-3 fill-current" />
                চালিয়ে যান
              </button>
            </div>
            {row.hasMark && !row.isComplete && (
              <div className="text-[10px] text-mint-500 font-bold mt-1 flex items-center gap-1">
                <ArrowLeftRight className="w-3 h-3" />
                {formatBnNumber(row.readCount)} পর্যন্ত পড়া → {formatBnNumber(row.continueIndex + 1)} থেকে শুরু
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
