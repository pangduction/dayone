import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderX from '../components/HeaderX';
import PostListThumbnail from '../components/PostListThumbnail';
import { IcSearch } from '../components/icons/ListIcons';
import { getPostsForMonth } from '../data/posts';
import type { Post } from '../data/posts';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

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
    <View style={styles.container}>
      <HeaderX onClose={() => navigation.goBack()} accessibilityLabel="Close search" />

      <View style={styles.body}>
        <View style={styles.searchField}>
          <IcSearch size={16} color={colors.textPrimary} />
          <TextInput
            style={[typography.body, styles.input]}
            value={query}
            onChangeText={setQuery}
            placeholder="What are you looking for?"
            placeholderTextColor={colors.textPlaceholder}
            selectionColor={colors.accent} // Figma draws the caret in Accent (node 3192:10556)
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search posts"
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
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
    paddingTop: 47,
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
    // Figma "Search input field" (node 3192:10553): 358 x 47 — padding 12 all
    // round over one Body line — gap 8, radius.sm, 1px G100.
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing[5],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.background,
    ...shadows.xs,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    // RN gives a TextInput its own default padding on Android; the field's
    // own 12 is the spec, so zero it out.
    padding: 0,
  },
  results: {
    flex: 1,
    width: '100%',
  },
  resultsContent: {
    gap: 3, // Figma: the same 3 between thumbnails as the list screen
  },
});
