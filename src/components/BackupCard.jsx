import React, { useRef, useState } from 'react';
import {
  Database, Download, Upload, Copy, Share2, CheckCircle2,
  AlertCircle, RotateCcw, ShieldCheck
} from 'lucide-react';
import {
  createBackup, parseBackup, restoreBackup, downloadBackup,
  copyBackupToClipboard, shareBackup, backupFileName
} from '../utils/backup.js';
import { formatBnNumber } from '../utils/appVersion.js';

export default function BackupCard() {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState(null); // {type, text}
  const [pending, setPending] = useState(null);  // parsed backup awaiting confirmation
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const notify = (type, text) => setMessage({ type, text });

  const handleDownload = () => {
    const ok = downloadBackup(createBackup());
    notify(
      ok ? 'success' : 'error',
      ok
        ? `ব্যাকআপ তৈরি হয়েছে: ${backupFileName()} — ফাইলটি নিরাপদ জায়গায় রাখুন।`
        : 'এই ব্রাউজারে ডাউনলোড সম্ভব নয় — নিচের "ক্লিপবোর্ডে কপি" বা "শেয়ার" ব্যবহার করুন।'
    );
  };

  const handleCopy = async () => {
    const ok = await copyBackupToClipboard(createBackup());
    notify(ok ? 'success' : 'error',
      ok ? 'সম্পূর্ণ ব্যাকআপ ক্লিপবোর্ডে কপি হয়েছে — নোট অ্যাপে পেস্ট করে সংরক্ষণ করুন।'
         : 'ক্লিপবোর্ডে কপি করা যায়নি — ডাউনলোড বা শেয়ার ব্যবহার করুন।');
  };

  const handleShare = async () => {
    const ok = await shareBackup(createBackup());
    if (!ok) notify('info', 'শেয়ার করা যায়নি বা বাতিল করা হয়েছে — ডাউনলোড / কপি করে নিন।');
  };

  const acceptText = (text) => {
    const parsed = parseBackup(text);
    if (!parsed.ok) { notify('error', parsed.error); setPending(null); return; }
    setPending(parsed);
    notify('info', `${formatBnNumber(parsed.count)} টি ডেটা এন্ট্রি পাওয়া গেছে (${formatBnNumber(parsed.sourceVersion)}) — নিচে নিশ্চিত করুন।`);
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      acceptText(await file.text());
    } catch (e) {
      notify('error', 'ফাইলটি পড়া যায়নি।');
    }
    event.target.value = '';
  };

  const handleRestore = () => {
    const result = restoreBackup(pending);
    if (!result.ok) { notify('error', result.error); return; }
    notify('success', `${formatBnNumber(result.count)} টি ডেটা এন্ট্রি পুনরুদ্ধার হয়েছে — অ্যাপ রিফ্রেশ হচ্ছে...`);
    setPending(null);
    setTimeout(() => window.location.reload(), 900);
  };

  return (
    <div className="bg-cream-100 p-5 rounded-2xl border border-peach-200 shadow-retro space-y-3">
      <div>
        <h2 className="text-lg font-bold text-warmcharcoal-300 flex items-center gap-2">
          <Database className="w-5 h-5 text-retrogold" />
          ডেটা ব্যাকআপ ও পুনরুদ্ধার
        </h2>
        <p className="text-xs text-warmcharcoal-200 mt-1">
          পুরনো debug-স্বাক্ষরিত বিল্ড থেকে নতুন স্বাক্ষরিত বিল্ডে যেতে একবার আনইনস্টল করতে হলে, আগে ব্যাকআপ নিন। নতুন অ্যাপে ফাইলটি ইম্পোর্ট করলেই পরিসংখ্যান, বুকমার্ক, ভুল-তালিকা ও পড়ার অগ্রগতি ফিরে আসবে। পরবর্তী আপডেটে আর লাগবে না।
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={handleDownload} className="flex items-center gap-1.5 px-3.5 py-2.5 bg-retrogold text-warmcharcoal-400 font-bold text-xs rounded-xl border border-yellow-500 shadow-retro-sm hover:brightness-105">
          <Download className="w-3.5 h-3.5" /> ব্যাকআপ ডাউনলোড
        </button>
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-3.5 py-2.5 bg-cream-50 text-warmcharcoal-300 font-bold text-xs rounded-xl border border-cream-300 hover:bg-cream-200">
          <Copy className="w-3.5 h-3.5" /> ক্লিপবোর্ডে কপি
        </button>
        <button onClick={handleShare} className="flex items-center gap-1.5 px-3.5 py-2.5 bg-cream-50 text-warmcharcoal-300 font-bold text-xs rounded-xl border border-cream-300 hover:bg-cream-200">
          <Share2 className="w-3.5 h-3.5" /> শেয়ার
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3.5 py-2.5 bg-babyblue-300 text-white font-bold text-xs rounded-xl border border-babyblue-400 hover:brightness-105">
          <Upload className="w-3.5 h-3.5" /> ব্যাকআপ ইম্পোর্ট
        </button>
        <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFile} className="hidden" />
      </div>

      <button onClick={() => setShowPaste(!showPaste)} className="text-[11px] font-bold text-babyblue-500 underline">
        {showPaste ? 'পেস্ট বক্স বন্ধ করুন' : 'ফাইল না থাকলে: ব্যাকআপ টেক্সট পেস্ট করুন'}
      </button>

      {showPaste && (
        <div className="space-y-2">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder='এখানে ব্যাকআপ JSON পেস্ট করুন...'
            className="w-full h-24 p-2.5 text-xs bg-cream-50 border border-cream-300 rounded-xl outline-none focus:border-peach-400 font-mono"
          />
          <button
            onClick={() => acceptText(pasteText)}
            disabled={!pasteText.trim()}
            className="px-3 py-2 bg-peach-300 text-white font-bold text-xs rounded-xl disabled:opacity-40"
          >
            টেক্সট যাচাই করুন
          </button>
        </div>
      )}

      {message && (
        <div className={`flex items-start gap-2 text-xs rounded-xl p-3 border ${
          message.type === 'success' ? 'bg-mint-50 border-mint-300 text-warmcharcoal-300'
            : message.type === 'error' ? 'bg-peach-50 border-peach-300 text-warmcharcoal-300'
              : 'bg-babyblue-50 border-babyblue-200 text-warmcharcoal-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-mint-500 flex-shrink-0" />
            : message.type === 'error' ? <AlertCircle className="w-4 h-4 text-retrorose flex-shrink-0" />
              : <ShieldCheck className="w-4 h-4 text-babyblue-500 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {pending && (
        <div className="bg-cream-50 border-2 border-peach-300 rounded-xl p-3.5 space-y-2.5">
          <div className="text-xs font-bold text-warmcharcoal-300">
            ব্যাকআপ পুনরুদ্ধার করবেন? {formatBnNumber(pending.count)} টি এন্ট্রি বর্তমান ডেটার ওপরে লেখা হবে।
          </div>
          {pending.futureVersion && (
            <div className="text-[11px] text-retrorose">
              সতর্কতা: এই ব্যাকআপটি নতুন অ্যাপ সংস্করণ থেকে নেওয়া — কিছু ফিল্ড এখানে চিনতে নাও পারে।
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button onClick={handleRestore} className="flex items-center gap-1.5 px-3.5 py-2 bg-mint-400 text-white font-bold text-xs rounded-xl">
              <RotateCcw className="w-3.5 h-3.5" /> হ্যাঁ, পুনরুদ্ধার করুন
            </button>
            <button onClick={() => { setPending(null); setMessage(null); }} className="px-3.5 py-2 bg-cream-100 border border-cream-300 text-warmcharcoal-300 font-bold text-xs rounded-xl">
              বাতিল
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
