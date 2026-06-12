<div align="center">

# ◈ Phonetic Workshop

### Smart Dialect & Accent Phonetic Training Workshop

**A browser-native speech-analysis laboratory built entirely on the client side.**  
Zero server. Zero cloud. Zero latency. Absolute privacy.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Zustand](https://img.shields.io/badge/Zustand-5-FF6B35?style=flat-square)](https://zustand-demo.pmnd.rs)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## What Is This?

Phonetic Workshop is a **frontend-only React application** that turns your browser into a complete accent and dialect training lab. It captures your voice through the Web Audio API, breaks it into frequency data via FFT, compares your phoneme patterns against target dialect references using the **Pearson Correlation Coefficient**, and gives you real-time visual feedback — all without sending a single byte to a server.

Built for **ITM Skills University — B.Tech CSE 2025–29 | React JS Semester II Case Study #150.**

---

## Live Features

| Feature | How It Works |
|---|---|
| 🎙️ **Real-time Microphone Capture** | `navigator.mediaDevices.getUserMedia()` — autoplay-policy compliant (user gesture only) |
| 📊 **FFT Waveform Analysis** | Web Audio `AnalyserNode`, `FFT_SIZE=256`, 60fps canvas rendering |
| 🧮 **Pearson Correlation Scoring** | Live match score (0–1) against pre-computed dialect formant references |
| 🔤 **IPA Token Matrix** | Per-phoneme color-coded accuracy blocks (green / amber / crimson) |
| 🌍 **3 English Dialects** | General American · Received Pronunciation · Australian English |
| 🎚️ **3 Difficulty Levels** | Easy (≥0.50) · Medium (≥0.65) · Hard (≥0.80) correlation thresholds |
| 🗣️ **Speech Recognition** | `webkitSpeechRecognition` with dialect `lang` code — transcript + confidence |
| 📈 **Progress Tracking** | Last 100 sessions stored in `localStorage` with timestamp + phrase ID |
| 🔖 **Phrase Bookmarking** | Toggle bookmarks, persisted across browser refreshes |
| 📤 **Analytics Export** | Download full session history as JSON |
| 📡 **Telemetry HUD** | Live: Formant Hz · Buffer Latency · Bytes Processed · Correlation Index |

---

## Tech Stack

```
React 19          — UI framework (functional components + hooks throughout)
Vite 8            — Build tool with HMR
React Router 7    — Client-side routing (4 pages)
Zustand 5         — Global state (replaces Redux; handles 60fps audio data without re-render thrash)
Web Audio API     — Microphone capture + FFT analysis (browser-native)
Web Speech API    — webkitSpeechRecognition (dialect-aware transcription)
localStorage      — Client-side persistence (no database)
CSS Custom Props  — Dark phonetics-lab theme + responsive grid
```

---

## Project Structure

```
phonetic-workshop/
├── src/
│   ├── audio/
│   │   ├── audioEngine.js          # Web Audio API singleton — mic, FFT, Pearson correlation
│   │   └── speechEngine.js         # webkitSpeechRecognition wrapper
│   ├── components/
│   │   ├── WorkshopConsole.jsx      # Main layout shell (CSS Grid)
│   │   ├── DialectActionStrip.jsx   # Init Mic · Process Voice · Clear Cache
│   │   ├── ProfileSelectorForm.jsx  # Dialect dropdown + difficulty toggle
│   │   ├── PhoneticStage.jsx        # IPA matrix + waveform workspace
│   │   ├── IpaTokenMatrixGrid.jsx   # Per-phoneme color-coded blocks
│   │   ├── AcousticWaveformDisplay.jsx  # 60fps Canvas renderer
│   │   ├── LinguisticTelemetryHUD.jsx   # Bottom-docked metrics dashboard
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ScrollToTop.jsx
│   │   └── BackToTop.jsx
│   ├── data/
│   │   ├── ipaDict.js              # IPA dictionary — phrases → phonemes + reference formants
│   │   └── phrases.js              # Training phrases by difficulty + dialect labels
│   ├── hooks/
│   │   └── useReveal.js            # IntersectionObserver scroll-reveal hook
│   ├── pages/
│   │   ├── Landing.jsx             # Hero + feature highlights
│   │   ├── Workshop.jsx            # Main training interface
│   │   ├── Progress.jsx            # Accuracy history + bookmarks
│   │   └── Guide.jsx               # Usage instructions + IPA legend
│   ├── store/
│   │   └── useWorkshopStore.js     # Zustand store — all application state
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   └── icons.svg
├── index.html
├── vite.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A browser with Web Audio API + `webkitSpeechRecognition` support (Chrome / Edge recommended)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/REACT-FINAL-PROJECT.git
cd REACT-FINAL-PROJECT/phonetic-workshop

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

The `dist/` folder is a fully static bundle — deploy to GitHub Pages, Netlify, or Vercel with zero configuration.

---

## How to Use

```
1. Open the Workshop page
2. Select your target dialect  →  General American / Received Pronunciation / Australian
3. Choose a difficulty level  →  Easy / Medium / Hard
4. Pick a training phrase from the dropdown
5. Click "Initialize Microphone Stream"  →  grant browser mic permission
6. Study the IPA token grid — see how the word breaks into phonemes
7. Click "Process Voice Sample Run"  →  speak the phrase clearly
8. Watch your Pearson correlation score and per-phoneme accuracy update live
9. Review the Telemetry HUD for formant Hz, buffer latency, and bytes processed
10. Check the Progress page to track improvement over time
```

---

## The Science Behind It

### Audio Pipeline

```
Microphone → getUserMedia() → MediaStreamSource
                                      ↓
                               AnalyserNode (FFT_SIZE=256)
                                      ↓
              ┌───────────────────────┴──────────────────────┐
              ↓                                               ↓
     getFrequencyData()                           getTimeDomainData()
    (Uint8Array, 128 bins)                        (Uint8Array, waveform)
              ↓                                               ↓
    AcousticWaveformDisplay                    computeCorrelation()
        (60fps Canvas)                         (Pearson Coefficient)
```

### Pearson Correlation Formula

The correlation score between your voice and the dialect reference:

```
r = Σ(Xᵢ − X̄)(Yᵢ − Ȳ)
    ────────────────────────────────────
    √[ Σ(Xᵢ − X̄)²  ·  Σ(Yᵢ − Ȳ)² ]
```

Where **X** = your live `timeDomainData` waveform array and **Y** = the `referenceFormants` from `ipaDict.js`.

### IPA Token Colors

| Color | Meaning |
|---|---|
| 🟢 Sharp Green | Perfect phoneme alignment — above difficulty threshold |
| 🟡 Muted Amber | Minor dialect shift — recognizable but deviated |
| 🔴 Crimson | Significant phoneme mismatch |

### Mic + Speech Recognition — Sequential Phasing

A key architectural decision: the `AnalyserNode` and `webkitSpeechRecognition` are run **sequentially, never simultaneously**. When speech recognition starts, `pauseAnalyser()` is called; when it ends, `resumeAnalyser()` restores the FFT loop. This solves a browser-level hardware contention issue where dual access to the same microphone stream causes both APIs to fail silently.

---

## State Management

All application state lives in a single Zustand store (`useWorkshopStore.js`):

```js
// Persisted to localStorage
selectedDialect    // 'en-US' | 'en-GB' | 'en-AU'
difficulty         // 'easy' | 'medium' | 'hard'
selectedPhraseId   // active training phrase
accuracyHistory    // last 100 session records
bookmarkedPhrases  // bookmarked phrase IDs

// Live (not persisted)
frequencyData      // Uint8Array — FFT magnitudes (60fps)
timeDomainData     // Uint8Array — raw waveform
correlationScore   // 0.0 – 1.0
ipaTokenAccuracies // per-phoneme accuracy array
telemetry          // { formantHz, bufferLatency, bytesProcessed, sampleRate }
```

---

## Training Phrases

### Easy (Foundational) — Correlation threshold ≥ 0.50
`Water` · `Car` · `Hello` · `Bath` · `Dance`

### Medium (Intermediate) — Correlation threshold ≥ 0.65
`Butter` · `Better` · `About` · `Thought` · `Either` · `Can't`

### Hard (Advanced) — Correlation threshold ≥ 0.80
`Tomato` · `Schedule` · `Three` · `Pronunciation`

Each phrase targets a specific dialect feature:
- **Water / Bath / Can't** → BATH-TRAP split (en-US vs en-GB)
- **Car / Better / Butter** → Rhotic vs non-rhotic (American rhotacization)
- **About** → Canadian raising test
- **Schedule** → SK vs SH onset variation
- **Three** → TH-fronting detection

---

## Browser Compatibility

| Browser | Microphone | FFT | SpeechRecognition |
|---|---|---|---|
| Chrome 90+ | ✅ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ❌ (no webkitSpeechRecognition) |
| Safari | ✅ | ✅ | ⚠️ Partial |

> Chrome or Edge is strongly recommended for the full experience.

---

## Privacy

- **No data leaves your browser.** Microphone audio is processed entirely in-memory.
- **No backend, no API calls, no analytics tracking.**
- All progress data is stored in your own browser's `localStorage` and can be cleared at any time via the "Clear Active Workspace Cache" button.

---

## Scripts

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm run lint      # ESLint check
```

---

## Academic Context

> **Institution:** ITM Skills University  
> **Programme:** B.Tech Computer Science & Engineering (2025–29)  
> **Subject:** React JS — Semester II  
> **Case Study No.:** 150  
> **Category:** Educational Frontend-Only ReactJS Web Application

---

## Future Roadmap

- [ ] WebAssembly phonetic compiler for higher-accuracy phoneme segmentation
- [ ] Additional dialects: Indian English (en-IN) · South African (en-ZA) · Canadian (en-CA)
- [ ] Prosody analysis — pitch contour, speech rate, stress patterns
- [ ] PWA manifest + service worker for offline use
- [ ] Gamification — streaks, difficulty progression, achievement badges

---

<div align="center">

Built with the Web Audio API · Web Speech API · React 19 · Zustand · Vite

**◈ Phonetic Workshop** — Train your accent. Own your dialect.

</div>
