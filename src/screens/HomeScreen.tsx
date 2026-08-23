import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { IcArrowDown, IcCalendar, IcPlus, IcPulse, IcRows, IcShare } from '../components/icons/HomeIcons';
import IconButton from '../components/IconButton';
import IconButtonContained from '../components/IconButtonContained';
import AlertBanner from '../components/AlertBanner';
import CalendarDateCell from '../components/CalendarDateCell';
import { dateKey, getPostsForMonth } from '../data/posts';
import type { Post } from '../data/posts';
import { WEEKDAY_LABELS, daysInMonth, getCalendarWeeks } from '../utils/calendar';
import { colors, radius, spacing, typography } from '../theme/tokens';

/**
 * Figma: "Home-Calendar-Default" (node 3184:4117) — the first screen after
 * login, showing the current month with today highlighted.
 *
 * This doubles as Figma's "포스트 생성 완료 후 화면" (section 3196:14544) —
 * there is no separate post-created confirmation screen; publishing returns
 * here and the day's cell changes to show the post. That section's two
 * frames, Home-Calendar-Today-Photo (3192:8063) and -Today-Text (3192:8249),
 * are the same screen with a different kind of post on today. See
 * CalendarDateCell.tsx for the per-day states.
 *
 * Still deferred, by plan rather than guessed at: month/year navigation
 * (tapping the title) isn't wired up — a picker screen is coming separately.
 */
export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Home'>>();
  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayKey = useMemo(() => dateKey(today), [today]);

  // Keyed by date ('YYYY-MM-DD'). The whole post is kept, not just the date,
  // because a cell renders the post's photo when it has one.
  const [postsByDate, setPostsByDate] = useState<Record<string, Post>>({});
  const [flash, setFlash] = useState<string | null>(null);

  // A screen hands the banner over as a route param on its way back here.
  // Clearing the param immediately means it shows once rather than again
  // every time the calendar regains focus.
  useEffect(() => {
    if (!params?.flash) return;
    setFlash(params.flash);
    navigation.setParams({ flash: undefined });
  }, [params?.flash, navigation]);

  useEffect(() => {
    if (flash === null) return;
    // Figma doesn't say how long the banner stays; this is our value.
    const timer = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(timer);
  }, [flash]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getPostsForMonth(year, month).then((posts) => {
        if (cancelled) return;
        setPostsByDate(Object.fromEntries(posts.map((post) => [post.date, post])));
      });
      return () => {
        cancelled = true;
      };
    }, [year, month]),
  );

  // A day that already has a post opens it; an empty one starts a post for
  // that date, which is what the Add screen's `date` param is for. Days after
  // today never get here — see `isFuture` at the call site.
  const handleDayPress = useCallback(
    (key: string) => {
      if (postsByDate[key]) navigation.navigate('PostDetail', { date: key });
      else navigation.navigate('Add', { date: key });
    },
    [postsByDate, navigation],
  );

  const weeks = useMemo(() => getCalendarWeeks(year, month), [year, month]);
  const totalDays = daysInMonth(year, month);
  const postCount = Object.keys(postsByDate).length;
  const progressPercent = totalDays > 0 ? Math.min((postCount / totalDays) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton accessibilityLabel="Menu">
          <IcRows size={24} color={colors.textPrimary} />
        </IconButton>
        <IconButtonContained accessibilityLabel="Share">
          <IcShare size={24} color={colors.textPrimary} />
        </IconButtonContained>
      </View>

      <View style={styles.calendar}>
        <View style={styles.titleRow}>
          <Text style={[typography.calendarTitle, styles.titleText]}>
            {today.toLocaleDateString('en-US', { month: 'long' })}
          </Text>
          <Text style={[typography.calendarTitle, styles.titleText]}>{year}</Text>
          {/* TODO: month/year picker is a separate screen, not wired up yet. */}
          <Pressable hitSlop={8}>
            <IcArrowDown size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.calendarBody}>
          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label) => (
              <Text key={label} style={[typography.calendarDay, styles.weekdayLabel]}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.weeksColumn}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((day, dayIndex) => {
                  const key = day === null ? null : dateKey(new Date(year, month, day));
                  // DayOne records the day you are living, so a day after today
                  // can't be written and is left inert. Both keys are
                  // zero-padded 'YYYY-MM-DD', so a string compare is a date
                  // compare.
                  const isFuture = key !== null && key > todayKey;
                  return (
                    <CalendarDateCell
                      key={dayIndex}
                      day={day}
                      isToday={key === todayKey}
                      post={key === null ? null : postsByDate[key]}
                      onPress={key === null || isFuture ? undefined : () => handleDayPress(key)}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.processing}>
        <View style={styles.processingBar}>
          <View style={styles.processingCountingRow}>
            <Text style={[typography.caption, styles.processingLabel]}>Processing</Text>
            <Text style={[typography.caption, styles.processingLabel]}>{progressPercent.toFixed(1)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
        <View style={styles.contentCountingRow}>
          <Text style={[typography.overline, styles.recordLabel]}>This month&rsquo;s record</Text>
          <Text style={[typography.overline, styles.recordLabel]}>{postCount}</Text>
        </View>
      </View>

      {flash !== null ? (
        <View style={styles.flash} pointerEvents="none">
          <AlertBanner message={flash} />
        </View>
      ) : null}

      <View style={styles.navigation}>
        <View style={styles.navItem}>
          <IcCalendar size={24} color={colors.textPrimary} />
          <View style={styles.navSecondRow}>
            <View style={styles.navSelectedDot} />
          </View>
        </View>
        <Pressable style={styles.navItem} onPress={() => navigation.navigate('Add')} hitSlop={8}>
          <IcPlus size={24} color={colors.textPlaceholder} />
          <View style={styles.navSecondRow}>
            <Text style={[typography.overline, styles.navLabel]}>Add</Text>
          </View>
        </Pressable>
        {/* TODO: Report screen not implemented yet. */}
        <Pressable style={styles.navItem} hitSlop={8}>
          <IcPulse size={24} color={colors.textPlaceholder} />
          <View style={styles.navSecondRow}>
            <Text style={[typography.overline, styles.navLabel]}>Report</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingTop: 47,
    paddingBottom: 34,
  },
  flash: {
    // Figma pins the banner over the header, not below it (node 3233:5182).
    position: 'absolute',
    top: 47,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
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
  calendar: {
    width: '100%',
    gap: spacing[9],
  },
  titleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  titleText: {
    color: colors.textPrimary,
  },
  calendarBody: {
    width: '100%',
    gap: spacing[8],
  },
  weekdayRow: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing.sm,
    width: '100%',
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    color: colors.textStrong,
  },
  weeksColumn: {
    width: '100%',
    gap: spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    gap: spacing[1],
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    width: '100%',
  },
  processing: {
    width: '100%',
    gap: spacing.md,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing[7],
    paddingBottom: spacing[10],
  },
  processingBar: {
    width: '100%',
    gap: spacing.sm,
  },
  processingCountingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  processingLabel: {
    color: colors.textStrong,
  },
  progressTrack: {
    width: '100%',
    height: 13,
    borderRadius: radius.full,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  contentCountingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  recordLabel: {
    color: colors.textTertiary,
  },
  navigation: {
    flexDirection: 'row',
    gap: 27,
    justifyContent: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.background,
    paddingHorizontal: 21, // Figma: doesn't land on the spacing scale; exact nav-bar value
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  navItem: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navSecondRow: {
    // Figma "Menu Title" row (nodes 3184:3526/3531/3535): a fixed 45x13
    // box sitting directly under the icon frame with no gap — verified via
    // get_metadata's absolute coords (icon y:4 h:24, row y:28 h:13 on all
    // three tabs). Every tab's label/dot must be centered in this same
    // 13px row, not placed bare, or the dot (3px) ends up shorter than the
    // label text and throws off the icon's vertical centering.
    width: '100%',
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navSelectedDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textPrimary, // Figma: G900, verified via get_variable_defs on node 3184:3527 — not accent
  },
  navLabel: {
    color: colors.textPlaceholder,
  },
});
