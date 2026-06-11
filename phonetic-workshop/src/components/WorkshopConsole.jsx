/**
 * WorkshopConsole — Main control panel and layout shell.
 *
 * Implements the dense grid layout:
 * ┌─────────────────────────────────────────────┐
 * │  HEADER: App name + active dialect badge     │
 * ├──────────────┬──────────────────────────────┤
 * │ LEFT PANEL   │  CENTER: WAVEFORM + IPA       │
 * ├──────────────┴──────────────────────────────┤
 * │  BOTTOM HUD: Telemetry                       │
 * └─────────────────────────────────────────────┘
 */

import React from "react";
import useWorkshopStore from "../store/useWorkshopStore";
import { dialectLabels } from "../data/phrases";
import DialectActionStrip from "./DialectActionStrip";
import ProfileSelectorForm from "./ProfileSelectorForm";
import PhoneticStage from "./PhoneticStage";
import LinguisticTelemetryHUD from "./LinguisticTelemetryHUD";

export default function WorkshopConsole() {
  const selectedDialect = useWorkshopStore((s) => s.selectedDialect);
  const isMicInitialized = useWorkshopStore((s) => s.isMicInitialized);

  return (
    <div className="workshop-layout">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="workshop-header">
        <div className="header-title">
          <span className="title-icon">◈</span>
          Phonetic Workshop
        </div>

        <div className="header-status">
          <span className="dialect-badge">
            {dialectLabels[selectedDialect] || selectedDialect}
          </span>

          <span className="status-label">
            <span
              className={`status-dot ${isMicInitialized ? "active" : ""}`}
            />
            {isMicInitialized ? "MIC ACTIVE" : "MIC IDLE"}
          </span>
        </div>
      </header>

      {/* ── Left Sidebar ───────────────────────────────── */}
      <aside className="workshop-sidebar">
        <DialectActionStrip />
        <ProfileSelectorForm />
      </aside>

      {/* ── Main Stage ─────────────────────────────────── */}
      <main className="workshop-main">
        <PhoneticStage />
      </main>

      {/* ── Bottom HUD ─────────────────────────────────── */}
      <footer className="workshop-hud">
        <LinguisticTelemetryHUD />
      </footer>
    </div>
  );
}
