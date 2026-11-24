import { DerabananNusaj, DerabananNusajOption, KaddishPrayer, KaddishLine } from '../types/kaddish';
import { KADDISH_DERABBANAN } from './kaddishData';

export const DERABBANAN_NUSAJ_OPTIONS: DerabananNusajOption[] = [
  {
    id: 'sefaradi_standard',
    nameEs: 'Sefaradí Standard / Mizrají',
    subtitleEs: 'Yerushalmi, Jalabí, Shamí, Turco (Predeterminado)',
    isDefault: true,
    descriptionEs:
      'Versión tradicional estándar en comunidades Sefaradíes y Mizrajíes de Oriente Medio, Jerusalén, Siria, Turquía y Grecia. Incluye la formulación completa de la cláusula mesiánica "Veyatsmaj purqaneh".',
    differencesSummary: [
      'Cláusula mesiánica completa: "Veyatsmáj purqanéh viqarev Meshijéh"',
      'Sección Rabán: "vejayéi arijín, umazonei reviyei, ufurqaná min qadám avuhón divishmayá ve\'ar\'á"',
      'Cláusula final de paz: "Hu berajamáv ya\'aséh shalóm \'aléinu"',
    ],
  },
  {
    id: 'sefaradi_occidental',
    nameEs: 'Sefaradí Occidental / Marroquí',
    subtitleEs: 'Minhag Magrebí (Marruecos, Livorno, Ámsterdam, Túnez, Argelia)',
    isDefault: false,
    descriptionEs:
      'Tratado litúrgico del judaísmo hispano-portugués y magrebí. Se distingue por incorporar "Veyifroq \'amméh" tras la cláusula mesiánica, "Urevaj vehatsalá" en la bendición a los sabios y "Ve\'al kol yoshevei tevel" al pedir la paz.',
    differencesSummary: [
      'Cláusula mesiánica: Añade "וְיִפְרוֹק עַמֵּהּ" (Veyifroq \'amméh)',
      'Bendición a los Sabios: Añade "וּרְוַח וְהַצָּלָה" (Urevaj vehatsalá)',
      'Paz universal: Añade "וְעַל כָּל יוֹשְׁבֵי תֵבֵל" (Ve\'al kol yoshevei tevel)',
    ],
  },
  {
    id: 'ashkenaz',
    nameEs: 'Ashkenaz (Polin / Lita / Alemania)',
    subtitleEs: 'Tradición Germano-Polaca y Europa Oriental',
    isDefault: false,
    descriptionEs:
      'Variante común en las sinagogas de Europa Central y Oriental. Mantiene una formulación sobria sin la frase de aceleración mesiánica en días laborables comunes y omite "ve\'ar\'a" y "berajamav" en los cierres.',
    differencesSummary: [
      'Cláusula mesiánica: Formulación concisa sin "Veyatsmáj purqanéh..."',
      'Bendición a los Sabios: Concluye en "divishmayá" (sin "ve\'ar\'á")',
      'Cláusula de Paz: "Hu ya\'aséh shalóm" (sin "berajamáv")',
    ],
  },
  {
    id: 'chabad_ari',
    nameEs: 'Nusach Ari Z\'l / Chabad / Sefard',
    subtitleEs: 'Tradición Hasídica y Jabad Lubavitch',
    isDefault: false,
    descriptionEs:
      'Formulación mística estructurada por el Arízal (Rabí Yitzjak Luria) y adoptada por Jabad Lubavitch y el Nusaj Sefard Hasídico. Mantiene la cláusula mesiánica y emplea terminaciones gramaticales arameas específicas.',
    differencesSummary: [
      'Cláusula mesiánica: Mantiene "Veyatsmáj purqanéh viqarev Meshijéh"',
      'Bendición a los Sabios: Declina en arameo "verajaméi, vejayéi arijéi, umazonei reviyei..."',
      'Cláusula de Paz: "Hu ya\'aséh shalóm" (sin "berajamáv")',
    ],
  },
];

/**
 * Customizes Kadish Derabbanan lines based on the selected Nusaj / Minhag variant,
 * highlighting the specific words that differ from the Default Sefaradí Standard.
 */
export function getDerabananPrayerForNusaj(
  nusaj: DerabananNusaj = 'sefaradi_standard',
  isAseret: boolean = false
): KaddishPrayer {
  const basePrayer = KADDISH_DERABBANAN;

  if (nusaj === 'sefaradi_standard') {
    return basePrayer;
  }

  const newLines: KaddishLine[] = basePrayer.lines.map((line) => {
    // Line 2: Cláusula Mesiánica
    if (line.id === 'kd-2') {
      if (nusaj === 'sefaradi_occidental') {
        return {
          ...line,
          hebrew:
            'בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ, וְיַמְלִיךְ מַלְכוּתֵהּ, וְיַצְמַח פֻּרְקָנֵהּ וִיקָרֵב מְשִׁיחֵהּ, וְיִפְרוֹק עַמֵּהּ.',
          translit:
            "Be'almá di verá jir'utéh, veyamlíj maljutéh, veyatsmáj purqanéh viqarev Meshijéh, veyifroq 'amméh.",
          phoneticGuide:
            "Be-'al-MÁ di ve-RÁ jir-'u-TÉH, ve-yam-LÍJ mal-ju-TÉH, ve-yats-MÁJ pur-qa-NÉH vi-qa-RÉV Me-shi-JÉH, ve-yif-RÓQ 'am-MÉH.",
          spanish:
            'En el mundo que Él creó conforme a Su voluntad. Que establezca Su reinado, haga florecer Su redención, apresure la llegada de Su Ungido y redima a Su pueblo.',
          variantHighlight: {
            hebrewStandard: 'וִיקָרֵב מְשִׁיחֵהּ',
            hebrewAseret: 'וְיִפְרוֹק עַמֵּהּ',
            translitStandard: 'viqarev Meshijéh',
            translitAseret: "veyifroq 'amméh",
            spanishStandard: 'apresure la llegada de Su Ungido',
            spanishAseret: 'y redima a Su pueblo',
            englishStandard: 'hasten the coming of His Messiah',
            englishAseret: 'and redeem His people',
            tagLabel: {
              es: 'Añadido Nusaj Marroquí / Livorno: "+ וְיִפְרוֹק עַמֵּהּ" (Y redimirá a Su pueblo)',
              en: 'Moroccan Variant: "+ Veyifroq \'amméh"',
            },
          },
          hasAseretVariant: true,
        };
      } else if (nusaj === 'ashkenaz') {
        return {
          ...line,
          hebrew:
            'בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ, וְיַמְלִיךְ מַלְכוּתֵהּ בְּחַיֵּיכוֹן וּבְיוֹמֵיכוֹן...',
          translit: "Be'almá di verá jir'utéh, veyamlíj maljutéh bejayejón uvyomejón...",
          phoneticGuide: "Be-'al-MÁ di ve-RÁ jir-'u-TÉH, ve-yam-LÍJ mal-ju-TÉH be-ja-ye-JÓN...",
          spanish:
            'En el mundo que Él creó conforme a Su voluntad. Que establezca Su reinado en vuestras vidas y en vuestros días...',
          variantHighlight: {
            hebrewStandard: 'וְיַצְמַח פֻּרְקָנֵהּ וִיקָרֵב מְשִׁיחֵהּ',
            hebrewAseret: 'וְיַמְלִיךְ מַלְכוּתֵהּ',
            translitStandard: 'veyatsmáj purqanéh viqarev Meshijéh',
            translitAseret: 'veyamlíj maljutéh',
            spanishStandard: 'haga florecer Su redención y apresure la llegada de Su Ungido',
            spanishAseret: 'establezca Su reinado',
            englishStandard: 'cause His salvation to sprout',
            englishAseret: 'establish His kingdom',
            tagLabel: {
              es: 'Variante Ashkenazí: Formulación concisa sin la cláusula "Veyatsmáj..." en días laborables',
              en: 'Ashkenazi Variant: Direct phrasing without "Veyatsmaj..."',
            },
          },
          hasAseretVariant: true,
        };
      }
    }

    // Line 7: 'Al Yisraél / Bendición a los Sabios
    if (line.id === 'kd-rabbanan-special') {
      if (nusaj === 'sefaradi_occidental') {
        return {
          ...line,
          hebrew:
            'עַל יִשְׂרָאֵל וְעַל רַבָּנָן, וְעַל תַּלְמִידֵיהוֹן וְעַל כָּל תַּלְמִידֵי תַלְמִידֵיהוֹן, וְעַל כָּל מַאן דְּעָסְקִין בְּאוֹרַיְתָא קַדִּשְׁתָּא, דִּי בַאתְרָא הָדֵין וְדִי בְכָל אֲתַר וַאֲתַר, יְהֵא לְהוֹן וּלְכוֹן שְׁלָמָא רַבָּא, חִנָּא וְחִסְדָּא וְרַחֲמֵי, וְחַיֵּי אֲרִיכֵי, וּמְזוֹנֵי רְוִיחֵי, וּרְוַח וְהַצָּלָה מִן קֳדָם אֲבוּהוֹן דִּבִשְׁמַיָּא וְאַרְעָא, וְאִמְרוּ אָמֵן.',
          translit:
            "'Al Yisraél ve'al rabbanán, ve'al talmidehón ve'al kol talmidei talmidehón, ve'al kol man de'asqín be'oraitá qaddishtá, di ve'atrá hadén udi vejol atár va'atár, yehé lehón ulejón shelamá Rabbá, jiná vejisdá verajaméi, vejayéi arijéi, umazonei reviyei, urevaj vehatsalá min qadám avuhón divishmayá ve'ar'á, ve'imrú Amén.",
          spanish:
            'Sobre Israel y sobre los maestros... Haya para ellos y para vosotros gran paz celestial, gracia, benevolencia y misericordia, larga vida, abundante sustento, alivio y salvación de parte de su Padre celestial; y decid: Amén.',
          variantHighlight: {
            hebrewStandard: 'וּפֻרְקָנָא',
            hebrewAseret: 'וּרְוַח וְהַצָּלָה',
            translitStandard: 'ufurqaná',
            translitAseret: 'urevaj vehatsalá',
            spanishStandard: 'y redención',
            spanishAseret: 'alivio y salvación',
            englishStandard: 'and salvation',
            englishAseret: 'relief and deliverance',
            tagLabel: {
              es: 'Añadido Nusaj Marroquí / Magrebí: "+ וּרְוַח וְהַצָּלָה" (Alivio y salvación)',
              en: 'Moroccan Variant: "+ Urevaj vehatsala"',
            },
          },
          hasAseretVariant: true,
        };
      } else if (nusaj === 'ashkenaz') {
        return {
          ...line,
          hebrew:
            'עַל יִשְׂרָאֵל וְעַל רַבָּנָן, וְעַל תַּלְמִידֵיהוֹן וְעַל כָּל תַּלְמִידֵי תַלְמִידֵיהוֹן, וְעַל כָּל מַאן דְּעָסְקִין בְּאוֹרַיְתָא קַדִּשְׁתָּא, דִּי בַאתְרָא הָדֵין וְדִי בְכָל אֲתַר וַאֲתַר, יְהֵא לְהוֹן וּלְכוֹן שְׁלָמָא רַבָּא, חִנָּא וְחִסְדָּא וְרַחֲמֵי, וְחַיֵּי אֲרִיכֵי, וּמְזוֹנֵי רְוִיחֵי, וּפֻרְקָנָא מִן קֳדָם אֲבוּהוֹן דִּבִשְׁמַיָּא, וְאִמְרוּ אָמֵן.',
          translit:
            "'Al Yisraél ve'al rabbanán, ve'al talmidehón ve'al kol talmidei talmidehón, ve'al kol man de'asqín be'oraitá qaddishtá, di ve'atrá hadén udi vejol atár va'atár, yehé lehón ulejón shelamá Rabbá, jiná vejisdá verajaméi, vejayéi arijéi, umazonei reviyei, ufurqaná min qadám avuhón divishmayá, ve'imrú Amén.",
          spanish:
            'Sobre Israel y sobre los maestros... Haya para ellos y para vosotros gran paz celestial, gracia, benevolencia y misericordia, larga vida, abundante sustento y redención de parte de su Padre celestial; y decid: Amén.',
          variantHighlight: {
            hebrewStandard: 'דִּבִשְׁמַיָּא וְאַרְעָא',
            hebrewAseret: 'דִּבִשְׁמַיָּא',
            translitStandard: "divishmayá ve'ar'á",
            translitAseret: 'divishmayá',
            spanishStandard: 'que está en los cielos y en la tierra',
            spanishAseret: 'que está en los cielos',
            englishStandard: 'in heaven and earth',
            englishAseret: 'in heaven',
            tagLabel: {
              es: 'Variante Ashkenazí: Concluye en "divishmayá" (sin añadir "ve\'ar\'a")',
              en: 'Ashkenazi Variant: Concludes at "divishmaya"',
            },
          },
          hasAseretVariant: true,
        };
      } else if (nusaj === 'chabad_ari') {
        return {
          ...line,
          hebrew:
            'עַל יִשְׂרָאֵל וְעַל רַבָּנָן, וְעַל תַּלְמִידֵיהוֹן וְעַל כָּל תַּלְמִידֵי תַלְמִידֵיהוֹן, וְעַל כָּל מַאן דְּעָסְקִין בְּאוֹרַיְתָא קַדִּשְׁתָּא, דִּי בַאתְרָא הָדֵין וְדִי בְכָל אֲתַר וַאֲתַר, יְהֵא לְהוֹן וּלְכוֹן שְׁלָמָא רַבָּא, חִנָּא וְחִסְדָּא וְרַחֲמֵי, וְחַיֵּי אֲרִיכֵי, וּמְזוֹנֵי רְוִיחֵי, וּפֻרְקָנָא מִן קֳדָם אֲבוּהוֹן דִּבִשְׁמַיָּא וְאַרְעָא, וְאִמְרוּ אָמֵן.',
          translit:
            "'Al Yisraél ve'al rabbanán, ve'al talmidehón ve'al kol talmidei talmidehón, ve'al kol man de'asqín be'oraitá qaddishtá, di ve'atrá hadén udi vejol atár va'atár, yehé lehón ulejón shelamá Rabbá, jiná vejisdá verajaméi, vejayéi arijéi, umazonei reviyei, ufurqaná min qadám avuhón divishmayá ve'ar'á, ve'imrú Amén.",
          variantHighlight: {
            hebrewStandard: 'וְרַחֲמִין, וְחַיִּין אֲרִיכִין',
            hebrewAseret: 'וְרַחֲמֵי, וְחַיֵּי אֲרִיכֵי',
            translitStandard: 'verajamín, vejayéi arijín',
            translitAseret: 'verajaméi, vejayéi arijéi',
            spanishStandard: 'misericordia y larga vida',
            spanishAseret: 'misericordia y larga vida (declinación Hasídica)',
            englishStandard: 'mercy and long life',
            englishAseret: 'mercy and long life',
            tagLabel: {
              es: 'Variante Nusach Ari Z\'l (Chabad): Declinación aramea "verajaméi, vejayéi arijéi"',
              en: 'Nusach Ari Variant: Aramaic declension "verajamei"',
            },
          },
          hasAseretVariant: true,
        };
      }
    }

    // Line 8: 'Oseh shalom (Closing)
    if (line.id === 'kd-8') {
      if (nusaj === 'sefaradi_occidental') {
        return {
          ...line,
          hebrew:
            'עֹשֶׂה שָׁלוֹם בִּמְרוֹמָיו, הוּא בְּרַחֲמָיו יַעֲשֶׂה שָׁלוֹם עָלֵינוּ, וְעַל כָּל יִשְׂרָאֵל, וְעַל כָּל יוֹשְׁבֵי תֵבֵל, וְאִמְרוּ אָמֵן.',
          translit:
            "'Oséh shalóm bimromáv, Hu berajamáv ya'aséh shalóm 'aléinu, ve'al kol Yisraél, ve'al kol yoshevei tevel, ve'imrú Amén.",
          spanish:
            'El que hace la paz en Sus alturas, Él en Su misericordia haga la paz sobre nosotros, sobre todo Israel y sobre todos los habitantes de la Tierra; y decid: Amén.',
          variantHighlight: {
            hebrewStandard: 'וְעַל כָּל יִשְׂרָאֵל',
            hebrewAseret: 'וְעַל כָּל יוֹשְׁבֵי תֵבֵל',
            translitStandard: "ve'al kol Yisraél",
            translitAseret: "ve'al kol yoshevei tevel",
            spanishStandard: 'y sobre todo Israel',
            spanishAseret: 'y sobre todos los habitantes de la Tierra',
            englishStandard: 'and all Israel',
            englishAseret: 'and all inhabitants of the Earth',
            tagLabel: {
              es: 'Añadido Nusaj Marroquí / Livorno: "+ וְעַל כָּל יוֹשְׁבֵי תֵבֵל" (Y sobre todos los habitantes de la Tierra)',
              en: 'Moroccan Variant: "+ Ve\'al kol yoshevei tevel"',
            },
          },
          hasAseretVariant: true,
        };
      } else if (nusaj === 'ashkenaz' || nusaj === 'chabad_ari') {
        return {
          ...line,
          hebrew:
            'עֹשֶׂה שָׁלוֹם בִּמְרוֹמָיו, הוּא יַעֲשֶׂה שָׁלוֹם עָלֵינוּ, וְעַל כָּל יִשְׂרָאֵל, וְאִמְרוּ אָמֵן.',
          translit:
            "'Oséh shalóm bimromáv, Hu ya'aséh shalóm 'aléinu, ve'al kol Yisraél, ve'imrú Amén.",
          spanish:
            'El que hace la paz en Sus alturas, Él haga la paz sobre nosotros y sobre todo Israel; y decid: Amén.',
          variantHighlight: {
            hebrewStandard: 'הוּא בְּרַחֲמָיו יַעֲשֶׂה',
            hebrewAseret: 'הוּא יַעֲשֶׂה',
            translitStandard: "Hu berajamáv ya'aséh",
            translitAseret: "Hu ya'aséh",
            spanishStandard: 'Él en Su misericordia haga',
            spanishAseret: 'Él haga',
            englishStandard: 'He in His mercy make',
            englishAseret: 'He make',
            tagLabel: {
              es: nusaj === 'ashkenaz' ? 'Variante Ashkenazí: "Hu ya\'aséh shalóm" (sin "berajamáv")' : 'Variante Nusach Ari Z\'l: "Hu ya\'aséh shalóm" (sin "berajamáv")',
              en: 'Variant: Without "berajamav"',
            },
          },
          hasAseretVariant: true,
        };
      }
    }

    return line;
  });

  return {
    ...basePrayer,
    subtitleSpanish: `${
      DERABBANAN_NUSAJ_OPTIONS.find((o) => o.id === nusaj)?.nameEs || 'Sefaradí'
    } • Recitado tras el estudio de Torá, Mishná o Salmos`,
    lines: newLines,
  };
}
