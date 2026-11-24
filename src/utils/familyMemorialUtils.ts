import { HDate } from '@hebcal/core';
import {
  FamilyMemorialItem,
  UpcomingYahrzeitCalculation,
  RELATIVE_CATEGORIES,
  RelativeRelationship,
} from '../types/familyMemorial';
import {
  formatSpanishDate,
  HEBREW_MONTHS_LIST,
  createSafeHDate,
  parseSafeGregorianString,
  safeGematriya,
} from './kaddishCalculator';

const STORAGE_KEY = 'kaddish_family_memorials';

/**
 * Gets human readable label for relationship.
 */
export function getRelationshipLabel(rel: string): string {
  const found = RELATIVE_CATEGORIES.find((c) => c.id === rel);
  return found ? found.labelEs : rel || 'Familiar';
}

/**
 * Gets the Hebrew label for relationship.
 */
export function getRelationshipHebrewLabel(rel: string): string {
  const found = RELATIVE_CATEGORIES.find((c) => c.id === rel);
  return found ? found.hebrewLabel : '';
}

/**
 * Computes base Hebrew Date from FamilyMemorialItem safely without throwing on partial/invalid dates.
 */
export function getBaseHebrewDateFromItem(item: FamilyMemorialItem): HDate {
  try {
    if (item.inputType === 'hebrew') {
      return createSafeHDate(item.hebrewDay, item.hebrewMonth, item.hebrewYear);
    }

    if (item.gregorianDate) {
      const dt = parseSafeGregorianString(item.gregorianDate);
      let hDate = new HDate(dt);
      if (item.afterSunset) {
        hDate = new HDate(hDate.abs() + 1);
      }
      return hDate;
    }

    return new HDate(new Date());
  } catch {
    return new HDate(new Date());
  }
}

/**
 * Calculates the next upcoming Yahrzeit for a relative starting from a reference date (defaults to today).
 */
export function calculateNextYahrzeit(
  item: FamilyMemorialItem,
  referenceDate = new Date()
): UpcomingYahrzeitCalculation {
  const baseHDate = getBaseHebrewDateFromItem(item);
  const deathDay = baseHDate.getDate();
  const deathMonth = baseHDate.getMonthName();
  const deathYear = baseHDate.getFullYear();

  const safeRefDate =
    referenceDate && !isNaN(referenceDate.getTime()) ? referenceDate : new Date();
  const refHDate = new HDate(safeRefDate);
  const currentHYear = refHDate.getFullYear();

  // Determine target Hebrew Year
  let targetHYear = currentHYear;

  const getYahrzeitForYear = (hYear: number): { dayGreg: Date; eveGreg: Date; hDate: HDate } => {
    let targetMonth = deathMonth;
    const isDeathLeap = HDate.isLeapYear(deathYear);
    const isTargetLeap = HDate.isLeapYear(hYear);

    if (!isDeathLeap && isTargetLeap && deathMonth === 'Adar') {
      targetMonth = 'Adar II'; // Sephardic / general convention
    } else if (
      isDeathLeap &&
      !isTargetLeap &&
      (deathMonth === 'Adar I' || deathMonth === 'Adar II')
    ) {
      targetMonth = 'Adar';
    }

    const hDateTemp = createSafeHDate(deathDay, targetMonth, hYear);
    const dayGreg = hDateTemp.greg();
    const eveGreg = new Date(dayGreg.getTime() - 24 * 60 * 60 * 1000);
    return { dayGreg, eveGreg, hDate: hDateTemp };
  };

  let candidate = getYahrzeitForYear(targetHYear);

  // If candidate dayGreg is in the past, advance to next year
  const refMidnight = new Date(
    safeRefDate.getFullYear(),
    safeRefDate.getMonth(),
    safeRefDate.getDate()
  ).getTime();
  const candidateMidnight = new Date(
    candidate.dayGreg.getFullYear(),
    candidate.dayGreg.getMonth(),
    candidate.dayGreg.getDate()
  ).getTime();

  if (candidateMidnight < refMidnight) {
    targetHYear += 1;
    candidate = getYahrzeitForYear(targetHYear);
  }

  const diffMs = candidateMidnight - refMidnight;
  const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const isToday = daysRemaining === 0;
  const isTomorrow = daysRemaining === 1;
  const isWithin30Days = daysRemaining >= 0 && daysRemaining <= 30;

  // Check if it falls in the current calendar month
  const isWithinMonth =
    candidate.dayGreg.getMonth() === safeRefDate.getMonth() &&
    candidate.dayGreg.getFullYear() === safeRefDate.getFullYear();

  const calculatedYearCount = Math.max(1, targetHYear - deathYear);

  const monthEs =
    HEBREW_MONTHS_LIST.find((m) => m.id === candidate.hDate.getMonthName())?.nameEs ||
    candidate.hDate.getMonthName();

  const hebrewDateString = `${candidate.hDate.getDate()} de ${monthEs} (${safeGematriya(
    candidate.hDate.getDate()
  )})`;

  const instructions = `El ${calculatedYearCount}º Yurzaid comienza al atardecer del ${formatSpanishDate(
    candidate.eveGreg
  )} (encendido de la vela de 24 horas y Kadish en Arbit) y concluye al anochecer del ${formatSpanishDate(
    candidate.dayGreg
  )} (Kadish en Shajarit y Minjá).`;

  return {
    relative: item,
    hebrewDateString,
    deathHebrewYear: deathYear,
    calculatedYearCount,
    nextEveDate: candidate.eveGreg,
    nextEveFormatted: formatSpanishDate(candidate.eveGreg),
    nextDayDate: candidate.dayGreg,
    nextDayFormatted: formatSpanishDate(candidate.dayGreg),
    daysRemaining,
    isToday,
    isTomorrow,
    isWithin30Days,
    isWithinMonth,
    instructions,
  };
}

/**
 * Calculates the Yahrzeit occurrence for a relative specifically falling in targetGregorianYear.
 * Guarantees that browsing past or future years in the calendar displays candles accurately.
 */
export function calculateYahrzeitForSpecificYear(
  item: FamilyMemorialItem,
  targetGregorianYear: number
): UpcomingYahrzeitCalculation {
  const baseHDate = getBaseHebrewDateFromItem(item);
  const deathDay = baseHDate.getDate();
  const deathMonth = baseHDate.getMonthName();
  const deathYear = baseHDate.getFullYear();

  const safeTargetGregYear =
    Number.isFinite(targetGregorianYear) && targetGregorianYear >= 1900 && targetGregorianYear <= 2200
      ? Math.round(targetGregorianYear)
      : new Date().getFullYear();

  // Test Hebrew years that correspond to targetGregorianYear
  const candidateHYears = [
    safeTargetGregYear + 3759,
    safeTargetGregYear + 3760,
    safeTargetGregYear + 3761,
    safeTargetGregYear + 3762,
  ];

  let selectedCandidate: { dayGreg: Date; eveGreg: Date; hDate: HDate; hYear: number } | null = null;

  for (const hYear of candidateHYears) {
    let targetMonth = deathMonth;
    const isDeathLeap = HDate.isLeapYear(deathYear);
    const isTargetLeap = HDate.isLeapYear(hYear);

    if (!isDeathLeap && isTargetLeap && deathMonth === 'Adar') {
      targetMonth = 'Adar II';
    } else if (
      isDeathLeap &&
      !isTargetLeap &&
      (deathMonth === 'Adar I' || deathMonth === 'Adar II')
    ) {
      targetMonth = 'Adar';
    }

    const hDateTemp = createSafeHDate(deathDay, targetMonth, hYear);
    const dayGreg = hDateTemp.greg();
    const eveGreg = new Date(dayGreg.getTime() - 24 * 60 * 60 * 1000);

    if (
      dayGreg.getFullYear() === safeTargetGregYear ||
      eveGreg.getFullYear() === safeTargetGregYear
    ) {
      selectedCandidate = { dayGreg, eveGreg, hDate: hDateTemp, hYear };
      break;
    }
  }

  // Fallback if none matched
  if (!selectedCandidate) {
    return calculateNextYahrzeit(item, new Date(safeTargetGregYear, 0, 1));
  }

  const { dayGreg, eveGreg, hDate, hYear } = selectedCandidate;

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dayMidnight = new Date(dayGreg.getFullYear(), dayGreg.getMonth(), dayGreg.getDate()).getTime();
  const diffMs = dayMidnight - todayMidnight;
  const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const isToday = daysRemaining === 0;
  const isTomorrow = daysRemaining === 1;
  const isWithin30Days = daysRemaining >= 0 && daysRemaining <= 30;
  const isWithinMonth =
    dayGreg.getMonth() === today.getMonth() && dayGreg.getFullYear() === today.getFullYear();

  const calculatedYearCount = Math.max(1, hYear - deathYear);

  const monthEs =
    HEBREW_MONTHS_LIST.find((m) => m.id === hDate.getMonthName())?.nameEs ||
    hDate.getMonthName();

  const hebrewDateString = `${hDate.getDate()} de ${monthEs} (${safeGematriya(hDate.getDate())})`;

  const instructions = `El ${calculatedYearCount}º Yurzaid comienza al atardecer del ${formatSpanishDate(
    eveGreg
  )} (encendido de la vela de 24 horas y Kadish en Arbit) y concluye al anochecer del ${formatSpanishDate(
    dayGreg
  )} (Kadish en Shajarit y Minjá).`;

  return {
    relative: item,
    hebrewDateString,
    deathHebrewYear: deathYear,
    calculatedYearCount,
    nextEveDate: eveGreg,
    nextEveFormatted: formatSpanishDate(eveGreg),
    nextDayDate: dayGreg,
    nextDayFormatted: formatSpanishDate(dayGreg),
    daysRemaining,
    isToday,
    isTomorrow,
    isWithin30Days,
    isWithinMonth,
    instructions,
  };
}

/**
 * Loads family memorials from localStorage.
 */
export function loadFamilyMemorials(): FamilyMemorialItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial realistic samples if first time
      const defaultSamples: FamilyMemorialItem[] = [
        {
          id: 'sample-1',
          name: 'David ben Yosef',
          hebrewName: 'דָּוִד בֶּן יוֹסֵף',
          relationship: 'father',
          inputType: 'hebrew',
          hebrewDay: 15,
          hebrewMonth: 'Tishrei',
          hebrewYear: 5778,
          notes: 'Encender vela de aceite de oliva y decir Kadish en Minyán Sefaradí',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sample-2',
          name: 'Sarah bat Avraham',
          hebrewName: 'שָׂרָה בַּת אַבְרָהָם',
          relationship: 'mother',
          inputType: 'gregorian',
          gregorianDate: '2019-10-18',
          afterSunset: true,
          notes: 'Madre querida. Donar tzedaká en su memoria.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sample-3',
          name: 'Yitzjak Cohen',
          hebrewName: 'יִצְחָק בֶּן שְׁלֹמֹה',
          relationship: 'grandfather_paternal',
          inputType: 'hebrew',
          hebrewDay: 10,
          hebrewMonth: 'Cheshvan',
          hebrewYear: 5765,
          notes: 'Abuelo querido',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSamples));
      return defaultSamples;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves family memorials to localStorage.
 */
export function saveFamilyMemorials(items: FamilyMemorialItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save family memorials', err);
  }
}

// ----------------------------------------------------------------------
// EXPORT & IMPORT UTILITIES (CalJ / iCalendar .ics / JSON / CSV)
// ----------------------------------------------------------------------

/**
 * Helper to trigger file download in browser.
 */
function triggerFileDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates iCalendar (.ics) export compatible with CalJ, Google Calendar, Apple Calendar & Outlook.
 * Includes upcoming yahrzeit events for the next 5 years per relative.
 */
export function exportToICS(items: FamilyMemorialItem[]): void {
  const now = new Date();
  const formatICSDate = (dt: Date) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  };

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sidur Kadish Sefarad//CalJ Yahrzeit Exporter//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Aniversarios de Yurzaid / CalJ',
    'X-WR-TIMEZONE:UTC',
  ];

  // Calculate upcoming yahrzeits for the next 5 years for each memorial
  items.forEach((item) => {
    for (let yearOffset = 0; yearOffset < 5; yearOffset++) {
      const refDate = new Date(now.getFullYear() + yearOffset, now.getMonth(), now.getDate());
      const calc = calculateNextYahrzeit(item, refDate);

      const startDateStr = formatICSDate(calc.nextEveDate);
      const endDateStr = formatICSDate(
        new Date(calc.nextDayDate.getTime() + 24 * 60 * 60 * 1000)
      );

      const summary = `🕯️ Yurzaid: ${item.name}${item.hebrewName ? ` (${item.hebrewName})` : ''}`;
      const description = `Azkará y Yurzaid (${calc.calculatedYearCount}º Año)\\n` +
        `Parentesco: ${getRelationshipLabel(item.relationship)}\\n` +
        `Fecha Hebrea: ${calc.hebrewDateString}\\n` +
        `Encendido de vela: Atardecer del ${calc.nextEveFormatted}\\n` +
        `Lectura de Kadish: ${calc.nextDayFormatted}\\n` +
        (item.notes ? `Notas: ${item.notes.replace(/\n/g, ' ')}` : '');

      const uid = `yahrzeit-${item.id}-${calc.deathHebrewYear + calc.calculatedYearCount}@sidur-kadish.org`;

      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatICSDate(now)}T120000Z`,
        `DTSTART;VALUE=DATE:${startDateStr}`,
        `DTEND;VALUE=DATE:${endDateStr}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `CATEGORIES:Yurzaid,CalJ,Aniversario,Judaísmo`,
        'STATUS:CONFIRMED',
        'TRANSP:TRANSPARENT',
        // Alarma 15 días antes
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:Alerta 15 días: Próximo Yurzaid de ${item.name}`,
        'TRIGGER:-P15D',
        'END:VALARM',
        // Alarma 7 días (1 semana) antes
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:Alerta 1 semana: Próximo Yurzaid de ${item.name}`,
        'TRIGGER:-P7D',
        'END:VALARM',
        // Alarma 12h antes (mañana de la víspera)
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:¡Hoy enciende la vela de Yurzaid de 24h para ${item.name}!`,
        'TRIGGER:-PT12H',
        'END:VALARM',
        // Alarma 2h antes del atardecer
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:Atardecer: Encender vela de 24 horas y asistir al rezo de Kadish para ${item.name}`,
        'TRIGGER:-PT2H',
        'END:VALARM',
        'END:VEVENT'
      );
    }
  });

  lines.push('END:VCALENDAR');
  const content = lines.join('\r\n');
  triggerFileDownload('Aniversarios_Yahrzeit_CalJ.ics', content, 'text/calendar;charset=utf-8');
}

/**
 * Exports data as CalJ-compatible JSON backup.
 */
export function exportToJSON(items: FamilyMemorialItem[]): void {
  const data = {
    version: '1.0',
    app: 'Sidur Kadish & CalJ Exporter',
    exportedAt: new Date().toISOString(),
    memorials: items,
  };
  triggerFileDownload(
    'Aniversarios_Yahrzeit_CalJ.json',
    JSON.stringify(data, null, 2),
    'application/json;charset=utf-8'
  );
}

/**
 * Exports data as CSV spreadsheet format compatible with CalJ / Excel.
 */
export function exportToCSV(items: FamilyMemorialItem[]): void {
  const headers = [
    'ID',
    'Nombre',
    'NombreHebreo',
    'Parentesco',
    'TipoEntrada',
    'FechaGregoriana',
    'PuestaSol',
    'DiaHebreo',
    'MesHebreo',
    'AnoHebreo',
    'Notas',
  ];

  const escapeCSV = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    return `"${String(str).replace(/"/g, '""')}"`;
  };

  const rows = items.map((i) => [
    escapeCSV(i.id),
    escapeCSV(i.name),
    escapeCSV(i.hebrewName),
    escapeCSV(i.relationship),
    escapeCSV(i.inputType),
    escapeCSV(i.gregorianDate),
    escapeCSV(i.afterSunset ? 'SI' : 'NO'),
    escapeCSV(i.hebrewDay),
    escapeCSV(i.hebrewMonth),
    escapeCSV(i.hebrewYear),
    escapeCSV(i.notes),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  triggerFileDownload('Aniversarios_Yahrzeit_CalJ.csv', csvContent, 'text/csv;charset=utf-8');
}

/**
 * Parses imported text file (JSON, CSV, or ICS) and converts into FamilyMemorialItem[].
 */
export async function parseImportFile(
  fileContent: string,
  fileName: string
): Promise<{ items: FamilyMemorialItem[]; importedCount: number }> {
  const items: FamilyMemorialItem[] = [];

  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith('.json') || fileContent.trim().startsWith('{') || fileContent.trim().startsWith('[')) {
    // Process JSON format
    try {
      const parsed = JSON.parse(fileContent);
      const list: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.memorials)
        ? parsed.memorials
        : Array.isArray(parsed.yahrzeits)
        ? parsed.yahrzeits
        : Array.isArray(parsed.items)
        ? parsed.items
        : [];

      list.forEach((entry: any, index: number) => {
        if (!entry.name && !entry.nom && !entry.nombre) return;

        items.push({
          id: entry.id || `import-${Date.now()}-${index}`,
          name: entry.name || entry.nom || entry.nombre || 'Familiar',
          hebrewName: entry.hebrewName || entry.nomHebreu || entry.nombreHebreo || '',
          relationship: (entry.relationship || entry.parentesco || entry.relation || 'other') as RelativeRelationship,
          inputType: entry.inputType || (entry.gregorianDate || entry.dateGrego ? 'gregorian' : 'hebrew'),
          gregorianDate: entry.gregorianDate || entry.dateGrego || entry.date || '',
          afterSunset: Boolean(entry.afterSunset || entry.apresCoucher),
          hebrewDay: Number(entry.hebrewDay || entry.jourHebreu || 1),
          hebrewMonth: entry.hebrewMonth || entry.moisHebreu || 'Tishrei',
          hebrewYear: Number(entry.hebrewYear || entry.anneeHebreu || 5780),
          notes: entry.notes || entry.remarques || '',
          createdAt: entry.createdAt || new Date().toISOString(),
        });
      });
    } catch (err) {
      throw new Error('El archivo JSON no tiene un formato válido.');
    }
  } else if (lowerName.endsWith('.csv') || fileContent.includes(',')) {
    // Process CSV format
    const lines = fileContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length > 1) {
      // First line header
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (!cols[1] && !cols[0]) continue;

        // Typical column mappings: ID, Name, HebrewName, Relationship, InputType, GregorianDate, Sunset, Day, Month, Year, Notes
        const name = cols[1] || cols[0];
        if (!name || name === 'Nombre' || name === 'Name') continue;

        items.push({
          id: cols[0] || `csv-import-${Date.now()}-${i}`,
          name,
          hebrewName: cols[2] || '',
          relationship: (cols[3] || 'other') as RelativeRelationship,
          inputType: (cols[4] === 'gregorian' || cols[5]) ? 'gregorian' : 'hebrew',
          gregorianDate: cols[5] || '',
          afterSunset: cols[6] === 'SI' || cols[6] === 'true',
          hebrewDay: Number(cols[7]) || 1,
          hebrewMonth: cols[8] || 'Tishrei',
          hebrewYear: Number(cols[9]) || 5780,
          notes: cols[10] || '',
          createdAt: new Date().toISOString(),
        });
      }
    }
  } else if (lowerName.endsWith('.ics') || fileContent.includes('BEGIN:VCALENDAR')) {
    // Process iCalendar (.ics) format from CalJ or Outlook
    const events = fileContent.split('BEGIN:VEVENT');
    events.slice(1).forEach((ev, idx) => {
      const summaryMatch = ev.match(/SUMMARY:(.*)/i);
      const dtStartMatch = ev.match(/DTSTART;?.*:(.*)/i);
      const descMatch = ev.match(/DESCRIPTION:(.*)/i);

      if (summaryMatch) {
        let name = summaryMatch[1].replace(/🕯️|Yurzaid:|Yahrzeit:|Azkará:/gi, '').trim();
        let hebrewName = '';
        if (name.includes('(') && name.includes(')')) {
          const parts = name.split('(');
          name = parts[0].trim();
          hebrewName = parts[1].replace(')', '').trim();
        }

        let gregDate = '';
        if (dtStartMatch) {
          const rawDt = dtStartMatch[1].trim();
          if (rawDt.length >= 8) {
            const y = rawDt.substring(0, 4);
            const m = rawDt.substring(4, 6);
            const d = rawDt.substring(6, 8);
            gregDate = `${y}-${m}-${d}`;
          }
        }

        items.push({
          id: `ics-import-${Date.now()}-${idx}`,
          name: name || 'Aniversario Importado',
          hebrewName,
          relationship: 'other',
          inputType: gregDate ? 'gregorian' : 'hebrew',
          gregorianDate: gregDate || '2020-01-01',
          afterSunset: false,
          notes: descMatch ? descMatch[1].replace(/\\n/g, ' ') : 'Importado de CalJ / iCal',
          createdAt: new Date().toISOString(),
        });
      }
    });
  }

  return { items, importedCount: items.length };
}
