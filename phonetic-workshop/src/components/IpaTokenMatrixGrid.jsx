/**
 * IpaTokenMatrixGrid — Horizontal phoneme tile grid.
 *
 * Each phoneme rendered as an independent tile with:
 * - Top: standard text character
 * - Bottom: IPA symbol
 * - Border animates: crimson → amber → green based on accuracy
 * - Tiles pulse when accuracy updates
 */

import React, { useEffect, useRef } from "react";
import useWorkshopStore from "../store/useWorkshopStore";

export default function IpaTokenMatrixGrid() {
  const getCurrentPhraseData = useWorkshopStore((s) => s.getCurrentPhraseData);
  const ipaTokenAccuracies = useWorkshopStore((s) => s.ipaTokenAccuracies);
  const selectedPhraseId = useWorkshopStore((s) => s.selectedPhraseId);
  const selectedDialect = useWorkshopStore((s) => s.selectedDialect);
  const prevAccuraciesRef = useRef([]);

  const phraseData = getCurrentPhraseData();

  // Detect when accuracies change to trigger pulse
  useEffect(() => {
    prevAccuraciesRef.current = ipaTokenAccuracies;
  }, [ipaTokenAccuracies]);

  if (!phraseData) {
    return (
      <div className="ipa-matrix">
        <div style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
          Select a phrase to view IPA tokens
        </div>
      </div>
    );
  }

  const { phonemes, text, ipa } = phraseData;
  const hasAccuracies = ipaTokenAccuracies.length > 0;

  /**
   * Get accuracy class for border coloring.
   */
  function getAccuracyClass(accuracy) {
    if (accuracy === undefined || accuracy === null) return "";
    if (accuracy >= 0.7) return "accuracy-high";
    if (accuracy >= 0.4) return "accuracy-mid";
    return "accuracy-low";
  }

  /**
   * Get the text character(s) that correspond to this phoneme index.
   * Simple approximation: distribute text chars across phonemes.
   */
  function getTextChar(index) {
    if (!text) return "";
    const charsPerPhoneme = text.length / phonemes.length;
    const start = Math.floor(index * charsPerPhoneme);
    const end = Math.floor((index + 1) * charsPerPhoneme);
    return text.slice(start, end) || "";
  }

  // Check if accuracies just changed (for pulse animation)
  const justUpdated =
    hasAccuracies &&
    JSON.stringify(prevAccuraciesRef.current) !== JSON.stringify(ipaTokenAccuracies);

  return (
    <div>
      <div style={{
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        marginBottom: 8
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          color: "var(--text-tertiary)"
        }}>
          IPA Token Matrix
        </span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--text-secondary)"
        }}>
          /{ipa}/
        </span>
      </div>

      <div className="ipa-matrix">
        {phonemes.map((phoneme, i) => {
          const accuracy = ipaTokenAccuracies[i];
          const accClass = getAccuracyClass(accuracy);
          const textChar = getTextChar(i);

          return (
            <div
              key={`${selectedPhraseId}-${selectedDialect}-${i}`}
              className={`ipa-token ${accClass} ${justUpdated ? "pulse" : ""}`}
              title={`Accuracy: ${
                accuracy !== undefined
                  ? Math.round(accuracy * 100) + "%"
                  : "N/A"
              }`}
            >
              <span className="token-text">{textChar}</span>
              <span className="token-ipa">{phoneme}</span>
              {accuracy !== undefined && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    marginTop: 4,
                    color:
                      accuracy >= 0.7
                        ? "var(--green)"
                        : accuracy >= 0.4
                        ? "var(--amber)"
                        : "var(--crimson)",
                  }}
                >
                  {Math.round(accuracy * 100)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
