import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Text from '../components/Text';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/RootNavigator';
import IconButton from '../components/IconButton';
import GhostButton from '../components/GhostButton';
import PostListThumbnail from '../components/PostListThumbnail';
import { IcArrowLeft } from '../components/icons/AddIcons';
import { IcEditAlt, IcSearch } from '../components/icons/ListIcons';
import { getPostsForMonth } from '../data/posts';
import type { Post } from '../data/posts';
import { useLanguage } from '../i18n/LanguageContext';
import { formatMonthCommaYear } from '../i18n/dateFormat';
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
 * that browsing the calendar to February and tapping ic/rows lists February
 * — and the header names that month too, rather than today's date.
 *
 * The list scrolls: Figma draws the scrolled state as its own frame
 * (3192:9771), where the thumbnails run past the bottom of the screen.
 */
export default function HomeListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'HomeList'>>();
  const { year, month } = params;
  const insets = useSafeAreaInsets();
  const { language, t } = useLanguage();

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

  // Figma's header names the month being listed — "August, 2026" (node
  // 3192:9483), not today's date. Built by hand rather than with a
  // toLocaleDateString option set, because none of them produces the comma
  // between month and year that Figma shows ({month:'long', year:'numeric'}
  // gives "August 2026"). Korean gets its own "2026년 8월" order/format —
  // see formatMonthCommaYear (src/i18n/dateFormat.ts).
  const monthLabel = useMemo(
    () => formatMonthCommaYear(new Date(year, month, 1), language),
    [year, month, language],
  );

  // Figma only ever drew this screen's empty state for the current month, and
  // two things about it don't survive being looked at from a later one:
  //
  //   - "Add Record" is the way out of being empty, and it only is one here:
  //     it writes *today*, which leaves a March list you opened in August
  //     just as empty. Past months drop the button.
  //   - "…yet" says the month is still open. A past one isn't.
  //
  // Future months never get here — the month picker stops at the current one
  // (DESIGN_SYSTEM.md §7, "No writing ahead").
  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return year === now.getFullYear() && month === now.getMonth();
  }, [year, month]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <IconButton accessibilityLabel={t('homeList.back')} onPress={() => navigation.goBack()}>
          <IcArrowLeft size={24} color={colors.textPrimary} />
        </IconButton>
        <IconButton
          accessibilityLabel={t('homeList.searchPosts')}
          onPress={() => navigation.navigate('PostSearch', { year, month })}
        >
          <IcSearch size={24} color={colors.textPrimary} />
        </IconButton>
        <View style={styles.headerCentre} pointerEvents="none">
          <Text style={[typography.caption, styles.headerMonth]}>{monthLabel}</Text>
          <Text style={[typography.overline, styles.headerCount]}>
            {t('homeList.postCount')} {posts?.length ?? 0}
          </Text>
        </View>
      </View>

      {posts === null ? (
        // Nothing until the store answers, so the empty state can't flash up
        // in front of a month that does have posts.
        <View style={styles.body} />
      ) : posts.length === 0 ? (
        <View style={styles.empty}>
          <IcEditAlt size={40} color={colors.textPrimary} />
          <Text style={[typography.subtext, styles.emptyText]}>
            {isCurrentMonth
              ? // Figma's copy (node 3192:9215), written for the current month.
                t('homeList.emptyCurrentMonth')
              : // A past month isn't "yet" any more — it's closed. The header
                // right above names the month, so this needn't repeat it.
                t('homeList.emptyPastMonth')}
          </Text>
          {isCurrentMonth ? (
            <GhostButton label={t('homeList.addRecord')} onPress={() => navigation.navigate('Add')} />
          ) : null}
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
    // paddingTop/paddingBottom come from useSafeAreaInsets() at render time.
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
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
    gap: spacing[1], // Figma: "Date Information" gap, updated from 0 to 2
  },
  headerMonth: {
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
