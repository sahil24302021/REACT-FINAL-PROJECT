/**
 * ProfileSelectorForm — Dialect tabs, difficulty toggles, phrase selector.
 *
 * Dialect switcher uses pill tabs (EN-US | EN-GB | EN-AU) — not a dropdown.
 * Difficulty has three levels that adjust correlation thresholds.
 * Phrase list shows available phrases for the selected difficulty.
 */

import React from "react";
import useWorkshopStore from "../store/useWorkshopStore";
import ipaDict from "../data/ipaDict";
import { difficultyLabels } from "../data/phrases";

const DIALECTS = [
  { id: "en-US", label: "EN-US" },
  { id: "en-GB", label: "EN-GB" },
  { id: "en-AU", label: "EN-AU" },
];

const DIFFICULTIES = ["easy", "medium", "hard"];

export default function ProfileSelectorForm() {
  const selectedDialect = useWorkshopStore((s) => s.selectedDialect);
  const difficulty = useWorkshopStore((s) => s.difficulty);
  const selectedPhraseId = useWorkshopStore((s) => s.selectedPhraseId);
  const setDialect = useWorkshopStore((s) => s.setDialect);
  const setDifficulty = useWorkshopStore((s) => s.setDifficulty);
  const setSelectedPhrase = useWorkshopStore((s) => s.setSelectedPhrase);
  const getAvailablePhrases = useWorkshopStore((s) => s.getAvailablePhrases);
  const bookmarkedPhrases = useWorkshopStore((s) => s.bookmarkedPhrases);
  const toggleBookmark = useWorkshopStore((s) => s.toggleBookmark);

  const phrases = getAvailablePhrases();

  return (
    <>
      {/* ── Dialect Selector ─────────────────────────── */}
      <div className="sidebar-section">
        <div className="section-label">Target Dialect</div>
        <div className="pill-tabs">
          {DIALECTS.map((d) => (
            <button
              key={d.id}
              className={`pill-tab ${selectedDialect === d.id ? "active" : ""}`}
              onClick={() => setDialect(d.id)}
              id={`tab-${d.id}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Difficulty ───────────────────────────────── */}
      <div className="sidebar-section">
        <div className="section-label">Difficulty Level</div>
        <div className="difficulty-toggles">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              className={`difficulty-btn ${difficulty === d ? "active" : ""}`}
              onClick={() => setDifficulty(d)}
              id={`diff-${d}`}
            >
              {difficultyLabels[d]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Phrase Selector ──────────────────────────── */}
      <div className="sidebar-section" style={{ flex: 1 }}>
        <div className="section-label">Training Phrases</div>
        <div className="phrase-list">
          {phrases.map((phrase) => {
            const dialectData = ipaDict[phrase.id]?.[selectedDialect];
            const isBookmarked = bookmarkedPhrases.includes(phrase.id);

            return (
              <div
                key={phrase.id}
                className={`phrase-item ${
                  selectedPhraseId === phrase.id ? "active" : ""
                }`}
                onClick={() => setSelectedPhrase(phrase.id)}
                id={`phrase-${phrase.id}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="phrase-word">{phrase.label}</span>
                  <span
                    style={{
                      cursor: "pointer",
                      fontSize: 12,
                      color: isBookmarked ? "var(--amber)" : "var(--text-tertiary)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(phrase.id);
                    }}
                    title={isBookmarked ? "Remove bookmark" : "Bookmark phrase"}
                  >
                    {isBookmarked ? "★" : "☆"}
                  </span>
                </div>
                {dialectData && (
                  <span className="phrase-ipa">[{dialectData.ipa}]</span>
                )}
                <span className="phrase-desc">{phrase.description}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
