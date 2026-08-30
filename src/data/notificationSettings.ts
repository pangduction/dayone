import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

/**
 * Local, on-device preferences for Flow 7.1 Notification — a real device
 * feature, not a mock toggle list. Screens should go through
 * `saveNotificationSettings` rather than calling `expo-notifications`
 * directly, so a preference and its actual scheduled notification can never
 * drift apart.
 *
 * `expo-notifications`' *remote* push features aren't available in Expo Go
 * on SDK 53+, but the local scheduling API this file uses
 * (`scheduleNotificationAsync` with a calendar-style trigger) still works
 * there — DayOne never needs a push token or a remote server.
 */
export type NotificationSettings = {
  dailyReminderEnabled: boolean;
  /** 24-hour clock, 0–23 — the time picker's own AM/PM is converted to this before it's ever stored. */
  dailyReminderHour: number;
  dailyReminderMinute: number;
  monthlyReportEnabled: boolean;
};

const STORAGE_KEY = 'dayone.notificationSettings.v1';

/** Exported so `src/data/account.ts`'s Delete Account wipe can restore these defaults (and, via `saveNotificationSettings`, actually cancel any real scheduled notifications) rather than duplicating them. */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  dailyReminderEnabled: false,
  // 9:00 PM — a reasonable "wrap up your day" default. Figma's own mock
  // shows "6:28 PM" as sample data on the Timer row, not a real default.
  dailyReminderHour: 21,
  dailyReminderMinute: 0,
  monthlyReportEnabled: false,
};

// Figma's Monthly Report copy promises "a summary of your month on the
// morning of the 1st" with no time picker of its own, so this fixed local
// time is the implementer's own reasonable reading of "morning."
const MONTHLY_REPORT_HOUR = 9;
const MONTHLY_REPORT_MINUTE = 0;

// Fixed identifiers so re-scheduling is always cancel-then-recreate rather
// than needing to track or diff whatever expo-notifications currently has
// scheduled.
const DAILY_REMINDER_ID = 'dayone.daily-reminder';
const MONTHLY_REPORT_ID = 'dayone.monthly-report';

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/** Cancelling an identifier that was never scheduled isn't an error, so this is always safe to call before a fresh (re)schedule. */
async function cancelById(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // Nothing was scheduled under that id.
  }
}

/**
 * Applies `settings` to the device's real scheduled notifications — cancels
 * and unconditionally re-schedules both from scratch rather than diffing
 * against whatever was scheduled before, so this is safe to call any time a
 * preference changes.
 */
async function applyNotificationSettings(settings: NotificationSettings): Promise<void> {
  await cancelById(DAILY_REMINDER_ID);
  await cancelById(MONTHLY_REPORT_ID);

  if (settings.dailyReminderEnabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: {
        title: 'Daily Reminder',
        body: 'Wrap up your day with a DayOne entry.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: settings.dailyReminderHour,
        minute: settings.dailyReminderMinute,
      },
    });
  }

  if (settings.monthlyReportEnabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: MONTHLY_REPORT_ID,
      content: {
        title: 'Monthly Report',
        body: 'Your month is ready — see your report.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: 1,
        hour: MONTHLY_REPORT_HOUR,
        minute: MONTHLY_REPORT_MINUTE,
      },
    });
  }
}

/** Persists `settings` and (re)schedules the real device notifications to match — the only way a screen should change a preference. */
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  await applyNotificationSettings(settings);
}
