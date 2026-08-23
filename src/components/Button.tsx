import { Pressable, StyleSheet, View } from 'react-native';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { colors, radius, shadow, spacing } from '../theme/tokens';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type ButtonVariant = 'primary' | 'secondaryGhost' | 'fab';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /**
   * Maps to Figma's Button component set (Design System page):
   * - "primary" → Button / L / Filled / Primary (node 3192:9208) — full-width dark fill, white text
   * - "secondaryGhost" → Button / M / Ghost / Secondary (node 3192:9209) — white fill, bordered, hugs content
   * - "fab" → Button / S / Filled / FAB (node 3192:11841) — translucent dark pill, label + trailing icon
   */
  variant?: ButtonVariant;
  /** Only used by the "fab" variant — defaults to the Figma "ic/cross" glyph. */
  iconName?: IoniconName;
};

export default function Button({ label, onPress, disabled, variant = 'primary', iconName = 'close' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        variantContainerStyles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text variant={variantTextStyle[variant]} color={variantTextColor[variant]} style={variant === 'primary' ? styles.primaryLabel : undefined}>
        {label}
      </Text>
      {variant === 'fab' && (
        <View style={styles.fabIcon}>
          <Ionicons name={iconName} size={16} color={colors.white} />
        </View>
      )}
    </Pressable>
  );
}

const variantTextStyle = {
  primary: 'body',
  secondaryGhost: 'subtext',
  fab: 'overline',
} as const;

const variantTextColor: Record<ButtonVariant, string> = {
  primary: colors.white,
  secondaryGhost: colors.gray[600],
  fab: colors.white,
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
  primaryLabel: {
    textAlign: 'center',
  },
  fabIcon: {
    marginLeft: 3,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const variantContainerStyles = StyleSheet.create({
  primary: {
    width: '100%',
    height: 48,
    minHeight: 48,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral[900],
  },
  secondaryGhost: {
    alignSelf: 'flex-start',
    minHeight: 40,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    ...shadow.xs,
  },
  fab: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: 3,
    backgroundColor: 'rgba(3, 3, 3, 0.7)',
  },
});
