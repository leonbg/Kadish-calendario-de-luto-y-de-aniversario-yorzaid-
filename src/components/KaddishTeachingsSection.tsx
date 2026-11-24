import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  Compass,
  Scroll,
  Quote,
  Lightbulb,
  Flame,
  CheckCircle2,
  Calendar,
  Clock,
  Scale,
  Layers,
} from 'lucide-react';

export type TeachingTab =
  | 'why_no_death'
  | 'sages_teachings'
  | 'mourning_stages'
  | 'yahrtzeit_candle'
  | 'matzeivah_stones'
  | 'yehe_shemeh_secrets'
  | 'nusaj_differences';

export const KaddishTeachingsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TeachingTab>('why_no_death');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <section className="mt-8 border-t border-stone-200 dark:border-stone-800 pt-6 pb-12 space-y-5">
      {/* Section Header with Expand/Collapse */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              Profundidad, Significado y Sabiduría del Kadish
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Enseñanzas verificables de Maimónides, Najmánides, el Baal Shem Tov, el Jasidismo, leyes de duelo, Yurzaid y Matzeivá
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors shadow-2xs"
        >
          <span>{isExpanded ? 'Ocultar Sección' : 'Ver Enseñanzas'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Navigation Subtabs */}
          <div className="flex flex-wrap border border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-900/80 rounded-t-xl p-2 gap-1.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('why_no_death')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'why_no_death'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/80 dark:border-stone-700 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-white/50 dark:hover:bg-stone-800/50'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>¿Por qué sin muerte?</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sages_teachings')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'sages_teachings'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/80 dark:border-stone-700 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-white/50 dark:hover:bg-stone-800/50'
              }`}
            >
              <Quote className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Sabios (Rambam, Rambán, Jasidut)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mourning_stages')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'mourning_stages'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/80 dark:border-stone-700 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-white/50 dark:hover:bg-stone-800/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Etapas del Duelo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('yahrtzeit_candle')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'yahrtzeit_candle'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/80 dark:border-stone-700 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-white/50 dark:hover:bg-stone-800/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Yahrzeit y Vela del Alma</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matzeivah_stones')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'matzeivah_stones'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/80 dark:border-stone-700 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-white/50 dark:hover:bg-stone-800/50'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Matzeivá y Piedras</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('yehe_shemeh_secrets')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'yehe_shemeh_secrets'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/80 dark:border-stone-700 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-white/50 dark:hover:bg-stone-800/50'
              }`}
            >
              <Scroll className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Secretos de «Yehé Sheméh Rabbá»</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('nusaj_differences')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'nusaj_differences'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-xs border border-stone-200/80 dark:border-stone-700 ring-1 ring-amber-500/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-white/50 dark:hover:bg-stone-800/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Diferencias entre Nusajim</span>
            </button>
          </div>

          {/* TAB 1: ¿POR QUÉ NO SE MENCIONA LA MUERTE NI AL DIFUNTO? */}
          {activeTab === 'why_no_death' && (
            <div className="p-4 sm:p-5 rounded-b-xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900 space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <HeartHandshake className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    La Paradoja Sagrada: Una plegaria de duelo sin mención de la muerte
                  </h3>
                  <p className="mt-1">
                    Cualquier persona que lea por primera vez el Kadish se sorprende: en todo su texto en arameo <strong>no aparece ni una sola vez la palabra muerte, tumba, tristeza ni el nombre de la persona fallecida</strong>. Es exclusivamente una oda a la santidad, soberanía y grandeza del Creador. ¿Por qué los sabios instituyeron esta plegaria para los deudos?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>1. Tziduk HaDín (Aceptación de la Justicia Divina)</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    En el momento de mayor quiebre humano, ante el dolor de la pérdida, la reacción instintiva podría ser la queja o el resentimiento hacia Dios. El Kadish transforma esa herida en un acto supremo de fe: el doliente se pone de pie ante toda la congregación y proclama que, a pesar de su desgarro, Dios es santo, justo y perfecto en Su gobierno cósmico.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>2. Reparar el «Vacío» de la Gloria Divina</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    Cada ser humano es una chispa divina única que refleja la presencia de Dios en la Tierra. Cuando una persona parte de este mundo, la «corona» del Rey sufre un vacío, pues falta un portador de Su luz. Al recitar el Kadish y hacer que todo el Minyán responda <em>«¡Amén, Yehé Sheméh Rabbá!»</em>, se repone esa santidad en la creación.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>3. «El hijo acredita y eleva al padre» (Bara Mezakeh Aba)</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    En el Talmud (Sanhedrín 104a) se enseña que el alma en el plano espiritual ya no puede realizar mitzvot materiales. Sin embargo, cuando los hijos o discípulos actúan con rectitud y santifican el Nombre Divino públicamente, demuestran que la semilla plantada por los padres sigue dando frutos santos. Esa santificación se acredita de inmediato al alma del fallecido.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>4. Idioma Arameo: Comprensión universal y protección espiritual</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    El Kadish fue compuesto en arameo (la lengua hablada por todo el pueblo judío en la época del Segundo Templo y el Talmud) para que hasta la persona más sencilla comprendiera su alabanza. Los cabalistas agregan que el arameo trasciende las barreras celestiales, permitiendo que la devoción del doliente ascienda directo al Trono del Creador.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SABIOS DE ISRAEL (RAMBAM, RAMBÁN, BAAL SHEM TOV, TANYA) */}
          {activeTab === 'sages_teachings' && (
            <div className="p-4 sm:p-5 rounded-b-xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900 space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              <div className="text-xs text-stone-500 dark:text-stone-400">
                Enseñanzas y reflexiones directas de los más grandes maestros y codificadores del pensamiento judío sobre el Kadish y la inmortalidad del alma:
              </div>

              <div className="space-y-3.5">
                {/* 1. Maimónides (El Rambam) */}
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      Maimónides – Rabenu Moshé ben Maimón (El Rambam, 1138–1204)
                    </span>
                    <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full">
                      Mishné Torá • Hiljot Evel & Tefilá
                    </span>
                  </div>
                  <blockquote className="italic p-2.5 rounded-lg bg-white/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200">
                    «El duelo no fue dado para destruirnos en desesperación, sino para despertar el corazón a la introspección y al mejoramiento de nuestros actos. Quien se aflige con templanza y santifica el Nombre Divino ante diez personas (Minyán), proclama que la justicia de Dios gobierna el universo con rectitud absoluta.»
                  </blockquote>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    En <em>Hiljot Evel</em> (cap. 13), el Rambam explica que el proceso de duelo es una escalera psicológica y espiritual: tres días de llanto para desahogar el corazón, siete días de reclusión (*Shiv'á*), treinta días de reintegración gradual (*Sheloshim*) y doce meses de elevación para los padres.
                  </p>
                </div>

                {/* 2. Najmánides (El Rambán) */}
                <div className="p-3.5 rounded-xl border border-amber-300/70 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                      Najmánides – Rabenu Moshé ben Najmán (El Rambán, 1194–1270)
                    </span>
                    <span className="text-[11px] font-medium text-amber-800 dark:text-amber-400">
                      Torat HaAdam · Sha'ar HaGhemul
                    </span>
                  </div>
                  <blockquote className="italic p-2.5 rounded-lg bg-white/80 dark:bg-stone-900/60 border border-amber-200/80 dark:border-amber-900/50 text-stone-800 dark:text-stone-200">
                    «El alma en el Mundo Superior es consciente de las acciones de sus descendientes en la Tierra. Cuando los hijos estudian Torá, dan caridad y recitan el Kadish, una fragancia de consuelo y frescor espiritual desciende sobre el alma, aliviando su juicio y concediéndole un ascenso directo (*Aliyat Neshamá*) hacia los aposentos superiores de la Presencia Divina.»
                  </blockquote>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    En su monumental tratado <em>Torat HaAdam</em> («La Ley del Hombre»), el Rambán fundamentó la base teológica y cabalística de por qué los méritos de los vivos rescatan y embellecen la vestidura celestial del alma del difunto.
                  </p>
                </div>

                {/* 3. Baal Shem Tov */}
                <div className="p-3.5 rounded-xl border border-amber-300/70 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                      Rabí Yisrael Baal Shem Tov (1698–1760)
                    </span>
                    <span className="text-[11px] font-medium text-amber-800 dark:text-amber-400">
                      Fundador del Movimiento Jasídico
                    </span>
                  </div>
                  <blockquote className="italic p-2.5 rounded-lg bg-white/80 dark:bg-stone-900/60 border border-amber-200/80 dark:border-amber-900/50 text-stone-800 dark:text-stone-200">
                    «El Kadish es como una cuerda de salvación trenzada con fuego celestial que se arroja a los abismos más hondos. Cuando el deudo dice las palabras con fervor y la congregación responde al unísono “¡Amén, Yehé Sheméh Rabbá!”, esa cuerda jala al alma hacia arriba, abriéndole de par en par los portones del Gan Edén.»
                  </blockquote>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    El Baal Shem Tov enseñó que la melancolía paraliza, pero el dolor canalizado en fervor y alabanza a Dios tiene el poder de transformar la oscuridad en luz inextinguible.
                  </p>
                </div>

                {/* 4. El Tanya (Rabí Shneur Zalman de Liadi) */}
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      El Baal HaTanya – Rabí Shneur Zalman de Liadi (1745–1812)
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                      Sefer HaTanya · Igueret HaKodesh 27
                    </span>
                  </div>
                  <blockquote className="italic p-2.5 rounded-lg bg-white/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200">
                    «Cuando un justo o un progenitor parte de este cuerpo físico, su presencia espiritual no disminuye; al contrario, se expande. Ya no está limitado por un solo lugar en la Tierra, y se encuentra más cerca y accesible que nunca para aquellos que siguen sus enseñanzas con amor, temor a Dios y pureza de corazón.»
                  </blockquote>
                </div>

                {/* 5. El Rebe de Lubavitch */}
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      El Rebe de Lubavitch – Rabí Menajem M. Schneerson (1902–1994)
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                      Líder Espiritual Universal
                    </span>
                  </div>
                  <blockquote className="italic p-2.5 rounded-lg bg-white/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200">
                    «Cuando recitas el Kadish, estás prestando tu voz terrenal, tus labios y tu cuerpo físico para que tu ser querido continúe santificando a Dios aquí abajo. No eres simplemente un doliente que recuerda el pasado: eres la continuación viva y eterna del alma de tus padres en este mundo.»
                  </blockquote>
                </div>

                {/* 6. El Ben Ish Jai & El Arizal */}
                <div className="p-3.5 rounded-xl border border-amber-300/70 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                      El Ben Ish Jai (Rabí Yosef Jaim de Bagdad) y El Arizal (Rabí Yitzjak Luria)
                    </span>
                    <span className="text-[11px] font-medium text-amber-800 dark:text-amber-400">
                      Cábala y Tradición Sefaradí
                    </span>
                  </div>
                  <blockquote className="italic p-2.5 rounded-lg bg-white/80 dark:bg-stone-900/60 border border-amber-200/80 dark:border-amber-900/50 text-stone-800 dark:text-stone-200">
                    «Las 28 letras de “Yehé Sheméh Rabbá” corresponden a la fuerza primordial de la Creación (כ״ח - Kóaj). Cada Kadish recitado con devoción en Shajarit, Minjá y Arbit viste al alma de coronas de esplendor y repara las chispas divinas en todos los mundos espirituales.»
                  </blockquote>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ETAPAS DEL DUELO EN EL JUDAÍSMO */}
          {activeTab === 'mourning_stages' && (
            <div className="p-4 sm:p-5 rounded-b-xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900 space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>La Sabiduría Gradual del Duelo Judío (Avelut)</span>
                </h3>
                <p className="text-stone-600 dark:text-stone-300">
                  La ley judía (*Halajá*) reconoce que el dolor humano no puede apagarse de golpe ni prolongarse indefinidamente. Por ello, instituyó cuatro etapas progresivas de sanación psicológica y elevación espiritual:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Aninut */}
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-1.5">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      1. Aninut (אֲנִינוּת)
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
                      Fallecimiento hasta el Entierro
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    El período de conmoción inicial más intenso. El deudo (*Onén*) está exento de todas las obligaciones positivas de la Torá (como ponerse Tefilín o recitar bendiciones) para abocarse exclusivamente a la organización del entierro con máxima dignidad (*Kevod HaMet*). Aún no se recita Kadish en esta fase.
                  </p>
                </div>

                {/* 2. Shiv'á */}
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-1.5">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      2. Shiv'á (שִׁבְעָה)
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
                      7 Días de Duelo Íntimo
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    Comienza inmediatamente tras el sepelio. La familia se recluye en el hogar, sentándose en banquetas bajas como señal de humildad ante el juicio divino. Los espejos se cubren para evitar la vanidad física. La comunidad visita para brindar consuelo (*Nijum Avelim*), rezar con Minyán y permitir la recitación constante del Kadish.
                  </p>
                </div>

                {/* 3. Sheloshim */}
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-1.5">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      3. Sheloshim (שְׁלוֹשִׁים)
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
                      30 Días de Reintegración
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    Los deudos regresan gradualmente a su trabajo y actividades habituales, pero se abstienen de fiestas públicas con música, cortes de cabello y estrenar ropas festivas. Para otros familiares cercanos (hermanos, cónyuge, hijos), el período de duelo formal concluye al cumplirse los 30 días.
                  </p>
                </div>

                {/* 4. Los 12 Meses (Shaná) */}
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-1.5">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      4. Doce Meses (שָׁנָה)
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
                      Exclusivo para Padre y Madre
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    Por respeto al honor de los padres (*Kibud Av VaEm*), se mantiene el duelo durante todo el primer año. En la tradición ashkenazí se recita Kadish durante 11 meses exactos; en la tradición sefaradí (según el Ben Ish Jai y el Shulján Aruj) se recita durante los 12 meses, haciendo una breve pausa de una semana tras finalizar el mes 11 para no presumir que el alma requiere el año completo de purificación.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EL YAHRZEIT Y LA VELA DEL ALMA (NER NESHAMÁ) */}
          {activeTab === 'yahrtzeit_candle' && (
            <div className="p-4 sm:p-5 rounded-b-xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900 space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <Flame className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    El Secreto del Yahrzeit (Yurzaid / Aniversario del Alma)
                  </h3>
                  <p className="mt-1">
                    Cada año, en la fecha hebrea exacta en que la persona partió de este mundo, el alma experimenta un nuevo juicio celestial y un ascenso a un grado superior de santidad (*Aliyat HaNeshamá*). Por eso, el Yahrzeit se conmemora para siempre, año tras año, generación tras generación.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>La Vela de 24 Horas: «Ner Hashem Nishmat Adam»</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    Dice el rey Salomón en Proverbios (20:27): <em>«La vela de Dios es el alma del ser humano»</em>. La llama viva, que siempre danza y busca elevarse hacia el cielo, refleja la esencia del alma inmortal. Se enciende una vela conmemorativa al caer la noche del Yahrzeit y se deja arder durante las 24 horas continuas del día hebreo.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>El Secreto de las Mishnayot (Mishná = Neshamá)</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    Los sabios señalan que las letras hebreas de <strong>Mishná (מִשְׁנָה)</strong> son exactamente las mismas letras de <strong>Neshamá (נְשָׁמָה - Alma)</strong>. Estudiar capítulos de la Mishná en el día del Yahrzeit ilumina la conciencia del alma y le otorga méritos eternos en el Mundo Venidero.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Scroll className="w-4 h-4 text-amber-600" />
                    <span>Los 4 Kadishim del Día</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    En el Yahrzeit, es un deber sagrado asistir a la sinagoga y recitar el Kadish en todos los servicios del día: la noche anterior (*Arbit*), la mañana (*Shajarit*), la tarde (*Minjá*) y tras el estudio de Torá (*Kadish Derabanán*), además de subir a la Torá (*Aliyá laTorá*).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-amber-600" />
                    <span>Tzedaká y Bendición de Alimentos (Tikún)</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    Es costumbre ofrecer alimentos para que los congregantes reciten bendiciones (<em>Mezonot, Shehakol, HaEtz</em>) respondiendo <em>«¡Leilui Nishmat!»</em> (por la elevación del alma) y donar caridad a causas nobles, pues la caridad salva de decretos adversos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LA MATZEIVÁ (LÁPIDA) Y LAS PIEDRAS */}
          {activeTab === 'matzeivah_stones' && (
            <div className="p-4 sm:p-5 rounded-b-xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900 space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>La Matzeivá (Lápida) y la Costumbre Milenaria de las Piedras</span>
                </h3>
                <p className="text-stone-600 dark:text-stone-300">
                  El respeto al cuerpo que albergó el alma sagrada es uno de los preceptos supremos del judaísmo (*Kevod HaMet*). La lápida y las visitas al cementerio poseen profundos fundamentos bíblicos y espirituales:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>1. Origen Bíblico: Yaakov y la Tumba de Rajel</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    En Génesis 35:20, la Torá relata: <em>«Y erigió Yaakov una lápida sobre su sepultura; es la lápida de la tumba de Rajel hasta el día de hoy»</em>. La Matzeivá se coloca para honrar el lugar de descanso físico, identificar la tumba y protegerla de profanaciones.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>2. ¿Por qué se colocan piedras y no flores?</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    Las flores son hermosas pero perecederas; en pocos días se marchitan y mueren. <strong>Las piedras, en cambio, son eternas</strong>. Colocar una piedra sobre la lápida simboliza que el amor, la memoria y el legado espiritual del ser querido no se marchitan jamás. Además, es un acto de participación activa en la preservación de la tumba.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>3. El Momento de la Develación (Guelui Matzeivá)</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    Según la costumbre sefaradí, la Matzeivá se coloca habitualmente al cumplirse los 30 días (*Sheloshim*) o al año. En la ceremonia se recitan Salmos (especialmente el Salmo 91 y fragmentos del Salmo 119 correspondientes al nombre del difunto), Kadish y la oración de misericordia *Ashkavá*.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5">
                  <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>4. La Oración en las Tumbas de los Padres (Kivrei Avot)</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    Al visitar el cementerio, no le rezamos a la persona fallecida (lo cual está prohibido), sino que le pedimos a Dios por el mérito de nuestros rectos antepasados (*Zejut Avot*) y para que el alma sea intercesora de bendición y paz para toda su descendencia.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SECRETOS DE YEHE SHEMEH RABBA */}
          {activeTab === 'yehe_shemeh_secrets' && (
            <div className="p-4 sm:p-5 rounded-b-xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900 space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="text-center font-serif text-base sm:text-lg font-bold text-amber-900 dark:text-amber-200" dir="rtl">
                  יְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא
                </div>
                <div className="text-center text-xs font-semibold text-amber-800 dark:text-amber-300">
                  «¡Sea Su gran Nombre bendito por siempre y por toda la eternidad!»
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1">
                  <div className="font-bold text-stone-900 dark:text-stone-100">
                    1. El secreto de las 28 letras (Fuerza = Kóaj כ״ח)
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    La respuesta central <em>«Yehe shemeh Rabba mevaraj le'alam ul'almei 'almaya»</em> contiene exactamente <strong>28 letras</strong> en arameo. El valor numérico de 28 es <strong>כ״ח (Kóaj = Fuerza)</strong>, correspondiendo a las 28 letras del primer versículo de la Torá (<em>Bereshit bará Elokim...</em>). Quien responde con fuerza y devoción repara la fuerza de la creación entera.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1">
                  <div className="font-bold text-stone-900 dark:text-stone-100">
                    2. Anulación de decretos severos de 70 años
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    Dice el Talmud (Shabat 119b): <em>«Todo aquel que responde “Amén, Yehé Sheméh Rabbá...” con todas sus fuerzas (con plena concentración del corazón), incluso si tenía un decreto adverso de 70 años dictado en el Cielo, es anulado de inmediato.»</em>
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-1">
                  <div className="font-bold text-stone-900 dark:text-stone-100">
                    3. La corona de 5 palabras
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    La respuesta consta de 5 palabras iniciales: <em>Yehe (1) shemeh (2) Rabba (3) mevaraj (4) le'alam (5)</em>, y luego se sella con <em>ul'almei 'almaya</em>. En la tradición del Shulján Aruj, no se debe interrumpir ni hablar entre <em>mevaraj</em> y <em>le'alam</em>, manteniéndolo como una sola unidad sagrada de proclamación.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: COMPARATIVA ENTRE NUSAJIM */}
          {activeTab === 'nusaj_differences' && (
            <div className="p-4 sm:p-5 rounded-b-xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900 space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              <p className="text-stone-600 dark:text-stone-400">
                A lo largo de los siglos, las comunidades judías han preservado matices litúrgicos específicos (*Nusaj*). Aunque el 95% del Kadish es idéntico, existen diferencias significativas:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Nusaj Sefaradí / Mizrají */}
                <div className="p-3.5 rounded-xl border-2 border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20 space-y-2">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <span className="font-bold text-sm text-amber-950 dark:text-amber-200">
                      Nusaj Sefaradí / Mizrají
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                      Este Sidur
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-[11px]">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Cláusula Mesiánica:</strong> Incluye siempre <em>«veyatsmaj purqaneh viqarev meshijeh»</em> en el segundo párrafo.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Kadish Derabanán:</strong> Concluye con la fórmula enriquecida <em>«Hu berajamav ya'aseh shalom aleinu...»</em>.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Pronunciación:</strong> Distinción clara de letras guturales (<em>'Ayin, Jet, Qof</em>) y vocal <em>Qamatz Qatán / Holam</em> («kol»).
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Duración de Duelo:</strong> Tradición de 12 meses con pausa de 1 semana en el mes 11 (Ben Ish Jai).
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Nusaj Ashkenaz */}
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 space-y-2">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                    <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      Nusaj Ashkenaz
                    </span>
                    <span className="text-[10px] text-stone-500 font-semibold">
                      Europa Central y Oriental
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-[11px]">
                    <li className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0 mt-1" />
                      <span>
                        <strong>Sin cláusula mesiánica:</strong> Pasa directamente de <em>«ve-yamlij maljuteh»</em> a <em>«be-jayeijon uv-yomeijon»</em>.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0 mt-1" />
                      <span>
                        <strong>Párrafo Yitbaraj:</strong> Se añade la palabra <em>«le'ela le'ela»</em> o <em>«mikol»</em> según la época del año.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0 mt-1" />
                      <span>
                        <strong>Duración de Duelo:</strong> Costumbre estricta de 11 meses exactos para Kadish Yatom, cesando en el mes 12.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Nusaj Sefard (Jasídico) */}
                <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 space-y-2">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                    <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      Nusaj Sefard (Jasídico)
                    </span>
                    <span className="text-[10px] text-stone-500 font-semibold">
                      Síntesis Cabalística del Arizal
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-[11px]">
                    <li className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0 mt-1" />
                      <span>
                        <strong>Fusión de tradiciones:</strong> Utiliza el texto sefaradí cabalístico instituido por el Arizal (con <em>«veyatsmaj purqaneh»</em>), pero conservando la fonética ashkenazí.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0 mt-1" />
                      <span>
                        <strong>Comunidades:</strong> Jabad-Lubavitch, Satmar, Guer, Breslov y la gran mayoría de dinastías jasídicas.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
