import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CalendarDateCell from './CalendarDateCell';
import { dateKey } from '../data/posts';
import type { Post } from '../data/posts';
import { WEEKDAY_LABELS, daysInMonth, getCalendarWeeks } from '../utils/calendar';
import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = {
  year: number;
  /** 0-indexed, matching `Date#getMonth()`. */
  month: number;
  postsByDate: Record<string, Post>;
};

/**
 * Figma "Share Image" (node 3198:5765, "Flow 6. Home-Share" section 3198:4811)
 * — the picture actually shared when Home's Share button is pressed, captured
 * off-screen from this component and handed to the OS share sheet. It is not
 * a screenshot of the live Home screen: Figma draws it as its own frame with
 * a few differences from Home-Calendar-Done —
 *
 *   - the Calendar Title has no ic/arrow-down and isn't a button (nothing on
 *     a shared image can be tapped);
 *   - Header/Calendar and Navigation are present but at opacity 0, kept only
 *     to reserve their height so the calendar sits at the same vertical spot
 *     as it does on Home. Rendered here as bare spacer Views instead of the
 *     real header/nav components — the pixels are identical either way, and
 *     nothing this component renders is ever interactive;
 *   - the Processing block gains a second line under "This month's record":
 *     a solid "Created by Dayone" pill, which is Figma's branding on an image
 *     that leaves the app.
 *
 * Sized to Figma's frame exactly (390x844) rather than filling the screen,
 * since this only ever renders off-screen for react-native-view-shot to
 * capture — there is no responsive layout to solve here. The three gaps this
 * produces between the header spacer / calendar / processing / nav spacer
 * are `justifyContent: 'space-between'` doing the same thing Home's own
 * frame does elsewhere: falling out to 16.58 automatically from the fixed
 * height and fixed children, rather than a hand-set number.
 */
const ShareableCalendarCard = forwardRef<View, Props>(({ year, month, postsByDate }, ref) => {
  const today = new Date();
  const todayKey = dateKey(today);
  const weeks = getCalendarWeeks(year, month);
  const totalDays = daysInMonth(year, month);
  const postCount = Object.keys(postsByDate).length;
  const progressPercent = totalDays > 0 ? Math.min((postCount / totalDays) * 100, 100) : 0;
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' });

  return (
    <View ref={ref} style={styles.card} collapsable={false}>
      <View style={styles.headerSpacer} />

      <View style={styles.calendar}>
        <View style={styles.titleRow}>
          <Text style={[typography.calendarTitle, styles.titleText]}>{monthName}</Text>
          <Text style={[typography.calendarTitle, styles.titleText]}>{year}</Text>
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
                  return (
                    <CalendarDateCell
                      key={dayIndex}
                      day={day}
                      isToday={key === todayKey}
                      post={key === null ? null : postsByDate[key]}
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

        {/* Figma "Frame 595" (node 3198:6346): the record count and the
            branding pill share this 3pt gap, tighter than any spacing token
            — a Figma-exact one-off, not on the scale. */}
        <View style={styles.countsColumn}>
          <View style={styles.contentCountingRow}>
            <Text style={[typography.overline, styles.recordLabel]}>This month&rsquo;s record</Text>
            <Text style={[typography.overline, styles.recordLabel]}>{postCount}</Text>
          </View>
          <View style={styles.createdByPill}>
            <Text style={[typography.overline, styles.createdByLabel]}>Created by</Text>
            <Text style={[typography.caption, styles.createdByLabel]}>Dayone</Text>
          </View>
        </View>
      </View>

      <View style={styles.navSpacer} />
    </View>
  );
});

ShareableCalendarCard.displayName = 'ShareableCalendarCard';

export default ShareableCalendarCard;

const styles = StyleSheet.create({
  card: {
    // Figma-exact frame size (node 3198:5765) — this is a fixed export, not a
    // responsive screen.
    width: 390,
    height: 844,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 47,
    paddingBottom: 34,
  },
  headerSpacer: {
    // Stands in for the opacity-0 Header/Calendar (node 3198:5768): same
    // height, nothing drawn.
    width: '100%',
    height: 72,
  },
  navSpacer: {
    // Stands in for the opacity-0 Navigation (node 3198:5771).
    width: '100%',
    height: 69,
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
  countsColumn: {
    width: '100%',
    alignItems: 'center',
    gap: 3, // Figma-exact (node 3198:6346), not on the spacing scale
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
  createdByPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3, // Figma-exact (node 3198:6343), not on the spacing scale
    backgroundColor: colors.textPrimary, // Figma G900, same reuse as CalendarDateCell's text-only fill
  },
  createdByLabel: {
    color: colors.textOnDark,
  },
});
