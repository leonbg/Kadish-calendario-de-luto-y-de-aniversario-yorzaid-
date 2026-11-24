import React from 'react';
import {
  Flame,
  Settings,
  Play,
  Pause,
  BookOpen,
  Maximize2,
  Minimize2,
  HardDrive,
  CalendarCheck,
  CalendarDays,
  Printer,
  Languages,
} from 'lucide-react';
import {
  KaddishType,
  LanguageView,
  FontSize,
  AseretMode,
  HebrewDateInfo,
  TranslitTradition,
} from '../types/kaddish';
import { PWAInstallButton } from './PWAInstallButton';

interface MinimalNavbarProps {
  currentKaddish: KaddishType;
  onSelectKaddish: (k: KaddishType) => void;
  languageView: LanguageView;
  onLanguageViewChange: (view: LanguageView) => void;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  translitTradition: TranslitTradition;
  onTranslitTraditionChange: (tradition: TranslitTradition) => void;
  aseretMode: AseretMode;
  onAseretModeChange: (mode: AseretMode) => void;
  isAseretEffective: boolean;
  isPlayingAll: boolean;
  onTogglePlayAll: () => void;
  onOpenSettings: () => void;
  onOpenHalakha: () => void;
  onOpenPronunciationGuide?: () => void;
  onOpenWorkspace: () => void;
  onOpenCalculator: () => void;
  onOpenApkGuide: () => void;
  onOpenFamilyCalendar?: () => void;
  onOpenPrintModal?: () => void;
  upcomingAnniversariesCount?: number;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  currentHebrewDate: HebrewDateInfo;
}

const FONT_SIZES: { id: FontSize; label: string }[] = [
  { id: 'sm', label: 'S' },
  { id: 'md', label: 'M' },
  { id: 'lg', label: 'L' },
  { id: 'xl', label: 'XL' },
];

const KADDISH_TYPES: { id: KaddishType; label: string }[] = [
  { id: 'yatom', label: 'Yatom' },
  { id: 'derabanan', label: 'Derabanán' },
  { id: 'chatzi', label: 'Jatzi' },
  { id: 'shalem', label: 'Shalem' },
];

export const MinimalNavbar: React.FC<MinimalNavbarProps> = React.memo(({
  currentKaddish,
  onSelectKaddish,
  languageView,
  onLanguageViewChange,
  fontSize,
  onFontSizeChange,
  translitTradition,
  onTranslitTraditionChange,
  aseretMode,
  onAseretModeChange,
  isAseretEffective,
  isPlayingAll,
  onTogglePlayAll,
  onOpenSettings,
  onOpenHalakha,
  onOpenPronunciationGuide,
  onOpenWorkspace,
  onOpenCalculator,
  onOpenApkGuide,
  onOpenFamilyCalendar,
  onOpenPrintModal,
  upcomingAnniversariesCount = 0,
  isZenMode,
  onToggleZenMode,
}) => {

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-2.5 sm:px-4 py-1.5 shadow-2xs">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
        {/* Top line on mobile / Left group on desktop */}
        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Brand Wordmark (No decorative status dots per Argon design constitution) */}
          <div className="flex items-center shrink-0 pr-2 border-r border-stone-200 dark:border-stone-800">
            <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 tracking-tight whitespace-nowrap shrink-0">
              Kadish y Yurzaid
            </span>
          </div>

          {/* Prayer Switcher (Yatom, Derabanán, Jatzi, Shalem) */}
          <div className="flex items-center p-0.5 bg-stone-100 dark:bg-stone-800/90 rounded-lg border border-stone-200/90 dark:border-stone-700 shrink-0">
            {KADDISH_TYPES.map((kt) => (
              <button
                key={kt.id}
                type="button"
                onClick={() => onSelectKaddish(kt.id)}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  currentKaddish === kt.id
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
                }`}
              >
                {kt.label}
              </button>
            ))}
          </div>

          {/* Quick Action Buttons visible on mobile top-row */}
          <div className="flex sm:hidden items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onTogglePlayAll}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                isPlayingAll
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700/60 hover:bg-amber-100'
              }`}
              title={isPlayingAll ? 'Pausar recitación' : 'Escuchar recitación con voz de Jazán'}
            >
              {isPlayingAll ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current text-amber-600 dark:text-amber-400" />
              )}
              <span className="text-[11px]">{isPlayingAll ? 'Pausa' : 'Audio'}</span>
            </button>

            {onOpenFamilyCalendar && (
              <button
                type="button"
                onClick={onOpenFamilyCalendar}
                className="relative p-1.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors shrink-0"
                title="Calendario de Aniversarios de Familiares (Yurzaid)"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                {upcomingAnniversariesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center tabular-nums">
                    {upcomingAnniversariesCount}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCalculator}
              className="p-1.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors shrink-0"
              title="Calculadora de Fechas de Kadish y Yurzaid"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
            </button>

            {onOpenPrintModal && (
              <button
                type="button"
                onClick={onOpenPrintModal}
                className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 transition-colors shrink-0"
                title="Imprimir en tamaño tarjeta de billetera, media carta o completa"
              >
                <Printer className="w-3.5 h-3.5 text-amber-600" />
              </button>
            )}

            <PWAInstallButton onOpenApkGuide={onOpenApkGuide} />

            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shrink-0"
              title="Ajustes y calendario hebreo"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center / Bottom Row: Language Tabs, Ivrit/Ivris Toggle & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto overflow-x-auto pb-0.5 sm:pb-0">
          {/* Language Selector */}
          <div className="flex items-center p-0.5 bg-stone-100 dark:bg-stone-800/90 rounded-lg border border-stone-200/90 dark:border-stone-700 shrink-0">
            <button
              type="button"
              onClick={() => onLanguageViewChange('hebrew')}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                languageView === 'hebrew'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
              }`}
              title="Solo texto en hebreo con níkud"
            >
              עברית
            </button>
            <button
              type="button"
              onClick={() => onLanguageViewChange('translit')}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                languageView === 'translit'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
              }`}
              title={translitTradition === 'ivris' ? 'Fonética Asquenazí (Ivris)' : 'Fonética Sefaradí (Ivrit)'}
            >
              {translitTradition === 'ivris' ? 'Fonética (Ivris)' : 'Fonética'}
            </button>
            <button
              type="button"
              onClick={() => onLanguageViewChange('all')}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                languageView === 'all'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
              }`}
              title="Hebreo, fonética y traducción verso a verso"
            >
              Interlineal
            </button>
            <button
              type="button"
              onClick={() => onLanguageViewChange('spanish')}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                languageView === 'spanish'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
              }`}
              title="Traducción en español"
            >
              Español
            </button>
          </div>

          {/* Always-Accessible Pronunciation Switcher: Ivrit (Sefaradí) vs Ivris (Asquenazí) */}
          <div className="flex items-center p-0.5 bg-amber-500/10 dark:bg-stone-800 rounded-lg border border-amber-500/30 shrink-0 text-xs">
            <button
              type="button"
              onClick={() => {
                onTranslitTraditionChange('sefaradi');
                if (languageView === 'hebrew' || languageView === 'spanish') {
                  onLanguageViewChange('translit');
                }
              }}
              className={`px-2 py-0.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                translitTradition === 'sefaradi'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
              }`}
              title="Dicción Sefaradí / Israelí (Ivrit) - Ej: Yitgadal, beit Yisrael, Amen"
            >
              Ivrit
            </button>
            <button
              type="button"
              onClick={() => {
                onTranslitTraditionChange('ivris');
                if (languageView === 'hebrew' || languageView === 'spanish') {
                  onLanguageViewChange('translit');
                }
              }}
              className={`px-2 py-0.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                translitTradition === 'ivris'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
              }`}
              title="Dicción Asquenazí (Ivris) - Ej: Yisgadal, béis Yisroel, Oméin, Yisborach"
            >
              Ivris
            </button>
            {onOpenPronunciationGuide && (
              <button
                type="button"
                onClick={onOpenPronunciationGuide}
                className="px-1.5 py-0.5 text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 transition-colors shrink-0"
                title="Abrir tabla comparativa y audio de pronunciación Ivrit vs Ivris"
              >
                <Languages className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Aseret Toggle */}
            <button
              type="button"
              onClick={() => {
                if (aseretMode === 'auto') onAseretModeChange(isAseretEffective ? 'disabled' : 'enabled');
                else if (aseretMode === 'enabled') onAseretModeChange('disabled');
                else onAseretModeChange('auto');
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                isAseretEffective
                  ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
              title={`Aseret Yemei Teshuvá: ${
                aseretMode === 'auto'
                  ? `Automático (${isAseretEffective ? 'Activo' : 'Inactivo'})`
                  : aseretMode === 'enabled'
                  ? 'Siempre activado'
                  : 'Desactivado'
              }. Clic para cambiar.`}
            >
              <Flame className={`w-3 h-3 ${isAseretEffective ? 'text-stone-950' : 'text-stone-500'}`} />
              <span className="hidden xs:inline">Aseret</span>
              {isAseretEffective && (
                <span className="text-[10px] bg-stone-950 text-amber-300 px-1 rounded-xs font-bold">ON</span>
              )}
            </button>

            {/* Font Size Selector */}
            <div className="flex bg-stone-100 dark:bg-stone-800/90 rounded-lg p-0.5 border border-stone-200/90 dark:border-stone-700 shrink-0">
              {FONT_SIZES.map((sz) => (
                <button
                  type="button"
                  key={sz.id}
                  onClick={() => onFontSizeChange(sz.id)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                    fontSize === sz.id
                      ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-white border border-stone-200 dark:border-stone-600'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                  title={`Tamaño de texto: ${sz.label}`}
                >
                  {sz.label}
                </button>
              ))}
            </div>

            {/* Audio Button (Desktop) */}
            <button
              type="button"
              onClick={onTogglePlayAll}
              className={`hidden sm:flex items-center gap-1 p-1.5 rounded-lg border transition-colors shrink-0 ${
                isPlayingAll
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700/60'
              }`}
              title={isPlayingAll ? 'Pausar audio' : 'Escuchar recitación con voz de Jazán'}
            >
              {isPlayingAll ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current text-amber-600 dark:text-amber-400" />
              )}
            </button>

            {/* Calendario de Familiares & Aniversarios - Desktop */}
            {onOpenFamilyCalendar && (
              <button
                type="button"
                onClick={onOpenFamilyCalendar}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-900 dark:text-amber-200 text-xs font-semibold transition-colors relative whitespace-nowrap shrink-0"
                title="Calendario de Aniversarios de Familiares (Yurzaid)"
              >
                <CalendarDays className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="hidden lg:inline">Familiares</span>
                {upcomingAnniversariesCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white font-bold text-[10px] tabular-nums">
                    {upcomingAnniversariesCount}
                  </span>
                )}
              </button>
            )}

            {/* Calculadora de Kadish y Yurzaid - Desktop */}
            <button
              type="button"
              onClick={onOpenCalculator}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-900 dark:text-amber-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              title="Calcular fechas de 11 meses, mes 12 y Yurzaid"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="hidden xl:inline">Calculadora</span>
            </button>

            {/* PWA / APK In-App Install & Verification */}
            <PWAInstallButton onOpenApkGuide={onOpenApkGuide} />

            {/* Google Workspace (Drive & Docs) - Desktop */}
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              title="Exportar a Google Docs y respaldar en Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            </button>

            {/* Print & Laminate Card - Desktop */}
            {onOpenPrintModal && (
              <button
                type="button"
                onClick={onOpenPrintModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                title="Imprimir en tamaño tarjeta de billetera (laminar), media carta o completa"
              >
                <Printer className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              </button>
            )}

            {/* Guía Halajá (Desktop) */}
            <button
              type="button"
              onClick={onOpenHalakha}
              className="hidden sm:inline-flex p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-amber-800 dark:text-amber-300 transition-colors shrink-0"
              title="Guía de movimientos y reverencias"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>

            {/* Zen / Focus Fullscreen Mode Toggle */}
            <button
              type="button"
              onClick={onToggleZenMode}
              className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                isZenMode
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
              }`}
              title={isZenMode ? 'Salir del modo enfoque' : 'Modo enfoque (pantalla limpia)'}
            >
              {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Settings (Desktop) */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden sm:inline-flex p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors shrink-0"
              title="Ajustes y Calendario hebreo"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
});
