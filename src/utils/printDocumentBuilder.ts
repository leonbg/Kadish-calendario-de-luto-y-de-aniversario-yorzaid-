import { KaddishPrayer, KaddishType, DerabananNusaj, TranslitTradition } from '../types/kaddish';
import {
  KADDISH_YATOM,
  KADDISH_DERABBANAN,
  KADDISH_CHATZI,
  KADDISH_SHALEM,
  KADDISH_PRAYERS,
} from '../data/kaddishData';
import {
  getDerabananPrayerForNusaj,
  DERABBANAN_NUSAJ_OPTIONS,
} from '../data/derabananVariants';

export type PrintFormatSize =
  | 'quarter_letter'
  | 'half_letter'
  | 'sixth_letter'
  | 'bimah_laminated'
  | 'card_wallet'
  | 'card_half_wallet'
  | 'card_pocket'
  | 'suit_pocket'
  | 'full_letter';

export type BimahPaperSize = 'letter' | 'a4';
export type TextArrangement = 'separate_blocks' | 'interlinear';
export type SmallCardPrintVariant = 'duplex' | 'foldable' | 'single_heb' | 'single_fon';
export type CardOrientation = 'vertical' | 'horizontal';
export type AlIsraelBannerStyle = 'gray_universal' | 'blue_contrast' | 'none';
export type AseretPrintVariant = 'standard' | 'annotated' | 'marked_aseret';

export interface PrintDocumentOptions {
  selectedFormat: PrintFormatSize;
  cardOrientation: CardOrientation;
  bimahPaperSize: BimahPaperSize;
  selectedKaddishType: KaddishType;
  printDerabananNusaj: DerabananNusaj;
  comparisonDerabananNusaj: DerabananNusaj;
  useNusajComparison: boolean;
  alIsraelBannerStyle?: AlIsraelBannerStyle;
  useBlueBanner?: boolean;
  translitTradition?: TranslitTradition;
  cardFontScale: number;
  hebrewWeight: 'extra_bold' | 'bold';
  textArrangement: TextArrangement;
  smallCardVariant: SmallCardPrintVariant;
  includeHebrew: boolean;
  includePhonetics: boolean;
  includeSpanish: boolean;
  includeReverenceGuide: boolean;
  includeDecorativeBorder: boolean;
  duplicateTwoUp: boolean;
  dedicationName: string;
  dedicationHebrewName: string;
  dedicationDate: string;
  isAseret: boolean;
  aseretPrintVariant?: AseretPrintVariant;
}

export interface CardDimensions {
  widthMm: number;
  heightMm: number;
  widthCm: string;
  heightCm: string;
  label: string;
  isCardFormat: boolean;
}

export interface PrintDocumentResult {
  title: string;
  contentHtml: string;
  cssStyles: string;
  fullHtmlDocument: string;
  cardDimensions: CardDimensions;
  singleCardHebrewHtml: string;
  singleCardPhoneticHtml: string;
  singleCardFoldableHtml: string;
  getSingleCardHtml: (side: 'hebrew' | 'phonetic' | 'both') => string;
  getSingleCardPreviewDocument: (side: 'hebrew' | 'phonetic' | 'both') => string;
  getFullSheetPreviewDocument: () => string;
}

export function buildPrintDocument(options: PrintDocumentOptions): PrintDocumentResult {
  const {
    selectedFormat,
    cardOrientation,
    bimahPaperSize,
    selectedKaddishType,
    printDerabananNusaj,
    comparisonDerabananNusaj,
    useNusajComparison,
    cardFontScale,
    hebrewWeight,
    textArrangement,
    smallCardVariant,
    includeHebrew,
    includePhonetics,
    includeSpanish,
    includeReverenceGuide,
    includeDecorativeBorder,
    duplicateTwoUp,
    dedicationName,
    dedicationHebrewName,
    dedicationDate,
    isAseret,
  } = options;

  const bannerStyle: AlIsraelBannerStyle =
    options.alIsraelBannerStyle ||
    (options.useBlueBanner ? 'blue_contrast' : 'gray_universal');
  const isUniversalProposal = selectedKaddishType === 'derabanan' && bannerStyle === 'gray_universal';

  const currentPrayer = KADDISH_PRAYERS[selectedKaddishType] || KADDISH_YATOM;
  const prayer =
    selectedKaddishType === 'derabanan'
      ? getDerabananPrayerForNusaj(printDerabananNusaj, isAseret)
      : currentPrayer;

  const isA4 = bimahPaperSize === 'a4';
  const paperName = isA4 ? 'A4 (21.0 × 29.7 cm)' : 'Carta / Letter (21.6 × 27.9 cm)';
  const halfPaperName = isA4 ? 'Media A4 / A5 (14.8 × 21.0 cm)' : 'Media Carta (14.0 × 21.6 cm / 5.5" × 8.5")';

  const isVertical = cardOrientation === 'vertical';
  const walletDimensions = isVertical ? '5.8 × 8.8 cm (Vertical)' : '8.8 × 5.6 cm (Horizontal)';
  const walletCopies = isVertical ? 9 : 8;
  const halfWalletDimensions = isVertical ? '4.8 × 9.5 cm (Vertical)' : '9.5 × 4.8 cm (Horizontal)';
  const halfWalletCopies = isVertical ? 8 : 10;
  const pocketDimensions = isVertical ? '5.6 × 8.0 cm (Vertical)' : '8.4 × 5.2 cm (Horizontal)';
  const pocketCopies = isVertical ? 9 : 10;
  const suitPocketDimensions = isVertical ? '7.0 × 11.0 cm (Vertical)' : '11.0 × 7.0 cm (Horizontal)';
  const suitPocketCopies = 4;

  const formatTitle =
    selectedFormat === 'quarter_letter'
      ? `4 Láminas por Hoja (Cuarta Parte - ~10.5 × 14 cm) - ${paperName}`
      : selectedFormat === 'sixth_letter'
      ? `6 Tarjetas por Hoja (Sexta Parte - ~8.5 × 9 cm) - ${paperName}`
      : selectedFormat === 'half_letter'
      ? `2 Láminas por Hoja (${halfPaperName})`
      : selectedFormat === 'bimah_laminated'
      ? `Lámina de Bimá Completa (${paperName} - 1 Plana)`
      : selectedFormat === 'card_wallet'
      ? `Billetera / Crédito ${walletDimensions} - ${
          smallCardVariant === 'duplex'
            ? `${walletCopies} Tarjetas Dúplex`
            : smallCardVariant === 'foldable'
            ? '4 Tarjetas Plegables'
            : smallCardVariant === 'single_heb'
            ? `${walletCopies} Tarjetas (Solo Hebreo)`
            : `${walletCopies} Tarjetas (Solo Fonética)`
        } - ${paperName}`
      : selectedFormat === 'card_half_wallet'
      ? `Media Billetera ${halfWalletDimensions} - ${
          smallCardVariant === 'duplex'
            ? `${halfWalletCopies} Tarjetas Dúplex`
            : smallCardVariant === 'foldable'
            ? `${isVertical ? '4' : '5'} Tarjetas Plegables`
            : smallCardVariant === 'single_heb'
            ? `${halfWalletCopies} Tarjetas (Solo Hebreo)`
            : `${halfWalletCopies} Tarjetas (Solo Fonética)`
        } - ${paperName}`
      : selectedFormat === 'suit_pocket'
      ? `Bolsillo de Camisa / Saco ${suitPocketDimensions} - ${
          smallCardVariant === 'duplex'
            ? `${suitPocketCopies} Tarjetas Dúplex`
            : smallCardVariant === 'foldable'
            ? '2 Tarjetas Plegables'
            : smallCardVariant === 'single_heb'
            ? `${suitPocketCopies} Tarjetas (Solo Hebreo)`
            : `${suitPocketCopies} Tarjetas (Solo Fonética)`
        } - ${paperName}`
      : selectedFormat === 'card_pocket'
      ? `Mini Tefilín ${pocketDimensions} - ${
          smallCardVariant === 'duplex'
            ? `${pocketCopies} Mini Tarjetas Dúplex`
            : smallCardVariant === 'foldable'
            ? `${isVertical ? '4' : '5'} Tarjetas Plegables`
            : smallCardVariant === 'single_heb'
            ? `${pocketCopies} Tarjetas (Solo Hebreo)`
            : `${pocketCopies} Tarjetas (Solo Fonética)`
        } - ${paperName}`
      : `Página Completa (${paperName} - 1 Plana)`;

  const displayPrayerTitle = isUniversalProposal
    ? 'Kadish DeRabbanan (Versión Universal • Incluye Kadish Yatom)'
    : prayer.titleSpanish;
  const title = `${displayPrayerTitle} - ${formatTitle}`;

  const aseretVariant: AseretPrintVariant =
    options.aseretPrintVariant || (isAseret ? 'marked_aseret' : 'standard');
  const isIvris = options.translitTradition === 'ivris';

  const applyAseretFormatting = (
    rawHeb: string,
    rawFon: string,
    rawEsp: string
  ): { heb: string; fon: string; esp: string } => {
    let heb = rawHeb;
    let fon = rawFon;
    let esp = rawEsp;

    if (aseretVariant === 'standard') {
      return { heb, fon, esp };
    }

    const isLeilaLine = heb.includes('לְעֵלָּא');
    const isOsehLine = heb.includes('עוֹשֶׂה שָׁלוֹם') || heb.includes('עֹשֶׂה שָׁלוֹם');

    if (aseretVariant === 'marked_aseret') {
      if (isLeilaLine) {
        heb = heb.replace(
          /לְעֵלָּא מִן כָּל/,
          'לְעֵלָּא <span class="aseret-exceptional-heb" title="Excepcional en Aseret Yemei Teshuvá">וּלְעֵלָּא</span> מִכָּל'
        );
        const baseLeila = isIvris ? "Le'éiló" : "Le'élá";
        const addedUl = isIvris ? "ul'éiló" : "ul'élá";
        const mikol = isIvris ? 'mikol' : 'mikól';
        fon = fon.replace(
          /Le'[ée]i?l[óáa]\s+min\s+kol/i,
          `${baseLeila} <span class="aseret-exceptional-fon" title="Excepcional en Aseret Yemei Teshuvá">${addedUl}</span> ${mikol}`
        );
        esp = `Por encima <span class="aseret-exceptional-fon">y más allá</span> de toda bendición, cántico, alabanza y consuelo que se expresan en el mundo; y decid: Amén.`;
      } else if (isOsehLine) {
        heb = heb.replace(
          /ע(?:\u05B9|וֹ)שֶׂה שָׁלוֹם/,
          'עוֹשֶׂה <span class="aseret-exceptional-heb aseret-prefix" title="Excepcional en Aseret Yemei Teshuvá">הַ</span>שָּׁלוֹם'
        );
        const osehWord = isIvris ? "'Oseh" : "'Oséh";
        const haPrefix = isIvris ? 'ha' : 'Ha';
        const shalomWord = isIvris ? 'Sholóm' : 'Shalóm';
        fon = fon.replace(
          /'?Os[ée]h\s+sh[ao]l[óo]m/i,
          `${osehWord} <span class="aseret-exceptional-fon aseret-prefix" title="Excepcional en Aseret Yemei Teshuvá">${haPrefix}</span>${shalomWord}`
        );
        esp = esp.replace(
          /El que hace la paz/i,
          'El que hace <span class="aseret-exceptional-fon aseret-prefix">LA</span> paz'
        );
      }
    } else if (aseretVariant === 'annotated') {
      if (isLeilaLine) {
        heb = heb.replace(
          /לְעֵלָּא מִן כָּל/,
          'לְעֵלָּא <span class="aseret-inline-note">(וּלְעֵלָּא)</span> מִן כָּל'
        );
        const stdLeila = isIvris ? "Le'éiló" : "Le'élá";
        const aseretAdd = isIvris ? "ul'éiló" : "ul'élá";
        fon = fon.replace(
          /Le'[ée]i?l[óáa]\s+min\s+kol/i,
          `${stdLeila} <span class="aseret-inline-note">(${aseretAdd})</span> min kol`
        );
        esp = esp.replace(
          /Por encima de toda/i,
          'Por encima <span class="aseret-inline-note">(y más allá)</span> de toda'
        );
      } else if (isOsehLine) {
        heb = heb.replace(
          /ע(?:\u05B9|וֹ)שֶׂה שָׁלוֹם/,
          'עֹשֶׂה <span class="aseret-inline-note aseret-prefix">(הַ)</span>שָּׁלוֹם'
        );
        const stdOseh = isIvris ? "'Oseh" : "'Oséh";
        const stdShalom = isIvris ? 'sholóm' : 'shalóm';
        const aseretPrefix = isIvris ? 'ha' : 'Ha';
        fon = fon.replace(
          /'?Os[ée]h\s+sh[ao]l[óo]m/i,
          `${stdOseh} <span class="aseret-inline-note aseret-prefix">(${aseretPrefix})</span>${stdShalom}`
        );
        esp = esp.replace(
          /El que hace la paz/i,
          'El que hace <span class="aseret-inline-note aseret-prefix">(LA)</span> paz'
        );
      }
    }

    return { heb, fon, esp };
  };

  // Process lines for Aseret substitutions / markings
  const processedLines = prayer.lines.map((line) => {
    const baseFon = isIvris
      ? (line.translitIvris || line.translit || line.phoneticGuide || '')
      : (line.translit || line.phoneticGuide || '');
    const { heb, fon, esp } = applyAseretFormatting(line.hebrew, baseFon, line.spanish);

    return {
      ...line,
      hebrew: heb,
      phonetic: fon,
      spanish: esp,
      responseHeb: line.inlineResponse?.hebrew || '',
      responseFon: isIvris
        ? (line.inlineResponse?.translitIvris || line.inlineResponse?.translit || '')
        : (line.inlineResponse?.translit || ''),
    };
  });

  // Version B for Nusaj Comparison
  const prayerB =
    selectedKaddishType === 'derabanan' && useNusajComparison
      ? getDerabananPrayerForNusaj(comparisonDerabananNusaj, aseretVariant === 'marked_aseret')
      : null;

  const processedLinesB = prayerB
    ? prayerB.lines.map((line) => {
        const baseFon = isIvris
          ? (line.translitIvris || line.translit || line.phoneticGuide || '')
          : (line.translit || line.phoneticGuide || '');
        const { heb, fon, esp } = applyAseretFormatting(line.hebrew, baseFon, line.spanish);

        return {
          ...line,
          hebrew: heb,
          phonetic: fon,
          spanish: esp,
          responseHeb: line.inlineResponse?.hebrew || '',
          responseFon: isIvris
            ? (line.inlineResponse?.translitIvris || line.inlineResponse?.translit || '')
            : (line.inlineResponse?.translit || ''),
        };
      })
    : null;

  const escapeHtml = (value: string): string =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const safeDedicationName = escapeHtml(dedicationName.trim());
  const safeDedicationHebrewName = escapeHtml(dedicationHebrewName.trim());
  const safeDedicationDate = escapeHtml(dedicationDate.trim());
  const hasDedication = Boolean(safeDedicationName || safeDedicationHebrewName || safeDedicationDate);

  const dedicationHtml = hasDedication
    ? `
    <div class="dedication-box">
      <div class="dedication-title">לְעִלּוּי נִשְׁמַת • EN MEMORIA / DEDICATORIA</div>
      <div class="dedication-name">${safeDedicationName ? `<strong>${safeDedicationName}</strong>` : ''} ${
        safeDedicationHebrewName ? `<span class="hebrew-name">(${safeDedicationHebrewName})</span>` : ''
      }</div>
      ${safeDedicationDate ? `<div class="dedication-date">Yurzaid / Fecha: ${safeDedicationDate}</div>` : ''}
    </div>`
    : '';

  const isShalem = selectedKaddishType === 'shalem';
  const isDerabanan = selectedKaddishType === 'derabanan';
  const isChatzi = selectedKaddishType === 'chatzi';

  // RENDER BODY CONTENT FOR ANY CARD
  const renderBodyContent = (cardType: 'quarter' | 'sixth' | 'half' | 'bimah') => {
    const showMishnah = isDerabanan && (cardType === 'bimah' || cardType === 'half');

    // Nusaj Comparison 2-Column Mode
    if (useNusajComparison && isDerabanan && processedLinesB) {
      const nusajOptA = DERABBANAN_NUSAJ_OPTIONS.find((o) => o.id === printDerabananNusaj);
      const nusajOptB = DERABBANAN_NUSAJ_OPTIONS.find((o) => o.id === comparisonDerabananNusaj);

      return `
        <div class="nusaj-comparison-grid">
          <!-- COL 1: VERSION A (FONDO AZUL) -->
          <div class="nusaj-col-blue" dir="rtl">
            <div class="nusaj-col-header-blue">
              VERS. A: ${nusajOptA?.nameEs || 'Sefaradí Standard'} (FONDO AZUL)
            </div>
            <div class="comp-hebrew-body">
              ${processedLines
                .map((l) => {
                  if (l.id.includes('rabbanan') || l.id.includes('israel')) {
                    return `
                      <div class="comp-banner-blue">
                        <div class="comp-banner-title">עַל יִשְׂרָאֵל וְעַל רַבָּנָן</div>
                        <div class="comp-banner-text">${l.hebrew}</div>
                      </div>
                    `;
                  }
                  return `<div class="comp-line-blue">${l.hebrew}</div>`;
                })
                .join('')}
            </div>
          </div>

          <!-- COL 2: VERSION B (FONDO BLANCO) -->
          <div class="nusaj-col-white" dir="rtl">
            <div class="nusaj-col-header-white">
              VERS. B: ${nusajOptB?.nameEs || 'Sefaradí Occidental'} (FONDO BLANCO)
            </div>
            <div class="comp-hebrew-body">
              ${processedLinesB
                .map((l) => {
                  if (l.id.includes('rabbanan') || l.id.includes('israel')) {
                    return `
                      <div class="comp-banner-white">
                        <div class="comp-banner-title-white">עַל יִשְׂרָאֵל וְעַל רַבָּנָן</div>
                        <div class="comp-banner-text-white">${l.hebrew}</div>
                      </div>
                    `;
                  }
                  return `<div class="comp-line-white">${l.hebrew}</div>`;
                })
                .join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (textArrangement === 'separate_blocks') {
      const hebrewBlockHtml = processedLines
        .map((l) => {
          if (l.isCongregationResponse) {
            return `
              <div class="block-central-heb" dir="rtl">
                <span class="central-heb-text">${l.hebrew}</span>
              </div>
            `;
          }
          if (l.id.includes('titkabal')) {
            return `
              <div class="block-titkabal-heb" dir="rtl">
                <span class="badge-titkabal-lbl">תִּתְקַבַּל:</span>
                <span class="titkabal-heb-text">${l.hebrew}</span>
                <span class="badge-resp-heb">עוֹנִים: אָמֵן</span>
              </div>
            `;
          }
          if (l.id.includes('rabbanan') || l.id.includes('israel')) {
            if (bannerStyle === 'gray_universal') {
              return `
                <div class="block-rabbanan-universal-heb" dir="rtl">
                  <div class="block-rabbanan-universal-title">
                    <span class="univ-tag">✡️ פִּסְקַת עַל יִשְׂרָאֵל (לְקַדִּישׁ דְּרַבָּנָן)</span>
                    <span class="univ-subtag">בְּקַדִּישׁ יָתוֹם מְדַלְּגִים פִּסְקָה זוֹ יָשָׁר לְ'יְהֵא שְׁלָמָא'</span>
                  </div>
                  <div class="block-rabbanan-universal-body">${l.hebrew}</div>
                  ${l.responseHeb ? `<div class="badge-resp-universal-heb">עוֹנִים: ${l.responseHeb.replace(/[()]/g, '')}</div>` : ''}
                </div>
              `;
            }
            if (bannerStyle === 'blue_contrast') {
              return `
                <div class="block-rabbanan-banner-heb" dir="rtl">
                  <div class="block-rabbanan-banner-title">עַל יִשְׂרָאֵל וְעַל רַבָּנָן (בִּרְכַּת הַחֲכָמִים)</div>
                  <div class="block-rabbanan-banner-body">${l.hebrew}</div>
                  ${l.responseHeb ? `<div class="badge-resp-banner">עוֹנִים: ${l.responseHeb.replace(/[()]/g, '')}</div>` : ''}
                </div>
              `;
            }
            return `
              <div class="block-rabbanan-heb" dir="rtl">
                <span class="badge-rabbanan-lbl">עַל יִשְׂרָאֵל (תְּפִלַּת הַחֲכָמִים):</span>
                <span class="rabbanan-heb-text">${l.hebrew}</span>
                ${l.responseHeb ? `<span class="badge-resp-heb">עוֹנִים: ${l.responseHeb.replace(/[()]/g, '')}</span>` : ''}
              </div>
            `;
          }
          return `
            <div class="block-line-heb" dir="rtl">
              <span class="line-heb-text">${l.hebrew}</span>
              ${l.responseHeb ? `<span class="badge-resp-heb">עוֹנִים: ${l.responseHeb.replace(/[()]/g, '')}</span>` : ''}
            </div>
          `;
        })
        .join('\n');

      const phoneticBlockHtml = processedLines
        .map((l) => {
          if (l.isCongregationResponse) {
            return `
              <div class="block-central-fon" dir="ltr">
                <span class="central-fon-text">${l.phonetic}</span>
              </div>
            `;
          }
          if (l.id.includes('titkabal')) {
            return `
              <div class="block-titkabal-fon" dir="ltr">
                <span class="badge-titkabal-fon-lbl">Titkabal:</span>
                <span class="titkabal-fon-text">${l.phonetic}</span>
                <strong class="badge-resp-fon">(Amén)</strong>
              </div>
            `;
          }
          if (l.id.includes('rabbanan') || l.id.includes('israel')) {
            if (bannerStyle === 'gray_universal') {
              return `
                <div class="block-rabbanan-universal-fon" dir="ltr">
                  <div class="block-rabbanan-universal-title">
                    <span class="univ-tag">✡️ PÁRRAFO 'AL ISRAEL' (SOLO KADISH DERABBANÁN)</span>
                    <span class="univ-subtag">En Kadish Yatom / Duelo saltar directo a '${isIvris ? 'Yehei Shlomo' : 'Yehe Shelamá'}'</span>
                  </div>
                  <div class="block-rabbanan-universal-body">${l.phonetic}</div>
                  ${l.responseFon ? `<div class="badge-resp-universal-fon">RESPONDER: (${l.responseFon.replace(/[()]/g, '')})</div>` : ''}
                </div>
              `;
            }
            if (bannerStyle === 'blue_contrast') {
              return `
                <div class="block-rabbanan-banner-fon" dir="ltr">
                  <div class="block-rabbanan-banner-title">AL ISRAEL VE'AL RABBANÁN (PLEGARIA POR LOS SABIOS)</div>
                  <div class="block-rabbanan-banner-body">${l.phonetic}</div>
                  ${l.responseFon ? `<div class="badge-resp-banner">RESPONDIENDO: (${l.responseFon.replace(/[()]/g, '')})</div>` : ''}
                </div>
              `;
            }
            return `
              <div class="block-rabbanan-fon" dir="ltr">
                <span class="badge-rabbanan-fon-lbl">Al Yisrael (Plegaria por los Sabios):</span>
                <span class="rabbanan-fon-text">${l.phonetic}</span>
                ${l.responseFon ? `<strong class="badge-resp-fon">(${l.responseFon.replace(/[()]/g, '')})</strong>` : ''}
              </div>
            `;
          }
          return `
            <div class="block-line-fon" dir="ltr">
              <span class="line-fon-text">${l.phonetic}</span>
              ${l.responseFon ? `<strong class="badge-resp-fon">(${l.responseFon.replace(/[()]/g, '')})</strong>` : ''}
            </div>
          `;
        })
        .join('\n');

      const spanishBlockHtml =
        includeSpanish && (cardType === 'bimah' || cardType === 'half')
          ? `
            <div class="block-spanish-section" dir="ltr">
              <div class="block-badge-esp">TRADUCCIÓN AL ESPAÑOL</div>
              <div class="block-esp-text">
                ${showMishnah ? `
                  <div class="block-line-esp" style="margin-bottom: 2.5mm; border-bottom: 1.5px dashed #fed7aa; padding-bottom: 1.5mm; font-style: italic; color: #78350f;">
                    <strong>Mishná de Rabí Jananiá:</strong> El Santo, bendito sea Él, quiso purificar a Israel; por ello les multiplicó Torá y preceptos, como está escrito: 'El Eterno deseó por causa de Su rectitud engrandecer la Torá y glorificarla'.
                  </div>
                ` : ''}
                ${processedLines
                  .map((l) => {
                    if (l.isCongregationResponse) {
                      return `<div class="block-central-esp"><strong>Kahal y Jazán:</strong> ${l.spanish}</div>`;
                    }
                    if (l.id.includes('titkabal')) {
                      return `<div class="block-titkabal-esp"><strong>Titkabal:</strong> ${l.spanish}</div>`;
                    }
                    if (l.id.includes('rabbanan') || l.id.includes('israel')) {
                      return `<div class="block-rabbanan-esp"><strong>Al Israel:</strong> ${l.spanish}</div>`;
                    }
                    return `<div class="block-line-esp">${l.spanish}</div>`;
                  })
                  .join('\n')}
              </div>
            </div>
          `
          : '';

      return `
        <div class="separate-blocks-layout ${cardType}">
          ${
            includeHebrew
              ? `
            <div class="block-hebrew-section" dir="rtl">
              <div class="block-badge-heb">טֶקְסְט בְּעֶבְרִית מְנֻקָּד (TEXTO HEBREO)</div>
              <div class="block-heb-text">
                ${showMishnah ? `
                  <div class="mishnah-intro-heb" dir="rtl">
                    <span class="mishnah-badge-heb">מִשְׁנַת רַבִּי חֲנַנְיָא בֶּן עֲקַשְׁיָא (אוֹמְרִים לִפְנֵי הַקַּדִּישׁ):</span>
                    <p class="mishnah-text-heb">רַצָּה הַקָּדוֹשׁ בָּרוּךְ הוּא לְזַכּוֹת אֶת יִשְׂרָאֵל, לְפִיכָךְ הִרְבָּה לָהֶם תּוֹרָה וּמִצְוֹת, שֶׁנֶּאֱמַר: יְהֹוָה חָפֵץ לְמַעַן צִדְקוֹ, יַגְדִּיל תּוֹרָה וְיַאְדִּיר.</p>
                  </div>
                ` : ''}
                ${hebrewBlockHtml}
              </div>
            </div>
          `
              : ''
          }

          ${
            includePhonetics
              ? `
            <div class="block-phonetic-section" dir="ltr">
              <div class="block-badge-fon">GUÍA FONÉTICA Y RESPUESTAS DEL KAHAL</div>
              <div class="block-fon-text">
                ${showMishnah ? `
                  <div class="mishnah-intro-fon" dir="ltr">
                    <span class="mishnah-badge-fon">${isIvris ? 'Mishnas Rabí Chananio ben Akashio:' : 'Mishnat Rabí Jananiá ben Akashia:'}</span>
                    <p class="mishnah-text-fon">${isIvris ? "Ratzó HaKodosh Boruch Hu lezakós es Yisroel, lefichoch hirbó lohem Toiro umitzvós, shene'emor: Hashem chofetz lema'an tzidkoi, yagdil Toiro veya'adir." : "Ratsá HaKadosh Baruj Hu lezakot et Yisrael, lefikaj hirbá lahem Torá umitsvot, shene'emar: Adonay jafets lema'an tsidkó, yagdil Torá veya'adir."}</p>
                  </div>
                ` : ''}
                ${phoneticBlockHtml}
              </div>
            </div>
          `
              : ''
          }

          ${spanishBlockHtml}
        </div>
      `;
    }

    // Interlinear layout
    return `
      <div class="interlinear-layout ${cardType}">
        ${processedLines
          .map((line) => {
            if (line.isCongregationResponse) {
              return `
                <div class="il-central-box">
                  <div class="il-central-heb" dir="rtl">${line.hebrew}</div>
                  <div class="il-central-fon" dir="ltr">${line.phonetic}</div>
                  ${includeSpanish ? `<div class="il-central-esp">${line.spanish}</div>` : ''}
                </div>
              `;
            }
            if (line.id.includes('rabbanan') || line.id.includes('israel')) {
              if (bannerStyle === 'gray_universal') {
                return `
                  <div class="il-rabbanan-universal">
                    <div class="il-universal-header">
                      <span class="univ-tag">✡️ פִּסְקַת עַל יִשְׂרָאֵל (לְקַדִּישׁ דְּרַבָּנָן)</span>
                      <span class="univ-subtag">En Kadish Yatom / Duelo saltar directo a '${isIvris ? 'Yehei Shlomo' : 'Yehe Shelamá'}'</span>
                    </div>
                    <div class="il-line-heb" dir="rtl">
                      ${line.hebrew}
                      ${line.responseHeb ? `<span class="badge-resp-heb">עוֹנִים: ${line.responseHeb.replace(/[()]/g, '')}</span>` : ''}
                    </div>
                    <div class="il-line-fon" dir="ltr">
                      ${line.phonetic}
                      ${line.responseFon ? `<strong class="badge-resp-fon">(${line.responseFon.replace(/[()]/g, '')})</strong>` : ''}
                    </div>
                    ${includeSpanish ? `<div class="il-line-esp">${line.spanish}</div>` : ''}
                  </div>
                `;
              }
              if (bannerStyle === 'blue_contrast') {
                return `
                  <div class="il-rabbanan-blue">
                    <div class="il-blue-header">עַל יִשְׂרָאֵל וְעַל רַבָּנָן (AL ISRAEL)</div>
                    <div class="il-line-heb" dir="rtl" style="color:#ffffff;">
                      ${line.hebrew}
                      ${line.responseHeb ? `<span class="badge-resp-banner">עוֹנִים: ${line.responseHeb.replace(/[()]/g, '')}</span>` : ''}
                    </div>
                    <div class="il-line-fon" dir="ltr" style="color:#ffffff;">
                      ${line.phonetic}
                      ${line.responseFon ? `<strong class="badge-resp-banner">(${line.responseFon.replace(/[()]/g, '')})</strong>` : ''}
                    </div>
                    ${includeSpanish ? `<div class="il-line-esp" style="color:#e0e7ff;">${line.spanish}</div>` : ''}
                  </div>
                `;
              }
            }
            return `
              <div class="il-line-item">
                <div class="il-line-heb" dir="rtl">
                  ${line.hebrew}
                  ${line.responseHeb ? `<span class="badge-resp-heb">עוֹנִים: ${line.responseHeb.replace(/[()]/g, '')}</span>` : ''}
                </div>
                <div class="il-line-fon" dir="ltr">
                  ${line.phonetic}
                  ${line.responseFon ? `<strong class="badge-resp-fon">(${line.responseFon.replace(/[()]/g, '')})</strong>` : ''}
                </div>
                ${includeSpanish ? `<div class="il-line-esp">${line.spanish}</div>` : ''}
              </div>
            `;
          })
          .join('\n')}
      </div>
    `;
  };

  // RENDER CARD UNIT FOR SHEETS
  const renderCardUnit = (
    cardType: 'quarter' | 'sixth' | 'half' | 'bimah',
    copyNumber?: number
  ) => {
    const cardSubtitle =
      cardType === 'quarter'
        ? 'Lámina de Cuarta Parte (~10.5 × 14 cm)'
        : cardType === 'sixth'
        ? 'Tarjeta Compacta (~8.5 × 9.5 cm)'
        : cardType === 'half'
        ? 'Media Carta Plastificada (~14 × 21.6 cm)'
        : 'Pliego Entero para Bimá / Atril del Jazán';

    return `
      <div class="card-unit ${cardType} ${isChatzi ? 'is-chatzi' : ''} ${isDerabanan ? 'is-derabanan' : ''} ${isShalem ? 'is-shalem' : ''}">
        ${
          includeDecorativeBorder
            ? `
          <div class="cu-corner-decor tl">✡</div>
          <div class="cu-corner-decor tr">✡</div>
          <div class="cu-corner-decor bl">✡</div>
          <div class="cu-corner-decor br">✡</div>
        `
            : ''
        }

        <div class="cu-header">
          <div class="cu-invocation">בְּעֶזְרַת הַשֵּׁם • לַחַזָּן וְלַקָּהָל</div>
          <div class="cu-title-heb" dir="rtl">${isUniversalProposal ? 'קַדִּישׁ דְּרַבָּנָן • גַּם לְקַדִּישׁ יָתוֹם (כְּלָלִי)' : prayer.titleHebrew}</div>
          <div class="cu-title-es">${isUniversalProposal ? 'KADISH DERABBANÁN (VERSIÓN UNIVERSAL • INCLUYE KADISH YATOM)' : prayer.titleSpanish}</div>
          <div class="cu-subtitle">
            ${isUniversalProposal ? '⭐ Versión 2-en-1 (Salta el recuadro gris si rezas Kadish Yatom) • ' : ''}${
              aseretVariant === 'marked_aseret'
                ? '<span class="mini-aseret-pill">✦ Edición Excepcional: Aseret Yemei Teshuvá (Rosh Hashaná–Yom Kipur)</span> • '
                : aseretVariant === 'annotated'
                ? '<span class="mini-aseret-pill is-annotated">✦ [עשי״ת / Aseret] = Solo Rosh Hashaná–Yom Kipur</span> • '
                : ''
            }${cardSubtitle} • 1 Plana
            ${copyNumber ? ` • <strong>[Copia ${copyNumber}]</strong>` : ''}
          </div>
        </div>

        ${dedicationHtml}

        <div class="cu-body">
          ${renderBodyContent(cardType)}
        </div>

        ${
          isChatzi && (cardType === 'bimah' || cardType === 'half')
            ? `
          <div class="cu-liturgy-table">
            <div class="cu-liturgy-title">סִדְרֵי חֲצִי קַדִּישׁ • 6 MOMENTOS LITÚRGICOS:</div>
            <div class="cu-liturgy-grid">
              <span><strong>1. Shajarit:</strong> Pesukei Dezimrá</span>
              <span><strong>2. Shajarit:</strong> Tajanún</span>
              <span><strong>3. Torá:</strong> Fin lectura</span>
              <span><strong>4. Musaf:</strong> Antes Amidá</span>
              <span><strong>5. Minjá:</strong> Antes Amidá</span>
              <span><strong>6. Arvit:</strong> Antes Barjú</span>
            </div>
          </div>
        `
            : ''
        }

        <div class="cu-footer">
          ${
            includeReverenceGuide
              ? `
            <div class="cu-reverence">
              <strong>Reverencias del Jazán:</strong> Inclinarse levemente en <em>"${isIvris ? 'Yisgadal' : 'Yitgadal'}"</em> y en <em>"${isIvris ? 'Yisborach' : 'Yitbaraj'}"</em>. Proclamar <em>"${isIvris ? 'Yehei shmei Rabbo...' : 'Yehe shemeh Rabba...'}"</em> con voz firme junto a la congregación. ${
                isChatzi
                  ? `Concluye en <em>"${isIvris ? "da'amiron be'almo, ve'imru Omein" : "da'amiran be'alma, ve'imru Amen"}"</em>.`
                  : `En <em>'${isIvris ? 'Oiseh sholoim' : 'Oseh shalom'}</em>, retroceder 3 pasos con pie izquierdo.`
              }
            </div>
          `
              : ''
          }
          <div class="cu-seal">
            <span>✡️ Kadish y Yurzaid</span>
          </div>
        </div>
      </div>
    `;
  };

  // RENDER A MINI-CARD UNIT (HEBREW SIDE)
  const renderMiniCardHebrew = (
    cardType: 'wallet' | 'half_wallet' | 'pocket' | 'suit_pocket',
    orientation: CardOrientation,
    copyIndex: number
  ) => {
    return `
      <div class="mini-card-unit ${cardType} ${orientation} ${isChatzi ? 'is-chatzi' : ''} ${isDerabanan ? 'is-derabanan' : ''} ${isShalem ? 'is-shalem' : ''} side-hebrew" data-copy="${copyIndex}" data-font-scale="${cardFontScale}">
        <div class="mini-crop-corner tl"></div>
        <div class="mini-crop-corner tr"></div>
        <div class="mini-crop-corner bl"></div>
        <div class="mini-crop-corner br"></div>
        <div class="mini-card-inner">
          <div class="mini-header">
            <span class="mini-bsd">בס״ד • בְּעֶזְרַת הַשֵּׁם</span>
            <span class="mini-title-heb" dir="rtl">${isUniversalProposal ? 'קַדִּישׁ דְּרַבָּנָן / יָתוֹם (כְּלָלִי)' : prayer.titleHebrew}</span>
            ${
              aseretVariant === 'marked_aseret'
                ? '<span class="mini-aseret-pill" dir="rtl">✦ עשי״ת: (וּלְעֵלָּא / הַ) לר״ה–יוה״כ בלבד</span>'
                : aseretVariant === 'annotated'
                ? '<span class="mini-aseret-pill is-annotated" dir="rtl">✦ בסוגריים (וּלְעֵלָּא / הַ) = עשי״ת בלבד</span>'
                : ''
            }
          </div>
          ${hasDedication ? `<div class="mini-dedication">לע״נ ${safeDedicationHebrewName || safeDedicationName}</div>` : ''}
          ${
            useNusajComparison && isDerabanan && processedLinesB
              ? `
            <div class="mini-comp-grid">
              <div class="mini-col-blue" dir="rtl">
                <div class="mini-col-hdr-blue">VER. A (FONDO AZUL)</div>
                ${processedLines
                  .map((l) => {
                    if (l.id.includes('rabbanan') || l.id.includes('israel')) {
                      return `<div class="comp-banner-blue"><div class="comp-banner-title">עַל יִשְׂרָאֵל</div><div>${l.hebrew}</div></div>`;
                    }
                    return `<div class="mini-heb-line">${l.hebrew}</div>`;
                  })
                  .join('')}
              </div>
              <div class="mini-col-white" dir="rtl">
                <div class="mini-col-hdr-white">VER. B (FONDO BLANCO)</div>
                ${processedLinesB
                  .map((l) => {
                    if (l.id.includes('rabbanan') || l.id.includes('israel')) {
                      return `<div class="comp-banner-white"><div class="comp-banner-title-white">עַל יִשְׂרָאֵל</div><div>${l.hebrew}</div></div>`;
                    }
                    return `<div class="mini-heb-line">${l.hebrew}</div>`;
                  })
                  .join('')}
              </div>
            </div>
          `
              : `
            <div class="mini-body-heb" dir="rtl">
              ${processedLines
                .map((l) => {
                  if (l.isCongregationResponse) {
                    return `<div class="mini-resp-highlight-heb">${l.hebrew}</div>`;
                  }
                  if (l.id.includes('titkabal')) {
                    return `<div class="mini-heb-line">${l.hebrew} <span class="mini-badge-resp">(אָמֵן)</span></div>`;
                  }
                  if (l.id.includes('rabbanan') || l.id.includes('israel')) {
                    if (bannerStyle === 'gray_universal') {
                      return `
                        <div class="mini-derabanan-universal-heb" dir="rtl">
                          <div class="mini-universal-header-heb">
                            <span>✡️ פִּסְקַת רַבָּנָן</span>
                            <span class="mini-skip-note">(בְּקַדִּישׁ יָתוֹם מְדַלְּגִים)</span>
                          </div>
                          <div class="mini-universal-text-heb">${l.hebrew} ${l.responseHeb ? `<span class="mini-badge-resp-univ">(${l.responseHeb.replace(/[()]/g, '')})</span>` : ''}</div>
                        </div>
                      `;
                    }
                    if (bannerStyle === 'blue_contrast') {
                      return `
                        <div class="mini-derabanan-banner-heb" dir="rtl">
                          <div class="mini-banner-header-heb">עַל יִשְׂרָאֵל וְעַל רַבָּנָן</div>
                          <div class="mini-banner-text-heb">${l.hebrew} ${l.responseHeb ? `<span class="mini-badge-resp-banner">(${l.responseHeb.replace(/[()]/g, '')})</span>` : ''}</div>
                        </div>
                      `;
                    }
                    return `<div class="mini-heb-line">${l.hebrew} ${l.responseHeb ? `<span class="mini-badge-resp">(${l.responseHeb.replace(/[()]/g, '')})</span>` : ''}</div>`;
                  }
                  return `<div class="mini-heb-line">${l.hebrew} ${l.responseHeb ? `<span class="mini-badge-resp">(${l.responseHeb.replace(/[()]/g, '')})</span>` : ''}</div>`;
                })
                .join('')}
            </div>
          `
          }
          <div class="mini-footer">
            <span class="mini-footer-left">🕯️ Kadish</span>
            <span class="mini-copy-num">#${copyIndex}</span>
            <span class="mini-footer-right">${isChatzi ? 'חֲצִי קַדִּישׁ' : 'עוֹשֶׂה שָׁלוֹם'}</span>
          </div>
        </div>
      </div>
    `;
  };

  // RENDER A MINI-CARD UNIT (PHONETIC SIDE)
  const renderMiniCardPhonetic = (
    cardType: 'wallet' | 'half_wallet' | 'pocket' | 'suit_pocket',
    orientation: CardOrientation,
    copyIndex: number
  ) => {
    return `
      <div class="mini-card-unit ${cardType} ${orientation} ${isChatzi ? 'is-chatzi' : ''} ${isDerabanan ? 'is-derabanan' : ''} ${isShalem ? 'is-shalem' : ''} side-phonetic" data-copy="${copyIndex}" data-font-scale="${cardFontScale}">
        <div class="mini-crop-corner tl"></div>
        <div class="mini-crop-corner tr"></div>
        <div class="mini-crop-corner bl"></div>
        <div class="mini-crop-corner br"></div>
        <div class="mini-card-inner">
          <div class="mini-header">
            <span class="mini-title-fon">${isUniversalProposal ? 'Kadish DeRabbanan / Yatom (Universal)' : prayer.titleSpanish}</span>
            ${
              aseretVariant === 'marked_aseret'
                ? '<span class="mini-aseret-pill">✦ Marcado (ul\'élá / Ha) = Solo Aseret (R. Hashaná–Kipur)</span>'
                : aseretVariant === 'annotated'
                ? '<span class="mini-aseret-pill is-annotated">✦ Entre ( ) = Solo en Aseret Yemei Teshuvá</span>'
                : ''
            }
          </div>
          ${
            useNusajComparison && isDerabanan && processedLinesB
              ? `
            <div class="mini-comp-grid">
              <div class="mini-col-blue" dir="ltr">
                <div class="mini-col-hdr-blue">VER. A (FONDO AZUL)</div>
                ${processedLines
                  .map((l) => {
                    if (l.id.includes('rabbanan') || l.id.includes('israel')) {
                      return `<div class="comp-banner-blue"><div class="comp-banner-title">AL ISRAEL</div><div>${l.phonetic}</div></div>`;
                    }
                    return `<div class="mini-fon-line">${l.phonetic}</div>`;
                  })
                  .join('')}
              </div>
              <div class="mini-col-white" dir="ltr">
                <div class="mini-col-hdr-white">VER. B (FONDO BLANCO)</div>
                ${processedLinesB
                  .map((l) => {
                    if (l.id.includes('rabbanan') || l.id.includes('israel')) {
                      return `<div class="comp-banner-white"><div class="comp-banner-title-white">AL ISRAEL</div><div>${l.phonetic}</div></div>`;
                    }
                    return `<div class="mini-fon-line">${l.phonetic}</div>`;
                  })
                  .join('')}
              </div>
            </div>
          `
              : `
            <div class="mini-body-fon" dir="ltr">
              ${processedLines
                .map((l) => {
                  if (l.isCongregationResponse) {
                    return `<div class="mini-resp-highlight-fon">${l.phonetic}</div>`;
                  }
                  if (l.id.includes('titkabal')) {
                    return `<div class="mini-fon-line">${l.phonetic} <span class="mini-badge-resp-fon"><strong>(Amén)</strong></span></div>`;
                  }
                  if (l.id.includes('rabbanan') || l.id.includes('israel')) {
                    if (bannerStyle === 'gray_universal') {
                      return `
                        <div class="mini-derabanan-universal-fon" dir="ltr">
                          <div class="mini-universal-header-fon">
                            <span>✡️ SOLO DERABBANÁN</span>
                            <span class="mini-skip-note">(En Yatom saltar)</span>
                          </div>
                          <div class="mini-universal-text-fon">${l.phonetic} ${l.responseFon ? `<span class="mini-badge-resp-univ"><strong>(${l.responseFon.replace(/[()]/g, '')})</strong></span>` : ''}</div>
                        </div>
                      `;
                    }
                    if (bannerStyle === 'blue_contrast') {
                      return `
                        <div class="mini-derabanan-banner-fon" dir="ltr">
                          <div class="mini-banner-header-fon">AL ISRAEL VE'AL RABBANÁN</div>
                          <div class="mini-banner-text-fon">${l.phonetic} ${l.responseFon ? `<span class="mini-badge-resp-banner"><strong>(${l.responseFon.replace(/[()]/g, '')})</strong></span>` : ''}</div>
                        </div>
                      `;
                    }
                    return `<div class="mini-fon-line">${l.phonetic} ${l.responseFon ? `<span class="mini-badge-resp-fon"><strong>(${l.responseFon.replace(/[()]/g, '')})</strong></span>` : ''}</div>`;
                  }
                  return `<div class="mini-fon-line">${l.phonetic} ${l.responseFon ? `<span class="mini-badge-resp-fon"><strong>(${l.responseFon.replace(/[()]/g, '')})</strong></span>` : ''}</div>`;
                })
                .join('')}
            </div>
          `
          }
          <div class="mini-footer-guide">
            <span class="mini-guide-text">${
              isChatzi
                ? `Reverencias: En ${isIvris ? 'Yisgadal e Yisborach' : 'Yitgadal e Yitbaraj'}. Fin: ${isIvris ? "da'amiron be'almo" : "da'amiran be'alma"}.`
                : `Reverencias: Al decir '${isIvris ? 'Oiseh sholoim' : 'Oseh shalom'}: 3 pasos atrás.`
            }</span>
            <span class="mini-copy-num">#${copyIndex}</span>
          </div>
        </div>
      </div>
    `;
  };

  // RENDER A FOLDABLE MINI-CARD (DIPTYCH FOR 1-SIDED PRINTING)
  const renderMiniCardFoldable = (
    cardType: 'wallet' | 'half_wallet' | 'pocket' | 'suit_pocket',
    orientation: CardOrientation,
    copyIndex: number
  ) => {
    return `
      <div class="mini-foldable-unit ${cardType} ${orientation}" data-copy="${copyIndex}">
        <div class="mini-crop-corner tl"></div>
        <div class="mini-crop-corner tr"></div>
        <div class="mini-crop-corner bl"></div>
        <div class="mini-crop-corner br"></div>
        ${renderMiniCardHebrew(cardType, orientation, copyIndex)}
        <div class="mini-fold-spine">
          <div class="mini-fold-spine-text">✂️ Doblar por el centro ☵ Fold</div>
        </div>
        ${renderMiniCardPhonetic(cardType, orientation, copyIndex)}
      </div>
    `;
  };

  // Compute card dimensions
  const isCardFormat =
    selectedFormat === 'card_wallet' ||
    selectedFormat === 'card_half_wallet' ||
    selectedFormat === 'card_pocket' ||
    selectedFormat === 'suit_pocket';

  const cardType: 'wallet' | 'half_wallet' | 'pocket' | 'suit_pocket' =
    selectedFormat === 'card_wallet'
      ? 'wallet'
      : selectedFormat === 'card_half_wallet'
      ? 'half_wallet'
      : selectedFormat === 'card_pocket'
      ? 'pocket'
      : 'suit_pocket';

  let cardWidthMm = 70;
  let cardHeightMm = 110;
  let cardWidthCm = '7.0 cm';
  let cardHeightCm = '11.0 cm';
  let cardLabel = 'Bolsillo de Camisa / Saco (7.0 × 11.0 cm)';

  if (selectedFormat === 'suit_pocket') {
    if (isVertical) {
      cardWidthMm = 70;
      cardHeightMm = 110;
      cardWidthCm = '7.0 cm';
      cardHeightCm = '11.0 cm';
      cardLabel = 'Bolsillo de Camisa / Saco Vertical (7.0 × 11.0 cm)';
    } else {
      cardWidthMm = 110;
      cardHeightMm = 70;
      cardWidthCm = '11.0 cm';
      cardHeightCm = '7.0 cm';
      cardLabel = 'Bolsillo de Camisa / Saco Horizontal (11.0 × 7.0 cm)';
    }
  } else if (selectedFormat === 'card_wallet') {
    if (isVertical) {
      cardWidthMm = 58;
      cardHeightMm = 88;
      cardWidthCm = '5.8 cm';
      cardHeightCm = '8.8 cm';
      cardLabel = 'Billetera / Tarjeta de Crédito Vertical (5.8 × 8.8 cm)';
    } else {
      cardWidthMm = 88;
      cardHeightMm = 56;
      cardWidthCm = '8.8 cm';
      cardHeightCm = '5.6 cm';
      cardLabel = 'Billetera / Tarjeta de Crédito Horizontal (8.8 × 5.6 cm)';
    }
  } else if (selectedFormat === 'card_half_wallet') {
    if (isVertical) {
      cardWidthMm = 48;
      cardHeightMm = 95;
      cardWidthCm = '4.8 cm';
      cardHeightCm = '9.5 cm';
      cardLabel = 'Media Billetera Vertical (4.8 × 9.5 cm)';
    } else {
      cardWidthMm = 95;
      cardHeightMm = 48;
      cardWidthCm = '9.5 cm';
      cardHeightCm = '4.8 cm';
      cardLabel = 'Media Billetera Horizontal (9.5 × 4.8 cm)';
    }
  } else if (selectedFormat === 'card_pocket') {
    if (isVertical) {
      cardWidthMm = 56;
      cardHeightMm = 80;
      cardWidthCm = '5.6 cm';
      cardHeightCm = '8.0 cm';
      cardLabel = 'Mini Tefilín / Bolsillo Vertical (5.6 × 8.0 cm)';
    } else {
      cardWidthMm = 84;
      cardHeightMm = 52;
      cardWidthCm = '8.4 cm';
      cardHeightCm = '5.2 cm';
      cardLabel = 'Mini Tefilín / Bolsillo Horizontal (8.4 × 5.2 cm)';
    }
  } else if (selectedFormat === 'quarter_letter') {
    cardWidthMm = isA4 ? 105 : 108;
    cardHeightMm = isA4 ? 148 : 140;
    cardWidthCm = `${(cardWidthMm / 10).toFixed(1)} cm`;
    cardHeightCm = `${(cardHeightMm / 10).toFixed(1)} cm`;
    cardLabel = 'Cuarta Parte de Hoja (Lámina Cuádruple)';
  } else if (selectedFormat === 'sixth_letter') {
    cardWidthMm = isA4 ? 70 : 85;
    cardHeightMm = isA4 ? 99 : 93;
    cardWidthCm = `${(cardWidthMm / 10).toFixed(1)} cm`;
    cardHeightCm = `${(cardHeightMm / 10).toFixed(1)} cm`;
    cardLabel = 'Sexta Parte de Hoja (Tarjeta ~8.5 × 9.5 cm)';
  } else if (selectedFormat === 'half_letter') {
    cardWidthMm = isA4 ? 148 : 140;
    cardHeightMm = isA4 ? 210 : 216;
    cardWidthCm = `${(cardWidthMm / 10).toFixed(1)} cm`;
    cardHeightCm = `${(cardHeightMm / 10).toFixed(1)} cm`;
    cardLabel = 'Media Carta / A5 (Lámina de Atril)';
  } else {
    // Bimah or full letter
    cardWidthMm = isA4 ? 210 : 216;
    cardHeightMm = isA4 ? 297 : 279;
    cardWidthCm = `${(cardWidthMm / 10).toFixed(1)} cm`;
    cardHeightCm = `${(cardHeightMm / 10).toFixed(1)} cm`;
    cardLabel = 'Lámina de Bimá Completa (1 Plana Monumental)';
  }

  const cardDimensions: CardDimensions = {
    widthMm: cardWidthMm,
    heightMm: cardHeightMm,
    widthCm: cardWidthCm,
    heightCm: cardHeightCm,
    label: cardLabel,
    isCardFormat,
  };

  // Build full contentHtml
  let contentHtml = '';

  if (selectedFormat === 'quarter_letter') {
    contentHtml = `
    <div class="quarter-grid-wrapper ${bimahPaperSize}">
      <div class="cut-line-v"></div>
      <div class="cut-line-h"></div>
      <div class="cut-center-badge">✂️</div>
      ${renderCardUnit('quarter', 1)}
      ${renderCardUnit('quarter', 2)}
      ${renderCardUnit('quarter', 3)}
      ${renderCardUnit('quarter', 4)}
    </div>
    `;
  } else if (selectedFormat === 'sixth_letter') {
    contentHtml = `
    <div class="sixth-grid-wrapper ${bimahPaperSize}">
      ${renderCardUnit('sixth', 1)}
      ${renderCardUnit('sixth', 2)}
      ${renderCardUnit('sixth', 3)}
      ${renderCardUnit('sixth', 4)}
      ${renderCardUnit('sixth', 5)}
      ${renderCardUnit('sixth', 6)}
    </div>
    `;
  } else if (selectedFormat === 'half_letter') {
    contentHtml = `
    <div class="half-letter-page-wrapper ${duplicateTwoUp ? 'two-up' : 'single'} ${bimahPaperSize}">
      ${renderCardUnit('half', duplicateTwoUp ? 1 : undefined)}
      ${
        duplicateTwoUp
          ? `<div class="cut-divider"><span>✂️ Línea de corte central — 2 láminas listas para recortar y laminar (Jazán y Bimá)</span></div>${renderCardUnit(
              'half',
              2
            )}`
          : ''
      }
    </div>
    `;
  } else if (selectedFormat === 'bimah_laminated') {
    contentHtml = `
    <div class="bimah-page-wrapper ${bimahPaperSize}">
      <div class="bimah-laminate-banner">
        👑 <strong>LÁMINA DE BIMÁ / ATRIL DEL JAZÁN (${paperName} - 1 PLANA ESTRICTA):</strong>
        Margen perimetral de 8 mm para sellado hermético con mica plástica térmica. Formato de atril con interlineado normal y máxima legibilidad.
      </div>
      ${renderCardUnit('bimah')}
    </div>
    `;
  } else if (isCardFormat) {
    let totalCopies = 8;
    let numCols = 2;
    let numRows = 4;
    let sizeLabel = '';

    if (cardType === 'wallet') {
      if (isVertical) {
        totalCopies = 9;
        numCols = 3;
        numRows = 3;
        sizeLabel = '5.8 × 8.8 cm (3 columnas × 3 filas)';
      } else {
        totalCopies = 8;
        numCols = 2;
        numRows = 4;
        sizeLabel = '8.8 × 5.6 cm (2 columnas × 4 filas)';
      }
    } else if (cardType === 'half_wallet') {
      if (isVertical) {
        totalCopies = 8;
        numCols = 4;
        numRows = 2;
        sizeLabel = '4.8 × 9.5 cm (4 columnas × 2 filas)';
      } else {
        totalCopies = 10;
        numCols = 2;
        numRows = 5;
        sizeLabel = '9.5 × 4.8 cm (2 columnas × 5 filas)';
      }
    } else if (cardType === 'pocket') {
      if (isVertical) {
        totalCopies = 9;
        numCols = 3;
        numRows = 3;
        sizeLabel = '5.6 × 8.0 cm (3 columnas × 3 filas)';
      } else {
        totalCopies = 10;
        numCols = 2;
        numRows = 5;
        sizeLabel = '8.4 × 5.2 cm (2 columnas × 5 filas)';
      }
    } else {
      // suit_pocket
      totalCopies = 4;
      if (isVertical) {
        numCols = 2;
        numRows = 2;
        sizeLabel = '7.0 × 11.0 cm (2 columnas × 2 filas • Tarjeta estilo fotografía 11×7 cm)';
      } else {
        numCols = 1;
        numRows = 3;
        sizeLabel = '11.0 × 7.0 cm (1 columna × 3 filas • Tarjeta estilo fotografía 11×7 cm)';
      }
    }

    if (smallCardVariant === 'duplex') {
      const hebCards = Array.from({ length: totalCopies }, (_, i) => renderMiniCardHebrew(cardType, cardOrientation, i + 1));
      const fonCardsMirrored: string[] = [];

      for (let r = 0; r < numRows; r++) {
        for (let c = numCols - 1; c >= 0; c--) {
          const idx = r * numCols + c;
          if (idx < totalCopies) {
            fonCardsMirrored.push(renderMiniCardPhonetic(cardType, cardOrientation, idx + 1));
          }
        }
      }

      contentHtml = `
        <!-- PÁGINA 1: ANVERSO EN HEBREO -->
        <div class="mini-sheet-page ${bimahPaperSize}">
          <div class="mini-sheet-banner">
            ✂️ <strong>GUÍAS DE CORTE:</strong> 
            <strong>[PÁGINA 1 DE 2: ANVERSO EN HEBREO VOCALIZADO — ${totalCopies} Tarjetas (${sizeLabel})]</strong>
          </div>
          <div class="${cardType}-grid-container ${cardOrientation}">
            ${hebCards.join('')}
          </div>
          <div class="mini-sheet-footer-guide">
            <span>✂️ Marcas de corte L en las cuatro esquinas de cada tarjeta</span>
            <span>Imprime esta página por el anverso de la cartulina</span>
          </div>
        </div>

        <div class="page-break"></div>

        <!-- PÁGINA 2: REVERSO EN FONÉTICA -->
        <div class="mini-sheet-page ${bimahPaperSize}">
          <div class="mini-sheet-banner">
            ✂️ <strong>GUÍAS DE CORTE:</strong> 
            <strong>[PÁGINA 2 DE 2: REVERSO EN FONÉTICA — Columnas reflejadas horizontalmente para alineación exacta al cortar]</strong>
          </div>
          <div class="${cardType}-grid-container ${cardOrientation}">
            ${fonCardsMirrored.join('')}
          </div>
          <div class="mini-sheet-footer-guide">
            <span>✂️ Al cortar por las marcas guías, cada tarjeta coincide milimétricamente anverso y reverso</span>
            <span>Paso 2: Plastificar las ${totalCopies} tarjetas recortadas con mica térmica</span>
          </div>
        </div>
      `;
    } else if (smallCardVariant === 'foldable') {
      const foldableCount = cardType === 'wallet' ? 4 : cardType === 'half_wallet' ? 5 : cardType === 'pocket' ? (isVertical ? 4 : 5) : 2;
      const foldCards = Array.from({ length: foldableCount }, (_, i) => renderMiniCardFoldable(cardType, cardOrientation, i + 1));

      contentHtml = `
        <div class="mini-sheet-page ${bimahPaperSize}">
          <div class="mini-sheet-banner">
            ✂️ <strong>INSTRUCCIONES DE CORTE Y PLEGADO (1 SOLA HOJA — ${foldableCount} TARJETAS DÍPTICAS):</strong> 
            Recorta por las líneas discontinuas exteriores de cada pareja y dobla por la línea central (☵) antes de colocar dentro de la mica termoplástica.
          </div>
          <div class="mini-foldable-grid-${cardType} ${cardOrientation}">
            ${foldCards.join('')}
          </div>
          <div class="mini-sheet-footer-guide">
            <span>✂️ Recortar contorno exterior • Doblar por la espina central ☵</span>
            <span>Rinde ${foldableCount} tarjetas de doble cara en una sola pasada de impresión</span>
          </div>
        </div>
      `;
    } else if (smallCardVariant === 'single_heb') {
      const hebCards = Array.from({ length: totalCopies }, (_, i) => renderMiniCardHebrew(cardType, cardOrientation, i + 1));

      contentHtml = `
        <div class="mini-sheet-page ${bimahPaperSize}">
          <div class="mini-sheet-banner">
            ✂️ <strong>PLIEGO SOLO HEBREO (${totalCopies} COPIAS — ${sizeLabel}):</strong> Corta por las líneas discontinuas con guillotina o tijera.
          </div>
          <div class="${cardType}-grid-container ${cardOrientation}">
            ${hebCards.join('')}
          </div>
          <div class="mini-sheet-footer-guide">
            <span>✂️ Guías de corte milimétricas para guillotina o tijera</span>
            <span>${totalCopies} tarjetas idénticas en hebreo vocalizado</span>
          </div>
        </div>
      `;
    } else {
      // single_fon
      const fonCards = Array.from({ length: totalCopies }, (_, i) => renderMiniCardPhonetic(cardType, cardOrientation, i + 1));

      contentHtml = `
        <div class="mini-sheet-page ${bimahPaperSize}">
          <div class="mini-sheet-banner">
            ✂️ <strong>PLIEGO SOLO FONÉTICA (${totalCopies} COPIAS — ${sizeLabel}):</strong> Corta por las líneas discontinuas con guillotina o tijera.
          </div>
          <div class="${cardType}-grid-container ${cardOrientation}">
            ${fonCards.join('')}
          </div>
          <div class="mini-sheet-footer-guide">
            <span>✂️ Guías de corte milimétricas para guillotina o tijera</span>
            <span>${totalCopies} tarjetas idénticas con pronunciación fonética y respuestas</span>
          </div>
        </div>
      `;
    }
  } else {
    // Full Letter Page
    contentHtml = `
    <div class="bimah-page-wrapper ${bimahPaperSize}">
      ${renderCardUnit('bimah')}
    </div>
    `;
  }

  const pageSizeCss =
    selectedFormat === 'quarter_letter' ||
    selectedFormat === 'sixth_letter' ||
    selectedFormat === 'card_wallet' ||
    selectedFormat === 'card_pocket'
      ? isA4
        ? 'A4 portrait'
        : 'letter portrait'
      : selectedFormat === 'half_letter' && duplicateTwoUp
      ? isA4
        ? 'A4 landscape'
        : 'letter landscape'
      : selectedFormat === 'half_letter' && !duplicateTwoUp
      ? isA4
        ? 'A5 portrait'
        : '5.5in 8.5in portrait'
      : selectedFormat === 'bimah_laminated' || selectedFormat === 'full_letter'
      ? isA4
        ? 'A4 portrait'
        : 'letter portrait'
      : isA4
      ? 'A4 portrait'
      : 'letter portrait';

  const cssStyles = `
    @page {
      margin: 4.5mm;
      size: ${pageSizeCss};
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #000000;
      background: #ffffff;
      line-height: 1.2;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
      height: 0;
      display: block;
    }

    /* SHEET LEVEL CONTAINERS */
    .bimah-page-wrapper {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 1.5mm;
    }
    .bimah-laminate-banner {
      background: #fef3c7;
      border: 1px dashed #d97706;
      border-radius: 4px;
      padding: 1.2mm 2.5mm;
      margin-bottom: 1.5mm;
      font-size: 6.2pt;
      color: #78350f;
      text-align: center;
    }

    .half-letter-page-wrapper.two-up {
      width: 100%;
      height: 98vh;
      display: flex;
      flex-direction: row;
      align-items: stretch;
      justify-content: space-between;
      gap: 3mm;
      padding: 1.5mm;
    }
    .half-letter-page-wrapper.two-up .card-unit.half {
      flex: 1;
      height: 100%;
    }
    .cut-divider {
      width: 5mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .cut-divider::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      border-left: 1px dashed #d97706;
    }
    .cut-divider span {
      writing-mode: vertical-rl;
      font-size: 5pt;
      color: #b45309;
      background: #ffffff;
      padding: 2mm 0;
      z-index: 1;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .half-letter-page-wrapper.single {
      width: 100%;
      height: 98vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .quarter-grid-wrapper {
      width: 100%;
      height: 98vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 3.5mm;
      padding: 1.5mm;
      position: relative;
    }
    .cut-line-v {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      border-left: 1px dashed #d97706;
      pointer-events: none;
    }
    .cut-line-h {
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      border-top: 1px dashed #d97706;
      pointer-events: none;
    }
    .cut-center-badge {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ffffff;
      border: 1px solid #d97706;
      border-radius: 50%;
      width: 5mm;
      height: 5mm;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 6pt;
      z-index: 2;
    }

    .sixth-grid-wrapper {
      width: 100%;
      height: 98vh;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 2.5mm;
      padding: 1.5mm;
    }

    /* CARD UNIT CONTAINER */
    .card-unit {
      border: 2px solid #b45309;
      border-radius: 6px;
      padding: 2.2mm 2.8mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      background: #ffffff;
      overflow: hidden;
      box-sizing: border-box;
    }
    .card-unit.half {
      padding: 3mm 4mm;
      border-width: 2.5px;
    }
    .card-unit.bimah {
      padding: 3.2mm 4.5mm;
      border-width: 3px;
    }
    .card-unit.quarter {
      padding: 1.8mm 2.2mm;
      border-width: 1.8px;
    }
    .card-unit.sixth {
      padding: 1.4mm 1.8mm;
      border-width: 1.4px;
    }

    .cu-corner-decor {
      position: absolute;
      font-size: 9pt;
      color: #d97706;
      line-height: 1;
      opacity: 0.75;
    }
    .cu-corner-decor.tl { top: 1.2mm; left: 1.4mm; }
    .cu-corner-decor.tr { top: 1.2mm; right: 1.4mm; }
    .cu-corner-decor.bl { bottom: 1.2mm; left: 1.4mm; }
    .cu-corner-decor.br { bottom: 1.2mm; right: 1.4mm; }

    /* HEADER */
    .cu-header {
      text-align: center;
      border-bottom: 1.2px solid #d97706;
      padding-bottom: 1mm;
      margin-bottom: 1.2mm;
    }
    .card-unit.bimah .cu-header {
      padding-bottom: 1.4mm;
      margin-bottom: 1.8mm;
      border-bottom-width: 1.8px;
    }
    .card-unit.half .cu-header {
      padding-bottom: 1.4mm;
      margin-bottom: 1.6mm;
    }
    .cu-invocation {
      font-size: 5.5pt;
      color: #78716c;
      letter-spacing: 0.5px;
    }
    .cu-title-heb {
      font-family: "Frank Ruhl Libre", "David Libre", serif;
      font-size: 13.5pt;
      font-weight: 800;
      color: #78350f;
      line-height: 1.15;
      margin: 0.2mm 0;
    }
    .card-unit.half .cu-title-heb { font-size: 16pt; }
    .card-unit.bimah .cu-title-heb { font-size: 19pt; line-height: 1.15; margin: 0.4mm 0; }
    .card-unit.quarter .cu-title-heb { font-size: 12pt; }
    .card-unit.sixth .cu-title-heb { font-size: 10pt; }

    .cu-title-es {
      font-size: 7.2pt;
      font-weight: 700;
      color: #92400e;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .card-unit.bimah .cu-title-es { font-size: 9.8pt; letter-spacing: 0.6px; }
    .card-unit.half .cu-title-es { font-size: 8.5pt; }

    .cu-subtitle {
      font-size: 5.4pt;
      color: #78716c;
      margin-top: 0.2mm;
    }
    .card-unit.bimah .cu-subtitle { font-size: 7.0pt; }

    /* DEDICATION BOX */
    .dedication-box {
      background: #fffbeb;
      border: 1px solid #fed7aa;
      border-radius: 4px;
      padding: 0.8mm 1.5mm;
      margin-bottom: 1.2mm;
      text-align: center;
    }
    .dedication-title {
      font-size: 5.5pt;
      font-weight: 700;
      color: #92400e;
    }
    .dedication-name {
      font-size: 7pt;
      color: #78350f;
    }
    .dedication-name .hebrew-name {
      font-family: "Frank Ruhl Libre", serif;
      font-weight: 700;
      direction: rtl;
    }
    .dedication-date {
      font-size: 5.2pt;
      color: #a8a29e;
    }

    /* BODY */
    .cu-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 0.6mm 0;
      zoom: ${cardFontScale / 100};
    }

    /* SEPARATE BLOCKS */
    .separate-blocks-layout {
      display: flex;
      flex-direction: column;
      gap: 1.2mm;
    }
    .card-unit.bimah .separate-blocks-layout { gap: 1.8mm; }
    .card-unit.half .separate-blocks-layout { gap: 1.5mm; }

    .block-hebrew-section {
      background: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 4px;
      padding: 1.4mm 2mm;
      text-align: right;
    }
    .card-unit.bimah .block-hebrew-section { padding: 2.2mm 3.2mm; border-width: 1.5px; }
    .card-unit.half .block-hebrew-section { padding: 1.8mm 2.8mm; }

    .block-badge-heb {
      font-size: 5.8pt;
      font-weight: 800;
      color: #b45309;
      margin-bottom: 0.8mm;
      border-bottom: 0.5px solid #fed7aa;
      padding-bottom: 0.3mm;
    }
    .card-unit.bimah .block-badge-heb { font-size: 7.4pt; margin-bottom: 1.0mm; }

    .block-heb-text {
      font-family: "Frank Ruhl Libre", "David Libre", "Assistant", serif;
      font-weight: ${hebrewWeight === 'extra_bold' ? 900 : 700};
      color: #000000;
      line-height: 1.28;
      text-align: justify;
    }
    .card-unit.bimah .block-heb-text { font-size: ${includeSpanish ? '12.2pt' : '14.2pt'}; line-height: 1.30; }
    .card-unit.half .block-heb-text { font-size: 10.6pt; line-height: 1.28; }
    .card-unit.quarter .block-heb-text { font-size: 8.8pt; line-height: 1.25; }
    .card-unit.sixth .block-heb-text { font-size: 8.0pt; line-height: 1.20; }

    .block-line-heb {
      display: block;
      margin-bottom: 0.6mm;
    }
    .card-unit.half .block-line-heb { margin-bottom: 0.8mm; }
    .card-unit.bimah .block-line-heb { margin-bottom: 0.8mm; }

    .block-central-heb {
      display: block;
      background: #fffbeb;
      border: 1.2px solid #d97706;
      border-radius: 4px;
      padding: 1mm 2mm;
      margin: 1mm 0;
      text-align: center;
      font-weight: 900;
      color: #78350f;
    }
    .card-unit.bimah .block-central-heb { padding: 1.4mm 3mm; margin: 1.2mm 0; border-width: 1.6px; }

    .badge-resp-heb {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      border: 0.5px solid #f59e0b;
      border-radius: 3px;
      font-size: 0.75em;
      font-weight: 800;
      padding: 0.2mm 1.2mm;
      margin-right: 1.5mm;
      vertical-align: middle;
    }

    .block-phonetic-section {
      background: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 4px;
      padding: 1.4mm 2mm;
      text-align: left;
    }
    .card-unit.bimah .block-phonetic-section { padding: 2.2mm 3.2mm; border-width: 1.5px; }
    .card-unit.half .block-phonetic-section { padding: 1.8mm 2.8mm; }

    .block-badge-fon {
      font-size: 5.8pt;
      font-weight: 800;
      color: #b45309;
      margin-bottom: 0.8mm;
      border-bottom: 0.5px solid #fed7aa;
      padding-bottom: 0.3mm;
    }
    .card-unit.bimah .block-badge-fon { font-size: 7.4pt; margin-bottom: 1.0mm; }

    .block-fon-text {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 600;
      color: #1c1917;
      line-height: 1.24;
      text-align: left;
    }
    .card-unit.bimah .block-fon-text { font-size: ${includeSpanish ? '9.6pt' : '11.0pt'}; line-height: 1.26; }
    .card-unit.half .block-fon-text { font-size: 8.8pt; line-height: 1.24; }
    .card-unit.quarter .block-fon-text { font-size: 8.0pt; line-height: 1.20; }
    .card-unit.sixth .block-fon-text { font-size: 8.0pt; line-height: 1.18; }

    .block-line-fon {
      display: block;
      margin-bottom: 0.6mm;
      text-align: left;
    }
    .card-unit.half .block-line-fon { margin-bottom: 0.8mm; }
    .card-unit.bimah .block-line-fon { margin-bottom: 0.8mm; }

    .block-central-fon {
      display: block;
      background: #fffbeb;
      border: 1.2px solid #d97706;
      border-radius: 4px;
      padding: 1mm 2mm;
      margin: 1mm 0;
      text-align: center;
      font-weight: 800;
      color: #78350f;
    }
    .card-unit.bimah .block-central-fon { padding: 1.4mm 3mm; margin: 1.2mm 0; }

    .badge-resp-fon {
      color: #b45309;
      font-weight: 800;
    }

    .block-spanish-section {
      background: #fffdf5;
      border: 1px solid #fed7aa;
      border-radius: 4px;
      padding: 1.2mm 2.2mm;
      text-align: left;
    }
    .block-badge-esp {
      font-size: 5.8pt;
      font-weight: 800;
      color: #b45309;
      margin-bottom: 0.5mm;
    }
    .block-esp-text {
      font-size: 7.2pt;
      color: #57534e;
      line-height: 1.25;
    }
    .block-line-esp {
      display: block;
      margin-bottom: 0.6mm;
      text-align: left;
    }
    .block-central-esp {
      display: block;
      background: #fffbeb;
      border: 1px solid #fed7aa;
      border-radius: 3px;
      padding: 0.6mm 1.2mm;
      margin: 0.8mm 0;
      text-align: center;
      font-weight: 600;
      color: #7c2d12;
    }

    /* FOOTER */
    .cu-footer {
      border-top: 1px solid #d97706;
      padding-top: 0.8mm;
      margin-top: 0.8mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 5.5pt;
      color: #78716c;
    }
    .card-unit.bimah .cu-footer { font-size: 8pt; padding-top: 1.5mm; margin-top: 2mm; }
    .cu-reverence {
      flex: 1;
      font-style: italic;
    }
    .cu-seal {
      font-weight: 700;
      color: #b45309;
      margin-left: 2mm;
    }

    /* MINI CARD SPECIFIC STYLES */
    .mini-sheet-page {
      width: 100%;
      height: 98vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2.0mm;
      box-sizing: border-box;
    }
    .mini-sheet-banner {
      background: #fef3c7;
      border: 1px dashed #d97706;
      border-radius: 4px;
      padding: 1.2mm 2.5mm;
      margin-bottom: 1.5mm;
      font-size: 5.9pt;
      color: #78350f;
      font-weight: 700;
      line-height: 1.2;
    }
    .mini-sheet-footer-guide {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5mm;
      font-size: 4.9pt;
      color: #78716c;
      font-weight: 600;
    }

    /* MINI CARD GRIDS */
    .wallet-grid-container.vertical {
      display: grid;
      grid-template-columns: repeat(3, 58mm);
      grid-template-rows: repeat(3, 88mm);
      justify-content: center;
      margin: 0 auto;
      border: 1px dashed #cbd5e1;
    }
    .wallet-grid-container.horizontal {
      display: grid;
      grid-template-columns: repeat(2, 88mm);
      grid-template-rows: repeat(4, 56mm);
      justify-content: center;
      margin: 0 auto;
      border: 1px dashed #cbd5e1;
    }

    .half_wallet-grid-container.vertical {
      display: grid;
      grid-template-columns: repeat(4, 48mm);
      grid-template-rows: repeat(2, 95mm);
      justify-content: center;
      margin: 0 auto;
      border: 1px dashed #cbd5e1;
    }
    .half_wallet-grid-container.horizontal {
      display: grid;
      grid-template-columns: repeat(2, 95mm);
      grid-template-rows: repeat(5, 48mm);
      justify-content: center;
      margin: 0 auto;
      border: 1px dashed #cbd5e1;
    }

    .pocket-grid-container.vertical {
      display: grid;
      grid-template-columns: repeat(3, 56mm);
      grid-template-rows: repeat(3, 80mm);
      justify-content: center;
      margin: 0 auto;
      border: 1px dashed #cbd5e1;
    }
    .pocket-grid-container.horizontal {
      display: grid;
      grid-template-columns: repeat(2, 84mm);
      grid-template-rows: repeat(5, 52mm);
      justify-content: center;
      margin: 0 auto;
      border: 1px dashed #cbd5e1;
    }

    .suit_pocket-grid-container.vertical {
      display: grid;
      grid-template-columns: repeat(2, 70mm);
      grid-template-rows: repeat(2, 110mm);
      justify-content: center;
      margin: 0 auto;
      border: 1px dashed #cbd5e1;
    }
    .suit_pocket-grid-container.horizontal {
      display: grid;
      grid-template-columns: repeat(1, 110mm);
      grid-template-rows: repeat(3, 70mm);
      justify-content: center;
      margin: 0 auto;
      border: 1px dashed #cbd5e1;
    }

    /* MINI CARD UNIT */
    .mini-card-unit {
      position: relative;
      box-sizing: border-box;
      border: 0.4pt dashed #cbd5e1;
      padding: 1.5mm;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      overflow: hidden;
    }
    .mini-card-unit.wallet.horizontal { width: 88mm; height: 56mm; padding: 1.0mm; }
    .mini-card-unit.wallet.vertical { width: 58mm; height: 88mm; padding: 1.0mm; }
    .mini-card-unit.half_wallet.horizontal { width: 95mm; height: 48mm; padding: 1.0mm; }
    .mini-card-unit.half_wallet.vertical { width: 48mm; height: 95mm; padding: 1.0mm; }
    .mini-card-unit.pocket.horizontal { width: 84mm; height: 52mm; padding: 1.1mm; }
    .mini-card-unit.pocket.vertical { width: 56mm; height: 80mm; padding: 1.1mm; }
    .mini-card-unit.suit_pocket.horizontal { width: 110mm; height: 70mm; }
    .mini-card-unit.suit_pocket.vertical { width: 70mm; height: 110mm; }

    .mini-card-inner {
      flex: 1;
      min-height: 0;
      min-width: 0;
      border: 1.2px solid #b45309;
      border-radius: 4px;
      padding: 1.2mm 1.8mm;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #fffdfa;
      overflow: hidden;
    }
    .mini-card-unit.vertical .mini-card-inner {
      padding: 1.4mm 1.8mm;
    }
    .mini-card-unit.wallet .mini-card-inner,
    .mini-card-unit.half_wallet .mini-card-inner,
    .mini-card-unit.pocket .mini-card-inner {
      padding: 1.0mm 1.4mm;
    }
    .mini-card-unit.half_wallet.is-derabanan .mini-card-inner,
    .mini-card-unit.wallet.is-derabanan .mini-card-inner {
      padding: 0.8mm 1.2mm !important;
    }

    .mini-crop-corner {
      position: absolute;
      width: 3.5mm;
      height: 3.5mm;
      pointer-events: none;
      z-index: 2;
    }
    .mini-crop-corner.tl { top: 0; left: 0; border-top: 1.2px solid #94a3b8; border-left: 1.2px solid #94a3b8; }
    .mini-crop-corner.tr { top: 0; right: 0; border-top: 1.2px solid #94a3b8; border-right: 1.2px solid #94a3b8; }
    .mini-crop-corner.bl { bottom: 0; left: 0; border-bottom: 1.2px solid #94a3b8; border-left: 1.2px solid #94a3b8; }
    .mini-crop-corner.br { bottom: 0; right: 0; border-bottom: 1.2px solid #94a3b8; border-right: 1.2px solid #94a3b8; }

    .mini-header {
      flex-shrink: 0;
      text-align: center;
      border-bottom: 0.6px solid #d97706;
      padding-bottom: 0.35mm;
      margin-bottom: 0.35mm;
      display: flex;
      flex-direction: column;
      gap: 0.15mm;
    }
    .mini-card-unit.wallet .mini-header,
    .mini-card-unit.half_wallet .mini-header,
    .mini-card-unit.pocket .mini-header {
      padding-bottom: 0.25mm;
      margin-bottom: 0.25mm;
      gap: 0;
    }
    .mini-bsd {
      font-size: 4.8pt;
      color: #a8a29e;
      letter-spacing: 0.4px;
      line-height: 1;
    }
    .mini-title-heb {
      font-family: "David Libre", "Frank Ruhl Libre", serif;
      font-weight: 800;
      color: #78350f;
      line-height: 1.08;
      font-size: 9.2pt;
    }
    .mini-title-fon {
      font-weight: 800;
      color: #78350f;
      line-height: 1.08;
      font-size: 8.6pt;
    }
    .mini-card-unit.wallet .mini-title-heb,
    .mini-card-unit.half_wallet .mini-title-heb,
    .mini-card-unit.pocket .mini-title-heb {
      font-size: 7.8pt;
    }
    .mini-card-unit.wallet .mini-title-fon,
    .mini-card-unit.half_wallet .mini-title-fon,
    .mini-card-unit.pocket .mini-title-fon {
      font-size: 7.4pt;
    }
    .mini-dedication {
      flex-shrink: 0;
      font-size: 5.0pt;
      line-height: 1.1;
      color: #b45309;
      background: #fffbeb;
      border: 0.5px solid #fed7aa;
      border-radius: 2px;
      text-align: center;
      padding: 0.25mm 0.6mm;
      margin-bottom: 0.3mm;
    }

    /* MINI BODY HEBREW (CALIBRATED BY PHYSICAL CARD DIMENSIONS + AUTO-FIT BOUND) */
    .mini-body-heb {
      flex: 1;
      min-height: 0;
      min-width: 0;
      padding: 0.25mm 0.4mm 0.55mm 0.4mm;
      font-family: "Frank Ruhl Libre", "David Libre", "Assistant", serif;
      font-weight: ${hebrewWeight === 'extra_bold' ? 900 : 700};
      color: #000000;
      line-height: 1.18;
      text-align: justify;
      overflow: hidden;
      font-size: calc(8.0pt * ${cardFontScale / 100});
    }
    .mini-card-unit.wallet.horizontal .mini-body-heb { font-size: calc(7.1pt * ${cardFontScale / 100}); line-height: 1.14; }
    .mini-card-unit.wallet.horizontal.is-chatzi .mini-body-heb { font-size: calc(9.8pt * ${cardFontScale / 100}); line-height: 1.28; }
    .mini-card-unit.wallet.horizontal.is-shalem .mini-body-heb { font-size: calc(6.5pt * ${cardFontScale / 100}); line-height: 1.12; }
    .mini-card-unit.wallet.horizontal.is-derabanan .mini-body-heb { font-size: calc(5.8pt * ${cardFontScale / 100}); line-height: 1.10; }

    .mini-card-unit.half_wallet.horizontal .mini-body-heb { font-size: calc(6.8pt * ${cardFontScale / 100}); line-height: 1.13; }
    .mini-card-unit.half_wallet.horizontal.is-chatzi .mini-body-heb { font-size: calc(9.5pt * ${cardFontScale / 100}); line-height: 1.26; }
    .mini-card-unit.half_wallet.horizontal.is-shalem .mini-body-heb { font-size: calc(6.3pt * ${cardFontScale / 100}); line-height: 1.11; }
    .mini-card-unit.half_wallet.horizontal.is-derabanan .mini-body-heb { font-size: calc(5.5pt * ${cardFontScale / 100}); line-height: 1.08; }

    .mini-card-unit.pocket.horizontal .mini-body-heb { font-size: calc(6.9pt * ${cardFontScale / 100}); line-height: 1.14; }
    .mini-card-unit.pocket.horizontal.is-chatzi .mini-body-heb { font-size: calc(9.2pt * ${cardFontScale / 100}); line-height: 1.24; }
    .mini-card-unit.pocket.horizontal.is-shalem .mini-body-heb { font-size: calc(6.4pt * ${cardFontScale / 100}); line-height: 1.11; }
    .mini-card-unit.pocket.horizontal.is-derabanan .mini-body-heb { font-size: calc(5.7pt * ${cardFontScale / 100}); line-height: 1.09; }

    .mini-card-unit.suit_pocket.horizontal .mini-body-heb { font-size: calc(9.4pt * ${cardFontScale / 100}); line-height: 1.24; }
    .mini-card-unit.suit_pocket.horizontal.is-chatzi .mini-body-heb { font-size: calc(10.8pt * ${cardFontScale / 100}); line-height: 1.34; }
    .mini-card-unit.suit_pocket.horizontal.is-shalem .mini-body-heb { font-size: calc(9.0pt * ${cardFontScale / 100}); line-height: 1.20; }
    .mini-card-unit.suit_pocket.horizontal.is-derabanan .mini-body-heb { font-size: calc(8.0pt * ${cardFontScale / 100}); line-height: 1.15; }

    .mini-card-unit.wallet.vertical .mini-body-heb { font-size: calc(7.1pt * ${cardFontScale / 100}); line-height: 1.14; }
    .mini-card-unit.wallet.vertical.is-chatzi .mini-body-heb { font-size: calc(9.6pt * ${cardFontScale / 100}); line-height: 1.26; }
    .mini-card-unit.wallet.vertical.is-shalem .mini-body-heb { font-size: calc(6.5pt * ${cardFontScale / 100}); line-height: 1.12; }
    .mini-card-unit.wallet.vertical.is-derabanan .mini-body-heb { font-size: calc(5.8pt * ${cardFontScale / 100}); line-height: 1.10; }

    .mini-card-unit.half_wallet.vertical .mini-body-heb { font-size: calc(6.8pt * ${cardFontScale / 100}); line-height: 1.13; }
    .mini-card-unit.half_wallet.vertical.is-chatzi .mini-body-heb { font-size: calc(9.2pt * ${cardFontScale / 100}); line-height: 1.25; }
    .mini-card-unit.half_wallet.vertical.is-shalem .mini-body-heb { font-size: calc(6.2pt * ${cardFontScale / 100}); line-height: 1.10; }
    .mini-card-unit.half_wallet.vertical.is-derabanan .mini-body-heb { font-size: calc(5.4pt * ${cardFontScale / 100}); line-height: 1.08; }

    .mini-card-unit.pocket.vertical .mini-body-heb { font-size: calc(6.8pt * ${cardFontScale / 100}); line-height: 1.13; }
    .mini-card-unit.pocket.vertical.is-chatzi .mini-body-heb { font-size: calc(9.2pt * ${cardFontScale / 100}); line-height: 1.24; }
    .mini-card-unit.pocket.vertical.is-shalem .mini-body-heb { font-size: calc(6.3pt * ${cardFontScale / 100}); line-height: 1.10; }
    .mini-card-unit.pocket.vertical.is-derabanan .mini-body-heb { font-size: calc(5.6pt * ${cardFontScale / 100}); line-height: 1.09; }

    .mini-card-unit.suit_pocket.vertical .mini-body-heb { font-size: calc(9.4pt * ${cardFontScale / 100}); line-height: 1.24; }
    .mini-card-unit.suit_pocket.vertical.is-chatzi .mini-body-heb { font-size: calc(10.8pt * ${cardFontScale / 100}); line-height: 1.34; }
    .mini-card-unit.suit_pocket.vertical.is-shalem .mini-body-heb { font-size: calc(9.0pt * ${cardFontScale / 100}); line-height: 1.20; }
    .mini-card-unit.suit_pocket.vertical.is-derabanan .mini-body-heb { font-size: calc(8.0pt * ${cardFontScale / 100}); line-height: 1.15; }

    .mini-heb-line {
      display: block;
      margin-bottom: 0.2mm;
      text-align: right;
      line-height: inherit;
      font-size: inherit;
      font-weight: ${hebrewWeight === 'extra_bold' ? 900 : 700};
    }
    /* Continuous pocket-siddur inline flow on compact cards (prevents empty half-lines & bottom clipping) */
    .mini-card-unit.wallet:not(.is-chatzi) .mini-heb-line,
    .mini-card-unit.half_wallet:not(.is-chatzi) .mini-heb-line,
    .mini-card-unit.pocket:not(.is-chatzi) .mini-heb-line {
      display: inline;
      margin-bottom: 0;
    }
    .mini-card-unit.wallet:not(.is-chatzi) .mini-heb-line::after,
    .mini-card-unit.half_wallet:not(.is-chatzi) .mini-heb-line::after,
    .mini-card-unit.pocket:not(.is-chatzi) .mini-heb-line::after {
      content: ' · ';
      color: #b45309;
      font-weight: 700;
    }
    .mini-card-unit.wallet:not(.is-chatzi) .mini-heb-line:last-child::after,
    .mini-card-unit.half_wallet:not(.is-chatzi) .mini-heb-line:last-child::after,
    .mini-card-unit.pocket:not(.is-chatzi) .mini-heb-line:last-child::after {
      content: none;
    }
    .mini-resp-highlight-heb {
      display: block;
      font-weight: 900;
      color: #78350f;
      text-align: right;
      margin: 0.25mm 0;
      line-height: inherit;
      font-size: inherit;
    }
    .mini-card-unit.wallet .mini-resp-highlight-heb,
    .mini-card-unit.half_wallet .mini-resp-highlight-heb,
    .mini-card-unit.pocket .mini-resp-highlight-heb {
      margin: 0.15mm 0;
    }
    .mini-badge-resp {
      font-weight: 900;
      color: #b45309;
      font-size: inherit;
    }

    /* MINI BODY FON (CALIBRATED BY PHYSICAL CARD DIMENSIONS + AUTO-FIT BOUND) */
    .mini-body-fon {
      flex: 1;
      min-height: 0;
      min-width: 0;
      padding: 0.25mm 0.4mm 0.55mm 0.4mm;
      font-family: system-ui, -apple-system, sans-serif;
      color: #1c1917;
      line-height: 1.18;
      text-align: left;
      overflow: hidden;
      font-size: calc(7.8pt * ${cardFontScale / 100});
    }
    .mini-card-unit.wallet.horizontal .mini-body-fon { font-size: calc(6.7pt * ${cardFontScale / 100}); line-height: 1.13; }
    .mini-card-unit.wallet.horizontal.is-chatzi .mini-body-fon { font-size: calc(9.2pt * ${cardFontScale / 100}); line-height: 1.25; }
    .mini-card-unit.wallet.horizontal.is-shalem .mini-body-fon { font-size: calc(6.2pt * ${cardFontScale / 100}); line-height: 1.11; }
    .mini-card-unit.wallet.horizontal.is-derabanan .mini-body-fon { font-size: calc(5.5pt * ${cardFontScale / 100}); line-height: 1.09; }

    .mini-card-unit.half_wallet.horizontal .mini-body-fon { font-size: calc(6.5pt * ${cardFontScale / 100}); line-height: 1.12; }
    .mini-card-unit.half_wallet.horizontal.is-chatzi .mini-body-fon { font-size: calc(9.0pt * ${cardFontScale / 100}); line-height: 1.24; }
    .mini-card-unit.half_wallet.horizontal.is-shalem .mini-body-fon { font-size: calc(6.0pt * ${cardFontScale / 100}); line-height: 1.10; }
    .mini-card-unit.half_wallet.horizontal.is-derabanan .mini-body-fon { font-size: calc(5.2pt * ${cardFontScale / 100}); line-height: 1.08; }

    .mini-card-unit.pocket.horizontal .mini-body-fon { font-size: calc(6.6pt * ${cardFontScale / 100}); line-height: 1.12; }
    .mini-card-unit.pocket.horizontal.is-chatzi .mini-body-fon { font-size: calc(8.8pt * ${cardFontScale / 100}); line-height: 1.22; }
    .mini-card-unit.pocket.horizontal.is-shalem .mini-body-fon { font-size: calc(6.1pt * ${cardFontScale / 100}); line-height: 1.10; }
    .mini-card-unit.pocket.horizontal.is-derabanan .mini-body-fon { font-size: calc(5.4pt * ${cardFontScale / 100}); line-height: 1.08; }

    .mini-card-unit.suit_pocket.horizontal .mini-body-fon { font-size: calc(9.0pt * ${cardFontScale / 100}); line-height: 1.20; }
    .mini-card-unit.suit_pocket.horizontal.is-chatzi .mini-body-fon { font-size: calc(10.6pt * ${cardFontScale / 100}); line-height: 1.32; }
    .mini-card-unit.suit_pocket.horizontal.is-shalem .mini-body-fon { font-size: calc(8.6pt * ${cardFontScale / 100}); line-height: 1.19; }
    .mini-card-unit.suit_pocket.horizontal.is-derabanan .mini-body-fon { font-size: calc(7.6pt * ${cardFontScale / 100}); line-height: 1.14; }

    .mini-card-unit.wallet.vertical .mini-body-fon { font-size: calc(6.7pt * ${cardFontScale / 100}); line-height: 1.13; }
    .mini-card-unit.wallet.vertical.is-chatzi .mini-body-fon { font-size: calc(9.2pt * ${cardFontScale / 100}); line-height: 1.25; }
    .mini-card-unit.wallet.vertical.is-shalem .mini-body-fon { font-size: calc(6.2pt * ${cardFontScale / 100}); line-height: 1.11; }
    .mini-card-unit.wallet.vertical.is-derabanan .mini-body-fon { font-size: calc(5.4pt * ${cardFontScale / 100}); line-height: 1.08; }

    .mini-card-unit.half_wallet.vertical .mini-body-fon { font-size: calc(6.4pt * ${cardFontScale / 100}); line-height: 1.12; }
    .mini-card-unit.half_wallet.vertical.is-chatzi .mini-body-fon { font-size: calc(8.8pt * ${cardFontScale / 100}); line-height: 1.23; }
    .mini-card-unit.half_wallet.vertical.is-shalem .mini-body-fon { font-size: calc(5.9pt * ${cardFontScale / 100}); line-height: 1.10; }
    .mini-card-unit.half_wallet.vertical.is-derabanan .mini-body-fon { font-size: calc(5.1pt * ${cardFontScale / 100}); line-height: 1.07; }

    .mini-card-unit.pocket.vertical .mini-body-fon { font-size: calc(6.5pt * ${cardFontScale / 100}); line-height: 1.12; }
    .mini-card-unit.pocket.vertical.is-chatzi .mini-body-fon { font-size: calc(8.8pt * ${cardFontScale / 100}); line-height: 1.22; }
    .mini-card-unit.pocket.vertical.is-shalem .mini-body-fon { font-size: calc(6.0pt * ${cardFontScale / 100}); line-height: 1.10; }
    .mini-card-unit.pocket.vertical.is-derabanan .mini-body-fon { font-size: calc(5.3pt * ${cardFontScale / 100}); line-height: 1.08; }

    .mini-card-unit.suit_pocket.vertical .mini-body-fon { font-size: calc(9.0pt * ${cardFontScale / 100}); line-height: 1.20; }
    .mini-card-unit.suit_pocket.vertical.is-chatzi .mini-body-fon { font-size: calc(10.6pt * ${cardFontScale / 100}); line-height: 1.32; }
    .mini-card-unit.suit_pocket.vertical.is-shalem .mini-body-fon { font-size: calc(8.6pt * ${cardFontScale / 100}); line-height: 1.19; }
    .mini-card-unit.suit_pocket.vertical.is-derabanan .mini-body-fon { font-size: calc(7.6pt * ${cardFontScale / 100}); line-height: 1.14; }

    .mini-fon-line {
      display: block;
      margin-bottom: 0.2mm;
      text-align: left;
      line-height: inherit;
      font-size: inherit;
    }
    .mini-card-unit.wallet:not(.is-chatzi) .mini-fon-line,
    .mini-card-unit.half_wallet:not(.is-chatzi) .mini-fon-line,
    .mini-card-unit.pocket:not(.is-chatzi) .mini-fon-line {
      display: inline;
      margin-bottom: 0;
    }
    .mini-card-unit.wallet:not(.is-chatzi) .mini-fon-line::after,
    .mini-card-unit.half_wallet:not(.is-chatzi) .mini-fon-line::after,
    .mini-card-unit.pocket:not(.is-chatzi) .mini-fon-line::after {
      content: ' · ';
      color: #b45309;
      font-weight: 700;
    }
    .mini-card-unit.wallet:not(.is-chatzi) .mini-fon-line:last-child::after,
    .mini-card-unit.half_wallet:not(.is-chatzi) .mini-fon-line:last-child::after,
    .mini-card-unit.pocket:not(.is-chatzi) .mini-fon-line:last-child::after {
      content: none;
    }
    .mini-resp-highlight-fon {
      display: block;
      font-weight: 800;
      color: #78350f;
      text-align: left;
      margin: 0.25mm 0;
      line-height: inherit;
      font-size: inherit;
    }
    .mini-card-unit.wallet .mini-resp-highlight-fon,
    .mini-card-unit.half_wallet .mini-resp-highlight-fon,
    .mini-card-unit.pocket .mini-resp-highlight-fon {
      margin: 0.15mm 0;
    }
    .mini-badge-resp-fon {
      color: #b45309;
      font-weight: 800;
      font-size: inherit;
    }

    /* BLUE CONTRAST BANNER FOR 'AL ISRAEL' / 'AL RABBANAN' */
    .mini-derabanan-banner-heb,
    .mini-derabanan-banner-fon {
      background-color: #1e3a8a !important;
      color: #ffffff !important;
      padding: 1.2mm 1.8mm !important;
      margin: 0.8mm 0 !important;
      border-radius: 3px !important;
      box-sizing: border-box !important;
      border: 1px solid #1d4ed8 !important;
      text-align: justify !important;
      box-shadow: inset 0 0 0 0.5px rgba(255,255,255,0.2) !important;
    }
    .mini-banner-header-heb,
    .mini-banner-header-fon {
      font-size: 5.8pt !important;
      font-weight: 800 !important;
      text-transform: uppercase !important;
      color: #fef08a !important;
      text-align: center !important;
      margin-bottom: 0.5mm !important;
      border-bottom: 0.5pt solid rgba(255, 255, 255, 0.3) !important;
      padding-bottom: 0.3mm !important;
      letter-spacing: 0.4px !important;
    }
    .mini-banner-text-heb,
    .mini-banner-text-fon {
      font-size: inherit !important;
      line-height: inherit !important;
      color: #ffffff !important;
      font-weight: 700 !important;
    }
    .mini-badge-resp-banner {
      color: #fef08a !important;
      font-weight: 800 !important;
    }

    .block-rabbanan-banner-heb,
    .block-rabbanan-banner-fon {
      background-color: #1e3a8a !important;
      color: #ffffff !important;
      padding: 3mm 4.5mm !important;
      margin: 2.5mm 0 !important;
      border-radius: 6px !important;
      border: 1.5px solid #1d4ed8 !important;
    }
    .block-rabbanan-banner-title {
      font-size: 9pt !important;
      font-weight: 800 !important;
      color: #fef08a !important;
      text-align: center !important;
      margin-bottom: 1.5mm !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3) !important;
      padding-bottom: 0.8mm !important;
      letter-spacing: 0.5px !important;
    }
    .block-rabbanan-banner-body {
      font-size: 10.5pt !important;
      line-height: 1.35 !important;
      color: #ffffff !important;
      font-weight: 700 !important;
      text-align: justify !important;
    }
    .badge-resp-banner {
      color: #fef08a !important;
      font-weight: 800 !important;
      margin-top: 1mm !important;
    }

    /* UNIVERSAL GRAY SHADING FOR 'AL ISRAEL' (KADISH DERABBANAN + YATOM 2-IN-1) */
    .mini-derabanan-universal-heb,
    .mini-derabanan-universal-fon {
      background-color: #f1f5f9 !important;
      color: #0f172a !important;
      padding: 0.75mm 1.1mm !important;
      margin: 0.45mm 0 !important;
      border-radius: 3px !important;
      box-sizing: border-box !important;
      border: 1px dashed #64748b !important;
      text-align: justify !important;
      box-shadow: inset 0 0 0 0.5px rgba(255,255,255,0.6) !important;
    }
    .mini-universal-header-heb,
    .mini-universal-header-fon {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      font-size: 5.5pt !important;
      font-weight: 800 !important;
      color: #1e293b !important;
      margin-bottom: 0.4mm !important;
      border-bottom: 0.5pt solid #cbd5e1 !important;
      padding-bottom: 0.2mm !important;
      text-transform: uppercase !important;
      letter-spacing: 0.3px !important;
    }
    .mini-skip-note {
      font-size: 4.8pt !important;
      color: #475569 !important;
      font-weight: 700 !important;
    }
    .mini-universal-text-heb,
    .mini-universal-text-fon {
      font-size: inherit !important;
      line-height: inherit !important;
      color: #0f172a !important;
      font-weight: 700 !important;
    }
    .mini-badge-resp-univ {
      color: #0f172a !important;
      font-weight: 800 !important;
      text-decoration: underline !important;
    }

    .block-rabbanan-universal-heb,
    .block-rabbanan-universal-fon {
      background-color: #f1f5f9 !important;
      color: #0f172a !important;
      padding: 1.8mm 3mm !important;
      margin: 1.2mm 0 !important;
      border-radius: 6px !important;
      border: 1.5px dashed #64748b !important;
    }
    .block-rabbanan-universal-title {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      font-size: 7.2pt !important;
      font-weight: 800 !important;
      color: #0f172a !important;
      margin-bottom: 0.8mm !important;
      border-bottom: 1px solid #cbd5e1 !important;
      padding-bottom: 0.4mm !important;
      letter-spacing: 0.3px !important;
    }
    .univ-tag {
      font-weight: 800 !important;
      color: #0f172a !important;
    }
    .univ-subtag {
      font-size: 6.4pt !important;
      color: #475569 !important;
      font-style: italic !important;
      font-weight: 700 !important;
    }
    .block-rabbanan-universal-body {
      font-size: ${includeSpanish ? '9.4pt' : '10.4pt'} !important;
      line-height: 1.28 !important;
      color: #0f172a !important;
      font-weight: 700 !important;
      text-align: justify !important;
    }
    .badge-resp-universal-heb,
    .badge-resp-universal-fon {
      color: #0f172a !important;
      font-weight: 800 !important;
      margin-top: 0.6mm !important;
    }

    .il-rabbanan-universal {
      background-color: #f1f5f9 !important;
      border: 1.5px dashed #64748b !important;
      border-radius: 6px !important;
      padding: 2.5mm 3.5mm !important;
      margin: 2mm 0 !important;
    }
    .il-universal-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      border-bottom: 1px solid #cbd5e1 !important;
      padding-bottom: 0.5mm !important;
      margin-bottom: 1mm !important;
      font-size: 7.5pt !important;
      font-weight: 800 !important;
      color: #0f172a !important;
    }
    .il-rabbanan-blue {
      background-color: #1e3a8a !important;
      color: #ffffff !important;
      border: 1.5px solid #1d4ed8 !important;
      border-radius: 6px !important;
      padding: 2.5mm 3.5mm !important;
      margin: 2mm 0 !important;
    }
    .il-blue-header {
      text-align: center !important;
      color: #fef08a !important;
      font-size: 7.5pt !important;
      font-weight: 800 !important;
      border-bottom: 1px solid rgba(255,255,255,0.3) !important;
      padding-bottom: 0.5mm !important;
      margin-bottom: 1mm !important;
    }

    /* NUSAJ COMPARISON 2-COLUMN STYLES */
    .nusaj-comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3mm;
      width: 100%;
      margin-top: 2mm;
    }
    .nusaj-col-blue {
      background-color: #1e3a8a !important;
      color: #ffffff !important;
      padding: 3mm !important;
      border-radius: 6px !important;
      border: 1.5px solid #1d4ed8 !important;
      box-sizing: border-box !important;
    }
    .nusaj-col-header-blue {
      background-color: #172554 !important;
      color: #fde047 !important;
      font-weight: 800 !important;
      font-size: 8.5pt !important;
      padding: 1.2mm 2mm !important;
      border-radius: 3px !important;
      margin-bottom: 2mm !important;
      text-align: center !important;
      text-transform: uppercase !important;
      border: 1px solid #1e40af !important;
    }
    .nusaj-col-white {
      background-color: #ffffff !important;
      color: #0f172a !important;
      padding: 3mm !important;
      border-radius: 6px !important;
      border: 1.5px solid #cbd5e1 !important;
      box-sizing: border-box !important;
    }
    .nusaj-col-header-white {
      background-color: #eff6ff !important;
      color: #1e40af !important;
      font-weight: 800 !important;
      font-size: 8.5pt !important;
      padding: 1.2mm 2mm !important;
      border-radius: 3px !important;
      margin-bottom: 2mm !important;
      text-align: center !important;
      text-transform: uppercase !important;
      border: 1px solid #bfdbfe !important;
    }
    .comp-banner-blue {
      background-color: #172554 !important;
      color: #ffffff !important;
      padding: 2mm !important;
      border-radius: 3px !important;
      margin: 1.5mm 0 !important;
      border: 1px solid #2563eb !important;
    }
    .comp-banner-title {
      color: #fde047 !important;
      font-weight: 800 !important;
      font-size: 8pt !important;
      text-align: center !important;
      margin-bottom: 1mm !important;
    }
    .comp-banner-white {
      background-color: #f8fafc !important;
      color: #0f172a !important;
      padding: 2mm !important;
      border-radius: 3px !important;
      margin: 1.5mm 0 !important;
      border: 1px solid #94a3b8 !important;
    }
    .comp-banner-title-white {
      color: #1e40af !important;
      font-weight: 800 !important;
      font-size: 8pt !important;
      text-align: center !important;
      margin-bottom: 1mm !important;
    }
    .comp-line-blue {
      color: #ffffff !important;
      font-size: 9.5pt !important;
      line-height: 1.3 !important;
      margin-bottom: 1mm !important;
    }
    .comp-line-white {
      color: #0f172a !important;
      font-size: 9.5pt !important;
      line-height: 1.3 !important;
      margin-bottom: 1mm !important;
    }

    /* MINI CARD COMPARISON GRID */
    .mini-comp-grid {
      flex: 1;
      min-height: 0;
      min-width: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: minmax(0, 1fr);
      gap: 1.2mm;
      width: 100%;
      overflow: hidden;
    }
    .mini-col-blue {
      min-height: 0;
      height: 100%;
      background-color: #1e3a8a !important;
      color: #ffffff !important;
      padding: 0.9mm !important;
      border-radius: 3px !important;
      border: 1px solid #1d4ed8 !important;
      font-size: 6.2pt;
      line-height: 1.12;
      font-weight: ${hebrewWeight === 'extra_bold' ? 900 : 700} !important;
      overflow: hidden;
    }
    .mini-col-white {
      min-height: 0;
      height: 100%;
      background-color: #ffffff !important;
      color: #0f172a !important;
      padding: 0.9mm !important;
      border-radius: 3px !important;
      border: 1px solid #cbd5e1 !important;
      font-size: 6.2pt;
      line-height: 1.12;
      font-weight: ${hebrewWeight === 'extra_bold' ? 900 : 700} !important;
      overflow: hidden;
    }
    .mini-col-hdr-blue {
      background-color: #172554 !important;
      color: #fde047 !important;
      font-weight: 800 !important;
      font-size: 5.0pt !important;
      text-align: center !important;
      padding: 0.4mm !important;
      border-radius: 2px !important;
      margin-bottom: 0.6mm !important;
    }
    .mini-col-hdr-white {
      background-color: #eff6ff !important;
      color: #1e40af !important;
      font-weight: 800 !important;
      font-size: 5.0pt !important;
      text-align: center !important;
      padding: 0.4mm !important;
      border-radius: 2px !important;
      margin-bottom: 0.6mm !important;
    }

    /* MINI FOOTER */
    .mini-footer {
      flex-shrink: 0;
      border-top: 0.6px solid #d97706;
      padding-top: 0.3mm;
      margin-top: 0.3mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 4.8pt;
      line-height: 1.05;
      color: #78716c;
    }
    .mini-footer-guide {
      flex-shrink: 0;
      border-top: 0.6px solid #d97706;
      padding-top: 0.3mm;
      margin-top: 0.3mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 4.5pt;
      line-height: 1.05;
      color: #78716c;
      font-style: italic;
    }

    /* FOLDABLE DIPTYCH */
    .mini-foldable-unit {
      position: relative;
      display: flex;
      border: 0.8px dashed #94a3b8;
      margin: 1.5mm auto;
      background: #ffffff;
    }
    .mini-foldable-unit .mini-card-unit {
      flex: 1;
      min-width: 0;
      height: 100% !important;
      width: auto !important;
      border: none !important;
    }
    .mini-foldable-unit.wallet.horizontal { width: 176mm; height: 56mm; }
    .mini-foldable-unit.wallet.vertical { width: 116mm; height: 88mm; }
    .mini-foldable-unit.half_wallet.horizontal { width: 190mm; height: 48mm; }
    .mini-foldable-unit.half_wallet.vertical { width: 96mm; height: 95mm; }
    .mini-foldable-unit.pocket.horizontal { width: 168mm; height: 52mm; }
    .mini-foldable-unit.pocket.vertical { width: 112mm; height: 80mm; }
    .mini-foldable-unit.suit_pocket.horizontal { width: 220mm; height: 70mm; }
    .mini-foldable-unit.suit_pocket.vertical { width: 140mm; height: 110mm; }

    .mini-fold-spine {
      width: 5mm;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fffbeb;
      border-left: 0.5px dashed #d97706;
      border-right: 0.5px dashed #d97706;
      padding: 0;
    }
    .mini-fold-spine-text {
      writing-mode: vertical-rl;
      font-size: 4.2pt;
      color: #b45309;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    /* EXCEPTIONAL ASERET YEMEI TESHUVA MARKINGS (PRINT & COMPACT CARDS) */
    .aseret-exceptional-heb,
    .aseret-exceptional-fon {
      background-color: #fef3c7 !important;
      color: #7c2d12 !important;
      border-bottom: 1.4px solid #b45309 !important;
      border-radius: 2px;
      padding: 0 0.4mm;
      font-weight: 900 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .aseret-exceptional-heb.aseret-prefix,
    .aseret-exceptional-fon.aseret-prefix {
      padding: 0 0.12mm;
      margin: 0;
    }
    .aseret-inline-note {
      display: inline;
      font-size: 0.84em !important;
      font-weight: 800 !important;
      color: #9a3412 !important;
      background-color: #fef3c7 !important;
      border: 0.6px dashed #d97706 !important;
      border-radius: 2px;
      padding: 0 0.35mm;
    }
    .aseret-inline-note.aseret-prefix {
      padding: 0 0.15mm;
      margin-inline-end: 0.15mm;
    }
    .mini-aseret-pill {
      display: inline-block;
      margin-top: 0.2mm;
      padding: 0.15mm 1mm;
      border-radius: 2px;
      font-size: 4.6pt;
      line-height: 1.1;
      font-weight: 800;
      color: #9a3412;
      background-color: #ffedd5;
      border: 0.6px solid #ea580c;
    }
    .mini-aseret-pill.is-annotated {
      color: #78350f;
      background-color: #fef3c7;
      border-style: dashed;
      border-color: #d97706;
    }
  `;

  const fullHtmlDocument = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&family=David+Libre:wght@400;500;700;900&family=Frank+Ruhl+Libre:wght@400;500;700;800;900&display=swap" rel="stylesheet">
        <style>${cssStyles}</style>
      </head>
      <body>
        ${contentHtml}
        <script>
          window.onload = function() {
            window.focus();
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  // Pre-generate single card views
  const singleCardHebrewHtml = isCardFormat
    ? renderMiniCardHebrew(cardType, cardOrientation, 1)
    : renderCardUnit(selectedFormat === 'quarter_letter' ? 'quarter' : selectedFormat === 'sixth_letter' ? 'sixth' : selectedFormat === 'half_letter' ? 'half' : 'bimah', 1);

  const singleCardPhoneticHtml = isCardFormat
    ? renderMiniCardPhonetic(cardType, cardOrientation, 1)
    : renderCardUnit(selectedFormat === 'quarter_letter' ? 'quarter' : selectedFormat === 'sixth_letter' ? 'sixth' : selectedFormat === 'half_letter' ? 'half' : 'bimah', 1);

  const singleCardFoldableHtml = isCardFormat
    ? renderMiniCardFoldable(cardType, cardOrientation, 1)
    : singleCardHebrewHtml;

  const getSingleCardHtml = (side: 'hebrew' | 'phonetic' | 'both') => {
    if (side === 'hebrew') return singleCardHebrewHtml;
    if (side === 'phonetic') return singleCardPhoneticHtml;
    return singleCardFoldableHtml;
  };

  const getSingleCardPreviewDocument = (side: 'hebrew' | 'phonetic' | 'both') => {
    const cardContent = getSingleCardHtml(side);
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&family=David+Libre:wght@400;500;700;900&family=Frank+Ruhl+Libre:wght@400;500;700;800;900&display=swap" rel="stylesheet">
          <style>
            ${cssStyles}
            html, body {
              background: transparent !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .mini-card-unit {
              margin: 0 !important;
            }
          </style>
        </head>
        <body>
          ${cardContent}
        </body>
      </html>
    `;
  };

  const getFullSheetPreviewDocument = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&family=David+Libre:wght@400;500;700;900&family=Frank+Ruhl+Libre:wght@400;500;700;800;900&display=swap" rel="stylesheet">
          <style>
            ${cssStyles}
            html, body {
              background: #fffdfa !important;
              margin: 0 !important;
              padding: 3mm !important;
              display: block !important;
              width: 100% !important;
              height: auto !important;
              min-height: 100% !important;
              overflow: visible !important;
            }
            .bimah-page-wrapper,
            .half-letter-page-wrapper,
            .quarter-grid-wrapper,
            .sixth-grid-wrapper,
            .mini-sheet-page {
              height: auto !important;
              min-height: 0 !important;
            }
            .page-break {
              height: 6mm !important;
              margin: 4mm 0 !important;
              background: repeating-linear-gradient(
                90deg,
                #d97706 0,
                #d97706 6px,
                transparent 6px,
                transparent 12px
              ) !important;
              background-size: 100% 1.5px !important;
              background-position: center !important;
              background-repeat: no-repeat !important;
              position: relative !important;
            }
          </style>
        </head>
        <body>
          ${contentHtml}
        </body>
      </html>
    `;
  };

  return {
    title,
    contentHtml,
    cssStyles,
    fullHtmlDocument,
    cardDimensions,
    singleCardHebrewHtml,
    singleCardPhoneticHtml,
    singleCardFoldableHtml,
    getSingleCardHtml,
    getSingleCardPreviewDocument,
    getFullSheetPreviewDocument,
  };
}

/**
 * Automatically calibrates typography & line-height inside every .mini-card-unit
 * so text maximizes readability and fills the available card space cleanly
 * without ever clipping or overflowing outside wallet / credit-card / pocket borders.
 */
export function fitMiniCardsInContainer(root: ParentNode | null | undefined): void {
  if (!root || typeof window === 'undefined') return;

  const bodies = root.querySelectorAll<HTMLElement>(
    '.mini-body-heb, .mini-body-fon, .mini-col-blue, .mini-col-white'
  );

  bodies.forEach((el) => {
    const docWin = el.ownerDocument?.defaultView || window;

    // Reset inline overrides so repeated calls (e.g. after web fonts load) measure from true CSS baseline
    el.style.fontSize = '';
    el.style.lineHeight = '';

    if (el.clientHeight < 12 || el.clientWidth < 20) return;

    const cardUnit = el.closest('.mini-card-unit') as HTMLElement | null;
    const cardScale = parseFloat(cardUnit?.dataset?.fontScale || '100') || 100;

    const computed = docWin.getComputedStyle(el);
    const baseFontPx = parseFloat(computed.fontSize) || 9.5;
    const baseLineHeightPx = parseFloat(computed.lineHeight);
    const baseRatio =
      baseLineHeightPx && baseFontPx ? baseLineHeightPx / baseFontPx : 1.15;

    const isComparisonCol =
      el.classList.contains('mini-col-blue') || el.classList.contains('mini-col-white');
    const isHebrew = el.classList.contains('mini-body-heb');
    const isChatziCard = !!cardUnit?.classList.contains('is-chatzi');

    const comfortableRatio = isComparisonCol
      ? 1.12
      : isHebrew
      ? isChatziCard
        ? 1.24
        : 1.17
      : isChatziCard
      ? 1.22
      : 1.14;
    const targetRatio = Math.max(baseRatio, comfortableRatio);

    const minFontSizePx = 5.6; // ~4.2pt readability floor
    const maxFontSizePx = isComparisonCol ? 15 : isChatziCard ? 22 : 18;
    const widthTolerancePx = 3;

    // Only enforce horizontal width constraint if the container itself doesn't already clip at min size
    el.style.fontSize = `${minFontSizePx}px`;
    el.style.lineHeight = '1.05';
    const canCheckWidth = el.scrollWidth <= el.clientWidth + widthTolerancePx;

    const checkFits = (): boolean =>
      el.scrollHeight <= el.clientHeight &&
      (!canCheckWidth || el.scrollWidth <= el.clientWidth + widthTolerancePx);

    const applyAndCheck = (sizePx: number): { fits: boolean; ratio: number } => {
      const ratio =
        sizePx < 8.2
          ? Math.max(1.04, targetRatio - (8.2 - sizePx) * 0.03)
          : targetRatio;
      el.style.fontSize = `${sizePx.toFixed(2)}px`;
      el.style.lineHeight = `${ratio.toFixed(2)}`;
      return { fits: checkFits(), ratio };
    };

    // Binary search for the largest font size that fits inside clientHeight (padding-bottom protects descenders)
    let lo = minFontSizePx;
    let hi = maxFontSizePx;
    let bestPx = minFontSizePx;
    let bestRatio = targetRatio;

    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      const { fits, ratio } = applyAndCheck(mid);
      if (fits) {
        bestPx = mid;
        bestRatio = ratio;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    // Back off slightly from exact threshold unless user asked for maximum fill (105%)
    const stepBackPx = cardScale >= 105 ? 0.05 : 0.18;
    bestPx = Math.max(minFontSizePx, bestPx - stepBackPx);

    // Honor explicit <100% scale choice from user while keeping auto-maximized fit at 100%+
    if (cardScale < 100) {
      bestPx = Math.max(minFontSizePx, bestPx * (cardScale / 100));
    }

    el.style.fontSize = `${bestPx.toFixed(2)}px`;
    el.style.lineHeight = `${bestRatio.toFixed(2)}`;

    // Gently distribute any leftover sub-line vertical slack across line-height so the card looks balanced top-to-bottom
    if (cardScale >= 100 && !isComparisonCol) {
      const maxRelaxedRatio = Math.min(1.45, bestRatio + 0.16);
      let stepRatio = bestRatio;
      while (stepRatio + 0.02 <= maxRelaxedRatio) {
        const candidate = stepRatio + 0.02;
        el.style.lineHeight = `${candidate.toFixed(2)}`;
        if (checkFits()) {
          stepRatio = candidate;
        } else {
          el.style.lineHeight = `${stepRatio.toFixed(2)}`;
          break;
        }
      }
    }

    // Final safety clamp to guarantee zero overflow under any glyph metric
    let guard = 0;
    while (guard < 16 && bestPx > minFontSizePx && !checkFits()) {
      bestPx = Math.max(minFontSizePx, bestPx - 0.2);
      el.style.fontSize = `${bestPx.toFixed(2)}px`;
      guard++;
    }
  });
}
