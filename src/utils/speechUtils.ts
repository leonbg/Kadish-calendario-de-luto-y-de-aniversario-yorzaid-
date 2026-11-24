/**
 * Comprehensive Liturgical Audio Engine for Sephardic Kaddish.
 * 
 * Features:
 * 1. Dual Audio Modes:
 *    - 'hebrew': Traditional Chazzan voice in Hebrew with forced "kol" correction.
 *    - 'translit': Guided Sephardic Phonetics in Spanish with natural liturgical cadence.
 * 2. Web Audio Keep-Alive & Sacred Acoustic Resonance:
 *    - Keeps mobile browser audio hardware awakened throughout the entire prayer.
 *    - Avoids iOS/Android audio suspension and Chromium garbage collection bugs.
 * 3. Fallback Resilience:
 *    - If a device lacks Hebrew TTS packs, it automatically and gracefully routes
 *      to the Guided Phonetic recitation in Spanish so playback NEVER fails silently.
 * 4. Pacing & Volume Calibration:
 *    - Adjustable speed (0.75x, 1.0x, 1.25x) and full volume scale (0% - 100%).
 */

import { AudioSpeed, AudioVoiceMode, KaddishLine, TranslitTradition } from '../types/kaddish';

export const MALE_CHAZZAN_PITCH = 0.88; // Reverent masculine baritone register

let audioContextInstance: AudioContext | null = null;
let keepAliveOscillator: OscillatorNode | null = null;
let keepAliveGain: GainNode | null = null;
let currentActiveUtterance: SpeechSynthesisUtterance | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesListenerInitialized = false;

// Storage Keys
const STORAGE_VOLUME_KEY = 'kaddish_audio_volume';
const STORAGE_SPEED_KEY = 'kaddish_audio_speed';
const STORAGE_MODE_KEY = 'kaddish_audio_voice_mode';

/**
 * Retrieves the Web Audio Context singleton.
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContextInstance) {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioContextInstance = new AudioCtx();
      }
    } catch {
      // Ignore AudioContext initialization errors
    }
  }
  return audioContextInstance;
}

/**
 * Unlocks audio context on user interaction and keeps the audio session alive
 * so iOS and Android do not sleep the audio engine during prayer recitation.
 */
export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (ctx) {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Initialize silent background carrier to prevent OS audio power-saving cutoff
    if (!keepAliveOscillator) {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.00001; // inaudible
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        keepAliveOscillator = osc;
        keepAliveGain = gain;
      } catch {
        // Ignore audio node creation errors
      }
    }
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }
}

export const playAcousticChime = playDevotionalChime;
export function playDevotionalChime(volume = 1.0): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const vol = Math.max(0.05, Math.min(1.0, volume));

    // Sacred harmonic triad (D4 = 293.66 Hz, A4 = 440 Hz, D5 = 587.33 Hz)
    const notes = [293.66, 440.0, 587.33];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(vol * 0.2, now + idx * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  } catch {
    // Ignore chime synthesis errors
  }
}

/**
 * Initializes and caches available system voices.
 */
export function initSpeechSynthesis(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const loadVoices = () => {
    try {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        cachedVoices = v;
      }
    } catch {
      // Ignore
    }
  };

  loadVoices();

  if (!voicesListenerInitialized) {
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    voicesListenerInitialized = true;
  }
}

/**
 * Returns all available browser voices.
 */
export function getAllVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
    return voices;
  }
  return cachedVoices;
}

/**
 * Finds Hebrew voices available on the device.
 */
export function getHebrewVoices(): SpeechSynthesisVoice[] {
  return getAllVoices().filter((v) => {
    const lang = (v.lang || '').toLowerCase();
    return lang.startsWith('he') || lang.startsWith('iw');
  });
}

/**
 * Checks if a voice has masculine acoustic characteristics.
 */
export function isMaleVoice(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase();
  const femaleKeywords = [
    'hila', 'carmit', 'female', 'mujer', 'woman', 'zira', 'sarah',
    'shoshana', 'monica', 'paulina', 'elena', 'victoria', 'lucia', 'laura', 'helena'
  ];
  if (femaleKeywords.some((kw) => name.includes(kw))) return false;

  const maleKeywords = [
    'asaf', 'assaf', 'david', 'yossi', 'guy', 'male', 'hombre', 'man',
    'jorge', 'carlos', 'diego', 'enrique', 'pablo', 'raul', 'miguel', 'alvaro', 'baritone'
  ];
  if (maleKeywords.some((kw) => name.includes(kw))) return true;

  return false;
}

/**
 * Best male Hebrew voice available.
 */
export function getBestMaleHebrewVoice(): SpeechSynthesisVoice | null {
  const hebrewVoices = getHebrewVoices();
  if (hebrewVoices.length === 0) return null;
  const male = hebrewVoices.find(isMaleVoice);
  if (male) return male;
  return hebrewVoices[0];
}

/**
 * Best Spanish voice for guided Sephardic phonetics.
 */
export function getBestSpanishVoice(): SpeechSynthesisVoice | null {
  const all = getAllVoices();
  if (all.length === 0) return null;

  // 1. Spanish male voice
  const spanishMale = all.find(
    (v) => (v.lang.toLowerCase().startsWith('es') || v.lang.toLowerCase().startsWith('spa')) && isMaleVoice(v)
  );
  if (spanishMale) return spanishMale;

  // 2. Any Spanish voice
  const spanishAny = all.find(
    (v) => v.lang.toLowerCase().startsWith('es') || v.lang.toLowerCase().startsWith('spa')
  );
  if (spanishAny) return spanishAny;

  // 3. Fallback default voice
  return all.find((v) => v.default) || all[0];
}

/**
 * Prepares Hebrew text for speech synthesis:
 * - Enforces "kol" (כּוֹל) pronunciation on all prefixed and standalone instances of כָּל / כֹּל.
 * - Strips parenthesis notes.
 * - Adds natural breathing pauses at commas.
 */
export function prepareHebrewTextForSpeech(hebrewText: string): string {
  if (!hebrewText) return '';
  let text = hebrewText.replace(/[\(\)\[\]]/g, ' ');

  // Prefixed and standalone forms of "kol":
  text = text.replace(/(^|[\s־])מִ?כָּ?ל(?=[,\.\?!־\s]|$)/gu, '$1מִכּוֹל');
  text = text.replace(/(^|[\s־])דְּ?כָּ?ל(?=[,\.\?!־\s]|$)/gu, '$1דְּכוֹל');
  text = text.replace(/(^|[\s־])בְּ?כָּ?ל(?=[,\.\?!־\s]|$)/gu, '$1בְּכוֹל');
  text = text.replace(/(^|[\s־])וְ?כָּ?ל(?=[,\.\?!־\s]|$)/gu, (match, prefix) => {
    return (prefix || '') + (match.includes('ו') ? 'וְכוֹל' : 'כּוֹל');
  });
  text = text.replace(/(^|[\s־])(?:כָּל|כׇל|כֹּל|כַּל|כל)(?=[,\.\?!־\s]|$)/gu, '$1כּוֹל');

  return text.trim();
}

/**
 * Prepares Sephardic transliterated text for Spanish speech synthesis:
 * - Converts "q" to "k" for smooth Spanish TTS pronunciation.
 * - Preserves accented syllables so the speech engine stresses the right liturgical vowel.
 * - Removes apostrophes for fluid articulation.
 */
export function prepareTranslitForSpeech(translitText: string): string {
  if (!translitText) return '';
  return translitText
    .replace(/[\(\)\[\]]/g, ' ')
    .replace(/q/gi, 'k')
    .replace(/'/g, '')
    .trim();
}

// -------------------------------------------------------------
// PERSISTENT SETTINGS
// -------------------------------------------------------------

export function getSavedVolume(): number {
  if (typeof window === 'undefined') return 1.0;
  try {
    const val = localStorage.getItem(STORAGE_VOLUME_KEY);
    if (val !== null) {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0 && num <= 1) return num;
    }
  } catch {
    // Ignore
  }
  return 1.0;
}

export function saveVolume(vol: number): void {
  if (typeof window === 'undefined') return;
  try {
    const clamped = Math.max(0, Math.min(1, vol));
    localStorage.setItem(STORAGE_VOLUME_KEY, clamped.toString());
  } catch {
    // Ignore
  }
}

export function getSavedSpeed(): AudioSpeed {
  if (typeof window === 'undefined') return 1.0;
  try {
    const val = localStorage.getItem(STORAGE_SPEED_KEY);
    if (val === '0.75' || val === '1' || val === '1.0' || val === '1.25') {
      return parseFloat(val) as AudioSpeed;
    }
  } catch {
    // Ignore
  }
  return 1.0;
}

export function saveSpeed(speed: AudioSpeed): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SPEED_KEY, speed.toString());
  } catch {
    // Ignore
  }
}

export function getSavedVoiceMode(): AudioVoiceMode {
  if (typeof window === 'undefined') return 'hebrew';
  try {
    const val = localStorage.getItem(STORAGE_MODE_KEY);
    if (val === 'hebrew' || val === 'translit') {
      return val;
    }
  } catch {
    // Ignore
  }
  return 'hebrew';
}

export function saveVoiceMode(mode: AudioVoiceMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_MODE_KEY, mode);
  } catch {
    // Ignore
  }
}

// -------------------------------------------------------------
// CORE RECITATION RUNNER
// -------------------------------------------------------------

export interface RecitationParams {
  line: KaddishLine;
  isAseret: boolean;
  voiceMode: AudioVoiceMode;
  translitTradition?: TranslitTradition;
  speed: AudioSpeed;
  volume: number;
  onEnd: () => void;
  onError: () => void;
}

/**
 * Resolves the appropriate transliteration string for a Kaddish line
 * according to the active tradition ('sefaradi' vs 'ivris') and Aseret Yemei Teshuva state.
 */
export function resolveLineTranslit(
  line: KaddishLine,
  isAseret: boolean,
  tradition: TranslitTradition = 'sefaradi'
): string {
  if (tradition === 'ivris') {
    if (isAseret && line.translitIvrisAseret) return line.translitIvrisAseret;
    if (line.translitIvris) return line.translitIvris;
  }
  return isAseret && line.translitAseret ? line.translitAseret : line.translit;
}

/**
 * Speaks an individual Kaddish line with full cross-device reliability.
 */
export function reciteKaddishLine({
  line,
  isAseret,
  voiceMode,
  translitTradition = 'sefaradi',
  speed,
  volume,
  onEnd,
  onError,
}: RecitationParams): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError();
    return;
  }

  unlockAudio();

  const hebrewVoice = getBestMaleHebrewVoice();
  const hasHebrewVoice = !!hebrewVoice;

  let textToSpeak = '';
  let lang = 'he-IL';
  let voice: SpeechSynthesisVoice | null = null;
  let effectiveRate = speed === 0.75 ? 0.72 : speed === 1.25 ? 0.98 : 0.84;
  const effectivePitch = MALE_CHAZZAN_PITCH;

  // Decide mode
  if (voiceMode === 'hebrew' && hasHebrewVoice) {
    // Mode 1: Authentic Hebrew
    const rawHebrew = isAseret && line.hebrewAseret ? line.hebrewAseret : line.hebrew;
    textToSpeak = prepareHebrewTextForSpeech(rawHebrew);
    lang = hebrewVoice.lang || 'he-IL';
    voice = hebrewVoice;
  } else {
    // Mode 2: Guided Phonetics in Spanish (Sephardic Ivrit or Ashkenazi Ivris)
    const rawTranslit = resolveLineTranslit(line, isAseret, translitTradition);
    textToSpeak = prepareTranslitForSpeech(rawTranslit);
    const spanishVoice = getBestSpanishVoice();
    lang = spanishVoice?.lang || 'es-ES';
    voice = spanishVoice;
    effectiveRate = speed === 0.75 ? 0.75 : speed === 1.25 ? 1.05 : 0.86;
  }

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = lang;
  if (voice) {
    utterance.voice = voice;
  }
  utterance.pitch = effectivePitch;
  utterance.rate = effectiveRate;
  utterance.volume = Math.max(0.1, Math.min(1.0, volume));

  // Retain global reference to avoid Chromium GC bug
  currentActiveUtterance = utterance;
  (window as unknown as { __kaddishUtteranceRef: SpeechSynthesisUtterance }).__kaddishUtteranceRef = utterance;

  utterance.onend = () => {
    currentActiveUtterance = null;
    onEnd();
  };

  utterance.onerror = (event) => {
    currentActiveUtterance = null;
    if (event.error === 'interrupted' || event.error === 'canceled') {
      return;
    }

    // Auto-fallback: if Hebrew synthesis fails, switch to guided phonetics immediately
    if (voiceMode === 'hebrew' && (event.error === 'language-unavailable' || event.error === 'voice-unavailable')) {
      const rawTranslit = resolveLineTranslit(line, isAseret, translitTradition);
      const fallbackUtterance = new SpeechSynthesisUtterance(prepareTranslitForSpeech(rawTranslit));
      const spVoice = getBestSpanishVoice();
      fallbackUtterance.lang = spVoice?.lang || 'es-ES';
      if (spVoice) fallbackUtterance.voice = spVoice;
      fallbackUtterance.pitch = effectivePitch;
      fallbackUtterance.rate = effectiveRate;
      fallbackUtterance.volume = volume;

      fallbackUtterance.onend = onEnd;
      fallbackUtterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          onError();
        }
      };

      currentActiveUtterance = fallbackUtterance;
      window.speechSynthesis.speak(fallbackUtterance);
      return;
    }

    onError();
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Quick sample generator for phonetic guide and settings modals.
 */
export function playPhoneticSample(
  hebrewText: string,
  translitText: string,
  volume = 1.0,
  forcePhonetic = false
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  unlockAudio();

  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }

  setTimeout(() => {
    const hebrewVoice = getBestMaleHebrewVoice();
    let text = '';
    let lang = 'he-IL';
    let voice: SpeechSynthesisVoice | null = null;

    if (hebrewVoice && !forcePhonetic) {
      text = prepareHebrewTextForSpeech(hebrewText);
      lang = hebrewVoice.lang || 'he-IL';
      voice = hebrewVoice;
    } else {
      text = prepareTranslitForSpeech(translitText);
      const sp = getBestSpanishVoice();
      lang = sp?.lang || 'es-ES';
      voice = sp;
    }

    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    if (voice) u.voice = voice;
    u.pitch = MALE_CHAZZAN_PITCH;
    u.rate = 0.84;
    u.volume = volume;

    currentActiveUtterance = u;
    window.speechSynthesis.speak(u);
  }, 50);
}

/**
 * Creates and configures a SpeechSynthesisUtterance for short liturgical samples.
 */
export function createMaleChazzanUtterance(
  hebrewText: string,
  options?: { pitch?: number; rate?: number; volume?: number }
): SpeechSynthesisUtterance {
  unlockAudio();

  const currentVolume = options?.volume ?? getSavedVolume();
  const hebrewVoice = getBestMaleHebrewVoice();
  let prepared = '';
  let lang = 'he-IL';
  let voiceToUse: SpeechSynthesisVoice | null = null;

  if (hebrewVoice) {
    prepared = prepareHebrewTextForSpeech(hebrewText);
    lang = hebrewVoice.lang || 'he-IL';
    voiceToUse = hebrewVoice;
  } else {
    prepared = prepareTranslitForSpeech(hebrewText);
    const spVoice = getBestSpanishVoice();
    lang = spVoice?.lang || 'es-ES';
    voiceToUse = spVoice;
  }

  const utterance = new SpeechSynthesisUtterance(prepared);
  utterance.lang = lang;
  if (voiceToUse) {
    utterance.voice = voiceToUse;
  }
  utterance.pitch = options?.pitch ?? MALE_CHAZZAN_PITCH;
  utterance.rate = options?.rate ?? 0.84;
  utterance.volume = currentVolume;

  currentActiveUtterance = utterance;
  return utterance;
}
