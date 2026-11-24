export type RelativeRelationship =
  | 'father'
  | 'mother'
  | 'grandfather_paternal'
  | 'grandmother_paternal'
  | 'grandfather_maternal'
  | 'grandmother_maternal'
  | 'brother'
  | 'sister'
  | 'son'
  | 'daughter'
  | 'uncle_paternal'
  | 'aunt_paternal'
  | 'uncle_maternal'
  | 'aunt_maternal'
  | 'spouse_husband'
  | 'spouse_wife'
  | 'father_in_law'
  | 'mother_in_law'
  | 'cousin'
  | 'other';

export interface RelativeCategoryInfo {
  id: RelativeRelationship;
  labelEs: string;
  hebrewLabel: string;
  group: 'Padres' | 'Abuelos' | 'Hermanos' | 'Hijos' | 'Tíos' | 'Cónyuge' | 'Otros';
  iconName: string;
}

export const RELATIVE_CATEGORIES: RelativeCategoryInfo[] = [
  // Padres
  { id: 'father', labelEs: 'Padre (Papá)', hebrewLabel: 'אָבִי מוֹרִי', group: 'Padres', iconName: 'User' },
  { id: 'mother', labelEs: 'Madre (Mamá)', hebrewLabel: 'אִמִּי מוֹרָתִי', group: 'Padres', iconName: 'Heart' },

  // Abuelos
  { id: 'grandfather_paternal', labelEs: 'Abuelo Paterno', hebrewLabel: 'סָבִי (מִצַּד הָאָב)', group: 'Abuelos', iconName: 'Crown' },
  { id: 'grandmother_paternal', labelEs: 'Abuela Paterna', hebrewLabel: 'סָבָתִי (מִצַּד הָאָב)', group: 'Abuelos', iconName: 'Sparkles' },
  { id: 'grandfather_maternal', labelEs: 'Abuelo Materno', hebrewLabel: 'סָבִי (מִצַּד הָאֵם)', group: 'Abuelos', iconName: 'Crown' },
  { id: 'grandmother_maternal', labelEs: 'Abuela Materna', hebrewLabel: 'סָבָתִי (מִצַּד הָאֵם)', group: 'Abuelos', iconName: 'Sparkles' },

  // Hermanos
  { id: 'brother', labelEs: 'Hermano', hebrewLabel: 'אָחִי', group: 'Hermanos', iconName: 'Users' },
  { id: 'sister', labelEs: 'Hermana', hebrewLabel: 'אֲחוֹתִי', group: 'Hermanos', iconName: 'Users' },

  // Hijos
  { id: 'son', labelEs: 'Hijo', hebrewLabel: 'בְּנִי', group: 'Hijos', iconName: 'Smile' },
  { id: 'daughter', labelEs: 'Hija', hebrewLabel: 'בִּתִּי', group: 'Hijos', iconName: 'Smile' },

  // Tíos
  { id: 'uncle_paternal', labelEs: 'Tío Paterno', hebrewLabel: 'דּוֹדִי (מִצַּד הָאָב)', group: 'Tíos', iconName: 'UserCheck' },
  { id: 'aunt_paternal', labelEs: 'Tía Paterna', hebrewLabel: 'דּוֹדָתִי (מִצַּד הָאָב)', group: 'Tíos', iconName: 'UserCheck' },
  { id: 'uncle_maternal', labelEs: 'Tío Materno', hebrewLabel: 'דּוֹדִי (מִצַּד הָאֵם)', group: 'Tíos', iconName: 'UserCheck' },
  { id: 'aunt_maternal', labelEs: 'Tía Materna', hebrewLabel: 'דּוֹדָתִי (מִצַּד הָאֵם)', group: 'Tíos', iconName: 'UserCheck' },

  // Cónyuge
  { id: 'spouse_husband', labelEs: 'Esposo / Marido', hebrewLabel: 'בַּעְלִי', group: 'Cónyuge', iconName: 'HeartHandshake' },
  { id: 'spouse_wife', labelEs: 'Esposa / Mujer', hebrewLabel: 'אִשְׁתִּי', group: 'Cónyuge', iconName: 'HeartHandshake' },

  // Otros
  { id: 'father_in_law', labelEs: 'Suegro', hebrewLabel: 'חָמִי', group: 'Otros', iconName: 'User' },
  { id: 'mother_in_law', labelEs: 'Suegra', hebrewLabel: 'חֲמוֹתִי', group: 'Otros', iconName: 'Heart' },
  { id: 'cousin', labelEs: 'Primo / Prima', hebrewLabel: 'בֶּן / בַּת דּוֹדִי', group: 'Otros', iconName: 'Users' },
  { id: 'other', labelEs: 'Otro familiar o amigo', hebrewLabel: 'יַקִּירִי', group: 'Otros', iconName: 'Flame' },
];

export interface FamilyMemorialItem {
  id: string;
  name: string; // e.g. "Abraham Cohen"
  hebrewName?: string; // e.g. "Avraham ben Yitzjak"
  relationship: RelativeRelationship;
  customRelationshipLabel?: string;
  inputType: 'gregorian' | 'hebrew';
  gregorianDate?: string; // YYYY-MM-DD
  afterSunset?: boolean;
  hebrewDay?: number;
  hebrewMonth?: string;
  hebrewYear?: number;
  cemeteryCity?: string;
  notes?: string;
  createdAt: string;
}

export interface UpcomingYahrzeitCalculation {
  relative: FamilyMemorialItem;
  hebrewDateString: string; // e.g. "15 de Tishrei (ט״ו תִּשְׁרֵי)"
  deathHebrewYear: number;
  calculatedYearCount: number; // e.g., 3rd Yahrzeit
  nextEveDate: Date; // Start evening (sunset)
  nextEveFormatted: string; // e.g. "martes 14 de octubre de 2026"
  nextDayDate: Date; // Main anniversary day
  nextDayFormatted: string; // e.g. "miércoles 15 de octubre de 2026"
  daysRemaining: number; // 0 = Today, 1 = Tomorrow, negative = passed earlier this year
  isToday: boolean;
  isTomorrow: boolean;
  isWithin30Days: boolean;
  isWithinMonth: boolean;
  instructions: string;
}

export interface YahrzeitNotificationSettings {
  enablePhoneNotifications: boolean;
  enableEmailNotifications: boolean;
  userEmail: string;
  notifyMonthStart: boolean; // 1° del mes calendario (resumen de Yurzaids del mes)
  notify15Days: boolean; // Alerta con 15 días de anticipación
  notify7Days: boolean; // Alerta con 1 semana (7 días) de anticipación
  notifyEve: boolean; // Alerta en la víspera (al atardecer para encender la vela)
  soundEnabled: boolean;
  lastCheckedDate?: string;
}

export interface ActiveYahrzeitAlert {
  id: string;
  type: 'month_start' | '15_days' | '7_days' | 'eve_today' | 'upcoming';
  relative: FamilyMemorialItem;
  calc: UpcomingYahrzeitCalculation;
  title: string;
  message: string;
  urgency: 'high' | 'medium' | 'info';
  daysRemaining: number;
}
