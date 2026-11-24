import type { Auth, GoogleAuthProvider, User } from 'firebase/auth';
import { KaddishPrayer } from '../types/kaddish';

interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const localConfigModules = import.meta.glob('../../firebase-applet-config.json', {
  eager: true,
}) as Record<string, { default?: FirebaseClientConfig }>;

function resolveFirebaseConfig(): FirebaseClientConfig | null {
  const envConfig: FirebaseClientConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  const localModule = Object.values(localConfigModules)[0];
  const localConfig = localModule?.default;
  if (localConfig?.apiKey && localConfig?.projectId) {
    return localConfig;
  }

  return null;
}

// Scopes for Google Drive, Google Docs and Google Calendar
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar',
];

let cachedAuth: Auth | null = null;
let cachedProvider: GoogleAuthProvider | null = null;

async function getFirebaseContext() {
  const firebaseConfig = resolveFirebaseConfig();
  if (!firebaseConfig) {
    return null;
  }

  try {
    const [{ initializeApp, getApps, getApp }, authMod] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
    ]);

    if (!cachedAuth) {
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      cachedAuth = authMod.getAuth(app);
    }

    if (!cachedProvider) {
      const provider = new authMod.GoogleAuthProvider();
      WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));
      cachedProvider = provider;
    }

    return { authInstance: cachedAuth, providerInstance: cachedProvider, authMod };
  } catch (err) {
    console.warn('Firebase Auth initialization skipped or unavailable:', err);
    return null;
  }
}

// In-memory token cache (never stored in localStorage/sessionStorage)
let inMemoryAccessToken: string | null = null;
let isSigningIn = false;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
): (() => void) => {
  let unsubscribeFn: (() => void) | null = null;
  let cancelled = false;

  getFirebaseContext().then((ctx) => {
    if (cancelled) return;
    if (!ctx) {
      if (onAuthFailure) onAuthFailure();
      return;
    }

    try {
      unsubscribeFn = ctx.authMod.onAuthStateChanged(
        ctx.authInstance,
        async (user: User | null) => {
          if (user) {
            if (inMemoryAccessToken) {
              if (onAuthSuccess) onAuthSuccess(user, inMemoryAccessToken);
            } else if (!isSigningIn) {
              if (onAuthFailure) onAuthFailure();
            }
          } else {
            inMemoryAccessToken = null;
            if (onAuthFailure) onAuthFailure();
          }
        },
        () => {
          if (onAuthFailure) onAuthFailure();
        }
      );
    } catch {
      if (onAuthFailure) onAuthFailure();
    }
  });

  return () => {
    cancelled = true;
    if (unsubscribeFn) unsubscribeFn();
  };
};

export const signInWithGoogle = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  const ctx = await getFirebaseContext();
  if (!ctx) {
    throw new Error(
      'Configura las variables de entorno VITE_FIREBASE_* (en Ajustes → Secrets o .env.local) para habilitar el inicio de sesión con Google.'
    );
  }
  try {
    isSigningIn = true;
    const result = await ctx.authMod.signInWithPopup(ctx.authInstance, ctx.providerInstance);
    const credential = ctx.authMod.GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google');
    }
    inMemoryAccessToken = credential.accessToken;
    return { user: result.user, accessToken: inMemoryAccessToken };
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signOutFromGoogle = async (): Promise<void> => {
  const ctx = await getFirebaseContext();
  if (ctx) {
    await ctx.authMod.signOut(ctx.authInstance);
  }
  inMemoryAccessToken = null;
};

export const getStoredAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

// ----------------------------------------------------------------------
// GOOGLE DOCS EXPORT SERVICE
// ----------------------------------------------------------------------

export interface ExportDocOptions {
  prayer: KaddishPrayer;
  isAseret: boolean;
  dedicationName?: string;
  notes?: string;
}

/**
 * Creates a formatted Google Document with the Kaddish prayer and opens it.
 */
export async function createKaddishGoogleDoc({
  prayer,
  isAseret,
  dedicationName,
  notes,
}: ExportDocOptions): Promise<{ documentId: string; documentUrl: string }> {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error('Debes iniciar sesión con Google para exportar a Google Docs.');
  }

  const docTitle = `${prayer.titleSpanish} - Nusaj Sefaradí Mizrají${
    dedicationName ? ` (${dedicationName})` : ''
  }`;

  // 1. Create empty document via Google Docs API
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: docTitle,
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(
      errData.error?.message ||
        `Error al crear documento en Google Docs (${createRes.status})`
    );
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;

  // 2. Build full formatted document body text
  let bodyText = `\n${prayer.titleHebrew} - ${prayer.titleSpanish}\n`;
  bodyText += `${prayer.subtitleSpanish}\n`;
  if (isAseret) {
    bodyText += `[Edición especial para Aseret Yemei Teshuvá / Diez Días de Arrepentimiento]\n`;
  }
  if (dedicationName && dedicationName.trim()) {
    bodyText += `\nLeilui Nishmat / En Memoria de: ${dedicationName.trim()}\n`;
  }
  if (notes && notes.trim()) {
    bodyText += `Notas: ${notes.trim()}\n`;
  }

  bodyText += `\n------------------------------------------------------------\n\n`;

  // Append each verse
  prayer.lines.forEach((line, index) => {
    const hebrew =
      isAseret && line.hebrewAseret ? line.hebrewAseret : line.hebrew;
    const translit =
      isAseret && line.translitAseret ? line.translitAseret : line.translit;
    const guide =
      isAseret && line.phoneticGuideAseret
        ? line.phoneticGuideAseret
        : line.phoneticGuide || line.translit;
    const spanish =
      isAseret && line.spanishAseret ? line.spanishAseret : line.spanish;

    bodyText += `[${index + 1}] ${hebrew}\n`;
    bodyText += `Fonética con acento: ${translit}\n`;
    bodyText += `Guía silábica: ${guide}\n`;
    bodyText += `Español: ${spanish}\n`;
    if (line.instruction) {
      bodyText += `Instrucción halájica: ${line.instruction.es}\n`;
    }
    bodyText += `\n`;
  });

  bodyText += `------------------------------------------------------------\n`;
  bodyText += `Generado desde la aplicación Kadish y Yurzaid (Nusaj Sefaradí & Mizrají).\n`;

  const safeDocumentId = encodeURIComponent(documentId);
  const updateRes = await fetch(
    `https://docs.googleapis.com/v1/documents/${safeDocumentId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: bodyText,
            },
          },
        ],
      }),
    }
  );

  if (!updateRes.ok) {
    console.warn('Could not batch update text formatting, doc was created.');
  }

  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;
  return { documentId, documentUrl };
}

// ----------------------------------------------------------------------
// GOOGLE DRIVE HAZKAROT / MEMORIAL LIST SERVICE
// ----------------------------------------------------------------------

export interface HazkaraRecord {
  id: string;
  name: string;
  hebrewName?: string;
  dateGregorian?: string;
  dateHebrew?: string;
  relation?: string;
  notes?: string;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
}

/**
 * Saves Hazkarot list as a JSON file in user's Google Drive.
 */
export async function saveHazkarotToDrive(
  records: HazkaraRecord[],
  fileName = 'kaddish_hazkarot_memorial.json'
): Promise<{ fileId: string; name: string }> {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error('Debes iniciar sesión con Google para guardar en Google Drive.');
  }

  const fileMetadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Lista de Hazkarot y Nombres en Memoria guardados desde Kadish y Yurzaid',
  };

  const fileContent = JSON.stringify(
    {
      app: 'Kadish y Yurzaid',
      version: '1.0',
      updatedAt: new Date().toISOString(),
      records,
    },
    null,
    2
  );

  // Use multipart upload to create file with metadata & content
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(fileMetadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.error?.message || `Error al guardar archivo en Google Drive (${res.status})`
    );
  }

  const data = await res.json();
  return { fileId: data.id, name: data.name };
}

/**
 * Lists backup files in Google Drive.
 */
export async function listDriveHazkarotFiles(): Promise<DriveFileInfo[]> {
  const token = getStoredAccessToken();
  if (!token) return [];

  const q = encodeURIComponent(
    "name contains 'kaddish' and trashed = false"
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,createdTime,modifiedTime)&orderBy=modifiedTime desc`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Loads Hazkarot records from a specific Google Drive file.
 */
export async function loadHazkarotFromDrive(fileId: string): Promise<HazkaraRecord[]> {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error('Debes iniciar sesión con Google para leer desde Google Drive.');
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('No se pudo descargar el archivo desde Google Drive.');
  }

  const data = await res.json();
  if (Array.isArray(data.records)) {
    return data.records;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

/**
 * Deletes a file from Google Drive.
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error('Debes iniciar sesión con Google.');
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
    {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('No se pudo eliminar el archivo de Google Drive.');
  }
}

// ----------------------------------------------------------------------
// GOOGLE CALENDAR SERVICE (HAZKAROT & MEMORIAL REMINDERS)
// ----------------------------------------------------------------------

export interface CalendarEventPayload {
  summary: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  isAllDay?: boolean;
  recurrenceAnnual?: boolean;
}

export interface GoogleCalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  start?: { date?: string; dateTime?: string };
  htmlLink?: string;
}

/**
 * Creates a Hazkará or prayer reminder event in Google Calendar.
 */
export async function createCalendarEvent(
  payload: CalendarEventPayload
): Promise<GoogleCalendarEventItem> {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error('Debes iniciar sesión con Google para agendar en Google Calendar.');
  }

  const eventBody: any = {
    summary: payload.summary,
    description: payload.description || 'Recordatorio de Kadish y Hazkará / Minyán',
    start: {
      date: payload.startDate,
    },
    end: {
      date: payload.startDate,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 60 },      // 1 hour before
      ],
    },
  };

  if (payload.recurrenceAnnual) {
    eventBody.recurrence = ['RRULE:FREQ=YEARLY'];
  }

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.error?.message || `Error al crear evento en Google Calendar (${res.status})`
    );
  }

  return await res.json();
}

/**
 * Lists upcoming Kaddish / Hazkará events from primary Google Calendar.
 */
export async function listCalendarEvents(): Promise<GoogleCalendarEventItem[]> {
  const token = getStoredAccessToken();
  if (!token) return [];

  const timeMin = new Date().toISOString();
  const q = encodeURIComponent('Kadish OR Hazkara OR Hazkará OR Yahrzeit');

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?q=${q}&timeMin=${timeMin}&maxResults=20&orderBy=startTime&singleEvents=true`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * Deletes an event from Google Calendar.
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const token = getStoredAccessToken();
  if (!token) {
    throw new Error('Debes iniciar sesión con Google.');
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok && res.status !== 204) {
    throw new Error('No se pudo eliminar el evento de Google Calendar.');
  }
}
