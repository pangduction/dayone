import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './Text';
import ModalSheet from './ModalSheet';
import PrimaryButton from './PrimaryButton';
import GhostIconButton from './GhostIconButton';
import ChipButton from './ChipButton';
import type { ChipStatus } from './ChipButton';
import { IcArrowLeftL, IcArrowRightL } from './icons/CommonIcons';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, spacing, typography } from '../theme/tokens';

/** Short month labels, the form Figma's chips use. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Props = {
  visible: boolean;
  /** The month the calendar is showing; `month` is 0-indexed. */
  year: number;
  month: number;
  onClose: () => void;
  onConfirm: (next: { year: number; month: number }) => void;
  /**
   * Narrows which chips can be picked, on top of the no-future rule every
   * caller gets. The Report's copy of this sheet (Figma Modal/Date-Report,
   * node 3198:4736) uses it to grey the months it has no report for — its
   * chips are otherwise identical to Modal/Date-Default's.
   */
  isSelectable?: (year: number, month: number) => boolean;
};

/**
 * Figma "Modal/Date-Default" (node 3229:4259, in context on
 * Home-Calendar-Default-Change 3229:4271) — the sheet behind the calendar's
 * title, for moving to another month.
 *
 * The shared sheet shell holds a year stepper (two Button / M / Icon /
 * Secondary either side of the year in `typography.titleMedium` /
 * `colors.yearLabel`), a divider, then twelve Chip Buttons wrapping four to a
 * row, and a "Done" primary button.
 *
 * DayOne records the day you are living, so months after the current one
 * can't be chosen: Figma greys Sep-Dec of 2026 with today in August. The
 * forward year arrow stops at the current year for the same reason — a year
 * past this one would have nothing selectable in it. That arrow's disabled
 * state isn't drawn in Figma; it follows from the rule.
 *
 * The choice is local until Done, so backing out with the X leaves the
 * calendar where it was.
 */
export default function MonthPickerModal({ visible, year, month, onClose, onConfirm, isSelectable }: Props) {
  const { language, t } = useLanguage();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const [draftYear, setDraftYear] = useState(year);
  const [draftMonth, setDraftMonth] = useState(month);

  // Reopening should start from where the calendar actually is, not from
  // wherever the sheet was left last time.
  useEffect(() => {
    if (!visible) return;
    setDraftYear(year);
    setDraftMonth(month);
  }, [visible, year, month]);

  const isFuture = (candidateYear: number, candidateMonth: number) =>
    candidateYear > currentYear || (candidateYear === currentYear && candidateMonth > currentMonth);

  const statusFor = (index: number): ChipStatus => {
    if (isFuture(draftYear, index)) return 'disabled';
    // The draft is active before anything else is considered, so the sheet
    // always shows exactly one selection and never greys out what is
    // currently picked. Figma's Modal/Date-Report does the same: August is
    // active there even though August has no report of its own yet
    // (node 3198:4740).
    if (index === draftMonth) return 'active';
    if (isSelectable && !isSelectable(draftYear, index)) return 'disabled';
    return 'enabled';
  };

  // Stepping to a year where the drafted month would be in the future pulls
  // the selection back to that year's last selectable month.
  const stepYear = (delta: number) => {
    const nextYear = draftYear + delta;
    if (nextYear > currentYear) return;
    setDraftYear(nextYear);
    if (isFuture(nextYear, draftMonth)) setDraftMonth(currentMonth);
  };

  return (
    <ModalSheet
      visible={visible}
      title={t('monthPickerModal.selectMonth')}
      onClose={onClose}
      actions={
        <PrimaryButton
          label={t('monthPickerModal.done')}
          onPress={() => onConfirm({ year: draftYear, month: draftMonth })}
        />
      }
    >
      <View style={styles.content}>
        <View style={styles.yearRow}>
          <GhostIconButton accessibilityLabel={t('monthPickerModal.previousYear')} onPress={() => stepYear(-1)}>
            <IcArrowLeftL size={20} color={colors.textPrimary} />
          </GhostIconButton>

          <Text style={[typography.titleMedium, styles.year]}>{draftYear}</Text>

          <GhostIconButton
            accessibilityLabel={t('monthPickerModal.nextYear')}
            onPress={() => stepYear(1)}
            disabled={draftYear >= currentYear}
          >
            <IcArrowRightL size={20} color={colors.textPrimary} />
          </GhostIconButton>
        </View>

        <View style={styles.divider} />

        <View style={styles.grid}>
          {MONTHS.map((label, index) => (
            <ChipButton
              key={label}
              label={language === 'ko' ? `${index + 1}월` : label}
              status={statusFor(index)}
              onPress={() => setDraftMonth(index)}
            />
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
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[8],
  },
  year: {
    color: colors.yearLabel,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
