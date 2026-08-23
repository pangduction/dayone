import { Pressable, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme/tokens';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Figma "Button / M / Icon / Secondary" (node 3198:4642) — the icon-only
 * sibling of Button / M / Ghost / Secondary, used for the month picker's year
 * stepper. Same white fill, 1px `colors.borderSubtle` border, `radius.md` and
 * `shadows.xs`, but sized around an icon: min-height 40, min-width 44,
 * paddingHorizontal 12.
 */
export default function GhostIconButton({
  children,
  onPress,
  accessibilityLabel,
  disabled,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabled, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 40,
    minWidth: 44,
    paddingHorizontal: spacing[5],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  disabled: {
    opacity: 0.4,
  },
});
