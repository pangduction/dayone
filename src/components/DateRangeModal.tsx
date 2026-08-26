import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './Text';
import ModalSheet from './ModalSheet';
import PrimaryButton from './PrimaryButton';
import { IcArrowLeftL, IcArrowRightL } from './icons/CommonIcons';
import { getDateRangeGrid } from '../utils/calendar';
import type { DateRangeCell } from '../utils/calendar';
import { dateKey, getPostsInRange, parseDateKey } from '../data/posts';
import { useLanguage } from '../i18n/LanguageContext';
import { strings } from '../i18n/strings';
import { formatMonthYear, formatShortDate } from '../i18n/dateFormat';
import { colors, radius, spacing, typography } from '../theme/tokens';

// Figma's own row (English) is Mon–Fri as two letters, then "Sat"/"Su" (node
// 3201:5637…5649) — ported literally, asymmetry and all, as
// `strings.en.calendar.weekdayHeaderMondayStart`; the Korean row
// (`strings.ko...`) is the regular single-character weekday set instead.
// `weekdayHeader` below picks whichever the active language calls for.

type Props = {
  visible: boolean;
  startDate: string;
  endDate: string;
  onClose: () => void;
  onApply: (range: { startDate: string; endDate: string }) => void;
};

/**
 * Figma "Modal/Date picker menu" (node 3201:5786, in context on
 * Setting-Export to PDF-1 3199:8735) — opens directly over Setting-Main when
 * "Export to PDF" is tapped, per that re-check; only "Apply" pushes the real
 * Export to PDF screen (Figma Setting-Export to PDF-2, 3201:5947), pre-filled
 * with the range picked here.
 *
 * A month stepper, a divider, two read-only date fields, then a Monday-start
 * calendar with a dot on any day that has a post. Picking a range is the
 * standard two-tap pattern (not shown by a static mock, so this is a product
 * decision rather than a Figma read): the first tap after the sheet already
 * has a complete range starts a fresh one (that day becomes the start, the
 * end clears); the next tap completes it, ordering the two by date regardless
 * of tap order. Days after today are inert, same as every other calendar
 * surface in the app ("no writing ahead" — there's never a post to export
 * beyond today anyway).
 *
 * The highlighted band linking the two ends is a plain `colors.surface`
 * rectangle under every day in range, rather than a port of Figma's
 * "Connection" vectors — a solid fill under contiguous cells reads
 * identically once the row has no gaps between cells, the same trade-off
 * Waveform.tsx makes drawing bars from data instead of porting a decorative
 * vector 1:1.
 */
export default function DateRangeModal({ visible, startDate, endDate, onClose, onApply }: Props) {
  const { language, t } = useLanguage();
  const weekdayHeader = strings[language].calendar.weekdayHeaderMondayStart;
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState<string | null>(endDate);
  const [viewYear, setViewYear] = useState(() => parseDateKey(startDate).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parseDateKey(startDate).getMonth());
  const [postDates, setPostDates] = useState<Set<string>>(new Set());

  const now = new Date();
  const todayKey = dateKey(now);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Reopening starts from the range the screen currently has, not wherever
  // the sheet was left last time.
  useEffect(() => {
    if (!visible) return;
    setDraftStart(startDate);
    setDraftEnd(endDate);
    const start = parseDateKey(startDate);
    setViewYear(start.getFullYear());
    setViewMonth(start.getMonth());
  }, [visible, startDate, endDate]);

  const weeks = getDateRangeGrid(viewYear, viewMonth);

  useEffect(() => {
    if (!visible || weeks.length === 0) return;
    const firstCell = weeks[0][0];
    const lastCell = weeks[weeks.length - 1][6];
    let cancelled = false;
    getPostsInRange(firstCell.key, lastCell.key).then((posts) => {
      if (!cancelled) setPostDates(new Set(posts.map((post) => post.date)));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, viewYear, viewMonth]);

  const isFuture = (candidateYear: number, candidateMonth: number) =>
    candidateYear > currentYear || (candidateYear === currentYear && candidateMonth > currentMonth);

  const stepMonth = (delta: number) => {
    let nextMonth = viewMonth + delta;
    let nextYear = viewYear;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    } else if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }
    if (isFuture(nextYear, nextMonth)) return;
    setViewYear(nextYear);
    setViewMonth(nextMonth);
  };

  const handleSelectDay = (cell: DateRangeCell) => {
    if (cell.key > todayKey) return; // no writing ahead — no post can exist beyond today
    if (draftEnd === null) {
      if (cell.key >= draftStart) setDraftEnd(cell.key);
      else {
        setDraftEnd(draftStart);
        setDraftStart(cell.key);
      }
    } else {
      setDraftStart(cell.key);
      setDraftEnd(null);
    }
  };

  const monthLabel = formatMonthYear(new Date(viewYear, viewMonth, 1), language);
  const startLabel = formatShortDate(parseDateKey(draftStart), language);
  const endLabel = draftEnd ? formatShortDate(parseDateKey(draftEnd), language) : '–';

  return (
    <ModalSheet
      visible={visible}
      title={t('dateRangeModal.title')}
      onClose={onClose}
      actions={
        <PrimaryButton
          label={t('dateRangeModal.apply')}
          disabled={draftEnd === null}
          onPress={() => {
            if (draftEnd) onApply({ startDate: draftStart, endDate: draftEnd });
          }}
        />
      }
    >
      <View style={styles.content}>
        <View style={styles.monthRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('dateRangeModal.previousMonth')}
            onPress={() => stepMonth(-1)}
            style={styles.stepButton}
          >
            <IcArrowLeftL size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={[typography.body, styles.monthLabel]}>{monthLabel}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('dateRangeModal.nextMonth')}
            onPress={() => stepMonth(1)}
            disabled={viewYear === currentYear && viewMonth === currentMonth}
            style={[
              styles.stepButton,
              viewYear === currentYear && viewMonth === currentMonth && styles.stepButtonDisabled,
            ]}
          >
            <IcArrowRightL size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.fieldsRow}>
          <View style={styles.field}>
            <Text style={[typography.body, styles.fieldLabel]}>{startLabel}</Text>
          </View>
          <Text style={[typography.body, styles.dash]}>–</Text>
          <View style={styles.field}>
            <Text style={[typography.body, styles.fieldLabel]}>{endLabel}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.weekHeader}>
            {weekdayHeader.map((label, index) => (
              <View key={index} style={styles.cell}>
                <Text style={[typography.calendarDay, styles.weekLabel]}>{label}</Text>
              </View>
            ))}
          </View>

          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.week}>
              {week.map((cell) => {
                const isStart = cell.key === draftStart;
                const isEnd = draftEnd !== null && cell.key === draftEnd;
                const inRange = draftEnd !== null && cell.key > draftStart && cell.key < draftEnd;
                const selected = isStart || isEnd;
                const hasPost = postDates.has(cell.key);
                const disabled = cell.key > todayKey;

                return (
                  <View key={cell.key} style={styles.cell}>
                    {selected || inRange ? <View style={[StyleSheet.absoluteFill, styles.rangeFill]} /> : null}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={cell.date.toDateString()}
                      disabled={disabled}
                      onPress={() => handleSelectDay(cell)}
                      style={[styles.dayCell, selected && styles.dayCellSelected]}
                    >
                      <Text
                        style={[
                          typography.body,
                          selected
                            ? styles.dayTextSelected
                            : cell.inMonth
                              ? styles.dayTextInMonth
                              : styles.dayTextOutMonth,
                          disabled && styles.dayTextDisabled,
                        ]}
                      >
                        {cell.date.getDate()}
                      </Text>
                      {hasPost ? <View style={styles.dot} /> : null}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    gap: spacing.md,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  stepButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: radius.lg,
  },
  stepButtonDisabled: {
    opacity: 0.3,
  },
  monthLabel: {
    color: colors.monthLabel,
    textAlign: 'center',
  },
  fieldsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  field: {
    flex: 1,
    // Figma-exact (node 3201:5627) — off the 12/16 spacing scale.
    paddingHorizontal: 14,
    paddingVertical: spacing[4],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  fieldLabel: {
    color: colors.textPrimary,
  },
  dash: {
    color: colors.textTertiary,
  },
  grid: {
    width: '100%',
    gap: spacing[2],
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  week: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabel: {
    color: colors.textStrong,
    textAlign: 'center',
  },
  rangeFill: {
    backgroundColor: colors.surface,
  },
  dayCell: {
    width: '100%',
    height: '100%',
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: colors.accent,
  },
  dayTextInMonth: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  dayTextOutMonth: {
    color: colors.textTertiary,
    textAlign: 'center',
  },
  dayTextSelected: {
    color: colors.textOnDark,
    textAlign: 'center',
  },
  dayTextDisabled: {
    opacity: 0.4,
  },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.textPlaceholder,
  },
});
