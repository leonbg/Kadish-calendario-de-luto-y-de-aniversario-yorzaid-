export type KaddishType = 'yatom' | 'derabanan' | 'chatzi' | 'shalem';

export type DerabananNusaj =
  | 'sefaradi_standard'
  | 'sefaradi_occidental'
  | 'ashkenaz'
  | 'chabad_ari';

export interface DerabananNusajOption {
  id: DerabananNusaj;
  nameEs: string;
  subtitleEs: string;
  isDefault?: boolean;
  descriptionEs: string;
  differencesSummary: string[];
}

export type LanguageView = 'all' | 'hebrew' | 'translit' | 'spanish' | 'english';

export type TranslitTradition = 'sefaradi' | 'ivris';

export type ReadingLayout = 'fluent' | 'verses';

export type AseretMode = 'auto' | 'enabled' | 'disabled';

export type ThemeMode = 'parchment' | 'light' | 'dark';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type HebrewFont = 'frank' | 'david' | 'assistant';

export type AudioVoiceMode = 'hebrew' | 'translit';

export type AudioSpeed = 0.75 | 1.0 | 1.25;

export interface KaddishVariant {
  standard: string;
  aseret: string;
  explanation: {
    es: string;
    en: string;
  };
}

export interface KaddishLine {
  id: string;
  sectionTitle?: {
    es: string;
    en: string;
  };
  sectionName?: string;
  hebrew: string;
  hebrewAseret?: string;
  translit: string;
  translitAseret?: string;
  translitIvris?: string;
  translitIvrisAseret?: string;
  phoneticGuide?: string;
  phoneticGuideAseret?: string;
  phoneticGuideIvris?: string;
  phoneticGuideIvrisAseret?: string;
  spanish: string;
  spanishAseret?: string;
  english: string;
  englishAseret?: string;
  inlineResponse?: {
    hebrew: string;
    translit: string;
    translitIvris?: string;
    spanish: string;
    english: string;
  };
  isCongregationResponse?: boolean;
  isResponsePrompt?: boolean;
  hasAseretVariant?: boolean;
  variantHighlight?: {
    hebrewStandard: string;
    hebrewAseret: string;
    translitStandard: string;
    translitAseret: string;
    translitIvrisStandard?: string;
    translitIvrisAseret?: string;
    spanishStandard: string;
    spanishAseret: string;
    englishStandard: string;
    englishAseret: string;
    tagLabel: {
      es: string;
      en: string;
    };
  };
  instruction?: {
    es: string;
    en: string;
  };
}

export interface KaddishPrayer {
  id: KaddishType;
  titleHebrew: string;
  titleTranslit: string;
  titleSpanish: string;
  titleEnglish: string;
  subtitleSpanish: string;
  subtitleEnglish: string;
  descriptionSpanish: string;
  descriptionEnglish: string;
  lines: KaddishLine[];
}

export interface HebrewDateInfo {
  day: number;
  month: number;
  monthName: string;
  monthNameHebrew: string;
  year: number;
  yearHebrew: string;
  formattedDateLatin: string;
  formattedDateHebrew: string;
  isAseretYemeiTeshuva: boolean;
  dayOfAseret?: number;
  specialDescription?: string;
}
