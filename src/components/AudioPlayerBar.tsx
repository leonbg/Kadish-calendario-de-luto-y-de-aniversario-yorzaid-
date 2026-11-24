import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  X,
  BookOpen,
  Languages,
} from 'lucide-react';
import { AudioSpeed, AudioVoiceMode, KaddishLine, TranslitTradition } from '../types/kaddish';
import { resolveLineTranslit } from '../utils/speechUtils';

interface AudioPlayerBarProps {
  isOpen: boolean;
  isPlaying: boolean;
  currentLine: KaddishLine | null;
  currentIndex: number;
  totalLines: number;
  voiceMode: AudioVoiceMode;
  translitTradition?: TranslitTradition;
  speed: AudioSpeed;
  volume: number;
  autoScroll: boolean;
  isAseretEffective: boolean;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  onVoiceModeChange: (mode: AudioVoiceMode) => void;
  onSpeedChange: (speed: AudioSpeed) => void;
  onVolumeChange: (vol: number) => void;
  onToggleAutoScroll: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isOpen,
  isPlaying,
  currentLine,
  currentIndex,
  totalLines,
  voiceMode,
  translitTradition = 'sefaradi',
  speed,
  volume,
  autoScroll,
  isAseretEffective,
  onTogglePlay,
  onPrevious,
  onNext,
  onClose,
  onVoiceModeChange,
  onSpeedChange,
  onVolumeChange,
  onToggleAutoScroll,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);

  if (!isOpen) return null;

  const currentHebrew = currentLine
    ? isAseretEffective && currentLine.hebrewAseret
      ? currentLine.hebrewAseret
      : currentLine.hebrew
    : '';

  const currentTranslit = currentLine
    ? resolveLineTranslit(currentLine, isAseretEffective, translitTradition)
    : '';

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-stone-900/95 dark:bg-stone-950/95 text-stone-100 border-t border-amber-600/30 backdrop-blur-md shadow-2xl transition-all duration-150">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        {/* Top Mini-Header: Verse Tracker & Section info */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 pb-1.5 border-b border-stone-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-semibold text-amber-400 shrink-0 tabular-nums">
              Verso {currentIndex + 1} de {totalLines}
            </span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="text-stone-400 font-medium truncate">
              {translitTradition === 'ivris' ? 'Dicción Ivris' : 'Dicción Ivrit'}
            </span>
            {currentLine?.sectionName && (
              <>
                <span aria-hidden="true" className="hidden sm:inline text-stone-600">·</span>
                <span className="hidden sm:inline text-stone-500 font-medium truncate">
                  {currentLine.sectionName}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-scroll toggle */}
            <button
              type="button"
              onClick={onToggleAutoScroll}
              className={`text-[10px] px-2 py-0.5 rounded transition-colors whitespace-nowrap shrink-0 ${
                autoScroll
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Centrar verso activo automáticamente"
            >
              Auto-avance {autoScroll ? '✓' : ''}
            </button>

            {/* Close / Hide bar */}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Cerrar reproductor"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Live Text Preview */}
        {currentLine && (
          <div className="py-1 px-1 text-center">
            <p className="text-amber-200/90 font-serif text-sm sm:text-base font-bold truncate tracking-wide" dir="rtl">
              {currentHebrew}
            </p>
            <p className="text-stone-300 font-sans text-xs truncate italic">
              {currentTranslit}
            </p>
          </div>
        )}

        {/* Bottom Controls Row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Left: Mode Toggle (Hebrew vs Phonetic) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onVoiceModeChange(voiceMode === 'hebrew' ? 'translit' : 'hebrew')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors shadow-2xs whitespace-nowrap shrink-0"
              title="Alternar entre pronunciación en Hebreo y Fonética Asistida"
            >
              {voiceMode === 'hebrew' ? (
                <>
                  <Languages className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Voz:</span>
                  <span className="text-amber-300">Hebreo</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Voz:</span>
                  <span className="text-sky-300">
                    {translitTradition === 'ivris' ? 'Fonética (Ivris)' : 'Fonética (Ivrit)'}
                  </span>
                </>
              )}
            </button>

            {/* Speed Selector */}
            <div className="flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700 text-[10px] tabular-nums">
              {(['0.75', '1.0', '1.25'] as const).map((spd) => {
                const val = parseFloat(spd) as AudioSpeed;
                return (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => onSpeedChange(val)}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all whitespace-nowrap shrink-0 ${
                      speed === val
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {spd}x
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center: Playback Navigation (Prev, Play/Pause, Next) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onPrevious}
              disabled={currentIndex <= 0}
              className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Verso anterior"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              className={`p-2.5 sm:p-3 rounded-full font-bold shadow-lg transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-500/30 scale-105'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
              title={isPlaying ? 'Pausar audio' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-stone-950" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={currentIndex >= totalLines - 1}
              className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Siguiente verso"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Right: Volume Controller */}
          <div className="relative flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors flex items-center gap-1 tabular-nums"
              title="Ajustar volumen"
            >
              {volume > 0.6 ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : volume > 0.05 ? (
                <Volume1 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-500" />
              )}
              <span className="hidden sm:inline text-[11px] font-bold text-stone-300">
                {Math.round(volume * 100)}%
              </span>
            </button>

            {/* Volume Popup / Slider */}
            {showVolumeSlider && (
              <div className="absolute bottom-10 right-0 p-2.5 bg-stone-800 border border-stone-700 rounded-xl shadow-xl flex items-center gap-2 w-40 z-50">
                <VolumeX className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
