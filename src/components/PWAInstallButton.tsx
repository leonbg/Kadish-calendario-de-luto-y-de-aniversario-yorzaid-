import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, ArrowDownToLine } from 'lucide-react';

interface PWAInstallButtonProps {
  onOpenApkGuide?: () => void;
  className?: string;
  variant?: 'nav' | 'banner' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenApkGuide,
  className = '',
  variant = 'nav',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Chromium / Android / Desktop in-app install flow
  if (isInstallable) {
    return (
      <div className="inline-flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={install}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-95 whitespace-nowrap shrink-0 ${className}`}
          title="Instalar Kadish y Yurzaid como App nativa en tu dispositivo"
        >
          <ArrowDownToLine className="w-3.5 h-3.5" />
          <span>Instalar</span>
        </button>
        {onOpenApkGuide && (
          <button
            type="button"
            onClick={onOpenApkGuide}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors whitespace-nowrap shrink-0"
            title="Centro de Preparación y Conversión a APK"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-600" />
            <span>APK</span>
          </button>
        )}
      </div>
    );
  }

  // If already installed and running standalone, still allow opening the APK guide
  if (isInstalled && variant !== 'settings') {
    if (!onOpenApkGuide) return null;
    return (
      <button
        type="button"
        onClick={onOpenApkGuide}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors whitespace-nowrap shrink-0 ${className}`}
        title="Centro de Preparación y Conversión a APK"
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-600" />
        <span>APK</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS && variant !== 'settings') {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all ${className}`}
          title="Instalar en iPhone o iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 p-5 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    Instalar en iPhone / iPad
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-stone-600 dark:text-stone-300 space-y-2 leading-relaxed bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                <p>
                  1. Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba) en la barra inferior de Safari.
                </p>
                <p>
                  2. Desliza hacia abajo y selecciona <strong>«Agregar a la pantalla de inicio»</strong>.
                </p>
                <p>
                  3. Toca <strong>«Agregar»</strong> en la esquina superior derecha.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback / APK Guide button
  if (onOpenApkGuide) {
    return (
      <button
        type="button"
        onClick={onOpenApkGuide}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors ${className}`}
        title="Verificación de Manifiestos y Conversión a APK"
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-600" />
        <span>APK / PWA</span>
      </button>
    );
  }

  return null;
};
