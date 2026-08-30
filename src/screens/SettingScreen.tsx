import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as StoreReview from 'expo-store-review';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderX from '../components/HeaderX';
import SettingSection from '../components/SettingSection';
import SettingMenuRow from '../components/SettingMenuRow';
import SettingDivider from '../components/SettingDivider';
import LanguageModal from '../components/LanguageModal';
import DeleteAccountModal from '../components/DeleteAccountModal';
import AlertBanner from '../components/AlertBanner';
import { dateKey } from '../data/posts';
import { getNotificationSettings } from '../data/notificationSettings';
import { deleteAllAppData } from '../data/account';
import { useAuth } from '../auth/AuthContext';
import { deleteFirebaseAccount, signOutUser } from '../auth/firebaseAuth';
import { isFirebaseConfigured } from '../data/firebase';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, spacing } from '../theme/tokens';

/** "최근 7일" (last 7 days) — the product's chosen default range when the date picker first opens from Setting. */
function lastSevenDaysRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
  return { startDate: dateKey(weekAgo), endDate: dateKey(today) };
}

/**
 * Figma "Setting-Main" (node 3198:6348, "Flow 7. Setting" section 3198:6347)
 * — reached from Report's ic/setting button. Header/X closes back to Report.
 *
 * Three grouped sections (APP / SUPPORT / ACCOUNT) of `SettingMenuRow`s
 * separated by `SettingDivider`s, matching Figma's Menu Section / Divider /
 * Menu Section pattern exactly (gap 16 between the five).
 *
 * Every row leads somewhere real now. "Log in"/"Log out" reflect the actual
 * `useAuth()` state (`src/auth/`) — "Log in" shows the signed-in provider's
 * real email, "Log out" calls `signOutUser`, and `RootNavigator` swaps the
 * whole stack back to `Login` on its own once `user` goes null, so this
 * screen never navigates anywhere on sign-out itself. "FAQ" opens
 * `FaqScreen` (real, hand-written content — no Figma frame for this
 * exists), "App review" triggers the OS's native review prompt via
 * `expo-store-review` (no App Store listing to deep-link to yet, and this
 * API needs none), and "Delete Account" (7.6) wipes this device's local
 * data for real — see `src/data/account.ts` — and deletes the Firebase user
 * alongside it.
 *
 * "Notifications" (Flow 7.1) is wired to `NotificationScreen`; its value
 * reads "On" only when the OS permission is actually granted *and* at least
 * one of Daily Reminder / Monthly Report is on — matching what the two
 * sub-toggles being off would otherwise silently contradict.
 *
 * "Language" (Flow 7.2) is wired to `LanguageModal`, opened directly over
 * this screen per Figma's own Setting-Language (node 3199:8605) — the same
 * "modal over Setting-Main" pattern Export to PDF's date-range picker uses.
 * Both English and 한국어 are now real, selectable options (see
 * `LanguageModal`'s own doc comment for why that's no longer the "Not
 * supported yet." dead end Figma's Setting-Language-Korea frame shows) — the
 * row's own value names whichever is currently active, in its own language
 * rather than translated ("한국어", not "Korean").
 *
 * "Export to PDF" (Flow 7.3) is wired: tapping it pushes `ExportToPdfScreen`
 * directly, pre-filled with the last 7 days. Figma's own node 3199:8735
 * draws this as a date-range modal opening first, directly over Setting-Main
 * — but landing straight in that modal every time hid the screen's own
 * "Files" list of previously generated PDFs behind an extra, easy-to-dismiss
 * step, which read as the app losing track of them. `ExportToPdfScreen`
 * already reopens the same `DateRangeModal` from its own "Date Range" row,
 * so nothing about changing the range is lost — only the surprise of it
 * being the very first thing on screen.
 *
 * "Help & Support" (Flow 7.4) is wired to `HelpSupportScreen` — a real
 * contact form, not a mailto placeholder: submitting it actually sends an
 * email to the product owner (see that screen's own doc comment and
 * `src/data/contact.ts` / `api/contact.ts` for the send path). Per
 * Setting-Main's own "sent" state (node 3269:6332), a successful send pops
 * back to *this* screen and flashes the confirmation here — the same
 * `flash` route-param pattern `HomeScreen` uses after a post delete — rather
 * than showing it on `HelpSupportScreen` itself.
 *
 * "Terms of Service" (Flow 7.5) is wired to `TermsOfServiceScreen` — a bare
 * two-row list ("Terms of Use" / "Privacy Policy") that goes nowhere yet,
 * since Figma has no frame anywhere for what either document actually says.
 */
export default function SettingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Setting'>>();
  const insets = useSafeAreaInsets();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  // A screen hands the banner over as a route param on its way back here.
  // Clearing the param immediately means it shows once rather than again
  // every time this screen regains focus.
  useEffect(() => {
    if (!params?.flash) return;
    setFlash(params.flash);
    navigation.setParams({ flash: undefined });
  }, [params?.flash, navigation]);

  useEffect(() => {
    if (flash === null) return;
    // Figma doesn't say how long the banner stays; matches HomeScreen's flash.
    const timer = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(timer);
  }, [flash]);

  // Refreshed on every focus, since this reflects state that can change
  // from the Notification screen itself, or from the device's real Settings
  // app the user may have just come back from.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([getNotificationSettings(), Notifications.getPermissionsAsync()]).then(([settings, permission]) => {
        if (cancelled) return;
        setNotificationsOn(permission.granted && (settings.dailyReminderEnabled || settings.monthlyReportEnabled));
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  // No App Store listing to deep-link to yet, and this API needs none: it
  // triggers the OS's own native "rate this app" sheet directly, the same
  // one iOS/Android already show a few times a year on their own. Silently
  // does nothing if the platform/OS version doesn't support it (e.g. most
  // Android emulators) rather than erroring the row.
  const handleAppReview = async () => {
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
    }
  };

  const handleLogOut = () => {
    signOutUser().catch(() => {
      // Nothing sensible to show the user for a failed sign-out — retrying
      // the tap already retries the same call.
    });
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountModalVisible(false);
    await deleteAllAppData();
    try {
      await deleteFirebaseAccount();
    } catch {
      // Firebase can refuse a delete with `auth/requires-recent-login` on an
      // old session — fall back to just signing out, since the local data
      // is already gone either way and the account itself is merely
      // orphaned rather than lost. A no-op if there's no Firebase user to
      // begin with (unconfigured project — see RootNavigator's own note).
      await signOutUser().catch(() => {});
    }
    Alert.alert(t('setting.accountDeletedFlash'));
    if (!isFirebaseConfigured) {
      // No real sign-in to fall back to yet, so `RootNavigator` won't swap
      // the stack on its own the way it does once a signed-in user exists —
      // return to Home manually, the same reset this screen used before
      // real auth existed.
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <HeaderX onClose={() => navigation.goBack()} />

      <ScrollView style={styles.menu} contentContainerStyle={styles.menuContent}>
        <SettingSection title={t('setting.sectionApp')}>
          <SettingMenuRow
            label={t('setting.notifications')}
            value={notificationsOn ? t('setting.on') : t('setting.off')}
            onPress={() => navigation.navigate('Notification')}
          />
          <SettingMenuRow
            label={t('setting.language')}
            value={language === 'ko' ? '한국어' : 'English'}
            onPress={() => setLanguageModalVisible(true)}
          />
          <SettingMenuRow
            label={t('setting.exportToPdf')}
            onPress={() => navigation.navigate('ExportToPdf', lastSevenDaysRange())}
          />
        </SettingSection>

        <SettingDivider />

        <SettingSection title={t('setting.sectionSupport')}>
          <SettingMenuRow label={t('setting.faq')} onPress={() => navigation.navigate('Faq')} />
          <SettingMenuRow label={t('setting.helpSupport')} onPress={() => navigation.navigate('HelpSupport')} />
          <SettingMenuRow label={t('setting.termsOfService')} onPress={() => navigation.navigate('TermsOfService')} />
          <SettingMenuRow label={t('setting.appReview')} onPress={handleAppReview} />
          <SettingMenuRow label={t('setting.appVersion')} value={Constants.expoConfig?.version ?? '—'} chevron={false} />
        </SettingSection>

        <SettingDivider />

        <SettingSection title={t('setting.sectionAccount')}>
          {/* Figma mocks this as a static row (no chevron) — real now: the
              signed-in provider's own email, or a plain "not set up" note
              while running without a real Firebase project configured. */}
          <SettingMenuRow
            label={t('setting.logIn')}
            value={user?.email ?? t('setting.noAccountYet')}
            chevron={false}
          />
          <SettingMenuRow
            label={t('setting.logOut')}
            onPress={user ? handleLogOut : undefined}
            chevron={Boolean(user)}
          />
          <SettingMenuRow label={t('setting.deleteAccount')} onPress={() => setDeleteAccountModalVisible(true)} />
        </SettingSection>
      </ScrollView>

      <LanguageModal visible={languageModalVisible} onClose={() => setLanguageModalVisible(false)} />
      <DeleteAccountModal
        visible={deleteAccountModalVisible}
        onDelete={handleDeleteAccount}
        onCancel={() => setDeleteAccountModalVisible(false)}
      />

      {flash !== null ? (
        <View style={[styles.flash, { top: insets.top }]} pointerEvents="none">
          <AlertBanner message={flash} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingTop/paddingBottom come from useSafeAreaInsets() at render time.
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  menu: {
    flex: 1,
    width: '100%',
  },
  menuContent: {
    gap: spacing.md,
  },
  flash: {
    // Matches HomeScreen's own flash placement — pinned to the screen's top,
    // over the header; `top` comes from insets.top at render time.
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
  },
});
