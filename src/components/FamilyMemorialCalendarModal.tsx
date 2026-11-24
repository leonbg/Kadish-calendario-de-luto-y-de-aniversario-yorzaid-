import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar,
  Calendar as CalendarIcon,
  Flame,
  Plus,
  Trash2,
  Edit2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  User,
  Users,
  Smile,
  Crown,
  Sparkles,
  UserCheck,
  HeartHandshake,
  HardDrive,
  Copy,
  Check,
  X,
  Share2,
  Info,
  CalendarDays,
  AlertCircle,
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  FileCode,
  Bell,
  BellRing,
  Mail,
  Volume2,
  VolumeX,
  Send,
  Smartphone,
  CheckCheck,
} from 'lucide-react';
import {
  FamilyMemorialItem,
  RelativeRelationship,
  RELATIVE_CATEGORIES,
  UpcomingYahrzeitCalculation,
  YahrzeitNotificationSettings,
  ActiveYahrzeitAlert,
} from '../types/familyMemorial';
import {
  loadFamilyMemorials,
  saveFamilyMemorials,
  calculateNextYahrzeit,
  calculateYahrzeitForSpecificYear,
  getRelationshipLabel,
  getRelationshipHebrewLabel,
  exportToICS,
  exportToJSON,
  exportToCSV,
  parseImportFile,
} from '../utils/familyMemorialUtils';
import {
  loadNotificationSettings,
  saveNotificationSettings,
  requestDeviceNotificationPermission,
  getNotificationPermissionStatus,
  triggerDeviceNotification,
  sendTestNotification,
  composeYahrzeitEmailLink,
  getActiveYahrzeitAlerts,
} from '../utils/yahrzeitNotificationService';
import {
  HEBREW_MONTHS_LIST,
  formatSpanishDate,
  convertGregorianToHebrewFields,
  convertHebrewToGregorianFields,
  toSafeISODateString,
} from '../utils/kaddishCalculator';
import { createCalendarEvent, signInWithGoogle } from '../utils/googleWorkspace';
import { User as FirebaseUser } from 'firebase/auth';

interface FamilyMemorialCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: FirebaseUser | null;
  googleToken: string | null;
  onOpenWorkspace: () => void;
  onSelectKaddishPrayer?: (type: 'yatom' | 'derabanan') => void;
}

export const FamilyMemorialCalendarModal: React.FC<FamilyMemorialCalendarModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  googleToken,
  onOpenWorkspace,
  onSelectKaddishPrayer,
}) => {
  // Memorial List State
  const [relatives, setRelatives] = useState<FamilyMemorialItem[]>(() => loadFamilyMemorials());

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'upcoming_30' | 'mini_calendar' | 'all_relatives' | 'notifications'
  >('upcoming_30');

  // Filter in list tab
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('Todos');

  // Notification Settings & Email State
  const [notificationSettings, setNotificationSettings] = useState<YahrzeitNotificationSettings>(() =>
    loadNotificationSettings()
  );
  const [emailInput, setEmailInput] = useState(() => notificationSettings.userEmail || '');
  const [isEmailSaved, setIsEmailSaved] = useState(false);
  const [devicePermission, setDevicePermission] = useState<'granted' | 'denied' | 'default' | 'unsupported'>(
    () => getNotificationPermissionStatus()
  );
  const [testNotificationStatus, setTestNotificationStatus] = useState<string | null>(null);

  // Calendar month state
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | null>(null);

  // Add / Edit Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; name: string } | null>(
    null
  );

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formHebrewName, setFormHebrewName] = useState('');
  const [formRelationship, setFormRelationship] = useState<RelativeRelationship>('father');
  const [formInputType, setFormInputType] = useState<'gregorian' | 'hebrew'>('gregorian');
  const [formGregorianDate, setFormGregorianDate] = useState(() => toSafeISODateString(new Date()));
  const [formAfterSunset, setFormAfterSunset] = useState(false);
  const [formHebrewDay, setFormHebrewDay] = useState(15);
  const [formHebrewDayText, setFormHebrewDayText] = useState('15');
  const [formHebrewMonth, setFormHebrewMonth] = useState('Tishrei');
  const [formHebrewYear, setFormHebrewYear] = useState(5780);
  const [formHebrewYearText, setFormHebrewYearText] = useState('5780');
  const [formNotes, setFormNotes] = useState('');

  // Export Menu Open State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Import Handler (CalJ / .ics / .json / .csv)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const { items: newItems, importedCount } = await parseImportFile(text, file.name);

      if (importedCount === 0) {
        setStatusMessage({
          type: 'error',
          text: 'No se encontraron registros de aniversarios válidos en el archivo seleccionado.',
        });
        return;
      }

      // Merge with existing relatives (avoiding duplicates by name)
      setRelatives((prev) => {
        const existingNames = new Set(prev.map((r) => r.name.toLowerCase().trim()));
        const uniqueNew = newItems.filter(
          (item) => !existingNames.has(item.name.toLowerCase().trim())
        );

        const updated = [...prev, ...uniqueNew];
        saveFamilyMemorials(updated);
        return updated;
      });

      setStatusMessage({
        type: 'success',
        text: `¡Importación exitosa! Se procesaron ${importedCount} aniversarios desde "${file.name}" (compatible con CalJ).`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error al procesar el archivo de importación.',
      });
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Notifications / Feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Save changes to storage whenever relatives change
  useEffect(() => {
    saveFamilyMemorials(relatives);
  }, [relatives]);

  // Compute all upcoming yahrzeits sorted by proximity
  const allCalculations: UpcomingYahrzeitCalculation[] = useMemo(() => {
    const today = new Date();
    return relatives
      .map((rel) => calculateNextYahrzeit(rel, today))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [relatives]);

  // Yahrzeits calculated specifically for the calendar year being viewed (e.g. 2025, 2026, 2027...)
  const viewedYearCalculations = useMemo(() => {
    const targetYear = currentCalendarDate.getFullYear();
    return relatives.map((rel) => calculateYahrzeitForSpecificYear(rel, targetYear));
  }, [relatives, currentCalendarDate]);

  // Upcoming within next 30 days
  const next30DaysCalculations = useMemo(() => {
    return allCalculations.filter((c) => c.isWithin30Days);
  }, [allCalculations]);

  // Upcoming within current month
  const currentMonthCalculations = useMemo(() => {
    return allCalculations.filter((c) => c.isWithinMonth);
  }, [allCalculations]);

  // Active Yahrzeit Alerts (15 days, 7 days, month start, eve/today)
  const activeAlerts: ActiveYahrzeitAlert[] = useMemo(() => {
    return getActiveYahrzeitAlerts(relatives, notificationSettings, new Date());
  }, [relatives, notificationSettings]);

  const handleSaveEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = emailInput.trim();
    if (cleanEmail && !cleanEmail.includes('@')) {
      setStatusMessage({
        type: 'error',
        text: 'Por favor ingresa un correo electrónico válido (ej. nombre@dominio.com).',
      });
      return;
    }
    const updated: YahrzeitNotificationSettings = {
      ...notificationSettings,
      userEmail: cleanEmail,
      enableEmailNotifications: Boolean(cleanEmail),
    };
    setNotificationSettings(updated);
    saveNotificationSettings(updated);
    setIsEmailSaved(true);
    setTimeout(() => setIsEmailSaved(false), 3000);
    setStatusMessage({
      type: 'success',
      text: cleanEmail
        ? `¡Correo "${cleanEmail}" guardado exitosamente para alertas de Yurzaid!`
        : 'Preferencia de correo actualizada.',
    });
  };

  const handleToggleNotificationSetting = (key: keyof YahrzeitNotificationSettings) => {
    setNotificationSettings((prev) => {
      const val = !prev[key];
      const updated = { ...prev, [key]: val };
      saveNotificationSettings(updated);
      return updated;
    });
  };

  const handleRequestPermission = async () => {
    const granted = await requestDeviceNotificationPermission();
    const status = getNotificationPermissionStatus();
    setDevicePermission(status);
    if (granted) {
      const updated = { ...notificationSettings, enablePhoneNotifications: true };
      setNotificationSettings(updated);
      saveNotificationSettings(updated);
      setStatusMessage({
        type: 'success',
        text: '¡Permiso de notificaciones activado con éxito en tu teléfono / navegador!',
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: 'No se pudo activar el permiso. Por favor habilita las notificaciones en la barra de direcciones o configuración de tu navegador.',
      });
    }
  };

  const handleSendTestPhoneNotification = async () => {
    setTestNotificationStatus('Enviando...');
    const ok = await sendTestNotification(notificationSettings.soundEnabled);
    if (ok) {
      setTestNotificationStatus('¡Enviada con éxito!');
      setStatusMessage({
        type: 'success',
        text: '🔔 Alerta de prueba enviada a tu dispositivo con campanada devocional.',
      });
    } else {
      setTestNotificationStatus('No se pudo enviar. Revisa permisos.');
      setStatusMessage({
        type: 'error',
        text: 'No se pudo enviar la alerta de prueba. Verifica que las notificaciones estén permitidas en el navegador.',
      });
    }
    setTimeout(() => setTestNotificationStatus(null), 3500);
  };

  if (!isOpen) return null;

  // Calendar Navigation Handlers
  const handlePrevMonth = () => {
    setCurrentCalendarDate(
      new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1)
    );
    setSelectedCalendarDay(null);
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(
      new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1)
    );
    setSelectedCalendarDay(null);
  };

  // Open Form for Adding New Relative
  const handleOpenAddForm = () => {
    const todayStr = toSafeISODateString(new Date());
    const heb = convertGregorianToHebrewFields(todayStr, false);
    setEditingId(null);
    setFormName('');
    setFormHebrewName('');
    setFormRelationship('father');
    setFormInputType('gregorian');
    setFormGregorianDate(todayStr);
    setFormAfterSunset(false);
    setFormHebrewDay(heb.hebrewDay);
    setFormHebrewDayText(String(heb.hebrewDay));
    setFormHebrewMonth(heb.hebrewMonth);
    setFormHebrewYear(heb.hebrewYear);
    setFormHebrewYearText(String(heb.hebrewYear));
    setFormNotes('');
    setIsFormOpen(true);
  };

  // Open Form for Editing Existing Relative
  const handleOpenEditForm = (item: FamilyMemorialItem) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormHebrewName(item.hebrewName || '');
    setFormRelationship(item.relationship);
    setFormInputType(item.inputType);
    if (item.gregorianDate) setFormGregorianDate(item.gregorianDate);
    setFormAfterSunset(!!item.afterSunset);
    if (item.hebrewDay) {
      setFormHebrewDay(item.hebrewDay);
      setFormHebrewDayText(String(item.hebrewDay));
    }
    if (item.hebrewMonth) setFormHebrewMonth(item.hebrewMonth);
    if (item.hebrewYear) {
      setFormHebrewYear(item.hebrewYear);
      setFormHebrewYearText(String(item.hebrewYear));
    }
    setFormNotes(item.notes || '');
    setIsFormOpen(true);
  };

  // Switch between Gregorian and Hebrew while converting the selected date automatically
  const handleSwitchFormInputType = (targetType: 'gregorian' | 'hebrew') => {
    if (targetType === formInputType) return;
    if (targetType === 'hebrew') {
      const converted = convertGregorianToHebrewFields(formGregorianDate, formAfterSunset);
      setFormHebrewDay(converted.hebrewDay);
      setFormHebrewDayText(String(converted.hebrewDay));
      setFormHebrewMonth(converted.hebrewMonth);
      setFormHebrewYear(converted.hebrewYear);
      setFormHebrewYearText(String(converted.hebrewYear));
      setFormInputType('hebrew');
    } else {
      const converted = convertHebrewToGregorianFields(
        formHebrewDay,
        formHebrewMonth,
        formHebrewYear
      );
      setFormGregorianDate(converted.gregorianDateStr);
      setFormAfterSunset(false);
      setFormInputType('gregorian');
    }
  };

  // Request Delete Relative (Triggers custom confirm modal)
  const handleDeleteRelative = (id: string, name: string) => {
    setDeleteConfirmTarget({ id, name });
  };

  // Perform Delete after user confirmation
  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;
    const { id, name } = deleteConfirmTarget;

    setRelatives((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveFamilyMemorials(updated);
      return updated;
    });

    setStatusMessage({
      type: 'success',
      text: `El registro de "${name}" fue eliminado del calendario.`,
    });
    setDeleteConfirmTarget(null);
  };

  // Save Relative from Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Por favor ingresa el nombre del familiar antes de guardar.',
      });
      return;
    }

    const newItem: FamilyMemorialItem = {
      id: editingId || Date.now().toString(),
      name: formName.trim(),
      hebrewName: formHebrewName.trim() || undefined,
      relationship: formRelationship,
      inputType: formInputType,
      gregorianDate: formInputType === 'gregorian' ? formGregorianDate : undefined,
      afterSunset: formInputType === 'gregorian' ? formAfterSunset : undefined,
      hebrewDay: formInputType === 'hebrew' ? Number(formHebrewDay) || 15 : undefined,
      hebrewMonth: formInputType === 'hebrew' ? formHebrewMonth : undefined,
      hebrewYear: formInputType === 'hebrew' ? Number(formHebrewYear) || 5780 : undefined,
      notes: formNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    if (editingId) {
      setRelatives((prev) => prev.map((r) => (r.id === editingId ? newItem : r)));
      setStatusMessage({ type: 'success', text: `Datos de ${newItem.name} actualizados.` });
    } else {
      setRelatives((prev) => [newItem, ...prev]);
      setStatusMessage({ type: 'success', text: `${newItem.name} agregado a tu calendario.` });
    }

    setIsFormOpen(false);
  };

  // Copy Yahrzeit info to clipboard
  const handleCopyYahrzeit = (calc: UpcomingYahrzeitCalculation) => {
    const relLabel = getRelationshipLabel(calc.relative.relationship);
    const text = `🕯️ RECORDATORIO DE YURZAID / YAHRZEIT (${relLabel})\n` +
      `Para: ${calc.relative.name} ${calc.relative.hebrewName ? `(${calc.relative.hebrewName})` : ''}\n` +
      `Fecha hebrea: ${calc.hebrewDateString}\n` +
      `Próximo Aniversario (${calc.calculatedYearCount}º Año):\n` +
      `• Comienza: Al atardecer del ${calc.nextEveFormatted} (Encender vela de 24 horas y Kadish en Arbit)\n` +
      `• Concluye: Al anochecer del ${calc.nextDayFormatted} (Kadish en Shajarit y Minjá)\n` +
      `Generado desde Kadish y Yurzaid.`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(calc.relative.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Schedule in Google Calendar without closing the modal
  const handleScheduleGoogleCalendar = async (calc: UpcomingYahrzeitCalculation) => {
    try {
      if (!googleUser || !googleToken) {
        const authRes = await signInWithGoogle();
        if (!authRes) return;
      }

      const dateStr = toSafeISODateString(calc.nextDayDate);
      const relLabel = getRelationshipLabel(calc.relative.relationship);
      await createCalendarEvent({
        summary: `🕯️ Yurzaid de ${calc.relative.name} (${relLabel}) - ${calc.hebrewDateString}`,
        description: `${calc.instructions}\n\nNotas: ${calc.relative.notes || 'Ninguna'}\n\nGenerado desde Kadish y Yurzaid.`,
        startDate: dateStr,
        recurrenceAnnual: true,
      });

      setStatusMessage({
        type: 'success',
        text: `¡Yurzaid de ${calc.relative.name} agendado en Google Calendar con repetición anual!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error al agendar en Google Calendar.',
      });
    }
  };

  // Generate days array for Mini Calendar view
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-stone-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-amber-500/10 dark:bg-amber-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>Calendario de Aniversarios de Familiares (Yurzaid)</span>
                {next30DaysCalculations.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-2xs">
                    {next30DaysCalculations.length} en 30 días
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Seguimiento de padres, abuelos, tíos, hermanos e hijos sincronizado con el calendario hebreo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden File Input for CalJ / iCal / JSON / CSV Import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".ics,.json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Import Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold shadow-2xs transition-colors"
              title="Importar archivo de CalJ, .ics, .json o .csv"
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Importar CalJ</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold shadow-2xs transition-colors"
                title="Exportar aniversarios para CalJ, Google Calendar u otras apps"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              {isExportMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-56 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100 text-xs"
                  onClick={() => setIsExportMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => exportToICS(relatives)}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 text-stone-800 dark:text-stone-200 font-semibold"
                  >
                    <CalendarDays className="w-4 h-4 text-amber-600" />
                    <div>
                      <div>Formato iCal / CalJ (.ics)</div>
                      <div className="text-[10px] text-stone-500 font-normal">
                        Para CalJ, Google Cal, Apple Cal
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportToJSON(relatives)}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 text-stone-800 dark:text-stone-200 font-semibold"
                  >
                    <FileJson className="w-4 h-4 text-amber-600" />
                    <div>
                      <div>Respaldo JSON (.json)</div>
                      <div className="text-[10px] text-stone-500 font-normal">
                        Respaldo completo del Sidur
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportToCSV(relatives)}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-2 text-stone-800 dark:text-stone-200 font-semibold"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                    <div>
                      <div>Planilla Excel / CSV (.csv)</div>
                      <div className="text-[10px] text-stone-500 font-normal">
                        Para hojas de cálculo
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Agregar Familiar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/60 px-4 pt-2 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upcoming_30');
              setIsFormOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'upcoming_30'
                ? 'bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-300 border-t border-x border-stone-200 dark:border-stone-800 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Próximos 30 Días ({next30DaysCalculations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('mini_calendar');
              setIsFormOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'mini_calendar'
                ? 'bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-300 border-t border-x border-stone-200 dark:border-stone-800 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
            <span>Mini Calendario Mensual</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('all_relatives');
              setIsFormOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'all_relatives'
                ? 'bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-300 border-t border-x border-stone-200 dark:border-stone-800 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span>Todos los Familiares ({relatives.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('notifications');
              setIsFormOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'notifications'
                ? 'bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-300 border-t border-x border-stone-200 dark:border-stone-800 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Notificaciones y Correo</span>
            {activeAlerts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-600 text-white shadow-2xs animate-pulse">
                {activeAlerts.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-stone-700 dark:text-stone-300 flex-1">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-150 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
              }`}
            >
              <span>{statusMessage.text}</span>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ADD / EDIT RELATIVE FORM DRAWER */}
          {isFormOpen && (
            <form
              onSubmit={handleSaveForm}
              className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border-2 border-amber-400 dark:border-amber-700/80 shadow-md space-y-4 animate-in slide-in-from-top-3 duration-200"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300">
                    {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {editingId ? 'Editar Familiar' : 'Agregar Nuevo Familiar'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Name */}
                <div>
                  <label className="block font-semibold text-stone-800 dark:text-stone-200 mb-1">
                    Nombre del familiar *:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. David Cohen"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Hebrew Name */}
                <div>
                  <label className="block font-semibold text-stone-800 dark:text-stone-200 mb-1">
                    Nombre en Hebreo (y de su padre/madre):
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="Ej. דָּוִד בֶּן יוֹסֵף"
                    value={formHebrewName}
                    onChange={(e) => setFormHebrewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-serif focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Relationship Selector */}
                <div>
                  <label className="block font-semibold text-stone-800 dark:text-stone-200 mb-1">
                    Parentesco *:
                  </label>
                  <select
                    value={formRelationship}
                    onChange={(e) => setFormRelationship(e.target.value as RelativeRelationship)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    {RELATIVE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.labelEs} ({cat.hebrewLabel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Input Toggle */}
              <div
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    Fecha de Fallecimiento:
                  </span>
                  <div className="flex items-center p-0.5 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => handleSwitchFormInputType('gregorian')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        formInputType === 'gregorian'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      Fecha Común (Gregoriana)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchFormInputType('hebrew')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        formInputType === 'hebrew'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      Fecha Calendario Hebreo
                    </button>
                  </div>
                </div>

                {formInputType === 'gregorian' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 mb-1 font-semibold">
                        Fecha en el calendario común:
                      </label>
                      <input
                        type="date"
                        value={formGregorianDate}
                        onChange={(e) => setFormGregorianDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 tabular-nums"
                      />
                    </div>
                    <div className="flex items-center pt-2 sm:pt-6">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formAfterSunset}
                          onChange={(e) => setFormAfterSunset(e.target.checked)}
                          className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="font-semibold text-amber-950 dark:text-amber-200">
                          Ocurrió después de la puesta del sol (Anochecer)
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 mb-1 font-semibold">
                        Día hebreo (1-30):
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formHebrewDayText}
                        onChange={(e) => {
                          setFormHebrewDayText(e.target.value);
                          const n = parseInt(e.target.value, 10);
                          if (Number.isFinite(n) && n >= 1 && n <= 30) {
                            setFormHebrewDay(n);
                          }
                        }}
                        onBlur={() => {
                          const n = parseInt(formHebrewDayText, 10);
                          const clamped = Number.isFinite(n) ? Math.min(30, Math.max(1, n)) : 15;
                          setFormHebrewDay(clamped);
                          setFormHebrewDayText(String(clamped));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 tabular-nums font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 mb-1 font-semibold">
                        Mes hebreo:
                      </label>
                      <select
                        value={formHebrewMonth}
                        onChange={(e) => setFormHebrewMonth(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                      >
                        {HEBREW_MONTHS_LIST.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nameEs}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 mb-1 font-semibold">
                        Año hebreo (ej. 5780):
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formHebrewYearText}
                        onChange={(e) => {
                          setFormHebrewYearText(e.target.value);
                          const n = parseInt(e.target.value, 10);
                          if (Number.isFinite(n) && n >= 5000 && n <= 6000) {
                            setFormHebrewYear(n);
                          }
                        }}
                        onBlur={() => {
                          const n = parseInt(formHebrewYearText, 10);
                          const clamped =
                            Number.isFinite(n) && n >= 5000 && n <= 6000 ? n : 5780;
                          setFormHebrewYear(clamped);
                          setFormHebrewYearText(String(clamped));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 tabular-nums font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* Live Equivalence Preview inside Form */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-900 dark:text-amber-300">
                  <span className="font-semibold">Equivalencia calculada:</span>
                  <span className="font-bold tabular-nums">
                    {formInputType === 'gregorian'
                      ? convertGregorianToHebrewFields(formGregorianDate, formAfterSunset).formatted
                      : convertHebrewToGregorianFields(
                          formHebrewDay,
                          formHebrewMonth,
                          formHebrewYear
                        ).formatted}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Notas / Costumbres familiares (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Encender vela de 24h, donar tzedaká, cementerio..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-700 dark:text-stone-300 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs transition-colors"
                >
                  {editingId ? 'Guardar Cambios' : 'Agregar Familiar'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 1: PRÓXIMOS 30 DÍAS */}
          {activeTab === 'upcoming_30' && !isFormOpen && (
            <div className="space-y-4">
              {/* Alert banner for imminent Yurzaid */}
              {next30DaysCalculations.some((c) => c.isToday || c.isTomorrow) && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border-2 border-amber-500/40 flex items-start gap-3 animate-pulse">
                  <Flame className="w-5 h-5 text-amber-600 fill-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                      ¡Atención: Aniversario inminente de fallecimiento!
                    </div>
                    <div className="text-amber-900 dark:text-amber-300 mt-0.5">
                      Recuerda encender la vela de Yurzaid de 24 horas al anochecer y organizar el Minyán para recitar el Kadish en Arbit, Shajarit y Minjá.
                    </div>
                  </div>
                </div>
              )}

              {next30DaysCalculations.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/20 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                    No hay aniversarios de familiares en los próximos 30 días
                  </h4>
                  <p className="text-stone-500 text-xs max-w-md mx-auto">
                    Tus familiares registrados se encuentran protegidos. Puedes revisar la pestaña «Mini Calendario» o agregar nuevos parientes (padres, abuelos, tíos, etc.).
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddForm}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Familiar</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {next30DaysCalculations.map((calc) => {
                    const relLabel = getRelationshipLabel(calc.relative.relationship);
                    const relHeb = getRelationshipHebrewLabel(calc.relative.relationship);

                    return (
                      <div
                        key={calc.relative.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          calc.isToday
                            ? 'bg-amber-500/15 border-amber-600 shadow-md ring-1 ring-amber-500/50'
                            : calc.isTomorrow
                            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700/80'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300">
                              <Flame className="w-4 h-4 fill-amber-500" />
                            </span>
                            <div>
                              <div className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <span>{calc.relative.name}</span>
                                {calc.relative.hebrewName && (
                                  <span className="font-serif text-amber-800 dark:text-amber-400" dir="rtl">
                                    ({calc.relative.hebrewName})
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                                <span className="font-semibold text-amber-900 dark:text-amber-300">
                                  {relLabel}
                                </span>
                                {relHeb && <span className="font-serif">({relHeb})</span>}
                                <span>•</span>
                                <span>{calc.calculatedYearCount}º Aniversario</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {calc.isToday ? (
                              <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[11px] animate-bounce">
                                ¡HOY!
                              </span>
                            ) : calc.isTomorrow ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-600 text-white font-bold text-[11px]">
                                ¡MAÑANA!
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-[11px]">
                                En {calc.daysRemaining} días
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Instructions & Date box */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 my-3 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-200/60 dark:border-stone-700/40 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-stone-500 block">
                              Cuándo Comienza (Víspera):
                            </span>
                            <div className="font-bold text-amber-950 dark:text-amber-200">
                              Atardecer del {calc.nextEveFormatted}
                            </div>
                            <div className="text-[11px] text-stone-500">
                              🕯️ Encender vela de 24 horas y Kadish en Arbit
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-stone-500 block">
                              Día Central del Yurzaid:
                            </span>
                            <div className="font-bold text-stone-900 dark:text-stone-100">
                              {calc.nextDayFormatted}
                            </div>
                            <div className="text-[11px] font-serif text-amber-800 dark:text-amber-300" dir="rtl">
                              {calc.hebrewDateString}
                            </div>
                          </div>
                        </div>

                        {calc.relative.notes && (
                          <div className="text-[11px] text-stone-600 dark:text-stone-300 bg-amber-50/60 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/60 dark:border-amber-800/40 mb-3">
                            📝 <strong>Nota familiar:</strong> {calc.relative.notes}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            {onSelectKaddishPrayer && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectKaddishPrayer('yatom');
                                  onClose();
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-2xs"
                              >
                                Recitar Kadish
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleScheduleGoogleCalendar(calc)}
                              className="px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 font-semibold text-xs hover:bg-amber-50"
                            >
                              Agendar en Calendar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyYahrzeit(calc)}
                              className="px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-stone-100"
                            >
                              {copiedId === calc.relative.id ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> ¡Copiado!
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Copy className="w-3.5 h-3.5" /> Copiar
                                </span>
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditForm(calc.relative)}
                              className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                              title="Editar familiar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRelative(calc.relative.id, calc.relative.name)}
                              className="p-1.5 text-rose-500 hover:text-rose-700"
                              title="Eliminar familiar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MINI CALENDARIO MENSUAL */}
          {activeTab === 'mini_calendar' && !isFormOpen && (
            <div className="space-y-4">
              {/* Calendar Month Selector Header */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                    {monthNames[month]} {year}
                  </h3>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    Haz clic en los días con vela 🕯️ para ver los aniversarios
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-900 shadow-xs">
                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 border-b border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-800/60 text-center font-bold text-[11px] py-2 text-stone-600 dark:text-stone-400">
                  <span>Dom</span>
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mié</span>
                  <span>Jue</span>
                  <span>Vie</span>
                  <span className="text-amber-800 dark:text-amber-300">Shabát</span>
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 auto-rows-fr">
                  {/* Empty cells before month start */}
                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[64px] sm:min-h-[72px] p-1 bg-stone-50/40 dark:bg-stone-950/20 border-b border-r border-stone-100 dark:border-stone-800/60"
                    />
                  ))}

                  {/* Days of month */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const cellDate = new Date(year, month, dayNum);
                    const isToday = cellDate.toDateString() === new Date().toDateString();

                    // Find yahrzeits falling on this exact day (central day or eve)
                    const matchingYahrzeits = viewedYearCalculations.filter((c) => {
                      const isCentralDay =
                        c.nextDayDate.getFullYear() === year &&
                        c.nextDayDate.getMonth() === month &&
                        c.nextDayDate.getDate() === dayNum;

                      const isEveDay =
                        c.nextEveDate.getFullYear() === year &&
                        c.nextEveDate.getMonth() === month &&
                        c.nextEveDate.getDate() === dayNum;

                      return isCentralDay || isEveDay;
                    });

                    const hasYahrzeit = matchingYahrzeits.length > 0;

                    return (
                      <div
                        key={`day-${dayNum}`}
                        onClick={() => {
                          if (hasYahrzeit) {
                            setSelectedCalendarDay(cellDate);
                          }
                        }}
                        className={`min-h-[64px] sm:min-h-[72px] p-1 sm:p-1.5 border-b border-r border-stone-100 dark:border-stone-800/60 transition-all flex flex-col justify-between ${
                          isToday
                            ? 'bg-amber-500/10 font-bold'
                            : hasYahrzeit
                            ? 'bg-amber-100/40 dark:bg-amber-950/30 cursor-pointer hover:bg-amber-200/50'
                            : 'hover:bg-stone-50 dark:hover:bg-stone-800/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs w-5 h-5 flex items-center justify-center rounded-full ${
                              isToday
                                ? 'bg-amber-600 text-white font-bold'
                                : 'text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            {dayNum}
                          </span>
                          {hasYahrzeit && (
                            <span className="text-amber-600 text-[11px]" title="Aniversario Yurzaid">
                              🕯️
                            </span>
                          )}
                        </div>

                        {/* Relative preview badge in cell */}
                        {hasYahrzeit && (
                          <div className="space-y-0.5 mt-1">
                            {matchingYahrzeits.slice(0, 2).map((m) => {
                              const isEve = m.nextEveDate.toDateString() === cellDate.toDateString();
                              return (
                                <div
                                  key={`${m.relative.id}-${isEve ? 'eve' : 'day'}`}
                                  className="truncate text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded bg-amber-600/15 text-amber-900 dark:text-amber-200 border border-amber-500/30"
                                >
                                  {isEve ? '🕯️ ' : ''}{m.relative.name.split(' ')[0]}
                                </div>
                              );
                            })}
                            {matchingYahrzeits.length > 2 && (
                              <div className="text-[9px] text-stone-500 text-center font-bold">
                                +{matchingYahrzeits.length - 2} más
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Day Details Box */}
              {selectedCalendarDay && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                      <span>Aniversarios para el {formatSpanishDate(selectedCalendarDay)}</span>
                    </h4>
                    <button
                      onClick={() => setSelectedCalendarDay(null)}
                      className="p-1 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {viewedYearCalculations
                      .filter(
                        (c) =>
                          c.nextDayDate.toDateString() === selectedCalendarDay.toDateString() ||
                          c.nextEveDate.toDateString() === selectedCalendarDay.toDateString()
                      )
                      .map((calc) => {
                        const isEve = calc.nextEveDate.toDateString() === selectedCalendarDay.toDateString();
                        return (
                          <div
                            key={calc.relative.id}
                            className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-800 text-xs flex flex-wrap items-center justify-between gap-2"
                          >
                            <div>
                              <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <span>{calc.relative.name} ({getRelationshipLabel(calc.relative.relationship)})</span>
                                {isEve ? (
                                  <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold rounded-full">
                                    🕯️ Víspera (Encendido de Vela)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-[10px] bg-amber-600 text-white font-bold rounded-full">
                                    🕯️ Día Central ({calc.calculatedYearCount}º Aniversario)
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-amber-800 dark:text-amber-300 font-serif mt-0.5" dir="rtl">
                                {calc.hebrewDateString}
                              </div>
                              <div className="text-[11px] text-stone-500 mt-0.5">
                                Víspera: Atardecer del {calc.nextEveFormatted} | Día Central: {calc.nextDayFormatted}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleScheduleGoogleCalendar(calc)}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-xs shadow-2xs"
                              >
                                Agendar en Calendar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TODOS LOS FAMILIARES */}
          {activeTab === 'all_relatives' && !isFormOpen && (
            <div className="space-y-4">
              {/* Filter by Kinship Group */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['Todos', 'Padres', 'Abuelos', 'Hermanos', 'Hijos', 'Tíos', 'Cónyuge', 'Otros'].map(
                  (grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedGroupFilter(grp)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                        selectedGroupFilter === grp
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {grp}
                    </button>
                  )
                )}
              </div>

              {/* Relatives List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {relatives
                  .filter((r) => {
                    if (selectedGroupFilter === 'Todos') return true;
                    const cat = RELATIVE_CATEGORIES.find((c) => c.id === r.relationship);
                    return cat?.group === selectedGroupFilter;
                  })
                  .map((item) => {
                    const calc = calculateNextYahrzeit(item, new Date());
                    const relLabel = getRelationshipLabel(item.relationship);
                    const relHeb = getRelationshipHebrewLabel(item.relationship);

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-2 hover:border-amber-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                              {item.name}
                            </div>
                            {item.hebrewName && (
                              <div className="font-serif text-amber-800 dark:text-amber-300 text-xs" dir="rtl">
                                {item.hebrewName}
                              </div>
                            )}
                            <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1 mt-0.5">
                              <span className="text-amber-900 dark:text-amber-200">{relLabel}</span>
                              {relHeb && <span>({relHeb})</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditForm(item)}
                              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRelative(item.id, item.name)}
                              className="p-1.5 text-rose-400 hover:text-rose-600"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Date details */}
                        <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/40 text-[11px] space-y-1">
                          <div>
                            <span className="font-semibold text-stone-600 dark:text-stone-400">
                              Fecha hebrea:
                            </span>{' '}
                            <strong className="text-stone-900 dark:text-stone-100">
                              {calc.hebrewDateString}
                            </strong>
                          </div>
                          <div>
                            <span className="font-semibold text-stone-600 dark:text-stone-400">
                              Próximo Yurzaid:
                            </span>{' '}
                            <strong>{calc.nextDayFormatted}</strong>{' '}
                            <span className="text-amber-700 dark:text-amber-300">
                              ({calc.daysRemaining === 0 ? '¡Hoy!' : `en ${calc.daysRemaining} días`})
                            </span>
                          </div>
                        </div>

                        {item.notes && (
                          <div className="text-[11px] text-stone-600 dark:text-stone-400 italic truncate">
                            Nota: {item.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICACIONES Y ALERTAS POR CORREO Y TELÉFONO */}
          {activeTab === 'notifications' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Informative Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-amber-950/20 border border-amber-300 dark:border-amber-700/60 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-600 text-white shadow-xs">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Sistema de Alertas y Notificaciones de Yurzaid
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Recibe recordatorios en tu teléfono móvil y por correo electrónico con tiempos oportunos para honrar la memoria de tus seres queridos.
                    </p>
                  </div>
                </div>

                {/* Badges of the 4 key stages requested */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-200">
                    <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>1° de Cada Mes (Resumen)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>15 Días Antes (Minyán & Vela)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-200">
                    <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>1 Semana / 7 Días (Avisos)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Víspera (Encendido 24h)</span>
                  </div>
                </div>
              </div>

              {/* TWO COLUMNS: PHONE SETTINGS & EMAIL SETTINGS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. NOTIFICACIONES EN EL TELÉFONO / DISPOSITIVO */}
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        Notificaciones en Teléfono
                      </h4>
                    </div>

                    {/* Permission Status Pill */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        devicePermission === 'granted'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : devicePermission === 'denied'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {devicePermission === 'granted'
                        ? 'Permiso Activo ✓'
                        : devicePermission === 'denied'
                        ? 'Permiso Bloqueado ✕'
                        : 'Permiso Pendiente'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    Alertas push y locales en tu teléfono inteligente o navegador con aviso visual y campanada suave.
                  </p>

                  {/* Actions & Toggles */}
                  <div className="space-y-2.5 pt-1">
                    {devicePermission !== 'granted' && (
                      <button
                        type="button"
                        onClick={handleRequestPermission}
                        className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Habilitar Notificaciones en este Teléfono</span>
                      </button>
                    )}

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700/60 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          Alertas automáticas en dispositivo
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.enablePhoneNotifications}
                        onChange={() => handleToggleNotificationSetting('enablePhoneNotifications')}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 dark:border-stone-600"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700/60 cursor-pointer">
                      <div className="flex items-center gap-2">
                        {notificationSettings.soundEnabled ? (
                          <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                        )}
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          Campanada devocional al sonar alerta
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.soundEnabled}
                        onChange={() => handleToggleNotificationSetting('soundEnabled')}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 dark:border-stone-600"
                      />
                    </label>

                    {/* Test Button */}
                    <button
                      type="button"
                      onClick={handleSendTestPhoneNotification}
                      className="w-full py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {testNotificationStatus ? testNotificationStatus : 'Probar Notificación en Teléfono Ahora'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. CONFIGURACIÓN Y SOLICITUD DE CORREO ELECTRÓNICO */}
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      <Mail className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      Alertas por Correo Electrónico
                    </h4>
                  </div>

                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    Solicitamos tu correo para enviarte las instrucciones sagradas, textos del Kadish y fechas hebreas exactas.
                  </p>

                  {/* Email Input & Save Form */}
                  <form onSubmit={handleSaveEmail} className="space-y-2">
                    <label className="block font-semibold text-stone-800 dark:text-stone-200 text-xs">
                      Tu Correo Electrónico para Recordatorios:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="tu-email@ejemplo.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                      >
                        {isEmailSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Guardado</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Guardar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Frequency Checkboxes */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                      Momentos de Alerta Configurados:
                    </div>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/40 cursor-pointer text-xs">
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        🗓️ 1° de Cada Mes (Resumen de todos los Yurzaids del mes)
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationSettings.notifyMonthStart}
                        onChange={() => handleToggleNotificationSetting('notifyMonthStart')}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/40 cursor-pointer text-xs">
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        ⏳ 15 Días Antes (Encargo de vela de 24h y Minyán)
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationSettings.notify15Days}
                        onChange={() => handleToggleNotificationSetting('notify15Days')}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/40 cursor-pointer text-xs">
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        🕯️ 1 Semana / 7 Días Antes (Aviso familiar y estudio)
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationSettings.notify7Days}
                        onChange={() => handleToggleNotificationSetting('notify7Days')}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/40 cursor-pointer text-xs">
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        🌅 Víspera y Día del Yurzaid (Encendido al atardecer)
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationSettings.notifyEve}
                        onChange={() => handleToggleNotificationSetting('notifyEve')}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. LIST OF UPCOMING YAHRZEITS & INSTANT NOTIFICATION ACTIONS */}
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      Disparadores de Alertas y Acciones Rápidas
                    </h4>
                  </div>
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                    {allCalculations.length} familiar(es) registrado(s)
                  </span>
                </div>

                {allCalculations.length === 0 ? (
                  <div className="p-6 text-center space-y-2 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                    <p className="text-stone-500 dark:text-stone-400 text-xs">
                      Aún no has registrado familiares. Agrega a tus seres queridos para activar las notificaciones automáticas.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddForm}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Familiar Ahora</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allCalculations.slice(0, 6).map((calc) => {
                      const rel = calc.relative;
                      const relLabel = getRelationshipLabel(rel.relationship);
                      const emailLink = composeYahrzeitEmailLink(calc, 'custom', notificationSettings.userEmail);

                      return (
                        <div
                          key={rel.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            calc.daysRemaining <= 7
                              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60'
                              : calc.daysRemaining <= 15
                              ? 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800/60'
                              : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700/60'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                                  {rel.name}
                                </span>
                                {rel.hebrewName && (
                                  <span className="font-serif text-amber-800 dark:text-amber-300 text-xs" dir="rtl">
                                    ({rel.hebrewName})
                                  </span>
                                )}
                                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">
                                  • {relLabel}
                                </span>
                              </div>

                              <div className="text-xs text-stone-600 dark:text-stone-300 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                                <span>
                                  <strong>Hebrea:</strong> {calc.hebrewDateString}
                                </span>
                                <span>
                                  <strong>Víspera:</strong> {calc.nextEveFormatted} (atardecer)
                                </span>
                                <span>
                                  <strong>Día:</strong> {calc.nextDayFormatted}
                                </span>
                              </div>
                            </div>

                            {/* Status badge */}
                            <div className="shrink-0">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs ${
                                  calc.daysRemaining === 0
                                    ? 'bg-rose-600 text-white animate-pulse'
                                    : calc.daysRemaining === 1
                                    ? 'bg-rose-500 text-white'
                                    : calc.daysRemaining <= 7
                                    ? 'bg-amber-600 text-white'
                                    : calc.daysRemaining <= 15
                                    ? 'bg-sky-600 text-white'
                                    : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                                }`}
                              >
                                {calc.daysRemaining === 0
                                  ? '🕯️ ¡HOY!'
                                  : calc.daysRemaining === 1
                                  ? '🌅 ¡MAÑANA!'
                                  : `En ${calc.daysRemaining} días`}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons for this relative */}
                          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-200/60 dark:border-stone-700/40 mt-2.5">
                            {/* Send Email directly */}
                            <a
                              href={emailLink}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                              title={`Enviar correo con recordatorio e instrucciones a ${notificationSettings.userEmail || 'tu email'}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>
                                {notificationSettings.userEmail
                                  ? `Enviar Correo a ${notificationSettings.userEmail.split('@')[0]}`
                                  : 'Redactar Correo'}
                              </span>
                            </a>

                            {/* Trigger phone notification now */}
                            <button
                              type="button"
                              onClick={() => {
                                triggerDeviceNotification(
                                  `🕯️ Yurzaid de ${rel.name} (${calc.hebrewDateString})`,
                                  `El próximo ${calc.nextDayFormatted} se conmemora el Yurzaid de ${rel.name}. Enciende la vela de 24 horas y asiste al Minyán para recitar el Kadish.`,
                                  `relative-${rel.id}`,
                                  notificationSettings.soundEnabled
                                );
                                setStatusMessage({
                                  type: 'success',
                                  text: `Alerta para ${rel.name} disparada en tu dispositivo.`,
                                });
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs shadow-2xs transition-colors"
                            >
                              <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                              <span>Notificar al Teléfono</span>
                            </button>

                            {/* Copy Shareable Text */}
                            <button
                              type="button"
                              onClick={() => handleCopyYahrzeit(calc)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs shadow-2xs transition-colors"
                            >
                              {copiedId === rel.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Copiar para WhatsApp</span>
                                </>
                              )}
                            </button>

                            {/* Google Calendar */}
                            <button
                              type="button"
                              onClick={() => handleScheduleGoogleCalendar(calc)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs shadow-2xs transition-colors"
                            >
                              <CalendarCheck className="w-3.5 h-3.5 text-amber-600" />
                              <span>Google Calendar</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold hover:bg-stone-100 shadow-2xs"
              title="Respaldar familiares en Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-600" />
              <span>Respaldar en Google Drive</span>
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

      {/* Delete Confirmation Overlay Dialog */}
      {deleteConfirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteConfirmTarget(null);
          }}
        >
          <div
            className="bg-white dark:bg-stone-900 border-2 border-rose-500/60 rounded-2xl shadow-2xl p-5 sm:p-6 max-w-sm w-full space-y-4 text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                ¿Eliminar del calendario?
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">
                ¿Estás seguro de que deseas borrar a <strong className="text-stone-900 dark:text-stone-100">{deleteConfirmTarget.name}</strong> de tu calendario de aniversarios?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 font-semibold text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white shadow-xs transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
