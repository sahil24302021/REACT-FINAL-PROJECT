/**
 * IPA Dictionary — maps phrases to phonemes and reference formant signatures per dialect.
 *
 * referenceFormants: pre-computed arrays of expected frequency amplitudes (128 bins)
 * representing the "ideal" pronunciation for each dialect. These serve as the TARGET
 * waveform for Pearson Correlation calculations.
 *
 * The formant arrays are synthetic approximations modeled after typical F1/F2 formant
 * frequencies for each phoneme cluster in the given dialect.
 */

// Helper: generate a synthetic reference formant signature
// Models expected spectral energy distribution for a phoneme cluster
function generateFormantSignature(f1, f2, f3, spread = 15) {
  const bins = 128;
  const sampleRate = 44100;
  const binWidth = sampleRate / (bins * 2);
  const signature = new Float32Array(bins);

  const formants = [f1, f2, f3];
  for (let i = 0; i < bins; i++) {
    const freq = i * binWidth;
    let amplitude = 0;
    for (const f of formants) {
      // Gaussian peak centered at each formant frequency
      const diff = (freq - f) / spread;
      amplitude += Math.exp(-0.5 * diff * diff);
    }
    // Add natural spectral rolloff
    amplitude *= Math.exp(-freq / 8000);
    signature[i] = amplitude;
  }

  // Normalize to 0-1
  const max = Math.max(...signature);
  if (max > 0) {
    for (let i = 0; i < bins; i++) {
      signature[i] /= max;
    }
  }
  return signature;
}

// Blend multiple formant signatures for multi-phoneme phrases
function blendSignatures(...signatures) {
  const bins = 128;
  const result = new Float32Array(bins);
  for (const sig of signatures) {
    for (let i = 0; i < bins; i++) {
      result[i] += sig[i];
    }
  }
  const max = Math.max(...result);
  if (max > 0) {
    for (let i = 0; i < bins; i++) {
      result[i] /= max;
    }
  }
  return result;
}

const ipaDict = {
  water: {
    "en-US": {
      text: "water",
      ipa: "ˈwɑtɚ",
      phonemes: ["w", "ɑ", "t", "ɚ"],
      // General American: open back unrounded [ɑ], rhotacized schwa [ɚ]
      referenceFormants: blendSignatures(
        generateFormantSignature(300, 600, 2200),   // w
        generateFormantSignature(730, 1090, 2440),   // ɑ
        generateFormantSignature(400, 1600, 2600),   // t (burst)
        generateFormantSignature(500, 1300, 1600)    // ɚ
      ),
    },
    "en-GB": {
      text: "water",
      ipa: "ˈwɔːtə",
      phonemes: ["w", "ɔː", "t", "ə"],
      // Received Pronunciation: open-mid back rounded [ɔː], schwa [ə]
      referenceFormants: blendSignatures(
        generateFormantSignature(300, 600, 2200),
        generateFormantSignature(500, 700, 2500),
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(500, 1500, 2500)
      ),
    },
    "en-AU": {
      text: "water",
      ipa: "ˈwoːtə",
      phonemes: ["w", "oː", "t", "ə"],
      referenceFormants: blendSignatures(
        generateFormantSignature(300, 600, 2200),
        generateFormantSignature(450, 750, 2400),
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(500, 1500, 2500)
      ),
    },
  },
  butter: {
    "en-US": {
      text: "butter",
      ipa: "ˈbʌtɚ",
      phonemes: ["b", "ʌ", "t", "ɚ"],
      referenceFormants: blendSignatures(
        generateFormantSignature(200, 800, 2300),
        generateFormantSignature(640, 1190, 2390),
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(500, 1300, 1600)
      ),
    },
    "en-GB": {
      text: "butter",
      ipa: "ˈbʌtə",
      phonemes: ["b", "ʌ", "t", "ə"],
      referenceFormants: blendSignatures(
        generateFormantSignature(200, 800, 2300),
        generateFormantSignature(640, 1190, 2390),
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(500, 1500, 2500)
      ),
    },
    "en-AU": {
      text: "butter",
      ipa: "ˈbatə",
      phonemes: ["b", "a", "t", "ə"],
      referenceFormants: blendSignatures(
        generateFormantSignature(200, 800, 2300),
        generateFormantSignature(750, 1200, 2600),
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(500, 1500, 2500)
      ),
    },
  },
  dance: {
    "en-US": {
      text: "dance",
      ipa: "dæns",
      phonemes: ["d", "æ", "n", "s"],
      referenceFormants: blendSignatures(
        generateFormantSignature(300, 1700, 2600),
        generateFormantSignature(660, 1720, 2410),
        generateFormantSignature(300, 1450, 2500),
        generateFormantSignature(200, 1800, 4000)
      ),
    },
    "en-GB": {
      text: "dance",
      ipa: "dɑːns",
      phonemes: ["d", "ɑː", "n", "s"],
      referenceFormants: blendSignatures(
        generateFormantSignature(300, 1700, 2600),
        generateFormantSignature(730, 1090, 2440),
        generateFormantSignature(300, 1450, 2500),
        generateFormantSignature(200, 1800, 4000)
      ),
    },
    "en-AU": {
      text: "dance",
      ipa: "dæːns",
      phonemes: ["d", "æː", "n", "s"],
      referenceFormants: blendSignatures(
        generateFormantSignature(300, 1700, 2600),
        generateFormantSignature(690, 1700, 2400),
        generateFormantSignature(300, 1450, 2500),
        generateFormantSignature(200, 1800, 4000)
      ),
    },
  },
  bath: {
    "en-US": {
      text: "bath",
      ipa: "bæθ",
      phonemes: ["b", "æ", "θ"],
      referenceFormants: blendSignatures(
        generateFormantSignature(200, 800, 2300),
        generateFormantSignature(660, 1720, 2410),
        generateFormantSignature(250, 1450, 4500)
      ),
    },
    "en-GB": {
      text: "bath",
      ipa: "bɑːθ",
      phonemes: ["b", "ɑː", "θ"],
      referenceFormants: blendSignatures(
        generateFormantSignature(200, 800, 2300),
        generateFormantSignature(730, 1090, 2440),
        generateFormantSignature(250, 1450, 4500)
      ),
    },
    "en-AU": {
      text: "bath",
      ipa: "bɐːθ",
      phonemes: ["b", "ɐː", "θ"],
      referenceFormants: blendSignatures(
        generateFormantSignature(200, 800, 2300),
        generateFormantSignature(700, 1250, 2450),
        generateFormantSignature(250, 1450, 4500)
      ),
    },
  },
  better: {
    "en-US": {
      text: "better",
      ipa: "ˈbɛtɚ",
      phonemes: ["b", "ɛ", "t", "ɚ"],
      referenceFormants: blendSignatures(
        generateFormantSignature(200, 800, 2300),
        generateFormantSignature(530, 1840, 2480),
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(500, 1300, 1600)
      ),
    },
    "en-GB": {
      text: "better",
      ipa: "ˈbɛtə",
      phonemes: ["b", "ɛ", "t", "ə"],
      referenceFormants: blendSignatures(
        generateFormantSignature(200, 800, 2300),
        generateFormantSignature(530, 1840, 2480),
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(500, 1500, 2500)
      ),
    },
    "en-AU": {
      text: "better",
      ipa: "ˈbetə",
      phonemes: ["b", "e", "t", "ə"],
      referenceFormants: blendSignatures(
        generateFormantSignature(200, 800, 2300),
        generateFormantSignature(440, 2000, 2550),
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(500, 1500, 2500)
      ),
    },
  },
  thought: {
    "en-US": {
      text: "thought",
      ipa: "θɔːt",
      phonemes: ["θ", "ɔː", "t"],
      referenceFormants: blendSignatures(
        generateFormantSignature(250, 1450, 4500),
        generateFormantSignature(500, 700, 2500),
        generateFormantSignature(400, 1600, 2600)
      ),
    },
    "en-GB": {
      text: "thought",
      ipa: "θɔːt",
      phonemes: ["θ", "ɔː", "t"],
      referenceFormants: blendSignatures(
        generateFormantSignature(250, 1450, 4500),
        generateFormantSignature(500, 700, 2500),
        generateFormantSignature(400, 1600, 2600)
      ),
    },
    "en-AU": {
      text: "thought",
      ipa: "θoːt",
      phonemes: ["θ", "oː", "t"],
      referenceFormants: blendSignatures(
        generateFormantSignature(250, 1450, 4500),
        generateFormantSignature(450, 750, 2400),
        generateFormantSignature(400, 1600, 2600)
      ),
    },
  },
  car: {
    "en-US": {
      text: "car",
      ipa: "kɑɹ",
      phonemes: ["k", "ɑ", "ɹ"],
      referenceFormants: blendSignatures(
        generateFormantSignature(350, 1800, 3000),
        generateFormantSignature(730, 1090, 2440),
        generateFormantSignature(420, 1300, 1600)
      ),
    },
    "en-GB": {
      text: "car",
      ipa: "kɑː",
      phonemes: ["k", "ɑː"],
      referenceFormants: blendSignatures(
        generateFormantSignature(350, 1800, 3000),
        generateFormantSignature(730, 1090, 2440)
      ),
    },
    "en-AU": {
      text: "car",
      ipa: "kɐː",
      phonemes: ["k", "ɐː"],
      referenceFormants: blendSignatures(
        generateFormantSignature(350, 1800, 3000),
        generateFormantSignature(700, 1250, 2450)
      ),
    },
  },
  "about": {
    "en-US": {
      text: "about",
      ipa: "əˈbaʊt",
      phonemes: ["ə", "b", "aʊ", "t"],
      referenceFormants: blendSignatures(
        generateFormantSignature(500, 1500, 2500),
        generateFormantSignature(200, 800, 2300),
        generateFormantSignature(700, 1100, 2500),
        generateFormantSignature(400, 1600, 2600)
      ),
    },
    "en-GB": {
      text: "about",
      ipa: "əˈbaʊt",
      phonemes: ["ə", "b", "aʊ", "t"],
      referenceFormants: blendSignatures(
        generateFormantSignature(500, 1500, 2500),
        generateFormantSignature(200, 800, 2300),
        generateFormantSignature(700, 1100, 2500),
        generateFormantSignature(400, 1600, 2600)
      ),
    },
    "en-AU": {
      text: "about",
      ipa: "əˈbæɔt",
      phonemes: ["ə", "b", "æɔ", "t"],
      referenceFormants: blendSignatures(
        generateFormantSignature(500, 1500, 2500),
        generateFormantSignature(200, 800, 2300),
        generateFormantSignature(660, 900, 2400),
        generateFormantSignature(400, 1600, 2600)
      ),
    },
  },
  "hello": {
    "en-US": {
      text: "hello",
      ipa: "hɛˈloʊ",
      phonemes: ["h", "ɛ", "l", "oʊ"],
      referenceFormants: blendSignatures(
        generateFormantSignature(200, 1200, 2800),
        generateFormantSignature(530, 1840, 2480),
        generateFormantSignature(350, 1100, 2800),
        generateFormantSignature(450, 750, 2400)
      ),
    },
    "en-GB": {
      text: "hello",
      ipa: "hɛˈləʊ",
      phonemes: ["h", "ɛ", "l", "əʊ"],
      referenceFormants: blendSignatures(
        generateFormantSignature(200, 1200, 2800),
        generateFormantSignature(530, 1840, 2480),
        generateFormantSignature(350, 1100, 2800),
        generateFormantSignature(480, 800, 2450)
      ),
    },
    "en-AU": {
      text: "hello",
      ipa: "hɛˈləʉ",
      phonemes: ["h", "ɛ", "l", "əʉ"],
      referenceFormants: blendSignatures(
        generateFormantSignature(200, 1200, 2800),
        generateFormantSignature(530, 1840, 2480),
        generateFormantSignature(350, 1100, 2800),
        generateFormantSignature(460, 1100, 2300)
      ),
    },
  },
  "three": {
    "en-US": {
      text: "three",
      ipa: "θɹiː",
      phonemes: ["θ", "ɹ", "iː"],
      referenceFormants: blendSignatures(
        generateFormantSignature(250, 1450, 4500),
        generateFormantSignature(420, 1300, 1600),
        generateFormantSignature(270, 2290, 3010)
      ),
    },
    "en-GB": {
      text: "three",
      ipa: "θɹiː",
      phonemes: ["θ", "ɹ", "iː"],
      referenceFormants: blendSignatures(
        generateFormantSignature(250, 1450, 4500),
        generateFormantSignature(420, 1300, 1600),
        generateFormantSignature(270, 2290, 3010)
      ),
    },
    "en-AU": {
      text: "three",
      ipa: "θɹiː",
      phonemes: ["θ", "ɹ", "iː"],
      referenceFormants: blendSignatures(
        generateFormantSignature(250, 1450, 4500),
        generateFormantSignature(420, 1300, 1600),
        generateFormantSignature(270, 2290, 3010)
      ),
    },
  },
  "schedule": {
    "en-US": {
      text: "schedule",
      ipa: "ˈskɛdʒuːl",
      phonemes: ["s", "k", "ɛ", "dʒ", "uː", "l"],
      referenceFormants: blendSignatures(
        generateFormantSignature(200, 1800, 4000),
        generateFormantSignature(350, 1800, 3000),
        generateFormantSignature(530, 1840, 2480),
        generateFormantSignature(300, 1700, 2800),
        generateFormantSignature(300, 870, 2240),
        generateFormantSignature(350, 1100, 2800)
      ),
    },
    "en-GB": {
      text: "schedule",
      ipa: "ˈʃɛdjuːl",
      phonemes: ["ʃ", "ɛ", "dj", "uː", "l"],
      referenceFormants: blendSignatures(
        generateFormantSignature(250, 1800, 3500),
        generateFormantSignature(530, 1840, 2480),
        generateFormantSignature(300, 1700, 2800),
        generateFormantSignature(300, 870, 2240),
        generateFormantSignature(350, 1100, 2800)
      ),
    },
    "en-AU": {
      text: "schedule",
      ipa: "ˈʃɛdjuːl",
      phonemes: ["ʃ", "ɛ", "dj", "uː", "l"],
      referenceFormants: blendSignatures(
        generateFormantSignature(250, 1800, 3500),
        generateFormantSignature(530, 1840, 2480),
        generateFormantSignature(300, 1700, 2800),
        generateFormantSignature(300, 870, 2240),
        generateFormantSignature(350, 1100, 2800)
      ),
    },
  },
  "tomato": {
    "en-US": {
      text: "tomato",
      ipa: "təˈmeɪtoʊ",
      phonemes: ["t", "ə", "m", "eɪ", "t", "oʊ"],
      referenceFormants: blendSignatures(
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(500, 1500, 2500),
        generateFormantSignature(300, 1100, 2500),
        generateFormantSignature(400, 2100, 2700),
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(450, 750, 2400)
      ),
    },
    "en-GB": {
      text: "tomato",
      ipa: "təˈmɑːtəʊ",
      phonemes: ["t", "ə", "m", "ɑː", "t", "əʊ"],
      referenceFormants: blendSignatures(
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(500, 1500, 2500),
        generateFormantSignature(300, 1100, 2500),
        generateFormantSignature(730, 1090, 2440),
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(480, 800, 2450)
      ),
    },
    "en-AU": {
      text: "tomato",
      ipa: "təˈmɐːtəʉ",
      phonemes: ["t", "ə", "m", "ɐː", "t", "əʉ"],
      referenceFormants: blendSignatures(
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(500, 1500, 2500),
        generateFormantSignature(300, 1100, 2500),
        generateFormantSignature(700, 1250, 2450),
        generateFormantSignature(400, 1600, 2600),
        generateFormantSignature(460, 1100, 2300)
      ),
    },
  },
  "can't": {
    "en-US": {
      text: "can't",
      ipa: "kænt",
      phonemes: ["k", "æ", "n", "t"],
      referenceFormants: blendSignatures(
        generateFormantSignature(350, 1800, 3000),
        generateFormantSignature(660, 1720, 2410),
        generateFormantSignature(300, 1450, 2500),
        generateFormantSignature(400, 1600, 2600)
      ),
    },
    "en-GB": {
      text: "can't",
      ipa: "kɑːnt",
      phonemes: ["k", "ɑː", "n", "t"],
      referenceFormants: blendSignatures(
        generateFormantSignature(350, 1800, 3000),
        generateFormantSignature(730, 1090, 2440),
        generateFormantSignature(300, 1450, 2500),
        generateFormantSignature(400, 1600, 2600)
      ),
    },
    "en-AU": {
      text: "can't",
      ipa: "kɐːnt",
      phonemes: ["k", "ɐː", "n", "t"],
      referenceFormants: blendSignatures(
        generateFormantSignature(350, 1800, 3000),
        generateFormantSignature(700, 1250, 2450),
        generateFormantSignature(300, 1450, 2500),
        generateFormantSignature(400, 1600, 2600)
      ),
    },
  },
  "either": {
    "en-US": {
      text: "either",
      ipa: "ˈiːðɚ",
      phonemes: ["iː", "ð", "ɚ"],
      referenceFormants: blendSignatures(
        generateFormantSignature(270, 2290, 3010),
        generateFormantSignature(300, 1500, 3500),
        generateFormantSignature(500, 1300, 1600)
      ),
    },
    "en-GB": {
      text: "either",
      ipa: "ˈaɪðə",
      phonemes: ["aɪ", "ð", "ə"],
      referenceFormants: blendSignatures(
        generateFormantSignature(700, 1200, 2600),
        generateFormantSignature(300, 1500, 3500),
        generateFormantSignature(500, 1500, 2500)
      ),
    },
    "en-AU": {
      text: "either",
      ipa: "ˈɑeðə",
      phonemes: ["ɑe", "ð", "ə"],
      referenceFormants: blendSignatures(
        generateFormantSignature(730, 1300, 2500),
        generateFormantSignature(300, 1500, 3500),
        generateFormantSignature(500, 1500, 2500)
      ),
    },
  },
  "pronunciation": {
    "en-US": {
      text: "pronunciation",
      ipa: "pɹəˌnʌnsiˈeɪʃən",
      phonemes: ["p", "ɹ", "ə", "n", "ʌ", "n", "s", "i", "eɪ", "ʃ", "ə", "n"],
      referenceFormants: blendSignatures(
        generateFormantSignature(250, 1200, 2600),
        generateFormantSignature(420, 1300, 1600),
        generateFormantSignature(500, 1500, 2500),
        generateFormantSignature(300, 1450, 2500),
        generateFormantSignature(640, 1190, 2390),
        generateFormantSignature(200, 1800, 4000),
        generateFormantSignature(270, 2290, 3010),
        generateFormantSignature(400, 2100, 2700),
        generateFormantSignature(250, 1800, 3500),
        generateFormantSignature(500, 1500, 2500)
      ),
    },
    "en-GB": {
      text: "pronunciation",
      ipa: "pɹəˌnʌnsiˈeɪʃən",
      phonemes: ["p", "ɹ", "ə", "n", "ʌ", "n", "s", "i", "eɪ", "ʃ", "ə", "n"],
      referenceFormants: blendSignatures(
        generateFormantSignature(250, 1200, 2600),
        generateFormantSignature(420, 1300, 1600),
        generateFormantSignature(500, 1500, 2500),
        generateFormantSignature(300, 1450, 2500),
        generateFormantSignature(640, 1190, 2390),
        generateFormantSignature(200, 1800, 4000),
        generateFormantSignature(270, 2290, 3010),
        generateFormantSignature(400, 2100, 2700),
        generateFormantSignature(250, 1800, 3500),
        generateFormantSignature(500, 1500, 2500)
      ),
    },
    "en-AU": {
      text: "pronunciation",
      ipa: "pɹəˌnɐnsiˈæɪʃən",
      phonemes: ["p", "ɹ", "ə", "n", "ɐ", "n", "s", "i", "æɪ", "ʃ", "ə", "n"],
      referenceFormants: blendSignatures(
        generateFormantSignature(250, 1200, 2600),
        generateFormantSignature(420, 1300, 1600),
        generateFormantSignature(500, 1500, 2500),
        generateFormantSignature(300, 1450, 2500),
        generateFormantSignature(700, 1250, 2450),
        generateFormantSignature(200, 1800, 4000),
        generateFormantSignature(270, 2290, 3010),
        generateFormantSignature(660, 1500, 2700),
        generateFormantSignature(250, 1800, 3500),
        generateFormantSignature(500, 1500, 2500)
      ),
    },
  },
};

export default ipaDict;
