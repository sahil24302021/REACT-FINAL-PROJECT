/**
 * AcousticWaveformDisplay — Canvas-based 60fps waveform visualizer.
 *
 * CRITICAL: The requestAnimationFrame loop is properly cleaned up
 * in the useEffect return function to prevent memory leaks on unmount.
 * The rAF ID is stored in a ref and cancelled via cancelAnimationFrame.
 *
 * Features:
 * - Glowing cyan waveform line on dark background
 * - Oscilloscope grid overlay
 * - Color shifts based on match score
 * - Both frequency spectrum (bottom) and time-domain waveform (top)
 */

import React, { useRef, useEffect, useCallback } from "react";
import useWorkshopStore from "../store/useWorkshopStore";
import {
  getFrequencyData,
  getTimeDomainData,
  getFrequencyBinCount,
  getTelemetryMetrics,
  isInitialized,
} from "../audio/audioEngine";

export default function AcousticWaveformDisplay() {
  const canvasRef = useRef(null);
  const rafIdRef = useRef(null);
  const isMicInitialized = useWorkshopStore((s) => s.isMicInitialized);
  const correlationScore = useWorkshopStore((s) => s.correlationScore);
  const updateAudioData = useWorkshopStore((s) => s.updateAudioData);
  const updateTelemetry = useWorkshopStore((s) => s.updateTelemetry);

  /**
   * Get waveform color based on correlation score.
   */
  const getWaveColor = useCallback(() => {
    if (correlationScore >= 0.7) return "#00E676"; // green
    if (correlationScore >= 0.4) return "#FFB300"; // amber
    if (correlationScore > 0) return "#FF1744"; // crimson
    return "#00E5FF"; // cyan (default)
  }, [correlationScore]);

  /**
   * Draw oscilloscope grid lines.
   */
  const drawGrid = useCallback((ctx, width, height) => {
    ctx.strokeStyle = "rgba(37, 38, 48, 0.8)";
    ctx.lineWidth = 1;

    // Vertical grid lines
    const vLines = 16;
    for (let i = 0; i <= vLines; i++) {
      const x = (width / vLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    const hLines = 8;
    for (let i = 0; i <= hLines; i++) {
      const y = (height / hLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center line (brighter)
    ctx.strokeStyle = "rgba(37, 38, 48, 1)";
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }, []);

  /**
   * Main render loop — runs at 60fps via requestAnimationFrame.
   */
  useEffect(() => {
    if (!isMicInitialized || !isInitialized()) {
      // Cancel any running animation when mic is off
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

      const width = rect.width;
      const height = rect.height;

      // Clear
      ctx.fillStyle = "#0F1016";
      ctx.fillRect(0, 0, width, height);

      // Grid
      drawGrid(ctx, width, height);

      // Get audio data
      const freqData = getFrequencyData();
      const timeData = getTimeDomainData();
      const binCount = getFrequencyBinCount();

      if (freqData && timeData && binCount > 0) {
        const waveColor = getWaveColor();

        // ── Draw frequency spectrum (bottom half) ────────
        const barWidth = width / binCount;
        const halfHeight = height / 2;

        ctx.fillStyle = waveColor + "33";
        for (let i = 0; i < binCount; i++) {
          const barHeight = (freqData[i] / 255) * halfHeight * 0.9;
          const x = i * barWidth;
          const y = height - barHeight;
          ctx.fillRect(x, y, barWidth - 1, barHeight);
        }

        // Frequency envelope line
        ctx.beginPath();
        ctx.strokeStyle = waveColor + "88";
        ctx.lineWidth = 1;
        for (let i = 0; i < binCount; i++) {
          const x = i * barWidth + barWidth / 2;
          const y = height - (freqData[i] / 255) * halfHeight * 0.9;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // ── Draw time-domain waveform (top half) ─────────
        ctx.beginPath();
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = waveColor;
        ctx.shadowBlur = 8;

        const sliceWidth = width / binCount;
        for (let i = 0; i < binCount; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * halfHeight) / 2 + halfHeight / 4;
          const x = i * sliceWidth;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Store audio data in Zustand for other components
        if (frameCount % 10 === 0) {
          updateAudioData(freqData, timeData);
          updateTelemetry(getTelemetryMetrics());
        }
      } else {
        // No data — draw flat line
        ctx.beginPath();
        ctx.strokeStyle = "#00E5FF44";
        ctx.lineWidth = 1;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      frameCount++;
      rafIdRef.current = requestAnimationFrame(render);
    };

    // Start the render loop
    rafIdRef.current = requestAnimationFrame(render);

    // CLEANUP: Cancel rAF on unmount or when mic is deactivated
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isMicInitialized, drawGrid, getWaveColor, updateAudioData, updateTelemetry]);

  return (
    <div className="waveform-container">
      <span className="waveform-label">Acoustic Waveform · 60fps</span>
      <canvas ref={canvasRef} className="waveform-canvas" />
      {!isMicInitialized && (
        <div className="waveform-idle">
          Initialize microphone to begin
          <br />
          <span style={{ fontSize: 10, marginTop: 4, display: "block" }}>
            ◎ Press INIT MIC to start
          </span>
        </div>
      )}
    </div>
  );
}
