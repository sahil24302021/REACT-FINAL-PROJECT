/**
 * Audio Engine — Web Audio API integration
 *
 * Handles microphone capture, FFT analysis, and Pearson Correlation.
 *
 * DESIGN DECISIONS:
 * 1. initMicrophone() is ONLY called from user click (Init Mic button)
 *    to comply with browser autoplay policy.
 * 2. pauseAnalyser() / resumeAnalyser() enable sequential phasing
 *    with SpeechRecognition to avoid mic conflict.
 * 3. Target waveform for correlation comes from pre-computed
 *    referenceFormants in ipaDict.js.
 */

let audioContext = null;
let analyserNode = null;
let mediaStream = null;
let sourceNode = null;
let isPaused = false;

const FFT_SIZE = 256;
const SMOOTHING = 0.8;

/**
 * Initialize microphone — must be called from a user gesture (click handler).
 */
export async function initMicrophone() {
  if (audioContext && audioContext.state !== "closed") {
    return { success: true, alreadyInitialized: true };
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = FFT_SIZE;
    analyserNode.smoothingTimeConstant = SMOOTHING;

    sourceNode = audioContext.createMediaStreamSource(mediaStream);
    sourceNode.connect(analyserNode);

    return { success: true, sampleRate: audioContext.sampleRate };
  } catch (err) {
    console.error("Microphone init failed:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Get frequency domain data (FFT magnitudes).
 * Returns null if analyser is paused or not initialized.
 */
export function getFrequencyData() {
  if (!analyserNode || isPaused) return null;
  const data = new Uint8Array(analyserNode.frequencyBinCount);
  analyserNode.getByteFrequencyData(data);
  return data;
}

/**
 * Get time domain data (waveform).
 * Returns null if analyser is paused or not initialized.
 */
export function getTimeDomainData() {
  if (!analyserNode || isPaused) return null;
  const data = new Uint8Array(analyserNode.frequencyBinCount);
  analyserNode.getByteTimeDomainData(data);
  return data;
}

/**
 * Get frequency bin count.
 */
export function getFrequencyBinCount() {
  return analyserNode ? analyserNode.frequencyBinCount : 0;
}

/**
 * Pause the analyser — called before starting speech recognition
 * to avoid mic conflict.
 */
export function pauseAnalyser() {
  isPaused = true;
  if (audioContext && audioContext.state === "running") {
    audioContext.suspend();
  }
}

/**
 * Resume the analyser — called after speech recognition completes.
 */
export function resumeAnalyser() {
  isPaused = false;
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  }
}

/**
 * Pearson Correlation Coefficient
 *
 * Compares user's live FFT snapshot (X) against the pre-computed
 * reference formant signature (Y) from ipaDict.js.
 *
 * r = Σ(Xi - X̄)(Yi - Ȳ) / √[Σ(Xi - X̄)² · Σ(Yi - Ȳ)²]
 *
 * @param {Uint8Array|Float32Array} userWaveform - Live FFT frequency data
 * @param {Float32Array} targetWaveform - Reference formant signature
 * @returns {number} Correlation coefficient (-1 to 1)
 */
export function calculateCorrelation(userWaveform, targetWaveform) {
  if (!userWaveform || !targetWaveform) return 0;

  const n = Math.min(userWaveform.length, targetWaveform.length);
  if (n === 0) return 0;

  // Normalize user waveform to 0-1 range
  const userNorm = new Float32Array(n);
  let userMax = 0;
  for (let i = 0; i < n; i++) {
    if (userWaveform[i] > userMax) userMax = userWaveform[i];
  }
  if (userMax > 0) {
    for (let i = 0; i < n; i++) {
      userNorm[i] = userWaveform[i] / userMax;
    }
  }

  // Calculate means
  let meanX = 0, meanY = 0;
  for (let i = 0; i < n; i++) {
    meanX += userNorm[i];
    meanY += targetWaveform[i];
  }
  meanX /= n;
  meanY /= n;

  // Calculate Pearson correlation
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  for (let i = 0; i < n; i++) {
    const dx = userNorm[i] - meanX;
    const dy = targetWaveform[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * Estimate dominant formant frequency from FFT data.
 * Finds the frequency bin with highest energy.
 */
export function estimateFormantHz() {
  if (!analyserNode || !audioContext || isPaused) return 0;

  const data = new Uint8Array(analyserNode.frequencyBinCount);
  analyserNode.getByteFrequencyData(data);

  let maxIndex = 0;
  let maxValue = 0;
  // Skip bin 0 (DC offset) and very low frequencies
  for (let i = 2; i < data.length; i++) {
    if (data[i] > maxValue) {
      maxValue = data[i];
      maxIndex = i;
    }
  }

  // Convert bin index to frequency
  const binWidth = audioContext.sampleRate / analyserNode.fftSize;
  return Math.round(maxIndex * binWidth);
}

/**
 * Get current audio processing metrics for telemetry HUD.
 */
export function getTelemetryMetrics() {
  if (!audioContext || !analyserNode) {
    return { formantHz: 0, bufferLatency: 0, bytesProcessed: 0 };
  }

  return {
    formantHz: estimateFormantHz(),
    bufferLatency: Math.round(
      (analyserNode.fftSize / audioContext.sampleRate) * 1000 * 100
    ) / 100,
    bytesProcessed: analyserNode.fftSize * 4, // 4 bytes per float32 sample
    sampleRate: audioContext.sampleRate,
  };
}

/**
 * Check if the audio engine is initialized and running.
 */
export function isInitialized() {
  return audioContext !== null && audioContext.state !== "closed";
}

/**
 * Check if the analyser is currently paused.
 */
export function isAnalyserPaused() {
  return isPaused;
}

/**
 * Cleanup — stop all tracks and close AudioContext.
 */
export function cleanup() {
  isPaused = false;
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
  }
  audioContext = null;
  analyserNode = null;
}
