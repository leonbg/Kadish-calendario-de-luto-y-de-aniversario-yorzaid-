import { HDate, gematriya } from '@hebcal/core';

export type MourningCustom =
  | 'eleven_months' // 11 months Kaddish Yatom + 12th month Derabanan only
  | 'sephardic_twelve' // Sephardic / Ben Ish Chai 12 months
  | 'thirty_days'; // Sheloshim for non-parents (siblings, spouse, children)

export interface CalculatorInput {
  inputType: 'gregorian' | 'hebrew';
  gregorianDate?: string; // YYYY-MM-DD
  afterSunset?: boolean;
  hebrewDay?: number;
  hebrewMonth?: string;
  hebrewYear?: number;
  custom: MourningCustom;
  deceasedName?: string;
  hebrewName?: string;
  relation?: string;
}

export interface KaddishMilestone {
  id: string;
  title: string;
  hebrewTitle: string;
  gregorianDate: Date;
  gregorianFormatted: string;
  hebrewFormatted: string;
  serviceMilestone: string; // e.g., "Hasta Minjá (antes de Arbit)"
  description: string;
  actionRequired: string;
  isCompleted?: boolean;
}

export interface YahrzeitOccurrence {
  yearNumber: number;
  hebrewYear: number;
  hebrewYearFormatted: string;
  startDateEve: Date; // Sunset of previous evening
  startDateEveFormatted: string;
  dayDate: Date; // Main anniversary day
  dayDateFormatted: string;
  hebrewFormatted: string;
  instructions: string;
}

export interface CalculationResult {
  deathHebrewDate: HDate;
  deathHebrewFormatted: string;
  deathGregorianDate: Date;
  deathGregorianFormatted: string;
  deathGregorianISO: string;
  hebrewDay: number;
  hebrewMonth: string;
  hebrewYear: number;
  afterSunsetApplied: boolean;
  custom: MourningCustom;
  deceasedName: string;
  hebrewName?: string;
  milestones: KaddishMilestone[];
  upcomingYahrzeits: YahrzeitOccurrence[];
}

export const HEBREW_MONTHS_LIST = [
  { id: 'Tishrei', nameEs: 'Tishrei (תִּשְׁרֵי)', num: 7 },
  { id: 'Cheshvan', nameEs: 'Jeshván / Marjeshván (חֶשְׁוָן)', num: 8 },
  { id: 'Kislev', nameEs: 'Kislev (כִּסְלֵו)', num: 9 },
  { id: 'Tevet', nameEs: 'Tevet (טֵבֵת)', num: 10 },
  { id: "Sh'vat", nameEs: 'Shevat (שְׁבָט)', num: 11 },
  { id: 'Adar', nameEs: 'Adar (אֲדָר - en año regular)', num: 12 },
  { id: 'Adar I', nameEs: 'Adar I (אֲדָר א׳ - en año bisiesto)', num: 12 },
  { id: 'Adar II', nameEs: 'Adar II (אֲדָר ב׳ - en año bisiesto)', num: 13 },
  { id: 'Nisan', nameEs: 'Nisán (נִיסָן)', num: 1 },
  { id: 'Iyyar', nameEs: 'Iyar (אִיָּיר)', num: 2 },
  { id: 'Sivan', nameEs: 'Siván (סִיוָן)', num: 3 },
  { id: 'Tamuz', nameEs: 'Tamuz (תַּמּוּז)', num: 4 },
  { id: 'Av', nameEs: 'Av / Menajem Av (אָב)', num: 5 },
  { id: 'Elul', nameEs: 'Elul (אֱלוּל)', num: 6 },
];

const VALID_HEBREW_MONTHS = new Set(HEBREW_MONTHS_LIST.map((m) => m.id));

const MONTH_TRANSLATIONS: Record<string, string> = {
  Tishrei: 'Tishrei (תִּשְׁרֵי)',
  Cheshvan: 'Jeshván (חֶשְׁוָן)',
  Kislev: 'Kislev (כִּסְלֵו)',
  Tevet: 'Tevet (טֵבֵת)',
  "Sh'vat": 'Shevat (שְׁבָט)',
  Adar: 'Adar (אֲדָר)',
  'Adar I': 'Adar I (אֲדָר א׳)',
  'Adar II': 'Adar II (אֲדָר ב׳)',
  Nisan: 'Nisán (נִיסָן)',
  Iyyar: 'Iyar (אִיָּיר)',
  Sivan: 'Siván (סִיוָן)',
  Tamuz: 'Tamuz (תַּמּוּז)',
  Av: 'Av (אָב)',
  Elul: 'Elul (אֱלוּל)',
};

/**
 * Safely formats a Date to YYYY-MM-DD in local time without throwing on invalid dates.
 */
export function toSafeISODateString(date: Date): string {
  try {
    if (!date || isNaN(date.getTime())) {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`;
    }
    const y = date.getFullYear();
    if (y < 1000 || y > 9999) {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`;
    }
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return '2025-01-01';
  }
}

/**
 * Formats a JavaScript Date in clean Spanish localized format.
 */
export function formatSpanishDate(date: Date, includeWeekday = true): string {
  try {
    if (!date || isNaN(date.getTime())) {
      return 'Fecha en edición';
    }
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(includeWeekday ? { weekday: 'long' } : {}),
    };
    return date.toLocaleDateString('es-ES', options);
  } catch {
    return 'Fecha válida requerida';
  }
}

/**
 * Safely computes gematriya for a positive Hebrew year or day.
 */
export function safeGematriya(num: number): string {
  try {
    const clean = Math.max(1, Math.min(9999, Math.round(Number(num) || 1)));
    return gematriya(clean);
  } catch {
    return String(num || '');
  }
}

/**
 * Formats an HDate to a full human-readable string in Spanish and Hebrew.
 */
export function formatHebrewDateString(hDate: HDate): string {
  try {
    const day = hDate.getDate();
    const monthName = hDate.getMonthName();
    const year = hDate.getFullYear();
    const monthStr = MONTH_TRANSLATIONS[monthName] || monthName;
    const dayHeb = safeGematriya(day);
    const yearHeb = safeGematriya(year);

    return `${day} de ${monthStr} de ${year} (${dayHeb} ${yearHeb})`;
  } catch {
    return '15 de Tishrei de 5786';
  }
}

/**
 * Normalizes a Hebrew month name for a given Hebrew year (handles Adar / Adar I / Adar II).
 */
export function normalizeHebrewMonthForYear(monthName: string, hebrewYear: number): string {
  const cleanMonth = VALID_HEBREW_MONTHS.has(monthName) ? monthName : 'Tishrei';
  try {
    const isLeap = HDate.isLeapYear(hebrewYear);
    if (!isLeap && (cleanMonth === 'Adar I' || cleanMonth === 'Adar II')) {
      return 'Adar';
    }
    if (isLeap && cleanMonth === 'Adar') {
      return 'Adar II';
    }
    return cleanMonth;
  } catch {
    return 'Tishrei';
  }
}

/**
 * Safely constructs an HDate from day, monthName, and year, clamping out-of-range values
 * so @hebcal/core never throws an uncaught RangeError.
 */
export function createSafeHDate(rawDay?: number, rawMonth?: string, rawYear?: number): HDate {
  try {
    const currentHYear = new HDate(new Date()).getFullYear();
    let year = Number(rawYear);
    if (!Number.isFinite(year) || year < 3762 || year > 6760) {
      year = currentHYear;
    } else {
      year = Math.round(year);
    }

    const normalizedMonth = normalizeHebrewMonthForYear(rawMonth || 'Tishrei', year);
    const tempFirst = new HDate(1, normalizedMonth, year);
    const monthNum = tempFirst.getMonth();
    const maxDays = HDate.daysInMonth(monthNum, year);

    let day = Number(rawDay);
    if (!Number.isFinite(day) || day < 1) {
      day = 1;
    } else {
      day = Math.min(Math.round(day), maxDays);
    }

    return new HDate(day, normalizedMonth, year);
  } catch {
    return new HDate(new Date());
  }
}

/**
 * Safely parses a YYYY-MM-DD Gregorian string into a valid local Date at 12:00 noon.
 * Never returns an Invalid Date or 2-digit year < 1000.
 */
export function parseSafeGregorianString(rawDateStr?: string): Date {
  try {
    if (!rawDateStr || typeof rawDateStr !== 'string') {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    }
    const parts = rawDateStr.trim().split('-');
    if (parts.length !== 3) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    }
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);

    // While user is mid-typing a year in <input type="date"> (e.g. 0002 or 0202), fallback to current year
    const safeYear = Number.isFinite(y) && y >= 1500 && y <= 2500 ? Math.round(y) : new Date().getFullYear();
    const safeMonth = Number.isFinite(m) && m >= 1 && m <= 12 ? Math.round(m) : 1;
    const maxDaysInGregMonth = new Date(safeYear, safeMonth, 0).getDate();
    const safeDay =
      Number.isFinite(d) && d >= 1 ? Math.min(Math.round(d), maxDaysInGregMonth) : 1;

    const candidate = new Date(safeYear, safeMonth - 1, safeDay, 12, 0, 0);
    if (isNaN(candidate.getTime())) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    }
    return candidate;
  } catch {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  }
}

/**
 * Converts a Gregorian YYYY-MM-DD string (+ afterSunset) into Hebrew { day, month, year }.
 */
export function convertGregorianToHebrewFields(
  gregorianDateStr: string,
  afterSunset = false
): { hebrewDay: number; hebrewMonth: string; hebrewYear: number; formatted: string } {
  try {
    const gregBase = parseSafeGregorianString(gregorianDateStr);
    let hDate = new HDate(gregBase);
    if (afterSunset) {
      hDate = new HDate(hDate.abs() + 1);
    }
    return {
      hebrewDay: hDate.getDate(),
      hebrewMonth: hDate.getMonthName(),
      hebrewYear: hDate.getFullYear(),
      formatted: formatHebrewDateString(hDate),
    };
  } catch {
    const fallback = new HDate(new Date());
    return {
      hebrewDay: fallback.getDate(),
      hebrewMonth: fallback.getMonthName(),
      hebrewYear: fallback.getFullYear(),
      formatted: formatHebrewDateString(fallback),
    };
  }
}

/**
 * Converts Hebrew { day, month, year } into a Gregorian YYYY-MM-DD string and formatted Spanish date.
 */
export function convertHebrewToGregorianFields(
  hebrewDay: number,
  hebrewMonth: string,
  hebrewYear: number
): { gregorianDateStr: string; gregorianDate: Date; formatted: string } {
  try {
    const hDate = createSafeHDate(hebrewDay, hebrewMonth, hebrewYear);
    const greg = hDate.greg();
    return {
      gregorianDateStr: toSafeISODateString(greg),
      gregorianDate: greg,
      formatted: formatSpanishDate(greg),
    };
  } catch {
    const now = new Date();
    return {
      gregorianDateStr: toSafeISODateString(now),
      gregorianDate: now,
      formatted: formatSpanishDate(now),
    };
  }
}

/**
 * Calculates the exact Hebrew Date of passing from either gregorian input
 * (with afterSunset check) or direct Hebrew fields.
 */
export function computeBaseHebrewDate(input: CalculatorInput): {
  hDate: HDate;
  gregDate: Date;
  afterSunsetApplied: boolean;
} {
  try {
    if (input.inputType === 'hebrew') {
      const hDate = createSafeHDate(input.hebrewDay, input.hebrewMonth, input.hebrewYear);
      return {
        hDate,
        gregDate: hDate.greg(),
        afterSunsetApplied: false,
      };
    }

    // Gregorian input
    const gregBase = parseSafeGregorianString(input.gregorianDate);
    let hDate = new HDate(gregBase);
    let afterSunsetApplied = false;

    if (input.afterSunset) {
      // If passed away after sunset, it belongs to the NEXT Hebrew day (hDate + 1)
      const nextAbs = hDate.abs() + 1;
      hDate = new HDate(nextAbs);
      afterSunsetApplied = true;
    }

    return {
      hDate,
      gregDate: gregBase,
      afterSunsetApplied,
    };
  } catch {
    const now = new Date();
    return {
      hDate: new HDate(now),
      gregDate: now,
      afterSunsetApplied: false,
    };
  }
}

/**
 * Main Kaddish and Yahrzeit Timeline calculation engine.
 */
export function calculateKaddishTimeline(input: CalculatorInput): CalculationResult {
  const { hDate: baseHDate, gregDate, afterSunsetApplied } = computeBaseHebrewDate(input);
  const baseAbs = baseHDate.abs();
  const custom = input.custom || 'eleven_months';
  const name = input.deceasedName?.trim() || 'Familiar';

  const milestones: KaddishMilestone[] = [];

  // 1. Shiv'ah (7 Days)
  const shivaEndAbs = baseAbs + 6;
  const shivaHDate = new HDate(shivaEndAbs);
  const shivaGreg = shivaHDate.greg();
  milestones.push({
    id: 'shiva',
    title: "Fin del Duelo de Shiv'á (7 Días)",
    hebrewTitle: 'סִיּוּם הַשִּׁבְעָה',
    gregorianDate: shivaGreg,
    gregorianFormatted: formatSpanishDate(shivaGreg),
    hebrewFormatted: formatHebrewDateString(shivaHDate),
    serviceMilestone: 'Tras el rezo de Shajarit de la mañana',
    description:
      'Concluyen los 7 días de duelo estricto (Shiv\'á). Se aplica el principio "Miktsat hayom kekulo" (una parte del día cuenta como el día completo).',
    actionRequired:
      "Al terminar Shajarit de este 7º día, los dolientes se levantan formalmente de la Shiv'á y pueden calzarse zapatos de cuero y salir de casa.",
  });

  // 2. Sheloshim (30 Days)
  const sheloshimEndAbs = baseAbs + 29;
  const sheloshimHDate = new HDate(sheloshimEndAbs);
  const sheloshimGreg = sheloshimHDate.greg();
  milestones.push({
    id: 'sheloshim',
    title: 'Fin del Duelo de Sheloshim (30 Días)',
    hebrewTitle: 'סִיּוּם הַשְּׁלֹשִׁים',
    gregorianDate: sheloshimGreg,
    gregorianFormatted: formatSpanishDate(sheloshimGreg),
    hebrewFormatted: formatHebrewDateString(sheloshimHDate),
    serviceMilestone: 'Tras el rezo de Shajarit de la mañana',
    description:
      'Concluye el período de los 30 días (Sheloshim). Para parientes que no son padre o madre (cónyuge, hijos, hermanos), aquí finaliza la obligación de recitar Kadish.',
    actionRequired:
      'Para otros parientes finaliza el Kadish. Para padre o madre se continúa recitando Kadish según la costumbre comunitaria.',
  });

  // 3. Fin de los 11 Meses (Hito de Kadish Yatom)
  const deathDay = baseHDate.getDate();
  const deathMonth = baseHDate.getMonth();
  const deathYear = baseHDate.getFullYear();

  let elevenMonthsHDate: HDate;
  try {
    let targetMonth = deathMonth + 11;
    let targetYear = deathYear;
    if (!HDate.isLeapYear(deathYear) && targetMonth > 12) {
      targetMonth -= 12;
      targetYear += 1;
    } else if (HDate.isLeapYear(deathYear) && targetMonth > 13) {
      targetMonth -= 13;
      targetYear += 1;
    }

    const maxMonthsInTargetYear = HDate.isLeapYear(targetYear) ? 13 : 12;
    const clampedTargetMonth = Math.min(Math.max(1, targetMonth), maxMonthsInTargetYear);
    const maxDays = HDate.daysInMonth(clampedTargetMonth, targetYear);
    const targetDay = Math.min(deathDay, maxDays);
    elevenMonthsHDate = new HDate(targetDay, clampedTargetMonth, targetYear);
  } catch {
    elevenMonthsHDate = new HDate(baseAbs + 325);
  }

  const elevenMonthsGreg = elevenMonthsHDate.greg();

  if (custom === 'eleven_months') {
    milestones.push({
      id: 'eleven_months',
      title: 'Término de Kadish Yatom (11 Meses)',
      hebrewTitle: 'סִיּוּם קַדִּישׁ יָתוֹם (י״א חֳדָשִׁים)',
      gregorianDate: elevenMonthsGreg,
      gregorianFormatted: formatSpanishDate(elevenMonthsGreg),
      hebrewFormatted: formatHebrewDateString(elevenMonthsHDate),
      serviceMilestone: 'Último Kadish Yatom: en la Tefilá de Minjá (Tarde)',
      description:
        'Hito principal de 11 meses. Se cesa de recitar Kadish Yatom para honrar la memoria de los padres (para no aparentar que sus faltas requerían los 12 meses completos del Guehinam).',
      actionRequired:
        'El último Kadish Yatom se recita en Minjá de este día. A partir del rezo de Arbit (noche) de este día ya NO se dice Kadish Yatom.',
    });

    // 4. Mes 12 (Solo Kadish Derabanán)
    milestones.push({
      id: 'twelfth_month',
      title: 'Mes 12: Período Exclusivo de Kadish Derabanán',
      hebrewTitle: 'חֹדֶשׁ הַשְּׁנֵים עָשָׂר - קַדִּישׁ דְּרַבָּנָן בִּלְבַד',
      gregorianDate: elevenMonthsGreg,
      gregorianFormatted: `Desde ${formatSpanishDate(elevenMonthsGreg)} hasta el primer Yurzaid`,
      hebrewFormatted: `Desde ${formatHebrewDateString(elevenMonthsHDate)}`,
      serviceMilestone: 'Tras estudio de Torá, Mishná o Salmos',
      description:
        'Durante este duodécimo mes, el doliente NO recita Kadish Yatom en los rezos estándar, pero sí recita Kadish Derabanán tras estudiar Torá o Salmos en la congregación.',
      actionRequired:
        "Se recomienda estudiar capítulos de Mishnayot diariamente y recitar Kadish Derabanán (con la súplica «Al Yisrael ve'al rabbanan... Hu berajamav»).",
    });
  } else if (custom === 'sephardic_twelve') {
    milestones.push({
      id: 'sephardic_intermission',
      title: 'Pausa de 1 Semana / Conclusión Sefaradí',
      hebrewTitle: 'הַפְסָקָה וּמִנְהַג שְׁנֵים עָשָׂר חֹדֶשׁ',
      gregorianDate: elevenMonthsGreg,
      gregorianFormatted: formatSpanishDate(elevenMonthsGreg),
      hebrewFormatted: formatHebrewDateString(elevenMonthsHDate),
      serviceMilestone: 'Según la costumbre de Ben Ish Jai / Edot HaMizraj',
      description:
        'En la tradición de Ben Ish Jai y comunidades sefaradíes, se hace una pausa de 1 semana en el mes 11 y luego se continúa diciendo Kadish hasta completar los 12 meses exactos.',
      actionRequired:
        'Consultar con el rabino comunitario si en su congregación se reanuda Kadish Yatom tras la pausa de 7 días o se recita Kadish Derabanán hasta el año.',
    });
  }

  // 5. Yahrzeits / Yurzaid (Next 3 Years according to Hebrew Calendar)
  const upcomingYahrzeits: YahrzeitOccurrence[] = [];

  for (let offset = 1; offset <= 3; offset++) {
    const targetHYear = deathYear + offset;
    let yahrzeitHDate: HDate;

    try {
      const isDeathLeap = HDate.isLeapYear(deathYear);
      const isTargetLeap = HDate.isLeapYear(targetHYear);
      const monthName = baseHDate.getMonthName();

      let targetMonthName = monthName;
      if (!isDeathLeap && isTargetLeap && monthName === 'Adar') {
        targetMonthName = custom === 'sephardic_twelve' ? 'Adar II' : 'Adar I';
      } else if (
        isDeathLeap &&
        !isTargetLeap &&
        (monthName === 'Adar I' || monthName === 'Adar II')
      ) {
        targetMonthName = 'Adar';
      }

      yahrzeitHDate = createSafeHDate(deathDay, targetMonthName, targetHYear);
    } catch {
      yahrzeitHDate = new HDate(baseAbs + offset * 354);
    }

    const dayGreg = yahrzeitHDate.greg();
    const eveGreg = new Date(dayGreg.getTime() - 24 * 60 * 60 * 1000);

    upcomingYahrzeits.push({
      yearNumber: offset,
      hebrewYear: targetHYear,
      hebrewYearFormatted: safeGematriya(targetHYear),
      startDateEve: eveGreg,
      startDateEveFormatted: formatSpanishDate(eveGreg),
      dayDate: dayGreg,
      dayDateFormatted: formatSpanishDate(dayGreg),
      hebrewFormatted: formatHebrewDateString(yahrzeitHDate),
      instructions: `El ${offset}º Yurzaid / Aniversario comienza al atardecer del ${formatSpanishDate(
        eveGreg
      )} (se enciende la vela de 24 horas y se dice Kadish en Arbit de la noche) y concluye al anochecer del ${formatSpanishDate(
        dayGreg
      )} (Kadish en Shajarit de la mañana y Minjá de la tarde).`,
    });
  }

  return {
    deathHebrewDate: baseHDate,
    deathHebrewFormatted: formatHebrewDateString(baseHDate),
    deathGregorianDate: gregDate,
    deathGregorianFormatted: formatSpanishDate(gregDate, false),
    deathGregorianISO: toSafeISODateString(gregDate),
    hebrewDay: baseHDate.getDate(),
    hebrewMonth: baseHDate.getMonthName(),
    hebrewYear: baseHDate.getFullYear(),
    afterSunsetApplied,
    custom,
    deceasedName: name,
    hebrewName: input.hebrewName?.trim(),
    milestones,
    upcomingYahrzeits,
  };
}
