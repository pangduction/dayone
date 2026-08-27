import { StyleSheet, View } from 'react-native';
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
 * Both rows are inert. Figma draws a chevron on each but the file has no
 * frame anywhere showing what either actually says — there's no real legal
 * text to port, only a destination that doesn't exist yet, the same gap
 * FAQ and App review are already left with a TODO for on Setting-Main.
 */
export default function TermsOfServiceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <HeaderTitlePage title={t('termsOfService.title')} onBack={() => navigation.goBack()} />

      <View style={styles.menu}>
        {/* TODO: no frame in Figma for the actual Terms of Use text. */}
        <SettingMenuRow label={t('termsOfService.termsOfUse')} />
        {/* TODO: no frame in Figma for the actual Privacy Policy text. */}
        <SettingMenuRow label={t('termsOfService.privacyPolicy')} />
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
