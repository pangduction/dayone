import { deleteAllPosts } from './posts';
import { deleteAllExportFiles } from './exports';
import { saveNotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from './notificationSettings';

/**
 * Setting → Delete Account (Flow 7.6). DayOne has no server-side account
 * yet — every post, photo, recording, and generated PDF lives only in this
 * device's own storage (see DESIGN_SYSTEM.md's "Where things live"), so
 * "deleting the account" *is* wiping that local data; there is nothing kept
 * anywhere else to delete alongside it. Once real sign-in exists, extend
 * this to also end that session / delete the signed-in provider's record.
 *
 * Deliberately leaves the Language preference (`src/data/language.ts`)
 * untouched — that's a device/UI setting, not personal journal content, and
 * the App Store / Play "delete account" requirement this satisfies is about
 * the latter, not about resetting the app back to English.
 */
export async function deleteAllAppData(): Promise<void> {
  await Promise.all([
    deleteAllPosts(),
    deleteAllExportFiles(),
    // Also cancels any real scheduled Daily Reminder / Monthly Report
    // notification, not just the stored preference.
    saveNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS),
  ]);
}
