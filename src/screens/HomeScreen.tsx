import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { dateKey, getPostsForMonth } from '../data/posts';
import { WEEKDAY_LABELS, daysInMonth, getCalendarWeeks } from '../utils/calendar';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

/**
 * Figma: "Home-Calendar-Default" (node 3184:4117) — the first screen after
 * login, showing the current month with today highlighted.
 *
 * Simplifications vs. the full Figma flow (both intentionally deferred, per
 * plan, rather than guessed at):
 * - Month/year navigation (tapping the title) isn't wired up yet — a picker
 *   screen is coming separately.
 * - Day cells only distinguish "today" / "has a post" / plain. Figma's
 *   Design System page has richer per-day states (photo thumbnail, text-only,
 *   etc.) that weren't fetched for this screen yet.
 */
export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayKey = useMemo(() => dateKey(today), [today]);

  const [postDates, setPostDates] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getPostsForMonth(year, month).then((posts) => {
        if (!cancelled) setPostDates(new Set(posts.map((post) => post.date)));
      });
      return () => {
        cancelled = true;
      };
    }, [year, month]),
  );

  const weeks = useMemo(() => getCalendarWeeks(year, month), [year, month]);
  const totalDays = daysInMonth(year, month);
  const postCount = postDates.size;
  const progressPercent = totalDays > 0 ? Math.min((postCount / totalDays) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.headerIconButton} hitSlop={8}>
          <Ionicons name="list-outline" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable style={styles.shareButton} hitSlop={8}>
          <Ionicons name="share-outline" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.calendar}>
        <View style={styles.titleRow}>
          <Text style={[typography.calendarTitle, styles.titleText]}>
            {today.toLocaleDateString('en-US', { month: 'long' })}
          </Text>
          <Text style={[typography.calendarTitle, styles.titleText]}>{year}</Text>
          {/* TODO: month/year picker is a separate screen, not wired up yet. */}
          <Pressable hitSlop={8}>
            <Ionicons name="chevron-down" size={20} color={colors.textPrimary} />
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
                  if (day === null) {
                    return <View key={dayIndex} style={styles.dayCell} />;
                  }
                  const key = dateKey(new Date(year, month, day));
                  const isToday = key === todayKey;
                  const hasPost = postDates.has(key);
                  return (
                    <View
                      key={dayIndex}
                      style={[styles.dayCell, isToday && styles.dayCellToday, hasPost && !isToday && styles.dayCellDone]}
                    >
                      <Text
                        style={[
                          typography.calendarDate,
                          styles.dayLabel,
                          isToday && styles.dayLabelToday,
                          hasPost && !isToday && styles.dayLabelDone,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
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

      <View style={styles.navigation}>
        <View style={styles.navItem}>
          <Ionicons name="calendar" size={24} color={colors.textPrimary} />
          <View style={styles.navSelectedDot} />
        </View>
        <Pressable style={styles.navItem} onPress={() => navigation.navigate('Add')} hitSlop={8}>
          <Ionicons name="add" size={24} color={colors.textPlaceholder} />
          <Text style={[typography.overline, styles.navLabel]}>Add</Text>
        </Pressable>
        {/* TODO: Report screen not implemented yet. */}
        <Pressable style={styles.navItem} hitSlop={8}>
          <Ionicons name="pulse-outline" size={24} color={colors.textPlaceholder} />
          <Text style={[typography.overline, styles.navLabel]}>Report</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 5,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    padding: spacing.sm,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
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
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellToday: {
    backgroundColor: colors.accentSubtle,
  },
  dayCellDone: {
    backgroundColor: colors.buttonDark,
  },
  dayLabel: {
    color: colors.textSecondary,
  },
  dayLabelToday: {
    color: colors.accent,
  },
  dayLabelDone: {
    color: colors.textOnDark,
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    paddingVertical: spacing[1],
  },
  navSelectedDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.accent,
  },
  navLabel: {
    color: colors.textPlaceholder,
  },
});
