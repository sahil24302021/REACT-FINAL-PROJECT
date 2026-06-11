/**
 * LinguisticTelemetryHUD — Bottom status bar.
 *
 * Displays live-updating monospace metrics:
 * - Correlation Index
 * - Formant Hz
 * - Buffer Latency (ms)
 * - Bytes Processed
 *
 * Secondary actions: Export Analytics, Load Reference Manifests
 */

import React from "react";
import useWorkshopStore from "../store/useWorkshopStore";
import ipaDict from "../data/ipaDict";

export default function LinguisticTelemetryHUD() {
  const telemetry = useWorkshopStore((s) => s.telemetry);
  const correlationScore = useWorkshopStore((s) => s.correlationScore);
  const isMicInitialized = useWorkshopStore((s) => s.isMicInitialized);
  const exportAnalytics = useWorkshopStore((s) => s.exportAnalytics);

  /**
   * Load reference phrase manifests — loads phrases data into console.
   */
  const handleLoadManifests = () => {
    console.log("Reference Phrase Manifests loaded:", ipaDict);
    alert(
      `Loaded ${Object.keys(ipaDict).length} phrase manifests. Check browser console for details.`
    );
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getCorrelationClass = () => {
    if (correlationScore >= 0.7) return "";
    if (correlationScore >= 0.4) return "warning";
    if (correlationScore > 0) return "error";
    return "";
  };

  return (
    <div className="telemetry-hud">
      <div className="telemetry-metric">
        <span className="metric-label">Correlation Index</span>
        <span className={`metric-value ${getCorrelationClass()}`}>
          {correlationScore > 0 ? correlationScore.toFixed(4) : "—"}
        </span>
      </div>

      <div className="telemetry-metric">
        <span className="metric-label">Formant Hz</span>
        <span className="metric-value">
          {isMicInitialized && telemetry.formantHz > 0
            ? `${telemetry.formantHz} Hz`
            : "—"}
        </span>
      </div>

      <div className="telemetry-metric">
        <span className="metric-label">Buffer Latency</span>
        <span className="metric-value">
          {isMicInitialized
            ? `${telemetry.bufferLatency} ms`
            : "—"}
        </span>
      </div>

      <div className="telemetry-metric">
        <span className="metric-label">Bytes Processed</span>
        <span className="metric-value">
          {telemetry.totalBytesProcessed > 0
            ? formatBytes(telemetry.totalBytesProcessed)
            : "—"}
        </span>
      </div>

      <div className="telemetry-actions">
        <button
          className="telemetry-btn"
          onClick={exportAnalytics}
          id="btn-export-analytics"
          title="Export accent analytics to JSON file"
        >
          Export Analytics
        </button>
        <button
          className="telemetry-btn"
          onClick={handleLoadManifests}
          id="btn-load-manifests"
          title="Load reference phrase manifests"
        >
          Load Manifests
        </button>
      </div>
    </div>
  );
}
