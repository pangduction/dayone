import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Text from '../components/Text';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderX from '../components/HeaderX';
import PostListThumbnail from '../components/PostListThumbnail';
import { IcSearch } from '../components/icons/ListIcons';
import { getPostsForMonth } from '../data/posts';
import type { Post } from '../data/posts';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, radius, spacing, typography } from '../theme/tokens';

/**
 * Figma: "Home-List-Search-1" (node 3192:10548, nothing typed) and
 * "Home-List-Search-2" (node 3192:11125, results) from the "Flow 3. Home의
 * List에서 검색하기" section (3192:10501) — reached from Header/List's
 * ic/search.
 *
 * A Header/X over a Search input field, with matching posts listed below it
 * as the same Post List Thumbnail the list screen uses. Figma mocks up the
 * iOS keyboard in both frames; the real one comes up on its own, so the only
 * thing that needs doing here is autoFocus.
 *
 * The search covers the month being listed, not every post ever written. The
 * result rows are Post List Thumbnails, which show a weekday and a day of the
 * month but no month — across months two results reading "Sat 15" could not
 * be told apart. Scoping to the month keeps every row unambiguous, and
 * matches the flow's own name.
 *
 * Figma draws no "no matches" state, so a query that finds nothing simply
 * lists nothing.
 */
export default function PostSearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'PostSearch'>>();
  const { year, month } = params;
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getPostsForMonth(year, month).then((found) => {
        if (!cancelled) setPosts(found);
      });
      return () => {
        cancelled = true;
      };
    }, [year, month]),
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === '') return [];
    return posts
      .filter((post) => post.text.toLowerCase().includes(needle))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [posts, query]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <HeaderX onClose={() => navigation.goBack()} accessibilityLabel={t('postSearch.closeSearch')} />

      <View style={styles.body}>
        <View style={styles.searchField}>
          {/* The magnifier is G900 while the field is empty and Accent once
              something has been typed (nodes 3192:10554 vs 3192:11131). Both
              Figma frames show a caret, so the trigger is the query, not
              focus. */}
          <IcSearch size={16} color={query === '' ? colors.textPrimary : colors.accent} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder={t('postSearch.placeholder')}
            placeholderTextColor={colors.textPlaceholder}
            selectionColor={colors.accent} // Figma draws the caret in Accent (node 3192:10556)
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel={t('postSearch.searchPosts')}
          />
        </View>

        <ScrollView
          style={styles.results}
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
        >
          {results.map((post) => (
            <PostListThumbnail
              key={post.date}
              post={post}
              onPress={() => navigation.navigate('PostDetail', { date: post.date })}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingTop comes from useSafeAreaInsets() at render time.
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  body: {
    // Figma "Input field" (node 3192:10552): padding 16, gap 8 between the
    // field and the results below it.
    flex: 1,
    width: '100%',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchField: {
    // Figma "Search input field" (node 3192:10553): 358 x 47, gap 8,
    // radius.sm, 1px G100, and **no shadow** — unlike the plain Input field,
    // this one carries none.
    //
    // The 47 is Figma's 12 + a 23pt line + 12. Set as a height with only the
    // horizontal padding, so the 1px border doesn't push the box to 49 and
    // the line still has 45pt to sit in — the trap that cut the month chips'
    // descenders when a fixed height and vertical padding were combined.
    width: '100%',
    height: 47,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing[5],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    // RN gives a TextInput its own default padding; the field's own box is
    // the spec, so zero it out.
    padding: 0,
    // Body's fields are listed out rather than spread, which is the one place
    // DESIGN_SYSTEM.md §3's "spread the whole style" rule doesn't apply: the
    // style's 22.5 lineHeight shifts the text off centre on a single-line iOS
    // TextInput. Everything else about Body is kept; the field's own height
    // does the centring.
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    letterSpacing: typography.body.letterSpacing,
  },
  results: {
    flex: 1,
    width: '100%',
  },
  resultsContent: {
    gap: 3, // Figma: the same 3 between thumbnails as the list screen
  },
});
