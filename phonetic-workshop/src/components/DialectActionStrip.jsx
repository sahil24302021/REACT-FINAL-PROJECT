/**
 * DialectActionStrip — Core action buttons.
 *
 * Three buttons:
 * 1. Init Mic — user-click-gated (autoplay policy compliant)
 * 2. Process Voice — pauses analyser, runs speech recognition, resumes
 * 3. Clear Cache — wipes localStorage and resets state
 */

import React, { useCallback, useRef } from "react";
import useWorkshopStore from "../store/useWorkshopStore";
import {
  initMicrophone,
  pauseAnalyser,
  resumeAnalyser,
  getFrequencyData,
  calculateCorrelation,
  cleanup,
} from "../audio/audioEngine";
import { startRecognition } from "../audio/speechEngine";

export default function DialectActionStrip() {
  const isMicInitialized = useWorkshopStore((s) => s.isMicInitialized);
  const isProcessing = useWorkshopStore((s) => s.isProcessing);
  const selectedDialect = useWorkshopStore((s) => s.selectedDialect);
  const setMicInitialized = useWorkshopStore((s) => s.setMicInitialized);
  const setRecording = useWorkshopStore((s) => s.setRecording);
  const setProcessing = useWorkshopStore((s) => s.setProcessing);
  const setSpeechResult = useWorkshopStore((s) => s.setSpeechResult);
  const setSpeechActive = useWorkshopStore((s) => s.setSpeechActive);
  const setCorrelationScore = useWorkshopStore((s) => s.setCorrelationScore);
  const setIpaTokenAccuracies = useWorkshopStore((s) => s.setIpaTokenAccuracies);
  const getCurrentPhraseData = useWorkshopStore((s) => s.getCurrentPhraseData);
  const recordAccuracy = useWorkshopStore((s) => s.recordAccuracy);
  const clearCache = useWorkshopStore((s) => s.clearCache);

  const recognitionRef = useRef(null);

  /**
   * Init Mic — ONLY called from this click handler (autoplay policy).
   */
  const handleInitMic = useCallback(async () => {
    if (isMicInitialized) {
      // Toggle off — cleanup
      cleanup();
      setMicInitialized(false);
      setRecording(false);
      return;
    }

    const result = await initMicrophone();
    if (result.success) {
      setMicInitialized(true);
      setRecording(true);
    } else {
      alert("Failed to access microphone: " + result.error);
    }
  }, [isMicInitialized, setMicInitialized, setRecording]);

  /**
   * Process Voice — sequential phasing:
   * 1. Pause analyser loop
   * 2. Run speech recognition
   * 3. On result, calculate correlation against reference formants
   * 4. Resume analyser loop
   */
  const handleProcessVoice = useCallback(() => {
    if (!isMicInitialized) {
      alert("Initialize the microphone first.");
      return;
    }

    if (isProcessing) {
      // Stop current recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      return;
    }

    setProcessing(true);
    setSpeechActive(true);

    // Step 1: Pause the analyser to avoid mic conflict
    pauseAnalyser();

    // Step 2: Start speech recognition
    const recognition = startRecognition(selectedDialect, {
      onResult: ({ transcript, confidence, isFinal }) => {
        setSpeechResult(transcript, confidence);

        if (isFinal) {
          // Step 3: Resume analyser and calculate correlation
          resumeAnalyser();

          // Get current frequency snapshot
          setTimeout(() => {
            const freqData = getFrequencyData();
            const phraseData = getCurrentPhraseData();

            if (freqData && phraseData?.referenceFormants) {
              const score = calculateCorrelation(
                freqData,
                phraseData.referenceFormants
              );
              const normalizedScore = Math.max(0, Math.min(1, (score + 1) / 2));
              setCorrelationScore(normalizedScore);

              // Generate per-phoneme accuracies (simulated from overall score + variance)
              if (phraseData.phonemes) {
                const accuracies = phraseData.phonemes.map((_, i) => {
                  const variance = (Math.random() - 0.5) * 0.3;
                  return Math.max(0, Math.min(1, normalizedScore + variance));
                });
                setIpaTokenAccuracies(accuracies);
              }

              recordAccuracy(normalizedScore);
            }

            setProcessing(false);
            setSpeechActive(false);
          }, 300);
        }
      },
      onEnd: () => {
        resumeAnalyser();
        setProcessing(false);
        setSpeechActive(false);
        recognitionRef.current = null;
      },
      onError: (err) => {
        resumeAnalyser();
        setProcessing(false);
        setSpeechActive(false);
        recognitionRef.current = null;
        if (err.error !== "aborted") {
          console.warn("Speech recognition error:", err.message);
        }
      },
      onSpeechStart: () => {},
      onSpeechEnd: () => {},
    });

    recognitionRef.current = recognition;
  }, [
    isMicInitialized,
    isProcessing,
    selectedDialect,
    setProcessing,
    setSpeechActive,
    setSpeechResult,
    setCorrelationScore,
    setIpaTokenAccuracies,
    getCurrentPhraseData,
    recordAccuracy,
  ]);

  /**
   * Clear Cache — wipes localStorage and resets all state.
   */
  const handleClearCache = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    cleanup();
    setMicInitialized(false);
    setRecording(false);
    clearCache();
  }, [clearCache, setMicInitialized, setRecording]);

  return (
    <div className="action-strip">
      <button
        className={`action-btn ${isMicInitialized ? "mic-active" : ""}`}
        onClick={handleInitMic}
        id="btn-init-mic"
      >
        <span className="btn-icon">{isMicInitialized ? "◉" : "◎"}</span>
        {isMicInitialized ? "Mic On" : "Init Mic"}
      </button>

      <button
        className={`action-btn ${isProcessing ? "recording" : ""}`}
        onClick={handleProcessVoice}
        disabled={!isMicInitialized}
        id="btn-process-voice"
      >
        <span className="btn-icon">{isProcessing ? "■" : "▶"}</span>
        {isProcessing ? "Stop" : "Process"}
      </button>

      <button
        className="action-btn clear"
        onClick={handleClearCache}
        id="btn-clear-cache"
      >
        <span className="btn-icon">⌫</span>
        Clear
      </button>
    </div>
  );
}
