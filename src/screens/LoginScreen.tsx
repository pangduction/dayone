import { useEffect, useState } from 'react';
import { Alert, Image, Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import Text from '../components/Text';
import SocialLoginButton from '../components/SocialLoginButton';
import { AppleLogo, GoogleLogo, KakaoLogo } from '../components/icons/SocialLogos';
import { signInWithFirebaseCredential } from '../auth/firebaseAuth';
import { isFirebaseConfigured } from '../data/firebase';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, spacing, typography } from '../theme/tokens';

// Required once, at module scope, so the browser tab opened for Google's
// sign-in flow actually closes and hands control back to the app when it
// redirects — without this the tab can be left dangling on some platforms.
WebBrowser.maybeCompleteAuthSession();

/**
 * Figma: "Login - 1" (node 3177:2606)
 * https://www.figma.com/design/Fv2MwZPH1NImXNF16W5cxw/Daypic-기획-?node-id=3177-2606
 *
 * The splash thumbnail (calendar photo collage, node 3182:2716) is the
 * exported PNG saved at assets/splash-collage.png.
 *
 * All three buttons are wired to real sign-in (Firebase Authentication,
 * `src/data/firebase.ts` / `src/auth/`), with different real-world caveats:
 * - **Google** uses `expo-auth-session`'s Google provider to get an ID
 *   token via the device browser, then exchanges it for a Firebase
 *   credential. Needs `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` set (.env.example).
 * - **Apple** uses `expo-apple-authentication`'s native sheet — iOS only,
 *   and only once "Sign in with Apple" is enabled on a real Apple Developer
 *   Program membership; the button explains itself on Android instead of
 *   silently failing.
 * - **Kakao** has no Firebase-native provider (unlike Google/Apple, Kakao
 *   would need its own token-exchange server) — deferred, and says so
 *   rather than pretending to sign in.
 * Any config that isn't set yet reads as "coming soon" rather than a dead
 * tap or a native crash — see `handleMissingConfig` below.
 */
export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [busyProvider, setBusyProvider] = useState<'google' | 'apple' | null>(null);

  const [, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const idToken = googleResponse.params.id_token;
    const credential = GoogleAuthProvider.credential(idToken);
    signInWithFirebaseCredential(credential)
      .catch(() => Alert.alert(t('login.signInFailedTitle'), t('login.signInFailedBody')))
      .finally(() => setBusyProvider(null));
  }, [googleResponse, t]);

  const handleMissingConfig = () => {
    Alert.alert(t('login.notConfiguredTitle'), t('login.notConfiguredBody'));
  };

  const handleGoogleLogin = () => {
    if (!isFirebaseConfigured || !process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      handleMissingConfig();
      return;
    }
    setBusyProvider('google');
    promptGoogleAsync().catch(() => setBusyProvider(null));
  };

  const handleAppleLogin = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert(t('login.appleUnavailableTitle'), t('login.appleUnavailableBody'));
      return;
    }
    if (!(await AppleAuthentication.isAvailableAsync())) {
      Alert.alert(t('login.appleUnavailableTitle'), t('login.appleUnavailableBody'));
      return;
    }
    if (!isFirebaseConfigured) {
      handleMissingConfig();
      return;
    }
    try {
      setBusyProvider('apple');
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!appleCredential.identityToken) throw new Error('No identity token from Apple');
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({ idToken: appleCredential.identityToken });
      await signInWithFirebaseCredential(credential);
    } catch (error) {
      // Apple's own "user tapped Cancel" error — not a real failure.
      if ((error as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert(t('login.signInFailedTitle'), t('login.signInFailedBody'));
    } finally {
      setBusyProvider(null);
    }
  };

  const handleKakaoLogin = () => {
    Alert.alert(t('login.kakaoComingSoonTitle'), t('login.kakaoComingSoonBody'));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
          onPress={busyProvider ? undefined : handleGoogleLogin}
        />
        <SocialLoginButton
          label={t('login.continueWithApple')}
          backgroundColor={colors.buttonDark}
          textColor={colors.textOnDark}
          Logo={AppleLogo}
          onPress={busyProvider ? undefined : handleAppleLogin}
        />
        <SocialLoginButton
          label={t('login.continueWithKakao')}
          backgroundColor={colors.kakaoYellow}
          textColor={colors.buttonDark}
          Logo={KakaoLogo}
          onPress={busyProvider ? undefined : handleKakaoLogin}
        />
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingTop/paddingBottom come from useSafeAreaInsets() at render time.
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
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
