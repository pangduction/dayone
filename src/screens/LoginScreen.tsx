import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SocialLoginButton from '../components/SocialLoginButton';
import { colors, spacing, typography } from '../theme/tokens';

/**
 * Figma: "Login - 1" (node 3177:2606)
 * https://www.figma.com/design/Fv2MwZPH1NImXNF16W5cxw/Daypic-기획-?node-id=3177-2606
 *
 * The "splash thumbnail" (calendar photo collage, node 3182:2716) is a
 * placeholder for the same reason noted in SocialLoginButton — replace with
 * the real exported image once it can be fetched.
 */
export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>DayOne</Text>
          <Text style={styles.subtitle}>Collect your daily moments in one page.</Text>
        </View>

        <View style={styles.splashPlaceholder}>
          <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.splashPlaceholderText}>splash thumbnail (TODO: real asset)</Text>
        </View>
      </View>

      <View style={styles.loginButtons}>
        <SocialLoginButton
          label="Continue with Google"
          backgroundColor={colors.buttonLight}
          textColor={colors.buttonDark}
          iconName="logo-google"
          iconColor={colors.buttonDark}
        />
        <SocialLoginButton
          label="Continue with Apple"
          backgroundColor={colors.buttonDark}
          textColor={colors.textOnDark}
          iconName="logo-apple"
          iconColor={colors.textOnDark}
        />
        <SocialLoginButton
          label="Continue with Kakao"
          backgroundColor={colors.kakaoYellow}
          textColor={colors.buttonDark}
          iconName="chatbubble"
          iconColor={colors.buttonDark}
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
  splashPlaceholder: {
    flex: 1,
    width: '100%',
    aspectRatio: 844 / 855,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  splashPlaceholderText: {
    fontFamily: typography.overline.fontFamily,
    fontSize: typography.overline.fontSize,
    color: colors.textSecondary,
  },
  loginButtons: {
    width: '100%',
    paddingHorizontal: spacing.xl + spacing.sm,
    gap: spacing.sm,
  },
});
