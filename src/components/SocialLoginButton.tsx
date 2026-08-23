import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ComponentType } from 'react';
import { radius, spacing, typography } from '../theme/tokens';

type LogoProps = { size?: number };

type Props = {
  label: string;
  backgroundColor: string;
  textColor: string;
  Logo: ComponentType<LogoProps>;
  onPress?: () => void;
};

/**
 * Maps to Figma's `Button/Google`, `Button/Apple`, `Button/Kakao` instances
 * on the Login screen (node 3177:2619 "LoginButtons"). The brand mark is one
 * of the vector logos in `./icons/SocialLogos.tsx` (ported from Figma nodes
 * Logo/Google 3182:2741, Logo/Apple 3182:2740, Logo/Kakao 3182:2739; raw
 * sources saved at assets/logo-google.svg, assets/logo-apple.svg,
 * assets/logo-kakao.svg).
 */
export default function SocialLoginButton({ label, backgroundColor, textColor, Logo, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, { backgroundColor }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.content}>
        <Logo size={18} />
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
