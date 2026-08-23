import React, { useState, useMemo } from 'react';
import { Search, Filter, Star, BookOpen, Shuffle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ItemCard from './ItemCard';

export default function ReadingTabs({ 
  databaseData, 
  bookmarks, 
  onToggleBookmark, 
  onPracticeItem,
  initialSubTab = 'bagdhara'
}) {
  const [subTab, setSubTab] = useState(initialSubTab); // 'bagdhara', 'biporit', 'paribhashik', 'ekkothay'
  const [searchQuery, setSearchQuery] = useState('');
  const [letterFilter, setLetterFilter] = useState('ALL');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const subTabs = [
    { id: 'bagdhara', name: 'বাগধারা', count: databaseData.categories.bagdhara.count, color: 'peach' },
    { id: 'biporit', name: 'বিপরীত শব্দ', count: databaseData.categories.biporit.count, color: 'mint' },
    { id: 'paribhashik', name: 'পারিভাষিক শব্দ', count: databaseData.categories.paribhashik.count, color: 'babyblue' },
    { id: 'ekkothay', name: 'এককথায় প্রকাশ', count: databaseData.categories.ekkothay.count, color: 'retrogold' }
  ];

  // Letters for filter
  const bengaliLetters = ['ALL', 'অ', 'আ', 'ই', 'ঈ', 'উ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ', 'ক', 'খ', 'গ', 'ঘ', 'চ', 'ছ', 'জ', 'ঝ', 'ট', 'ঠ', 'ড', 'ঢ', 'ত', 'থ', 'দ', 'ধ', 'ন', 'প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 'শ', 'ষ', 'স', 'হ'];
  const englishLetters = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const filterLetters = subTab === 'paribhashik' ? englishLetters : bengaliLetters;

  // Filter items
  const filteredItems = useMemo(() => {
    let items = databaseData.items[subTab] || [];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(item => 
        item.term.toLowerCase().includes(q) || 
        item.meaning.toLowerCase().includes(q)
      );
    }

    // Letter filter
    if (letterFilter !== 'ALL') {
      items = items.filter(item => 
        item.term.trim().toUpperCase().startsWith(letterFilter)
      );
    }

    // Bookmarks only
    if (onlyBookmarks) {
      items = items.filter(item => bookmarks.includes(item.id));
    }

    // Shuffle
    if (isShuffle) {
      items = [...items].sort(() => 0.5 - Math.random());
    }

    return items;
  }, [subTab, searchQuery, letterFilter, onlyBookmarks, isShuffle, databaseData, bookmarks]);

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleSubTabChange = (tabId) => {
    setSubTab(tabId);
    setSearchQuery('');
    setLetterFilter('ALL');
    setCurrentPage(1);
  };

  const formatBnNumber = (num) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnDigits[d]);
  };

  return (
    <div className="space-y-5 pb-24 pt-4 px-4 max-w-4xl mx-auto">
      
      {/* Category Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {subTabs.map((tab) => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-xs sm:text-sm transition-all ${
                isActive
                  ? 'bg-peach-300 text-white border-peach-400 shadow-retro scale-105'
                  : 'bg-cream-100 text-warmcharcoal-200 border-peach-200 hover:bg-peach-100 hover:text-warmcharcoal-300'
              }`}
            >
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

      {/* Search and Filter Control Bar */}
      <div className="bg-cream-100 p-4 rounded-2xl border border-peach-200 shadow-retro space-y-3">
        
        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-5 h-5 text-warmcharcoal-100 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={
              subTab === 'paribhashik'
                ? "ইংরেজি বা বাংলা অর্থ লিখে খুঁজুন... (e.g. Secretary)"
                : "শব্দ বা অর্থ লিখে যেকোনো বিষয় খুঁজুন..."
            }
            className="w-full pl-11 pr-10 py-3 bg-cream-50 rounded-xl border border-peach-200 focus:border-peach-400 focus:bg-white text-sm text-warmcharcoal-300 placeholder:text-warmcharcoal-100 outline-none transition-all"
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

        {/* Action Toggles: Bookmarks & Shuffle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-cream-200 text-xs">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setOnlyBookmarks(!onlyBookmarks);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-colors ${
                onlyBookmarks 
                  ? 'bg-retrogold text-warmcharcoal-400 border-yellow-500' 
                  : 'bg-cream-50 text-warmcharcoal-200 border-cream-300 hover:bg-cream-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyBookmarks ? 'fill-current' : ''}`} />
              চিহ্নিত শব্দসমূহ
            </button>

            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-colors ${
                isShuffle 
                  ? 'bg-peach-200 text-warmcharcoal-400 border-peach-300' 
                  : 'bg-cream-50 text-warmcharcoal-200 border-cream-300 hover:bg-cream-200'
              }`}
              title="এলোমেলোভাবে ক্রমানুসারে সাজান"
            >
              <Shuffle className="w-3.5 h-3.5" />
              র্যান্ডম
            </button>
          </div>

          <div className="text-warmcharcoal-100 text-[11px]">
            ফলাফল: <span className="font-bold text-warmcharcoal-300">{formatBnNumber(filteredItems.length)}</span> টি
          </div>

        </div>

        {/* Letter Quick Filter Bar */}
        <div className="pt-2 border-t border-cream-200">
          <div className="text-[11px] text-warmcharcoal-100 mb-1 font-semibold">
            বর্ণমালা দিয়ে ফিল্টার করুন:
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
            {filterLetters.map((letter) => {
              const isSel = letterFilter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => {
                    setLetterFilter(letter);
                    setCurrentPage(1);
                  }}
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
          <h4 className="font-bold text-warmcharcoal-300 text-base">
            কোনো শব্দ খুঁজে পাওয়া যায়নি!
          </h4>
          <p className="text-xs text-warmcharcoal-200 mt-1">
            অনুগ্রহ করে আপনার অনুসন্ধানের শব্দ বা ফিল্টার পরিবর্তন করুন।
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setLetterFilter('ALL');
              setOnlyBookmarks(false);
            }}
            className="mt-4 px-4 py-2 bg-peach-300 hover:bg-peach-400 text-white font-bold text-xs rounded-xl shadow-retro transition-all"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {paginatedItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isBookmarked={bookmarks.includes(item.id)}
              onToggleBookmark={onToggleBookmark}
              onPracticeItem={onPracticeItem}
            />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-cream-100 p-3 rounded-2xl border border-peach-200 shadow-retro text-xs font-bold text-warmcharcoal-300">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="flex items-center gap-1 px-3 py-1.5 bg-cream-50 hover:bg-peach-100 rounded-xl border border-peach-200 disabled:opacity-40 disabled:hover:bg-cream-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            পূর্ববর্তী
          </button>

          <span>
            পৃষ্ঠা {formatBnNumber(currentPage)} / {formatBnNumber(totalPages)}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
