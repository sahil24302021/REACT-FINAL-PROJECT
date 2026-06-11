/**
 * Curated training phrases grouped by difficulty level.
 */

const phrases = {
  easy: [
    { id: "water", label: "Water", description: "Classic trap-bath split word" },
    { id: "car", label: "Car", description: "Rhotic vs non-rhotic dialects" },
    { id: "hello", label: "Hello", description: "Common greeting, diphthong variation" },
    { id: "bath", label: "Bath", description: "BATH-TRAP split" },
    { id: "dance", label: "Dance", description: "Vowel fronting variation" },
  ],
  medium: [
    { id: "butter", label: "Butter", description: "T-flapping in American English" },
    { id: "better", label: "Better", description: "Vowel reduction + rhotacization" },
    { id: "about", label: "About", description: "Canadian raising test" },
    { id: "thought", label: "Thought", description: "LOT-THOUGHT merger" },
    { id: "either", label: "Either", description: "Vowel choice variation" },
    { id: "can't", label: "Can't", description: "BATH-TRAP split" },
  ],
  hard: [
    { id: "tomato", label: "Tomato", description: "Multi-vowel dialect marker" },
    { id: "schedule", label: "Schedule", description: "SK vs SH onset variation" },
    { id: "three", label: "Three", description: "TH-fronting detection" },
    { id: "pronunciation", label: "Pronunciation", description: "Complex multi-syllable" },
  ],
};

export const difficultyLabels = {
  easy: "Foundational",
  medium: "Intermediate",
  hard: "Advanced",
};

export const dialectLabels = {
  "en-US": "General American",
  "en-GB": "Received Pronunciation",
  "en-AU": "Australian English",
};

export default phrases;
