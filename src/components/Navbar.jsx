import React from 'react';
import { BarChart3, BookOpenText, Zap, Star, Info } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, bookmarkCount = 0 }) {
  const navItems = [
    {
      id: 'stats',
      label: 'পরিসংখ্যান',
      sublabel: 'হোম পেজ',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'reading',
      label: 'পড়া',
      sublabel: 'বিষয়সূচি',
      icon: BookOpenText,
      badge: null
    },
    {
      id: 'quiz',
      label: 'কুইজ',
      sublabel: 'অনুশীলন',
      icon: Zap,
      badge: 'LIVE'
    },
    {
      id: 'bookmarks',
      label: 'পছন্দের',
      sublabel: 'সংরক্ষিত',
      icon: Star,
      badge: bookmarkCount > 0 ? bookmarkCount : null
    },
    {
      id: 'about',
      label: 'পরিচিতি',
      sublabel: 'নির্মাতা',
      icon: Info,
      badge: null
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-cream-100/95 backdrop-blur-md border-t border-peach-200 px-2 py-2 shadow-lg sm:sticky sm:top-[61px] sm:border-b sm:border-t-0 sm:bottom-auto">
      <div className="max-w-md mx-auto flex items-center justify-around sm:justify-center sm:gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-peach-200 text-warmcharcoal-400 font-bold shadow-retro-sm translate-y-[-2px]'
                  : 'text-warmcharcoal-200 hover:bg-cream-200 hover:text-warmcharcoal-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-peach-500 scale-110' : ''}`} />
                {item.badge && (
                  <span className={`absolute -top-2 -right-3 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    item.id === 'quiz'
                      ? 'bg-retrorose text-white animate-pulse'
                      : 'bg-peach-400 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
