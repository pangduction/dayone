import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/Text';
import { BlurView } from 'expo-blur';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/RootNavigator';
import IconButton from '../components/IconButton';
import BottomNavigation from '../components/BottomNavigation';
import MonthPickerModal from '../components/MonthPickerModal';
import PostThumbnailRows from '../components/PostThumbnailRows';
import { IcArrowDown } from '../components/icons/HomeIcons';
import { IcPresent, IcSetting } from '../components/icons/ReportIcons';
import { getMonthsWithPosts, getPostsForMonth } from '../data/posts';
import type { Post } from '../data/posts';
import { useLanguage } from '../i18n/LanguageContext';
import { formatCalendarTitleParts } from '../i18n/dateFormat';
import { colors, layout, spacing, typography } from '../theme/tokens';

/**
 * Figma: "Report-Default" (node 3196:12678, this month, locked) and
 * "Report-Done" (node 3196:14258, a month with a report) from the "Flow 5.
 * Report" section (3196:12677).
 *
 * A month's posts gathered into one horizontal montage: Header/Report, the
 * same Calendar Title the Home screen uses, the Post Thumbnail Rows strip,
 * and the bottom navigation with Report selected.
 *
 * A month only has a report once it is over — the Lock Paper says so in as
 * many words ("Catch it on the morning of the 1st"), so the current month is
 * covered by it rather than being shown. The veil is translucent white over a
 * blur, so the strip stays visible underneath exactly as Figma draws it.
 */
export default function ReportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const today = useMemo(() => new Date(), []);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [monthsWithPosts, setMonthsWithPosts] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([getPostsForMonth(year, month), getMonthsWithPosts()]).then(([found, months]) => {
        if (cancelled) return;
        // Figma numbers the strip from 1 left to right, so oldest first —
        // the opposite of the Home list.
        setPosts([...found].sort((a, b) => a.date.localeCompare(b.date)));
        setMonthsWithPosts(months);
      });
      return () => {
        cancelled = true;
      };
    }, [year, month]),
  );

  const isThisMonth = (candidateYear: number, candidateMonth: number) =>
    candidateYear === today.getFullYear() && candidateMonth === today.getMonth();

  /**
   * A month has a report once it is over and there was something to report.
   * The current month is still offered in the picker — it is where the Lock
   * Paper lives, and without it there would be no way back to this month
   * after moving to an older one.
   */
  const hasReport = useCallback(
    (candidateYear: number, candidateMonth: number) => {
      if (isThisMonth(candidateYear, candidateMonth)) return true;
      const key = `${candidateYear}-${String(candidateMonth + 1).padStart(2, '0')}`;
      return monthsWithPosts.has(key);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthsWithPosts, today],
  );

  const locked = isThisMonth(year, month);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <IconButton accessibilityLabel={t('report.settings')} onPress={() => navigation.navigate('Setting')}>
          <IcSetting size={24} color={colors.textPrimary} />
        </IconButton>
      </View>

      <View style={styles.content}>
        <Pressable
          style={styles.titleRow}
          onPress={() => setPickerOpen(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('report.changeMonth')}
        >
          {/* The Calendar Title stays in English regardless of the active
              language, per explicit product direction — same as Home's own
              Calendar/Processing blocks. */}
          {formatCalendarTitleParts(new Date(year, month, 1), 'en').map((part, index) => (
            <Text key={index} style={[typography.calendarTitle, styles.titleText]}>
              {part}
            </Text>
          ))}
          <IcArrowDown size={20} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.strip}>
          <PostThumbnailRows
            posts={posts}
            autoScroll={!locked}
            // A locked month's strip is behind the Lock Paper, which swallows
            // every touch anyway. Withholding the handler says so outright
            // rather than leaving thumbnails that look tappable but aren't.
            onPressPost={
              locked ? undefined : (post) => navigation.navigate('PostDetail', { date: post.date })
            }
          />

          {locked ? (
            <View style={styles.lock}>
              <BlurView intensity={LOCK_BLUR_INTENSITY} tint="light" style={StyleSheet.absoluteFill} />
              <View style={[StyleSheet.absoluteFill, styles.lockVeil]} />
              <View style={styles.lockBody}>
                <IcPresent size={40} color={colors.textPrimary} />
                <Text style={[typography.subtext, styles.lockText]}>{t('report.lockedBody')}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>

      <MonthPickerModal
        visible={pickerOpen}
        year={year}
        month={month}
        isSelectable={hasReport}
        onClose={() => setPickerOpen(false)}
        onConfirm={(next) => {
          setYear(next.year);
          setMonth(next.month);
          setPickerOpen(false);
        }}
      />

      <BottomNavigation
        selected="Report"
        onHome={() => navigation.navigate('Home')}
        onAdd={() => navigation.navigate('Add')}
        onReport={() => {}}
      />
    </View>
  );
}

/**
 * Figma's Lock Paper carries "Background blur / md" (radius 16, which the CSS
 * export renders as `backdrop-blur-[8px]`). expo-blur takes a 0-100 intensity
 * rather than a pixel radius, so this is the nearest equivalent and the one
 * value here that isn't a direct read from the node — the same substitution
 * ModalSheet's backdrop makes.
 */
const LOCK_BLUR_INTENSITY = 20;

const styles = StyleSheet.create({
  container: {
    // paddingTop/paddingBottom come from useSafeAreaInsets() at render time.
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  header: {
    // Figma Header/Report (node 3196:13123): the Header/X shell — one button
    // pushed right — carrying ic/setting instead of ic/cross.
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingLeft: 5,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  titleRow: {
    // Figma "Calendar Title" — the same block Home has, on the same line:
    // Report Content starts at y 119 with the title 24.87 inside it (node
    // 3196:13480), and Home-Calendar-Default does exactly the same (node
    // 3192:9061). `layout.headerToTitle` holds that shared offset.
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: layout.headerToTitle,
    width: '100%',
  },
  titleText: {
    color: colors.textPrimary,
  },
  strip: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  lock: {
    // Figma "Lock Paper" (node 3196:14417) covers the strip, not the title.
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockVeil: {
    backgroundColor: colors.lockPaper,
  },
  lockBody: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing[10], // Figma: 40
  },
  lockText: {
    textAlign: 'center',
    color: colors.textSecondary, // Figma G600
  },
});
