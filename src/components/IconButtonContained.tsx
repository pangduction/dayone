import { Pressable, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme/tokens';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Figma "Button/Icon/Contained": a white, shadowed icon chip — distinct
 * from the bare "Button/Icon/Plain" (see IconButton.tsx). Used for Home's
 * header share button. paddingHorizontal spacing.sm (8), paddingVertical 5
 * (Figma exact value, not on the spacing scale), radius.sm, colors.surface
 * bg, shadows.xs.
 */
export default function IconButtonContained({ children, onPress, accessibilityLabel, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5, // Figma: exact value, doesn't land on the spacing scale
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
});
