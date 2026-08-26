import { Pressable, StyleSheet } from 'react-native';
import Text from './Text';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /**
   * Which fill the instance uses. Figma's master (node 3192:9208) is
   * `colors.buttonDark` — Modal/Gallery's "Go to Gallery" — while instances
   * override it: Accent on Modal/Leave's "Leave" (node 3233:4552), Warning on
   * Modal/Delete-Post's "Delete" (node 3233:4923).
   */
  tone?: 'dark' | 'accent' | 'warning';
  style?: StyleProp<ViewStyle>;
};

/**
 * Figma "Button / L / Filled / Primary" (node 3192:9208): height 48,
 * paddingHorizontal 16, paddingVertical 8, radius.lg, centered white
 * `typography.body` label. See `tone` for the two fills in use.
 */
export default function PrimaryButton({ label, onPress, disabled, tone = 'dark', style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        tone === 'accent' && styles.buttonAccent,
        tone === 'warning' && styles.buttonWarning,
        disabled && styles.buttonDisabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={[typography.body, styles.label]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    minHeight: 48,
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.buttonDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonAccent: {
    backgroundColor: colors.accent,
  },
  buttonWarning: {
    backgroundColor: colors.warning,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  label: {
    color: colors.textOnDark,
    textAlign: 'center',
  },
});
