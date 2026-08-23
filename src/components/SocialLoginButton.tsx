import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, typography } from '../theme/tokens';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  backgroundColor: string;
  textColor: string;
  iconName: IoniconName;
  iconColor: string;
  onPress?: () => void;
};

/**
 * Maps to Figma's `Button/Google`, `Button/Apple`, `Button/Kakao` instances
 * on the Login screen (node 3177:2619 "LoginButtons").
 *
 * NOTE: icons currently use @expo/vector-icons brand glyphs as a stand-in —
 * this sandbox's network policy blocks downloading the exact Figma-exported
 * logo assets (www.figma.com is not reachable, confirmed again via
 * get_design_context/download_assets on 2026-08-23). Swap `iconName` usage
 * below for the real exported assets once reachable — nodes:
 * Logo/Google 3182:2741, Logo/Apple 3182:2740, Logo/Kakao 3182:2739.
 */
export default function SocialLoginButton({
  label,
  backgroundColor,
  textColor,
  iconName,
  iconColor,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, { backgroundColor }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.content}>
        <Ionicons name={iconName} size={18} color={iconColor} />
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
    minHeight: 48,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    letterSpacing: typography.body.letterSpacing,
  },
});
