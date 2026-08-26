# Birochon-Somahar
An android offline mobile app for learning. 
# বিরচন সমাহার (Birochon Somahar)

> **বাংলা ব্যাকরণ পরীক্ষার্থীদের জন্য সম্পূর্ণ অফলাইন অ্যান্ড্রয়েড অ্যাপ**

[![Platform](https://img.shields.io/badge/Platform-Android-3DDC84?logo=android)]()
[![Offline](https://img.shields.io/badge/100%25-Offline-blue)]()
[![Language](https://img.shields.io/badge/UI-বাংলা-orange)]()

**বিরচন সমাহার** একটি কম্প্যাক্ট, অফলাইন, Android-নেটিভ অ্যাপ যেখানে বাংলা ব্যাকরণের **৫টি ক্যাটাগরির ৩,৭৬৫+ শব্দ** নিয়ে রিডিং, কুইজ, পরিসংখ্যান, ভুল-উত্তর রিভিউ ও বুকমার্কিং সুবিধা একসাথে। সকল ডেটা ফোনেই সংরক্ষিত — ইন্টারনেট ছাড়াই পূর্ণ কার্যক্ষম।

## 🚀 দ্রুত শুরু

```bash
# Install
npm install

# Dev (web)
npm run dev          # http://localhost:5173

# Production build
npm run build        # parse Excel → JSON → vite build

# Android APK
npm run cap:build    # build + cap sync (then gradlew assembleDebug)
```

## ✨ মূল ফিচারসমূহ

| ক্যাটাগরি | আইটেম |
|---|---|
| বাংলা বাগধারা | ৮৪৯+ |
| বিপরীত শব্দ | ১,০৮৩+ |
| পারিভাষিক শব্দ | ৯২৪+ |
| এককথায় প্রকাশ | ৮৬৫+ |
| সমার্থক শব্দ (৩-কলাম) | ৪৪+ |
| **মোট** | **৩,৭৬৫+** |

- ✅ সম্পূর্ণ অফলাইন — ইন্টারনেট ছাড়া কাজ করে
- ✅ MCQ কুইজ জেনারেটর — ক্যাটাগরি, সংখ্যা, সময়, বর্ণ ফিল্টার সহ
- ✅ **ভুল উত্তর থেকে পরীক্ষা** — স্বয়ংক্রিয় persistent ভুল-তালিকা
- ✅ **বর্ণ অনুযায়ী ফিল্টার** — বাংলা অ-হ / English A-Z
- ✅ বুকমার্ক + সার্চ + র‍্যান্ডম + পেজিনেশন
- ✅ পরিসংখ্যান ড্যাশবোর্ড — স্ট্রিক, ক্যাটাগরি-ভিত্তিক, ৫০ পর্যন্ত হিস্ট্রি
- ✅ Text-to-Speech (বাংলা + English)
- ✅ সমার্থক শব্দের ৩-কলাম ডিসপ্লে (পরীক্ষায় আসা / অন্যান্য)
- ✅ About পেজ — নির্মাতার পরিচিতি ও Telegram যোগাযোগ
- ✅ কনফেটি সেলিব্রেশন ≥৭০% অ্যাকিউরেসিতে
- ✅ GitHub Actions — push-এ auto-build APK

## 🛠️ Tech Stack

`React 18` · `Vite 5` · `Tailwind 3` · `Capacitor 6` · `Lucide Icons` · `localStorage` · `Web Speech API` · `Python 3.11` (Excel parser)

## 📁 প্রজেক্ট স্ট্রাকচার

```
src/
├── App.jsx              # Main router + state
├── components/          # Header, Navbar, Stats, Reading, Quiz, Bookmarks, About
├── utils/               # quizGenerator, storage, tts
└── data/birochon_data.json  # Generated from xlsx
scripts/parse_excel.py  # Excel → JSON
android/                 # Capacitor Android project
```

## 📖 বিস্তারিত ডকুমেন্টেশন

সম্পূর্ণ ফিচার লিস্ট, আর্কিটেকচার, ডেটা ফ্লো, ফিউচার রোডম্যাপ ইত্যাদি দেখুন:
👉 **[FEATURES.md](./FEATURES.md)**

## 👤 নির্মাতা

**তানভীর রহমান (Tanvir Rahman)** — BBA & MBA, বরিশাল বিশ্ববিদ্যালয়, ফাইন্যান্স অ্যান্ড ব্যাংকিং বিভাগ।
📩 Telegram: [@tusherkhan42](https://t.me/tusherkhan42)

## 📜 License

দেখুন `LICENSE`।
