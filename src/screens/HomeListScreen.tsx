import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import IconButton from '../components/IconButton';
import GhostButton from '../components/GhostButton';
import PostListThumbnail from '../components/PostListThumbnail';
import { IcArrowLeft } from '../components/icons/AddIcons';
import { IcEditAlt, IcSearch } from '../components/icons/ListIcons';
import { getPostsForMonth } from '../data/posts';
import type { Post } from '../data/posts';
import { colors, spacing, typography } from '../theme/tokens';

/**
 * Figma: "Home-List-Default" (node 3192:8914, empty) and "Home-List-Done"
 * (node 3192:9547, filled) from the "Flow 3. Home에서 Calendar↔List" section
 * (3192:8666) — the calendar's month as a top-to-bottom list of its posts,
 * reached from the Home header's ic/rows button.
 *
 * Unlike Home this screen has no bottom navigation: Figma gives it only
 * Header/List and the list body, and its header leads with a back button.
 *
 * Which month it lists comes from Home rather than always being today's, so
 * that browsing to another month and tapping ic/rows lists that month.
 */
export default function HomeListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'HomeList'>>();
  const { year, month } = params;

  const [posts, setPosts] = useState<Post[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getPostsForMonth(year, month).then((found) => {
        if (cancelled) return;
        // Figma lists the month newest first (15, 13, 12, 11, 9, … on
        // node 3192:9547). Both keys are zero-padded 'YYYY-MM-DD', so a
        // string compare is a date compare.
        setPosts([...found].sort((a, b) => b.date.localeCompare(a.date)));
      });
      return () => {
        cancelled = true;
      };
    }, [year, month]),
  );

  // Figma's header reads "August 8, 2026" — today's date, not the listed
  // month's, the same way Header/Add leads with the day being written.
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton accessibilityLabel="Back" onPress={() => navigation.goBack()}>
          <IcArrowLeft size={24} color={colors.textPrimary} />
        </IconButton>
        {/* TODO: Flow 3's search screen isn't built yet — Figma only gives
            Header/List's ic/search button, not what it opens. */}
        <IconButton accessibilityLabel="Search">
          <IcSearch size={24} color={colors.textPrimary} />
        </IconButton>
        <View style={styles.headerCentre} pointerEvents="none">
          <Text style={[typography.caption, styles.headerDate]}>{todayLabel}</Text>
          <Text style={[typography.overline, styles.headerCount]}>Post {posts?.length ?? 0}</Text>
        </View>
      </View>

      {posts === null ? (
        // Nothing until the store answers, so the empty state can't flash up
        // in front of a month that does have posts.
        <View style={styles.body} />
      ) : posts.length === 0 ? (
        <View style={styles.empty}>
          <IcEditAlt size={40} color={colors.textPrimary} />
          <Text style={[typography.subtext, styles.emptyText]}>You haven&rsquo;t written anything yet.</Text>
          <GhostButton label="Add Record" onPress={() => navigation.navigate('Add')} />
        </View>
      ) : (
        <ScrollView style={styles.body} contentContainerStyle={styles.list}>
          {posts.map((post) => (
            <PostListThumbnail
              key={post.date}
              post={post}
              onPress={() => navigation.navigate('PostDetail', { date: post.date })}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
    paddingTop: 47,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 5,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
  },
  headerCentre: {
    // Figma centres the "Date Information" block absolutely, so the two
    // buttons keep the row's edges (node 3192:9482).
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDate: {
    color: colors.textPrimary,
  },
  headerCount: {
    color: colors.textPlaceholder,
  },
  body: {
    flex: 1,
    width: '100%',
  },
  list: {
    gap: 3, // Figma: the gap between thumbnails (node 3192:9551)
    paddingHorizontal: spacing.md,
  },
  empty: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  emptyText: {
    width: '100%',
    textAlign: 'center',
    color: colors.textEmpty,
  },
});
