import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, View } from 'react-native';
import Text from '../components/Text';
import SocialLoginButton from '../components/SocialLoginButton';
import { AppleLogo, GoogleLogo, KakaoLogo } from '../components/icons/SocialLogos';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, spacing, typography } from '../theme/tokens';

/**
 * Figma: "Login - 1" (node 3177:2606)
 * https://www.figma.com/design/Fv2MwZPH1NImXNF16W5cxw/Daypic-기획-?node-id=3177-2606
 *
 * The splash thumbnail (calendar photo collage, node 3182:2716) is the
 * exported PNG saved at assets/splash-collage.png.
 */
export default function LoginScreen() {
  const { t } = useLanguage();
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.titleBlock}>
          {/* Brand wordmark: stays "DayOne" and keeps its Jura font in every language. */}
          <Text style={styles.title}>DayOne</Text>
          <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
        </View>

        <Image
          source={require('../../assets/splash-collage.png')}
          style={styles.splash}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>

      <View style={styles.loginButtons}>
        <SocialLoginButton
          label={t('login.continueWithGoogle')}
          backgroundColor={colors.buttonLight}
          textColor={colors.buttonDark}
          Logo={GoogleLogo}
        />
        <SocialLoginButton
          label={t('login.continueWithApple')}
          backgroundColor={colors.buttonDark}
          textColor={colors.textOnDark}
          Logo={AppleLogo}
        />
        <SocialLoginButton
          label={t('login.continueWithKakao')}
          backgroundColor={colors.kakaoYellow}
          textColor={colors.buttonDark}
          Logo={KakaoLogo}
        />
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 47,
    paddingBottom: 34,
  },
  body: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    paddingVertical: 80,
  },
  titleBlock: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.display.fontFamily,
    fontSize: typography.display.fontSize,
    letterSpacing: typography.display.letterSpacing,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.overline.fontFamily,
    fontSize: typography.overline.fontSize,
    letterSpacing: typography.overline.letterSpacing,
    color: colors.textSecondary,
  },
  splash: {
    flex: 1,
    width: '100%',
    aspectRatio: 844 / 855,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  loginButtons: {
    width: '100%',
    paddingHorizontal: spacing.xl + spacing.sm,
    gap: spacing.sm,
  },
});
