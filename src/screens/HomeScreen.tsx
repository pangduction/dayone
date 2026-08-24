import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { IcArrowDown, IcRows, IcShare } from '../components/icons/HomeIcons';
import IconButton from '../components/IconButton';
import IconButtonContained from '../components/IconButtonContained';
import BottomNavigation from '../components/BottomNavigation';
import AlertBanner from '../components/AlertBanner';
import MonthPickerModal from '../components/MonthPickerModal';
import CalendarDateCell from '../components/CalendarDateCell';
import ShareableCalendarCard from '../components/ShareableCalendarCard';
import { dateKey, getPostsForMonth } from '../data/posts';
import type { Post } from '../data/posts';
import { WEEKDAY_LABELS, daysInMonth, getCalendarWeeks } from '../utils/calendar';
import { colors, layout, radius, spacing, typography } from '../theme/tokens';

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
 * Tapping the title opens Figma's Modal/Date-Default to move to another
 * month; the calendar's month is state rather than always today's.
 */
export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Home'>>();
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => dateKey(today), [today]);

  // Which month the calendar is showing. Starts on today's, and the title
  // opens a picker to move it (Figma's Modal/Date-Default, node 3229:4259).
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [pickerOpen, setPickerOpen] = useState(false);

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

  // Figma "Flow 6. Home-Share" (section 3198:4811): the Share button opens the
  // OS share sheet over a picture of the month, not the calendar itself. That
  // picture is ShareableCalendarCard, held here only to be captured — it
  // never appears on screen. A ref guard rather than disabling the button:
  // there's no Figma loading state for this, and a stray second tap while a
  // capture is already in flight should just do nothing rather than queue a
  // second share sheet.
  const shareCardRef = useRef<View>(null);
  const isSharing = useRef(false);

  const handleShare = useCallback(async () => {
    if (isSharing.current) return;
    isSharing.current = true;
    try {
      const uri = await captureRef(shareCardRef, { format: 'png', quality: 1 });
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing isn’t available', 'This device can’t open the share sheet.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
    } catch {
      Alert.alert('Couldn’t share', 'Something went wrong while preparing the image.');
    } finally {
      isSharing.current = false;
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topGroup}>
        <View style={styles.header}>
          <IconButton
            accessibilityLabel="Show this month as a list"
            onPress={() => navigation.navigate('HomeList', { year, month })}
          >
            <IcRows size={24} color={colors.textPrimary} />
          </IconButton>
          <IconButtonContained accessibilityLabel="Share" onPress={handleShare}>
            <IcShare size={24} color={colors.textPrimary} />
          </IconButtonContained>
        </View>

        <View style={styles.calendar}>
          <Pressable
            style={styles.titleRow}
            onPress={() => setPickerOpen(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Change month"
          >
            <Text style={[typography.calendarTitle, styles.titleText]}>
              {new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' })}
            </Text>
            <Text style={[typography.calendarTitle, styles.titleText]}>{year}</Text>
            <IcArrowDown size={20} color={colors.textPrimary} />
          </Pressable>

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

      <MonthPickerModal
        visible={pickerOpen}
        year={year}
        month={month}
        onClose={() => setPickerOpen(false)}
        onConfirm={(next) => {
          setYear(next.year);
          setMonth(next.month);
          setPickerOpen(false);
        }}
      />

      {flash !== null ? (
        <View style={styles.flash} pointerEvents="none">
          <AlertBanner message={flash} />
        </View>
      ) : null}

      <BottomNavigation
        selected="Home"
        onHome={() => {}}
        onAdd={() => navigation.navigate('Add')}
        onReport={() => navigation.navigate('Report')}
      />

      {/* Off-screen on purpose: positioned outside the visible frame rather
          than hidden with opacity 0, because an alpha-0 layer can capture as
          blank on iOS — the native snapshot draws the layer as it actually
          renders, transparency included. */}
      <View style={styles.shareCardHost} pointerEvents="none">
        <ShareableCalendarCard ref={shareCardRef} year={year} month={month} postsByDate={postsByDate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shareCardHost: {
    position: 'absolute',
    top: 0,
    left: -1000,
  },
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
  topGroup: {
    // Header and calendar are one block so the gap between them is a fixed
    // `layout.headerToTitle` rather than whatever space-between happens to
    // distribute. That pins the title to Figma's 143.87 on every device — and
    // lets the Report screen land its own title on exactly the same line.
    // The free space still spreads below, across the two gaps that remain.
    width: '100%',
    gap: layout.headerToTitle,
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
});
