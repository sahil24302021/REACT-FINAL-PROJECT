/**
 * Speech Engine — Web Speech API wrapper
 *
 * Uses webkitSpeechRecognition to detect spoken words and return
 * confidence scores. Supports dialect switching via language culture tags.
 *
 * DESIGN DECISION: Before starting recognition, the caller must
 * pause the audio analyser (audioEngine.pauseAnalyser()) to avoid
 * mic conflict. After recognition completes, caller resumes it.
 */

/**
 * Start speech recognition session.
 *
 * @param {string} lang - Language tag: 'en-US', 'en-GB', or 'en-AU'
 * @param {Object} callbacks
 * @param {Function} callbacks.onResult - (transcript, confidence) => void
 * @param {Function} callbacks.onEnd - () => void
 * @param {Function} callbacks.onError - (error) => void
 * @returns {Object|null} recognition instance (call .stop() to manually end)
 */
export function startRecognition(lang, callbacks = {}) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    callbacks.onError?.({
      error: "not-supported",
      message:
        "Web Speech API is not supported in this browser. Please use Chrome.",
    });
    return null;
  }

  const recognition = new SpeechRecognition();

  // Configure recognition
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;

  recognition.onresult = (event) => {
    const results = event.results;
    if (results.length > 0) {
      const result = results[results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      callbacks.onResult?.({
        transcript,
        confidence,
        isFinal,
        alternatives: Array.from(result).map((alt) => ({
          transcript: alt.transcript,
          confidence: alt.confidence,
        })),
      });
    }
  };

  recognition.onend = () => {
    callbacks.onEnd?.();
  };

  recognition.onerror = (event) => {
    callbacks.onError?.({
      error: event.error,
      message: getErrorMessage(event.error),
    });
  };

  recognition.onspeechstart = () => {
    callbacks.onSpeechStart?.();
  };

  recognition.onspeechend = () => {
    callbacks.onSpeechEnd?.();
  };

  recognition.start();
  return recognition;
}

/**
 * Check if Web Speech API is supported.
 */
export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Human-readable error messages for speech recognition errors.
 */
function getErrorMessage(errorCode) {
  const messages = {
    "not-allowed":
      "Microphone access was denied. Please allow microphone permissions.",
    "no-speech": "No speech was detected. Please try speaking louder.",
    "audio-capture":
      "No microphone was found. Please ensure a mic is connected.",
    network: "A network error occurred during speech recognition.",
    aborted: "Speech recognition was aborted.",
    "language-not-supported":
      "The selected language is not supported for speech recognition.",
    "service-not-allowed": "Speech recognition service is not allowed.",
  };
  return messages[errorCode] || `Speech recognition error: ${errorCode}`;
}
