import { HebrewDateInfo } from '../types/kaddish';

const MONTH_META: Record<
  string,
  { canonical: string; hebrew: string; num: number }
> = {
  Tishri: { canonical: 'Tishrei', hebrew: 'תִּשְׁרֵי', num: 7 },
  Tishrei: { canonical: 'Tishrei', hebrew: 'תִּשְׁרֵי', num: 7 },
  Heshvan: { canonical: 'Cheshvan', hebrew: 'חֶשְׁוָן', num: 8 },
  Cheshvan: { canonical: 'Cheshvan', hebrew: 'חֶשְׁוָן', num: 8 },
  Marcheshvan: { canonical: 'Cheshvan', hebrew: 'חֶשְׁוָן', num: 8 },
  Kislev: { canonical: 'Kislev', hebrew: 'כִּסְלֵו', num: 9 },
  Tevet: { canonical: 'Tevet', hebrew: 'טֵבֵת', num: 10 },
  Shevat: { canonical: "Sh'vat", hebrew: 'שְׁבָט', num: 11 },
  "Sh'vat": { canonical: "Sh'vat", hebrew: 'שְׁבָט', num: 11 },
  Adar: { canonical: 'Adar', hebrew: 'אֲדָר', num: 12 },
  'Adar I': { canonical: 'Adar I', hebrew: 'אֲדָר א׳', num: 12 },
  'Adar II': { canonical: 'Adar II', hebrew: 'אֲדָר ב׳', num: 13 },
  Nisan: { canonical: 'Nisan', hebrew: 'נִיסָן', num: 1 },
  Iyar: { canonical: 'Iyyar', hebrew: 'אִיָּיר', num: 2 },
  Iyyar: { canonical: 'Iyyar', hebrew: 'אִיָּיר', num: 2 },
  Sivan: { canonical: 'Sivan', hebrew: 'סִיוָן', num: 3 },
  Tamuz: { canonical: 'Tamuz', hebrew: 'תַּמּוּז', num: 4 },
  Tammuz: { canonical: 'Tamuz', hebrew: 'תַּמּוּז', num: 4 },
  Av: { canonical: 'Av', hebrew: 'אָב', num: 5 },
  Elul: { canonical: 'Elul', hebrew: 'אֱלוּל', num: 6 },
};

function toHebrewGematriya(num: number): string {
  let n = num % 1000;
  if (n <= 0) return '';

  const hundreds = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];

  const h = Math.floor(n / 100);
  n = n % 100;

  let tail = '';
  if (n === 15) {
    tail = 'טו';
  } else if (n === 16) {
    tail = 'טז';
  } else {
    tail = tens[Math.floor(n / 10)] + ones[n % 10];
  }

  const letters = (hundreds[h] || '') + tail;
  if (letters.length === 1) {
    return `${letters}׳`;
  }
  return `${letters.slice(0, -1)}״${letters.slice(-1)}`;
}

export function getHebrewDateInfo(date: Date = new Date()): HebrewDateInfo {
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-hebrew', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(date);

    const rawDay = parseInt(
      parts.find((p) => p.type === 'day')?.value || '1',
      10
    );
    const rawMonth = parts.find((p) => p.type === 'month')?.value || 'Tishri';
    const rawYear = parseInt(
      parts.find((p) => p.type === 'year')?.value || '5787',
      10
    );

    const day = Number.isNaN(rawDay) ? 1 : rawDay;
    const year = Number.isNaN(rawYear) ? 5787 : rawYear;
    const meta = MONTH_META[rawMonth] || {
      canonical: rawMonth,
      hebrew: rawMonth,
      num: 7,
    };

    const monthName = meta.canonical;
    const monthHebrew = meta.hebrew;
    const dayHebrew = toHebrewGematriya(day);
    const yearHebrew = toHebrewGematriya(year);

    // Aseret Yemei Teshuva: 1st through 10th of Tishrei (from Rosh Hashanah to Yom Kippur)
    const isAseret = monthName === 'Tishrei' && day >= 1 && day <= 10;

    let specialDescription = '';
    let dayOfAseret: number | undefined;

    if (isAseret) {
      dayOfAseret = day;
      if (day === 1) specialDescription = 'Rosh Hashaná 1 / ראש השנה א׳';
      else if (day === 2) specialDescription = 'Rosh Hashaná 2 / ראש השנה ב׳';
      else if (day === 3) specialDescription = 'Tzom Guedaliá / צום גדליה';
      else if (day === 10) specialDescription = 'Yom Kipur / יום כיפור';
      else
        specialDescription = `Día ${day} de Aseret Yemei Teshuvá / עשרת ימי תשובה`;
    }

    return {
      day,
      month: meta.num,
      monthName,
      monthNameHebrew: monthHebrew,
      year,
      yearHebrew,
      formattedDateLatin: `${day} de ${monthName}, ${year}`,
      formattedDateHebrew: `${dayHebrew} בְּ${monthHebrew} ${yearHebrew}`,
      isAseretYemeiTeshuva: isAseret,
      dayOfAseret,
      specialDescription,
    };
  } catch (err) {
    console.error('Error calculating Hebrew date:', err);
    return {
      day: 1,
      month: 7,
      monthName: 'Tishrei',
      monthNameHebrew: 'תִּשְׁרֵי',
      year: 5787,
      yearHebrew: 'תשפ״ז',
      formattedDateLatin: '1 de Tishrei, 5787',
      formattedDateHebrew: 'א׳ בְּתִשְׁרֵי תשפ״ז',
      isAseretYemeiTeshuva: true,
      dayOfAseret: 1,
      specialDescription: 'Rosh Hashaná 1',
    };
  }
}

/**
 * Creates a simulated Date in Aseret Yemei Teshuva (falls in September/October)
 */
export function getSampleAseretDate(): Date {
  // Search within the current year (Sep 1 to Oct 25) for 5 Tishrei
  const year = new Date().getFullYear();
  for (let offset = 0; offset < 60; offset++) {
    const candidate = new Date(year, 8, 1 + offset, 12, 0, 0);
    const info = getHebrewDateInfo(candidate);
    if (info.monthName === 'Tishrei' && info.day === 5) {
      return candidate;
    }
  }
  return new Date(year, 8, 20, 12, 0, 0);
}

/**
 * Creates a simulated Date in ordinary year (outside Tishrei 1-10)
 */
export function getSampleOrdinaryDate(): Date {
  const year = new Date().getFullYear();
  return new Date(year, 3, 15, 12, 0, 0);
}

