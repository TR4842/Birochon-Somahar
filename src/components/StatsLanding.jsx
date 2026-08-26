import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Target, 
  Trophy, 
  Clock, 
  HelpCircle, 
  RotateCcw, 
  Zap, 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  Calendar,
  Flame,
  PieChart,
  Trash2,
  Sparkles
} from 'lucide-react';

export default function StatsLanding({ stats, onStartQuiz, onResetStats, databaseInfo, setActiveTab }) {
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const accuracy = stats.totalQuestions > 0 
    ? Math.round((stats.totalRight / stats.totalQuestions) * 100) 
    : 0;

  const totalMinutes = Math.floor((stats.totalTimeSpentSeconds || 0) / 60);

  const formatBnNumber = (num) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnDigits[d]);
  };

  const categories = [
    { key: 'bagdhara', name: 'বাংলা বাগধারা', count: databaseInfo?.categories?.bagdhara?.count || 0, color: 'peach' },
    { key: 'biporit', name: 'বিপরীত শব্দ', count: databaseInfo?.categories?.biporit?.count || 0, color: 'mint' },
    { key: 'paribhashik', name: 'পারিভাষিক শব্দ', count: databaseInfo?.categories?.paribhashik?.count || 0, color: 'babyblue' },
    { key: 'ekkothay', name: 'এককথায় প্রকাশ', count: databaseInfo?.categories?.ekkothay?.count || 0, color: 'retrogold' },
    { key: 'somarthok', name: 'সমার্থক শব্দ', count: databaseInfo?.categories?.somarthok?.count || 0, color: 'retrorose' }
  ];

  return (
    <div className="space-y-6 pb-24 pt-4 px-4 max-w-4xl mx-auto">
      
      {/* Landing Banner Header */}
      <div className="bg-gradient-to-r from-peach-100 via-cream-100 to-mint-100 p-5 rounded-2xl border border-peach-200 shadow-retro relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-peach-200/80 text-warmcharcoal-400 rounded-lg text-xs font-semibold mb-2 border border-peach-300">
              <Sparkles className="w-3.5 h-3.5 text-peach-500" />
              কুইজ পারফরম্যান্স ড্যাশবোর্ড
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-warmcharcoal-300 tracking-tight">
              আপনার কুইজ পরিসংখ্যান
            </h2>
            <p className="text-sm text-warmcharcoal-200 mt-1">
              স্বয়ংক্রিয় অফলাইন ফলাফল বিশ্লেষণ ও সঠিকতার হিসাব
            </p>
          </div>

          <button
            onClick={onStartQuiz}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-peach-400 hover:bg-peach-500 text-white font-bold rounded-xl shadow-retro transition-all hover:scale-105 active:scale-95 text-base border border-peach-500"
          >
            <Zap className="w-5 h-5 fill-current" />
            নতুন কুইজ শুরু করুন
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Accuracy Percentage */}
        <div className="bg-cream-100 p-4 rounded-2xl border border-peach-200 shadow-retro-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-peach-500 mb-2">
            <span className="text-xs font-bold text-warmcharcoal-200">সঠিকতার হার</span>
            <Target className="w-5 h-5 text-peach-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-warmcharcoal-300">
              {formatBnNumber(accuracy)}%
            </div>
            <div className="w-full bg-cream-300 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-peach-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Right Answers */}
        <div className="bg-mint-50 p-4 rounded-2xl border border-mint-200 shadow-retro-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-mint-500 mb-2">
            <span className="text-xs font-bold text-warmcharcoal-200">সঠিক উত্তর</span>
            <CheckCircle2 className="w-5 h-5 text-mint-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-mint-500">
              {formatBnNumber(stats.totalRight)}
            </div>
            <p className="text-[11px] text-warmcharcoal-100 mt-1">
              মোট উত্তর দেওয়া প্রশ্নের মধ্যে
            </p>
          </div>
        </div>

        {/* KPI 3: Wrong Answers */}
        <div className="bg-peach-50 p-4 rounded-2xl border border-peach-200 shadow-retro-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-retrorose mb-2">
            <span className="text-xs font-bold text-warmcharcoal-200">ভুল উত্তর</span>
            <XCircle className="w-5 h-5 text-retrorose" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-retrorose">
              {formatBnNumber(stats.totalWrong)}
            </div>
            <p className="text-[11px] text-warmcharcoal-100 mt-1">
              পুনরায় অনুশীলন প্রয়োজন
            </p>
          </div>
        </div>

        {/* KPI 4: Total Questions / Tests */}
        <div className="bg-babyblue-50 p-4 rounded-2xl border border-babyblue-200 shadow-retro-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-babyblue-500 mb-2">
            <span className="text-xs font-bold text-warmcharcoal-200">মোট পরীক্ষা</span>
            <Trophy className="w-5 h-5 text-babyblue-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-warmcharcoal-300">
              {formatBnNumber(stats.totalQuizzes)}
            </div>
            <p className="text-[11px] text-warmcharcoal-100 mt-1">
              {formatBnNumber(stats.totalQuestions)} টি প্রশ্ন উত্তরিত
            </p>
          </div>
        </div>

      </div>

      {/* Secondary Stats Strip: Time & Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="bg-cream-100 p-4 rounded-xl border border-cream-300 shadow-retro-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-retrogold/20 border border-retrogold/40 flex items-center justify-center text-warmcharcoal-300">
            <Clock className="w-5 h-5 text-warmcharcoal-300" />
          </div>
          <div>
            <div className="text-xs text-warmcharcoal-200">পরীক্ষায় মোট ব্যয়িত সময়</div>
            <div className="text-lg font-bold text-warmcharcoal-300">
              {formatBnNumber(totalMinutes)} মিনিট {formatBnNumber(stats.totalTimeSpentSeconds % 60)} সেকেন্ড
            </div>
          </div>
        </div>

        <div className="bg-cream-100 p-4 rounded-xl border border-cream-300 shadow-retro-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-peach-200 border border-peach-400 flex items-center justify-center">
              <Flame className="w-5 h-5 text-peach-500 animate-pulse" />
            </div>
            <div>
              <div className="text-xs text-warmcharcoal-200">পড়াশোনার ধারাবাহিকতা</div>
              <div className="text-lg font-bold text-warmcharcoal-300">
                {formatBnNumber(stats.currentStreak)} দিন একাধারে
              </div>
            </div>
          </div>
          
          {stats.totalQuizzes > 0 && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-2.5 py-1.5 text-xs text-retrorose hover:bg-peach-100 rounded-lg transition-colors flex items-center gap-1 border border-peach-200"
              title="পরিসংখ্যান রিসেট"
            >
              <Trash2 className="w-3.5 h-3.5" />
              রিসেট
            </button>
          )}
        </div>
      </div>

      {/* Category Wise Performance */}
      <div className="bg-cream-100 p-5 rounded-2xl border border-peach-200 shadow-retro">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-warmcharcoal-300 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-peach-500" />
            বিষয়ভিত্তিক সঠিকতার হার
          </h3>
          <span className="text-xs text-warmcharcoal-100">
            মোট {formatBnNumber(categories.length)} টি বিষয়
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const catStat = stats.categoryStats?.[cat.key] || { right: 0, wrong: 0, total: 0 };
            const catAccuracy = catStat.total > 0 
              ? Math.round((catStat.right / catStat.total) * 100) 
              : 0;

            return (
              <div 
                key={cat.key}
                className="bg-cream-50 p-4 rounded-xl border border-peach-200 shadow-retro-sm hover:border-peach-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-warmcharcoal-300 text-sm">
                      {cat.name}
                    </span>
                    <span className="text-[10px] bg-cream-200 text-warmcharcoal-200 px-2 py-0.5 rounded-full border border-cream-300">
                      {formatBnNumber(cat.count)} টি
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-warmcharcoal-300 bg-peach-100 px-2 py-0.5 rounded-md border border-peach-200">
                    {formatBnNumber(catAccuracy)}%
                  </span>
                </div>

                <div className="w-full bg-cream-200 h-2.5 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-mint-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${catAccuracy}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-warmcharcoal-200">
                  <span className="text-mint-500 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    সঠিক: {formatBnNumber(catStat.right)}
                  </span>
                  <span className="text-retrorose font-medium flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    ভুল: {formatBnNumber(catStat.wrong)}
                  </span>
                  <span>
                    মোট: {formatBnNumber(catStat.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Quiz History */}
      <div className="bg-cream-100 p-5 rounded-2xl border border-peach-200 shadow-retro">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-warmcharcoal-300 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-peach-500" />
            সাম্প্রতিক পরীক্ষার রেকর্ড
          </h3>
          <span className="text-xs text-warmcharcoal-100">
            {formatBnNumber(stats.history?.length || 0)} টি কুইজ সংরক্ষণ
          </span>
        </div>

        {(!stats.history || stats.history.length === 0) ? (
          <div className="text-center py-10 px-4 bg-cream-50 rounded-xl border border-dashed border-peach-200">
            <div className="w-12 h-12 rounded-full bg-peach-100 text-peach-500 flex items-center justify-center mx-auto mb-3 border border-peach-300">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-warmcharcoal-300 text-base">
              এখনও কোনো কুইজ সম্পন্ন হয়নি!
            </h4>
            <p className="text-xs text-warmcharcoal-200 mt-1 max-w-sm mx-auto">
              আপনার যোগ্যতা যাচাই করতে এবং পরিসংখ্যান যুক্ত করতে একটি নমুনা কুইজ পরীক্ষা দিন।
            </p>
            <button
              onClick={onStartQuiz}
              className="mt-4 px-4 py-2 bg-peach-400 hover:bg-peach-500 text-white font-bold text-xs rounded-xl shadow-retro transition-all border border-peach-500"
            >
              প্রথম কুইজ শুরু করুন
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.history.map((hist) => {
              const isExpanded = expandedHistoryId === hist.id;
              return (
                <div 
                  key={hist.id}
                  className="bg-cream-50 rounded-xl border border-peach-200 overflow-hidden shadow-retro-sm transition-all"
                >
                  {/* Header Row */}
                  <div 
                    onClick={() => setExpandedHistoryId(isExpanded ? null : hist.id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-peach-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                        hist.accuracy >= 80 
                          ? 'bg-mint-100 text-mint-500 border-mint-300'
                          : hist.accuracy >= 50
                          ? 'bg-retrogold/20 text-warmcharcoal-300 border-retrogold/40'
                          : 'bg-peach-100 text-retrorose border-peach-300'
                      }`}>
                        {formatBnNumber(hist.accuracy)}%
                      </div>
                      <div>
                        <div className="font-bold text-warmcharcoal-300 text-sm flex items-center gap-2">
                          {hist.categoryName}
                          <span className="text-[10px] font-normal text-warmcharcoal-200 bg-cream-200 px-2 py-0.5 rounded-full border border-cream-300">
                            {formatBnNumber(hist.rightCount)}/{formatBnNumber(hist.totalQuestions)} সঠিক
                          </span>
                        </div>
                        <div className="text-xs text-warmcharcoal-100 mt-0.5">
                          {hist.date} • সময়: {formatBnNumber(Math.floor((hist.timeSpentSeconds || 0) / 60))} মি {formatBnNumber((hist.timeSpentSeconds || 0) % 60)} সে
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-warmcharcoal-200 text-xs">
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-peach-500" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Expanded Answer Key / Breakdown */}
                  {isExpanded && hist.details && hist.details.length > 0 && (
                    <div className="p-3.5 bg-cream-100 border-t border-peach-200 space-y-2 text-xs">
                      <div className="font-bold text-warmcharcoal-300 mb-1 flex items-center justify-between">
                        <span>প্রশ্ন ও উত্তরের সারসংক্ষেপ:</span>
                        <span className="text-[11px] font-normal text-warmcharcoal-100">
                          সব মোট {formatBnNumber(hist.details.length)} টি প্রশ্ন
                        </span>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                        {hist.details.map((item, idx) => (
                          <div 
                            key={idx}
                            className={`p-2.5 rounded-lg border ${
                              item.isCorrect 
                                ? 'bg-mint-50/80 border-mint-200' 
                                : 'bg-peach-50/80 border-peach-200'
                            }`}
                          >
                            <div className="font-semibold text-warmcharcoal-300 flex items-start gap-1.5">
                              <span className="text-warmcharcoal-200 font-bold">{formatBnNumber(idx + 1)}.</span>
                              <span>{item.prompt}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                              <span className={`px-2 py-0.5 rounded font-medium ${
                                item.isCorrect ? 'bg-mint-200 text-mint-500' : 'bg-peach-200 text-retrorose'
                              }`}>
                                আপনার উত্তর: {item.userAnswer || 'কোনো উত্তর দেওয়া হয়নি'}
                              </span>
                              {!item.isCorrect && (
                                <span className="bg-mint-200 text-mint-500 px-2 py-0.5 rounded font-medium">
                                  সঠিক উত্তর: {item.correctAnswer}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Database Overview Card */}
      <div className="bg-cream-100 p-5 rounded-2xl border border-peach-200 shadow-retro">
        <h3 className="text-base font-bold text-warmcharcoal-300 mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-peach-500" />
          বিরচন ভাণ্ডার তথ্য
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center">
          <div className="p-3 bg-peach-50 rounded-xl border border-peach-200">
            <div className="text-lg font-bold text-warmcharcoal-300">
              {formatBnNumber(databaseInfo?.categories?.bagdhara?.count || 0)}
            </div>
            <div className="text-xs text-warmcharcoal-200 mt-0.5">বাগধারা</div>
          </div>
          <div className="p-3 bg-mint-50 rounded-xl border border-mint-200">
            <div className="text-lg font-bold text-warmcharcoal-300">
              {formatBnNumber(databaseInfo?.categories?.biporit?.count || 0)}
            </div>
            <div className="text-xs text-warmcharcoal-200 mt-0.5">বিপরীত শব্দ</div>
          </div>
          <div className="p-3 bg-babyblue-50 rounded-xl border border-babyblue-200">
            <div className="text-lg font-bold text-warmcharcoal-300">
              {formatBnNumber(databaseInfo?.categories?.paribhashik?.count || 0)}
            </div>
            <div className="text-xs text-warmcharcoal-200 mt-0.5">পারিভাষিক শব্দ</div>
          </div>
          <div className="p-3 bg-retrogold/20 rounded-xl border border-retrogold/40">
            <div className="text-lg font-bold text-warmcharcoal-300">
              {formatBnNumber(databaseInfo?.categories?.ekkothay?.count || 0)}
            </div>
            <div className="text-xs text-warmcharcoal-200 mt-0.5">এককথায় প্রকাশ</div>
          </div>
          <div className="p-3 bg-retrorose/10 rounded-xl border border-retrorose/30">
            <div className="text-lg font-bold text-warmcharcoal-300">
              {formatBnNumber(databaseInfo?.categories?.somarthok?.count || 0)}
            </div>
            <div className="text-xs text-warmcharcoal-200 mt-0.5">সমার্থক শব্দ</div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-peach-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-warmcharcoal-200">
          <span>সর্বমোট {formatBnNumber((databaseInfo?.totalCount || 0).toLocaleString('en-US'))} টি সমাহার সম্পূর্ণ অফলাইনে অ্যাক্সেসযোগ্য</span>
          <button
            onClick={() => setActiveTab('reading')}
            className="text-peach-500 font-bold hover:underline flex items-center gap-1"
          >
            পড়া শুরু করুন <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream-100 p-6 rounded-2xl border-2 border-peach-300 shadow-retro max-w-md w-full space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-peach-100 text-retrorose flex items-center justify-center mx-auto border border-peach-300">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-warmcharcoal-300">
                পরিসংখ্যান মুছে ফেলতে চান?
              </h3>
              <p className="text-xs text-warmcharcoal-200 mt-1">
                আপনার সকল কুইজের আগের স্কোর, সময় এবং উত্তর সংগৃহীত রেকর্ড স্থায়ীভাবে রিসেট হয়ে যাবে।
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 px-4 bg-cream-200 hover:bg-cream-300 text-warmcharcoal-300 font-bold text-xs rounded-xl border border-cream-400 transition-colors"
              >
                বাতিল করুন
              </button>
              <button
                onClick={() => {
                  onResetStats();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 px-4 bg-retrorose hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-retro transition-colors border border-red-700"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
