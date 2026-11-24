import {
  FamilyMemorialItem,
  UpcomingYahrzeitCalculation,
  YahrzeitNotificationSettings,
  ActiveYahrzeitAlert,
} from '../types/familyMemorial';
import { calculateNextYahrzeit, getRelationshipLabel } from './familyMemorialUtils';
import { formatSpanishDate } from './kaddishCalculator';
import { playDevotionalChime } from './speechUtils';

export const NOTIFICATION_SETTINGS_KEY = 'kaddish_yahrzeit_notifications_config';

export const DEFAULT_NOTIFICATION_SETTINGS: YahrzeitNotificationSettings = {
  enablePhoneNotifications: true,
  enableEmailNotifications: true,
  userEmail: '',
  notifyMonthStart: true,
  notify15Days: true,
  notify7Days: true,
  notifyEve: true,
  soundEnabled: true,
};

/**
 * Loads notification preferences from localStorage.
 */
export function loadNotificationSettings(): YahrzeitNotificationSettings {
  try {
    const raw = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * Saves notification preferences to localStorage.
 */
export function saveNotificationSettings(settings: YahrzeitNotificationSettings): void {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving notification settings:', err);
  }
}

/**
 * Checks if browser / phone supports native Web Notifications.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets current notification permission state ('granted' | 'denied' | 'default' | 'unsupported').
 */
export function getNotificationPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Prompts user for native push/local notification permissions.
 */
export async function requestDeviceNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

/**
 * Triggers a native device notification (phone or desktop) with audio chime.
 */
export async function triggerDeviceNotification(
  title: string,
  body: string,
  tag = 'yahrzeit-alert',
  sound = true
): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    if (sound) {
      playDevotionalChime();
    }

    // Check if service worker registration is available for PWA background notifications
    if ('serviceWorker' in navigator) {
      const reg = await Promise.race([
        navigator.serviceWorker.getRegistration(),
        new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 1500)),
      ]).catch(() => undefined);
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag,
          requireInteraction: true,
        });
        return true;
      }
    }

    // Standard Web Notification API
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag,
      requireInteraction: true,
    });
    return true;
  } catch (err) {
    console.error('Failed to trigger notification:', err);
    return false;
  }
}

/**
 * Generates the list of active Yahrzeit alerts based on user settings and relative list.
 * Evaluates:
 *  - Inicio de mes (1° del mes con resumen de todos los Yurzaids del mes)
 *  - 15 días antes
 *  - 7 días (1 semana) antes
 *  - Víspera / Hoy (encendido de vela)
 */
export function getActiveYahrzeitAlerts(
  relatives: FamilyMemorialItem[],
  settings: YahrzeitNotificationSettings,
  referenceDate = new Date()
): ActiveYahrzeitAlert[] {
  const alerts: ActiveYahrzeitAlert[] = [];
  const today = referenceDate;
  const isFirstDayOfMonth = today.getDate() === 1;

  // Calculate calculations for all relatives
  const calculations = relatives.map((r) => ({
    relative: r,
    calc: calculateNextYahrzeit(r, today),
  }));

  // 1. Alert for 1st of Month (Summary of all Yahrzeits in the upcoming month)
  if (settings.notifyMonthStart && isFirstDayOfMonth) {
    const thisMonthYahrzeits = calculations.filter((c) => c.calc.isWithinMonth);
    if (thisMonthYahrzeits.length > 0) {
      const namesList = thisMonthYahrzeits
        .map(
          (c) =>
            `• ${c.relative.name} (${getRelationshipLabel(c.relative.relationship)}): ${c.calc.nextDayFormatted}`
        )
        .join('\n');

      alerts.push({
        id: `alert-month-${today.getFullYear()}-${today.getMonth() + 1}`,
        type: 'month_start',
        relative: thisMonthYahrzeits[0].relative,
        calc: thisMonthYahrzeits[0].calc,
        title: `🗓️ Resumen Mensual: ${thisMonthYahrzeits.length} Yurzaid(s) este mes`,
        message: `Inicia el mes. Hay ${thisMonthYahrzeits.length} aniversario(s) de Yurzaid en tu calendario familiar:\n${namesList}`,
        urgency: 'info',
        daysRemaining: thisMonthYahrzeits[0].calc.daysRemaining,
      });
    }
  }

  // 2. Individual Alerts (15 days, 7 days, Eve/Today)
  calculations.forEach(({ relative, calc }) => {
    const days = calc.daysRemaining;
    const relLabel = getRelationshipLabel(relative.relationship);

    // 15 days before
    if (settings.notify15Days && days === 15) {
      alerts.push({
        id: `alert-15d-${relative.id}-${calc.calculatedYearCount}`,
        type: '15_days',
        relative,
        calc,
        title: `🕯️ Alerta 15 Días: Yurzaid de ${relative.name}`,
        message: `Faltan 15 días para el ${calc.calculatedYearCount}º Yurzaid de tu ${relLabel.toLowerCase()} (${relative.name}) el ${calc.nextDayFormatted}. Tiempo de encargar la vela de 24 horas y coordinar Minyán para el Kadish.`,
        urgency: 'medium',
        daysRemaining: 15,
      });
    }

    // 7 days (1 week) before
    if (settings.notify7Days && days === 7) {
      alerts.push({
        id: `alert-7d-${relative.id}-${calc.calculatedYearCount}`,
        type: '7_days',
        relative,
        calc,
        title: `🕯️ Alerta 1 Semana: Yurzaid de ${relative.name}`,
        message: `El próximo ${calc.nextDayFormatted} se conmemora el Yurzaid de ${relative.name} (${calc.hebrewDateString}). El encendido de la vela comienza al atardecer del ${calc.nextEveFormatted}.`,
        urgency: 'medium',
        daysRemaining: 7,
      });
    }

    // Eve / Today (0 or 1 day)
    if (settings.notifyEve && (days === 0 || days === 1)) {
      alerts.push({
        id: `alert-eve-${relative.id}-${calc.calculatedYearCount}`,
        type: 'eve_today',
        relative,
        calc,
        title: days === 0 ? `🕯️ ¡HOY es el Yurzaid de ${relative.name}!` : `🕯️ MAÑANA: Yurzaid de ${relative.name}`,
        message: days === 0
          ? `Hoy se conmemora el ${calc.calculatedYearCount}º Yurzaid de ${relative.name} (${calc.hebrewDateString}). Enciende la vela de 24 horas y di Kadish en Shajarit y Minjá.`
          : `Al atardecer de hoy comienza el Yurzaid de ${relative.name}. Enciende la vela de 24 horas antes del anochecer y asiste a Arbit para el Kadish.`,
        urgency: 'high',
        daysRemaining: days,
      });
    }
  });

  return alerts;
}

/**
 * Checks and triggers notifications automatically on app startup / daily check.
 */
export async function runAutomatedYahrzeitCheck(
  relatives: FamilyMemorialItem[],
  settings: YahrzeitNotificationSettings
): Promise<number> {
  if (
    !settings.enablePhoneNotifications ||
    !isNotificationSupported() ||
    Notification.permission !== 'granted'
  ) {
    return 0;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  if (settings.lastCheckedDate === todayStr) {
    return 0; // Already notified today
  }

  const alerts = getActiveYahrzeitAlerts(relatives, settings);
  let triggeredCount = 0;

  for (const alert of alerts) {
    const success = await triggerDeviceNotification(
      alert.title,
      alert.message,
      alert.id,
      settings.soundEnabled
    );
    if (success) triggeredCount++;
  }

  // Update lastCheckedDate
  saveNotificationSettings({
    ...settings,
    lastCheckedDate: todayStr,
  });

  return triggeredCount;
}

/**
 * Sends an immediate test notification to verify device sound and visual alerts.
 */
export async function sendTestNotification(sound = true): Promise<boolean> {
  const perm = await requestDeviceNotificationPermission();
  if (!perm) return false;

  return triggerDeviceNotification(
    '🕯️ Prueba de Notificación de Yurzaid',
    '¡Perfecto! Las alertas de tu teléfono están configuradas correctamente. Recibirás avisos 15 días antes, 1 semana antes, al inicio de mes y en la víspera del encendido de la vela.',
    'test-yahrzeit-notification',
    sound
  );
}

/**
 * Composes a mailto: URL with pre-filled subject and rich body for sending / sharing Yahrzeit alerts.
 */
export function composeYahrzeitEmailLink(
  calc: UpcomingYahrzeitCalculation,
  alertType: 'month_start' | '15_days' | '7_days' | 'eve_today' | 'custom',
  userEmail = ''
): string {
  const rel = calc.relative;
  const relLabel = getRelationshipLabel(rel.relationship);

  const subject = encodeURIComponent(
    `🕯️ Recordatorio de Yurzaid: ${rel.name} (${calc.hebrewDateString}) - Sidur Kadish`
  );

  const bodyText =
    `Shalom,\n\n` +
    `Te enviamos este recordatorio sagrado de Yurzaid / Azkará:\n\n` +
    `════════════════════════════════════════════════════════════\n` +
    `🕯️ RECORDATORIO DE YAHRZEIT / YURZAID (${calc.calculatedYearCount}º AÑO)\n` +
    `════════════════════════════════════════════════════════════\n\n` +
    `• Nombre del ser querido: ${rel.name}${rel.hebrewName ? ` (${rel.hebrewName})` : ''}\n` +
    `• Parentesco: ${relLabel}\n` +
    `• Fecha Hebrea: ${calc.hebrewDateString}\n` +
    `• Víspera y Encendido de Vela (24h): Atardecer del ${calc.nextEveFormatted}\n` +
    `• Día Principal y Rezo de Kadish: ${calc.nextDayFormatted}\n` +
    (rel.notes ? `• Notas familiares: ${rel.notes}\n` : '') +
    `\n` +
    `📋 GUÍA DE MITZVOT PARA ESTE DÍA:\n` +
    `1. Encender una vela de 24 horas (Ner Neshamá) al caer la noche de la víspera diciendo:\n` +
    `   "Enciendo esta vela por la elevación del alma de (${rel.hebrewName || rel.name}) Leilui Nishmat".\n` +
    `2. Recitar el Kadish en Minyán en los servicios de Arbit (noche), Shajarit (mañana) y Minjá (tarde).\n` +
    `3. Estudiar capítulos de Mishná (cuyas letras forman la palabra Neshamá - Alma).\n` +
    `4. Donar caridad (Tzedaká) y compartir alimentos para bendiciones por su memoria.\n\n` +
    `Generado con devoción desde la aplicación Kadish y Yurzaid (Nusaj Sefaradí & Mizrají).\n` +
    `Que el alma de ${rel.name} tenga un ascenso continuo en el Gan Edén.`;

  const encodedBody = encodeURIComponent(bodyText);
  return `mailto:${userEmail || ''}?subject=${subject}&body=${encodedBody}`;
}
