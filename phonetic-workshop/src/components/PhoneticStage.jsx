/**
 * PhoneticStage — Main interactive workspace.
 *
 * Houses:
 * - Phrase display (text + IPA)
 * - Correlation gauge (SVG circular)
 * - Speech recognition status/results
 * - AcousticWaveformDisplay
 * - IpaTokenMatrixGrid
 */

import React, { useMemo } from "react";
import useWorkshopStore from "../store/useWorkshopStore";
import AcousticWaveformDisplay from "./AcousticWaveformDisplay";
import IpaTokenMatrixGrid from "./IpaTokenMatrixGrid";

export default function PhoneticStage() {
  const getCurrentPhraseData = useWorkshopStore((s) => s.getCurrentPhraseData);
  const correlationScore = useWorkshopStore((s) => s.correlationScore);
  const recognizedText = useWorkshopStore((s) => s.recognizedText);
  const speechConfidence = useWorkshopStore((s) => s.speechConfidence);
  const isSpeechActive = useWorkshopStore((s) => s.isSpeechActive);
  const selectedDialect = useWorkshopStore((s) => s.selectedDialect);

  const phraseData = getCurrentPhraseData();

  // ── Gauge calculations ────────────────────────
  const gaugeRadius = 40;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference * (1 - correlationScore);

  const gaugeColor = useMemo(() => {
    if (correlationScore >= 0.7) return "#00E676";
    if (correlationScore >= 0.4) return "#FFB300";
    if (correlationScore > 0) return "#FF1744";
    return "#252630";
  }, [correlationScore]);

  return (
    <div className="phonetic-stage">
      {/* ── Stage Header: Phrase + Gauge ──────────── */}
      <div className="stage-header">
        <div className="phrase-display">
          {phraseData ? (
            <>
              <span className="phrase-text">{phraseData.text}</span>
              <span className="phrase-ipa-display">[{phraseData.ipa}]</span>
            </>
          ) : (
            <span className="phrase-text" style={{ color: "var(--text-tertiary)" }}>
              Select a phrase to begin
            </span>
          )}
        </div>

        {/* Correlation Gauge — SVG circle */}
        <div className="correlation-gauge">
          <svg viewBox="0 0 100 100">
            <circle
              className="gauge-bg"
              cx="50"
              cy="50"
              r={gaugeRadius}
            />
            <circle
              className="gauge-fill"
              cx="50"
              cy="50"
              r={gaugeRadius}
              stroke={gaugeColor}
              strokeDasharray={gaugeCircumference}
              strokeDashoffset={gaugeOffset}
            />
          </svg>
          <span className="gauge-value" style={{ color: gaugeColor }}>
            {correlationScore > 0
              ? (correlationScore * 100).toFixed(0)
              : "—"}
          </span>
          <span className="gauge-label">Correlation</span>
        </div>
      </div>

      {/* ── Speech Recognition Status ────────────── */}
      {isSpeechActive && (
        <div className="speech-overlay">
          <div className="speech-icon" />
          <span className="speech-text">
            Listening for {selectedDialect} accent pattern...
          </span>
        </div>
      )}

      {recognizedText && !isSpeechActive && (
        <div className="speech-result">
          <span className="result-label">Detected</span>
          <span className="result-text">"{recognizedText}"</span>
          <span className="result-confidence">
            {(speechConfidence * 100).toFixed(1)}% confidence
          </span>
        </div>
      )}

      {/* ── Waveform Canvas ──────────────────────── */}
      <AcousticWaveformDisplay />

      {/* ── IPA Token Matrix ─────────────────────── */}
      <IpaTokenMatrixGrid />
    </div>
  );
}
