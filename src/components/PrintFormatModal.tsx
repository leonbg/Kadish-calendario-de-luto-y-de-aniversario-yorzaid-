import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  CreditCard,
  Shirt,
  FileText,
  X,
  Eye,
  Heart,
  LayoutGrid,
  RectangleVertical,
  RectangleHorizontal,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { KaddishPrayer, KaddishType, DerabananNusaj, TranslitTradition } from '../types/kaddish';
import { KADDISH_YATOM, KADDISH_PRAYERS } from '../data/kaddishData';
import { DERABBANAN_NUSAJ_OPTIONS } from '../data/derabananVariants';
import {
  buildPrintDocument,
  fitMiniCardsInContainer,
  PrintDocumentOptions,
  PrintFormatSize,
  BimahPaperSize,
  TextArrangement,
  SmallCardPrintVariant,
  CardOrientation,
  AlIsraelBannerStyle,
  AseretPrintVariant,
} from '../utils/printDocumentBuilder';
import { PhysicalCardPreview } from './PhysicalCardPreview';

export type {
  PrintFormatSize,
  BimahPaperSize,
  TextArrangement,
  SmallCardPrintVariant,
  CardOrientation,
  AlIsraelBannerStyle,
  AseretPrintVariant,
};

interface PrintFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePrayer: KaddishPrayer;
  isAseret: boolean;
  translitTradition?: TranslitTradition;
}

type ModalTab = 'format' | 'options' | 'dedication';

interface FormatOptionMeta {
  id: PrintFormatSize;
  title: string;
  dimensionsVert: string;
  dimensionsHoriz?: string;
  yieldLabel: string;
  summary: string;
  isCard: boolean;
  isSecondary?: boolean;
}

const FORMAT_OPTIONS: FormatOptionMeta[] = [
  {
    id: 'card_wallet',
    title: 'Tarjeta de Crédito / Billetera',
    dimensionsVert: '5.8 × 8.8 cm',
    dimensionsHoriz: '8.8 × 5.6 cm',
    yieldLabel: '8–9 por hoja',
    summary: 'Tamaño tarjeta bancaria estándar; cabe en cualquier billetera o tarjetero.',
    isCard: true,
  },
  {
    id: 'suit_pocket',
    title: 'Bolsillo de Camisa / Saco',
    dimensionsVert: '7.0 × 11.0 cm',
    dimensionsHoriz: '11.0 × 7.0 cm',
    yieldLabel: '4 por hoja',
    summary: 'Letra más holgada para llevar en el bolsillo de camisa, saco o dentro del Sidur.',
    isCard: true,
  },
  {
    id: 'quarter_letter',
    title: 'Cuarta Parte de Hoja',
    dimensionsVert: '10.5 × 14.0 cm',
    yieldLabel: '4 por hoja',
    summary: 'Lámina de mano con hebreo y fonética en la misma cara; ideal para repartir en Minyán.',
    isCard: false,
  },
  {
    id: 'bimah_laminated',
    title: 'Hoja Completa (Bimá / Atril)',
    dimensionsVert: '21.6 × 27.9 cm',
    yieldLabel: '1 por hoja',
    summary: 'Letra grande a plana entera para el atril del Jazán o para plastificar.',
    isCard: false,
  },
  {
    id: 'half_letter',
    title: 'Media Carta / A5',
    dimensionsVert: '14.0 × 21.6 cm',
    yieldLabel: '2 por hoja',
    summary: 'Formato amplio tipo libro para Azkará o lectura cómoda en mesa.',
    isCard: false,
    isSecondary: true,
  },
  {
    id: 'sixth_letter',
    title: 'Sexta Parte de Hoja',
    dimensionsVert: '8.5 × 9.5 cm',
    yieldLabel: '6 por hoja',
    summary: 'Lámina compacta de una sola cara con hebreo y fonética juntos.',
    isCard: false,
    isSecondary: true,
  },
  {
    id: 'card_pocket',
    title: 'Estuche de Tefilín / Talit',
    dimensionsVert: '5.6 × 8.0 cm',
    dimensionsHoriz: '8.4 × 5.2 cm',
    yieldLabel: '9–10 por hoja',
    summary: 'Tarjeta reducida pensada para guardar dentro de la bolsa de Tefilín.',
    isCard: true,
    isSecondary: true,
  },
  {
    id: 'card_half_wallet',
    title: 'Media Billetera / Credencial',
    dimensionsVert: '4.8 × 9.5 cm',
    dimensionsHoriz: '9.5 × 4.8 cm',
    yieldLabel: '8–10 por hoja',
    summary: 'Formato angosto para porta-credencial o separador de Sidur.',
    isCard: true,
    isSecondary: true,
  },
];

const KADDISH_CHOICES: {
  id: KaddishType;
  name: string;
  heb: string;
  desc: string;
}[] = [
  {
    id: 'derabanan',
    name: 'DeRabbanan + Yatom',
    heb: 'קַדִּישׁ דְּרַבָּנָן',
    desc: 'Universal 2-en-1: estudio de Torá y Duelo.',
  },
  {
    id: 'yatom',
    name: 'Kadish Yatom',
    heb: 'קַדִּישׁ יָתוֹם',
    desc: 'Exclusivo de duelo y Yurzaid.',
  },
  {
    id: 'chatzi',
    name: 'Jatzi Kadish',
    heb: 'חֲצִי קַדִּישׁ',
    desc: 'Kadish corto entre secciones del rezo.',
  },
  {
    id: 'shalem',
    name: 'Kadish Shalem',
    heb: 'קַדִּישׁ שָׁלֵם',
    desc: 'Kadish completo con Titkabal tras Amidá.',
  },
];

function getPrimaryFormatIcon(id: PrintFormatSize) {
  switch (id) {
    case 'card_wallet':
      return CreditCard;
    case 'suit_pocket':
      return Shirt;
    case 'quarter_letter':
      return LayoutGrid;
    default:
      return FileText;
  }
}

export const PrintFormatModal: React.FC<PrintFormatModalProps> = ({
  isOpen,
  onClose,
  activePrayer,
  isAseret,
  translitTradition = 'sefaradi',
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('format');
  const [selectedKaddishType, setSelectedKaddishType] = useState<KaddishType>(
    activePrayer.id === 'yatom' || activePrayer.id === 'derabanan' ? 'derabanan' : activePrayer.id
  );
  const [printDerabananNusaj, setPrintDerabananNusaj] = useState<DerabananNusaj>('sefaradi_standard');
  const [printTranslitTradition, setPrintTranslitTradition] = useState<TranslitTradition>(
    translitTradition || 'sefaradi'
  );
  const [useNusajComparison, setUseNusajComparison] = useState(false);
  const [comparisonDerabananNusaj] = useState<DerabananNusaj>('sefaradi_occidental');
  const [alIsraelBannerStyle, setAlIsraelBannerStyle] = useState<AlIsraelBannerStyle>('gray_universal');
  const [showSecondaryFormats, setShowSecondaryFormats] = useState<boolean>(false);
  const [cardFontScale, setCardFontScale] = useState<number>(100);
  const [hebrewWeight, setHebrewWeight] = useState<'extra_bold' | 'bold'>('extra_bold');
  const [aseretPrintVariant, setAseretPrintVariant] = useState<AseretPrintVariant>(
    isAseret ? 'marked_aseret' : 'standard'
  );
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  const [selectedFormat, setSelectedFormat] = useState<PrintFormatSize>('card_wallet');
  const [textArrangement, setTextArrangement] = useState<TextArrangement>('separate_blocks');
  const [smallCardVariant, setSmallCardVariant] = useState<SmallCardPrintVariant>('duplex');
  const [cardOrientation, setCardOrientation] = useState<CardOrientation>('vertical');
  const [bimahPaperSize, setBimahPaperSize] = useState<BimahPaperSize>('letter');

  const [includeHebrew, setIncludeHebrew] = useState(true);
  const [includePhonetics, setIncludePhonetics] = useState(true);
  const [includeSpanish, setIncludeSpanish] = useState(true);
  const [includeReverenceGuide, setIncludeReverenceGuide] = useState(true);
  const [includeDecorativeBorder, setIncludeDecorativeBorder] = useState(true);
  const [duplicateTwoUp, setDuplicateTwoUp] = useState(true);

  const [dedicationName, setDedicationName] = useState('');
  const [dedicationHebrewName, setDedicationHebrewName] = useState('');
  const [dedicationDate, setDedicationDate] = useState('');

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfFeedback, setPdfFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
    blobUrl?: string;
    filename?: string;
  } | null>(null);

  const printIframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    return () => {
      if (pdfFeedback?.blobUrl) {
        URL.revokeObjectURL(pdfFeedback.blobUrl);
      }
    };
  }, [pdfFeedback?.blobUrl]);

  useEffect(() => {
    if (isOpen) {
      setPrintTranslitTradition(translitTradition || 'sefaradi');
      if (activePrayer.id === 'yatom' || activePrayer.id === 'derabanan') {
        setSelectedKaddishType('derabanan');
        setAlIsraelBannerStyle('gray_universal');
      } else {
        setSelectedKaddishType(activePrayer.id);
      }
      setSelectedFormat('card_wallet');
      setShowSecondaryFormats(false);
      setTextArrangement('separate_blocks');
      setSmallCardVariant('duplex');
      setCardOrientation('vertical');
      setAseretPrintVariant(isAseret ? 'marked_aseret' : 'standard');
      setIsPreviewMode(false);
      setActiveTab('format');
    }
  }, [isOpen, activePrayer.id, translitTradition, isAseret]);

  const isCardFormat =
    selectedFormat === 'suit_pocket' ||
    selectedFormat === 'card_wallet' ||
    selectedFormat === 'card_pocket' ||
    selectedFormat === 'card_half_wallet';

  const printOptions: PrintDocumentOptions = {
    selectedFormat,
    cardOrientation,
    bimahPaperSize,
    selectedKaddishType,
    printDerabananNusaj,
    comparisonDerabananNusaj,
    useNusajComparison,
    alIsraelBannerStyle,
    useBlueBanner: alIsraelBannerStyle === 'blue_contrast',
    translitTradition: printTranslitTradition,
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
    isAseret: aseretPrintVariant === 'marked_aseret',
    aseretPrintVariant,
  };

  const handleDownloadPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    setPdfFeedback(null);

    try {
      if (pdfFeedback?.blobUrl) {
        URL.revokeObjectURL(pdfFeedback.blobUrl);
      }
      const docResult = buildPrintDocument(printOptions);
      const { exportPrintDocumentToPdf } = await import('../utils/pdfExporter');
      const result = await exportPrintDocumentToPdf(printOptions, docResult);
      setPdfFeedback({
        type: 'success',
        message: `Archivo PDF guardado (${result.pageCount} ${result.pageCount === 1 ? 'página' : 'páginas'}): ${result.filename}`,
        blobUrl: result.blobUrl,
        filename: result.filename,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      setPdfFeedback({
        type: 'error',
        message: 'No se pudo generar el archivo PDF. Intenta de nuevo o cambia el formato.',
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    const docResult = buildPrintDocument(printOptions);
    const cleanHtml = docResult.fullHtmlDocument.replace(/<script>[\s\S]*?<\/script>/i, '');

    const iframe = printIframeRef.current;
    if (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(cleanHtml);
        iframeDoc.close();
        setTimeout(() => {
          fitMiniCardsInContainer(iframeDoc.body);
          let blocked = false;
          try {
            const win = iframe.contentWindow;
            if (!win) {
              blocked = true;
            } else {
              const t0 = performance.now();
              win.focus();
              win.print();
              const elapsed = performance.now() - t0;
              const isEmbeddedIframe = window.self !== window.top;
              if (isEmbeddedIframe && elapsed < 25) {
                blocked = true;
              }
            }
          } catch {
            blocked = true;
          }

          if (blocked) {
            setPdfFeedback({
              type: 'info',
              message:
                'Esta vista bloquea el diálogo de impresora del sistema; generando el archivo PDF descargable...',
            });
            handleDownloadPdf();
          }
        }, 250);
        return;
      }
    }

    handleDownloadPdf();
  };

  if (!isOpen) return null;

  const currentPrayer = KADDISH_PRAYERS[selectedKaddishType] || KADDISH_YATOM;
  const activeFormatMeta =
    FORMAT_OPTIONS.find((f) => f.id === selectedFormat) || FORMAT_OPTIONS[0];
  const primaryFormats = FORMAT_OPTIONS.filter((f) => !f.isSecondary);
  const secondaryFormats = FORMAT_OPTIONS.filter((f) => f.isSecondary);
  const selectedSecondaryMeta = secondaryFormats.find((f) => f.id === selectedFormat);

  const hasDedication = Boolean(
    dedicationName.trim() || dedicationHebrewName.trim() || dedicationDate.trim()
  );

  const aseretShortLabel =
    aseretPrintVariant === 'marked_aseret'
      ? 'Aseret marcado'
      : aseretPrintVariant === 'annotated'
      ? 'Con nota Aseret'
      : 'Todo el año';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Off-screen visible-dimension iframe for native printing */}
      <iframe
        ref={printIframeRef}
        title="Documento de Impresión Kadish"
        className="fixed -left-[9999px] top-0 w-[210mm] h-[297mm] border-0 pointer-events-none"
      />

      <div
        className={`bg-white dark:bg-stone-900 w-full ${
          isPreviewMode ? 'max-w-5xl h-[94vh]' : 'max-w-3xl max-h-[90vh]'
        } rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden transition-all duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {isPreviewMode ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Preview Header */}
            <div className="px-4 py-3 border-b border-stone-800 flex items-center justify-between gap-3 bg-stone-950 text-stone-100 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white truncate">
                    Vista Previa Física 1:1
                  </h2>
                  <p className="text-[11px] text-stone-400 truncate">
                    {activeFormatMeta.title} · {aseretShortLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 transition-colors whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Volver</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <PhysicalCardPreview
                options={printOptions}
                onPrint={handlePrint}
                onDownloadPdf={handleDownloadPdf}
                isExportingPdf={isExportingPdf}
                onBackToSettings={() => setIsPreviewMode(false)}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Clean, Focused Header */}
            <div className="px-4 pt-3.5 pb-3 sm:px-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/60 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 shrink-0">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 truncate">
                      Imprimir o Guardar PDF
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                      Elige el Kadish y el tamaño físico para generar tu tarjeta o lámina
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors shrink-0"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Single Clean 3-Step Tab Bar */}
              <div className="mt-3 grid grid-cols-3 gap-1 bg-stone-200/70 dark:bg-stone-900 p-1 rounded-xl border border-stone-300/60 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('format')}
                  className={`flex items-center justify-center gap-1.5 min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'format'
                      ? 'bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                  <span>1. Tamaño</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('options')}
                  className={`flex items-center justify-center gap-1.5 min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'options'
                      ? 'bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                  <span>2. Opciones</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('dedication')}
                  className={`flex items-center justify-center gap-1.5 min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'dedication'
                      ? 'bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 shrink-0" />
                  <span>3. Dedicatoria{hasDedication ? ' ✓' : ''}</span>
                </button>
              </div>
            </div>

            {/* Scrollable Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {activeTab === 'format' && (
                <div className="space-y-5">
                  {/* Step 1: Physical Size First-Class Clarity (Credit Card #1, Shirt Pocket #2) */}
                  <div>
                    <div className="flex items-baseline justify-between gap-2 mb-2.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                        Tamaño físico
                      </label>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 tabular-nums">
                        Hoja {bimahPaperSize === 'a4' ? 'A4' : 'Carta'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {primaryFormats.map((fmt) => {
                        const isSelected = selectedFormat === fmt.id;
                        const Icon = getPrimaryFormatIcon(fmt.id);
                        const activeDims =
                          fmt.isCard && cardOrientation === 'horizontal' && fmt.dimensionsHoriz
                            ? fmt.dimensionsHoriz
                            : fmt.dimensionsVert;

                        return (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => setSelectedFormat(fmt.id)}
                            className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                              isSelected
                                ? 'border-amber-600 bg-amber-500/10 dark:bg-amber-950/30 ring-1 ring-amber-600/30'
                                : 'border-stone-200 dark:border-stone-800 hover:border-amber-400/60 bg-white dark:bg-stone-900'
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                isSelected
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-sm text-stone-900 dark:text-stone-100 leading-snug">
                                {fmt.title}
                              </div>
                              <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 tabular-nums mt-0.5">
                                {activeDims} · {fmt.yieldLabel}
                              </div>
                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                                {fmt.summary}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Collapsible Secondary Sizes */}
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => setShowSecondaryFormats((v) => !v)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/70 transition-colors"
                      >
                        <span>
                          {selectedSecondaryMeta
                            ? `Tamaño adicional activo: ${selectedSecondaryMeta.title} (${selectedSecondaryMeta.dimensionsVert})`
                            : 'Otros 4 tamaños (Media carta, Sexta parte, Tefilín, Credencial)'}
                        </span>
                        {showSecondaryFormats ? (
                          <ChevronUp className="w-4 h-4 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 shrink-0" />
                        )}
                      </button>

                      {showSecondaryFormats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-stone-200/80 dark:border-stone-800 animate-in fade-in duration-150">
                          {secondaryFormats.map((fmt) => {
                            const isSelected = selectedFormat === fmt.id;
                            const activeDims =
                              fmt.isCard && cardOrientation === 'horizontal' && fmt.dimensionsHoriz
                                ? fmt.dimensionsHoriz
                                : fmt.dimensionsVert;

                            return (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() => setSelectedFormat(fmt.id)}
                                className={`text-left p-2.5 rounded-xl border transition-all ${
                                  isSelected
                                    ? 'border-amber-600 bg-amber-500/10 dark:bg-amber-950/30 ring-1 ring-amber-600/30'
                                    : 'border-stone-200 dark:border-stone-800 hover:border-amber-400/60 bg-stone-50/50 dark:bg-stone-900'
                                }`}
                              >
                                <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                                  {fmt.title}
                                </div>
                                <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 tabular-nums mt-0.5">
                                  {activeDims} · {fmt.yieldLabel}
                                </div>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                                  {fmt.summary}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Prayer Selection (Clean 4-Card Row, Zero Tag Pills) */}
                  <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2.5">
                      Tipo de Kadish
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {KADDISH_CHOICES.map((item) => {
                        const isSelected = selectedKaddishType === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedKaddishType(item.id)}
                            className={`text-left p-3 rounded-xl border transition-all ${
                              isSelected
                                ? 'border-amber-600 bg-amber-500/10 dark:bg-amber-950/30 ring-1 ring-amber-600/30'
                                : 'border-stone-200 dark:border-stone-800 hover:border-amber-400/60 bg-white dark:bg-stone-900'
                            }`}
                          >
                            <div
                              className="font-serif text-xs font-bold text-amber-800 dark:text-amber-400"
                              dir="rtl"
                            >
                              {item.heb}
                            </div>
                            <div className="font-bold text-xs text-stone-900 dark:text-stone-100 mt-1">
                              {item.name}
                            </div>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                              {item.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Minimal Format-Specific Controls */}
                  <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                    {isCardFormat ? (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                            Orientación
                          </span>
                          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
                            <button
                              type="button"
                              onClick={() => setCardOrientation('vertical')}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                                cardOrientation === 'vertical'
                                  ? 'bg-amber-600 text-white'
                                  : 'text-stone-600 dark:text-stone-300'
                              }`}
                            >
                              <RectangleVertical className="w-3.5 h-3.5" />
                              <span>Vertical</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCardOrientation('horizontal')}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                                cardOrientation === 'horizontal'
                                  ? 'bg-amber-600 text-white'
                                  : 'text-stone-600 dark:text-stone-300'
                              }`}
                            >
                              <RectangleHorizontal className="w-3.5 h-3.5" />
                              <span>Horizontal</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                            Caras
                          </span>
                          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
                            {(
                              [
                                { id: 'duplex', label: 'Dúplex' },
                                { id: 'foldable', label: 'Plegable' },
                                { id: 'single_heb', label: 'Hebreo' },
                                { id: 'single_fon', label: 'Fonética' },
                              ] as { id: SmallCardPrintVariant; label: string }[]
                            ).map((mode) => (
                              <button
                                key={mode.id}
                                type="button"
                                onClick={() => setSmallCardVariant(mode.id)}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                                  smallCardVariant === mode.id
                                    ? 'bg-amber-600 text-white'
                                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                                }`}
                              >
                                {mode.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                            Disposición
                          </span>
                          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
                            <button
                              type="button"
                              onClick={() => setTextArrangement('separate_blocks')}
                              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                                textArrangement === 'separate_blocks'
                                  ? 'bg-amber-600 text-white'
                                  : 'text-stone-600 dark:text-stone-300'
                              }`}
                            >
                              Bloques separados
                            </button>
                            <button
                              type="button"
                              onClick={() => setTextArrangement('interlinear')}
                              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                                textArrangement === 'interlinear'
                                  ? 'bg-amber-600 text-white'
                                  : 'text-stone-600 dark:text-stone-300'
                              }`}
                            >
                              Interlineado
                            </button>
                          </div>
                        </div>

                        {selectedFormat === 'half_letter' && (
                          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={duplicateTwoUp}
                              onChange={(e) => setDuplicateTwoUp(e.target.checked)}
                              className="rounded border-stone-300 text-amber-600"
                            />
                            <span>2 copias por hoja</span>
                          </label>
                        )}
                      </div>
                    )}

                    {/* Quiet link to Tab 2 showing current defaults */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('options')}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline whitespace-nowrap ml-auto"
                    >
                      <span>
                        {printTranslitTradition === 'ivris' ? 'Ivris' : 'Ivrit'} · {aseretShortLabel} ·{' '}
                        {bimahPaperSize === 'a4' ? 'A4' : 'Carta'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'options' && (
                <div className="space-y-5">
                  {/* 1. Phonetic Tradition */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
                      Pronunciación fonética
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPrintTranslitTradition('sefaradi')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          printTranslitTradition === 'sefaradi'
                            ? 'border-amber-600 bg-amber-500/10 text-amber-950 dark:text-amber-200'
                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <div className="font-bold text-xs">Ivrit (Sefaradí / Moderno)</div>
                        <div className="text-[11px] opacity-75 mt-0.5">
                          Yitgadal · Yitbaraj · Shelamá · Amén
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPrintTranslitTradition('ivris')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          printTranslitTradition === 'ivris'
                            ? 'border-amber-600 bg-amber-500/10 text-amber-950 dark:text-amber-200'
                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <div className="font-bold text-xs">Ivris (Ashkenazí Clásico)</div>
                        <div className="text-[11px] opacity-75 mt-0.5">
                          Yisgadal · Yisborach · Shlomo · Omein
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 2. Aseret Yemei Teshuva */}
                  <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
                      Variante Aseret Yemei Teshuvá (Rosh Hashaná – Yom Kipur)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {(
                        [
                          {
                            id: 'standard',
                            title: 'Todo el año',
                            sub: 'Texto estándar sin cambios de Tishrei',
                          },
                          {
                            id: 'annotated',
                            title: 'Con acotación [עשי״ת]',
                            sub: 'Indica entre paréntesis las adiciones',
                          },
                          {
                            id: 'marked_aseret',
                            title: 'Solo Aseret (Marcado)',
                            sub: 'Resalta únicamente וּלְעֵלָּא y el prefijo הַ',
                          },
                        ] as { id: AseretPrintVariant; title: string; sub: string }[]
                      ).map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setAseretPrintVariant(mode.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            aseretPrintVariant === mode.id
                              ? 'border-amber-600 bg-amber-500/10 text-amber-950 dark:text-amber-200'
                              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <div className="font-bold text-xs">{mode.title}</div>
                          <div className="text-[11px] opacity-75 mt-0.5 leading-snug">{mode.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Paper & Typography */}
                  <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                        Tamaño de hoja
                      </label>
                      <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700">
                        <button
                          type="button"
                          onClick={() => setBimahPaperSize('letter')}
                          className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                            bimahPaperSize === 'letter'
                              ? 'bg-amber-600 text-white'
                              : 'text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          Carta
                        </button>
                        <button
                          type="button"
                          onClick={() => setBimahPaperSize('a4')}
                          className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                            bimahPaperSize === 'a4'
                              ? 'bg-amber-600 text-white'
                              : 'text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          A4
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                        Escala de letra
                      </label>
                      <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700">
                        {[90, 95, 100, 105].map((scale) => (
                          <button
                            key={scale}
                            type="button"
                            onClick={() => setCardFontScale(scale)}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold tabular-nums transition-all ${
                              cardFontScale === scale
                                ? 'bg-amber-600 text-white'
                                : 'text-stone-600 dark:text-stone-300'
                            }`}
                          >
                            {scale}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                        Grosor hebreo
                      </label>
                      <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700">
                        <button
                          type="button"
                          onClick={() => setHebrewWeight('extra_bold')}
                          className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                            hebrewWeight === 'extra_bold'
                              ? 'bg-amber-600 text-white'
                              : 'text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          Extra-negrita
                        </button>
                        <button
                          type="button"
                          onClick={() => setHebrewWeight('bold')}
                          className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                            hebrewWeight === 'bold'
                              ? 'bg-amber-600 text-white'
                              : 'text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          Estándar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 4. DeRabbanan-Only Options (Hidden when not printing DeRabbanan) */}
                  {selectedKaddishType === 'derabanan' && (
                    <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                        Párrafo &apos;Al Israel&apos; y Nusaj (DeRabbanan)
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {(
                          [
                            {
                              id: 'gray_universal',
                              title: 'Gris 2-en-1',
                              sub: 'Indica saltar en Kadish Yatom',
                            },
                            {
                              id: 'blue_contrast',
                              title: 'Azul clásico',
                              sub: 'Recuadro de alto contraste',
                            },
                            {
                              id: 'none',
                              title: 'Continuo',
                              sub: 'Sin recuadro de fondo',
                            },
                          ] as { id: AlIsraelBannerStyle; title: string; sub: string }[]
                        ).map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setAlIsraelBannerStyle(b.id);
                              setUseNusajComparison(false);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              alIsraelBannerStyle === b.id && !useNusajComparison
                                ? 'border-amber-600 bg-amber-500/10 text-amber-950 dark:text-amber-200'
                                : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            <div className="font-bold text-xs">{b.title}</div>
                            <div className="text-[11px] opacity-75 leading-snug mt-0.5">{b.sub}</div>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                            Variante comunitaria
                          </label>
                          <select
                            value={printDerabananNusaj}
                            onChange={(e) => setPrintDerabananNusaj(e.target.value as DerabananNusaj)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-900 dark:text-stone-100"
                          >
                            {DERABBANAN_NUSAJ_OPTIONS.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.nameEs} — {opt.subtitleEs}
                              </option>
                            ))}
                          </select>
                        </div>

                        {isCardFormat && (
                          <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 cursor-pointer pt-4 sm:pt-5">
                            <input
                              type="checkbox"
                              checked={useNusajComparison}
                              onChange={(e) => setUseNusajComparison(e.target.checked)}
                              className="rounded border-stone-300 text-amber-600"
                            />
                            <span>Comparar 2 variantes lado a lado</span>
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 5. Sheet-Only Visibility Checkboxes (Only shown for non-card formats) */}
                  {!isCardFormat && (
                    <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 space-y-2.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                        Secciones visibles en la lámina
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <label className="flex items-center gap-2.5 cursor-pointer text-stone-800 dark:text-stone-200 font-medium">
                          <input
                            type="checkbox"
                            checked={includeHebrew}
                            onChange={(e) => setIncludeHebrew(e.target.checked)}
                            className="rounded border-stone-300 text-amber-600"
                          />
                          <span>Hebreo vocalizado (con Nikud)</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-stone-800 dark:text-stone-200 font-medium">
                          <input
                            type="checkbox"
                            checked={includePhonetics}
                            onChange={(e) => setIncludePhonetics(e.target.checked)}
                            className="rounded border-stone-300 text-amber-600"
                          />
                          <span>Transliteración fonética</span>
                        </label>

                        {(selectedFormat === 'bimah_laminated' || selectedFormat === 'half_letter') && (
                          <label className="flex items-center gap-2.5 cursor-pointer text-stone-800 dark:text-stone-200 font-medium">
                            <input
                              type="checkbox"
                              checked={includeSpanish}
                              onChange={(e) => setIncludeSpanish(e.target.checked)}
                              className="rounded border-stone-300 text-amber-600"
                            />
                            <span>Traducción al español</span>
                          </label>
                        )}

                        <label className="flex items-center gap-2.5 cursor-pointer text-stone-800 dark:text-stone-200 font-medium">
                          <input
                            type="checkbox"
                            checked={includeReverenceGuide}
                            onChange={(e) => setIncludeReverenceGuide(e.target.checked)}
                            className="rounded border-stone-300 text-amber-600"
                          />
                          <span>Guía de reverencias al pie</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-stone-800 dark:text-stone-200 font-medium">
                          <input
                            type="checkbox"
                            checked={includeDecorativeBorder}
                            onChange={(e) => setIncludeDecorativeBorder(e.target.checked)}
                            className="rounded border-stone-300 text-amber-600"
                          />
                          <span>Marco ornamental clásico</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'dedication' && (
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        Dedicatoria Leilui Nishmat (Opcional)
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Aparecerá discretamente en el pie de la tarjeta o lámina impresa.
                      </p>
                    </div>
                    {hasDedication && (
                      <button
                        type="button"
                        onClick={() => {
                          setDedicationName('');
                          setDedicationHebrewName('');
                          setDedicationDate('');
                        }}
                        className="text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline whitespace-nowrap"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Nombre en español (ser querido o familia donante)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. En memoria de David ben Yosef Cohen z'l"
                        value={dedicationName}
                        onChange={(e) => setDedicationName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Nombre en hebreo (לעילוי נשמת)
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="דָּוִד בֶּן יוֹסֵף ז״ל"
                        value={dedicationHebrewName}
                        onChange={(e) => setDedicationHebrewName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-base text-stone-900 dark:text-stone-100 font-serif"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Fecha de Yurzaid / Aniversario
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 15 de Nisán / 24 de Abril"
                        value={dedicationDate}
                        onChange={(e) => setDedicationDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clean Action Footer */}
            <div className="px-4 py-3 sm:px-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-stone-600 dark:text-stone-400 truncate min-w-0">
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {activeFormatMeta.title}
                </span>
                <span className="mx-1.5">·</span>
                <span>
                  {selectedKaddishType === 'derabanan' && alIsraelBannerStyle === 'gray_universal'
                    ? 'DeRabbanan + Yatom'
                    : currentPrayer.titleSpanish}
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(true)}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl border border-amber-600/80 text-xs text-amber-800 dark:text-amber-300 font-bold bg-amber-500/10 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Eye className="w-4 h-4" />
                  <span>Vista Previa 1:1</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs text-stone-800 dark:text-stone-100 font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-xs text-white font-bold shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  {isExportingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{isExportingPdf ? 'Creando PDF...' : 'Descargar PDF'}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Shared Feedback Banner */}
        {pdfFeedback && (
          <div
            className={`px-4 py-2.5 sm:px-6 border-t text-xs flex flex-wrap items-center justify-between gap-2 shrink-0 ${
              pdfFeedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : pdfFeedback.type === 'error'
                ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {pdfFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="font-semibold truncate">{pdfFeedback.message}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {pdfFeedback.blobUrl && pdfFeedback.filename && (
                <a
                  href={pdfFeedback.blobUrl}
                  download={pdfFeedback.filename}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors whitespace-nowrap shrink-0"
                >
                  <Download className="w-3 h-3" />
                  <span>Guardar de nuevo</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setPdfFeedback(null)}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label="Ocultar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
