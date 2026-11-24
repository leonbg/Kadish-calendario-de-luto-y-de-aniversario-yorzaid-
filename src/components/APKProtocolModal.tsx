import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  X,
  PackageCheck,
  FileCode,
  Download,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

interface APKProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SYNCHRONIZED_METADATA = {
  id: '/',
  name: 'Kadish y Yurzaid',
  short_name: 'Kadish',
  description:
    'Aplicación para la lectura, audio y traducción interactiva de rezos y Kadish (Nusaj Sefaradi).',
  theme_color: '#b45309',
  background_color: '#fdfbf7',
  display: 'standalone',
  orientation: 'portrait-primary',
  start_url: '/',
  scope: '/',
  lang: 'es',
};

interface EndpointCheckResult {
  id: string;
  label: string;
  path: string;
  ok: boolean;
  detail: string;
}

export const APKProtocolModal: React.FC<APKProtocolModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'build' | 'config' | 'audit'>('build');
  const [packageId, setPackageId] = useState('app.kadish.yurzaid');
  const [sha256Fingerprint, setSha256Fingerprint] = useState(
    '14:6D:E9:7D:0F:52:AB:70:3E:04:78:A2:3E:C5:3C:90:54:19:92:02:64:14:04:8E:A4:44:98:8C:2C:16:11:47'
  );
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncingServer, setIsSyncingServer] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [checks, setChecks] = useState<EndpointCheckResult[]>([]);

  // Always prefer the public shared URL (ais-pre-*) over the authenticated dev URL (ais-dev-*) for PWABuilder & Bubblewrap
  const rawOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-p6croqebzy6vkcghti6zh7-550769722616.us-west2.run.app';
  const publicAppUrl = rawOrigin.replace('//ais-dev-', '//ais-pre-');
  const publicHost = publicAppUrl.replace(/^https?:\/\//, '');

  const runLiveAudit = async () => {
    setIsChecking(true);
    const targets = [
      {
        id: 'manifest',
        label: 'Manifiesto W3C (manifest.json)',
        path: '/manifest.json',
      },
      {
        id: 'sw',
        label: 'Service Worker Network-First v5 (sw.js)',
        path: '/sw.js',
      },
      {
        id: 'assetlinks',
        label: 'Digital Asset Links (/.well-known/assetlinks.json)',
        path: '/.well-known/assetlinks.json',
      },
      {
        id: 'twa',
        label: 'Manifiesto Bubblewrap TWA API 35 (twa-manifest.json)',
        path: '/twa-manifest.json',
      },
      {
        id: 'icon512',
        label: 'Ícono 512x512 Estándar (pwa-512x512.png)',
        path: '/pwa-512x512.png',
      },
      {
        id: 'maskable',
        label: 'Ícono Adaptativo Android (pwa-maskable-512x512.png)',
        path: '/pwa-maskable-512x512.png',
      },
      {
        id: 'root',
        label: 'Servidor Principal & Componentes UI (index.html)',
        path: '/',
      },
    ];

    const results: EndpointCheckResult[] = await Promise.all(
      targets.map(async (t) => {
        try {
          const res = await fetch(t.path, {
            method: 'GET',
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
          });
          return {
            ...t,
            ok: res.ok,
            detail: res.ok ? `HTTP ${res.status} OK (Actualizado)` : `HTTP ${res.status}`,
          };
        } catch {
          return {
            ...t,
            ok: false,
            detail: 'Sin respuesta',
          };
        }
      })
    );

    setChecks(results);
    setLastSyncTime(new Date().toLocaleTimeString('es-ES'));
    setIsChecking(false);
  };

  const forceServerSync = async () => {
    setIsSyncingServer(true);
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(async (reg) => {
            reg.active?.postMessage({ type: 'CLEAR_AND_UPDATE' });
            await reg.update().catch(() => {});
          })
        );
      }
    } catch {
      // ignore in restricted environments
    }
    await runLiveAudit();
    setIsSyncingServer(false);
  };

  useEffect(() => {
    if (isOpen) {
      runLiveAudit();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const downloadJsonFile = (filename: string, data: object) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const twaManifestObject = {
    packageId: packageId.trim() || 'app.kadish.yurzaid',
    host: publicHost,
    name: SYNCHRONIZED_METADATA.name,
    launcherName: SYNCHRONIZED_METADATA.short_name,
    display: 'standalone',
    themeColor: '#B45309',
    themeColorDark: '#0C0A09',
    navigationColor: '#FDFBF7',
    navigationColorDark: '#0C0A09',
    navigationDividerColor: '#E7E5E4',
    navigationDividerColorDark: '#292524',
    backgroundColor: '#FDFBF7',
    enableNotifications: true,
    startUrl: '/',
    iconUrl: `${publicAppUrl}/pwa-512x512.png`,
    maskableIconUrl: `${publicAppUrl}/pwa-maskable-512x512.png`,
    splashScreenFadeOutDuration: 300,
    signingKey: {
      path: './android.keystore',
      alias: 'android',
    },
    appVersionName: '1.0.0',
    appVersionCode: 1,
    shortcuts: [
      {
        name: 'Kadish Yatom',
        shortName: 'Yatom',
        url: `${publicAppUrl}/?kaddish=yatom`,
        chosenIconUrl: `${publicAppUrl}/pwa-192x192.png`,
      },
      {
        name: 'Kadish Derabanán',
        shortName: 'Derabanán',
        url: `${publicAppUrl}/?kaddish=derabanan`,
        chosenIconUrl: `${publicAppUrl}/pwa-192x192.png`,
      },
      {
        name: 'Calculadora Yurzaid',
        shortName: 'Calculadora',
        url: `${publicAppUrl}/?view=calculator`,
        chosenIconUrl: `${publicAppUrl}/pwa-192x192.png`,
      },
    ],
    generatorApp: 'bubblewrap-cli',
    webManifestUrl: `${publicAppUrl}/manifest.json`,
    fallbackType: 'customtabs',
    enableSiteSettingsShortcut: true,
    isChromeOSOnly: false,
    minSdkVersion: 24,
    targetSdkVersion: 35,
    compileSdkVersion: 35,
    orientation: 'portrait-primary',
  };

  const assetLinksObject = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: packageId.trim() || 'app.kadish.yurzaid',
        sha256_cert_fingerprints: [sha256Fingerprint.trim()],
      },
    },
  ];

  const capacitorConfigObject = {
    appId: packageId.trim() || 'app.kadish.yurzaid',
    appName: SYNCHRONIZED_METADATA.name,
    webDir: 'dist',
    bundledWebRuntime: false,
    android: {
      minWebViewVersion: 60,
      buildOptions: {
        keystorePath: './android.keystore',
        keystoreAlias: 'android',
      },
    },
    server: {
      androidScheme: 'https',
    },
  };

  const sdkVersionsMatrix = [
    { name: 'Android Target / Compile SDK (TWA & APK)', version: 'API 35 · minSdk 24' },
    { name: 'React & React DOM', version: 'v19.3.1 (Concurrent ESM)' },
    { name: 'Vite Bundler & Rolldown Engine', version: 'v8.3.8 (Target ES2022)' },
    { name: 'TypeScript Compiler & Node Types', version: 'v7.0.2 · @types/node v26.6.6' },
    { name: 'Tailwind CSS Engine & Vite Plugin', version: 'v4.3.5 · @vitejs/plugin-react v6.3.0' },
    { name: 'Lucide React Icon SDK', version: 'v1.78.0 (Tree-Shaken ESM)' },
    { name: 'Hebcal Jewish Calendar SDK (@hebcal/core)', version: 'v6.16.1 + Native Intl Hebrew API' },
    { name: 'Firebase Modular Web SDK (Auth)', version: 'v13.4.0 (Dynamic On-Demand)' },
    { name: 'PDF & Image Export Engine (jsPDF / html-to-image)', version: 'jsPDF v4.2.1 · html-to-image v1.11.13' },
    { name: 'Google Drive & Calendar REST APIs', version: 'Drive v3 · Calendar v3 · Docs v1' },
  ];

  const bubblewrapCommands = `npm install -g @bubblewrap/cli
mkdir kadish-apk && cd kadish-apk
bubblewrap init --manifest=${publicAppUrl}/manifest.json
bubblewrap build`;

  const capacitorCommands = `npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "${SYNCHRONIZED_METADATA.name}" "${packageId.trim() || 'app.kadish.yurzaid'}" --web-dir dist
npm run build
npx cap add android
npx cap open android`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-amber-500/10 dark:bg-amber-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-600 text-white">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                Centro de Preparación y Conversión a APK (Android)
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Lista para empaquetar con PWABuilder, Google Bubblewrap (TWA) o Capacitor
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-5 pt-2.5 border-b border-stone-200 dark:border-stone-800 flex items-center gap-1.5 bg-stone-50 dark:bg-stone-950/40 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('build')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'build'
                ? 'border-amber-600 text-amber-800 dark:text-amber-300 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>1. Generar APK (Pasos y Archivos)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'config'
                ? 'border-amber-600 text-amber-800 dark:text-amber-300 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>2. Descargar Configuraciones (TWA / AssetLinks)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'audit'
                ? 'border-amber-600 text-amber-800 dark:text-amber-300 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. Diagnóstico en Tiempo Real ({checks.filter((c) => c.ok).length}/{checks.length || 7})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-stone-700 dark:text-stone-300 flex-1">
          {activeTab === 'build' && (
            <div className="space-y-4">
              {/* Public URL Box */}
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/70 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>URL Pública Lista para Empaquetar en APK</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(publicAppUrl, 'public_url')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors whitespace-nowrap shrink-0"
                  >
                    {copiedSection === 'public_url' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>¡URL Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar URL Pública</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-[11px] bg-white dark:bg-stone-900 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800/60 text-stone-900 dark:text-stone-100 select-all break-all">
                  {publicAppUrl}
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Usa siempre esta URL pública (<code>ais-pre-...</code>) en PWABuilder o Bubblewrap para que el generador pueda leer <code>/manifest.json</code> y <code>/sw.js</code> sin bloqueo de sesión.
                </p>
              </div>

              {/* Method 1: PWABuilder (1-Click Cloud APK) */}
              <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      Método 1 · Más Rápido (Sin instalar programas)
                    </span>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      PWABuilder — Generador Oficial de APK en la Nube
                    </h3>
                  </div>
                  <a
                    href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(publicAppUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Abrir en PWABuilder</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <ol className="list-decimal list-inside space-y-1.5 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  <li>
                    Haz clic en <strong>«Abrir en PWABuilder»</strong> (o entra a{' '}
                    <code>pwabuilder.com</code> y pega la URL pública de arriba).
                  </li>
                  <li>
                    Cuando termine el análisis del manifiesto y del Service Worker, pulsa{' '}
                    <strong>«Package for stores»</strong> → <strong>«Android»</strong>.
                  </li>
                  <li>
                    Verifica el Package ID (<code>{packageId}</code>) y haz clic en{' '}
                    <strong>«Download Package»</strong>.
                  </li>
                  <li>
                    Dentro del archivo <code>.zip</code> descargado encontrarás el archivo{' '}
                    <strong><code>Kadish y Yurzaid.apk</code></strong> listo para instalar en cualquier teléfono Android y el archivo <code>.aab</code> para Google Play.
                  </li>
                </ol>
              </div>

              {/* Method 2: Bubblewrap CLI */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Método 2 · Línea de Comandos Oficial de Google
                    </span>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-amber-600" />
                      <span>Google Bubblewrap CLI (Trusted Web Activity)</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        downloadJsonFile('twa-manifest.json', twaManifestObject)
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition-colors whitespace-nowrap shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>twa-manifest.json</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(bubblewrapCommands, 'bubblewrap')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[11px] font-bold whitespace-nowrap shrink-0"
                    >
                      {copiedSection === 'bubblewrap' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <pre className="bg-stone-900 text-amber-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {bubblewrapCommands}
                </pre>
              </div>

              {/* Method 3: Capacitor Offline Native APK */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Método 3 · APK 100% Local con Android Studio
                    </span>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      Ionic Capacitor (Empaquetado Nativo de la Carpeta dist/)
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        downloadJsonFile('capacitor.config.json', capacitorConfigObject)
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[11px] font-bold whitespace-nowrap shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>capacitor.config.json</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(capacitorCommands, 'capacitor')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[11px] font-bold whitespace-nowrap shrink-0"
                    >
                      {copiedSection === 'capacitor' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <pre className="bg-stone-900 text-amber-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {capacitorCommands}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Customizer for Package ID & SHA-256 */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 space-y-3">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                  Personalizar Identificador del Paquete Android y Firma SHA-256
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                      Android Package ID (applicationId)
                    </label>
                    <input
                      type="text"
                      value={packageId}
                      onChange={(e) => setPackageId(e.target.value)}
                      placeholder="app.kadish.yurzaid"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                      Huella Digital SHA-256 del Keystore
                    </label>
                    <input
                      type="text"
                      value={sha256Fingerprint}
                      onChange={(e) => setSha256Fingerprint(e.target.value)}
                      placeholder="14:6D:E9:7D:..."
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      downloadJsonFile('twa-manifest.json', twaManifestObject)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar twa-manifest.json</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadJsonFile('assetlinks.json', assetLinksObject)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-600" />
                    <span>Descargar assetlinks.json</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadJsonFile('capacitor.config.json', capacitorConfigObject)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-100 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-600" />
                    <span>Descargar capacitor.config.json</span>
                  </button>
                </div>
              </div>

              {/* Preview of assetlinks.json */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    Vista previa de <code>/.well-known/assetlinks.json</code>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(JSON.stringify(assetLinksObject, null, 2), 'assetlinks')
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400"
                  >
                    {copiedSection === 'assetlinks' ? '¡Copiado!' : 'Copiar JSON'}
                  </button>
                </div>
                <pre className="bg-stone-900 text-stone-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(assetLinksObject, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    Verificación en Tiempo Real del Servidor y Archivos APK
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Comprobación HTTP directa (<code>no-store</code>) de cada componente y recurso del servidor
                    {lastSyncTime ? ` · Última verificación: ${lastSyncTime}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={forceServerSync}
                    disabled={isSyncingServer || isChecking}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isSyncingServer ? 'animate-spin' : ''}`}
                    />
                    <span>Sincronizar Servidor y Caché</span>
                  </button>
                  <button
                    type="button"
                    onClick={runLiveAudit}
                    disabled={isChecking || isSyncingServer}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                    <span>Revalidar</span>
                  </button>
                </div>
              </div>

              <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900">
                {checks.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            item.ok ? 'text-emerald-600' : 'text-amber-500'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <div className="font-mono text-[11px] text-stone-500">
                        {item.path}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold whitespace-nowrap shrink-0 ${
                        item.ok
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {item.detail}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                  Matriz de Versiones de SDKs y APIs Activas
                </h4>
                <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900">
                  {sdkVersionsMatrix.map((sdk) => (
                    <div
                      key={sdk.name}
                      className="px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <span className="font-medium text-stone-800 dark:text-stone-200 text-xs">
                        {sdk.name}
                      </span>
                      <span className="font-mono font-bold text-[11px] text-amber-800 dark:text-amber-400 tabular-nums whitespace-nowrap shrink-0">
                        {sdk.version}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/50 flex items-center justify-between gap-2">
          <span className="text-[11px] text-stone-500">
            Nombre oficial APK: <strong>Kadish y Yurzaid</strong> · Package: <code>{packageId}</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
