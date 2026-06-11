/**
 * Workshop Store — Zustand state management
 *
 * Central application state for the Phonetic Training Workshop.
 * Handles mic state, dialect selection, FFT data, correlation scores,
 * speech recognition results, and localStorage persistence.
 */

import { create } from "zustand";
import ipaDict from "../data/ipaDict";
import phrases from "../data/phrases";

const STORAGE_KEY = "phonetic-workshop-state";

/**
 * Load persisted state from localStorage.
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save relevant state to localStorage.
 */
function saveToStorage(state) {
  try {
    const toSave = {
      selectedDialect: state.selectedDialect,
      difficulty: state.difficulty,
      selectedPhraseId: state.selectedPhraseId,
      accuracyHistory: state.accuracyHistory,
      bookmarkedPhrases: state.bookmarkedPhrases,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn("Failed to save to localStorage:", e);
  }
}

const persisted = loadFromStorage();

const useWorkshopStore = create((set, get) => ({
  // ── Mic State ──────────────────────────────────────────────
  isMicInitialized: false,
  isRecording: false,
  isProcessing: false,

  // ── Dialect & Difficulty ───────────────────────────────────
  selectedDialect: persisted?.selectedDialect || "en-US",
  difficulty: persisted?.difficulty || "easy",

  // ── Phrase Selection ───────────────────────────────────────
  selectedPhraseId: persisted?.selectedPhraseId || "water",

  // ── Audio Data (live, not persisted) ───────────────────────
  frequencyData: null,
  timeDomainData: null,

  // ── Correlation & Accuracy ─────────────────────────────────
  correlationScore: 0,
  ipaTokenAccuracies: [], // per-phoneme accuracy scores
  overallAccuracy: 0,

  // ── Speech Recognition ─────────────────────────────────────
  recognizedText: "",
  speechConfidence: 0,
  isSpeechActive: false,

  // ── Telemetry ──────────────────────────────────────────────
  telemetry: {
    formantHz: 0,
    bufferLatency: 0,
    bytesProcessed: 0,
    totalBytesProcessed: 0,
    sampleRate: 0,
  },

  // ── Persistence ────────────────────────────────────────────
  accuracyHistory: persisted?.accuracyHistory || [],
  bookmarkedPhrases: persisted?.bookmarkedPhrases || [],

  // ── Computed Getters ───────────────────────────────────────
  getCurrentPhraseData: () => {
    const state = get();
    const entry = ipaDict[state.selectedPhraseId];
    if (!entry) return null;
    return entry[state.selectedDialect] || null;
  },

  getAvailablePhrases: () => {
    const state = get();
    return phrases[state.difficulty] || phrases.easy;
  },

  getDifficultyThreshold: () => {
    const state = get();
    switch (state.difficulty) {
      case "easy":
        return 0.5;
      case "medium":
        return 0.65;
      case "hard":
        return 0.8;
      default:
        return 0.5;
    }
  },

  // ── Actions ────────────────────────────────────────────────
  setMicInitialized: (val) => set({ isMicInitialized: val }),

  setRecording: (val) => set({ isRecording: val }),

  setProcessing: (val) => set({ isProcessing: val }),

  setDialect: (dialect) => {
    set({ selectedDialect: dialect, correlationScore: 0, ipaTokenAccuracies: [] });
    saveToStorage({ ...get(), selectedDialect: dialect });
  },

  setDifficulty: (difficulty) => {
    // When difficulty changes, pick the first phrase of the new difficulty
    const newPhrases = phrases[difficulty] || phrases.easy;
    const firstPhrase = newPhrases[0]?.id || "water";
    set({
      difficulty,
      selectedPhraseId: firstPhrase,
      correlationScore: 0,
      ipaTokenAccuracies: [],
    });
    saveToStorage({ ...get(), difficulty, selectedPhraseId: firstPhrase });
  },

  setSelectedPhrase: (phraseId) => {
    set({ selectedPhraseId: phraseId, correlationScore: 0, ipaTokenAccuracies: [] });
    saveToStorage({ ...get(), selectedPhraseId: phraseId });
  },

  updateAudioData: (frequencyData, timeDomainData) =>
    set({ frequencyData, timeDomainData }),

  setCorrelationScore: (score) => set({ correlationScore: score }),

  setIpaTokenAccuracies: (accuracies) =>
    set({ ipaTokenAccuracies: accuracies }),

  setSpeechResult: (text, confidence) =>
    set({ recognizedText: text, speechConfidence: confidence }),

  setSpeechActive: (val) => set({ isSpeechActive: val }),

  updateTelemetry: (metrics) =>
    set((state) => ({
      telemetry: {
        ...metrics,
        totalBytesProcessed:
          state.telemetry.totalBytesProcessed + (metrics.bytesProcessed || 0),
      },
    })),

  // Record a completed training attempt
  recordAccuracy: (score) => {
    const state = get();
    const entry = {
      phraseId: state.selectedPhraseId,
      dialect: state.selectedDialect,
      score,
      timestamp: Date.now(),
    };
    const newHistory = [...state.accuracyHistory, entry].slice(-100); // keep last 100
    set({ accuracyHistory: newHistory });
    saveToStorage({ ...get(), accuracyHistory: newHistory });
  },

  toggleBookmark: (phraseId) => {
    const state = get();
    const bookmarks = state.bookmarkedPhrases.includes(phraseId)
      ? state.bookmarkedPhrases.filter((id) => id !== phraseId)
      : [...state.bookmarkedPhrases, phraseId];
    set({ bookmarkedPhrases: bookmarks });
    saveToStorage({ ...get(), bookmarkedPhrases: bookmarks });
  },

  clearCache: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      selectedDialect: "en-US",
      difficulty: "easy",
      selectedPhraseId: "water",
      correlationScore: 0,
      ipaTokenAccuracies: [],
      recognizedText: "",
      speechConfidence: 0,
      accuracyHistory: [],
      bookmarkedPhrases: [],
      telemetry: {
        formantHz: 0,
        bufferLatency: 0,
        bytesProcessed: 0,
        totalBytesProcessed: 0,
        sampleRate: 0,
      },
    });
  },

  // Export analytics to JSON
  exportAnalytics: () => {
    const state = get();
    const data = {
      dialect: state.selectedDialect,
      difficulty: state.difficulty,
      accuracyHistory: state.accuracyHistory,
      bookmarkedPhrases: state.bookmarkedPhrases,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phonetic-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
}));

export default useWorkshopStore;
