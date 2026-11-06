# বিরচন সমাহার — সম্পূর্ণ ফিচার লিস্ট ও বিস্তারিত

> **Birochon Somahar** — বাংলা ব্যাকরণ পরীক্ষার্থীদের জন্য একটি সম্পূর্ণ **অফলাইন**, **Android-নেটিভ** প্রস্তুতি অ্যাপ।
> সকল ডেটা, পরিসংখ্যান ও বুকমার্ক ফোনে সংরক্ষিত থাকে — ইন্টারনেট ছাড়াই কাজ করে।

---

## 📋 অ্যাট এ গ্ল্যান্স

| বিষয় | বিবরণ |
|---|---|
| **অ্যাপের নাম** | বিরচন সমাহার (Birochon Somahar) |
| **টার্গেট অডিয়েন্স** | বাংলা ভাষায় ব্যাকরণ পরীক্ষার প্রস্তুতি নিচ্ছেন এমন শিক্ষার্থী |
| **প্ল্যাটফর্ম** | Android (Capacitor দিয়ে React ওয়েব অ্যাপ → নেটিভ APK) |
| **অফলাইন** | ✅ সম্পূর্ণ — কোনো API/network call নেই |
| **Package** | `com.tr4842.birochonsomahar` |
| **Version** | 1.1.0 (versionCode 2, upgradable) |
| **Stack** | React 18 + Vite 5 + Tailwind 3 + Capacitor 6 + Lucide Icons |
| **কোডবেস সাইজ** | ২০+ সোর্স ফাইল + ৩১টি টেস্ট |
| **ডেটাবেস সাইজ** | ৩,৭৬৫+ ভোকাবুলারি আইটেম (৫টি ক্যাটাগরি) |

---

## 🗂️ ডেটাবেস — ৫টি ক্যাটাগরি, ৩,৭৬৫+ শব্দ

অ্যাপটি পাঁচটি এক্সেল ফাইল থেকে Python স্ক্রিপ্ট দিয়ে JSON ডেটাবেসে রূপান্তরিত হয়।

| ক্যাটাগরি | আইটেম সংখ্যা | বিষয়বস্তু | রঙ থিম |
|---|---|---|---|
| **বাংলা বাগধারা** | ৮৪৯+ | বাংলা ভাষায় বহুল ব্যবহৃত বাগধারা ও তাদের সহজ অর্থ | কমলা (peach) |
| **বিপরীত শব্দ** | ১,০৮৩+ | গুরুত্বপূর্ণ বাংলা মূল শব্দ ও তাদের বিপরীত শব্দ | সবুজ (mint) |
| **পারিভাষিক শব্দ** | ৯২৪+ | ইংরেজি পারিভাষিক শব্দ ও তাদের বাংলা রূপ | নীল (babyblue) |
| **এককথায় প্রকাশ** | ৮৬৫+ | বাক্য সংকোচন বা এককথায় প্রকাশ সমাহার | সোনালি (retrogold) |
| **সমার্থক শব্দ** | ৪৪+ | ৩ কলামের ডেটা: মূল শব্দ / পরীক্ষায় আসা সমার্থক / অন্যান্য সমার্থক | গোলাপি (retrorose) |

### সমার্থক শব্দের ৩ কলামের বিশেষত্ব
প্রতিটি এন্ট্রিতে তিনটি আলাদা অংশ থাকে:
- **মূল শব্দ** — যে শব্দটির সমার্থক খুঁজছেন
- **বিগত বছরের বিভিন্ন পরীক্ষায় আসা সমার্থক শব্দ** — পরীক্ষায় ঘন ঘন আসা সমার্থকগুলো আলাদাভাবে
- **অন্যান্য প্রয়োজনীয় সমার্থক শব্দ** — সম্পূরক সমার্থকগুলো

কার্ডে দুটি ভাগ **দুটি আলাদা রঙের বক্সে** দেখানো হয় (কমলা ও সবুজ লেবেল)।

---

## 🏗️ আর্কিটেকচার

```
┌─────────────────────────────────────────────────────────┐
│  src/                                                    │
│  ├── App.jsx              ← Main router / state owner   │
│  ├── main.jsx             ← React entry                 │
│  ├── index.css            ← Tailwind base + globals     │
│  ├── data/                                               │
│  │   └── birochon_data.json   ← 3,765 items (generated) │
│  ├── utils/                                             │
│  │   ├── quizGenerator.js   ← MCQ generator            │
│  │   ├── storage.js         ← localStorage + settings   │
│  │   ├── readingProgress.js ← per-category resume/tick  │
│  │   ├── appVersion.js      ← version.json → app        │
│  │   ├── updater.js         ← GitHub Releases API       │
│  │   ├── backup.js          ← export / import all data  │
│  │   └── tts.js             ← Text-to-Speech            │
│  └── components/                                        │
│      ├── Header.jsx        ← Top sticky header          │
│      ├── Navbar.jsx        ← Bottom 5-tab nav           │
│      ├── StatsLanding.jsx  ← Dashboard home             │
│      ├── ReadingTabs.jsx   ← Vocabulary browser         │
│      ├── ItemCard.jsx      ← Single word card           │
│      ├── QuizView.jsx      ← Quiz (setup/active/result) │
│      ├── BookmarksView.jsx ← Saved words                │
│      ├── AboutView.jsx     ← Creator + update + backup  │
│      ├── ReadingProgressCard.jsx ← Home resume card     │
│      ├── UpdateCard.jsx    ← GitHub Release updater     │
│      └── BackupCard.jsx    ← Backup / restore UI        │
└─────────────────────────────────────────────────────────┘
        ↕ bundled with Vite → dist/
        ↕ synced via Capacitor → android/ → APK
```

---

## 📱 পাঁচটি প্রধান ট্যাব (Navbar)

### ১. পরিসংখ্যান (StatsLanding) — হোম পেজ
- **৪টি KPI কার্ড**: সঠিকতার হার, মোট সঠিক, মোট ভুল, মোট পরীক্ষা
- **স্ট্রিক ও টাইম স্ট্রিপ**: পড়াশোনার ধারাবাহিকতা (দিন), মোট ব্যয়িত সময়
- **বিষয়ভিত্তিক পারফরম্যান্স গ্রিড**: প্রতিটি ক্যাটাগরির জন্য আলাদা progress bar + সঠিক/ভুল/মোট কাউন্টার
- **সাম্প্রতিক পরীক্ষার রেকর্ড**: ৫০টি পর্যন্ত expandable কার্ড — প্রতিটিতে তারিখ, ক্যাটাগরি, নম্বর ও পূর্ণ প্রশ্নোত্তর রিভিউ
- **ডাটাবেস ওভারভিউ**: প্রতিটি ক্যাটাগরির আইটেম সংখ্যা
- **রিসেট মডাল**: confirmation dialog সহ পরিসংখ্যান মুছে ফেলা

### ২. পড়া (ReadingTabs) — শব্দ ভাণ্ডার
- **৫টি সাব-ট্যাব**: বাগধারা / বিপরীত শব্দ / পারিভাষিক শব্দ / এককথায় প্রকাশ / সমার্থক শব্দ
- **সার্চ বক্স**: যেকোনো শব্দ/অর্থ লিখে ফিল্টার (কেস-ইনসেনসিটিভ)
- **বর্ণমালা ফিল্টার**:
  - পারিভাষিক শব্দ → **English A–Z**
  - বাকি সব ক্যাটাগরি → **বাংলা অ–হ**
  - "সব" বাটন সহ ৩৯টি বাংলা বা ২৬টি ইংরেজি বর্ণের চিপ
- **চিহ্নিত শব্দসমূহ টগল**: শুধু বুকমার্ক করা শব্দ দেখানো
- **র‍্যান্ডম (Shuffle)**: তালিকা এলোমেলোভাবে সাজানো
- **পেজিনেশন**: প্রতি পেজে ৩০টি আইটেম
- **🆕 পড়ার অগ্রগতি (প্রতিটি ক্যাটাগরির জন্য সম্পূর্ণ আলাদা)**:
  - শেষ ক্যাটাগরি, পৃষ্ঠা, সার্চ/বর্ণ/বুকমার্ক/র‍্যান্ডম ফিল্টার, স্ক্রল পজিশন ও শেষ দেখা কার্ড সংরক্ষিত
  - নতুন সেশনে / ট্যাবে ফিরলে **স্বয়ংক্রিয় resume** + "কোথা থেকে চালিয়ে যাচ্ছেন" ব্যানার
  - **✓ "এখান পর্যন্ত পড়েছি"** টিক — এর আগের সব শব্দ পড়া (সবুজ কার্ড) → পরের সেশন প্রথম অপঠিত শব্দ থেকে শুরু
  - **"এই পাতা পর্যন্ত পড়েছি"** এক-ট্যাপ বাল্ক টিক; আগের কার্ডে চাপলে চিহ্ন পিছিয়ে আসে; "চিহ্ন মুছুন" দিয়ে রিসেট
  - progress bar (`পড়া / মোট / %`), হোম পেজে ৫টি বিষয়ের শর্টকাট কার্ড
  - `অটো-রিজিউম` ও `অটো-টিক` টগল; seeded shuffle ফলে র‍্যান্ডম ক্রম সেশনের পরেও স্থিতিশীল
  - আইডি + ইনডেক্স উভয় সংরক্ষিত — ভবিষ্যতে ডেটাবেসে নতুন শব্দ ঢুকলেও চিহ্ন সরে না
- **ItemCard-এ প্রতি কার্ডে**:
  - "পড়া" / "এখান থেকে" ব্যাজ, টিক-চিহ্ন বাটন, resume হাইলাইট
  - স্পিকার বাটন — বাংলা/ইংরেজি TTS উচ্চারণ
  - কপি বাটন — "শব্দ - অর্থ" ফরম্যাটে ক্লিপবোর্ডে কপি
  - স্টার বাটন — বুকমার্ক যোগ/বাদ
  - অনুশীলন বাটন — সেই শব্দকে কেন্দ্র করে ৫ প্রশ্নের কুইজ

### ৩. কুইজ (QuizView) — অনুশীলন পরীক্ষা
তিনটি স্ক্রিন স্টেট: `setup` → `active` → `results`

#### সেটআপ স্ক্রিন
- **কুইজের ধরন** (নতুন টগল):
  - **নতুন প্রশ্ন** (সবুজ-কমলা): পুরো ডেটাবেস থেকে র‍্যান্ডম
  - **ভুল উত্তর থেকে** (লাল): শুধু সংরক্ষিত ভুল প্রশ্নগুলো থেকে
- **বিষয় নির্বাচন** (শুধু নতুন মোডে): সকল বিষয় অন্তর্ভুক্ত / নির্দিষ্ট ক্যাটাগরি
- **বর্ণ দিয়ে ফিল্টার** (শুধু নতুন মোডে):
  - পারিভাষিক → A–Z
  - বাকি → অ–হ
  - রিয়েল-টাইম কাউন্টার ("মোট ২৩১ টি")
  - ক্যাটাগরি পরিবর্তনে অটো-reset
- **প্রশ্নের সংখ্যা**: ৫ / ১০ / ১৫ / ২০ / ২৫ / ৩০
- **সময় সীমা**: প্রতি প্রশ্নে ১ মিনিট (অটো-ক্যালকুলেটেড)
- **তাতক্ষণিক সঠিক উত্তর প্রদর্শন** টগল
- **স্টার্ট বাটন** (কনটেক্সট-অ্যাওয়ার): "পরীক্ষা শুরু করুন" বা "ভুল উত্তর থেকে পরীক্ষা শুরু করুন (X টি)"

#### অ্যাক্টিভ কুইজ স্ক্রিন
- **স্টিকি হেডার**: ক্যাটাগরি ব্যাজ, প্রশ্ন নম্বর (৫/১০), কাউন্টডাউন টাইমার
- **প্রগ্রেস বার**: ভিজ্যুয়াল অগ্রগতি
- **প্রশ্ন কার্ড**: ৪টি অপশন (ক/খ/গ/ঘ), সঠিক/ভুল কালার কোডিং
- **নেভিগেশন**: পরবর্তী প্রশ্ন / ফলাফল দেখুন
- **অটো সাবমিট**: সময় শেষে

#### ফলাফল স্ক্রিন
- **অ্যাকিউরেসি ব্যাজ**: ≥৮০% "অসাধারণ", ≥৫০% "চমৎকার", বাকি "আরও অনুশীলন"
- **কনফেটি অ্যানিমেশন**: ≥৭০% অ্যাকিউরেসিতে 🎉
- **মেট্রিক্স গ্রিড**: সঠিক / ভুল / মোট
- **পূর্ণ প্রশ্নোত্তর পর্যালোচনা**: সব প্রশ্নের ডিটেইল
- **পুনরায় পরীক্ষা** / **পরিসংখ্যানে ফেরত** বাটন

### ৪. পছন্দের (BookmarksView) — সংরক্ষিত তালিকা
- সকল ক্যাটাগরির বুকমার্ক করা শব্দ এক জায়গায়
- সার্চ বক্স
- খালি অবস্থায় onboarding মেসেজ
- ItemCard-এর সব অ্যাকশন (TTS, কপি, বুকমার্ক, অনুশীলন)

### ৫. পরিচিতি (AboutView) — নির্মাতা
- **সার্কুলার প্রোফাইল ছবি** (`public/profile.png` + SVG fallback)
- **নাম ও পরিচিতি**: "তানভীর রহমান / Tanvir Rahman"
- **শিক্ষাগত যোগ্যতা কার্ড**: BBA ও MBA — বরিশাল বিশ্ববিদ্যালয়, ফাইন্যান্স অ্যান্ড ব্যাংকিং বিভাগ
- **যোগাযোগ**: ক্লিকযোগ্য Telegram বাটন → [t.me/tusherkhan42](https://t.me/tusherkhan42)
- **ক্রেডিট ফুটার**: কপিরাইট, বছর-অনুযায়ী ডাইনামিক

---

## 🔄 অফলাইন পার্সিস্টেন্স (localStorage)

ছয়টি আলাদা key-তে সব ডেটা সংরক্ষিত (প্রথম তিনটি v1.0 থেকে অপরিবর্তিত):

| Key | ডেটা | উদ্দেশ্য |
|---|---|---|
| `birochon_quiz_stats_v1` | totalQuizzes, totalRight/Wrong, streak, per-category stats, last 50 history | পরিসংখ্যান পেজ |
| `birochon_bookmarks_v1` | `[itemId, ...]` | স্টার মার্ক করা শব্দ |
| `birochon_wrong_v1` | `[{itemId, term, examSynonyms, extraSynonyms, meaning, correctAnswer, prompt, addedAt, lastWrongAt}, ...]` | ভুল উত্তর থেকে পরীক্ষা |
| `birochon_reading_progress_v1` | `{schemaVersion, lastCategoryId, categories: {catId: {resumeId, resumeIndex, readThroughId, readThroughIndex, page, scrollY, filters, updatedAt}}}` | প্রতি-ক্যাটাগরি resume + টিক-চিহ্ন |
| `birochon_settings_v1` | `{autoResume, autoMarkRead, autoCheckUpdates, lastUpdateCheckAt, dismissedUpdateTag}` | ব্যবহারকারীর পছন্দ |
| `birochon_app_meta_v1` | `{schemaVersion, appVersion, previousVersion, upgradedAt}` | non-destructive আপগ্রেড রেকর্ড |

**De-duplication by `itemId`** — একই প্রশ্ন বারবার ভুল হলেও একবারই সেভ।

**Upgrade safety** — প্রথম তিনটি key v1.0 থেকে অক্ষরশঃ অপরিবর্তিত; নতুন ফিচার শুধু নতুন key যোগ করে। সব reader ভাঙা/পুরনো JSON normalize করে, তাই পুরনো ইনস্টলেশন v1.1+ এ আপগ্রেড হলে কোনো ডেটা মুছে যায় না।

---

## ✨ ইউনিক ফিচার হাইলাইটস

### ১. ভুল উত্তর থেকে পরীক্ষা (Re-Practice)
- প্রতিটি কুইজ শেষে সব ভুল প্রশ্ন স্বয়ংক্রিয়ভাবে সেভ
- পরবর্তী সেটআপে "ভুল উত্তর থেকে" মোড নির্বাচন করলে শুধু সেগুলো থেকে প্রশ্ন আসে
- ভুল-উত্তর মোডে সঠিক উত্তর দিলে সেই এন্ট্রি সেভ-লিস্ট থেকে **স্বয়ংক্রিয়ভাবে বাদ** যায়
- এতে প্রগ্রেস ট্র্যাকিং স্বাভাবিক

### ২. সমার্থক শব্দের দুই-কলাম ডিসপ্লে
- ItemCard-এ "পরীক্ষায় আসা সমার্থক শব্দ" ও "অন্যান্য প্রয়োজনীয় সমার্থক শব্দ" আলাদা বক্সে, আলাদা রঙের লেবেলসহ

### ৩. বর্ণ-ভিত্তিক কুইজ ফিল্টার
- ক্যাটাগরি অনুযায়ী অটো-সুইচিং অ্যালফাবেট (বাংলা vs. English)
- রিয়েল-টাইম কাউন্টার: "এই ফিল্টারে কতগুলো শব্দ আছে"
- ক্যাটাগরি পরিবর্তনে অটো-রিসেট

### ৪. MCQ জেনারেটর (quizGenerator.js)
- **ক্যাটাগরি-নির্দিষ্ট প্রম্পট টেমপ্লেট**: প্রতিটি ক্যাটাগরির জন্য প্রাকৃতিক বাংলা প্রশ্ন
- **স্মার্ট ডিস্ট্র্যাক্টর**: ৩টি ইউনিক ভুল অপশন স্বয়ংক্রিয়ভাবে অন্য আইটেম থেকে
- **এককথায় প্রকাশ**: ৫০% সম্ভাবনায় meaning→term, ৫০% term→meaning
- **সমার্থক শব্দ**: শুধু সেই শব্দের প্রকৃত সমার্থক থেকে সঠিক উত্তর, বাকি থেকে ডিস্ট্র্যাক্টর
- **সময় গণনা**: ১ প্রশ্ন = ১ মিনিট
- **স্টেবল আইডি**: `itemId` যেন ভুল-উত্তর সেভে ব্যবহার করা যায়

### ৫. টেক্সট-টু-স্পিচ (TTS)
- Web Speech API-ভিত্তিক
- বাংলা `bn-BD` ও ইংরেজি `en-US` সাপোর্ট
- পারিভাষিক শব্দে অটো-ভাষা সিলেকশন (ইংরেজি টার্ম হলে en-US)
- আস্তে উচ্চারণের জন্য rate=0.9

### ৬. কনফেটি সেলিব্রেশন
- `canvas-confetti` দিয়ে ≥৭০% অ্যাকিউরেসিতে 🎉

### ৭. রেট্রো-আধুনিক ডিজাইন
- Tailwind-ভিত্তিক কাস্টম কালার প্যালেট: `cream`, `peach`, `mint`, `babyblue`, `warmcharcoal`, `retrogold`, `retrorose`
- **Custom box-shadow** "retro-sm" / "retro" / "retro-md" (সফট কার্ড-শ্যাডো)
- বাংলা ফন্ট: Hind Siliguri + Noto Serif Bengali
- ছোঁয়া-বান্ধব মোবাইল UI (no-zoom, no-tap-highlight)

### ৮. পড়ার অগ্রগতি ও টিক-চিহ্ন (v1.1.0)
- পাঁচটি ক্যাটাগরির **স্বাধীন** state — একটির চিহ্ন অন্যটিকে ছোঁয় না
- সেশনের শেষ অবস্থান (scroll + page + filters) স্বয়ংক্রিয়ভাবে মনে রাখা
- টিক-চিহ্ন → "এর আগের সব পড়া" → পরের সেশন প্রথম অপঠিত আইটেম থেকে শুরু
- ডেটাবেস আপডেট-সহনশীল: আইডি-ভিত্তিক resolve, legacy/corrupt ডেটা normalize
- সম্পূর্ণ অফলাইন — কোনো সার্ভার নেই

### ৯. GitHub Release আপডেট + ইন-প্লেস আপগ্রেড (v1.1.0)
- **ঐচ্ছিক** "আপডেট আছে কি দেখুন" → public GitHub Releases API → ভার্সন/চেঞ্জলগ/APK লিংক
- পুরনো non-versioned ট্যাগ (`Final-release`) উপেক্ষা করে সর্বোচ্চ semver ট্যাগ বেছে নেয়; APK নাম থেকেও ভার্সন পড়তে পারে
- `autoCheckUpdates` চালু হলে ১২ ঘণ্টায় একবার, অনলাইনে; নাহলে শূন্য network call
- `version.json` → npm/Vite/Gradle/Release একক উৎস; debug + release দুটোই একই stable keystore-এ স্বাক্ষরিত
- `EXPECTED_SIGNATURE_SHA256` দিয়ে CI-তে স্বাক্ষর enforce; একবারের স্বাক্ষর-পরিবর্তনের জন্য ব্যাকআপ/রিস্টোর + Android Auto Backup
- Release asset: APK + `update.json` + `SHA256SUMS.txt` + চেঞ্জলগ

---

## 🛠️ ডেভেলপমেন্ট ও CI/CD

### Tech Stack
| Layer | Technology |
|---|---|
| UI | React 18, Tailwind CSS 3, Lucide React icons |
| Build | Vite 5 (`npm run dev`, `npm run build`) |
| Mobile | Capacitor 6 (Android) |
| Data | Python 3.11 + `openpyxl`-less zipfile XML parsing |
| Fonts | Google Fonts (Hind Siliguri, Noto Serif Bengali) |
| Storage | Browser `localStorage` (version-tolerant readers) |
| Updates | Public GitHub Releases API (opt-in only) |

### NPM Scripts
```bash
npm run dev            # Vite dev server (port 5173)
npm run version:check  # version.json ↔ package.json ↔ Vite ↔ Gradle ↔ RELEASE_NOTES.md
npm test               # node:test (31 tests) + SSR render smoke test
npm run build          # version check → parse_excel.py → vite build
npm run preview        # vite preview
npm run cap:build      # npm run build && npx cap sync
```

### GitHub Actions
- **`.github/workflows/main.yml`** — push to main/master/arena/*-এ **autobuild signed APK**
  - Python 3.11 + Node 20 + Java 17 (Zulu)
  - `npm ci` → `version:check` → `npm test` → `parse_excel.py` → `vite build` → `cap sync` → `gradlew assembleDebug`
  - `ANDROID_KEYSTORE_BASE64` থেকে স্থায়ী key restore; `verify_apk_signature.sh` দিয়ে স্বাক্ষর যাচাই
  - **Artifact**: `Birochon-Somahar-v${version}.apk`
- **`.github/workflows/release.yml`** — **GitHub Release-এ আপডেট প্রকাশের অপশন**
  - Trigger: `v*` ট্যাগ push **অথবা** Actions → Run workflow (`publish_release`, `prerelease`, `version`, `tag` ইনপুট)
  - signed `assembleRelease` (key না থাকলে debug fallback), `update.json` + `SHA256SUMS.txt` + চেঞ্জলগ তৈরি
  - `gh release create/upload` → APK, manifest, checksum; artifact-ও আপলোড হয়
- `.githuv/workflows/build.yaml` ও মূল `build.yaml` — একই build কনফিগারেশনের সিঙ্ক করা কপি

---

## 📊 পারফরম্যান্স ও বান্ডেল সাইজ

| অ্যাসেট | সাইজ | Gzipped |
|---|---|---|
| `index.html` | 0.97 kB | 0.62 kB |
| CSS | 31.53 kB | 5.78 kB |
| JS | 694.59 kB | 169.42 kB |
| **profile.png** | 2.3 MB | — |
| JSON ডেটা | ~444 kB | (loaded once) |

*বান্ডেল সাইজের বড় অংশ Lucide icons ও canvas-confetti থেকে আসে — code-splitting ভবিষ্যতে করা যাবে।*

---

## 🔐 পারমিশন ও সিকিউরিটি

`AndroidManifest.xml`-এ শুধু ১টি permission:
- `INTERNET` — Capacitor WebView + **ঐচ্ছিক** GitHub Release আপডেট চেক (ব্যবহারকারী না চাইলে কোনো call নেই)

`android:fullBackupContent` / `android:dataExtractionRules` দিয়ে WebView localStorage (`app_webview`) Android Auto Backup-এ অন্তর্ভুক্ত। সব ডেটা ফোনেই থাকে — কোনো tracking, কোনো নিজস্ব server নেই। Keystore কখনোই রিপোজিটরিতে আসে না (`.gitignore`)।

---

## 🎯 কোর ফিচার ম্যাট্রিক্স

| ফিচার | স্ট্যাটাস |
|---|---|
| ৫টি ক্যাটাগরি, ৩,৭৬৫+ শব্দ | ✅ |
| অফলাইন কাজ | ✅ |
| Android APK build | ✅ |
| সমার্থক ৩-কলাম সাপোর্ট | ✅ |
| ভুল উত্তর persistent | ✅ |
| ভুল উত্তর থেকে পরীক্ষা মোড | ✅ |
| বর্ণ ফিল্টার (Quiz) | ✅ |
| বর্ণ ফিল্টার (Reading) | ✅ |
| বুকমার্ক / পছন্দের তালিকা | ✅ |
| সার্চ (সব জায়গায়) | ✅ |
| TTS উচ্চারণ (বাংলা + English) | ✅ |
| কপি টু ক্লিপবোর্ড | ✅ |
| MCQ কুইজ জেনারেটর | ✅ |
| ক্যাটাগরি-ভিত্তিক স্ট্যাটিস্টিক্স | ✅ |
| ৫০ পর্যন্ত হিস্ট্রি | ✅ |
| স্ট্রিক ট্র্যাকিং | ✅ |
| কনফেটি সেলিব্রেশন | ✅ |
| বাংলা UI/UX (সম্পূর্ণ) | ✅ |
| ইংরেজি ফন্ট (পারিভাষিক) | ✅ |
| Responsive Mobile-first | ✅ |
| পড়ার অগ্রগতি (প্রতি-ক্যাটাগরি) | ✅ |
| সেশন auto-resume + টিক-চিহ্ন | ✅ |
| GitHub Release আপডেট চেক | ✅ |
| একই স্বাক্ষরে in-place আপগ্রেড | ✅ |
| ডেটা ব্যাকআপ / রিস্টোর | ✅ |
| Dark mode | ❌ (planned) |
| Cloud sync | ❌ (planned) |
| Multiplayer quiz | ❌ (planned) |
| Daily notifications | ❌ (planned) |

---

## 🗺️ ফিউচার রোডম্যাপ (প্রস্তাবিত)

- 🌙 **ডার্ক মোড** (system-follow + manual)
- ☁️ **ঐচ্ছিক ক্লাউড সিঙ্ক** (Firebase / Supabase) — multi-device
- 🔔 **দৈনিক রিমাইন্ডার** — push notification
- 📈 **বিস্তারিত বিশ্লেষণ** — সপ্তাহ/মাসের চার্ট, দুর্বল ক্যাটাগরি রিপোর্ট
- 🏆 **অর্জন ও ব্যাজ সিস্টেম** — গেমিফিকেশন
- 📤 **শেয়ার / এক্সপোর্ট** — স্কোরকার্ড ইমেজ হিসেবে শেয়ার
- 🔍 **উন্নত সার্চ** — রেজেক্স, ফাজি ম্যাচ
- 📚 **আরো ক্যাটাগরি** — প্রবাদ-প্রবচন, সন্ধি বিচ্ছেদ, উপসর্গ-প্রত্যয়
- 🎯 **কাস্টম কুইজ** — নিজের পছন্দের শব্দ দিয়ে কুইজ
- 🔊 **ব্যাচ উচ্চারণ** — পুরো ক্যাটাগরি একসাথে শোনা

---

## 👤 নির্মাতা

**তানভীর রহমান (Tanvir Rahman)**
BBA ও MBA — বরিশাল বিশ্ববিদ্যালয়, ফাইন্যান্স অ্যান্ড ব্যাংকিং বিভাগ।
📩 Telegram: [@tusherkhan42](https://t.me/tusherkhan42)

---

## 📜 License

দেখুন: `LICENSE` ফাইল।

> ❤️ বাংলা ভাষা ও পরীক্ষার্থীদের জন্য ভালোবাসা দিয়ে তৈরি।
