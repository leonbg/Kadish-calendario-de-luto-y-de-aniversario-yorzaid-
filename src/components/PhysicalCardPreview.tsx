import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Printer,
  RotateCw,
  ZoomIn,
  ZoomOut,
  CreditCard,
  Ruler,
  ArrowLeft,
  ArrowUpToLine,
  ArrowDownToLine,
  Maximize2,
  Download,
  Loader2,
} from 'lucide-react';
import {
  buildPrintDocument,
  fitMiniCardsInContainer,
  PrintDocumentOptions,
} from '../utils/printDocumentBuilder';

interface PhysicalCardPreviewProps {
  options: PrintDocumentOptions;
  onPrint: () => void;
  onDownloadPdf?: () => void;
  isExportingPdf?: boolean;
  onBackToSettings: () => void;
}

const MM_TO_PX = 3.7795275591; // 96 DPI standard: 1mm = 3.7795px

export const PhysicalCardPreview: React.FC<PhysicalCardPreviewProps> = ({
  options,
  onPrint,
  onDownloadPdf,
  isExportingPdf = false,
  onBackToSettings,
}) => {
  const isCardFormat =
    options.selectedFormat === 'card_wallet' ||
    options.selectedFormat === 'card_half_wallet' ||
    options.selectedFormat === 'card_pocket' ||
    options.selectedFormat === 'suit_pocket';

  const [activeSide, setActiveSide] = useState<'hebrew' | 'phonetic' | 'both'>('hebrew');
  const [viewScope, setViewScope] = useState<'single_card' | 'full_sheet'>(
    isCardFormat ? 'single_card' : 'full_sheet'
  );
  // Default to 70% for full_sheet so the entire Bimah / Letter sheet fits comfortably on screen, and 100% for single_card
  const [scalePercent, setScalePercent] = useState<number>(isCardFormat ? 100 : 70);
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [showCreditCardRef, setShowCreditCardRef] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [measuredIframeHeightPx, setMeasuredIframeHeightPx] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Sync viewScope & default zoom when format or viewScope changes
  useEffect(() => {
    if (!isCardFormat) {
      setViewScope('full_sheet');
      setScalePercent(70);
    }
  }, [isCardFormat, options.selectedFormat]);

  const handleSwitchViewScope = (nextScope: 'single_card' | 'full_sheet') => {
    setViewScope(nextScope);
    setScalePercent(nextScope === 'full_sheet' ? 70 : 100);
    setMeasuredIframeHeightPx(null);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Generate documents
  const docResult = useMemo(() => buildPrintDocument(options), [options]);
  const { cardDimensions } = docResult;

  // Compute iframe document
  const previewHtml = useMemo(() => {
    if (viewScope === 'full_sheet') {
      return docResult.getFullSheetPreviewDocument();
    }
    return docResult.getSingleCardPreviewDocument(activeSide);
  }, [docResult, viewScope, activeSide]);

  // Measure actual iframe content height on load so full_sheet never clips bottom content
  const handleIframeLoad = () => {
    const iframe = previewIframeRef.current;
    if (!iframe) return;
    const measure = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc && doc.documentElement && doc.body) {
          fitMiniCardsInContainer(doc.body);
          const scrollH = Math.max(
            doc.documentElement.scrollHeight,
            doc.body.scrollHeight
          );
          if (scrollH > 0) {
            setMeasuredIframeHeightPx(scrollH + 8);
          }
        }
      } catch {
        // Ignore cross-origin if any
      }
    };
    measure();
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc && 'fonts' in doc && doc.fonts?.ready) {
        doc.fonts.ready.then(measure).catch(() => {});
      }
    } catch {
      // Ignore cross-origin if any
    }
    // Re-fit & re-measure after web fonts finish rendering
    setTimeout(measure, 250);
  };

  // Flip card handler
  const handleFlipCard = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setActiveSide((prev) => (prev === 'hebrew' ? 'phonetic' : 'hebrew'));
      setIsFlipping(false);
    }, 180);
  };

  // Base physical dimensions in mm
  const isLandscapeHalfLetter =
    options.selectedFormat === 'half_letter' && options.duplicateTwoUp;
  const sheetWidthMm = isLandscapeHalfLetter
    ? options.bimahPaperSize === 'a4'
      ? 297
      : 279
    : options.bimahPaperSize === 'a4'
    ? 210
    : 216;
  const sheetHeightMm = isLandscapeHalfLetter
    ? options.bimahPaperSize === 'a4'
      ? 210
      : 216
    : options.bimahPaperSize === 'a4'
    ? 297
    : 279;

  const cardWidthMm =
    activeSide === 'both' && cardDimensions.isCardFormat
      ? cardDimensions.widthMm * 2 + 6
      : cardDimensions.widthMm;
  const cardHeightMm = cardDimensions.heightMm;

  const activeBaseWidthMm = viewScope === 'single_card' ? cardWidthMm : sheetWidthMm;
  const activeBaseHeightMm = viewScope === 'single_card' ? cardHeightMm : sheetHeightMm;

  const baseWidthPx = activeBaseWidthMm * MM_TO_PX;
  const minBaseHeightPx = activeBaseHeightMm * MM_TO_PX;
  const unscaledHeightPx =
    viewScope === 'full_sheet' && measuredIframeHeightPx
      ? Math.max(minBaseHeightPx, measuredIframeHeightPx)
      : minBaseHeightPx;

  const scaleFactor = scalePercent / 100;
  const scaledWidthPx = Math.round(baseWidthPx * scaleFactor);
  const scaledHeightPx = Math.round(unscaledHeightPx * scaleFactor);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 text-stone-100 select-none overflow-hidden">
      {/* Top Interactive Toolbar */}
      <div className="px-4 py-2.5 bg-stone-950 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0 z-20 shadow-md">
        {/* Left: Back & Mode Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onBackToSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-800 border border-stone-700 transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ajustes</span>
          </button>

          {/* View Scope Switcher for Cards */}
          {cardDimensions.isCardFormat && (
            <div className="flex items-center bg-stone-900 p-0.5 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => handleSwitchViewScope('single_card')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  viewScope === 'single_card'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Tarjeta 1:1
              </button>
              <button
                type="button"
                onClick={() => handleSwitchViewScope('full_sheet')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  viewScope === 'full_sheet'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Pliego Completo
              </button>
            </div>
          )}

          {/* Side Selector (when viewing single card) */}
          {viewScope === 'single_card' && (
            <div className="flex items-center bg-stone-900 p-0.5 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => setActiveSide('hebrew')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeSide === 'hebrew'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Hebreo
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('phonetic')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeSide === 'phonetic'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Fonética
              </button>
              {options.smallCardVariant === 'foldable' && (
                <button
                  type="button"
                  onClick={() => setActiveSide('both')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeSide === 'both'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Díptico
                </button>
              )}
              {activeSide !== 'both' && (
                <button
                  type="button"
                  onClick={handleFlipCard}
                  title="Voltear cara de la tarjeta"
                  className="p-1 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors ml-0.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Quick Vertical Navigation Buttons when in Full Sheet / Bimah mode */}
          {viewScope === 'full_sheet' && (
            <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={scrollToTop}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                title="Ir al inicio de la hoja (Encabezado)"
              >
                <ArrowUpToLine className="w-3.5 h-3.5 text-amber-400" />
                <span>Encabezado</span>
              </button>
              <button
                type="button"
                onClick={scrollToBottom}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                title="Ir al final de la hoja (Pie y Reverencias)"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-amber-400" />
                <span>Pie de Hoja</span>
              </button>
            </div>
          )}
        </div>

        {/* Center: Dimensions & Tradition Badge */}
        <div className="hidden xl:flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-lg bg-stone-900 border border-stone-800 text-amber-300 font-bold whitespace-nowrap">
            {options.translitTradition === 'ivris' ? 'Dicción Ivris (S / O)' : 'Dicción Ivrit (T / A)'}
          </span>
          <span className="text-stone-400 font-medium tabular-nums whitespace-nowrap">
            {viewScope === 'single_card'
              ? `${cardWidthMm} × ${cardHeightMm} mm (${(cardWidthMm / 10).toFixed(1)} × ${(cardHeightMm / 10).toFixed(1)} cm)`
              : `Hoja ${options.bimahPaperSize.toUpperCase()} (${(sheetWidthMm / 10).toFixed(1)} × ${(sheetHeightMm / 10).toFixed(1)} cm)`}
          </span>
        </div>

        {/* Right: Scale Presets & Calibration Tools + Print Button */}
        <div className="flex items-center gap-2">
          {/* Zoom controls with Fit-to-Page preset for Full Sheet */}
          <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-xl border border-stone-800">
            <button
              type="button"
              onClick={() => setScalePercent((s) => Math.max(45, s - 10))}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Reducir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {viewScope === 'full_sheet' && (
              <button
                type="button"
                onClick={() => setScalePercent(68)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  scalePercent === 68 || scalePercent === 70
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-stone-300 hover:bg-stone-800'
                }`}
                title="Encajar la hoja completa en pantalla para verla de un vistazo"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Encajar Hoja</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setScalePercent(100)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold tabular-nums whitespace-nowrap transition-all ${
                scalePercent === 100
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
              title="Ver a escala física 1:1 real (100%)"
            >
              1:1 ({scalePercent}%)
            </button>

            <button
              type="button"
              onClick={() => setScalePercent((s) => Math.min(160, s + 15))}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reference Tools (for single card) */}
          {viewScope === 'single_card' && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowRuler((v) => !v)}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  showRuler
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
                title="Mostrar/ocultar regla milimétrica en pantalla"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Regla</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCreditCardRef((v) => !v)}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  showCreditCardRef
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
                title="Comparar tamaño colocando tu tarjeta de crédito real sobre la pantalla"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Tarjeta Ref.</span>
              </button>
            </div>
          )}

          {/* Primary Action Button */}
          {onDownloadPdf ? (
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap shrink-0"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isExportingPdf ? 'Creando PDF...' : 'Descargar PDF'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          )}
        </div>
      </div>

      {/* Calibration Guidance Banner (if credit card ref is active) */}
      {showCreditCardRef && viewScope === 'single_card' && (
        <div className="px-4 py-2 bg-blue-950/90 border-b border-blue-800 text-blue-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150 shrink-0">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong>Calibración Física:</strong> Coloca cualquier tarjeta de crédito, débito o DNI (85.6 × 54.0 mm) sobre el recuadro guía azul para certificar que el tamaño 1:1 en pantalla coincide con la realidad.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowCreditCardRef(false)}
            className="text-[11px] underline text-blue-300 hover:text-white whitespace-nowrap shrink-0"
          >
            Cerrar guía
          </button>
        </div>
      )}

      {/* Main Scrollable Canvas Area: Uses items-center justify-start so top of tall sheets is NEVER clipped */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto relative p-6 sm:p-8 flex flex-col items-center justify-start"
        style={{
          backgroundColor: '#18181b',
          backgroundImage: `
            radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '10mm 10mm, 10mm 10mm, 10mm 10mm',
        }}
      >
        {/* Layout-Aware Sizing Wrapper: Guarantees accurate scrollbars at any zoom level */}
        <div
          className="relative my-auto shrink-0 transition-all duration-150"
          style={{
            width: `${scaledWidthPx + (showRuler && viewScope === 'single_card' ? 36 : 0)}px`,
            height: `${scaledHeightPx + (showRuler && viewScope === 'single_card' ? 32 : 0)}px`,
          }}
        >
          {/* Scaled Stage with top-left origin so nothing overflows into negative coordinates */}
          <div
            className="absolute transition-transform duration-150 ease-out origin-top-left"
            style={{
              top: showRuler && viewScope === 'single_card' ? '28px' : '0px',
              left: showRuler && viewScope === 'single_card' ? '32px' : '0px',
              width: `${baseWidthPx}px`,
              height: `${unscaledHeightPx}px`,
              transform: `scale(${scaleFactor})`,
            }}
          >
            {/* Top & Left Metric Rulers (if enabled on single card) */}
            {showRuler && viewScope === 'single_card' && (
              <>
                {/* Horizontal Top Ruler */}
                <div
                  className="absolute -top-7 left-0 flex border-b border-amber-500/40 text-[9px] text-amber-400 font-mono tabular-nums select-none"
                  style={{ width: `${cardWidthMm}mm` }}
                >
                  {Array.from({ length: Math.ceil(cardWidthMm / 10) + 1 }, (_, cm) => (
                    <div
                      key={cm}
                      className="relative border-l border-amber-500/50 pl-0.5 text-[8px]"
                      style={{
                        width: cm === Math.ceil(cardWidthMm / 10) ? 'auto' : '10mm',
                        height: '14px',
                      }}
                    >
                      <span>{cm}cm</span>
                      <div className="absolute left-[5mm] bottom-0 w-px h-1.5 bg-amber-500/30" />
                    </div>
                  ))}
                </div>

                {/* Vertical Left Ruler */}
                <div
                  className="absolute top-0 -left-8 flex flex-col border-r border-amber-500/40 text-[9px] text-amber-400 font-mono tabular-nums select-none"
                  style={{ height: `${cardHeightMm}mm` }}
                >
                  {Array.from({ length: Math.ceil(cardHeightMm / 10) + 1 }, (_, cm) => (
                    <div
                      key={cm}
                      className="relative border-t border-amber-500/50 pt-0.5 text-[8px]"
                      style={{
                        height: cm === Math.ceil(cardHeightMm / 10) ? 'auto' : '10mm',
                        width: '18px',
                      }}
                    >
                      <span>{cm}</span>
                      <div className="absolute top-[5mm] right-0 h-px w-1.5 bg-amber-500/30" />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Physical Thermal Laminate Outer Shell */}
            <div
              className={`relative rounded-xl p-[1.5mm] w-full h-full transition-all duration-300 ${
                isFlipping ? 'scale-95 opacity-50 blur-[0.5px]' : 'scale-100 opacity-100'
              }`}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(2px)',
                boxShadow: `
                  0 25px 50px -12px rgba(0, 0, 0, 0.65),
                  0 10px 20px -5px rgba(0, 0, 0, 0.4),
                  0 0 0 1px rgba(255, 255, 255, 0.25),
                  inset 0 1px 2px rgba(255, 255, 255, 0.8)
                `,
              }}
            >
              {/* Inner Real Card / Sheet Frame */}
              <div className="w-full h-full bg-[#fffdfa] rounded-lg overflow-hidden border border-amber-900/30 relative shadow-inner">
                <iframe
                  ref={previewIframeRef}
                  onLoad={handleIframeLoad}
                  title="1:1 Physical Scale Render"
                  srcDoc={previewHtml}
                  scrolling="no"
                  className="w-full h-full border-0 select-none pointer-events-none block"
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                  }}
                />
              </div>

              {/* Safe Zone indicator */}
              <div className="absolute inset-0 pointer-events-none rounded-xl border border-dashed border-amber-600/25" />
            </div>

            {/* Credit Card Size Reference Overlay (85.6 × 53.98 mm) */}
            {showCreditCardRef && viewScope === 'single_card' && (
              <div
                className="absolute -bottom-24 left-1/2 -translate-x-1/2 rounded-xl border-2 border-blue-400 bg-blue-900/40 backdrop-blur-xs flex flex-col justify-between p-2 shadow-2xl z-30 pointer-events-none select-none text-blue-200 tabular-nums"
                style={{
                  width: '85.6mm',
                  height: '53.98mm',
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5), 0 20px 30px rgba(0,0,0,0.6)',
                }}
              >
                <div className="flex items-center justify-between text-[8px] font-bold">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-blue-300" />
                    <span>TARJETA CRÉDITO REAL (ISO/IEC 7810 ID-1)</span>
                  </span>
                  <span>85.60 × 53.98 mm</span>
                </div>

                <div className="w-7 h-5 rounded bg-amber-400/80 border border-amber-600 flex items-center justify-center text-[6px] text-amber-950 font-bold">
                  CHIP
                </div>

                <div className="text-center text-[8px] font-semibold text-blue-100">
                  Pon tu tarjeta física encima para comprobar que coincide 1:1
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Specifications & Actions */}
      <div className="px-4 py-2.5 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs z-10 shrink-0">
        <div className="flex items-center gap-3 text-stone-400 text-[11px]">
          <span className="font-semibold text-stone-200">
            {cardDimensions.label}
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline text-stone-400">
            Desplázate con la rueda del ratón o usa los botones Encabezado / Pie de Hoja para recorrer toda la página
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToSettings}
            className="px-3 py-1.5 rounded-xl border border-stone-700 text-stone-300 font-bold hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            Editar Opciones
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="px-3.5 py-1.5 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isExportingPdf}
              className="px-5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-bold transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isExportingPdf ? 'Creando PDF...' : 'Guardar PDF'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
