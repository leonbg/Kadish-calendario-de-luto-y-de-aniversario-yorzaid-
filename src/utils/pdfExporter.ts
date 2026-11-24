import {
  fitMiniCardsInContainer,
  type PrintDocumentOptions,
  type PrintDocumentResult,
} from './printDocumentBuilder';

export interface PdfExportResult {
  filename: string;
  pageCount: number;
  blobUrl: string;
}

function sanitizeFilename(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
}

function getTargetPdfPageSizeMm(options: PrintDocumentOptions): {
  widthMm: number;
  heightMm: number;
  orientation: 'portrait' | 'landscape';
} {
  const isA4 = options.bimahPaperSize === 'a4';

  if (options.selectedFormat === 'half_letter' && options.duplicateTwoUp) {
    return isA4
      ? { widthMm: 297, heightMm: 210, orientation: 'landscape' }
      : { widthMm: 279.4, heightMm: 215.9, orientation: 'landscape' };
  }

  if (options.selectedFormat === 'half_letter' && !options.duplicateTwoUp) {
    return isA4
      ? { widthMm: 148, heightMm: 210, orientation: 'portrait' }
      : { widthMm: 139.7, heightMm: 215.9, orientation: 'portrait' };
  }

  return isA4
    ? { widthMm: 210, heightMm: 297, orientation: 'portrait' }
    : { widthMm: 215.9, heightMm: 279.4, orientation: 'portrait' };
}

function scopePrintCssForContainer(cssStyles: string): string {
  // Replace global html/body selectors so injected styles only affect our temporary off-screen page stage
  return cssStyles
    .replace(/@page\s*\{[\s\S]*?\}/g, '')
    .replace(/html\s*,\s*body\s*\{/g, '.kadish-pdf-page {')
    .replace(/(^|\s)body\s*\{/g, '$1.kadish-pdf-page {');
}

function splitContentIntoPages(contentHtml: string): string[] {
  const parts = contentHtml
    .split(/<div\s+class=["']page-break["']\s*>\s*<\/div>/i)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [contentHtml];
}

async function capturePageDataUrl(
  pageEl: HTMLElement,
  widthPx: number,
  heightPx: number
): Promise<string> {
  const { toJpeg } = await import('html-to-image');

  const baseOptions = {
    pixelRatio: 2.2,
    backgroundColor: '#ffffff',
    width: widthPx,
    height: heightPx,
    quality: 0.95,
    cacheBust: false,
  };

  try {
    return await toJpeg(pageEl, baseOptions);
  } catch {
    // Fallback if external stylesheets/fonts cannot be inlined due to CORS or offline state
    return await toJpeg(pageEl, {
      ...baseOptions,
      skipFonts: true,
    });
  }
}

export function triggerBlobDownload(blobUrl: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Generates a real, multi-page calibrated .pdf binary from buildPrintDocument output
 * and triggers an immediate file download in the browser (works inside sandboxed iframes & APKs).
 */
export async function exportPrintDocumentToPdf(
  options: PrintDocumentOptions,
  docResult: PrintDocumentResult
): Promise<PdfExportResult> {
  const [{ jsPDF }] = await Promise.all([import('jspdf')]);

  const { widthMm, heightMm, orientation } = getTargetPdfPageSizeMm(options);
  const pagesHtml = splitContentIntoPages(docResult.contentHtml);
  const scopedCss = scopePrintCssForContainer(docResult.cssStyles);

  // Convert physical mm to 96-DPI CSS pixels matching the print layout engine
  const MM_TO_PX = 96 / 25.4;
  const printableMarginMm = 4.5;
  const contentWidthMm = widthMm - printableMarginMm * 2;
  const contentHeightMm = heightMm - printableMarginMm * 2;
  const pageWidthPx = Math.round(contentWidthMm * MM_TO_PX);
  const pageHeightPx = Math.round(contentHeightMm * MM_TO_PX);

  // Ensure web fonts have settled if available
  if (typeof document !== 'undefined' && 'fonts' in document) {
    await Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 600)),
    ]);
  }

  // Create hidden off-screen rendering host (full opacity so SVG foreignObject captures cleanly)
  const stage = document.createElement('div');
  stage.setAttribute('aria-hidden', 'true');
  stage.style.cssText = [
    'position: fixed',
    'left: -20000px',
    'top: 0',
    `width: ${pageWidthPx}px`,
    'background: #ffffff',
    'pointer-events: none',
    'z-index: -1',
  ].join(';');
  document.body.appendChild(stage);

  try {
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: [widthMm, heightMm],
      compress: true,
    });

    for (let i = 0; i < pagesHtml.length; i++) {
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'kadish-pdf-page';
      pageWrapper.style.cssText = [
        `width: ${pageWidthPx}px`,
        `min-height: ${pageHeightPx}px`,
        'background: #ffffff',
        'color: #000000',
        'box-sizing: border-box',
        'overflow: hidden',
      ].join(';');

      pageWrapper.innerHTML = `<style>${scopedCss}
        .kadish-pdf-page .half-letter-page-wrapper.two-up,
        .kadish-pdf-page .half-letter-page-wrapper.single,
        .kadish-pdf-page .quarter-grid-wrapper,
        .kadish-pdf-page .sixth-grid-wrapper,
        .kadish-pdf-page .mini-sheet-page {
          height: ${pageHeightPx - 4}px !important;
          min-height: 0;
        }
      </style>${pagesHtml[i]}`;

      stage.innerHTML = '';
      stage.appendChild(pageWrapper);

      // Allow layout & RTL shaping to settle, then auto-fit any dense mini-cards before capture
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      fitMiniCardsInContainer(pageWrapper);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      const measuredHeightPx = Math.max(pageHeightPx, pageWrapper.scrollHeight);
      const dataUrl = await capturePageDataUrl(pageWrapper, pageWidthPx, measuredHeightPx);

      if (i > 0) {
        pdf.addPage([widthMm, heightMm], orientation);
      }

      // Scale height proportionally while strictly respecting page boundaries
      let drawWidthMm = contentWidthMm;
      let drawHeightMm = (measuredHeightPx / pageWidthPx) * drawWidthMm;
      if (drawHeightMm > contentHeightMm) {
        const shrinkRatio = contentHeightMm / drawHeightMm;
        drawHeightMm = contentHeightMm;
        drawWidthMm = drawWidthMm * shrinkRatio;
      }

      const xOffsetMm = printableMarginMm + (contentWidthMm - drawWidthMm) / 2;
      const yOffsetMm = printableMarginMm;

      pdf.addImage(dataUrl, 'JPEG', xOffsetMm, yOffsetMm, drawWidthMm, drawHeightMm, undefined, 'FAST');
    }

    const baseName = sanitizeFilename(
      `Kadish_${options.selectedKaddishType}_${options.selectedFormat}`
    );
    const filename = `${baseName || 'Kadish_y_Yurzaid'}.pdf`;

    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    triggerBlobDownload(blobUrl, filename);

    return {
      filename,
      pageCount: pagesHtml.length,
      blobUrl,
    };
  } finally {
    if (stage.parentNode) {
      stage.parentNode.removeChild(stage);
    }
  }
}
