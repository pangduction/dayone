import { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderTitlePage from '../components/HeaderTitlePage';
import NotificationToggleRow from '../components/NotificationToggleRow';
import SettingDivider from '../components/SettingDivider';
import TimerPickerModal from '../components/TimerPickerModal';
import type { PickedTime } from '../components/TimerPickerModal';
import { IcArrowRightL } from '../components/icons/CommonIcons';
import { getNotificationSettings, saveNotificationSettings } from '../data/notificationSettings';
import type { NotificationSettings } from '../data/notificationSettings';
import { colors, spacing, typography } from '../theme/tokens';

function to24Hour(hour12: number, period: 'AM' | 'PM'): number {
  const hour = hour12 % 12;
  return period === 'PM' ? hour + 12 : hour;
}

function to12Hour(hour24: number): { hour: number; period: 'AM' | 'PM' } {
  const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  const hour = hour24 % 12;
  return { hour: hour === 0 ? 12 : hour, period };
}

function formatTimeLabel(hour24: number, minute: number): string {
  const { hour, period } = to12Hour(hour24);
  return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
}

/**
 * Figma "Flow 7.1 Notification" (section 3199:8210) — reached from
 * Setting-Main's "Notifications" row. Five frames, one screen: the same
 * three-toggle "Setting Menu" throughout, with the Daily Reminder block
 * expanding to show a "Timer" row once it's on (Setting-Notification-
 * Monthly reminder-2 / -3, nodes 3198:7768 / 3199:8131).
 *
 * The master "Notifications" toggle is real, but not in the way a normal
 * preference toggle is: its own subtitle ("Enable notifications in
 * Settings.") says outright that it mirrors the OS permission, which no app
 * can flip directly. It reflects `Notifications.getPermissionsAsync()` and
 * tapping it either prompts for permission (first time, `canAskAgain`) or
 * opens the device's real Settings app (`Linking.openSettings()`) —
 * there's nothing else a tap on it could honestly do once that first
 * prompt has already been answered.
 *
 * Daily Reminder and Monthly Report are real scheduled local notifications
 * (`src/data/notificationSettings.ts`), each gated on that same permission:
 * turning one on first ensures permission (requesting it, or pointing at
 * Settings if it's already been permanently denied) before anything is
 * scheduled. Turning Daily Reminder on immediately shows it as on and opens
 * `TimerPickerModal` — matching the Monthly reminder-1 frame, whose
 * screenshot shows the toggle already green *under* the open modal — but
 * backing out of that modal without hitting Apply reverts the toggle
 * rather than leaving it on with nothing actually scheduled; re-opening the
 * picker from the already-set Timer row just closes on cancel, since there
 * an existing reminder really is still active.
 */
export default function NotificationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [permission, setPermission] = useState<{ granted: boolean; canAskAgain: boolean } | null>(null);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  // Distinguishes "just turned the toggle on, picking a time for the first
  // time" from "editing an already-active reminder's time" — they need
  // different behavior if the sheet gets cancelled.
  const [timerModalMode, setTimerModalMode] = useState<'enable' | 'edit'>('enable');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([getNotificationSettings(), Notifications.getPermissionsAsync()]).then(
        ([loadedSettings, permissionStatus]) => {
          if (cancelled) return;
          setSettings(loadedSettings);
          setPermission({ granted: permissionStatus.granted, canAskAgain: permissionStatus.canAskAgain });
        },
      );
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handleMasterTogglePress = async () => {
    if (!permission) return;
    if (!permission.granted && permission.canAskAgain) {
      const result = await Notifications.requestPermissionsAsync();
      setPermission({ granted: result.granted, canAskAgain: result.canAskAgain });
    } else {
      // Either already granted (only Settings can revoke it) or permanently
      // denied (only Settings can re-grant it) — either way, Settings is
      // the only place left that can actually change this.
      Linking.openSettings();
    }
  };

  /** Ensures notification permission before a sub-toggle turns on; prompts or routes to Settings as needed. Returns whether it's safe to proceed. */
  const ensurePermission = async (): Promise<boolean> => {
    if (!permission) return false;
    if (permission.granted) return true;
    if (permission.canAskAgain) {
      const result = await Notifications.requestPermissionsAsync();
      setPermission({ granted: result.granted, canAskAgain: result.canAskAgain });
      return result.granted;
    }
    Alert.alert('Notifications are off', 'Turn on notifications in Settings to receive this reminder.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]);
    return false;
  };

  const handleDailyReminderChange = async (next: boolean) => {
    if (!settings) return;
    if (next) {
      const granted = await ensurePermission();
      if (!granted) return;
      setSettings({ ...settings, dailyReminderEnabled: true });
      setTimerModalMode('enable');
      setTimerModalVisible(true);
      return;
    }
    const updated: NotificationSettings = { ...settings, dailyReminderEnabled: false };
    setSettings(updated);
    await saveNotificationSettings(updated);
  };

  const handleEditTimer = () => {
    setTimerModalMode('edit');
    setTimerModalVisible(true);
  };

  const handleTimerClose = () => {
    setTimerModalVisible(false);
    if (timerModalMode === 'enable' && settings) {
      setSettings({ ...settings, dailyReminderEnabled: false });
    }
  };

  const handleTimerApply = async (time: PickedTime) => {
    if (!settings) return;
    const updated: NotificationSettings = {
      ...settings,
      dailyReminderEnabled: true,
      dailyReminderHour: to24Hour(time.hour, time.period),
      dailyReminderMinute: time.minute,
    };
    setSettings(updated);
    setTimerModalVisible(false);
    await saveNotificationSettings(updated);
  };

  const handleMonthlyReportChange = async (next: boolean) => {
    if (!settings) return;
    if (next) {
      const granted = await ensurePermission();
      if (!granted) return;
    }
    const updated: NotificationSettings = { ...settings, monthlyReportEnabled: next };
    setSettings(updated);
    await saveNotificationSettings(updated);
  };

  const timerValue: PickedTime = settings
    ? { ...to12Hour(settings.dailyReminderHour), minute: settings.dailyReminderMinute }
    : { hour: 9, minute: 0, period: 'PM' };

  return (
    <View style={styles.container}>
      <HeaderTitlePage title="Notifications" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.menu} contentContainerStyle={styles.menuContent}>
        <View style={styles.block}>
          <NotificationToggleRow
            title="Notifications"
            subtitle="Enable notifications in Settings."
            value={!!permission?.granted}
            onValueChange={handleMasterTogglePress}
          />
        </View>

        <SettingDivider />

        <View style={styles.block}>
          <NotificationToggleRow
            title="Daily Reminder"
            subtitle="Set a time to receive a reminder to wrap up your day."
            value={settings?.dailyReminderEnabled ?? false}
            onValueChange={handleDailyReminderChange}
          />
          {settings?.dailyReminderEnabled ? (
            <>
              <View style={styles.innerDivider} />
              <Pressable
                style={styles.timerRow}
                onPress={handleEditTimer}
                accessibilityRole="button"
                accessibilityLabel={`Timer, ${formatTimeLabel(settings.dailyReminderHour, settings.dailyReminderMinute)}`}
              >
                <Text style={[typography.subtext, styles.timerLabel]}>Timer</Text>
                <Text style={[typography.subtext, styles.timerValue]}>
                  {formatTimeLabel(settings.dailyReminderHour, settings.dailyReminderMinute)}
                </Text>
                <IcArrowRightL size={20} color={colors.textSecondary} />
              </Pressable>
            </>
          ) : null}
        </View>

        <SettingDivider />

        <View style={styles.block}>
          <NotificationToggleRow
            title="Monthly Report"
            subtitle="Get a summary of your month on the morning of the 1st."
            value={settings?.monthlyReportEnabled ?? false}
            onValueChange={handleMonthlyReportChange}
          />
        </View>
      </ScrollView>

      <TimerPickerModal
        visible={timerModalVisible}
        value={timerValue}
        onClose={handleTimerClose}
        onApply={handleTimerApply}
      />
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
  block: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing[5],
    gap: spacing.md,
  },
  innerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    width: '100%',
    paddingVertical: spacing[5],
  },
  timerLabel: {
    flex: 1,
    color: colors.textStrong,
  },
  timerValue: {
    flex: 1,
    textAlign: 'right',
    color: colors.accent,
  },
});
