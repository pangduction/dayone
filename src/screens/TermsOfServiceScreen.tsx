import { Alert, Linking, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderTitlePage from '../components/HeaderTitlePage';
import SettingMenuRow from '../components/SettingMenuRow';
import { useLanguage } from '../i18n/LanguageContext';
import { colors } from '../theme/tokens';

/**
 * Figma "Flow 7.5 Terms of Service" (section 3202:5287) — reached from
 * Setting-Main's "Terms of Service" row. Just one frame: a bare list of two
 * rows, "Terms of Use" and "Privacy Policy" (node 3202:5288), on the same
 * `HeaderTitlePage` shell Export to PDF's list screen already uses (its own
 * doc comment names this screen as its other intended reuse).
 *
 * Figma has no frame anywhere for what either document actually says, since
 * there's no in-app legal text to render — both rows instead open the real,
 * publicly published document (a Notion page, in this app's case) in the
 * device browser. The URLs are read from `EXPO_PUBLIC_TERMS_OF_USE_URL` /
 * `EXPO_PUBLIC_PRIVACY_POLICY_URL` (see .env.example), the same
 * client-safe-env-var pattern `src/data/contact.ts` already uses for the
 * Help & Support endpoint — so publishing the real pages later is a config
 * change, not a code change. Until a URL is set, the row still responds
 * (nothing here should look like a dead button) with a plain "not published
 * yet" alert instead of silently doing nothing.
 */
export default function TermsOfServiceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const openOrExplain = (url: string | undefined) => {
    if (url) {
      Linking.openURL(url);
      return;
    }
    Alert.alert(t('termsOfService.linkNotReadyTitle'), t('termsOfService.linkNotReadyBody'));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <HeaderTitlePage title={t('termsOfService.title')} onBack={() => navigation.goBack()} />

      <View style={styles.menu}>
        <SettingMenuRow
          label={t('termsOfService.termsOfUse')}
          onPress={() => openOrExplain(process.env.EXPO_PUBLIC_TERMS_OF_USE_URL)}
        />
        <SettingMenuRow
          label={t('termsOfService.privacyPolicy')}
          onPress={() => openOrExplain(process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingTop/paddingBottom come from useSafeAreaInsets() at render time.
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  menu: {
    width: '100%',
  },
});
