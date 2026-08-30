import { ScrollView, StyleSheet, View } from 'react-native';
import Text from '../components/Text';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderTitlePage from '../components/HeaderTitlePage';
import { useLanguage } from '../i18n/LanguageContext';
import { strings } from '../i18n/strings';
import { colors, spacing, typography } from '../theme/tokens';

/**
 * Setting → FAQ. No frame for this anywhere in the Figma file — the row
 * carried a chevron but no destination (see SettingScreen's own TODO) — so
 * this is a plain, real static Q&A list on the same `HeaderTitlePage` shell
 * `TermsOfServiceScreen`/`ExportToPdfScreen` already use, with content
 * written to match what the app actually does rather than ported from a
 * design node. Content lives in `strings.ts`'s `faq.items` (an array, so it
 * reads straight from `strings[language]` the same way `DateRangeModal`
 * reads its weekday header — `t()` only ever resolves to a single string).
 */
export default function FaqScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { language, t } = useLanguage();
  const items = strings[language].faq.items;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <HeaderTitlePage title={t('faq.title')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={[typography.subtext, styles.question]}>{item.q}</Text>
            <Text style={[typography.body, styles.answer]}>{item.a}</Text>
          </View>
        ))}
      </ScrollView>
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
  content: {
    gap: spacing[7],
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing[10],
  },
  item: {
    gap: spacing.sm,
  },
  question: {
    color: colors.textStrong,
  },
  answer: {
    color: colors.textSecondary,
  },
});
