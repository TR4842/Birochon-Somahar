import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Download, ExternalLink, ShieldCheck, Bell, BellOff,
  X, CheckCircle2, AlertCircle, Github
} from 'lucide-react';
import {
  APP_VERSION, RELEASES_PAGE_URL, formatBnNumber
} from '../utils/appVersion.js';
import { checkForUpdate, describeUpdateError } from '../utils/updater.js';
import { loadSettings, saveSettings } from '../utils/storage.js';

export default function UpdateCard({ updateInfo, onUpdateChecked }) {
  const [status, setStatus] = useState('idle');
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [autoCheck, setAutoCheck] = useState(() => !!loadSettings().autoCheckUpdates);
  const [dismissedTag, setDismissedTag] = useState(() => loadSettings().dismissedUpdateTag || '');

  useEffect(() => {
    if (!updateInfo) return;
    setInfo(updateInfo);
    setError('');
    setStatus(updateInfo.updateAvailable ? 'available' : 'uptodate');
  }, [updateInfo]);

  const handleCheck = async () => {
    setStatus('checking');
    setError('');
    try {
      const result = await checkForUpdate();
      setInfo(result);
      setStatus(result.updateAvailable ? 'available' : 'uptodate');
      saveSettings({ lastUpdateCheckAt: Date.now() });
      onUpdateChecked?.(result);
    } catch (e) {
      setStatus('error');
      setError(describeUpdateError(e));
    }
  };

  const toggleAutoCheck = () => {
    const next = !autoCheck;
    setAutoCheck(next);
    saveSettings({ autoCheckUpdates: next, lastUpdateCheckAt: next ? 0 : Date.now() });
    if (next && status === 'idle') handleCheck();
  };

  const isDismissed = info?.updateAvailable && dismissedTag === info.latestVersion;

  return (
    <div className="bg-cream-100 p-5 rounded-2xl border border-peach-200 shadow-retro space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-warmcharcoal-300 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-babyblue-500" />
            অ্যাপ আপডেট
          </h2>
          <p className="text-xs text-warmcharcoal-200 mt-1">
            বর্তমান সংস্করণ <span className="font-bold text-warmcharcoal-300">v{formatBnNumber(APP_VERSION)}</span> ·
            GitHub Release থেকে নতুন APK আছে কিনা দেখুন।
          </p>
        </div>
        <span className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg bg-mint-100 border border-mint-300 text-mint-500">
          অফলাইন-ফার্স্ট
        </span>
      </div>

      <p className="text-[11px] text-warmcharcoal-100">
        অ্যাপটি সাধারণত কোনো ইন্টারনেট ব্যবহার করে না। শুধু আপডেট চেকের সময় সংযোগ লাগে; চেক না করলে পুরোপুরি অফলাইনে চলে।
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleCheck}
          disabled={status === 'checking'}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-babyblue-400 hover:bg-babyblue-500 text-white font-bold text-xs rounded-xl shadow-retro-sm transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${status === 'checking' ? 'animate-spin' : ''}`} />
          {status === 'checking' ? 'খোঁজা হচ্ছে...' : 'আপডেট আছে কি দেখুন'}
        </button>
        <a
          href={RELEASES_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2.5 bg-cream-50 hover:bg-cream-200 border border-cream-300 text-warmcharcoal-300 font-bold text-xs rounded-xl transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          Releases পেজ
          <ExternalLink className="w-3 h-3" />
        </a>
        <button
          onClick={toggleAutoCheck}
          className={`flex items-center gap-1.5 px-3 py-2.5 border font-bold text-xs rounded-xl transition-colors ${
            autoCheck
              ? 'bg-peach-200 border-peach-300 text-warmcharcoal-400'
              : 'bg-cream-50 border-cream-300 text-warmcharcoal-200 hover:bg-cream-200'
          }`}
          title="অ্যাপ খোলার সময় দিনে একবার স্বয়ংক্রিয়ভাবে আপডেট খোঁজা হবে"
        >
          {autoCheck ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          অটো-চেক {autoCheck ? 'চালু' : 'বন্ধ'}
        </button>
      </div>

      {status === 'checking' && (
        <div className="text-xs text-warmcharcoal-200">GitHub থেকে সর্বশেষ রিলিজের তথ্য আনা হচ্ছে...</div>
      )}

      {status === 'error' && (
        <div className="bg-peach-50 border border-peach-300 rounded-xl p-3 flex items-start gap-2 text-xs text-warmcharcoal-300">
          <AlertCircle className="w-4 h-4 text-retrorose flex-shrink-0 mt-0.5" />
          <div>
            {error}
            <a href={RELEASES_PAGE_URL} target="_blank" rel="noopener noreferrer" className="block mt-1 font-bold text-babyblue-500 underline">
              সরাসরি GitHub Releases খুলুন ↗
            </a>
          </div>
        </div>
      )}

      {status === 'uptodate' && info && (
        <div className="bg-mint-50 border border-mint-300 rounded-xl p-3 flex items-start gap-2 text-xs text-warmcharcoal-300">
          <CheckCircle2 className="w-4 h-4 text-mint-500 flex-shrink-0 mt-0.5" />
          <span>
            {info.noVersionedRelease
              ? 'এখনও কোনো সংস্করণ-ট্যাগযুক্ত নতুন রিলিজ প্রকাশিত হয়নি। আপনি বর্তমান বিল্ডই ব্যবহার করছেন।'
              : `আপনি সর্বশেষ সংস্করণ (v${formatBnNumber(info.latestVersion)}) ব্যবহার করছেন ✓`}
          </span>
        </div>
      )}

      {status === 'available' && info && !isDismissed && (
        <div className="bg-gradient-to-br from-mint-50 to-cream-50 border-2 border-mint-300 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-bold text-warmcharcoal-300">
                🎉 নতুন সংস্করণ পাওয়া গেছে: v{formatBnNumber(info.latestVersion)}
              </div>
              <div className="text-[11px] text-warmcharcoal-200 mt-0.5">
                বর্তমান v{formatBnNumber(info.currentVersion)}
                {info.publishedAt && ` · প্রকাশ: ${new Date(info.publishedAt).toLocaleDateString('bn-BD')}`}
              </div>
            </div>
            <button
              onClick={() => {
                setDismissedTag(info.latestVersion);
                saveSettings({ dismissedUpdateTag: info.latestVersion });
                onUpdateChecked?.({ ...info, dismissed: true });
              }}
              className="p-1.5 rounded-lg text-warmcharcoal-100 hover:bg-cream-200"
              title="এই সংস্করণের বিজ্ঞপ্তি আর দেখবেন না"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {info.notes && (
            <div className="text-xs text-warmcharcoal-300 whitespace-pre-line max-h-32 overflow-y-auto bg-cream-100/70 border border-cream-300 rounded-lg p-2.5">
              {info.notes.slice(0, 1200)}
            </div>
          )}

          <a
            href={info.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-mint-400 hover:bg-mint-500 text-white font-bold text-xs rounded-xl shadow-retro-sm transition-all"
          >
            <Download className="w-4 h-4" />
            {info.apkName ? 'APK ডাউনলোড করুন' : 'রিলিজ পেজ থেকে ডাউনলোড করুন'}
          </a>

          <div className="flex items-start gap-2 text-[11px] text-warmcharcoal-200">
            <ShieldCheck className="w-4 h-4 text-mint-500 flex-shrink-0" />
            <span>
              একই স্বাক্ষর (signing certificate) থাকলে APK-টি পুরনো অ্যাপের ওপরেই ইনস্টল হবে — পরিসংখ্যান, বুকমার্ক, ভুল-তালিকা ও পড়ার অগ্রগতি অক্ষত থাকবে। ডাউনলোড শেষে ফাইলে ট্যাপ করে ইনস্টল করুন।
            </span>
          </div>
        </div>
      )}

      {isDismissed && (
        <button
          onClick={() => {
            setDismissedTag('');
            saveSettings({ dismissedUpdateTag: '' });
            onUpdateChecked?.(info);
          }}
          className="text-[11px] font-bold text-babyblue-500 underline"
        >
          v{formatBnNumber(info.latestVersion)}-এর আপডেট বিজ্ঞপ্তি আবার দেখান
        </button>
      )}
    </div>
  );
}
