import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderX from '../components/HeaderX';
import SettingSection from '../components/SettingSection';
import SettingMenuRow from '../components/SettingMenuRow';
import SettingDivider from '../components/SettingDivider';
import LanguageModal from '../components/LanguageModal';
import AlertBanner from '../components/AlertBanner';
import { dateKey } from '../data/posts';
import { getNotificationSettings } from '../data/notificationSettings';
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
 * Rows that lead to a sub-flow not yet built are inert (no `onPress`) with a
 * TODO — this screen was asked for first, on its own, so each row is wired up
 * as its own flow (7.5 Terms of Service, etc.) gets built next.
 *
 * "Notifications" (Flow 7.1) is wired to `NotificationScreen`; its value
 * reads "On" only when the OS permission is actually granted *and* at least
 * one of Daily Reminder / Monthly Report is on — matching what the two
 * sub-toggles being off would otherwise silently contradict.
 *
 * "Language" (Flow 7.2) is wired to `LanguageModal`, opened directly over
 * this screen per Figma's own Setting-Language (node 3199:8605) — the same
 * "modal over Setting-Main" pattern Export to PDF's date-range picker uses.
 * English is the only real language: per Setting-Language-Korea (node
 * 3267:5909), tapping the 한국어 chip doesn't select it — the modal stays
 * open with English still active, and an `AlertBanner` ("Not supported
 * yet.") appears on top of the modal itself (`LanguageModal`'s `overlay`
 * slot, since a real `Modal` paints in front of anything this screen draws
 * directly). This screen still owns the message and its 3s auto-dismiss —
 * the same transient-banner timing `HomeScreen`'s post-delete flash uses.
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
 */
export default function SettingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Setting'>>();
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [languageAlert, setLanguageAlert] = useState<string | null>(null);
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

  useEffect(() => {
    if (languageAlert === null) return;
    // Figma doesn't say how long the banner stays; matches HomeScreen's flash.
    const timer = setTimeout(() => setLanguageAlert(null), 3000);
    return () => clearTimeout(timer);
  }, [languageAlert]);

  return (
    <View style={styles.container}>
      <HeaderX onClose={() => navigation.goBack()} />

      <ScrollView style={styles.menu} contentContainerStyle={styles.menuContent}>
        <SettingSection title="APP">
          <SettingMenuRow
            label="Notifications"
            value={notificationsOn ? 'On' : 'Off'}
            onPress={() => navigation.navigate('Notification')}
          />
          <SettingMenuRow label="Language" value="English" onPress={() => setLanguageModalVisible(true)} />
          <SettingMenuRow label="Export to PDF" onPress={() => navigation.navigate('ExportToPdf', lastSevenDaysRange())} />
        </SettingSection>

        <SettingDivider />

        <SettingSection title="SUPPORT">
          {/* TODO: Figma gives this row a chevron but no destination screen
              anywhere in the file. */}
          <SettingMenuRow label="FAQ" />
          <SettingMenuRow label="Help & Support" onPress={() => navigation.navigate('HelpSupport')} />
          {/* TODO: wire once Flow 7.5 Terms of Service exists. */}
          <SettingMenuRow label="Terms of Service" />
          {/* TODO: no screen in Figma for this either — eventually a store
              review deep link (Linking.openURL), not an in-app screen. */}
          <SettingMenuRow label="App review" />
          <SettingMenuRow label="App version" value={Constants.expoConfig?.version ?? '—'} chevron={false} />
        </SettingSection>

        <SettingDivider />

        <SettingSection title="ACCOUNT">
          {/* Figma mocks this as a static row (no chevron) — there's no real
              account system yet, so "Log in" plus a placeholder email is
              exactly what's shown, not a stand-in for something else. */}
          <SettingMenuRow label="Log in" value="hello@mail.com" chevron={false} />
          {/* TODO: no screen/modal for this in Figma, and nothing to log out
              of without real auth. */}
          <SettingMenuRow label="Log out" />
          {/* TODO: wire once Flow 7.6 Delete Account exists. */}
          <SettingMenuRow label="Delete Account" />
        </SettingSection>
      </ScrollView>

      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        onUnsupportedLanguagePress={() => setLanguageAlert('Not supported yet.')}
        alertMessage={languageAlert}
      />

      {flash !== null ? (
        <View style={styles.flash} pointerEvents="none">
          <AlertBanner message={flash} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
    paddingTop: 47,
    paddingBottom: 34,
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
    // over the header.
    position: 'absolute',
    top: 47,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
  },
});
