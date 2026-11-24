import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { KaddishLine, LanguageView, FontSize, HebrewFont, TranslitTradition } from '../types/kaddish';

interface KaddishLineItemProps {
  line: KaddishLine;
  lineNumber: number;
  languageView: LanguageView;
  fontSize: FontSize;
  hebrewFont: HebrewFont;
  isAseretEffective: boolean;
  showComparison: boolean;
  translitTradition?: TranslitTradition;
  isPlaying?: boolean;
  autoScroll?: boolean;
  onSelectLine?: () => void;
}

export const KaddishLineItem: React.FC<KaddishLineItemProps> = ({
  line,
  lineNumber,
  languageView,
  fontSize,
  hebrewFont,
  isAseretEffective,
  showComparison,
  translitTradition = 'sefaradi',
  isPlaying = false,
  autoScroll = true,
  onSelectLine,
}) => {
  const [expandedDiff, setExpandedDiff] = useState(false);
  const itemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoScroll && isPlaying && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isPlaying, autoScroll]);

  const hebrewSizeMap: Record<FontSize, string> = {
    sm: 'text-base sm:text-lg leading-snug',
    md: 'text-lg sm:text-xl leading-snug',
    lg: 'text-xl sm:text-2xl leading-normal',
    xl: 'text-2xl sm:text-3xl leading-relaxed',
    '2xl': 'text-3xl sm:text-4xl leading-relaxed',
  };

  const latinSizeMap: Record<FontSize, string> = {
    sm: 'text-xs sm:text-sm leading-snug',
    md: 'text-sm sm:text-base leading-snug',
    lg: 'text-base sm:text-lg leading-normal',
    xl: 'text-lg sm:text-xl leading-relaxed',
    '2xl': 'text-xl sm:text-2xl leading-relaxed',
  };

  const hebrewFontFamilyMap: Record<HebrewFont, string> = {
    frank: "font-['Frank_Ruhl_Libre',serif]",
    david: "font-['David_Libre',serif]",
    assistant: "font-['Assistant',sans-serif]",
  };

  const isIvris = translitTradition === 'ivris';
  const currentHebrew = isAseretEffective && line.hebrewAseret ? line.hebrewAseret : line.hebrew;
  const currentTranslit = isIvris
    ? (isAseretEffective && line.translitIvrisAseret
        ? line.translitIvrisAseret
        : (line.translitIvris || (isAseretEffective && line.translitAseret ? line.translitAseret : line.translit)))
    : (isAseretEffective && line.translitAseret ? line.translitAseret : line.translit);
  const currentSpanish = isAseretEffective && line.spanishAseret ? line.spanishAseret : line.spanish;
  const currentEnglish = isAseretEffective && line.englishAseret ? line.englishAseret : line.english;

  const currentHighlightTranslit = isIvris
    ? (line.variantHighlight?.translitIvrisAseret || line.variantHighlight?.translitAseret)
    : line.variantHighlight?.translitAseret;

  const inlineTranslitText = isIvris && line.inlineResponse?.translitIvris
    ? line.inlineResponse.translitIvris
    : line.inlineResponse?.translit;

  return (
    <div
      ref={itemRef}
      onClick={onSelectLine}
      className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border transition-colors cursor-pointer ${
        isPlaying
          ? 'bg-amber-500/20 dark:bg-amber-400/25 border-amber-500/50 ring-1 ring-amber-500/40'
          : line.isCongregationResponse
          ? 'bg-amber-500/10 dark:bg-amber-950/25 border-amber-500/30'
          : line.hasAseretVariant && isAseretEffective
          ? 'bg-amber-500/5 dark:bg-amber-950/15 border-amber-500/25'
          : 'bg-white/70 dark:bg-stone-900/40 border-stone-200/70 dark:border-stone-800/70 hover:border-amber-500/30'
      }`}
    >
      {/* Subtle verse index & audio affordance */}
      <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 mb-1">
        <span className="tabular-nums font-medium">Verso {lineNumber}</span>
        {onSelectLine && (
          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
            <Volume2 className="w-3 h-3" />
            <span>{isPlaying ? 'Reproduciendo' : 'Escuchar'}</span>
          </span>
        )}
      </div>

      {/* 1. Hebrew Text */}
      {(languageView === 'all' || languageView === 'hebrew') && (
        <div className="w-full text-right" dir="rtl">
          <p
            className={`font-semibold text-stone-900 dark:text-stone-50 w-full text-right ${hebrewFontFamilyMap[hebrewFont]} ${hebrewSizeMap[fontSize]} leading-snug`}
            dir="rtl"
          >
            {line.hasAseretVariant &&
            line.variantHighlight &&
            currentHebrew.includes(line.variantHighlight.hebrewAseret) ? (
              <>
                {currentHebrew.split(line.variantHighlight.hebrewAseret)[0]}
                <span
                  className="bg-amber-200/90 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 px-1 rounded font-bold underline decoration-amber-500 decoration-2 underline-offset-4"
                  title={line.variantHighlight.tagLabel?.es}
                >
                  {line.variantHighlight.hebrewAseret}
                </span>
                {currentHebrew.split(line.variantHighlight.hebrewAseret)[1]}
              </>
            ) : (
              currentHebrew
            )}

            {line.inlineResponse && (
              <span className="mr-1.5 font-bold text-amber-800 dark:text-amber-300 select-none">
                {line.inlineResponse.hebrew}
              </span>
            )}
          </p>
        </div>
      )}

      {/* 2. Transliteration (Ivrit or Ivris) */}
      {(languageView === 'all' || languageView === 'translit') && (
        <div className="w-full text-left mt-0.5" dir="ltr">
          <p
            className={`font-medium text-stone-800 dark:text-stone-200 font-sans ${latinSizeMap[fontSize]} leading-snug`}
          >
            {line.hasAseretVariant &&
            currentHighlightTranslit &&
            currentTranslit.includes(currentHighlightTranslit) ? (
              <>
                {currentTranslit.split(currentHighlightTranslit)[0]}
                <span
                  className="bg-amber-200/90 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 px-1 rounded font-bold"
                  title={line.variantHighlight?.tagLabel?.es}
                >
                  {currentHighlightTranslit}
                </span>
                {currentTranslit.split(currentHighlightTranslit)[1]}
              </>
            ) : (
              currentTranslit
            )}

            {line.inlineResponse && inlineTranslitText && (
              <span className="ml-1.5 font-bold text-amber-800 dark:text-amber-300 select-none">
                {inlineTranslitText}
              </span>
            )}
          </p>
        </div>
      )}

      {/* 3. Spanish Translation */}
      {(languageView === 'all' || languageView === 'spanish') && (
        <div className="w-full text-left mt-0.5" dir="ltr">
          <p className="text-xs text-stone-600 dark:text-stone-300">
            {line.hasAseretVariant && line.variantHighlight && isAseretEffective ? (
              <>
                {currentSpanish.split(line.variantHighlight.spanishAseret)[0]}
                <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-semibold px-0.5 rounded">
                  {line.variantHighlight.spanishAseret}
                </span>
                {currentSpanish.split(line.variantHighlight.spanishAseret)[1]}
              </>
            ) : (
              currentSpanish
            )}

            {line.inlineResponse && (
              <span className="ml-1 text-amber-800 dark:text-amber-400 font-bold select-none">
                {line.inlineResponse.spanish}
              </span>
            )}
          </p>
        </div>
      )}

      {/* 4. English Translation */}
      {languageView === 'english' && (
        <div className="w-full text-left mt-0.5" dir="ltr">
          <p className="text-xs text-stone-500 dark:text-stone-400 italic">
            {currentEnglish}
            {line.inlineResponse && (
              <span className="ml-1 text-amber-800 dark:text-amber-400 font-bold not-italic select-none">
                {line.inlineResponse.english}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Optional comparative box for variants */}
      {line.hasAseretVariant && line.variantHighlight && (showComparison || expandedDiff) && (
        <div
          className="mt-2 p-2.5 rounded-lg bg-amber-50/70 dark:bg-stone-800/50 border border-amber-200/80 dark:border-stone-700 text-xs space-y-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
            <div className="p-2 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
              <div className="text-[10px] font-bold text-stone-500">
                Todo el Año (Regular)
              </div>
              <div className="text-sm font-bold font-serif text-stone-800 dark:text-stone-200" dir="rtl">
                {line.variantHighlight.hebrewStandard}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-400">
                {isIvris && line.variantHighlight.translitIvrisStandard
                  ? line.variantHighlight.translitIvrisStandard
                  : line.variantHighlight.translitStandard}
              </div>
            </div>

            <div className="p-2 rounded bg-amber-100/70 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700">
              <div className="text-[10px] font-bold text-amber-800 dark:text-amber-400">
                Aseret Yemei Teshuvá (1–10 Tishrei)
              </div>
              <div className="text-sm font-bold font-serif text-amber-900 dark:text-amber-200" dir="rtl">
                {line.variantHighlight.hebrewAseret}
              </div>
              <div className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                {isIvris && line.variantHighlight.translitIvrisAseret
                  ? line.variantHighlight.translitIvrisAseret
                  : line.variantHighlight.translitAseret}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Button to toggle inline comparison if not globally forced */}
      {line.hasAseretVariant && !showComparison && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpandedDiff(!expandedDiff);
          }}
          className="mt-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium hover:underline inline-flex items-center gap-0.5"
        >
          {expandedDiff ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Ocultar comparativa
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Comparar variante
            </>
          )}
        </button>
      )}
    </div>
  );
};
