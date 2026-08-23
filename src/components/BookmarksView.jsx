import React, { useState } from 'react';
import { Star, BookOpen, Search, X } from 'lucide-react';
import ItemCard from './ItemCard';

export default function BookmarksView({ databaseData, bookmarks, onToggleBookmark, onPracticeItem }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Collect bookmarked items across all categories
  const allItems = Object.values(databaseData.items).flat();
  const bookmarkedItems = allItems.filter(item => bookmarks.includes(item.id));

  const filteredItems = bookmarkedItems.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return item.term.toLowerCase().includes(q) || item.meaning.toLowerCase().includes(q);
  });

  const formatBnNumber = (num) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnDigits[d]);
  };

  return (
    <div className="space-y-5 pb-24 pt-4 px-4 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-retrogold/20 via-cream-100 to-peach-100 p-5 rounded-2xl border border-peach-200 shadow-retro flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-warmcharcoal-300 flex items-center gap-2">
            <Star className="w-6 h-6 fill-retrogold text-warmcharcoal-400" />
            পছন্দের তালিকা
          </h2>
          <p className="text-xs text-warmcharcoal-200 mt-1">
            আপনার চিহ্নিত করে রাখা সকল শব্দ ও অর্থ
          </p>
        </div>

        <div className="bg-cream-100 px-3 py-1.5 rounded-xl border border-peach-200 font-bold text-xs text-warmcharcoal-300 shadow-retro-sm">
          {formatBnNumber(bookmarkedItems.length)} টি শব্দ
        </div>
      </div>

      {/* Search Input if bookmarks exist */}
      {bookmarkedItems.length > 0 && (
        <div className="relative">
          <Search className="w-5 h-5 text-warmcharcoal-100 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="পছন্দের তালিকার মধ্যে খুঁজুন..."
            className="w-full pl-11 pr-10 py-3 bg-cream-100 rounded-2xl border border-peach-200 focus:border-peach-400 text-sm text-warmcharcoal-300 placeholder:text-warmcharcoal-100 outline-none transition-all shadow-retro-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-warmcharcoal-100 hover:text-warmcharcoal-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Empty Bookmarks State */}
      {bookmarkedItems.length === 0 ? (
        <div className="text-center py-12 px-4 bg-cream-100 rounded-2xl border border-peach-200 shadow-retro space-y-2">
          <Star className="w-12 h-12 text-retrogold mx-auto opacity-80" />
          <h4 className="font-bold text-warmcharcoal-300 text-base">
            আপনার পছন্দের তালিকা খালি!
          </h4>
          <p className="text-xs text-warmcharcoal-200 max-w-sm mx-auto">
            'পড়া' ট্যাব থেকে যেকোনো শব্দের পাশে থাকা স্টার (⭐) আইকনে ক্লিক করে পছন্দের তালিকায় যুক্ত করতে পারেন।
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-10 px-4 bg-cream-100 rounded-2xl border border-peach-200">
          <p className="text-xs text-warmcharcoal-200">
            এই অনুসন্ধানে কোনো পছন্দের শব্দ পাওয়া যায়নি।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isBookmarked={true}
              onToggleBookmark={onToggleBookmark}
              onPracticeItem={onPracticeItem}
            />
          ))}
        </div>
      )}

    </div>
  );
}
