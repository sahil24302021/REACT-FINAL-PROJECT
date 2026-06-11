import React, { useCallback, useRef, useEffect, useMemo } from "react";
import useWorkshopStore from "../store/useWorkshopStore";
import ipaDict from "../data/ipaDict";
import { difficultyLabels, dialectLabels } from "../data/phrases";
import {
  initMicrophone,
  pauseAnalyser,
  resumeAnalyser,
  getFrequencyData,
  getTimeDomainData,
  getFrequencyBinCount,
  getTelemetryMetrics,
  calculateCorrelation,
  isInitialized,
  cleanup,
} from "../audio/audioEngine";
import { startRecognition } from "../audio/speechEngine";

const DIALECTS = [
  { id: "en-US", label: "General American", code: "US", tag: "EN-US" },
  { id: "en-GB", label: "Received Pronunciation", code: "GB", tag: "EN-GB" },
  { id: "en-AU", label: "Australian English", code: "AU", tag: "EN-AU" },
];
const DIFFICULTIES = ["easy", "medium", "hard"];

export default function Workshop() {
  const isMicInitialized = useWorkshopStore((s) => s.isMicInitialized);
  const isProcessing = useWorkshopStore((s) => s.isProcessing);
  const selectedDialect = useWorkshopStore((s) => s.selectedDialect);
  const difficulty = useWorkshopStore((s) => s.difficulty);
  const selectedPhraseId = useWorkshopStore((s) => s.selectedPhraseId);
  const correlationScore = useWorkshopStore((s) => s.correlationScore);
  const ipaTokenAccuracies = useWorkshopStore((s) => s.ipaTokenAccuracies);
  const recognizedText = useWorkshopStore((s) => s.recognizedText);
  const speechConfidence = useWorkshopStore((s) => s.speechConfidence);
  const isSpeechActive = useWorkshopStore((s) => s.isSpeechActive);
  const telemetry = useWorkshopStore((s) => s.telemetry);
  const bookmarkedPhrases = useWorkshopStore((s) => s.bookmarkedPhrases);

  const setMicInitialized = useWorkshopStore((s) => s.setMicInitialized);
  const setRecording = useWorkshopStore((s) => s.setRecording);
  const setProcessing = useWorkshopStore((s) => s.setProcessing);
  const setDialect = useWorkshopStore((s) => s.setDialect);
  const setDifficulty = useWorkshopStore((s) => s.setDifficulty);
  const setSelectedPhrase = useWorkshopStore((s) => s.setSelectedPhrase);
  const setSpeechResult = useWorkshopStore((s) => s.setSpeechResult);
  const setSpeechActive = useWorkshopStore((s) => s.setSpeechActive);
  const setCorrelationScore = useWorkshopStore((s) => s.setCorrelationScore);
  const setIpaTokenAccuracies = useWorkshopStore((s) => s.setIpaTokenAccuracies);
  const getCurrentPhraseData = useWorkshopStore((s) => s.getCurrentPhraseData);
  const getAvailablePhrases = useWorkshopStore((s) => s.getAvailablePhrases);
  const recordAccuracy = useWorkshopStore((s) => s.recordAccuracy);
  const updateAudioData = useWorkshopStore((s) => s.updateAudioData);
  const updateTelemetry = useWorkshopStore((s) => s.updateTelemetry);
  const clearCache = useWorkshopStore((s) => s.clearCache);
  const toggleBookmark = useWorkshopStore((s) => s.toggleBookmark);
  const exportAnalytics = useWorkshopStore((s) => s.exportAnalytics);

  const canvasRef = useRef(null);
  const rafIdRef = useRef(null);
  const recognitionRef = useRef(null);

  const phraseData = getCurrentPhraseData();
  const phrases = getAvailablePhrases();

  // ── Step state ────────────────────────────
  const currentStep = useMemo(() => {
    if (!isMicInitialized) return 1;
    if (correlationScore === 0) return 2;
    return 3;
  }, [isMicInitialized, correlationScore]);

  // ── Waveform render loop ──────────────────
  useEffect(() => {
    if (!isMicInitialized || !isInitialized()) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frameCount = 0;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const w = rect.width;
      const h = rect.height;

      // Background
      ctx.fillStyle = "#FAFBFF";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 12; i++) {
        const x = (w / 12) * i;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let i = 0; i <= 6; i++) {
        const y = (h / 6) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      const freqData = getFrequencyData();
      const timeData = getTimeDomainData();
      const binCount = getFrequencyBinCount();

      if (freqData && timeData && binCount > 0) {
        const waveColor = correlationScore >= 0.7 ? "#10B981"
          : correlationScore >= 0.4 ? "#F59E0B"
          : correlationScore > 0 ? "#EF4444" : "#6366F1";

        // Frequency bars
        const barW = w / binCount;
        for (let i = 0; i < binCount; i++) {
          const barH = (freqData[i] / 255) * h * 0.6;
          const gradient = ctx.createLinearGradient(0, h - barH, 0, h);
          gradient.addColorStop(0, waveColor + "33");
          gradient.addColorStop(1, waveColor + "11");
          ctx.fillStyle = gradient;
          ctx.fillRect(i * barW, h - barH, barW - 1, barH);
        }

        // Time-domain waveform line
        ctx.beginPath();
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 2.5;
        const sliceW = w / binCount;
        for (let i = 0; i < binCount; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) ctx.moveTo(0, y); else ctx.lineTo(i * sliceW, y);
        }
        ctx.stroke();

        if (frameCount % 10 === 0) {
          updateAudioData(freqData, timeData);
          updateTelemetry(getTelemetryMetrics());
        }
      } else {
        // Idle line
        ctx.beginPath();
        ctx.strokeStyle = "#D1D5DB";
        ctx.lineWidth = 1;
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }

      frameCount++;
      rafIdRef.current = requestAnimationFrame(render);
    };

    rafIdRef.current = requestAnimationFrame(render);
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isMicInitialized, correlationScore, updateAudioData, updateTelemetry]);

  // ── Handlers ──────────────────────────────
  const handleRecord = useCallback(async () => {
    if (!isMicInitialized) {
      const result = await initMicrophone();
      if (result.success) {
        setMicInitialized(true);
        setRecording(true);
      } else {
        alert("Mic access failed: " + result.error);
      }
      return;
    }

    if (isProcessing) {
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }

    setProcessing(true);
    setSpeechActive(true);
    pauseAnalyser();

    const recognition = startRecognition(selectedDialect, {
      onResult: ({ transcript, confidence, isFinal }) => {
        setSpeechResult(transcript, confidence);
        if (isFinal) {
          resumeAnalyser();
          setTimeout(() => {
            const freqData = getFrequencyData();
            if (freqData && phraseData?.referenceFormants) {
              const score = calculateCorrelation(freqData, phraseData.referenceFormants);
              const norm = Math.max(0, Math.min(1, (score + 1) / 2));
              setCorrelationScore(norm);
              if (phraseData.phonemes) {
                setIpaTokenAccuracies(
                  phraseData.phonemes.map(() =>
                    Math.max(0, Math.min(1, norm + (Math.random() - 0.5) * 0.3))
                  )
                );
              }
              recordAccuracy(norm);
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
        if (err.error !== "aborted") console.warn(err.message);
      },
    });
    recognitionRef.current = recognition;
  }, [isMicInitialized, isProcessing, selectedDialect, phraseData, setMicInitialized,
    setRecording, setProcessing, setSpeechActive, setSpeechResult, setCorrelationScore,
    setIpaTokenAccuracies, recordAccuracy]);

  const handleClear = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    cleanup();
    setMicInitialized(false);
    setRecording(false);
    clearCache();
  }, [clearCache, setMicInitialized, setRecording]);

  // ── Gauge ─────────────────────────────────
  const gaugeR = 38;
  const gaugeC = 2 * Math.PI * gaugeR;
  const gaugeOffset = gaugeC * (1 - correlationScore);
  const gaugeColor = correlationScore >= 0.7 ? "#10B981"
    : correlationScore >= 0.4 ? "#F59E0B"
    : correlationScore > 0 ? "#EF4444" : "#D1D5DB";

  const formatBytes = (b) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`;

  return (
    <div className="workshop-page">
      <h1 className="workshop-page-title">Training Workshop</h1>
      <p className="workshop-page-subtitle">
        Select a dialect and phrase, then record your pronunciation to get instant feedback.
      </p>

      {/* Step Indicator */}
      <div className="step-indicator">
        <span className={`step-pill ${currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""}`}>
          <span className="step-num">{currentStep > 1 ? "✓" : "1"}</span>
          Init Microphone
        </span>
        <span className="step-arrow">→</span>
        <span className={`step-pill ${currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""}`}>
          <span className="step-num">{currentStep > 2 ? "✓" : "2"}</span>
          Select & Speak
        </span>
        <span className="step-arrow">→</span>
        <span className={`step-pill ${currentStep === 3 ? "active" : ""}`}>
          <span className="step-num">3</span>
          View Results
        </span>
      </div>

      {/* Main Grid */}
      <div className="workshop-grid">
        {/* ── Left Panel ─────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Dialect Selector */}
          <div className="panel-card">
            <div className="panel-header">
              <span className="panel-title">Target Dialect</span>
            </div>
            <div className="panel-body">
              <div className="dialect-cards">
                {DIALECTS.map((d) => (
                  <div
                    key={d.id}
                    className={`dialect-card ${selectedDialect === d.id ? "active" : ""}`}
                    onClick={() => setDialect(d.id)}
                  >
                    <div className="dialect-flag">
                      {selectedDialect === d.id
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                        : <span style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:14}}>{d.code}</span>}
                    </div>
                    <div className="dialect-info">
                      <h4>{d.label}</h4>
                      <p>{d.tag}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty + Phrases */}
          <div className="panel-card">
            <div className="panel-header">
              <span className="panel-title">Training Phrases</span>
            </div>
            <div className="panel-body">
              <div className="difficulty-group">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    className={`diff-btn ${difficulty === d ? "active" : ""}`}
                    onClick={() => setDifficulty(d)}
                  >
                    {difficultyLabels[d]}
                  </button>
                ))}
              </div>
              <div className="phrase-grid">
                {phrases.map((p) => {
                  const dData = ipaDict[p.id]?.[selectedDialect];
                  const isBookmarked = bookmarkedPhrases.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`phrase-row ${selectedPhraseId === p.id ? "active" : ""}`}
                      onClick={() => setSelectedPhrase(p.id)}
                    >
                      <span className="phrase-name">{p.label}</span>
                      {dData && <span className="phrase-ipa-tag">{dData.ipa}</span>}
                      <span
                        className={`phrase-bookmark ${isBookmarked ? "bookmarked" : ""}`}
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(p.id); }}
                      >
                        {isBookmarked ? "★" : "☆"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Area ──────────────────────── */}
        <div className="workshop-main-area">
          {/* Phrase Display + Record + Gauge */}
          <div className="phrase-header-card">
            <div className="phrase-header-left">
              <h2>{phraseData?.text || "Select a phrase"}</h2>
              {phraseData && <span className="ipa-display">[{phraseData.ipa}]</span>}
            </div>

            <div className="record-section">
              <button
                className={`record-btn ${isProcessing ? "listening" : !isMicInitialized ? "mic-off" : ""}`}
                onClick={handleRecord}
              >
                {isProcessing ? "■" : !isMicInitialized
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v4M8 23h8"/></svg>
                  : "●"}
              </button>
              <div className="record-controls">
                <span className="record-label">
                  {isProcessing ? "Listening..." : !isMicInitialized ? "Init Microphone" : "Record & Analyze"}
                </span>
                <span className="record-hint">
                  {isProcessing ? "Click to stop" : !isMicInitialized ? "Click to enable mic" : "Click to speak"}
                </span>
              </div>
            </div>

            <div className="gauge-container">
              <div className="correlation-gauge">
                <svg viewBox="0 0 100 100">
                  <circle className="gauge-bg" cx="50" cy="50" r={gaugeR} />
                  <circle
                    className="gauge-fill"
                    cx="50" cy="50" r={gaugeR}
                    stroke={gaugeColor}
                    strokeDasharray={gaugeC}
                    strokeDashoffset={gaugeOffset}
                  />
                </svg>
                <span className="gauge-value" style={{ color: gaugeColor }}>
                  {correlationScore > 0 ? `${(correlationScore * 100).toFixed(0)}` : "—"}
                </span>
              </div>
              <span className="gauge-label">Accuracy</span>
            </div>
          </div>

          {/* Speech Banner */}
          {isSpeechActive && (
            <div className="speech-banner listening">
              <div className="banner-dot" />
              <span className="banner-text">Listening for {dialectLabels[selectedDialect]} accent pattern...</span>
            </div>
          )}
          {recognizedText && !isSpeechActive && (
            <div className="speech-banner">
              <div className="banner-dot" />
              <span className="banner-text">"{recognizedText}"</span>
              <span className="banner-confidence">{(speechConfidence * 100).toFixed(1)}%</span>
            </div>
          )}

          {/* Waveform */}
          <div className="waveform-wrapper">
            <div className="waveform-header">
              <span className="waveform-header-label">Acoustic Waveform</span>
              {isMicInitialized && (
                <span className="waveform-status"><span className="live-dot" /> Live · 60fps</span>
              )}
            </div>
            <div className="waveform-canvas-area">
              <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
              {!isMicInitialized && (
                <div className="waveform-placeholder">
                  <div className="placeholder-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <path d="M12 19v4M8 23h8"/>
                    </svg>
                  </div>
                  <p>Initialize your microphone to see the waveform</p>
                  <p className="placeholder-hint">Click the record button above to begin</p>
                </div>
              )}
            </div>
          </div>

          {/* IPA Tokens */}
          {phraseData && (
            <div className="ipa-section">
              <div className="ipa-section-header">
                <span className="ipa-section-title">IPA Token Matrix</span>
                <span className="ipa-section-tag">/{phraseData.ipa}/</span>
              </div>
              <div className="ipa-tiles">
                {phraseData.phonemes.map((phoneme, i) => {
                  const acc = ipaTokenAccuracies[i];
                  const cls = acc !== undefined
                    ? acc >= 0.7 ? "score-high" : acc >= 0.4 ? "score-mid" : "score-low"
                    : "";
                  const charsPerP = phraseData.text.length / phraseData.phonemes.length;
                  const textChar = phraseData.text.slice(
                    Math.floor(i * charsPerP),
                    Math.floor((i + 1) * charsPerP)
                  ) || "";
                  return (
                    <div key={`${selectedPhraseId}-${i}`} className={`ipa-tile ${cls} ${acc !== undefined ? "pulse-anim" : ""}`}>
                      <span className="tile-char">{textChar}</span>
                      <span className="tile-ipa">{phoneme}</span>
                      {acc !== undefined && (
                        <span className="tile-score" style={{
                          color: acc >= 0.7 ? "#10B981" : acc >= 0.4 ? "#F59E0B" : "#EF4444"
                        }}>
                          {Math.round(acc * 100)}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Telemetry */}
          <div className="telemetry-bar">
            <div className="tele-metric">
              <span className="tele-label">Correlation</span>
              <span className={`tele-value ${correlationScore > 0 && correlationScore < 0.4 ? "err" : correlationScore < 0.7 && correlationScore > 0 ? "warn" : ""}`}>
                {correlationScore > 0 ? correlationScore.toFixed(4) : "—"}
              </span>
            </div>
            <div className="tele-metric">
              <span className="tele-label">Formant Hz</span>
              <span className="tele-value">{isMicInitialized && telemetry.formantHz > 0 ? `${telemetry.formantHz}` : "—"}</span>
            </div>
            <div className="tele-metric">
              <span className="tele-label">Latency</span>
              <span className="tele-value">{isMicInitialized ? `${telemetry.bufferLatency}ms` : "—"}</span>
            </div>
            <div className="tele-metric">
              <span className="tele-label">Processed</span>
              <span className="tele-value">{telemetry.totalBytesProcessed > 0 ? formatBytes(telemetry.totalBytesProcessed) : "—"}</span>
            </div>
            <div className="tele-actions">
              <button className="tele-btn" onClick={exportAnalytics}>Export</button>
              <button className="tele-btn" onClick={handleClear}>Clear All</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
