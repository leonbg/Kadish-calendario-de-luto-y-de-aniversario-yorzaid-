import React, { useState } from 'react';
import {
  Calendar,
  Volume2,
  BookOpen,
  Settings,
  X,
  Sparkles,
  Flame,
  Clock,
  Sun,
  Moon,
  Type,
  Info,
  Play,
  RotateCcw,
  UserCheck,
  Volume1,
  VolumeX,
  Bell,
} from 'lucide-react';
import {
  HebrewDateInfo,
  AseretMode,
  ThemeMode,
  HebrewFont,
  ReadingLayout,
  LanguageView,
  TranslitTradition,
} from '../types/kaddish';
import { MIZRAHI_PRONUNCIATION_GUIDE } from '../data/kaddishData';
import {
  createMaleChazzanUtterance,
  getBestMaleHebrewVoice,
  playAcousticChime,
} from '../utils/speechUtils';
import { getSampleAseretDate, getSampleOrdinaryDate } from '../utils/hebrewCalendar';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHebrewDate: HebrewDateInfo;
  aseretMode: AseretMode;
  onAseretModeChange: (mode: AseretMode) => void;
  isAseretEffective: boolean;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  hebrewFont: HebrewFont;
  onHebrewFontChange: (font: HebrewFont) => void;
  translitTradition?: TranslitTradition;
  onTranslitTraditionChange?: (tradition: TranslitTradition) => void;
  showInstructions: boolean;
  onShowInstructionsChange: (show: boolean) => void;
  readingLayout: ReadingLayout;
  onReadingLayoutChange: (layout: ReadingLayout) => void;
  onSimulateDate: (d: Date) => void;
  simulatedDateActive: boolean;
  onResetToToday: () => void;
  audioVolume: number;
  onAudioVolumeChange: (vol: number) => void;
  onOpenApkGuide?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentHebrewDate,
  aseretMode,
  onAseretModeChange,
  isAseretEffective,
  theme,
  onThemeChange,
  hebrewFont,
  onHebrewFontChange,
  translitTradition = 'sefaradi',
  onTranslitTraditionChange,
  showInstructions,
  onShowInstructionsChange,
  readingLayout,
  onReadingLayoutChange,
  onSimulateDate,
  simulatedDateActive,
  onResetToToday,
  audioVolume,
  onAudioVolumeChange,
  onOpenApkGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'phonetics' | 'display' | 'halakha'>('calendar');
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [testingVolume, setTestingVolume] = useState(false);

  if (!isOpen) return null;

  const playSoundSample = (textHebrew: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      alert('La síntesis de voz no está disponible.');
      return;
    }
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    setPlayingIndex(index);
    setTimeout(() => {
      const u = createMaleChazzanUtterance(textHebrew, { volume: audioVolume });
      u.onend = () => setPlayingIndex(null);
      u.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          setPlayingIndex(null);
        }
      };
      window.speechSynthesis.speak(u);
    }, 50);
  };

  const handleTestVolume = () => {
    if (!('speechSynthesis' in window)) {
      alert('La síntesis de voz no está disponible.');
      return;
    }
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    setTestingVolume(true);
    // 1. Play warm acoustic bell chime to test speaker hardware output
    playAcousticChime(audioVolume);

    // 2. Play opening blessing phrase at current volume
    setTimeout(() => {
      const u = createMaleChazzanUtterance('יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא', { volume: audioVolume });
      u.onend = () => setTestingVolume(false);
      u.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          setTestingVolume(false);
        }
      };
      window.speechSynthesis.speak(u);
    }, 380);
  };

  const samplePhrases = [
    { label: 'Apertura', hebrew: 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא', translit: 'Yitgadal veyitqaddash shemeh Rabba' },
    { label: 'Cláusula Mizrají', hebrew: 'וְיַצְמַח פֻּרְקָנֵהּ וִיקָרֵב מְשִׁיחֵהּ', translit: 'veyatsmaj purqaneh viqarev meshijeh' },
    { label: 'Respuesta Central', hebrew: 'יְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא', translit: "Yehe shemeh Rabba mevaraj le'alam ul'almei 'almaya" },
    { label: 'Pronunciación «Kol» (Todo)', hebrew: 'לְעֵלָּא מִן כָּל בִּרְכָתָא, וְעַל כָּל יִשְׂרָאֵל', translit: "le'ela min kol birjata, ve'al kol Yisrael (voz: kol)" },
    { label: 'Variante Aseret', hebrew: 'לְעֵלָּא וּלְעֵלָּא מִכָּל בִּרְכָתָא', translit: "Le'ela ul'e'ela mi-kol birjata" },
    { label: 'Cierre de Paz', hebrew: 'עוֹשֶׂה הַשָּׁלוֹם בִּמְרוֹמָיו', translit: "'Oseh HaShalom bimromav" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl sm:max-w-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-amber-50/70 dark:bg-amber-950/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Configuración y Herramientas del Kadish
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Personaliza calendario, fonética, audio, tamaño y diseño litúrgico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-2xs transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: 2x2 grid on mobile, 4-col on desktop - never cut in half */}
        <div className="p-2 sm:p-2.5 bg-stone-100/80 dark:bg-stone-900/80 border-b border-stone-200 dark:border-stone-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-xs border border-amber-400/50 dark:border-amber-700/70 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Calendario Hebreo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('phonetics')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'phonetics'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-xs border border-amber-400/50 dark:border-amber-700/70 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Audio & Fonética</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('display')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'display'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-xs border border-amber-400/50 dark:border-amber-700/70 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Visualización</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('halakha')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'halakha'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-xs border border-amber-400/50 dark:border-amber-700/70 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Leyes y Guía</span>
            </button>
          </div>
        </div>

        {/* Tab Body with full height scrolling */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-stone-700 dark:text-stone-300 flex-1 min-h-0">
          {/* TAB 1: CALENDAR & ASERET */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              {/* Date Card */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-amber-900 dark:text-amber-400">
                    {simulatedDateActive ? 'Fecha Simulada' : 'Fecha Hebrea Actual'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                    Hebcal Activo
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {currentHebrewDate.formattedDateLatin}
                  </div>
                  <div className="text-base font-serif font-bold text-amber-800 dark:text-amber-300" dir="rtl">
                    {currentHebrewDate.formattedDateHebrew}
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px]">
                  <span>Estado Aseret Yemei Teshuvá:</span>
                  <span className={`font-bold ${isAseretEffective ? 'text-amber-800 dark:text-amber-300' : 'text-stone-500'}`}>
                    {isAseretEffective ? '● Activo (Variantes visibles)' : '○ Inactivo (Año Regular)'}
                  </span>
                </div>
                {simulatedDateActive && (
                  <button
                    onClick={onResetToToday}
                    className="text-[11px] text-amber-800 dark:text-amber-400 font-bold hover:underline"
                  >
                    ← Volver a la fecha real de hoy
                  </button>
                )}
              </div>

              {/* Mode Options */}
              <div className="space-y-2">
                <label className="font-bold uppercase tracking-wider text-[10px] text-stone-500">
                  Modo de activación de variantes
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => onAseretModeChange('auto')}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      aseretMode === 'auto'
                        ? 'border-amber-500 bg-amber-500/10 font-semibold text-stone-900 dark:text-stone-100'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">Automático según Calendario Hebreo</div>
                      <div className="text-[11px] text-stone-500">Activa del 1 al 10 de Tishrei (Rosh Hashaná a Yom Kipur).</div>
                    </div>
                    {aseretMode === 'auto' && <span className="text-amber-700 font-bold">✓</span>}
                  </button>

                  <button
                    onClick={() => onAseretModeChange('enabled')}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      aseretMode === 'enabled'
                        ? 'border-amber-500 bg-amber-500/10 font-semibold text-stone-900 dark:text-stone-100'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">Siempre Mostrar Variantes de Aseret</div>
                      <div className="text-[11px] text-stone-500">Muestra siempre «Le'ela ul'e'ela mi-kol» y «Oseh HaShalom».</div>
                    </div>
                    {aseretMode === 'enabled' && <span className="text-amber-700 font-bold">✓</span>}
                  </button>

                  <button
                    onClick={() => onAseretModeChange('disabled')}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      aseretMode === 'disabled'
                        ? 'border-amber-500 bg-amber-500/10 font-semibold text-stone-900 dark:text-stone-100'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">Ocultar Variantes (Texto de Todo el Año)</div>
                      <div className="text-[11px] text-stone-500">Siempre versión regular estándar.</div>
                    </div>
                    {aseretMode === 'disabled' && <span className="text-amber-700 font-bold">✓</span>}
                  </button>
                </div>
              </div>

              {/* Simulation */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-1.5">
                <div className="font-bold text-[10px] text-stone-500 uppercase tracking-wider">
                  Probar comportamiento:
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSimulateDate(getSampleAseretDate())}
                    className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-900 dark:text-amber-300 font-medium"
                  >
                    Simular 5 Tishrei (Aseret)
                  </button>
                  <button
                    onClick={() => onSimulateDate(getSampleOrdinaryDate())}
                    className="px-2.5 py-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium"
                  >
                    Simular 15 Nisán (Año Regular)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO & PHONETICS */}
          {activeTab === 'phonetics' && (
            <div className="space-y-4">
              {/* Transliteration Tradition Selector (Sefaradí / Ivrit vs Asquenazí / Ivris) */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span>Tradición de Fonética y Transliteración</span>
                      <span className="text-[10px] bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded">
                        {translitTradition === 'ivris' ? 'IVRIS' : 'IVRIT'}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-stone-400">
                      Selecciona cómo se muestran y leen las transliteraciones fonéticas del Kadish.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onTranslitTraditionChange?.('sefaradi')}
                    className={`text-left p-2.5 rounded-xl border transition-all ${
                      translitTradition === 'sefaradi'
                        ? 'border-amber-500 bg-white dark:bg-stone-800 ring-2 ring-amber-500/30 font-semibold'
                        : 'border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-900 dark:text-amber-200">
                        Sefaradí / Israelí (Ivrit)
                      </span>
                      {translitTradition === 'sefaradi' && (
                        <span className="text-amber-600 text-xs font-bold">✓ Activo</span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                      <strong>Tav = «T»</strong> (<em>Yitgadal</em>, <em>beit Yisrael</em>, <em>Amén</em>, <em>Yitbaraj</em>).
                      Tradición de Oriente Medio, Jerusalén y comunidades hispano-sefardíes.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onTranslitTraditionChange?.('ivris')}
                    className={`text-left p-2.5 rounded-xl border transition-all ${
                      translitTradition === 'ivris'
                        ? 'border-amber-500 bg-white dark:bg-stone-800 ring-2 ring-amber-500/30 font-semibold'
                        : 'border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-900 dark:text-amber-200">
                        Asquenazí (Ivris)
                      </span>
                      {translitTradition === 'ivris' && (
                        <span className="text-amber-600 text-xs font-bold">✓ Activo</span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                      <strong>Tav sin daguesh = «S»</strong> (<em>Yisgadal</em>, <em>béis Yisroel</em>, <em>Oméin</em>, <em>Yisborach</em>).
                      Tradición clásica de Europa Central, Lituania, Polonia y Alemania.
                    </p>
                  </button>
                </div>
              </div>

              {/* Volume Calibration & Acoustic Test Card */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300">
                      {audioVolume > 0.6 ? (
                        <Volume2 className="w-4 h-4" />
                      ) : audioVolume > 0.1 ? (
                        <Volume1 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        Volumen de Recitación Litúrgica
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-400">
                        Nivel de salida: <strong className="text-amber-800 dark:text-amber-300">{Math.round(audioVolume * 100)}%</strong>
                        {audioVolume >= 0.99 ? ' (Máximo)' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1">
                    {[
                      { label: '50%', val: 0.5 },
                      { label: '80%', val: 0.8 },
                      { label: '100%', val: 1.0 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => onAudioVolumeChange(preset.val)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                          Math.abs(audioVolume - preset.val) < 0.05
                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-3">
                  <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={audioVolume}
                    onChange={(e) => onAudioVolumeChange(parseFloat(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <Volume2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                </div>

                {/* Test Volume Button */}
                <button
                  type="button"
                  onClick={handleTestVolume}
                  disabled={testingVolume}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-75"
                >
                  <Bell className={`w-4 h-4 ${testingVolume ? 'animate-bounce text-amber-200' : ''}`} />
                  <span>
                    {testingVolume
                      ? 'Sonando campana y voz de prueba...'
                      : 'Probar Volumen Ahora (Campana + Jazán)'}
                  </span>
                </button>

                {/* Speaker tip */}
                <div className="text-[11px] text-stone-600 dark:text-stone-400 bg-white/70 dark:bg-stone-900/60 p-2 rounded-lg border border-amber-500/20 leading-relaxed">
                  💡 <strong>Verificación acústica:</strong> Si al probar sientes el volumen tenue, revisa los <strong>botones físicos de volumen multimedia</strong> en el lateral de tu teléfono o el control de volumen principal de tu ordenador, asegurándote de que no esté en modo silencio o vibración.
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold uppercase tracking-wider text-[10px] text-amber-800 dark:text-amber-400">
                  Convención Fonética Mizrají / Israelí
                </div>
                <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950/40">
                  {MIZRAHI_PRONUNCIATION_GUIDE.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-start gap-3">
                      <span className="font-bold font-mono text-amber-800 dark:text-amber-400 w-20 flex-shrink-0">
                        {item.letter}
                      </span>
                      <span className="text-stone-600 dark:text-stone-300">
                        {item.descriptionEs}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Male Voice Status Card */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 flex-shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span>Voz Masculina de Jazán (Tono Barítono)</span>
                      <span className="text-[9px] bg-amber-600 text-white font-bold px-1.5 py-0.2 rounded">ACTIVA</span>
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                      Pronunciación litúrgica corregida: la palabra <strong>«כָּל / כֹּל»</strong> se sintetiza como <strong>«kol»</strong> (no «kal»).
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold uppercase tracking-wider text-[10px] text-stone-500">
                  Muestras de Audio con Voz Masculina
                </div>
                <div className="space-y-1.5">
                  {samplePhrases.map((phrase, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-serif font-bold text-stone-900 dark:text-stone-100" dir="rtl">
                          {phrase.hebrew}
                        </div>
                        <div className="text-amber-800 dark:text-amber-400 text-[11px] font-medium">
                          {phrase.translit}
                        </div>
                      </div>
                      <button
                        onClick={() => playSoundSample(phrase.hebrew, idx)}
                        className={`p-1.5 rounded-lg border ${
                          playingIndex === idx ? 'bg-amber-600 text-white' : 'bg-stone-100 dark:bg-stone-800'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DISPLAY */}
          {activeTab === 'display' && (
            <div className="space-y-4">
              {/* Theme */}
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-stone-500">
                  Tema visual
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onThemeChange('parchment')}
                    className={`p-2.5 rounded-xl border text-center font-bold ${
                      theme === 'parchment'
                        ? 'border-amber-600 bg-amber-100 text-amber-900'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    Pergamino Sidur
                  </button>
                  <button
                    onClick={() => onThemeChange('light')}
                    className={`p-2.5 rounded-xl border text-center font-bold ${
                      theme === 'light'
                        ? 'border-amber-600 bg-white text-stone-900'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    Claro
                  </button>
                  <button
                    onClick={() => onThemeChange('dark')}
                    className={`p-2.5 rounded-xl border text-center font-bold ${
                      theme === 'dark'
                        ? 'border-amber-600 bg-stone-800 text-stone-100'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    Oscuro
                  </button>
                </div>
              </div>

              {/* Hebrew Font */}
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-stone-500">
                  Tipografía para el hebreo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onHebrewFontChange('frank')}
                    className={`p-2.5 rounded-xl border text-center font-serif text-sm ${
                      hebrewFont === 'frank'
                        ? 'border-amber-600 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-bold'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    Frank Ruhl
                  </button>
                  <button
                    onClick={() => onHebrewFontChange('david')}
                    className={`p-2.5 rounded-xl border text-center font-serif text-sm ${
                      hebrewFont === 'david'
                        ? 'border-amber-600 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-bold'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    David Libre
                  </button>
                  <button
                    onClick={() => onHebrewFontChange('assistant')}
                    className={`p-2.5 rounded-xl border text-center font-sans text-sm ${
                      hebrewFont === 'assistant'
                        ? 'border-amber-600 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-bold'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    Assistant
                  </button>
                </div>
              </div>

              {/* Layout format */}
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-stone-500">
                  Diseño de lectura
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onReadingLayoutChange('fluent')}
                    className={`p-2.5 rounded-xl border text-center font-bold ${
                      readingLayout === 'fluent'
                        ? 'border-amber-600 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    Texto Corrido (Sidur)
                  </button>
                  <button
                    onClick={() => onReadingLayoutChange('verses')}
                    className={`p-2.5 rounded-xl border text-center font-bold ${
                      readingLayout === 'verses'
                        ? 'border-amber-600 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    Por Versículos
                  </button>
                </div>
              </div>

              {/* Show movement instructions */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showInstructions}
                    onChange={(e) => onShowInstructionsChange(e.target.checked)}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Mostrar indicaciones de reverencias y pasos en el texto</span>
                </label>
              </div>

              {/* APK & PWA Conversion Section */}
              {onOpenApkGuide && (
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                        Manifiestos y Conversión a APK / PWA
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-400">
                        Verificar compatibilidad con Android, Google Play Store y PWABuilder.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenApkGuide();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
                    >
                      Verificar APK
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HALAKHA */}
          {activeTab === 'halakha' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                <strong className="text-amber-900 dark:text-amber-300 font-bold block">
                  Reverencias en el Kadish
                </strong>
                <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                  • Al decir <em>Yitgadal</em>, <em>Yehe shemeh Rabba</em> e <em>Yitbaraj</em> se inclina levemente la cabeza y el torso hacia el frente.
                  <br />
                  • Al llegar a <em>Oseh shalom / HaShalom</em>, se dan 3 pasos hacia atrás; se inclina a la izquierda, a la derecha y al centro.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
                <strong className="text-stone-900 dark:text-stone-100 font-bold block">
                  Diferencia entre Kadish Yatom y Derabanan
                </strong>
                <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                  <strong>Kadish Yatom:</strong> Para dolientes en las tres oraciones diarias y en aniversarios luctuosos (hazkará).
                  <br />
                  <strong>Kadish Derabanan:</strong> Se recita tras estudiar Torá comunitaria, bendiciendo con «Al Yisrael» a sabios, maestros y estudiantes de Torá.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
