import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  X,
  Quote,
  Lightbulb,
  Compass,
  Scroll,
  HeartHandshake,
  Flame,
  Clock,
  Scale,
  CheckCircle2,
} from 'lucide-react';

interface HalakhaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type HalakhaTab =
  | 'movements'
  | 'sages'
  | 'mourning'
  | 'yahrtzeit'
  | 'matzeivah'
  | 'meaning'
  | 'nusaj';

export const HalakhaModal: React.FC<HalakhaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<HalakhaTab>('movements');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-amber-500/10 dark:bg-amber-950/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Guía de Rezo, Halajá, Sabiduría y Costumbres del Kadish
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Leyes de Duelo, Yahrzeit, Matzeivá y Enseñanzas de Maimónides, Najmánides y el Jasidismo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shadow-2xs"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Headers - Responsive wrap and modern styling */}
        <div className="p-2 sm:p-2.5 bg-stone-100/80 dark:bg-stone-900/80 border-b border-stone-200 dark:border-stone-800">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('movements')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'movements'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-xs border border-amber-400/50 dark:border-amber-700/70 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Reverencias y Pasos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sages')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'sages'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-xs border border-amber-400/50 dark:border-amber-700/70 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <Quote className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Sabios (Rambam, Rambán, Jasidut)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mourning')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'mourning'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-xs border border-amber-400/50 dark:border-amber-700/70 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Ciclo del Duelo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('yahrtzeit')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'yahrtzeit'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-xs border border-amber-400/50 dark:border-amber-700/70 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Yahrzeit y Vela</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matzeivah')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'matzeivah'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-xs border border-amber-400/50 dark:border-amber-700/70 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Matzeivá y Piedras</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('meaning')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'meaning'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-xs border border-amber-400/50 dark:border-amber-700/70 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>¿Por qué sin muerte?</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('nusaj')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'nusaj'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-xs border border-amber-400/50 dark:border-amber-700/70 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Diferencias de Nusaj</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-stone-700 dark:text-stone-300 flex-1 min-h-0 leading-relaxed">
          {/* TAB 1: MOVIMIENTOS Y REVERENCIAS */}
          {activeTab === 'movements' && (
            <div className="space-y-3">
              {/* Pasos y movimientos */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 space-y-2">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Protocolo de Reverencias y Pasos en el Kadish</span>
                </h4>
                <ul className="space-y-1.5 text-stone-600 dark:text-stone-300 list-disc pl-4 leading-relaxed">
                  <li>
                    <strong>Postura inicial:</strong> De pie con los pies juntos como siervo ante el Trono del Rey Celestial.
                  </li>
                  <li>
                    <strong>Al comenzar («Yitgadál»):</strong> Inclinar levemente la cabeza y el torso hacia el frente.
                  </li>
                  <li>
                    <strong>En «Yehé sheméh Rabbá»:</strong> Toda la congregación responde al unísono con fuerza devocional e inclinación de respeto hacia el frente.
                  </li>
                  <li>
                    <strong>En «Yitbaráj»:</strong> Leve reverencia al pronunciar la primera palabra.
                  </li>
                  <li>
                    <strong>Al finalizar («'Oséh shalóm» / «'Oséh HaShalóm»):</strong>
                    <div className="mt-1 pl-1 space-y-0.5 text-stone-800 dark:text-stone-200 font-medium bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      1. Dar 3 pasos firmes hacia atrás comenzando con el pie izquierdo.<br />
                      2. Inclinarse hacia la izquierda diciendo <em>«'Oséh shalóm...»</em>.<br />
                      3. Inclinarse hacia la derecha diciendo <em>«Hu berajamáv ya'aséh shalóm 'aléinu...»</em>.<br />
                      4. Inclinarse al centro hacia el frente diciendo <em>«ve'al kol Yisraél, ve'imrú Amén»</em>.<br />
                      5. Permanecer en el lugar hasta que la congregación responda «Amén».
                    </div>
                  </li>
                </ul>
              </div>

              {/* Variantes de Aseret */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 space-y-2">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide text-[11px]">
                  Variantes de Aseret Yemei Teshuvá (1° al 10 de Tishrei)
                </h4>
                <div className="space-y-1 text-stone-600 dark:text-stone-300 leading-relaxed">
                  <div>
                    <strong>1. Duplicación:</strong> Se dice <span className="font-serif font-bold text-amber-800 dark:text-amber-300">לְעֵלָּא וּלְעֵלָּא מִכָּל</span> (<em>Le'éla ul'é'ela mi-kol</em>) en lugar de <em>Le'éla min kol</em>.
                  </div>
                  <div>
                    <strong>2. Artículo «HaShalom»:</strong> Se dice <span className="font-serif font-bold text-amber-800 dark:text-amber-300">עוֹשֶׂה הַשָּׁלוֹם</span> (<em>'Oseh HaShalom</em>) en lugar de <em>'Oseh shalom</em>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SABIOS DE ISRAEL */}
          {activeTab === 'sages' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 space-y-1">
                <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                  <span>Maimónides (El Rambam – Hiljot Evel & Tefilá):</span>
                  <span className="text-[10px] text-stone-400">1138–1204</span>
                </div>
                <p className="italic text-stone-700 dark:text-stone-300">
                  «El duelo es el despertar de la conciencia moral y espiritual. Cuando la persona acepta el juicio con reverencia y santifica el Nombre Divino públicamente ante diez hombres (Minyán), transforma su dolor en la mayor afirmación de fe y despierta la misericordia de Dios sobre todo Israel.»
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-300/70 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-1">
                <div className="font-bold text-amber-950 dark:text-amber-200 flex items-center justify-between">
                  <span>Najmánides (El Rambán – Torat HaAdam & Sha'ar HaGhemul):</span>
                  <span className="text-[10px] text-amber-700">1194–1270</span>
                </div>
                <p className="italic text-stone-700 dark:text-stone-300">
                  «El alma percibe y recibe refrigerio de los actos de bondad, estudio y plegarias de sus descendientes en este mundo. Cada Kadish recitado con devoción actúa como un bálsamo celestial que alivia el juicio y eleva el grado del alma hacia los palacios superiores del Gan Edén.»
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 space-y-1">
                <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                  <span>El Baal Shem Tov (Fundador del Jasidismo):</span>
                  <span className="text-[10px] text-stone-400">1698–1760</span>
                </div>
                <p className="italic text-stone-700 dark:text-stone-300">
                  «El Kadish es una escalera de fuego celestial arrojada a los abismos. Cuando el deudo lo recita con el corazón roto pero encendido de fe, y la congregación responde “Amén, Yehé Sheméh Rabbá”, se abren de par en par los portales más secretos del Trono Divino.»
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 space-y-1">
                <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                  <span>El Rebe de Lubavitch, Rabí Menajem M. Schneerson:</span>
                  <span className="text-[10px] text-stone-400">1902–1994</span>
                </div>
                <p className="italic text-stone-700 dark:text-stone-300">
                  «Tú eres la voz, las manos y la presencia terrenal viva de tu ser querido. Al recitar el Kadish, no estás simplemente recordando el pasado; estás permitiendo que el alma de tu padre o madre continúe santificando a Dios activamente en este mundo físico.»
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ETAPAS DEL DUELO */}
          {activeTab === 'mourning' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-stone-800 dark:text-stone-200 text-xs">
                <strong>Las 4 Fases Progresivas del Duelo Judío (Avelut):</strong>
                <p className="mt-1 text-stone-600 dark:text-stone-300">
                  Estructuradas por la Halajá para guiar al ser humano desde la conmoción del dolor agudo hasta la reconstrucción de la vida con propósito espiritual.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                    <span>1. Aninut (אֲנִינוּת)</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">Fallecimiento hasta el Sepelio</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 mt-1">
                    El doliente (*Onén*) se enfoca exclusivamente en organizar el entierro con respeto (*Kevod HaMet*). Exento de mitzvot positivas activas; aún no se dice Kadish.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                    <span>2. Shiv'á (שִׁבְעָה)</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">7 Días de Duelo Íntimo</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 mt-1">
                    Reclusión en el hogar, sentarse en banquetas bajas, espejos cubiertos, rezo con Minyán y consuelo mutuo (*Nijum Avelim*).
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                    <span>3. Sheloshim (שְׁלוֹשִׁים)</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">30 Días de Reintegración</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 mt-1">
                    Retorno gradual a labores cotidianas, absteniéndose de eventos musicales festivos y cortes de cabello. Concluye el duelo para cónyuges, hermanos e hijos.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                    <span>4. Doce Meses (שָׁנָה)</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">Exclusivo para Padre y Madre</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 mt-1">
                    Recitación diaria del Kadish en todos los rezos (11 meses en Ashkenaz; 12 meses con pausa de una semana en Sefarad según el Ben Ish Jai) para honrar a los padres.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: YAHRZEIT Y VELA DEL ALMA */}
          {activeTab === 'yahrtzeit' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <div className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>El Día del Yahrzeit (Aniversario Anual del Alma)</span>
                </div>
                <p className="text-stone-600 dark:text-stone-300">
                  En el aniversario hebreo de fallecimiento, el alma recibe una nueva elevación de grado en los cielos (*Aliyá*). Se conmemora con cuatro preceptos tradicionales:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 space-y-1">
                  <strong className="text-stone-900 dark:text-stone-100 block">🕯️ Vela de 24 Horas (Ner Neshamá):</strong>
                  <span className="text-stone-600 dark:text-stone-300">
                    «La vela de Dios es el alma del hombre» (Prov. 20:27). Se enciende al anochecer y arde durante todo el día hebreo.
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 space-y-1">
                  <strong className="text-stone-900 dark:text-stone-100 block">📜 Los 4 Kadishim del Día:</strong>
                  <span className="text-stone-600 dark:text-stone-300">
                    Rezar con Minyán en Arbit, Shajarit, Minjá y Kadish Derabanán tras el estudio de Torá.
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 space-y-1">
                  <strong className="text-stone-900 dark:text-stone-100 block">📖 Estudio de Mishnayot:</strong>
                  <span className="text-stone-600 dark:text-stone-300">
                    Las letras de <strong>Mishná (מִשְׁנָה)</strong> forman la palabra <strong>Neshamá (נְשָׁמָה - Alma)</strong>.
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 space-y-1">
                  <strong className="text-stone-900 dark:text-stone-100 block">🤝 Tzedaká y Bendiciones:</strong>
                  <span className="text-stone-600 dark:text-stone-300">
                    Ofrendar caridad y repartir alimentos para responder «Leilui Nishmat» (Por la elevación del alma).
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MATZEIVÁ Y PIEDRAS */}
          {activeTab === 'matzeivah' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <div className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-600" />
                  <span>La Lápida y el Secreto de las Piedras</span>
                </div>
                <p className="text-stone-600 dark:text-stone-300">
                  La colocación de la Matzeivá y las visitas al cementerio se fundamentan en el respeto al cuerpo y la eternidad del alma:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40">
                  <strong className="text-stone-900 dark:text-stone-100 block">1. Origen en la Torá (Génesis 35:20):</strong>
                  <span className="text-stone-600 dark:text-stone-300">
                    El patriarca Yaakov erigió la primera lápida conmemorativa sobre la tumba de Rajel para señalar su descanso y preservar su honor.
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40">
                  <strong className="text-stone-900 dark:text-stone-100 block">2. ¿Por qué piedras y no flores?</strong>
                  <span className="text-stone-600 dark:text-stone-300">
                    Las flores se marchitan y mueren rápidamente; las piedras son imperecederas y eternas, simbolizando que el amor, el alma y la memoria nunca perecen.
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40">
                  <strong className="text-stone-900 dark:text-stone-100 block">3. Rezo en las Tumbas (Kivrei Avot):</strong>
                  <span className="text-stone-600 dark:text-stone-300">
                    No rezamos al difunto, sino a Dios Todopoderoso por el mérito de los antepasados y para que su alma interceda por bendición, salud y paz para la familia.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SIGNIFICADO Y TZIDUK HADÍN */}
          {activeTab === 'meaning' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-200">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Tziduk HaDín y Elevación de la Neshamá</span>
                </div>
                <p className="leading-relaxed">
                  En el Kadish <strong>no se menciona la muerte ni el nombre del fallecido</strong>. Es una glorificación del Nombre de Dios proclamada por quien atraviesa la mayor prueba humana.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40">
                  <strong className="text-stone-900 dark:text-stone-100 block">1. Reparar la ausencia de la chispa divina:</strong>
                  <span className="text-stone-600 dark:text-stone-300">
                    Cada ser humano es un embajador de la gloria divina en la tierra. Cuando una persona parte, queda un vacío en el reflejo de la soberanía de Dios. El deudo llena ese vacío poniéndose de pie y provocando que toda la comunidad responda <em>«¡Amén, Yehé Sheméh Rabbá!»</em>.
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40">
                  <strong className="text-stone-900 dark:text-stone-100 block">2. El hijo eleva al padre (Bara Mezakeh Aba):</strong>
                  <span className="text-stone-600 dark:text-stone-300">
                    El alma en el Mundo Superior ya no puede cumplir preceptos físicos. Cuando sus descendientes o familiares actúan con santidad aquí abajo, la recompensa espiritual se acredita directamente al alma del difunto.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DIFERENCIAS DE NUSAJ */}
          {activeTab === 'nusaj' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-1">
                <div className="font-bold text-amber-900 dark:text-amber-300">
                  Nusaj Sefaradí / Mizrají (Este Sidur):
                </div>
                <p className="text-stone-700 dark:text-stone-300 text-[11px]">
                  Incluye la cláusula mesiánica <em>«veyatsmaj purqaneh viqarev meshijeh»</em>, el <em>«Hu berajamav»</em> en Kadish Derabanán y la pronunciación gutural tradicional de 'Ayin, Jet y Qof.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 space-y-1">
                <div className="font-bold text-stone-900 dark:text-stone-100">
                  Nusaj Ashkenaz:
                </div>
                <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                  Pasa directo de <em>ve-yamlij maljuteh</em> a <em>be-jayeijon</em> sin cláusula mesiánica intermedia, y mantiene la regla de 11 meses de Kadish Yatom.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 space-y-1">
                <div className="font-bold text-stone-900 dark:text-stone-100">
                  Nusaj Sefard (Jasídico):
                </div>
                <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                  Fusión instituida por el Arizal adoptada por comunidades jasídicas de Europa Oriental: incorpora el texto sefaradí cabalístico con fonética y melodías jasídicas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
