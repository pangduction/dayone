import { Pressable, StyleSheet } from 'react-native';
import Text from './Text';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

export type ChipStatus = 'enabled' | 'active' | 'disabled';

type Props = {
  label: string;
  status: ChipStatus;
  onPress?: () => void;
  /**
   * Overrides the chip's own fixed 72.5 width — Modal/Language (node
   * 3199:8544) reuses this same component full-width, one per row, rather
   * than four across a grid. Everything else (height, radius, border,
   * shadow, label style) stays identical between the two uses.
   */
  style?: StyleProp<ViewStyle>;
};

/**
 * Figma "Chip Button" (node 3198:4670 and its siblings), used for the month
 * picker's twelve months: 72.5 x 40, paddingHorizontal 8, `radius.sm`, white
 * fill, `shadows.xs`, and a `typography.body` label.
 *
 * The vertical padding is deliberately not set. Figma's auto-layout says 10,
 * but the chip also has a fixed height of 40, and the fixed height wins: its
 * text node measures y=8.5 / height=23, i.e. one Body line (22.5) centred in
 * the 40, with 8.5 above and below rather than 10. Applying the 10 here left
 * only 40 - 2 (border) - 20 = 18pt for a 22.5pt line, and the descenders of
 * "May" / "Aug" / "Sep" were cut off. Centring the line in the full height is
 * both what Figma renders and what fits.
 *
 * Its three states differ only in the border and the label:
 *   enabled  — `colors.border` border,      `colors.textStrong` label
 *   active   — `colors.accent` border,      `colors.textStrong` label
 *   disabled — `colors.border` border,      `colors.borderSubtle` label
 */
export default function ChipButton({ label, status, onPress, style }: Props) {
  const disabled = status === 'disabled';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, status === 'active' && styles.active, style]}
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
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
