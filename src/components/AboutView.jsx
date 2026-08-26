import React from 'react';
import { User, GraduationCap, BookOpen, Send, Sparkles, Heart, ExternalLink } from 'lucide-react';

export default function AboutView() {
  // Try .png first (your real photo), then .svg (built-in placeholder), then initials.
  // To use your own photo, drop it at: public/profile.png  (any reasonable size)
  const profileImg = '/profile.png';

  const formatBnNumber = (num) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnDigits[d]);
  };

  return (
    <div className="space-y-6 pb-24 pt-4 px-4 max-w-2xl mx-auto">

      {/* Hero Card with Profile */}
      <div className="bg-gradient-to-br from-peach-100 via-cream-100 to-mint-100 p-6 rounded-2xl border border-peach-200 shadow-retro text-center space-y-3">
        {/* Profile Image (circular crop) */}
        <div className="relative mx-auto w-32 h-32 sm:w-36 sm:h-36">
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-peach-300 shadow-retro bg-gradient-to-br from-peach-200 to-mint-200">
            <img
              src={profileImg}
              alt="Tanvir Rahman"
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center 30%' }}
              onError={(e) => {
                // Fallback to a friendly initials avatar if profile.png is missing
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          {/* Decorative ring */}
          <div className="absolute -inset-1.5 rounded-full border-2 border-dashed border-peach-300/60 pointer-events-none" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-warmcharcoal-300 tracking-tight">
            তানভীর রহমান
          </h1>
          <p className="text-sm text-warmcharcoal-200 mt-1 font-medium">
            Tanvir Rahman
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-peach-200/80 text-warmcharcoal-400 rounded-lg text-[11px] font-semibold mt-2 border border-peach-300">
            <Sparkles className="w-3 h-3 text-peach-500" />
            বিরচন সমাহার-এর নির্মাতা
          </div>
        </div>
      </div>

      {/* About Message Card */}
      <div className="bg-cream-100 p-5 rounded-2xl border border-peach-200 shadow-retro space-y-3">
        <h2 className="text-lg font-bold text-warmcharcoal-300 flex items-center gap-2">
          <User className="w-5 h-5 text-peach-500" />
          আমার সম্পর্কে
        </h2>
        <p className="text-sm text-warmcharcoal-300 leading-relaxed font-bengali">
          <span className="text-base font-bold">হ্যালো, আমি তানভীর রহমান।</span>
          <br />
          আমি বারিশাল বিদ্যালয়, ফাইনান্স অ্যান্ড ব্যাংকিং বিভাগ, থেকে{' '}
          <span className="font-bold">BBA &amp; MBA</span> সম্পন্ন করেছি।
        </p>
        <p className="text-sm text-warmcharcoal-300 leading-relaxed font-bengali">
          আশা করছি আপনি আমার অ্যাপটি উপভোগ করবেন।
        </p>
      </div>

      {/* Education Card */}
      <div className="bg-cream-100 p-5 rounded-2xl border border-peach-200 shadow-retro space-y-3">
        <h2 className="text-lg font-bold text-warmcharcoal-300 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-mint-500" />
          শিক্ষাগত যোগ্যতা
        </h2>
        <div className="space-y-2.5">
          <div className="bg-cream-50 p-3.5 rounded-xl border border-peach-200 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-peach-100 border border-peach-300 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-peach-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-warmcharcoal-300">বিবিএ (BBA)</div>
              <div className="text-xs text-warmcharcoal-200">বরিশাল বিশ্ববিদ্যালয়</div>
              <div className="text-[11px] text-warmcharcoal-100 mt-0.5">ফাইন্যান্স অ্যান্ড ব্যাংকিং বিভাগ</div>
            </div>
          </div>

          <div className="bg-cream-50 p-3.5 rounded-xl border border-peach-200 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-mint-100 border border-mint-300 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-mint-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-warmcharcoal-300">এমবিএ (MBA)</div>
              <div className="text-xs text-warmcharcoal-200">বরিশাল বিশ্ববিদ্যালয়</div>
              <div className="text-[11px] text-warmcharcoal-100 mt-0.5">ফাইন্যান্স অ্যান্ড ব্যাংকিং বিভাগ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Card (Telegram) */}
      <div className="bg-cream-100 p-5 rounded-2xl border border-peach-200 shadow-retro space-y-3">
        <h2 className="text-lg font-bold text-warmcharcoal-300 flex items-center gap-2">
          <Send className="w-5 h-5 text-babyblue-500" />
          যোগাযোগ
        </h2>
        <p className="text-xs text-warmcharcoal-200">
          যেকোনো প্রশ্ন বা মতামতের জন্য টেলিগ্রামে যোগাযোগ করতে পারেন:
        </p>
        <a
          href="https://t.me/tusherkhan42"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 p-3.5 bg-babyblue-50 hover:bg-babyblue-100 rounded-xl border-2 border-babyblue-200 hover:border-babyblue-300 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-babyblue-300 text-white flex items-center justify-center shadow-retro-sm group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-sm font-bold text-warmcharcoal-300">@tusherkhan42</div>
              <div className="text-[11px] text-warmcharcoal-200">t.me/tusherkhan42</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-babyblue-500 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      {/* Footer / Credits */}
      <div className="bg-cream-100 p-4 rounded-2xl border border-peach-200 shadow-retro text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs text-warmcharcoal-200">
          <span>তৈরি করেছেন</span>
          <Heart className="w-3.5 h-3.5 text-retrorose fill-retrorose" />
          <span>বাংলা ভাষা ও পরীক্ষার্থীদের জন্য</span>
        </div>
        <div className="text-[11px] text-warmcharcoal-100">
          © {formatBnNumber(new Date().getFullYear())} বিরচন সমাহার — সকল অধিকার সংরক্ষিত
        </div>
      </div>

    </div>
  );
}
