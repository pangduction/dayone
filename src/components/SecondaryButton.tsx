import { Pressable, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows, spacing } from '../theme/tokens';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  /** Figma uses radius.sm inline (Record/Edit, Record/View) and radius.lg for the recording screen's larger button. */
  size?: 'inline' | 'large';
  style?: StyleProp<ViewStyle>;
};

/**
 * Figma "Button/Secondary/Default" — the glossy light button carrying a play
 * or pause glyph. It appears at two sizes: inline inside Record/Edit and
 * Record/View (node 3192:12489, paddingHorizontal 8 / paddingVertical 5 at
 * radius.sm), and larger on the recording screen (node 3184:7871, 56x48 at
 * radius.lg).
 *
 * Its surface is a white-to-transparent gradient over `colors.buttonSecondary`,
 * and its Figma shadow stacks a drop shadow with a 1px ring. React Native has
 * no shadow spread, so the ring is a real 1px border and only the drop shadow
 * comes from `shadows.secondary`.
 */
export default function SecondaryButton({
  children,
  onPress,
  accessibilityLabel,
  size = 'inline',
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, size === 'large' ? styles.large : styles.inline, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <LinearGradient
        // Figma: linear-gradient(180deg, #fff 7.29%, rgba(255,255,255,0) 65.625%)
        colors={['#FFFFFF', 'rgba(255, 255, 255, 0)']}
        locations={[0.0729, 0.6563]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.buttonSecondary,
    borderWidth: 1,
    borderColor: colors.buttonSecondaryRing,
    ...shadows.secondary,
  },
  inline: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5, // Figma-exact, off the spacing scale
    borderRadius: radius.sm,
  },
  large: {
    width: 56,
    height: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.lg,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
