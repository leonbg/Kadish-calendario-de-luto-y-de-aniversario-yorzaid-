import React, { useState } from 'react';
import { Volume2, X, Play, UserCheck, Languages } from 'lucide-react';
import { playPhoneticSample } from '../utils/speechUtils';
import { TranslitTradition } from '../types/kaddish';

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  translitTradition?: TranslitTradition;
  onTranslitTraditionChange?: (tradition: TranslitTradition) => void;
}

export const PronunciationModal: React.FC<PronunciationModalProps> = ({
  isOpen,
  onClose,
  translitTradition = 'sefaradi',
  onTranslitTraditionChange,
}) => {
  const [playingSampleKey, setPlayingSampleKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlaySample = (hebrew: string, translit: string, key: string, forcePhonetic: boolean) => {
    setPlayingSampleKey(key);
    playPhoneticSample(hebrew, translit, 1.0, forcePhonetic);
    setTimeout(() => {
      setPlayingSampleKey((prev) => (prev === key ? null : prev));
    }, 3200);
  };

  const samplePhrases = [
    {
      label: 'Apertura',
      hebrew: 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא',
      translit: 'Yitgadal veyitqaddash shemeh Rabba',
      translitIvris: 'Yisgadal veyiskadash shmeh Rabbo',
      note: 'En Ivris: Tav sin daguesh = «s» (Yisgadal), Qamats = «o» (Rabbo). En Ivrit: Tav = «t» (Yitgadal), Qamats = «a» (Rabba).',
    },
    {
      label: 'Cláusula Mesiánica (Mizrají)',
      hebrew: 'וְיַצְמַח פֻּרְקָנֵהּ וִיקָרֵב מְשִׁיחֵהּ',
      translit: 'veyatsmaj purqaneh viqarev meshijeh',
      translitIvris: 'veyatsmach purkoneh vikorev Meshicheh',
      note: 'Sonido gutural de Het. En Ivris el Qamats se vocaliza como «o» (purkoneh, vikorev).',
    },
    {
      label: 'Respuesta Central',
      hebrew: 'יְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא',
      translit: "Yehe shemeh Rabba mevaraj le'alam ul'almei 'almaya",
      translitIvris: "Yehei shmeh Rabbo mevorach le'olam ul'olmei olmayo",
      note: "En Ivris: 'olam y olmayo (con «o»). En Ivrit: 'alam y 'almaya (con «a»).",
    },
    {
      label: 'Pronunciación «Kol» (Todo)',
      hebrew: 'לְעֵלָּא מִן כָּל בִּרְכָתָא, וְעַל כָּל יִשְׂרָאֵל',
      translit: "le'ela min kol birjata, ve'al kol Yisrael",
      translitIvris: "le'eilo min kol birchoso, ve'al kol Yisroel",
      note: 'Vocal Qamatz Qatán: en ambas tradiciones se pronuncia «kol» (con «o»), nunca «kal». En Ivris beit Yisrael es «béis Yisroel».',
    },
    {
      label: 'Variante Aseret Yemei Teshuvá',
      hebrew: 'לְעֵלָּא וּלְעֵלָּא מִכָּל בִּרְכָתָא',
      translit: "Le'ela ul'e'ela mi-kol birjata",
      translitIvris: "Le'eilo ul'eilo mikol birchoso",
      note: "Doble «Le'ela» (Ivrit) / «Le'eilo» (Ivris) en los Diez Días de Arrepentimiento.",
    },
    {
      label: 'Clausura de Paz',
      hebrew: 'עוֹשֶׂה הַשָּׁלוֹם בִּמְרוֹמָיו',
      translit: "'Oseh HaShalom bimromav",
      translitIvris: "'Oseh haSholom bimromov",
      note: 'Paz: «Shalom» en Ivrit, «Sholom» en Ivris.',
    },
  ];

  const ivrisComparisons = [
    {
      element: 'Letra Tav (ת) sin daguesh',
      ivrit: '«t» (Yitgadal, beit, shabat)',
      ivris: '«s» (Yisgadal, béis, shobos)',
    },
    {
      element: 'Vocal Qamats (ָ)',
      ivrit: '«a» abierta (Rabbá, Amén)',
      ivris: '«o» (Rabbó, Oméin)',
    },
    {
      element: 'Sufijos plurales (-ot / -at)',
      ivrit: 'birjot / birjatá, tushbejatá',
      ivris: 'birchos / birchosó, tushbechosó',
    },
    {
      element: 'Comunidad de Israel',
      ivrit: 'beit Yisraél',
      ivris: 'béis Yisroél',
    },
    {
      element: 'Respuesta Amén',
      ivrit: 'Amén',
      ivris: 'Oméin',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-base">
                Guía de Fonética y Tradición: Ivrit vs Ivris
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Comparativa e interpretación auditiva entre la dicción Sefaradí (Ivrit) y Asquenazí (Ivris)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Quick Switcher Banner inside Modal */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs text-amber-950 dark:text-amber-200">
                Selección de Dicción Activa en el Sidur
              </div>
              <div className="text-[11px] text-stone-600 dark:text-stone-400">
                Actualmente mostrando: <strong className="text-amber-800 dark:text-amber-300">{translitTradition === 'ivris' ? 'Asquenazí (Ivris)' : 'Sefaradí (Ivrit)'}</strong>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onTranslitTraditionChange?.('sefaradi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  translitTradition === 'sefaradi'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                }`}
              >
                Ivrit (Sefaradí)
              </button>
              <button
                type="button"
                onClick={() => onTranslitTraditionChange?.('ivris')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  translitTradition === 'ivris'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                }`}
              >
                Ivris (Asquenazí)
              </button>
            </div>
          </div>

          {/* Comparative Table: Ivrit vs Ivris */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">
              ¿Por qué se llama «Ivris» y cuáles son las diferencias fonéticas?
            </h4>
            <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-white dark:bg-stone-900/60 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
              En las comunidades judías asquenazíes de Europa Central y Oriental, la palabra hebrea <strong>«עִבְרִית»</strong> (hebreo) termina en la letra <em>Tav (ת)</em> sin daguesh, que en su pronunciación tradicional suena como <strong>«s»</strong>, resultando en <strong>«Ivris»</strong> o <strong>«Ibris»</strong>.
            </div>

            <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-950/40">
              <div className="grid grid-cols-12 bg-amber-500/10 font-bold text-[11px] text-amber-950 dark:text-amber-200 p-2.5 border-b border-stone-200 dark:border-stone-800">
                <div className="col-span-4">Elemento</div>
                <div className="col-span-4">Sefaradí (Ivrit)</div>
                <div className="col-span-4">Asquenazí (Ivris)</div>
              </div>
              <div className="divide-y divide-stone-200 dark:divide-stone-800 text-xs">
                {ivrisComparisons.map((c, i) => (
                  <div key={i} className="grid grid-cols-12 p-2.5 hover:bg-amber-50/20 dark:hover:bg-amber-950/10 transition-colors">
                    <div className="col-span-4 font-semibold text-stone-900 dark:text-stone-100">
                      {c.element}
                    </div>
                    <div className="col-span-4 text-emerald-800 dark:text-emerald-300 font-medium">
                      {c.ivrit}
                    </div>
                    <div className="col-span-4 text-amber-800 dark:text-amber-300 font-medium">
                      {c.ivris}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Samples with Dual Audio */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Comparativa Verso a Verso con Audio
              </h4>
              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                Escucha en Ivrit o Ivris
              </span>
            </div>
            <div className="space-y-2.5">
              {samplePhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-300 dark:hover:border-amber-800 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-amber-800 dark:text-amber-400">
                      {phrase.label}
                    </div>
                    <div className="text-sm font-bold font-serif text-stone-900 dark:text-stone-100" dir="rtl">
                      {phrase.hebrew}
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="text-emerald-800 dark:text-emerald-300">
                        <strong>Ivrit:</strong> {phrase.translit}
                      </div>
                      <div className="text-amber-800 dark:text-amber-400 font-semibold">
                        <strong>Ivris:</strong> {phrase.translitIvris}
                      </div>
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      {phrase.note}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePlaySample(phrase.hebrew, phrase.translit, `ivrit-${idx}`, true)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 ${
                        playingSampleKey === `ivrit-${idx}`
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 border-stone-200 dark:border-stone-700 hover:border-emerald-400'
                      }`}
                      title="Escuchar pronunciación en Ivrit (Sefaradí)"
                    >
                      {playingSampleKey === `ivrit-${idx}` ? (
                        <Volume2 className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>Ivrit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlaySample(phrase.hebrew, phrase.translitIvris, `ivris-${idx}`, true)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 ${
                        playingSampleKey === `ivris-${idx}`
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                      }`}
                      title="Escuchar pronunciación en Ivris (Asquenazí)"
                    >
                      {playingSampleKey === `ivris-${idx}` ? (
                        <Volume2 className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>Ivris</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/80 flex items-center justify-between">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Cambia entre Ivrit e Ivris en cualquier momento desde la barra superior.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors whitespace-nowrap shrink-0"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
