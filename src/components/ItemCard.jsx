import React, { useState } from 'react';
import { Volume2, Star, Copy, Check, Zap } from 'lucide-react';
import { speakText } from '../utils/tts';

export default function ItemCard({ item, isBookmarked, onToggleBookmark, onPracticeItem }) {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleCopy = () => {
    const textToCopy = `${item.term} - ${item.meaning}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    setIsPlayingAudio(true);
    // If paribhashik english word, speak english, otherwise bengali
    const isEnglish = /^[A-Za-z0-9\s.,\-/]+$/.test(item.term);
    const lang = isEnglish ? 'en-US' : 'bn-BD';
    
    speakText(`${item.term}. ${item.meaning}`, lang);
    setTimeout(() => setIsPlayingAudio(false), 1500);
  };

  return (
    <div className="bg-cream-100 p-4 rounded-2xl border border-peach-200 shadow-retro-sm hover:shadow-retro hover:border-peach-300 transition-all duration-200 group relative flex flex-col justify-between">
      
      {/* Top Action Buttons */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-peach-100 text-warmcharcoal-300 border border-peach-200">
          {item.categoryName}
        </span>

        <div className="flex items-center gap-1">
          {/* Speaker Button */}
          <button
            onClick={handleSpeak}
            className={`p-1.5 rounded-lg border transition-colors ${
              isPlayingAudio 
                ? 'bg-peach-300 text-white border-peach-400 animate-pulse' 
                : 'bg-cream-200 text-warmcharcoal-200 hover:bg-peach-100 hover:text-warmcharcoal-300 border-cream-300'
            }`}
            title="উচ্চারণ শুনুন"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-cream-200 text-warmcharcoal-200 hover:bg-peach-100 hover:text-warmcharcoal-300 border border-cream-300 transition-colors"
            title="অনুলিপি করুন"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-mint-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Bookmark Star Button */}
          <button
            onClick={() => onToggleBookmark(item.id)}
            className={`p-1.5 rounded-lg border transition-all ${
              isBookmarked 
                ? 'bg-retrogold text-warmcharcoal-400 border-yellow-500 scale-105' 
                : 'bg-cream-200 text-warmcharcoal-200 hover:bg-peach-100 hover:text-warmcharcoal-300 border-cream-300'
            }`}
            title={isBookmarked ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় যুক্ত করুন'}
          >
            <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="my-1 space-y-1">
        <div className="text-lg sm:text-xl font-bold text-warmcharcoal-300 tracking-wide font-bengali leading-snug">
          {item.term}
        </div>
        <div className="text-sm text-warmcharcoal-200 leading-relaxed bg-cream-50 p-2.5 rounded-xl border border-cream-300 font-medium">
          {item.meaning}
        </div>
      </div>

      {/* Footer / Practice button */}
      {onPracticeItem && (
        <div className="mt-3 pt-2 border-t border-cream-300 flex justify-end">
          <button
            onClick={() => onPracticeItem(item)}
            className="text-[11px] font-bold text-peach-500 hover:text-peach-600 flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-peach-100 transition-colors"
          >
            <Zap className="w-3 h-3 fill-current" />
            অনুশীলন করুন
          </button>
        </div>
      )}

    </div>
  );
}
