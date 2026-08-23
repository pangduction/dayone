import { Pressable, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { radius, spacing } from '../theme/tokens';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Figma "Button/Icon/Plain": a bare 40x40 tap target, 8px padding, 16px
 * radius, no background. Used for header back/menu buttons and inline
 * icon actions (e.g. the mic button on the Add screen).
 */
export default function IconButton({ children, onPress, accessibilityLabel, style }: Props) {
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
    width: 40,
    height: 40,
    padding: spacing.sm,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
