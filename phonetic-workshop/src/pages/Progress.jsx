import React from "react";
import { Link } from "react-router-dom";
import useWorkshopStore from "../store/useWorkshopStore";

/* Inline SVG icons */
const ChartBarSvg = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);

export default function Progress() {
  const accuracyHistory = useWorkshopStore((s) => s.accuracyHistory);
  const bookmarkedPhrases = useWorkshopStore((s) => s.bookmarkedPhrases);

  const totalSessions = accuracyHistory.length;
  const avgAccuracy =
    totalSessions > 0
      ? accuracyHistory.reduce((sum, e) => sum + e.score, 0) / totalSessions
      : 0;
  const bestScore =
    totalSessions > 0 ? Math.max(...accuracyHistory.map((e) => e.score)) : 0;

  const dialectCounts = {};
  accuracyHistory.forEach((e) => {
    dialectCounts[e.dialect] = (dialectCounts[e.dialect] || 0) + 1;
  });
  const favoriteDialect =
    Object.keys(dialectCounts).sort(
      (a, b) => dialectCounts[b] - dialectCounts[a]
    )[0] || "—";

  const dialectLabel = {
    "en-US": "American",
    "en-GB": "British",
    "en-AU": "Australian",
  };

  const chartData = accuracyHistory.slice(-20);

  const timeAgo = (ts) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  if (totalSessions === 0) {
    return (
      <div className="progress-page">
        <div className="empty-state">
          <div className="empty-graphic">
            <ChartBarSvg />
          </div>
          <h3>No Training Data Yet</h3>
          <p>
            Complete your first training session in the Workshop
            to see your progress here.
          </p>
          <Link to="/workshop" className="btn-primary">
            Start Training →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>Your Progress</h1>
        <p>Track your accent training journey and improvement over time.</p>
      </div>

      {/* Summary Stats — icons are styled via CSS nth-child */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-card-icon">#</div>
          <div className="stat-card-value">{totalSessions}</div>
          <div className="stat-card-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">%</div>
          <div className="stat-card-value">{(avgAccuracy * 100).toFixed(0)}%</div>
          <div className="stat-card-label">Average Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">★</div>
          <div className="stat-card-value">{(bestScore * 100).toFixed(0)}%</div>
          <div className="stat-card-label">Best Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10" />
            </svg>
          </div>
          <div className="stat-card-value">
            {dialectLabel[favoriteDialect] || favoriteDialect}
          </div>
          <div className="stat-card-label">Most Practiced</div>
        </div>
      </div>

      {/* Accuracy Chart */}
      {chartData.length > 0 && (
        <div className="chart-card">
          <h3>Recent Accuracy Scores</h3>
          <div className="bar-chart">
            {chartData.map((entry, i) => {
              const heightPct = Math.max(5, entry.score * 100);
              const cls =
                entry.score >= 0.7
                  ? "high"
                  : entry.score >= 0.4
                  ? "mid"
                  : "low";
              return (
                <div className="bar-item" key={i}>
                  <div
                    className={`bar-fill ${cls}`}
                    style={{ height: `${heightPct}%` }}
                    title={`${entry.phraseId}: ${(entry.score * 100).toFixed(0)}%`}
                  />
                  <span className="bar-label">{entry.phraseId}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History List */}
      <div className="history-card">
        <h3>Session History</h3>
        {accuracyHistory
          .slice()
          .reverse()
          .slice(0, 15)
          .map((entry, i) => (
            <div className="history-row" key={i}>
              <span className="history-phrase">{entry.phraseId}</span>
              <span className="history-dialect">
                {dialectLabel[entry.dialect] || entry.dialect}
              </span>
              <span
                className="history-score"
                style={{
                  color:
                    entry.score >= 0.7
                      ? "#10B981"
                      : entry.score >= 0.4
                      ? "#F59E0B"
                      : "#EF4444",
                }}
              >
                {(entry.score * 100).toFixed(0)}%
              </span>
              <span className="history-time">{timeAgo(entry.timestamp)}</span>
            </div>
          ))}
      </div>

      {/* Bookmarks */}
      {bookmarkedPhrases.length > 0 && (
        <div className="chart-card" style={{ marginTop: 24 }}>
          <h3>Bookmarked Phrases</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {bookmarkedPhrases.map((id) => (
              <span
                key={id}
                style={{
                  padding: "6px 16px",
                  background: "var(--warning-bg)",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#92400E",
                  border: "1px solid #FDE68A",
                }}
              >
                ★ {id}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
