import { Pressable, StyleSheet } from 'react-native';
import Text from './Text';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Figma "Button / M / Ghost / Secondary" (component node 3192:9209), used for
 * the post detail header's "Edit" action: white background, 1px
 * `colors.borderSubtle` border, min-height 40, paddingHorizontal 16,
 * radius.md, `shadows.xs`, centered `typography.subtext` label in
 * `colors.textSecondary`.
 */
export default function GhostButton({ label, onPress, disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={[typography.subtext, styles.label]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  label: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
