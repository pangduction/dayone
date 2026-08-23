import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

export type ChipStatus = 'enabled' | 'active' | 'disabled';

type Props = {
  label: string;
  status: ChipStatus;
  onPress?: () => void;
};

/**
 * Figma "Chip Button" (node 3198:4670 and its siblings), used for the month
 * picker's twelve months: 72.5 x 40, paddingHorizontal 8 / paddingVertical 10,
 * `radius.sm`, white fill, `shadows.xs`, and a `typography.body` label.
 *
 * Its three states differ only in the border and the label:
 *   enabled  — `colors.border` border,      `colors.textStrong` label
 *   active   — `colors.accent` border,      `colors.textStrong` label
 *   disabled — `colors.border` border,      `colors.borderSubtle` label
 */
export default function ChipButton({ label, status, onPress }: Props) {
  const disabled = status === 'disabled';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, status === 'active' && styles.active]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected: status === 'active' }}
    >
      <Text style={[typography.body, styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 72.5, // Figma-exact: four across the sheet's 326 content width
    height: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing[4],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.xs,
  },
  active: {
    borderColor: colors.accent,
  },
  label: {
    color: colors.textStrong,
    textAlign: 'center',
  },
  labelDisabled: {
    color: colors.borderSubtle,
  },
});
