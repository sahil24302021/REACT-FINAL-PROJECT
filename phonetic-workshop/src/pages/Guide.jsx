import React from "react";
import { Link } from "react-router-dom";
import ipaDict from "../data/ipaDict";

export default function Guide() {
  const comparisonWords = ["water", "dance", "bath", "car", "tomato", "schedule", "either"];

  return (
    <div className="guide-page">
      <h1>Phonetic Training Guide</h1>
      <p className="guide-intro">
        Learn the fundamentals of phonetics, understand IPA notation, and discover
        the key differences between English dialects. This guide will help you get
        the most out of your training sessions.
      </p>

      {/* ── What is IPA? ─────────────────────── */}
      <div className="guide-section">
        <h2>What is the International Phonetic Alphabet (IPA)?</h2>
        <p>
          The International Phonetic Alphabet (IPA) is a standardized system of phonetic
          notation that represents the sounds of spoken language. Unlike regular spelling,
          which can be ambiguous (think "through", "though", "tough"), IPA gives every
          distinct sound its own unique symbol.
        </p>
        <p>
          For example, the English word <strong>"water"</strong> is spelled the same everywhere,
          but pronounced very differently across dialects:
        </p>
        <div className="tip-card">
          <span className="country-badge us">US</span>
          <div className="tip-text">
            <strong>American English:</strong> [ˈwɑtɚ] — with a rhotic 'r' sound (ɚ) and an open 'a' vowel (ɑ)
          </div>
        </div>
        <div className="tip-card">
          <span className="country-badge gb">GB</span>
          <div className="tip-text">
            <strong>British English (RP):</strong> [ˈwɔːtə] — non-rhotic (no 'r' at end), with a rounded 'o' vowel (ɔː)
          </div>
        </div>
        <div className="tip-card">
          <span className="country-badge au">AU</span>
          <div className="tip-text">
            <strong>Australian English:</strong> [ˈwoːtə] — similar to British but with a more fronted 'o' vowel
          </div>
        </div>
      </div>

      {/* ── Dialect Comparison ───────────────── */}
      <div className="guide-section">
        <h2>Dialect Comparison Table</h2>
        <p>
          See how the same words are pronounced differently across the three English
          dialects supported in this app. The IPA notation reveals the specific vowel
          and consonant differences.
        </p>

        <table className="dialect-table">
          <thead>
            <tr>
              <th>Word</th>
              <th>
                <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
                  <span className="country-badge us" style={{width:20,height:20,fontSize:9}}>US</span>
                  American (en-US)
                </span>
              </th>
              <th>
                <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
                  <span className="country-badge gb" style={{width:20,height:20,fontSize:9}}>GB</span>
                  British (en-GB)
                </span>
              </th>
              <th>
                <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
                  <span className="country-badge au" style={{width:20,height:20,fontSize:9}}>AU</span>
                  Australian (en-AU)
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonWords.map((word) => {
              const entry = ipaDict[word];
              if (!entry) return null;
              return (
                <tr key={word}>
                  <td>{word}</td>
                  <td className="ipa-cell">{entry["en-US"]?.ipa || "—"}</td>
                  <td className="ipa-cell">{entry["en-GB"]?.ipa || "—"}</td>
                  <td className="ipa-cell">{entry["en-AU"]?.ipa || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Key Dialect Features ─────────────── */}
      <div className="guide-section">
        <h2>Key Dialect Features</h2>

        <p><strong>Rhoticity (the "R" sound)</strong></p>
        <p>
          American English is <em>rhotic</em> — speakers pronounce the 'r' in words like
          "car", "water", and "better". British RP and most Australian English are
          <em> non-rhotic</em> — the 'r' is dropped at the end of syllables.
        </p>

        <p><strong>The BATH-TRAP Split</strong></p>
        <p>
          In American English, words like "bath", "dance", and "can't" use the short [æ] vowel
          (same as "cat"). In British RP, these words use the long [ɑː] vowel (like "father").
          This is one of the most recognizable differences between the two dialects.
        </p>

        <p><strong>T-flapping</strong></p>
        <p>
          In American English, the 't' sound between vowels often becomes a quick 'd'-like
          flap [ɾ]. Words like "butter", "water", and "better" sound more like "budder",
          "wader", and "bedder". This doesn't happen in British or Australian English.
        </p>
      </div>

      {/* ── Practice Tips ────────────────────── */}
      <div className="guide-section">
        <h2>Tips for Effective Practice</h2>

        <div className="tip-card">
          <span className="tip-icon">01</span>
          <div className="tip-text">
            <strong>Start with Easy phrases.</strong> Master simple words before moving to
            complex multi-syllable phrases. Build confidence with common words like
            "water", "hello", and "car" first.
          </div>
        </div>

        <div className="tip-card">
          <span className="tip-icon">02</span>
          <div className="tip-text">
            <strong>Focus on one dialect at a time.</strong> Don't switch between American
            and British in the same session. Spend at least 10 minutes on one dialect
            before switching to maintain muscle memory.
          </div>
        </div>

        <div className="tip-card">
          <span className="tip-icon">03</span>
          <div className="tip-text">
            <strong>Pay attention to the IPA tokens.</strong> The color-coded phoneme tiles
            show exactly which sounds you're nailing and which need work. Focus on the
            red/amber tiles in your next attempt.
          </div>
        </div>

        <div className="tip-card">
          <span className="tip-icon">04</span>
          <div className="tip-text">
            <strong>Track your progress.</strong> Visit the Progress page regularly to see
            your accuracy trend over time. Bookmark phrases you find challenging so you
            can revisit them later.
          </div>
        </div>

        <div className="tip-card">
          <span className="tip-icon">05</span>
          <div className="tip-text">
            <strong>Use a quiet environment.</strong> Background noise reduces the accuracy
            of both the FFT analysis and speech recognition. Use headphones if possible
            to avoid feedback loops.
          </div>
        </div>
      </div>

      {/* ── How Scoring Works ────────────────── */}
      <div className="guide-section">
        <h2>How Scoring Works</h2>
        <p>
          Your pronunciation accuracy is calculated using the <strong>Pearson Correlation
          Coefficient</strong>, a statistical measure that compares your live audio
          frequency spectrum against a pre-computed reference pattern for the target
          dialect.
        </p>
        <p>
          The formula compares your waveform (X) against the target (Y):
        </p>
        <div className="tip-card">
          <span className="tip-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 20h16M4 20l4-16h8l4 16" />
            </svg>
          </span>
          <div className="tip-text">
            <strong>r = Σ(Xᵢ - X̄)(Yᵢ - Ȳ) / √[Σ(Xᵢ - X̄)² · Σ(Yᵢ - Ȳ)²]</strong>
            <br />
            A score of 70%+ means excellent match (green), 40-70% is moderate (amber),
            and below 40% indicates significant deviation (red).
          </div>
        </div>
        <p>
          All processing happens entirely in your browser using the Web Audio API.
          No audio data is ever sent to any server — your privacy is guaranteed.
        </p>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Link to="/workshop" className="btn-primary" style={{ fontSize: 16 }}>
          Start Practicing Now →
        </Link>
      </div>
    </div>
  );
}
