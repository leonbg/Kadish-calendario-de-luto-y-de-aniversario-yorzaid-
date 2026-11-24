import React, { useEffect, useRef } from 'react';
import { KaddishPrayer, LanguageView, FontSize, HebrewFont, TranslitTradition } from '../types/kaddish';

interface ContinuousSiddurViewProps {
  prayer: KaddishPrayer;
  languageView: LanguageView;
  fontSize: FontSize;
  hebrewFont: HebrewFont;
  isAseretEffective: boolean;
  translitTradition?: TranslitTradition;
  playingLineId?: string | null;
  autoScroll?: boolean;
  onSelectLine?: (index: number) => void;
}

const HEBREW_SIZE_MAP: Record<FontSize, string> = {
  sm: 'text-base sm:text-lg leading-tight sm:leading-snug',
  md: 'text-lg sm:text-xl leading-snug',
  lg: 'text-xl sm:text-2xl leading-normal',
  xl: 'text-2xl sm:text-3xl leading-relaxed',
  '2xl': 'text-3xl sm:text-4xl leading-relaxed',
};

const LATIN_SIZE_MAP: Record<FontSize, string> = {
  sm: 'text-xs sm:text-sm leading-tight sm:leading-snug',
  md: 'text-sm sm:text-base leading-snug',
  lg: 'text-base sm:text-lg leading-normal',
  xl: 'text-lg sm:text-xl leading-relaxed',
  '2xl': 'text-xl sm:text-2xl leading-relaxed',
};

const HEBREW_FONT_FAMILY_MAP: Record<HebrewFont, string> = {
  frank: "font-['Frank_Ruhl_Libre',serif]",
  david: "font-['David_Libre',serif]",
  assistant: "font-['Assistant',sans-serif]",
};

export const ContinuousSiddurView: React.FC<ContinuousSiddurViewProps> = React.memo(({
  prayer,
  languageView,
  fontSize,
  hebrewFont,
  isAseretEffective,
  translitTradition = 'sefaradi',
  playingLineId,
  autoScroll = true,
  onSelectLine,
}) => {
  const isSingleLang = languageView === 'hebrew' || languageView === 'translit' || languageView === 'spanish';
  const isIvris = translitTradition === 'ivris';
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoScroll && playingLineId && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [playingLineId, autoScroll]);

  return (
    <div
      className={`transition-all w-full ${
        isSingleLang
          ? 'py-1 px-1'
          : 'bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 rounded-xl p-3 sm:p-4 space-y-3'
      }`}
    >
      {/* ============================================================ */}
      {/* 1. SOLO HEBREO (Pure RTL, pristine Siddur layout)            */}
      {/* ============================================================ */}
      {languageView === 'hebrew' && (
        <div dir="rtl" className="w-full text-right">
          <div
            className={`w-full text-right text-stone-900 dark:text-stone-100 ${HEBREW_FONT_FAMILY_MAP[hebrewFont]} ${HEBREW_SIZE_MAP[fontSize]} space-y-1 sm:space-y-1.5`}
          >
            {prayer.lines.map((line, index) => {
              const currentHebrew = isAseretEffective && line.hebrewAseret ? line.hebrewAseret : line.hebrew;
              const isPlayingThisLine = playingLineId === line.id;
              const highlightHeb =
                line.hasAseretVariant && line.variantHighlight
                  ? line.variantHighlight.hebrewAseret
                  : '';
              const splitIdx = highlightHeb ? currentHebrew.indexOf(highlightHeb) : -1;

              return (
                <div
                  key={line.id}
                  ref={isPlayingThisLine ? activeLineRef : null}
                  onClick={() => onSelectLine?.(index)}
                  className={`w-full text-right py-1 px-2 rounded-lg leading-snug transition-colors cursor-pointer ${
                    isPlayingThisLine
                      ? 'bg-amber-500/20 dark:bg-amber-400/25 ring-1 ring-amber-500/50'
                      : line.isCongregationResponse
                      ? 'font-bold text-amber-950 dark:text-amber-100 bg-amber-500/8 dark:bg-amber-400/10 border border-amber-500/20'
                      : 'hover:bg-stone-200/40 dark:hover:bg-stone-800/40'
                  }`}
                  dir="rtl"
                  title="Toca para escuchar este verso"
                >
                  {splitIdx !== -1 ? (
                    <span>
                      {currentHebrew.slice(0, splitIdx)}
                      <span
                        className="bg-amber-200/90 dark:bg-amber-900/80 text-amber-950 dark:text-amber-50 px-1 rounded font-bold underline decoration-amber-500 decoration-2 underline-offset-4"
                        title={line.variantHighlight?.tagLabel?.es}
                      >
                        {highlightHeb}
                      </span>
                      {currentHebrew.slice(splitIdx + highlightHeb.length)}
                    </span>
                  ) : (
                    <span>{currentHebrew}</span>
                  )}

                  {line.inlineResponse && (
                    <span className="mr-1.5 font-bold text-amber-800 dark:text-amber-300 select-none">
                      {line.inlineResponse.hebrew}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. SOLO FONÉTICA (Ivrit Sefaradí o Ivris Asquenazí)          */}
      {/* ============================================================ */}
      {languageView === 'translit' && (
        <div dir="ltr" className="w-full text-left">
          <div
            className={`w-full text-left text-stone-800 dark:text-stone-200 font-sans ${LATIN_SIZE_MAP[fontSize]} space-y-1 sm:space-y-1.5`}
          >
            {prayer.lines.map((line, index) => {
              const currentTranslit = isIvris
                ? (isAseretEffective && line.translitIvrisAseret
                    ? line.translitIvrisAseret
                    : (line.translitIvris || (isAseretEffective && line.translitAseret ? line.translitAseret : line.translit)))
                : (isAseretEffective && line.translitAseret ? line.translitAseret : line.translit);
              const currentHighlightTranslit = isIvris
                ? (line.variantHighlight?.translitIvrisAseret || line.variantHighlight?.translitAseret)
                : line.variantHighlight?.translitAseret;
              const inlineTranslitText = isIvris && line.inlineResponse?.translitIvris
                ? line.inlineResponse.translitIvris
                : line.inlineResponse?.translit;
              const isPlayingThisLine = playingLineId === line.id;
              const trSplitIdx =
                line.hasAseretVariant && currentHighlightTranslit
                  ? currentTranslit.indexOf(currentHighlightTranslit)
                  : -1;

              return (
                <div
                  key={line.id}
                  ref={isPlayingThisLine ? activeLineRef : null}
                  onClick={() => onSelectLine?.(index)}
                  className={`w-full text-left py-1 px-2 rounded-lg leading-snug transition-colors cursor-pointer ${
                    isPlayingThisLine
                      ? 'bg-amber-500/20 dark:bg-amber-400/25 ring-1 ring-amber-500/50'
                      : line.isCongregationResponse
                      ? 'font-bold text-amber-950 dark:text-amber-100 bg-amber-500/8 dark:bg-amber-400/10 border border-amber-500/20'
                      : 'hover:bg-stone-200/40 dark:hover:bg-stone-800/40'
                  }`}
                  dir="ltr"
                  title="Toca para escuchar este verso"
                >
                  {trSplitIdx !== -1 && currentHighlightTranslit ? (
                    <span>
                      {currentTranslit.slice(0, trSplitIdx)}
                      <span
                        className="bg-amber-200/90 dark:bg-amber-900/80 text-amber-950 dark:text-amber-50 px-1 rounded font-bold"
                        title={line.variantHighlight?.tagLabel?.es}
                      >
                        {currentHighlightTranslit}
                      </span>
                      {currentTranslit.slice(trSplitIdx + currentHighlightTranslit.length)}
                    </span>
                  ) : (
                    <span>{currentTranslit}</span>
                  )}

                  {line.inlineResponse && inlineTranslitText && (
                    <span className="ml-1.5 font-bold text-amber-800 dark:text-amber-300 select-none">
                      {inlineTranslitText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MODO INTERLINEAL (Verso a verso: Hebreo + Fonética + Español) */}
      {/* ============================================================ */}
      {languageView === 'all' && (
        <div className="space-y-2.5">
          {prayer.lines.map((line, index) => {
            const currentHebrew = isAseretEffective && line.hebrewAseret ? line.hebrewAseret : line.hebrew;
            const currentTranslit = isIvris
              ? (isAseretEffective && line.translitIvrisAseret
                  ? line.translitIvrisAseret
                  : (line.translitIvris || (isAseretEffective && line.translitAseret ? line.translitAseret : line.translit)))
              : (isAseretEffective && line.translitAseret ? line.translitAseret : line.translit);
            const currentHighlightTranslit = isIvris
              ? (line.variantHighlight?.translitIvrisAseret || line.variantHighlight?.translitAseret)
              : line.variantHighlight?.translitAseret;
            const inlineTranslitText = isIvris && line.inlineResponse?.translitIvris
              ? line.inlineResponse.translitIvris
              : line.inlineResponse?.translit;
            const currentSpanish = isAseretEffective && line.spanishAseret ? line.spanishAseret : line.spanish;

            const isPlayingThisLine = playingLineId === line.id;
            const hebSplitIdx =
              line.hasAseretVariant && line.variantHighlight && isAseretEffective
                ? currentHebrew.indexOf(line.variantHighlight.hebrewAseret)
                : -1;
            const trSplitIdx =
              line.hasAseretVariant && currentHighlightTranslit && isAseretEffective
                ? currentTranslit.indexOf(currentHighlightTranslit)
                : -1;

            return (
              <div
                key={line.id}
                ref={isPlayingThisLine ? activeLineRef : null}
                onClick={() => onSelectLine?.(index)}
                className={`py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                  isPlayingThisLine
                    ? 'bg-amber-500/20 dark:bg-amber-400/25 ring-1 ring-amber-500/50'
                    : line.isCongregationResponse
                    ? 'bg-amber-500/10 dark:bg-amber-900/20 border border-amber-500/30'
                    : 'border-b border-stone-200/60 dark:border-stone-800/60 hover:bg-stone-200/30 dark:hover:bg-stone-800/30'
                }`}
                title="Toca para escuchar este verso"
              >
                {/* 1. Hebrew Line */}
                <div dir="rtl" className="text-right">
                  <p
                    className={`font-semibold text-stone-900 dark:text-stone-50 ${HEBREW_FONT_FAMILY_MAP[hebrewFont]} ${HEBREW_SIZE_MAP[fontSize]} leading-snug`}
                    dir="rtl"
                  >
                    {hebSplitIdx !== -1 && line.variantHighlight ? (
                      <>
                        {currentHebrew.slice(0, hebSplitIdx)}
                        <span className="bg-amber-200/90 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 px-1 rounded font-bold underline decoration-amber-500 decoration-2 underline-offset-4">
                          {line.variantHighlight.hebrewAseret}
                        </span>
                        {currentHebrew.slice(hebSplitIdx + line.variantHighlight.hebrewAseret.length)}
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

                {/* 2. Phonetic Transliteration */}
                <div dir="ltr" className="text-left mt-1">
                  <p className={`text-stone-700 dark:text-stone-200 font-sans ${LATIN_SIZE_MAP[fontSize]} leading-snug`}>
                    {trSplitIdx !== -1 && currentHighlightTranslit ? (
                      <>
                        {currentTranslit.slice(0, trSplitIdx)}
                        <span className="bg-amber-200/90 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 px-1 rounded font-bold">
                          {currentHighlightTranslit}
                        </span>
                        {currentTranslit.slice(trSplitIdx + currentHighlightTranslit.length)}
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

                {/* 3. Spanish Translation */}
                <div dir="ltr" className="text-left mt-0.5">
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {currentSpanish}
                    {line.inlineResponse && (
                      <span className="ml-1 text-amber-800 dark:text-amber-400 font-bold select-none">
                        {line.inlineResponse.spanish}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. SOLO ESPAÑOL                                              */}
      {/* ============================================================ */}
      {languageView === 'spanish' && (
        <div dir="ltr" className="w-full text-left">
          <div className={`w-full text-left text-stone-800 dark:text-stone-200 ${LATIN_SIZE_MAP[fontSize]} space-y-1 sm:space-y-1.5`}>
            {prayer.lines.map((line, index) => {
              const currentSpanish = isAseretEffective && line.spanishAseret ? line.spanishAseret : line.spanish;
              const isPlayingThisLine = playingLineId === line.id;
              const esSplitIdx =
                line.hasAseretVariant && line.variantHighlight && isAseretEffective
                  ? currentSpanish.indexOf(line.variantHighlight.spanishAseret)
                  : -1;

              return (
                <div
                  key={line.id}
                  ref={isPlayingThisLine ? activeLineRef : null}
                  onClick={() => onSelectLine?.(index)}
                  className={`w-full text-left py-1 px-2 rounded-lg leading-snug transition-colors cursor-pointer ${
                    isPlayingThisLine
                      ? 'bg-amber-500/20 dark:bg-amber-400/25 ring-1 ring-amber-500/50'
                      : line.isCongregationResponse
                      ? 'font-bold text-amber-950 dark:text-amber-100 bg-amber-500/8 dark:bg-amber-400/10 border border-amber-500/20'
                      : 'hover:bg-stone-200/40 dark:hover:bg-stone-800/40'
                  }`}
                  dir="ltr"
                  title="Toca para escuchar este verso"
                >
                  {esSplitIdx !== -1 && line.variantHighlight ? (
                    <span>
                      {currentSpanish.slice(0, esSplitIdx)}
                      <span className="bg-amber-200/90 dark:bg-amber-900/80 text-amber-950 dark:text-amber-50 px-1 rounded font-semibold">
                        {line.variantHighlight.spanishAseret}
                      </span>
                      {currentSpanish.slice(esSplitIdx + line.variantHighlight.spanishAseret.length)}
                    </span>
                  ) : (
                    <span>{currentSpanish}</span>
                  )}

                  {line.inlineResponse && (
                    <span className="ml-1.5 font-bold text-amber-800 dark:text-amber-300 select-none">
                      {line.inlineResponse.spanish}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
