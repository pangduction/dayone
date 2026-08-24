import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderX from '../components/HeaderX';
import SettingSection from '../components/SettingSection';
import SettingMenuRow from '../components/SettingMenuRow';
import SettingDivider from '../components/SettingDivider';
import DateRangeModal from '../components/DateRangeModal';
import { dateKey } from '../data/posts';
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
 * as its own flow (7.1 Notification, 7.2 Language, etc.) gets built next.
 *
 * "Export to PDF" (Flow 7.3) is wired: per Figma node 3199:8735, tapping it
 * opens the date-range modal directly over this screen rather than pushing a
 * dedicated page first — the real Export to PDF screen only exists once
 * "Apply" is pressed, pre-filled with the chosen range. The modal's own
 * default, on first open, is the last 7 days.
 */
export default function SettingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [exportRangeVisible, setExportRangeVisible] = useState(false);
  const [exportRange, setExportRange] = useState(lastSevenDaysRange);

  return (
    <View style={styles.container}>
      <HeaderX onClose={() => navigation.goBack()} />

      <ScrollView style={styles.menu} contentContainerStyle={styles.menuContent}>
        <SettingSection title="APP">
          {/* TODO: wire once Flow 7.1 Notification exists. "Off" matches
              Figma's default; it should read the real scheduled-reminder
              state once that flow is built. */}
          <SettingMenuRow label="Notifications" value="Off" />
          {/* TODO: wire once Flow 7.2 Language exists. */}
          <SettingMenuRow label="Language" value="English" />
          <SettingMenuRow label="Export to PDF" onPress={() => setExportRangeVisible(true)} />
        </SettingSection>

        <SettingDivider />

        <SettingSection title="SUPPORT">
          {/* TODO: Figma gives this row a chevron but no destination screen
              anywhere in the file. */}
          <SettingMenuRow label="FAQ" />
          {/* TODO: wire once Flow 7.4 Help & Support exists. */}
          <SettingMenuRow label="Help & Support" />
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

      <DateRangeModal
        visible={exportRangeVisible}
        startDate={exportRange.startDate}
        endDate={exportRange.endDate}
        onClose={() => setExportRangeVisible(false)}
        onApply={(range) => {
          setExportRange(range);
          setExportRangeVisible(false);
          navigation.navigate('ExportToPdf', range);
        }}
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
});
