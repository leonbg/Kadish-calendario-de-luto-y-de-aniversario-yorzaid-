/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import {
  KaddishType,
  DerabananNusaj,
  LanguageView,
  FontSize,
  HebrewFont,
  ThemeMode,
  AseretMode,
  HebrewDateInfo,
  ReadingLayout,
  AudioVoiceMode,
  AudioSpeed,
  TranslitTradition,
  KaddishPrayer,
} from './types/kaddish';
import { KADDISH_PRAYERS } from './data/kaddishData';
import { getHebrewDateInfo } from './utils/hebrewCalendar';
import type { User } from 'firebase/auth';
import type { UpcomingYahrzeitCalculation } from './types/familyMemorial';

import { MinimalNavbar } from './components/MinimalNavbar';
import { ContinuousSiddurView } from './components/ContinuousSiddurView';
import { OfflineIndicator } from './components/OfflineIndicator';

import {
  Flame,
  Share2,
  Check,
  Minimize2,
  BookOpen,
  HardDrive,
  CalendarCheck,
  Languages,
  Printer,
} from 'lucide-react';

// Lazy-load secondary components and modals so the initial entry chunk is ultra-lightweight
const KaddishLineItem = lazy(() =>
  import('./components/KaddishLineItem').then((m) => ({ default: m.KaddishLineItem }))
);
const KaddishTeachingsSection = lazy(() =>
  import('./components/KaddishTeachingsSection').then((m) => ({
    default: m.KaddishTeachingsSection,
  }))
);
const AudioPlayerBar = lazy(() =>
  import('./components/AudioPlayerBar').then((m) => ({ default: m.AudioPlayerBar }))
);
const DerabananCompactHeaderPill = lazy(() =>
  import('./components/DerabananNusajSelector').then((m) => ({
    default: m.DerabananCompactHeaderPill,
  }))
);
const DerabananFirstTimeModal = lazy(() =>
  import('./components/DerabananNusajSelector').then((m) => ({
    default: m.DerabananFirstTimeModal,
  }))
);
const SettingsModal = lazy(() =>
  import('./components/SettingsModal').then((m) => ({ default: m.SettingsModal }))
);
const HalakhaModal = lazy(() =>
  import('./components/HalakhaModal').then((m) => ({ default: m.HalakhaModal }))
);
const PronunciationModal = lazy(() =>
  import('./components/PronunciationModal').then((m) => ({ default: m.PronunciationModal }))
);
const WorkspaceModal = lazy(() =>
  import('./components/WorkspaceModal').then((m) => ({ default: m.WorkspaceModal }))
);
const KaddishCalculatorModal = lazy(() =>
  import('./components/KaddishCalculatorModal').then((m) => ({
    default: m.KaddishCalculatorModal,
  }))
);
const APKProtocolModal = lazy(() =>
  import('./components/APKProtocolModal').then((m) => ({ default: m.APKProtocolModal }))
);
const FamilyMemorialCalendarModal = lazy(() =>
  import('./components/FamilyMemorialCalendarModal').then((m) => ({
    default: m.FamilyMemorialCalendarModal,
  }))
);
const PrintFormatModal = lazy(() =>
  import('./components/PrintFormatModal').then((m) => ({ default: m.PrintFormatModal }))
);

function safeGetStorage(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore storage errors in restricted iframes/modes
  }
}

function ensureOptionalHebrewFont(font: HebrewFont): void {
  if (typeof document === 'undefined') return;
  if (font !== 'david' && font !== 'assistant') return;
  const linkId = `gfont-${font}`;
  if (document.getElementById(linkId)) return;
  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.crossOrigin = 'anonymous';
  link.href =
    font === 'david'
      ? 'https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap'
      : 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&display=swap';
  document.head.appendChild(link);
}

const DeferredTeachingsSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shouldMount, setShouldMount] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldMount) return;
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShouldMount(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: '260px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldMount]);

  if (!shouldMount) {
    return (
      <div ref={sentinelRef} className="mt-6 py-4 text-center">
        <button
          type="button"
          onClick={() => setShouldMount(true)}
          className="text-xs font-medium text-amber-800 dark:text-amber-300 hover:underline"
        >
          Cargar enseñanzas y significados del Kadish
        </button>
      </div>
    );
  }

  return <Suspense fallback={null}>{children}</Suspense>;
};

export default function App() {
  const [currentKaddish, setCurrentKaddish] = useState<KaddishType>(() => {
    return safeGetStorage('kaddish_selected', 'yatom') as KaddishType;
  });

  const [derabananNusaj, setDerabananNusaj] = useState<DerabananNusaj>(() => {
    return safeGetStorage(
      'derabanan_nusaj_selected',
      'sefaradi_standard'
    ) as DerabananNusaj;
  });

  const [languageView, setLanguageView] = useState<LanguageView>(() => {
    return safeGetStorage('kaddish_lang_view', 'hebrew') as LanguageView;
  });

  const [translitTradition, setTranslitTradition] = useState<TranslitTradition>(() => {
    return safeGetStorage('kaddish_translit_tradition', 'sefaradi') as TranslitTradition;
  });

  const [readingLayout, setReadingLayout] = useState<ReadingLayout>(() => {
    return safeGetStorage('kaddish_reading_layout', 'fluent') as ReadingLayout;
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return safeGetStorage('kaddish_font_size', 'md') as FontSize;
  });

  const [hebrewFont, setHebrewFont] = useState<HebrewFont>(() => {
    return safeGetStorage('kaddish_hebrew_font', 'frank') as HebrewFont;
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    return safeGetStorage('kaddish_theme', 'parchment') as ThemeMode;
  });

  const [aseretMode, setAseretMode] = useState<AseretMode>(() => {
    return safeGetStorage('kaddish_aseret_mode', 'auto') as AseretMode;
  });

  const [showComparison, setShowComparison] = useState<boolean>(() => {
    return safeGetStorage('kaddish_show_comparison', 'false') === 'true';
  });

  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Modals (Calculator & Family Calendar persisted in sessionStorage so native date pickers or reloads never close them)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHalakhaOpen, setIsHalakhaOpen] = useState(false);
  const [isPronunciationOpen, setIsPronunciationOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('kaddish_calculator_open') === 'true';
    } catch {
      return false;
    }
  });
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);
  const [isFamilyCalendarOpen, setIsFamilyCalendarOpen] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('kaddish_family_calendar_open') === 'true';
    } catch {
      return false;
    }
  });
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDerabananFirstTimeOpen, setIsDerabananFirstTimeOpen] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem('kaddish_calculator_open', String(isCalculatorOpen));
    } catch {
      // ignore
    }
  }, [isCalculatorOpen]);

  useEffect(() => {
    try {
      sessionStorage.setItem('kaddish_family_calendar_open', String(isFamilyCalendarOpen));
    } catch {
      // ignore
    }
  }, [isFamilyCalendarOpen]);

  // Handle URL shortcuts on mount and clean up any stale dev-sw asynchronously after paint
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const kaddishParam = params.get('kaddish');
    if (
      kaddishParam === 'yatom' ||
      kaddishParam === 'derabanan' ||
      kaddishParam === 'chatzi' ||
      kaddishParam === 'shalem'
    ) {
      setCurrentKaddish(kaddishParam);
    }
    if (params.get('view') === 'calculator') {
      setIsCalculatorOpen(true);
    }

    const timer = window.setTimeout(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => {
            for (const reg of registrations) {
              if (reg.active?.scriptURL.includes('dev-sw.js')) {
                reg.unregister();
              }
            }
          })
          .catch(() => {});
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentKaddish === 'derabanan') {
      const hasSeenIntro = safeGetStorage('derabanan_intro_seen', '');
      if (!hasSeenIntro) {
        setIsDerabananFirstTimeOpen(true);
      }
    }
  }, [currentKaddish]);

  // Family Memorials Proximity Monitor — skips downloading @hebcal/core entirely if user has 0 saved memorials
  const [upcomingAnniversaries, setUpcomingAnniversaries] = useState<
    UpcomingYahrzeitCalculation[]
  >([]);

  const refreshUpcomingAnniversaries = useCallback(
    async (checkNotifications = false) => {
      try {
        const rawSaved = safeGetStorage('kaddish_family_memorials', '');
        if (!rawSaved || rawSaved === '[]') {
          setUpcomingAnniversaries([]);
          return;
        }
        const { loadFamilyMemorials, calculateNextYahrzeit } = await import(
          './utils/familyMemorialUtils'
        );
        const loaded = loadFamilyMemorials();
        if (loaded.length === 0) {
          setUpcomingAnniversaries([]);
          return;
        }
        const today = new Date();
        const upcoming = loaded
          .map((item) => calculateNextYahrzeit(item, today))
          .filter((c) => c.isWithin30Days)
          .sort((a, b) => a.daysRemaining - b.daysRemaining);
        setUpcomingAnniversaries(upcoming);

        if (checkNotifications) {
          const { loadNotificationSettings, runAutomatedYahrzeitCheck } =
            await import('./utils/yahrzeitNotificationService');
          const settings = loadNotificationSettings();
          if (settings.enablePhoneNotifications) {
            runAutomatedYahrzeitCheck(loaded, settings).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Deferred memorial calculation skipped:', err);
      }
    },
    []
  );

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(() => refreshUpcomingAnniversaries(true), {
        timeout: 1200,
      });
      return () => win.cancelIdleCallback?.(idleId);
    }
    const timer = window.setTimeout(() => {
      refreshUpcomingAnniversaries(true);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [refreshUpcomingAnniversaries]);

  const urgentAnniversaries = useMemo(() => {
    return upcomingAnniversaries.filter((c) => c.daysRemaining <= 7);
  }, [upcomingAnniversaries]);

  // Google Workspace User State (loaded only on user interaction with Workspace / Calendar)
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Calendar State & Simulation
  const [simulatedDate, setSimulatedDate] = useState<Date | null>(null);
  const [currentHebrewDate, setCurrentHebrewDate] = useState<HebrewDateInfo>(() => {
    return getHebrewDateInfo(new Date());
  });

  const [copySuccess, setCopySuccess] = useState(false);

  // Comprehensive Audio State
  const [playingLineIndex, setPlayingLineIndex] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showPlayerBar, setShowPlayerBar] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const [audioVolume, setAudioVolume] = useState<number>(() => {
    const num = parseFloat(safeGetStorage('kaddish_audio_volume', '1.0'));
    return Number.isNaN(num) ? 1.0 : Math.max(0, Math.min(1, num));
  });
  const [audioSpeed, setAudioSpeed] = useState<AudioSpeed>(() => {
    const num = parseFloat(safeGetStorage('kaddish_audio_speed', '1.0'));
    return num === 0.75 || num === 1.25 ? num : 1.0;
  });
  const [audioVoiceMode, setAudioVoiceMode] = useState<AudioVoiceMode>(() => {
    return safeGetStorage('kaddish_audio_voice_mode', 'hebrew') === 'translit'
      ? 'translit'
      : 'hebrew';
  });

  const isPlayingRef = useRef<boolean>(false);
  const speechEngineRef = useRef<typeof import('./utils/speechUtils') | null>(null);

  const loadSpeechEngine = useCallback(async () => {
    if (!speechEngineRef.current) {
      const mod = await import('./utils/speechUtils');
      mod.initSpeechSynthesis();
      speechEngineRef.current = mod;
    }
    return speechEngineRef.current;
  }, []);

  // Handlers for Audio Settings (persisted directly without importing speechUtils)
  const handleAudioVolumeChange = useCallback((newVol: number) => {
    setAudioVolume(newVol);
    safeSetStorage('kaddish_audio_volume', newVol.toString());
  }, []);

  const handleAudioSpeedChange = useCallback((newSpd: AudioSpeed) => {
    setAudioSpeed(newSpd);
    safeSetStorage('kaddish_audio_speed', newSpd.toString());
  }, []);

  const handleAudioVoiceModeChange = useCallback((newMode: AudioVoiceMode) => {
    setAudioVoiceMode(newMode);
    safeSetStorage('kaddish_audio_voice_mode', newMode);
  }, []);

  // Persist preference changes only after mount (skips 9 redundant writes on first render)
  const hasPersistedMountRef = useRef(false);
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    ensureOptionalHebrewFont(hebrewFont);

    if (!hasPersistedMountRef.current) {
      hasPersistedMountRef.current = true;
      return;
    }
    safeSetStorage('kaddish_selected', currentKaddish);
    safeSetStorage('kaddish_lang_view', languageView);
    safeSetStorage('kaddish_translit_tradition', translitTradition);
    safeSetStorage('kaddish_reading_layout', readingLayout);
    safeSetStorage('kaddish_font_size', fontSize);
    safeSetStorage('kaddish_hebrew_font', hebrewFont);
    safeSetStorage('kaddish_theme', theme);
    safeSetStorage('kaddish_aseret_mode', aseretMode);
    safeSetStorage('kaddish_show_comparison', String(showComparison));
    safeSetStorage('derabanan_nusaj_selected', derabananNusaj);
  }, [
    currentKaddish,
    languageView,
    translitTradition,
    readingLayout,
    fontSize,
    hebrewFont,
    theme,
    aseretMode,
    showComparison,
    derabananNusaj,
  ]);

  // Recalculate Hebrew date only when simulatedDate actually changes after initial mount
  const isInitialMountRef = useRef(true);
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      if (!simulatedDate) return;
    }
    const targetDate = simulatedDate || new Date();
    setCurrentHebrewDate(getHebrewDateInfo(targetDate));
  }, [simulatedDate]);

  // Determine whether Aseret Yemei Teshuva variants should be shown
  const isAseretEffective: boolean = useMemo(() => {
    if (aseretMode === 'enabled') return true;
    if (aseretMode === 'disabled') return false;
    return currentHebrewDate.isAseretYemeiTeshuva;
  }, [aseretMode, currentHebrewDate.isAseretYemeiTeshuva]);

  // Load non-default Derabanan Nusaj variants lazily only when selected
  const [customDerabananPrayer, setCustomDerabananPrayer] = useState<KaddishPrayer | null>(null);
  useEffect(() => {
    if (currentKaddish !== 'derabanan' || derabananNusaj === 'sefaradi_standard') {
      setCustomDerabananPrayer(null);
      return;
    }
    let cancelled = false;
    import('./data/derabananVariants')
      .then(({ getDerabananPrayerForNusaj }) => {
        if (!cancelled) {
          setCustomDerabananPrayer(
            getDerabananPrayerForNusaj(derabananNusaj, isAseretEffective)
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentKaddish, derabananNusaj, isAseretEffective]);

  const activePrayer = useMemo(() => {
    if (currentKaddish === 'derabanan' && customDerabananPrayer) {
      return customDerabananPrayer;
    }
    return KADDISH_PRAYERS[currentKaddish];
  }, [currentKaddish, customDerabananPrayer]);

  const stopAudio = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlayingAudio(false);
    setPlayingLineIndex(null);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Stop audio on prayer change
  useEffect(() => {
    stopAudio();
  }, [currentKaddish, stopAudio]);

  const playVerseAtIndex = useCallback(
    async (index: number) => {
      if (!isPlayingRef.current) return;
      const lines = activePrayer.lines;
      if (index < 0 || index >= lines.length) {
        stopAudio();
        return;
      }

      setPlayingLineIndex(index);
      const line = lines[index];
      const engine = await loadSpeechEngine();
      if (!isPlayingRef.current) return;

      engine.reciteKaddishLine({
        line,
        isAseret: isAseretEffective,
        voiceMode: audioVoiceMode,
        translitTradition,
        speed: audioSpeed,
        volume: audioVolume,
        onEnd: () => {
          if (!isPlayingRef.current) return;
          setTimeout(() => {
            playVerseAtIndex(index + 1);
          }, 280);
        },
        onError: () => {
          stopAudio();
        },
      });
    },
    [
      activePrayer.lines,
      isAseretEffective,
      audioVoiceMode,
      translitTradition,
      audioSpeed,
      audioVolume,
      loadSpeechEngine,
      stopAudio,
    ]
  );

  const handleTogglePlay = useCallback(async () => {
    setShowPlayerBar(true);
    const engine = await loadSpeechEngine();
    engine.unlockAudio();

    if (isPlayingRef.current) {
      stopAudio();
    } else {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }

      engine.playDevotionalChime(audioVolume);

      isPlayingRef.current = true;
      setIsPlayingAudio(true);

      const startIndex = playingLineIndex !== null ? playingLineIndex : 0;
      setTimeout(() => {
        if (isPlayingRef.current) {
          playVerseAtIndex(startIndex);
        }
      }, 350);
    }
  }, [audioVolume, loadSpeechEngine, playVerseAtIndex, playingLineIndex, stopAudio]);

  const handleSelectLineToPlay = useCallback(
    async (index: number) => {
      setShowPlayerBar(true);
      const engine = await loadSpeechEngine();
      engine.unlockAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
        isPlayingRef.current = true;
        setIsPlayingAudio(true);
        playVerseAtIndex(index);
      }
    },
    [loadSpeechEngine, playVerseAtIndex]
  );

  const handlePrevVerse = useCallback(async () => {
    const engine = await loadSpeechEngine();
    engine.unlockAudio();
    const cur = playingLineIndex ?? 0;
    const nextIdx = Math.max(0, cur - 1);
    if (isPlayingAudio) {
      if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
      isPlayingRef.current = true;
      playVerseAtIndex(nextIdx);
    } else {
      setPlayingLineIndex(nextIdx);
    }
  }, [isPlayingAudio, loadSpeechEngine, playVerseAtIndex, playingLineIndex]);

  const handleNextVerse = useCallback(async () => {
    const engine = await loadSpeechEngine();
    engine.unlockAudio();
    const cur = playingLineIndex ?? 0;
    const nextIdx = Math.min(activePrayer.lines.length - 1, cur + 1);
    if (isPlayingAudio) {
      if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
      isPlayingRef.current = true;
      playVerseAtIndex(nextIdx);
    } else {
      setPlayingLineIndex(nextIdx);
    }
  }, [activePrayer.lines.length, isPlayingAudio, loadSpeechEngine, playVerseAtIndex, playingLineIndex]);

  const handleSelectKaddish = useCallback(
    (k: KaddishType) => {
      stopAudio();
      setCurrentKaddish(k);
    },
    [stopAudio]
  );

  const handleOpenSettings = useCallback(() => setIsSettingsOpen(true), []);
  const handleOpenHalakha = useCallback(() => setIsHalakhaOpen(true), []);
  const handleOpenPronunciation = useCallback(() => setIsPronunciationOpen(true), []);
  const handleOpenWorkspace = useCallback(() => setIsWorkspaceOpen(true), []);
  const handleOpenCalculator = useCallback(() => setIsCalculatorOpen(true), []);
  const handleOpenApkGuide = useCallback(() => setIsApkGuideOpen(true), []);
  const handleOpenFamilyCalendar = useCallback(() => setIsFamilyCalendarOpen(true), []);
  const handleOpenPrintModal = useCallback(() => setIsPrintModalOpen(true), []);
  const handleToggleZenMode = useCallback(() => setIsZenMode((z) => !z), []);

  const handleCopyPrayerText = useCallback(() => {
    const isIvris = translitTradition === 'ivris';
    const formatted = activePrayer.lines
      .map((line) => {
        const heb = isAseretEffective && line.hebrewAseret ? line.hebrewAseret : line.hebrew;
        const respHeb = line.inlineResponse ? ` ${line.inlineResponse.hebrew}` : '';
        const tr = isIvris
          ? (isAseretEffective && line.translitIvrisAseret ? line.translitIvrisAseret : (line.translitIvris || line.translit))
          : (isAseretEffective && line.translitAseret ? line.translitAseret : line.translit);
        const respTr = line.inlineResponse
          ? ` ${isIvris && line.inlineResponse.translitIvris ? line.inlineResponse.translitIvris : line.inlineResponse.translit}`
          : '';
        return `${heb}${respHeb}\n${tr}${respTr}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(formatted).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, [activePrayer.lines, isAseretEffective, translitTradition]);

  const handleSaveCalculatedHazkara = (hazkara: {
    name: string;
    hebrewName?: string;
    dateGregorian?: string;
    dateHebrew?: string;
    relation?: string;
    notes?: string;
  }) => {
    try {
      const saved = localStorage.getItem('kaddish_local_hazkarot');
      const list = saved ? JSON.parse(saved) : [];
      const item = {
        id: Date.now().toString(),
        ...hazkara,
      };
      list.unshift(item);
      localStorage.setItem('kaddish_local_hazkarot', JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const themeClass =
    theme === 'parchment'
      ? 'theme-parchment bg-[#fdfbf7] text-stone-900'
      : theme === 'dark'
      ? 'dark theme-dark bg-stone-950 text-stone-100'
      : 'theme-light bg-stone-50 text-stone-900';

  const currentPlayingLine =
    playingLineIndex !== null ? activePrayer.lines[playingLineIndex] : null;

  return (
    <div
      className={`min-h-screen transition-colors duration-150 flex flex-col ${themeClass} ${
        showPlayerBar ? 'pb-24 sm:pb-28' : ''
      }`}
    >
      {/* 1. Minimal Top Navigation Bar */}
      {!isZenMode && (
        <MinimalNavbar
          currentKaddish={currentKaddish}
          onSelectKaddish={handleSelectKaddish}
          languageView={languageView}
          onLanguageViewChange={setLanguageView}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          translitTradition={translitTradition}
          onTranslitTraditionChange={setTranslitTradition}
          aseretMode={aseretMode}
          onAseretModeChange={setAseretMode}
          isAseretEffective={isAseretEffective}
          isPlayingAll={isPlayingAudio}
          onTogglePlayAll={handleTogglePlay}
          onOpenSettings={handleOpenSettings}
          onOpenHalakha={handleOpenHalakha}
          onOpenPronunciationGuide={handleOpenPronunciation}
          onOpenWorkspace={handleOpenWorkspace}
          onOpenCalculator={handleOpenCalculator}
          onOpenApkGuide={handleOpenApkGuide}
          onOpenFamilyCalendar={handleOpenFamilyCalendar}
          onOpenPrintModal={handleOpenPrintModal}
          upcomingAnniversariesCount={upcomingAnniversaries.length}
          isZenMode={isZenMode}
          onToggleZenMode={handleToggleZenMode}
          currentHebrewDate={currentHebrewDate}
        />
      )}

      {/* Urgent Yahrzeit Alert Banner for Next 7 Days */}
      {!isZenMode && urgentAnniversaries.length > 0 && (
        <div className="max-w-5xl mx-auto w-full px-2.5 sm:px-5 pt-1.5">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-600 text-white shrink-0">
                <Flame className="w-3.5 h-3.5 fill-current" />
              </span>
              <span className="font-bold text-amber-950 dark:text-amber-200 tabular-nums">
                {urgentAnniversaries[0].daysRemaining === 0
                  ? `¡Hoy es el Yurzaid de ${urgentAnniversaries[0].relative.name}!`
                  : urgentAnniversaries[0].daysRemaining === 1
                  ? `¡Mañana es el Yurzaid de ${urgentAnniversaries[0].relative.name}!`
                  : `Yurzaid próximo: ${urgentAnniversaries[0].relative.name} (en ${urgentAnniversaries[0].daysRemaining} días)`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsFamilyCalendarOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition-colors whitespace-nowrap shrink-0"
            >
              Ver Calendario
            </button>
          </div>
        </div>
      )}

      {/* Floating Exit Button for Zen Mode */}
      {isZenMode && (
        <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 bg-stone-900/90 text-white rounded-lg p-1 border border-stone-700 backdrop-blur-md shadow-xl">
          <button
            type="button"
            onClick={() => setIsZenMode(false)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors whitespace-nowrap shrink-0"
            title="Salir del modo pantalla completa"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Salir de Enfoque</span>
          </button>
        </div>
      )}

      {/* 2. Main Dedicated Prayer Canvas */}
      <main className="max-w-5xl mx-auto w-full px-2.5 sm:px-5 py-1.5 flex-1 flex flex-col justify-start">
        {/* Clean Editorial Prayer Header Bar (Unboxed metadata per Argon Zero-Pill rule) */}
        <div className="flex items-center justify-between gap-2 py-1.5 px-1 mb-1.5 border-b border-stone-200 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif font-bold text-sm sm:text-base text-amber-800 dark:text-amber-300" dir="rtl">
              {activePrayer.titleHebrew}
            </span>
            <span aria-hidden="true" className="text-stone-400">·</span>
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              {activePrayer.titleSpanish}
            </span>
            <span aria-hidden="true" className="text-stone-400">·</span>
            {currentKaddish === 'derabanan' ? (
              <Suspense fallback={null}>
                <DerabananCompactHeaderPill
                  selectedNusaj={derabananNusaj}
                  onChangeNusaj={setDerabananNusaj}
                />
              </Suspense>
            ) : (
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {translitTradition === 'ivris' ? 'Dicción Ivris (Asquenazí)' : 'Nusaj Sefaradí (Ivrit)'}
              </span>
            )}
            {isAseretEffective && (
              <>
                <span aria-hidden="true" className="text-stone-400">·</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <Flame className="w-3 h-3 text-amber-600" />
                  <span>Aseret Yemei Teshuvá</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Guía Fonética Ivrit vs Ivris */}
            <button
              type="button"
              onClick={() => setIsPronunciationOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-amber-300 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors text-[11px] font-medium whitespace-nowrap shrink-0"
              title="Guía y audio comparativo: Ivrit (Sefaradí) vs Ivris (Asquenazí)"
            >
              <Languages className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="hidden sm:inline">Guía Ivrit / Ivris</span>
            </button>

            {/* Calculadora de Yurzaid y Kadish */}
            <button
              type="button"
              onClick={() => setIsCalculatorOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-stone-300 dark:border-stone-700 bg-white/90 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-[11px] font-medium whitespace-nowrap shrink-0"
              title="Calcular período de Kadish (11 y 12 meses) y Yurzaid"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="hidden md:inline">Calculadora Yurzaid</span>
            </button>

            {/* Imprimir / Laminar */}
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-stone-300 dark:border-stone-700 bg-white/90 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-[11px] font-medium whitespace-nowrap shrink-0"
              title="Imprimir en formato billetera, media carta o carta"
            >
              <Printer className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="hidden lg:inline">Imprimir</span>
            </button>

            {/* Google Workspace Direct Button */}
            <button
              type="button"
              onClick={() => setIsWorkspaceOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-stone-300 dark:border-stone-700 bg-white/90 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-[11px] font-medium whitespace-nowrap shrink-0"
              title="Exportar a Google Docs y sincronizar con Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              <span className="hidden lg:inline">Drive / Docs</span>
            </button>

            {/* Halakha Guide */}
            <button
              type="button"
              onClick={() => setIsHalakhaOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-stone-300 dark:border-stone-700 bg-white/90 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-amber-50/60 dark:hover:bg-stone-700 transition-colors text-[11px] font-medium whitespace-nowrap shrink-0"
              title="Guía de movimientos y reverencias"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="hidden sm:inline">Reverencias</span>
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyPrayerText}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-stone-300 dark:border-stone-700 bg-white/90 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-[11px] font-medium whitespace-nowrap shrink-0"
              title="Copiar texto del Kadish"
            >
              {copySuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-700 dark:text-green-400 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
                  <span className="hidden sm:inline">Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* The Prayer Text Itself: Clean, Fluent, Uninterrupted */}
        {readingLayout === 'fluent' ? (
          <ContinuousSiddurView
            prayer={activePrayer}
            languageView={languageView}
            fontSize={fontSize}
            hebrewFont={hebrewFont}
            isAseretEffective={isAseretEffective}
            translitTradition={translitTradition}
            playingLineId={currentPlayingLine?.id}
            autoScroll={autoScroll}
            onSelectLine={handleSelectLineToPlay}
          />
        ) : (
          <Suspense fallback={null}>
            <div className="space-y-1.5 sm:space-y-2 py-0.5">
              {activePrayer.lines.map((line, idx) => (
                <KaddishLineItem
                  key={line.id}
                  line={line}
                  lineNumber={idx + 1}
                  languageView={languageView}
                  fontSize={fontSize}
                  hebrewFont={hebrewFont}
                  isAseretEffective={isAseretEffective}
                  showComparison={showComparison}
                  translitTradition={translitTradition}
                  isPlaying={currentPlayingLine?.id === line.id}
                  autoScroll={autoScroll}
                  onSelectLine={() => handleSelectLineToPlay(idx)}
                />
              ))}
            </div>
          </Suspense>
        )}

        {/* 3. Deep Meanings, Sages & Traditions Section (Deferred until near viewport) */}
        {!isZenMode && (
          <DeferredTeachingsSection>
            <KaddishTeachingsSection />
          </DeferredTeachingsSection>
        )}
      </main>

      <Suspense fallback={null}>
        {/* 3. Floating Audio Player Bar */}
        {showPlayerBar && (
          <AudioPlayerBar
            isOpen={showPlayerBar}
            isPlaying={isPlayingAudio}
            currentLine={currentPlayingLine}
            currentIndex={playingLineIndex ?? 0}
            totalLines={activePrayer.lines.length}
            voiceMode={audioVoiceMode}
            translitTradition={translitTradition}
            speed={audioSpeed}
            volume={audioVolume}
            autoScroll={autoScroll}
            isAseretEffective={isAseretEffective}
            onTogglePlay={handleTogglePlay}
            onPrevious={handlePrevVerse}
            onNext={handleNextVerse}
            onClose={() => {
              stopAudio();
              setShowPlayerBar(false);
            }}
            onVoiceModeChange={handleAudioVoiceModeChange}
            onSpeedChange={handleAudioSpeedChange}
            onVolumeChange={handleAudioVolumeChange}
            onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
          />
        )}

        {/* 4. Calculadora de Kadish y Yurzaid Modal */}
        {isCalculatorOpen && (
          <KaddishCalculatorModal
            isOpen={isCalculatorOpen}
            onClose={() => setIsCalculatorOpen(false)}
            onSaveHazkara={handleSaveCalculatedHazkara}
            googleUser={googleUser}
            googleToken={googleToken}
            onOpenWorkspace={() => {
              setIsWorkspaceOpen(true);
            }}
          />
        )}

        {/* 5. Google Workspace Modal (Drive, Docs & Calendar) */}
        {isWorkspaceOpen && (
          <WorkspaceModal
            isOpen={isWorkspaceOpen}
            onClose={() => setIsWorkspaceOpen(false)}
            activePrayer={activePrayer}
            isAseret={isAseretEffective}
            user={googleUser}
            token={googleToken}
            onUserChange={(u, t) => {
              setGoogleUser(u);
              setGoogleToken(t);
            }}
          />
        )}

        {/* 6. Consolidated Settings & Tools Modal */}
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            currentHebrewDate={currentHebrewDate}
            aseretMode={aseretMode}
            onAseretModeChange={setAseretMode}
            isAseretEffective={isAseretEffective}
            theme={theme}
            onThemeChange={setTheme}
            hebrewFont={hebrewFont}
            onHebrewFontChange={setHebrewFont}
            translitTradition={translitTradition}
            onTranslitTraditionChange={setTranslitTradition}
            showInstructions={showInstructions}
            onShowInstructionsChange={setShowInstructions}
            readingLayout={readingLayout}
            onReadingLayoutChange={setReadingLayout}
            onSimulateDate={(d) => setSimulatedDate(d)}
            simulatedDateActive={simulatedDate !== null}
            onResetToToday={() => setSimulatedDate(null)}
            audioVolume={audioVolume}
            onAudioVolumeChange={handleAudioVolumeChange}
            onOpenApkGuide={() => setIsApkGuideOpen(true)}
          />
        )}

        {/* 7. Dedicated Halakha & Reverences Guide Modal */}
        {isHalakhaOpen && (
          <HalakhaModal
            isOpen={isHalakhaOpen}
            onClose={() => setIsHalakhaOpen(false)}
          />
        )}

        {/* 8. Dedicated Ivrit vs Ivris Pronunciation Guide Modal */}
        {isPronunciationOpen && (
          <PronunciationModal
            isOpen={isPronunciationOpen}
            onClose={() => setIsPronunciationOpen(false)}
            translitTradition={translitTradition}
            onTranslitTraditionChange={setTranslitTradition}
          />
        )}

        {/* 9. APK Protocols & PWA Diagnostics Modal */}
        {isApkGuideOpen && (
          <APKProtocolModal
            isOpen={isApkGuideOpen}
            onClose={() => setIsApkGuideOpen(false)}
          />
        )}

        {/* 10. Family Memorials & Mini Calendar Modal */}
        {isFamilyCalendarOpen && (
          <FamilyMemorialCalendarModal
            isOpen={isFamilyCalendarOpen}
            onClose={() => {
              setIsFamilyCalendarOpen(false);
              refreshUpcomingAnniversaries(false);
            }}
            googleUser={googleUser}
            googleToken={googleToken}
            onOpenWorkspace={() => {
              setIsWorkspaceOpen(true);
            }}
            onSelectKaddishPrayer={(type) => {
              setCurrentKaddish(type);
            }}
          />
        )}

        {/* 11. Print & Laminate Formats Modal (Wallet Card, Half Letter, Full Letter) */}
        {isPrintModalOpen && (
          <PrintFormatModal
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            activePrayer={activePrayer}
            isAseret={isAseretEffective}
            translitTradition={translitTradition}
          />
        )}

        {/* 13. Onboarding Modal First Time Derabanan is Opened */}
        {isDerabananFirstTimeOpen && (
          <DerabananFirstTimeModal
            isOpen={isDerabananFirstTimeOpen}
            selectedNusaj={derabananNusaj}
            onConfirm={(selected) => {
              setDerabananNusaj(selected);
              safeSetStorage('derabanan_intro_seen', 'true');
              setIsDerabananFirstTimeOpen(false);
            }}
            onClose={() => {
              safeSetStorage('derabanan_intro_seen', 'true');
              setIsDerabananFirstTimeOpen(false);
            }}
          />
        )}
      </Suspense>

      {/* 12. Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}
