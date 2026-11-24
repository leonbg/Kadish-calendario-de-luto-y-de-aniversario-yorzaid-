import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Flame,
  Copy,
  Check,
  HardDrive,
  X,
  Moon,
  CalendarCheck,
  ArrowLeftRight,
  Download,
  Minus,
  Plus,
} from 'lucide-react';
import {
  CalculatorInput,
  MourningCustom,
  HEBREW_MONTHS_LIST,
  calculateKaddishTimeline,
  CalculationResult,
  convertGregorianToHebrewFields,
  convertHebrewToGregorianFields,
  toSafeISODateString,
} from '../utils/kaddishCalculator';
import { createCalendarEvent, signInWithGoogle } from '../utils/googleWorkspace';
import {
  loadFamilyMemorials,
  saveFamilyMemorials,
} from '../utils/familyMemorialUtils';
import { FamilyMemorialItem } from '../types/familyMemorial';
import { User } from 'firebase/auth';

interface KaddishCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHazkara: (hazkara: {
    name: string;
    hebrewName?: string;
    dateGregorian?: string;
    dateHebrew?: string;
    relation?: string;
    notes?: string;
  }) => void;
  googleUser: User | null;
  googleToken: string | null;
  onOpenWorkspace: () => void;
}

const CALC_STORAGE_KEY = 'kaddish_calculator_draft_v2';

interface SavedCalculatorDraft {
  inputType: 'gregorian' | 'hebrew';
  gregorianDate: string;
  afterSunset: boolean;
  hebrewDay: number;
  hebrewMonth: string;
  hebrewYear: number;
  custom: MourningCustom;
  deceasedName: string;
  hebrewName: string;
  relation: string;
}

function loadSavedDraft(): SavedCalculatorDraft {
  const defaultGreg = toSafeISODateString(new Date());
  const defaultHeb = convertGregorianToHebrewFields(defaultGreg, false);
  try {
    const raw = sessionStorage.getItem(CALC_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        inputType: parsed.inputType === 'hebrew' ? 'hebrew' : 'gregorian',
        gregorianDate: parsed.gregorianDate || defaultGreg,
        afterSunset: Boolean(parsed.afterSunset),
        hebrewDay: Number(parsed.hebrewDay) || defaultHeb.hebrewDay,
        hebrewMonth: parsed.hebrewMonth || defaultHeb.hebrewMonth,
        hebrewYear: Number(parsed.hebrewYear) || defaultHeb.hebrewYear,
        custom: parsed.custom || 'eleven_months',
        deceasedName: parsed.deceasedName || '',
        hebrewName: parsed.hebrewName || '',
        relation: parsed.relation || 'Padre',
      };
    }
  } catch {
    // ignore storage errors
  }
  return {
    inputType: 'gregorian',
    gregorianDate: defaultGreg,
    afterSunset: false,
    hebrewDay: defaultHeb.hebrewDay,
    hebrewMonth: defaultHeb.hebrewMonth,
    hebrewYear: defaultHeb.hebrewYear,
    custom: 'eleven_months',
    deceasedName: '',
    hebrewName: '',
    relation: 'Padre',
  };
}

export const KaddishCalculatorModal: React.FC<KaddishCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSaveHazkara,
  googleUser,
  googleToken,
}) => {
  const initialDraft = useMemo(() => loadSavedDraft(), []);

  // Input Form State
  const [inputType, setInputType] = useState<'gregorian' | 'hebrew'>(initialDraft.inputType);
  const [gregorianDate, setGregorianDate] = useState<string>(initialDraft.gregorianDate);
  const [afterSunset, setAfterSunset] = useState<boolean>(initialDraft.afterSunset);

  // Hebrew inputs (kept both as numbers and editable text strings so typing never jumps or crashes)
  const [hebrewDay, setHebrewDay] = useState<number>(initialDraft.hebrewDay);
  const [hebrewDayText, setHebrewDayText] = useState<string>(String(initialDraft.hebrewDay));
  const [hebrewMonth, setHebrewMonth] = useState<string>(initialDraft.hebrewMonth);
  const [hebrewYear, setHebrewYear] = useState<number>(initialDraft.hebrewYear);
  const [hebrewYearText, setHebrewYearText] = useState<string>(String(initialDraft.hebrewYear));

  // Details
  const [custom, setCustom] = useState<MourningCustom>(initialDraft.custom);
  const [deceasedName, setDeceasedName] = useState<string>(initialDraft.deceasedName);
  const [hebrewName, setHebrewName] = useState<string>(initialDraft.hebrewName);
  const [relation, setRelation] = useState<string>(initialDraft.relation);

  // UI state
  const [copied, setCopied] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const [showSaveLocalPrompt, setShowSaveLocalPrompt] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Persist draft in sessionStorage so any browser/webview refresh keeps user state intact
  useEffect(() => {
    try {
      const draft: SavedCalculatorDraft = {
        inputType,
        gregorianDate,
        afterSunset,
        hebrewDay,
        hebrewMonth,
        hebrewYear,
        custom,
        deceasedName,
        hebrewName,
        relation,
      };
      sessionStorage.setItem(CALC_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [
    inputType,
    gregorianDate,
    afterSunset,
    hebrewDay,
    hebrewMonth,
    hebrewYear,
    custom,
    deceasedName,
    hebrewName,
    relation,
  ]);

  // Synchronize fields when switching between Gregorian and Hebrew modes
  const handleSwitchInputType = (targetMode: 'gregorian' | 'hebrew') => {
    if (targetMode === inputType) return;

    if (targetMode === 'hebrew') {
      const converted = convertGregorianToHebrewFields(gregorianDate, afterSunset);
      setHebrewDay(converted.hebrewDay);
      setHebrewDayText(String(converted.hebrewDay));
      setHebrewMonth(converted.hebrewMonth);
      setHebrewYear(converted.hebrewYear);
      setHebrewYearText(String(converted.hebrewYear));
      setInputType('hebrew');
    } else {
      const converted = convertHebrewToGregorianFields(hebrewDay, hebrewMonth, hebrewYear);
      setGregorianDate(converted.gregorianDateStr);
      setAfterSunset(false);
      setInputType('gregorian');
    }
  };

  // Safe handlers for Hebrew Day & Year text inputs so user can backspace freely without crashing
  const handleHebrewDayChange = (raw: string) => {
    setHebrewDayText(raw);
    const num = parseInt(raw, 10);
    if (Number.isFinite(num) && num >= 1 && num <= 30) {
      setHebrewDay(num);
    }
  };

  const handleHebrewDayBlur = () => {
    const num = parseInt(hebrewDayText, 10);
    const clamped = Number.isFinite(num) ? Math.min(30, Math.max(1, num)) : hebrewDay || 15;
    setHebrewDay(clamped);
    setHebrewDayText(String(clamped));
  };

  const handleStepHebrewDay = (delta: number) => {
    const next = Math.min(30, Math.max(1, (hebrewDay || 1) + delta));
    setHebrewDay(next);
    setHebrewDayText(String(next));
  };

  const handleHebrewYearChange = (raw: string) => {
    setHebrewYearText(raw);
    const num = parseInt(raw, 10);
    // Only update live calculation when the user has typed a valid 4-digit Hebrew year
    if (Number.isFinite(num) && num >= 5000 && num <= 6000) {
      setHebrewYear(num);
    }
  };

  const handleHebrewYearBlur = () => {
    const num = parseInt(hebrewYearText, 10);
    const clamped =
      Number.isFinite(num) && num >= 5000 && num <= 6000 ? num : hebrewYear || 5786;
    setHebrewYear(clamped);
    setHebrewYearText(String(clamped));
  };

  const handleStepHebrewYear = (delta: number) => {
    const next = Math.min(6000, Math.max(5000, (hebrewYear || 5786) + delta));
    setHebrewYear(next);
    setHebrewYearText(String(next));
  };

  // Calculate timeline reactively with complete error safety
  const calculation: CalculationResult = useMemo(() => {
    const input: CalculatorInput = {
      inputType,
      gregorianDate,
      afterSunset,
      hebrewDay: Number(hebrewDay) || 15,
      hebrewMonth: hebrewMonth || 'Tishrei',
      hebrewYear: Number(hebrewYear) || 5786,
      custom,
      deceasedName,
      hebrewName,
      relation,
    };
    return calculateKaddishTimeline(input);
  }, [
    inputType,
    gregorianDate,
    afterSunset,
    hebrewDay,
    hebrewMonth,
    hebrewYear,
    custom,
    deceasedName,
    hebrewName,
    relation,
  ]);

  if (!isOpen) return null;

  const handleSaveToAppList = () => {
    const firstYahrzeit = calculation.upcomingYahrzeits[0];
    onSaveHazkara({
      name: deceasedName.trim() || 'Familiar',
      hebrewName: hebrewName.trim() || undefined,
      dateGregorian: calculation.deathGregorianFormatted,
      dateHebrew: calculation.deathHebrewFormatted,
      relation: relation.trim() || undefined,
      notes: `Yurzaid: Comienza al atardecer del ${firstYahrzeit?.startDateEveFormatted || ''}. Costumbre: ${
        custom === 'eleven_months'
          ? '11 Meses Yatom + Mes 12 Derabanán'
          : custom === 'sephardic_twelve'
          ? '12 Meses Sefaradí'
          : '30 Días (Sheloshim)'
      }`,
    });

    try {
      const existingMemorials = loadFamilyMemorials();
      const nameKey = (deceasedName.trim() || 'Familiar').toLowerCase();
      const exists = existingMemorials.some((m) => m.name.toLowerCase().trim() === nameKey);

      if (!exists) {
        const newItem: FamilyMemorialItem = {
          id: `calc-${Date.now()}`,
          name: deceasedName.trim() || 'Familiar',
          hebrewName: hebrewName.trim() || undefined,
          relationship: 'other',
          inputType: inputType,
          gregorianDate:
            inputType === 'gregorian' ? calculation.deathGregorianISO : undefined,
          afterSunset: afterSunset,
          hebrewDay: inputType === 'hebrew' ? calculation.hebrewDay : undefined,
          hebrewMonth: inputType === 'hebrew' ? calculation.hebrewMonth : undefined,
          hebrewYear: inputType === 'hebrew' ? calculation.hebrewYear : undefined,
          notes: `Calculado en Sidur: ${calculation.deathHebrewFormatted}`,
          createdAt: new Date().toISOString(),
        };
        saveFamilyMemorials([...existingMemorials, newItem]);
      }
    } catch {
      // ignore
    }

    setSavedLocally(true);
    setStatusMessage({
      type: 'success',
      text: '¡Guardado en tu lista de Hazkarot y Calendario de Familiares de la App!',
    });
    setTimeout(() => setSavedLocally(false), 3000);
  };

  const handleCopyTimeline = () => {
    let text = `📅 CRONOGRAMA HALÁJICO DE KADISH Y YURZAID\n`;
    text += `Para: ${deceasedName || 'Familiar'} ${hebrewName ? `(${hebrewName})` : ''}\n`;
    text += `Fecha de fallecimiento: ${calculation.deathGregorianFormatted} (Gregoriano)\n`;
    text += `Fecha Hebrea: ${calculation.deathHebrewFormatted} ${
      calculation.afterSunsetApplied ? '[Ocurrido tras el anochecer]' : ''
    }\n`;
    text += `Costumbre: ${
      custom === 'eleven_months'
        ? '11 Meses Kadish Yatom + Mes 12 sólo Kadish Derabanán'
        : custom === 'sephardic_twelve'
        ? '12 Meses según costumbre Sefaradí'
        : '30 Días (Sheloshim)'
    }\n\n`;

    text += `--- HITOS DEL PERÍODO DE DUELO Y KADISH ---\n`;
    calculation.milestones.forEach((m, idx) => {
      text += `\n[${idx + 1}] ${m.title} (${m.hebrewTitle})\n`;
      text += `• Fecha: ${m.gregorianFormatted} | ${m.hebrewFormatted}\n`;
      text += `• Rezo de corte: ${m.serviceMilestone}\n`;
      text += `• Instrucción: ${m.actionRequired}\n`;
    });

    text += `\n--- PRÓXIMOS ANIVERSARIOS (YURZAID / YAHRZEIT) ---\n`;
    calculation.upcomingYahrzeits.forEach((y) => {
      text += `\n🕯️ ${y.yearNumber}º Año (Año Hebreo ${y.hebrewYearFormatted}):\n`;
      text += `• ${y.instructions}\n`;
    });

    text += `\nGenerado con la aplicación Kadish y Yurzaid.`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadICS = () => {
    try {
      const firstY = calculation.upcomingYahrzeits[0];
      if (!firstY) return;
      const startISO = toSafeISODateString(firstY.dayDate).replace(/-/g, '');
      const nextDay = new Date(firstY.dayDate.getTime() + 24 * 60 * 60 * 1000);
      const endISO = toSafeISODateString(nextDay).replace(/-/g, '');

      const summary = `🕯️ Yurzaid de ${deceasedName || 'Familiar'} (${calculation.deathHebrewFormatted})`;
      const desc = firstY.instructions.replace(/\n/g, '\\n');

      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Kadish y Yurzaid//Calculadora Halajica//ES',
        'BEGIN:VEVENT',
        `UID:yurzaid-${Date.now()}@kadish-yurzaid`,
        `DTSTAMP:${startISO}T090000Z`,
        `DTSTART;VALUE=DATE:${startISO}`,
        `DTEND;VALUE=DATE:${endISO}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${desc}`,
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Yurzaid_${(deceasedName || 'Familiar').replace(/\s+/g, '_')}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: 'Archivo de calendario (.ics) descargado. Ábrelo para añadirlo a Google Calendar, Apple Calendar o Outlook.',
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'No se pudo generar el archivo de calendario.',
      });
    }
  };

  // Schedule in Google Calendar WITHOUT closing the calculator modal
  const handleScheduleInCalendar = async () => {
    setIsScheduling(true);
    setStatusMessage(null);
    try {
      if (!googleUser || !googleToken) {
        const authRes = await signInWithGoogle();
        if (!authRes) {
          setIsScheduling(false);
          return;
        }
      }

      const firstY = calculation.upcomingYahrzeits[0];
      if (firstY) {
        const dateStr = toSafeISODateString(firstY.dayDate);
        await createCalendarEvent({
          summary: `🕯️ Yurzaid de ${deceasedName || 'Familiar'} (${calculation.deathHebrewFormatted})`,
          description: `${firstY.instructions}\n\nGenerado desde Kadish y Yurzaid.`,
          startDate: dateStr,
          recurrenceAnnual: true,
        });
        setStatusMessage({
          type: 'success',
          text: '¡Yurzaid agendado con éxito en tu Google Calendar con repetición anual!',
        });
        setShowSaveLocalPrompt(true);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text:
          err.message ||
          'No se pudo conectar con Google Calendar. Puedes usar el botón "Descargar .ics" para agregarlo a tu calendario.',
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-stone-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-amber-50/70 dark:bg-amber-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Calculadora de Tiempo de Kadish y Yurzaid
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Conversión exacta entre Calendario Gregoriano y Hebreo • 11 meses, mes 12 y aniversario anual
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            title="Cerrar calculadora"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center justify-between ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
              }`}
            >
              <span>{statusMessage.text}</span>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form Card */}
          <div
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 space-y-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-700/50 pb-2.5">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
                <span>1. Selecciona el Tipo de Calendario de Entrada</span>
              </span>

              {/* Mode switch (Gregorian vs Hebrew) - Synchronizes date on toggle */}
              <div className="flex items-center p-0.5 bg-stone-200 dark:bg-stone-700 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleSwitchInputType('gregorian')}
                  className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                    inputType === 'gregorian'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-stone-700 dark:text-stone-300 hover:text-stone-900'
                  }`}
                >
                  Fecha Común (Gregoriana)
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchInputType('hebrew')}
                  className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                    inputType === 'hebrew'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-stone-700 dark:text-stone-300 hover:text-stone-900'
                  }`}
                >
                  Fecha Calendario Hebreo
                </button>
              </div>
            </div>

            {/* Inputs based on selection */}
            {inputType === 'gregorian' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Fecha en el calendario común (Gregoriano):
                    </label>
                    <input
                      type="date"
                      value={gregorianDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGregorianDate(val);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
                    />
                  </div>

                  {/* Sunset checkbox */}
                  <div className="flex items-center pt-1 sm:pt-5">
                    <label className="flex items-start gap-2.5 text-xs text-stone-800 dark:text-stone-200 cursor-pointer select-none bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 w-full">
                      <input
                        type="checkbox"
                        checked={afterSunset}
                        onChange={(e) => setAfterSunset(e.target.checked)}
                        className="mt-0.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1">
                          <Moon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Ocurrió después de la puesta del sol (Anochecer)</span>
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          En la ley judía el nuevo día comienza al atardecer (pasa al siguiente día hebreo).
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Hebrew Day with Steppers */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Día del mes hebreo (1-30):
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStepHebrewDay(-1)}
                      className="p-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 shrink-0"
                      title="Día anterior"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={hebrewDayText}
                      onChange={(e) => handleHebrewDayChange(e.target.value)}
                      onBlur={handleHebrewDayBlur}
                      className="w-full px-2.5 py-2 text-xs text-center font-bold tabular-nums rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepHebrewDay(1)}
                      className="p-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 shrink-0"
                      title="Día siguiente"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Hebrew Month */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Mes hebreo:
                  </label>
                  <select
                    value={hebrewMonth}
                    onChange={(e) => setHebrewMonth(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {HEBREW_MONTHS_LIST.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nameEs}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hebrew Year with Steppers */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Año hebreo (ej. 5786):
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStepHebrewYear(-1)}
                      className="p-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 shrink-0"
                      title="Año anterior"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={hebrewYearText}
                      onChange={(e) => handleHebrewYearChange(e.target.value)}
                      onBlur={handleHebrewYearBlur}
                      className="w-full px-2.5 py-2 text-xs text-center font-bold tabular-nums rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepHebrewYear(1)}
                      className="p-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 shrink-0"
                      title="Año siguiente"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Custom / Minhag selection */}
            <div className="pt-2 border-t border-stone-200 dark:border-stone-700/50 space-y-2">
              <label className="block text-xs font-bold text-stone-900 dark:text-stone-100">
                2. Costumbre Comunitaria (Minhag de Duelo):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCustom('eleven_months')}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                    custom === 'eleven_months'
                      ? 'bg-amber-500/15 border-amber-600 text-amber-950 dark:text-amber-100 font-bold ring-1 ring-amber-500/40'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <div className="font-bold">11 Meses Yatom + Mes 12 Derabanán</div>
                  <div className="text-[11px] font-normal text-stone-500 mt-0.5">
                    11 meses de Kadish Yatom. En el mes 12 se dice exclusivamente Kadish Derabanán tras estudiar Torá.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCustom('sephardic_twelve')}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                    custom === 'sephardic_twelve'
                      ? 'bg-amber-500/15 border-amber-600 text-amber-950 dark:text-amber-100 font-bold ring-1 ring-amber-500/40'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <div className="font-bold">Costumbre Sefaradí (12 Meses)</div>
                  <div className="text-[11px] font-normal text-stone-500 mt-0.5">
                    Pausa de 1 semana en el mes 11 y continuación del Kadish hasta los 12 meses completos (Ben Ish Jai).
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCustom('thirty_days')}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                    custom === 'thirty_days'
                      ? 'bg-amber-500/15 border-amber-600 text-amber-950 dark:text-amber-100 font-bold ring-1 ring-amber-500/40'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <div className="font-bold">30 Días (Sheloshim)</div>
                  <div className="text-[11px] font-normal text-stone-500 mt-0.5">
                    Para parientes que no son padre o madre (hermano/a, cónyuge, hijo/a).
                  </div>
                </button>
              </div>
            </div>

            {/* Names & relationship */}
            <div className="pt-2 border-t border-stone-200 dark:border-stone-700/50 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="Nombre del familiar (ej. David)"
                value={deceasedName}
                onChange={(e) => setDeceasedName(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="text"
                placeholder="Nombre hebreo (ej: דוד בן שרה)"
                value={hebrewName}
                onChange={(e) => setHebrewName(e.target.value)}
                dir="rtl"
                className="px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif"
              />
              <input
                type="text"
                placeholder="Parentesco (ej. Padre, Madre)"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Computed Base Hebrew & Gregorian Date Equivalence Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Equivalencia Entre Calendarios Calculada:
              </div>
              <div className="text-sm font-bold text-stone-900 dark:text-stone-100 flex flex-wrap items-center gap-2 mt-0.5">
                <span className="tabular-nums">{calculation.deathGregorianFormatted}</span>
                <span className="text-amber-700 dark:text-amber-400">↔</span>
                <span className="font-serif text-amber-800 dark:text-amber-300" dir="rtl">
                  {calculation.deathHebrewFormatted}
                </span>
              </div>
              {calculation.afterSunsetApplied && (
                <div className="text-[11px] text-amber-800 dark:text-amber-400 font-medium mt-0.5">
                  🌙 Calculado para el siguiente día hebreo por haber ocurrido tras la caída del sol.
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveToAppList}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                  savedLocally
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {savedLocally ? <Check className="w-3.5 h-3.5" /> : <HardDrive className="w-3.5 h-3.5" />}
                <span>{savedLocally ? '¡Guardado en la App!' : 'Guardar en Mis Hazkarot'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyTimeline}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100"
                title="Copiar cronograma al portapapeles"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Timeline of Milestones */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Hitos y Fechas Clave del Período de Kadish</span>
            </h3>

            <div className="space-y-2.5">
              {calculation.milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 shadow-xs space-y-1.5 hover:border-amber-300 dark:hover:border-amber-700/60 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center text-[11px] font-bold tabular-nums">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                        {m.title}
                      </span>
                    </div>
                    <span className="font-serif font-bold text-xs text-amber-800 dark:text-amber-400" dir="rtl">
                      {m.hebrewTitle}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-stone-800/40 p-2.5 rounded-lg border border-stone-200/60 dark:border-stone-700/40">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">
                        Fecha exacta:
                      </span>
                      <div className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                        {m.gregorianFormatted}
                      </div>
                      <div className="text-[11px] font-serif text-amber-800 dark:text-amber-300" dir="rtl">
                        {m.hebrewFormatted}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">
                        Rezo de corte o hito:
                      </span>
                      <div className="font-bold text-amber-900 dark:text-amber-200">
                        {m.serviceMilestone}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed pt-1">
                    <p>{m.description}</p>
                    <p className="mt-1 font-semibold text-amber-950 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                      💡 <strong>Norma halájica:</strong> {m.actionRequired}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Yahrzeits / Yurzaid section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Próximos Aniversarios de Yurzaid / Yahrzeit (Calendario Hebreo)</span>
              </span>
              <span className="text-[11px] font-normal text-stone-500">
                Se computa por la fecha hebrea
              </span>
            </h3>

            <div className="space-y-2.5">
              {calculation.upcomingYahrzeits.map((y) => (
                <div
                  key={y.yearNumber}
                  className="p-3.5 rounded-xl border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                      <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 tabular-nums">
                        {y.yearNumber}º Aniversario de Yurzaid (Año {y.hebrewYearFormatted} / {y.hebrewYear})
                      </span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold">
                      {y.hebrewFormatted}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/90 dark:bg-stone-900 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                    <div className="font-bold text-stone-900 dark:text-stone-100">
                      🕯️ Cuándo comienza y termina:
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                      {y.instructions}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isScheduling}
              onClick={handleScheduleInCalendar}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-bold shadow-2xs transition-colors"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>
                {isScheduling ? 'Conectando...' : 'Agendar Yurzaid en Google Calendar'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadICS}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors"
              title="Descargar archivo .ics para Apple Calendar, Google Calendar o CalJ"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Descargar .ics</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Automatic Prompt to Save in Local App Calendar */}
      {showSaveLocalPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setShowSaveLocalPrompt(false);
          }}
        >
          <div
            className="bg-white dark:bg-stone-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl p-5 sm:p-6 max-w-md w-full space-y-4 text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center mx-auto">
              <CalendarCheck className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                ¿Guardar también en el Calendario Local de la App?
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                Ya fue agendado en tu Google Calendar. ¿Deseas agregar a <strong className="text-amber-800 dark:text-amber-300">{deceasedName || 'Familiar'}</strong> a tu <strong>Calendario Local de Aniversarios Familiares</strong> en la App para recibir avisos y realizar seguimiento directo?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveLocalPrompt(false)}
                className="w-full sm:w-1/2 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-semibold text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Solo en Google Calendar
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSaveToAppList();
                  setShowSaveLocalPrompt(false);
                  setStatusMessage({
                    type: 'success',
                    text: '¡Aniversario guardado con éxito tanto en Google Calendar como en el Calendario Local de la App!',
                  });
                }}
                className="w-full sm:w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 font-bold text-xs text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Sí, Guardar en Ambos</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
