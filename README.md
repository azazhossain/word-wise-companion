# AdroitVocab — Offline English Vocabulary App

**১০৩৮ শব্দ · MCQ Quiz · Flashcards · Dictionary · Daily Notification · Fully Offline**

React + Vite + TypeScript + Tailwind + Capacitor (Android native APK)

---

## ✨ Features

- **১০৩৮টি শব্দ**, ১৫টি পার্টে সাজানো (Bengali meaning, synonyms, antonyms)
- **MCQ Engine** — 4 question types: Find Synonym / Antonym / Meaning→Word / Word→Meaning
- **Practice mode** (instant feedback) ও **Mock mode** (continuous, score শেষে)
- **Flashcards** — flip animation, memorize toggle, shuffle
- **Dictionary** — deep search (headword + meaning + syn + ant), debounced
- **Streak tracking** — দৈনিক activity, best streak, accuracy
- **Daily Notification** — রাত ১০টায় reminder (native Android)
- **100% Offline** — সব data app-এ bundled, কোনো internet লাগে না
- **PWA** — browser থেকেও install করা যায়

---


### এটা কীভাবে কাজ করে

### Phone-এ install করুন:

1. APK file phone-এ transfer করুন (WhatsApp, Drive, USB যেকোনো উপায়ে)
2. File-এ tap করুন
3. "Install from unknown sources" allow করুন (Settings জিজ্ঞেস করলে)
4. Install ✅ — App পুরোপুরি **offline** চলবে, **১০৩৮ শব্দ** built-in।

### রাত ১০টার Notification:

App খুলে Home screen-এ উপরের 🔔 icon-এ tap → permission allow → daily reminder সেট হবে।

---

## 📦 দুই ধরনের APK পাবেন:

| File | কী জন্য |
|------|---------|
| `AdroitVocab-debug.apk` | নিজে use করার জন্য — সরাসরি install হয় |

---

## ⚙️ App পুরোপুরি Offline

GitHub Actions-এ build-এর সময় automatic-ভাবে `capacitor.config.ts`-এর `server` block strip হয়ে যায় — তাই APK-এ কোনো internet dependency থাকে না। সব ১০৩৮ শব্দ, MCQ engine, flashcards, dictionary phone-এ embedded।

---

## 🛠️ Local Web Preview

```bash
npm run dev
```

Open http://localhost:8080
