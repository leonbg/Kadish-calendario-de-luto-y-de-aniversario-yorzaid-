import React, { useState, useEffect } from 'react';
import {
  FileText,
  HardDrive,
  Calendar as CalendarIcon,
  ExternalLink,
  Plus,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  User as UserIcon,
  LogOut,
  RefreshCw,
  Sparkles,
  Bell,
  Clock,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { KaddishPrayer } from '../types/kaddish';
import {
  signInWithGoogle,
  signOutFromGoogle,
  createKaddishGoogleDoc,
  saveHazkarotToDrive,
  listDriveHazkarotFiles,
  loadHazkarotFromDrive,
  deleteDriveFile,
  createCalendarEvent,
  listCalendarEvents,
  deleteCalendarEvent,
  HazkaraRecord,
  DriveFileInfo,
  GoogleCalendarEventItem,
} from '../utils/googleWorkspace';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePrayer: KaddishPrayer;
  isAseret: boolean;
  user: User | null;
  token: string | null;
  onUserChange: (u: User | null, token: string | null) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  activePrayer,
  isAseret,
  user,
  token,
  onUserChange,
}) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'calendar' | 'drive'>('docs');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    link?: string;
  } | null>(null);

  // Docs Export State
  const [dedicationName, setDedicationName] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [lastCreatedDocUrl, setLastCreatedDocUrl] = useState<string | null>(null);

  // Calendar State
  const [calSummary, setCalSummary] = useState('');
  const [calDate, setCalDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [calRecurrence, setCalRecurrence] = useState(true);
  const [calEvents, setCalEvents] = useState<GoogleCalendarEventItem[]>([]);

  // Hazkarot State
  const [hazkarot, setHazkarot] = useState<HazkaraRecord[]>(() => {
    try {
      const saved = localStorage.getItem('kaddish_local_hazkarot');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newName, setNewName] = useState('');
  const [newHebrewName, setNewHebrewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newRelation, setNewRelation] = useState('');

  // Drive Files
  const [driveFiles, setDriveFiles] = useState<DriveFileInfo[]>([]);

  // Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    try {
      localStorage.setItem('kaddish_local_hazkarot', JSON.stringify(hazkarot));
    } catch {
      // ignore
    }
  }, [hazkarot]);

  useEffect(() => {
    if (user && token) {
      if (activeTab === 'drive') {
        fetchDriveFiles();
      } else if (activeTab === 'calendar') {
        fetchCalendarEvents();
      }
    }
  }, [user, token, activeTab]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res) {
        onUserChange(res.user, res.accessToken);
        setStatusMessage({
          type: 'success',
          text: `Conectado como ${res.user.displayName || res.user.email}`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error al iniciar sesión con Google.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOutFromGoogle();
      onUserChange(null, null);
      setDriveFiles([]);
      setCalEvents([]);
      setStatusMessage({
        type: 'info',
        text: 'Sesión cerrada correctamente.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error al cerrar sesión.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // GOOGLE DOCS ACTIONS
  // -------------------------------------------------------------
  const handleExportDoc = async () => {
    if (!user || !token) {
      handleSignIn();
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: '¿Crear nuevo Documento en Google Docs?',
      description: `Se creará un documento con el texto completo de ${activePrayer.titleSpanish}, fonética Mizrají, traducción y notas en tu Google Drive.`,
      onConfirm: async () => {
        setIsLoading(true);
        setStatusMessage(null);
        try {
          const res = await createKaddishGoogleDoc({
            prayer: activePrayer,
            isAseret,
            dedicationName,
            notes: customNotes,
          });
          setLastCreatedDocUrl(res.documentUrl);
          setStatusMessage({
            type: 'success',
            text: '¡Documento creado con éxito en tu Google Docs!',
            link: res.documentUrl,
          });
        } catch (err: any) {
          setStatusMessage({
            type: 'error',
            text: err.message || 'Error al exportar documento a Google Docs.',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // -------------------------------------------------------------
  // GOOGLE CALENDAR ACTIONS
  // -------------------------------------------------------------
  const fetchCalendarEvents = async () => {
    try {
      const evts = await listCalendarEvents();
      setCalEvents(evts);
    } catch {
      // ignore
    }
  };

  const handleAddCalendarEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      handleSignIn();
      return;
    }

    if (!calSummary.trim() || !calDate) return;

    setConfirmDialog({
      isOpen: true,
      title: '¿Agendar evento en tu Google Calendar?',
      description: `Se creará el recordatorio "${calSummary}" el día ${calDate} ${
        calRecurrence ? '(con repetición anual)' : ''
      } con notificaciones previas en tu Google Calendar.`,
      onConfirm: async () => {
        setIsLoading(true);
        setStatusMessage(null);
        try {
          const res = await createCalendarEvent({
            summary: `🕯️ ${calSummary.trim()}`,
            description: `Recordatorio de Hazkará / Yahrzeit para recitar Kadish Yatom en Minyán.\nSidur Digital de Kadish Sefaradí & Mizrají.`,
            startDate: calDate,
            recurrenceAnnual: calRecurrence,
          });
          await fetchCalendarEvents();
          setStatusMessage({
            type: 'success',
            text: `¡Evento agendado en Google Calendar!`,
            link: res.htmlLink,
          });
          setCalSummary('');
        } catch (err: any) {
          setStatusMessage({
            type: 'error',
            text: err.message || 'Error al agendar evento en Google Calendar.',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleDeleteCalendarEvent = (eventId: string, summary: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `¿Eliminar "${summary}" de Google Calendar?`,
      description: 'El evento se eliminará permanentemente de tu Google Calendar.',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await deleteCalendarEvent(eventId);
          await fetchCalendarEvents();
          setStatusMessage({
            type: 'success',
            text: 'Evento eliminado de Google Calendar.',
          });
        } catch (err: any) {
          setStatusMessage({
            type: 'error',
            text: err.message || 'Error al eliminar evento.',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleQuickAddHazkaraToCalendar = (item: HazkaraRecord) => {
    const summary = `Hazkará de ${item.name}${item.hebrewName ? ` (${item.hebrewName})` : ''}`;
    setCalSummary(summary);
    if (item.dateGregorian) {
      const match = item.dateGregorian.match(/\d{4}-\d{2}-\d{2}/);
      if (match) {
        setCalDate(match[0]);
      }
    }
    setActiveTab('calendar');
  };

  // -------------------------------------------------------------
  // HAZKAROT & DRIVE ACTIONS
  // -------------------------------------------------------------
  const handleAddHazkara = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const item: HazkaraRecord = {
      id: Date.now().toString(),
      name: newName.trim(),
      hebrewName: newHebrewName.trim() || undefined,
      dateGregorian: newDate.trim() || undefined,
      relation: newRelation.trim() || undefined,
    };
    setHazkarot([item, ...hazkarot]);
    setNewName('');
    setNewHebrewName('');
    setNewDate('');
    setNewRelation('');
  };

  const handleDeleteHazkara = (id: string) => {
    setHazkarot(hazkarot.filter((h) => h.id !== id));
  };

  const handleSaveToDrive = async () => {
    if (!user || !token) {
      handleSignIn();
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: '¿Guardar lista de Hazkarot en Google Drive?',
      description: `Se guardarán ${hazkarot.length} registro(s) en tu Google Drive como archivo de respaldo seguro.`,
      onConfirm: async () => {
        setIsLoading(true);
        setStatusMessage(null);
        try {
          const res = await saveHazkarotToDrive(hazkarot);
          await fetchDriveFiles();
          setStatusMessage({
            type: 'success',
            text: `Archivo "${res.name}" guardado exitosamente en tu Google Drive.`,
          });
        } catch (err: any) {
          setStatusMessage({
            type: 'error',
            text: err.message || 'Error al guardar en Google Drive.',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const fetchDriveFiles = async () => {
    try {
      const files = await listDriveHazkarotFiles();
      setDriveFiles(files);
    } catch {
      // ignore
    }
  };

  const handleLoadFromDrive = (fileId: string, fileName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `¿Restaurar desde "${fileName}"?`,
      description:
        'Esto cargará los nombres y fechas guardados en tu Google Drive en este dispositivo.',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const records = await loadHazkarotFromDrive(fileId);
          setHazkarot(records);
          setStatusMessage({
            type: 'success',
            text: `Se cargaron ${records.length} registro(s) desde Google Drive.`,
          });
        } catch (err: any) {
          setStatusMessage({
            type: 'error',
            text: err.message || 'Error al cargar archivo de Google Drive.',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleDeleteDriveFile = (fileId: string, fileName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `¿Eliminar archivo "${fileName}" de Google Drive?`,
      description: 'Esta acción no se puede deshacer.',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await deleteDriveFile(fileId);
          await fetchDriveFiles();
          setStatusMessage({
            type: 'success',
            text: `Archivo "${fileName}" eliminado de Google Drive.`,
          });
        } catch (err: any) {
          setStatusMessage({
            type: 'error',
            text: err.message || 'Error al eliminar archivo.',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Google Workspace Integrado
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Google Calendar, Google Docs y Google Drive con permiso de tu cuenta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Auth Banner */}
        <div className="px-4 sm:px-5 py-3 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200/40 dark:border-amber-900/30 flex flex-wrap items-center justify-between gap-2">
          {user ? (
            <div className="flex items-center gap-2.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuario'}
                  className="w-7 h-7 rounded-full border border-amber-500/30"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  {user.displayName || 'Usuario de Google'}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  {user.email}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-stone-600 dark:text-stone-300">
              Inicia sesión con tu cuenta de Google para agendar recordatorios en Google Calendar, exportar a Google Docs y guardar respaldos en Google Drive.
            </div>
          )}

          <div>
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoading}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 font-semibold text-xs border border-stone-300 dark:border-stone-600 shadow-xs transition-all active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>Acceder con Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs Header */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/50 px-3 sm:px-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-1.5 py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'docs'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Google Docs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'calendar'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Google Calendar (Hazkarot)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-1.5 py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'drive'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Google Drive</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
              }`}
            >
              {statusMessage.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              {statusMessage.type === 'error' && (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p>{statusMessage.text}</p>
                {statusMessage.link && (
                  <a
                    href={statusMessage.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 font-bold underline hover:opacity-80"
                  >
                    Abrir en Google Workspace <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: GOOGLE DOCS EXPORT */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200 dark:border-stone-700/60 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Hoja de Estudio e Impresión: {activePrayer.titleSpanish}</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Genera automáticamente un documento formal en Google Docs con el texto en hebreo puntuado, la fonética rítmica Mizrají silabeada con acentos tónicos, traducción al español y notas halájicas para rezar o imprimir.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Dedicatoria / Nombre del fallecido (Leilui Nishmat / Opcional):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. David ben Sarah / En memoria de nuestro querido abuelo"
                      value={dedicationName}
                      onChange={(e) => setDedicationName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Notas o fecha especial (Opcional):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Aniversario de fallecimiento (Hazkará) - Sinagoga Shaaré Tefilá"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExportDoc}
                    disabled={isLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isLoading ? 'Creando Documento en Google Docs...' : 'Crear Documento en Google Docs'}
                    </span>
                  </button>
                </div>
              </div>

              {lastCreatedDocUrl && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                  <div className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    Último documento generado listo para abrir:
                  </div>
                  <a
                    href={lastCreatedDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                  >
                    <span>Abrir en Google Docs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GOOGLE CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200 dark:border-stone-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
                    <CalendarIcon className="w-4 h-4 text-amber-600" />
                    <span>Agendar Recordatorio de Hazkará / Minyán en Google Calendar</span>
                  </div>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Crea eventos en tu Google Calendar con recordatorios previos para no olvidar los aniversarios de fallecimiento (Yahrzeit / Hazkará) y acudir a la sinagoga a recitar Kadish Yatom.
                </p>

                <form onSubmit={handleAddCalendarEvent} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Nombre del evento o familiar *:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Hazkará de David ben Sarah / Yahrzeit Abuelo"
                      value={calSummary}
                      onChange={(e) => setCalSummary(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Fecha del aniversario *:
                      </label>
                      <input
                        type="date"
                        required
                        value={calDate}
                        onChange={(e) => setCalDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={calRecurrence}
                          onChange={(e) => setCalRecurrence(e.target.checked)}
                          className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span>Repetir anualmente cada año</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Agendar en Google Calendar</span>
                    </button>

                    <button
                      type="button"
                      onClick={fetchCalendarEvents}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 text-xs font-semibold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Actualizar Eventos</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* List of upcoming calendar events */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Eventos de Kadish & Hazkará en tu Google Calendar ({calEvents.length})
                </div>

                {calEvents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-500 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl">
                    No se encontraron eventos agendados aún en tu Google Calendar.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900 max-h-52 overflow-y-auto">
                    {calEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-2.5 flex items-center justify-between text-xs hover:bg-stone-50 dark:hover:bg-stone-800/40"
                      >
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <div className="font-semibold text-stone-900 dark:text-stone-100">
                              {evt.summary}
                            </div>
                            <div className="text-[11px] text-stone-400">
                              {evt.start?.date || evt.start?.dateTime?.split('T')[0] || 'Fecha programada'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {evt.htmlLink && (
                            <a
                              href={evt.htmlLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded text-stone-400 hover:text-amber-600 transition-colors"
                              title="Abrir en Google Calendar"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteCalendarEvent(evt.id, evt.summary)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 transition-colors"
                            title="Eliminar de Google Calendar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE DRIVE BACKUP & HAZKAROT */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              {/* Form to add new Memorial name */}
              <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200 dark:border-stone-700/60 space-y-3">
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                  <span>Agregar Nombre para Hazkará (Memoria de Familiares)</span>
                  <span className="text-[11px] text-stone-500">
                    {hazkarot.length} guardado(s) localmente
                  </span>
                </div>

                <form onSubmit={handleAddHazkara} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Nombre en español *"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Nombre en hebreo (ej: משה בן שרה)"
                    value={newHebrewName}
                    onChange={(e) => setNewHebrewName(e.target.value)}
                    dir="rtl"
                    className="px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif"
                  />
                  <input
                    type="text"
                    placeholder="Fecha de aniversario (ej: 2026-10-15 / 5 Tishrei)"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Parentesco (ej: Padre, Madre, Abuelo)"
                    value={newRelation}
                    onChange={(e) => setNewRelation(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 dark:bg-stone-700 hover:bg-stone-700 dark:hover:bg-stone-600 text-white text-xs font-semibold shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar a la Lista</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Action buttons for Google Drive sync */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveToDrive}
                  disabled={isLoading || hazkarot.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Guardar Respaldo en Google Drive</span>
                </button>

                <button
                  type="button"
                  onClick={fetchDriveFiles}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 font-semibold text-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Actualizar lista de Drive</span>
                </button>
              </div>

              {/* List of current Hazkarot */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Nombres registrados ({hazkarot.length})
                </div>
                {hazkarot.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-500 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl">
                    No tienes nombres de familiares agregados todavía.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900 max-h-48 overflow-y-auto">
                    {hazkarot.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 flex items-center justify-between text-xs hover:bg-stone-50 dark:hover:bg-stone-800/40"
                      >
                        <div>
                          <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <span>{item.name}</span>
                            {item.hebrewName && (
                              <span className="font-serif text-amber-700 dark:text-amber-400" dir="rtl">
                                ({item.hebrewName})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {item.relation && <span>{item.relation} • </span>}
                            {item.dateGregorian && <span>Fecha: {item.dateGregorian}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickAddHazkaraToCalendar(item)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-semibold hover:bg-amber-100"
                            title="Agendar recordatorio en Google Calendar"
                          >
                            <CalendarIcon className="w-3 h-3" />
                            <span>Agendar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHazkara(item.id)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Eliminar de la lista local"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Backups stored in Google Drive */}
              {driveFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Respaldos encontrados en tu Google Drive ({driveFiles.length})
                  </div>
                  <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900">
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-2.5 flex items-center justify-between text-xs hover:bg-stone-50 dark:hover:bg-stone-800/40"
                      >
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-amber-600" />
                          <div>
                            <div className="font-semibold text-stone-900 dark:text-stone-100">
                              {file.name}
                            </div>
                            <div className="text-[10px] text-stone-400">
                              Modificado: {new Date(file.modifiedTime).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleLoadFromDrive(file.id, file.name)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-stone-800 dark:text-stone-200 text-[11px] font-semibold transition-colors"
                            title="Restaurar lista desde este archivo"
                          >
                            <Download className="w-3 h-3" />
                            <span>Restaurar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDriveFile(file.id, file.name)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 transition-colors"
                            title="Eliminar de Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-2xl p-5 shadow-2xl border border-stone-200 dark:border-stone-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {confirmDialog.title}
              </h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {confirmDialog.description}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  setConfirmDialog({
                    isOpen: false,
                    title: '',
                    description: '',
                    onConfirm: () => {},
                  })
                }
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const cb = confirmDialog.onConfirm;
                  setConfirmDialog({
                    isOpen: false,
                    title: '',
                    description: '',
                    onConfirm: () => {},
                  });
                  cb();
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
              >
                Confirmar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
