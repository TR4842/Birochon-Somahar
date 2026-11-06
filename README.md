# Birochon-Somahar
An android offline mobile app for learning. 
# বিরচন সমাহার (Birochon Somahar)

> **বাংলা ব্যাকরণ পরীক্ষার্থীদের জন্য সম্পূর্ণ অফলাইন অ্যান্ড্রয়েড অ্যাপ** · **v1.1.0**

[![Platform](https://img.shields.io/badge/Platform-Android-3DDC84?logo=android)]()
[![Offline](https://img.shields.io/badge/100%25-Offline-blue)]()
[![Updates](https://img.shields.io/badge/Updates-GitHub%20Releases-green?logo=github)]()
[![Language](https://img.shields.io/badge/UI-বাংলা-orange)]()

**বিরচন সমাহার** একটি কম্প্যাক্ট, অফলাইন, Android-নেটিভ অ্যাপ যেখানে বাংলা ব্যাকরণের **৫টি ক্যাটাগরির ৩,৭৬৫+ শব্দ** নিয়ে রিডিং, কুইজ, পরিসংখ্যান, ভুল-উত্তর রিভিউ ও বুকমার্কিং সুবিধা একসাথে। সকল ডেটা ফোনেই সংরক্ষিত — ইন্টারনেট ছাড়াই পূর্ণ কার্যক্ষম।

## 🚀 দ্রুত শুরু

```bash
# Install
npm install

# Dev (web)
npm run dev          # http://localhost:5173

# Checks
npm run version:check   # version.json ↔ package.json ↔ Vite ↔ Gradle ↔ release notes
npm test                # 31 unit + render smoke tests

# Production build
npm run build        # version check → parse Excel → JSON → vite build

# Android APK
npm run cap:build    # build + cap sync (then gradlew assembleDebug / assembleRelease)
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
- ✅ **🆕 পড়ার অগ্রগতি** — প্রতিটি ক্যাটাগরির জন্য আলাদা "যেখানে ছেড়েছিলেন" অবস্থান, পরের সেশনে অটো-রিজিউম
- ✅ **🆕 ✓ টিক-চিহ্ন** — "এখান পর্যন্ত পড়েছি" দিয়ে আগের সব শব্দ পড়া হিসেবে চিহ্নিত; পরের সেশন ঠিক পরেরটি থেকে শুরু
- ✅ **🆕 GitHub Release থেকে আপডেট চেক** — অ্যাপের ভেতরেই নতুন APK ডাউনলোডের অপশন (ঐচ্ছিক, অফলাইন-ফার্স্ট)
- ✅ **🆕 স্থায়ী স্বাক্ষর + ডেটা ব্যাকআপ/রিস্টোর** — আগের ভার্সনের ওপরে আপগ্রেড
- ✅ MCQ কুইজ জেনারেটর — ক্যাটাগরি, সংখ্যা, সময়, বর্ণ ফিল্টার সহ
- ✅ **ভুল উত্তর থেকে পরীক্ষা** — স্বয়ংক্রিয় persistent ভুল-তালিকা
- ✅ **বর্ণ অনুযায়ী ফিল্টার** — বাংলা অ-হ / English A-Z
- ✅ বুকমার্ক + সার্চ + র‍্যান্ডম + পেজিনেশন
- ✅ পরিসংখ্যান ড্যাশবোর্ড — স্ট্রিক, ক্যাটাগরি-ভিত্তিক, ৫০ পর্যন্ত হিস্ট্রি
- ✅ Text-to-Speech (বাংলা + English)
- ✅ সমার্থক শব্দের ৩-কলাম ডিসপ্লে (পরীক্ষায় আসা / অন্যান্য)
- ✅ About পেজ — নির্মাতার পরিচিতি ও Telegram যোগাযোগ
- ✅ কনফেটি সেলিব্রেশন ≥৭০% অ্যাকিউরেসিতে
- ✅ GitHub Actions — push-এ auto-build APK, ট্যাগ/ম্যানুয়াল-এ GitHub Release

---

## 📖 আর স্ক্রল করে খুঁজতে হবে না (v1.1.0)

**সমস্যা:** আগে কোনো ক্যাটাগরি পড়তে পড়তে অ্যাপ বন্ধ করলে পরেরবার আবার প্রথম পৃষ্ঠা থেকে শুরু করতে হতো — কোথায় ছেড়েছিলেন তা স্ক্রল করে খুঁজে বের করতে হতো।

**সমাধান — দুটোই একসাথে, প্রতিটি ক্যাটাগরির জন্য সম্পূর্ণ আলাদা:**

| ফিচার | কী করে |
|---|---|
| **সেশন মেমরি** | শেষ ক্যাটাগরি, পৃষ্ঠা, সার্চ/বর্ণ/বুকমার্ক/র‍্যান্ডম ফিল্টার, স্ক্রল পজিশন ও শেষ দেখা কার্ড — সব মনে রাখে। অ্যাপ আবার খুললে বা 'পড়া' ট্যাবে ফিরলে **স্বয়ংক্রিয়ভাবে সেই জায়গায়** নিয়ে যায় ও ব্যানারে জানায়। |
| **✓ "এখান পর্যন্ত পড়েছি"** | যেকোনো কার্ডের টিক বাটন চাপলে সেটিসহ আগের সব শব্দ সবুজ "পড়া" কার্ড হিসেবে চিহ্নিত হয়। **পরের সেশন ঠিক পরের অপঠিত শব্দ থেকে শুরু হয়**। "এই পাতা পর্যন্ত পড়েছি" দিয়ে এক ট্যাপে পুরো পৃষ্ঠাও চিহ্নিত করা যায়; আগের কার্ডে আবার চাপলে চিহ্ন পিছিয়ে আসে। |
| **হোম পেজ শর্টকাট** | পরিসংখ্যান পেজে "পড়ার অগ্রগতি" কার্ড — ৫টি বিষয়ের নিজস্ব progress bar, পড়া সংখ্যা ও সরাসরি **"চালিয়ে যান"** বাটন। |
| **টগল** | `অটো-রিজিউম` (নতুন সেশনে শেষ জায়গায় যাওয়া) ও `অটো-টিক` (স্ক্রলে ওপরে চলে যাওয়া শব্দ নিজে থেকে পড়া চিহ্নিত করা) — দুটোই ব্যবহারকারীর নিয়ন্ত্রণে। |
| **স্থিতিশীল র‍্যান্ডম** | র‍্যান্ডম অর্ডারে একটি seed সংরক্ষিত হয়, ফলে পরের সেশনেও একই ক্রম থাকে এবং resume বিন্দু নষ্ট হয় না। |

> ডেটাবেসে নতুন শব্দ যুক্ত হলেও চিহ্ন নষ্ট হয় না: প্রতিটি চিহ্ন **আইডি + ইনডেক্স** দুটো দিয়ে সংরক্ষিত, আইডিকে অগ্রাধিকার দেওয়া হয়।

---

## ⬆️ আপডেট (GitHub Release)

### ব্যবহারকারীর জন্য — অ্যাপের ভেতরেই অপশন
**পরিচিতি (About) → "আপডেট আছে কি দেখুন"**: সর্বশেষ GitHub Release-এর ভার্সন, তারিখ, চেঞ্জলগ ও **APK ডাউনলোড লিংক** দেখায়। `অটো-চেক` চালু করলে দিনে একবার (ইন্টারনেট থাকলে) নিজে থেকে খোঁজে এবং ন্যাভবারে "নতুন" ব্যাজ দেখায়।

- **অফলাইন-ফার্স্ট**: ব্যবহারকারী চেক না চাইলে কোনো network call-ই হয় না; ইন্টারনেট না থাকলে বার্তা দিয়ে অফলাইনে চলতে থাকে।
- কোনো ট্র্যাকিং, কোনো নিজস্ব সার্ভার নেই — শুধু public GitHub Releases API।

### প্রকাশকের জন্য — GitHub Release তৈরি
1. `version.json`-এ `version` ও `versionCode` বাড়ান, `RELEASE_NOTES.md`-তে `## vX.Y.Z` সেকশন লিখুন, `npm run version:check` চালান। (এই একটিই উৎস — npm, Vite, Gradle সব এখান থেকে পড়ে।)
2. যেকোনো একটি উপায়:
   ```bash
   git tag v1.1.0 && git push origin v1.1.0
   ```
   অথবা **GitHub → Actions → "Publish GitHub Release" → Run workflow** → `Create GitHub Release` টিক দিন (এটিই release-এর জন্য দেওয়া "অপশন"; `version`, `tag`, `prerelease` ইনপুটও আছে)।
3. Release-এ স্বয়ংক্রিয়ভাবে যায়: `Birochon-Somahar-vX.Y.Z.apk`, `update.json` (machine-readable manifest), `SHA256SUMS.txt` ও `RELEASE_NOTES.md`-এর চেঞ্জলগ।

`update.json` ফরম্যাট: `{ version, versionCode, tag, package, minSupportedVersion, apk, url, releaseUrl, notes, publishedAt }`।

> ℹ️ GitHub শুধু **default branch**-এ থাকা workflow-কেই Actions ট্যাবে দেখায় — তাই `release.yml` মার্জ/পুশ হওয়ার পর "Run workflow" অপশনটি দেখা যাবে। ট্যাগ-ভিত্তিক প্রকাশ (`git tag vX.Y.Z`) যেকোনো branch থেকেই কাজ করে।

---

## 🔐 পুরনো ভার্সনের ওপরে ইনস্টল (upgrade) ও স্বাক্ষর

Android কেবল **একই signing certificate** থাকলে নতুন APK পুরনোটির ওপরে ইনস্টল করতে দেয়। তাই:

- `version.json`-এ `versionCode` ১ → ২ করা হয়েছে (`versionName 1.1.0`), `applicationId` আগেরই (`com.tr4842.birochonsomahar`)।
- `android/app/build.gradle` এখন **debug ও release দুটোই একই স্থায়ী keystore** দিয়ে স্বাক্ষর করে (CI-তে `ANDROID_KEYSTORE_BASE64` secret থেকে)। ফলে আজকের পরের প্রতিটি বিল্ড আগেরটির ওপর সরাসরি ইনস্টল হবে — ডেটা মুছবে না।
- v1.0-এর সব localStorage key **অপরিবর্তিত**; নতুন ফিচারগুলো নতুন key-তে। পুরনো/ভাঙা ডেটা থাকলে অ্যাপ নিজেই normalize করে, ক্র্যাশ করে না।
- Android Auto Backup-এ WebView-এর localStorage (`app_webview`) অন্তর্ভুক্ত করা হয়েছে — reinstall-এও ডেটা ফিরতে পারে।

### স্বাক্ষর মেলানো (present version-এর সাথে)
> ⚠️ বর্তমান GitHub Release-এ কোনো APK asset নেই; ব্যবহারকারীরা Actions artifact-এর **debug APK** ইনস্টল করেছেন, যা GitHub Actions-এর প্রতি-রানে তৈরি ephemeral debug key দিয়ে স্বাক্ষরিত। **সেই মূল `debug.keystore` ছাড়া Android-এর নিয়মে স্বাক্ষরটি ঠিক মেলানো অসম্ভব।** নিচের দুটো পথের একটি বেছে নিন:

**A. মূল debug.keystore হাতে আছে → সরাসরি আপগ্রেড, কোনো আনইনস্টল নেই**
```bash
# যে keystore দিয়ে v1.0 বিল্ড হয়েছিল সেটিই স্থায়ী key হিসেবে ব্যবহার করুন
base64 -w0 debug.keystore > keystore.b64
gh secret set ANDROID_KEYSTORE_BASE64 < keystore.b64
rm keystore.b64
gh secret set ANDROID_KEYSTORE_PASSWORD -b "android"
gh secret set ANDROID_KEY_ALIAS -b "androiddebugkey"
gh secret set ANDROID_KEY_PASSWORD -b "android"
```
**B. মূল key নেই → একবারের জন্য আনইনস্টল (ডেটা নিরাপদে নিয়ে যান)**
1. পুরনো অ্যাপে **পরিচিতি → ডেটা ব্যাকআপ → ব্যাকআপ ডাউনলোড / কপি / শেয়ার**।
2. নতুন স্বাক্ষরিত APK ইনস্টল করুন (পুরনোটি আনইনস্টল করতে হবে)।
3. নতুন অ্যাপে **ব্যাকআপ ইম্পোর্ট** (ফাইল বা পেস্ট) → নিশ্চিত করুন → পরিসংখ্যান, বুকমার্ক, ভুল-তালিকা, পড়ার অগ্রগতি সব ফিরে আসবে।
4. এরপর থেকে প্রতিটি আপডেট সরাসরি ইনস্টল হবে; আর ব্যাকআপ লাগবে না।

**নতুন key তৈরি (A/B-র জন্য):**
```bash
keytool -genkeypair -v -keystore android/app/birochon-release.jks \
  -alias birochon -keyalg RSA -keysize 2048 -validity 10000
# local build-এ ANDROID_KEYSTORE_PASSWORD / ANDROID_KEY_ALIAS / ANDROID_KEY_PASSWORD দিন
```

**যাচাই (CI-তেও চলে):**
```bash
bash scripts/verify_apk_signature.sh old.apk new.apk   # ফিঙ্গারপ্রিন্ট মিললেই in-place upgrade
# অথবা GitHub secret: EXPECTED_SIGNATURE_SHA256 → প্রতিটি বিল্ডে স্বাক্ষর enforce
```

### GitHub Secrets (একবার সেট করুন)
| Secret | মান |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | keystore-এর base64 (কখনোই ফাইলটি কমিট করবেন না — `.gitignore`-এ আছে) |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | key alias |
| `ANDROID_KEY_PASSWORD` | key password |
| `EXPECTED_SIGNATURE_SHA256` | *(ঐচ্ছিক)* প্রত্যাশিত সার্টিফিকেট ফিঙ্গারপ্রিন্ট |

---

## 🛠️ Tech Stack

`React 18` · `Vite 5` · `Tailwind 3` · `Capacitor 6` · `Lucide Icons` · `localStorage` · `Web Speech API` · `Python 3.11` (Excel parser) · `GitHub Releases API` (শুধু ঐচ্ছিক আপডেট চেকে)

## 📁 প্রজেক্ট স্ট্রাকচার

```
version.json                 # একক ভার্সন উৎস (npm, Vite, Gradle, Release)
RELEASE_NOTES.md             # প্রতিটি রিলিজের চেঞ্জলগ
src/
├── App.jsx                  # Main router + state
├── components/              # Header, Navbar, Stats, Reading, Quiz, Bookmarks, About,
│                            # ReadingProgressCard, UpdateCard, BackupCard
├── utils/                   # quizGenerator, storage, tts,
│                            # appVersion, readingProgress, updater, backup
└── data/birochon_data.json  # Generated from xlsx
scripts/
├── parse_excel.py           # Excel → JSON
├── check_version.mjs        # version sync guard (CI)
├── make_update_json.py      # GitHub Release-এর update.json
└── verify_apk_signature.sh  # APK স্বাক্ষর তুলনা
tests/                       # 31 টেস্ট (node:test + SSR smoke)
android/                     # Capacitor Android project
.github/workflows/
├── main.yml                 # push → signed APK artifact
└── release.yml              # v* tag / Run workflow → GitHub Release + update.json
```

## 💾 অফলাইন পার্সিস্টেন্স (localStorage)

| Key | ডেটা |
|---|---|
| `birochon_quiz_stats_v1` | পরিসংখ্যান, স্ট্রিক, হিস্ট্রি *(v1.0 থেকে অপরিবর্তিত)* |
| `birochon_bookmarks_v1` | বুকমার্ক *(v1.0)* |
| `birochon_wrong_v1` | ভুল-উত্তর তালিকা *(v1.0)* |
| `birochon_reading_progress_v1` | **নতুন** — ৫টি ক্যাটাগরির অবস্থান, টিক-চিহ্ন, ফিল্টার, পৃষ্ঠা |
| `birochon_settings_v1` | **নতুন** — অটো-রিজিউম/টিক, অটো-আপডেট-চেক |
| `birochon_app_meta_v1` | **নতুন** — ইনস্টল/আপগ্রেড মেটাডেটা (কোনো ডেটা মুছে না) |

## 📖 বিস্তারিত ডকুমেন্টেশন

সম্পূর্ণ ফিচার লিস্ট, আর্কিটেকচার, ডেটা ফ্লো, ফিউচার রোডম্যাপ: 👉 **[Features.md](./Features.md)** · চেঞ্জলগ: 👉 **[RELEASE_NOTES.md](./RELEASE_NOTES.md)**

## 👤 নির্মাতা

**তানভীর রহমান (Tanvir Rahman)** — BBA & MBA, বরিশাল বিশ্ববিদ্যালয়, ফাইন্যান্স অ্যান্ড ব্যাংকিং বিভাগ।
📩 Telegram: [@tusherkhan42](https://t.me/tusherkhan42)

## 📜 License
দেখুন `LICENSE`।
