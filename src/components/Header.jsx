import React from 'react';
import { BookOpen, Flame, Award, RefreshCw } from 'lucide-react';

export default function Header({ stats, activeTab, setActiveTab, onResetStats }) {
  const accuracy = stats.totalQuestions > 0 
    ? Math.round((stats.totalRight / stats.totalQuestions) * 100) 
    : 0;

  return (
    <header className="sticky top-0 z-30 bg-cream-100/90 backdrop-blur-md border-b border-peach-200 px-4 py-3 shadow-retro-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Logo & App Name */}
        <div 
          onClick={() => setActiveTab('stats')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-peach-200 p-1 border border-peach-400 shadow-retro-sm flex items-center justify-center group-hover:scale-105 transition-transform">
            <img src="/logo.svg" alt="বিরচন সমাহার" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-warmcharcoal-300 leading-tight tracking-wide flex items-center gap-2">
              বিরচন সমাহার
              <span className="text-[10px] font-normal px-2 py-0.5 bg-mint-200 text-mint-500 rounded-full border border-mint-400">
                অফলাইন
              </span>
            </h1>
            <p className="text-xs text-warmcharcoal-100 hidden sm:block">
              বাংলা ব্যাকরণ প্রস্তুতি ও চর্চা
            </p>
          </div>
        </div>

        {/* Quick Stats Header Indicators */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-peach-100 rounded-xl border border-peach-200 text-peach-500 shadow-retro-sm">
            <Flame className="w-4 h-4 fill-peach-400 text-peach-500 animate-pulse" />
            <span className="text-xs font-bold text-warmcharcoal-300">
              {stats.currentStreak || 0} দিন
            </span>
          </div>

          {/* Overall Accuracy Mini Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-mint-100 rounded-xl border border-mint-200 text-mint-500 shadow-retro-sm">
            <Award className="w-4 h-4 text-mint-500" />
            <span className="text-xs font-bold text-warmcharcoal-300">
              {accuracy}% নিখুঁত
            </span>
          </div>

        </div>

      </div>
    </header>
  );
}
