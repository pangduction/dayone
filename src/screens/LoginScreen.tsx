import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Text from '../components/Text';
import Button from '../components/Button';
import Calendar, { CalendarCell } from '../components/Calendar';
import { colors, spacing } from '../theme/tokens';

/**
 * Figma: "Login - 1" (node 3177:2606)
 * https://www.figma.com/design/Fv2MwZPH1NImXNF16W5cxw/DayOne?node-id=3177-2606
 *
 * The "splash thumbnail" layer (node 3182:2716) is a flattened image export
 * in Figma with no child nodes — but it depicts the same UI as the real
 * "Calendar" component (Design System page, node 3184:3400). Per project
 * decision, this screen renders that real Calendar component tree instead
 * of re-exporting the flattened image. `sampleWeeks` below is illustrative
 * placeholder data, not tied to a live data source yet.
 */
export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.titleBlock}>
          <Text variant="display">DayOne</Text>
          <Text variant="overline" color={colors.textSecondary}>
            Collect your daily moments in one page.
          </Text>
        </View>

        <Calendar weeks={sampleWeeks} />
      </View>

      <View style={styles.loginButtons}>
        <Button
          variant="social"
          label="Continue with Google"
          backgroundColor={colors.buttonLight}
          textColor={colors.buttonDark}
        />
        <Button
          variant="social"
          label="Continue with Apple"
          backgroundColor={colors.buttonDark}
          textColor={colors.textOnDark}
        />
        <Button
          variant="social"
          label="Continue with Kakao"
          backgroundColor={colors.kakaoYellow}
          textColor={colors.buttonDark}
        />
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

// Illustrative sample data for the Calendar preview — Sat-start month matching
// the Figma reference screenshot's layout. Not wired to a real data source.
const sampleWeeks: CalendarCell[][] = [
  [null, null, null, null, null, null, { date: 1, status: 'record' }],
  [
    { date: 2 },
    { date: 3, status: 'photo' },
    { date: 4 },
    { date: 5, status: 'record' },
    { date: 6, status: 'photo' },
    { date: 7, status: 'record' },
    { date: 8 },
  ],
  [
    { date: 9, status: 'photo' },
    { date: 10 },
    { date: 11, status: 'record' },
    { date: 12, status: 'photo' },
    { date: 13 },
    { date: 14, status: 'photo' },
    { date: 15, status: 'photo' },
  ],
  [
    { date: 16, status: 'photo' },
    { date: 17, status: 'record' },
    { date: 18, status: 'photo' },
    { date: 19 },
    { date: 20, status: 'record' },
    { date: 21 },
    { date: 22, status: 'photo' },
  ],
  [
    { date: 23, status: 'today' },
    { date: 24, status: 'photo' },
    { date: 25, status: 'photo' },
    { date: 26, status: 'photo' },
    { date: 27 },
    { date: 28 },
    { date: 29 },
  ],
  [{ date: 30 }, { date: 31, status: 'record' }, null, null, null, null, null],
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 47,
    paddingBottom: 34,
  },
  body: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    paddingVertical: 80,
    paddingHorizontal: spacing.lg,
  },
  titleBlock: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loginButtons: {
    width: '100%',
    paddingHorizontal: spacing.xl + spacing.sm,
    gap: spacing.sm,
  },
});
