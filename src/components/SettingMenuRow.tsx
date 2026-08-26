import { Pressable, StyleSheet, View } from 'react-native';
import Text from './Text';
import { IcArrowRightL } from './icons/CommonIcons';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  label: string;
  /** A trailing value, right-aligned opposite the label — e.g. "Off", "English", "v1.0.0". */
  value?: string;
  /** Override the value's color — Export to PDF's "Date Range" row shows its value in `colors.accent` (node 3201:6515) rather than the usual placeholder grey. */
  valueColor?: string;
  /** Whether the row navigates somewhere. Rows with no chevron are pure info (App version, Log in). */
  chevron?: boolean;
  onPress?: () => void;
};

/**
 * Figma "Menu" (e.g. node 3198:7121) — one row of the Setting screen's list.
 * min-height 44, paddingHorizontal 16 / paddingVertical 12, gap 8.
 *
 * Label and value are both `flex: 1`, splitting whatever width is left after
 * the optional chevron evenly between them (Figma: 161/161 either side of a
 * 358-wide row minus the chevron and two 8pt gaps) — flex reproduces that
 * ratio at any width rather than a hard-coded 161.
 *
 * A row with no `onPress` renders as a plain View, matching the convention
 * elsewhere (CalendarDateCell, PostReportThumbnail): "App version" and
 * "Log in" are informational and carry no chevron either.
 *
 * The chevron is G600 (verified via get_variable_defs on node 3198:7124) —
 * not the G800 a `typography.subtext` label would suggest.
 */
export default function SettingMenuRow({ label, value, valueColor, chevron = true, onPress }: Props) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      style={styles.row}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={value ? `${label}, ${value}` : label}
    >
      <Text style={[typography.subtext, styles.label]} numberOfLines={1}>
        {label}
      </Text>
      {value !== undefined ? (
        <Text style={[typography.subtext, styles.value, valueColor ? { color: valueColor } : null]} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {chevron ? <IcArrowRightL size={20} color={colors.textSecondary} /> : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing[5],
  },
  label: {
    flex: 1,
    color: colors.textStrong, // Figma G800
  },
  value: {
    flex: 1,
    textAlign: 'right',
    color: colors.textPlaceholder, // Figma G400
  },
});
