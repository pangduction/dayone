import { Pressable, StyleSheet, View } from 'react-native';
import type { ComponentProps, ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { colors, radius, shadow, spacing } from '../theme/tokens';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type ButtonVariant = 'primary' | 'secondaryGhost' | 'fab' | 'social';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /**
   * Maps to Figma's Button component set (Design System page):
   * - "primary" → Button / L / Filled / Primary (node 3192:9208) — full-width dark fill, white text
   * - "secondaryGhost" → Button / M / Ghost / Secondary (node 3192:9209) — white fill, bordered, hugs content
   * - "fab" → Button / S / Filled / FAB (node 3192:11841) — translucent dark pill, label + trailing icon
   * - "social" → Login screen's "Button/Google|Apple|Kakao" instances (node 3177:2619 "LoginButtons")
   *   — full-width, leading icon slot, per-provider background/text color (pass `backgroundColor`/`textColor`)
   */
  variant?: ButtonVariant;
  /** Only used by the "fab" variant — defaults to the Figma "ic/cross" glyph. */
  iconName?: IoniconName;
  /** Required for "social" — Figma has no single fixed color for this variant, it varies per provider. */
  backgroundColor?: string;
  /** Required for "social". */
  textColor?: string;
  /**
   * Only used by "social" — the leading logo slot (Figma "Logo/Google" etc,
   * node 3182:2748/2745/2742). Real brand logo SVGs can't be downloaded in
   * this environment (network policy blocks the Figma asset CDN), so this
   * defaults to an empty 18x18 placeholder that preserves layout — pass an
   * <Image>/<Svg> here once the real logo assets are available.
   */
  icon?: ReactNode;
};

export default function Button({
  label,
  onPress,
  disabled,
  variant = 'primary',
  iconName = 'close',
  backgroundColor,
  textColor,
  icon,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        variantContainerStyles[variant],
        variant === 'social' && { backgroundColor },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {variant === 'social' && <View style={styles.socialIconSlot}>{icon}</View>}
      <Text
        variant={variantTextStyle[variant]}
        color={variant === 'social' ? textColor : variantTextColor[variant]}
        style={variant === 'primary' || variant === 'social' ? styles.centeredLabel : undefined}
      >
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
  social: 'body',
} as const;

const variantTextColor: Record<Exclude<ButtonVariant, 'social'>, string> = {
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
  centeredLabel: {
    textAlign: 'center',
  },
  fabIcon: {
    marginLeft: 3,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconSlot: {
    width: 18,
    height: 18,
    marginRight: spacing.md,
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
  // Figma: Login "Button/Google|Apple|Kakao" — h-48 px-24 gap-16 rounded-16
  social: {
    width: '100%',
    height: 48,
    minHeight: 48,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
  },
});
