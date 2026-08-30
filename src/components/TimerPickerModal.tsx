import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text from './Text';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import IconButton from './IconButton';
import PrimaryButton from './PrimaryButton';
import { IcCross } from './icons/AddIcons';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const ROW_HEIGHT = 56; // Figma-exact: py-16 + a 24pt line = 56 (nodes 3198:7826/7835/7841)
const VISIBLE_ROWS = 3;
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'] as const;

export type PickedTime = { hour: number; minute: number; period: 'AM' | 'PM' };

type Props = {
  visible: boolean;
  value: PickedTime;
  onClose: () => void;
  onApply: (time: PickedTime) => void;
};

/**
 * Figma "Modal/Timer" (node 3199:7894, in context on Setting-Notification-
 * Monthly reminder-1 3198:7720) — the Daily Reminder's time picker. The one
 * dark-themed modal in the app (`colors.timerModalBg`, G900); otherwise the
 * same slide-up-from-the-bottom shell every other modal uses (see
 * `ModalSheet.tsx`'s own doc comment for the technique). Built as its own
 * component rather than threading a `dark` mode through `ModalSheet`, since
 * the content padding and actions panel genuinely differ here (no content
 * top padding; a plain 16-all-around bottom panel instead of that
 * component's own rhythm).
 *
 * Figma's title literally reads "Select Month" — a leftover from reusing
 * the month-picker modal's header with the wrong copy pasted in, not a
 * second real Select-Month flow (this modal's content is unambiguously a
 * time picker). Read as an authoring mistake and corrected to "Select
 * Time", the same way "alomost" was corrected elsewhere in this app.
 *
 * Hour, minute, and AM/PM are three independent scrolling wheels rather
 * than Figma's static three-row mock of "previous / current / next" —
 * `WheelColumn` below is a real `snapToInterval` `ScrollView`, 56px rows
 * (Figma-exact) with 3 visible at once, so the picker actually picks
 * something rather than just illustrating the concept. Hour/minute don't
 * loop past their ends the way a real iOS/Android wheel does — a scope
 * simplification, not a Figma read.
 */
export default function TimerPickerModal({ visible, value, onClose, onApply }: Props) {
  const { language, t } = useLanguage();
  // The wheel's displayed labels only — the value stored in state (and
  // handed back through onApply) is always the literal 'AM' | 'PM', since
  // that's what to24Hour/to12Hour (NotificationScreen.tsx) work with.
  const periodLabels = language === 'ko' ? ['오전', '오후'] : [...PERIODS];
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;
  const [sheetHeight, setSheetHeight] = useState(400);

  const [draftHour, setDraftHour] = useState(value.hour);
  const [draftMinute, setDraftMinute] = useState(value.minute);
  const [draftPeriod, setDraftPeriod] = useState<'AM' | 'PM'>(value.period);
  // Bumped every time the sheet opens so the three WheelColumns remount and
  // scroll back to the current value, rather than wherever they were left.
  const [openId, setOpenId] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setDraftHour(value.hour);
    setDraftMinute(value.minute);
    setDraftPeriod(value.period);
    setOpenId((id) => id + 1);
  }, [visible, value.hour, value.minute, value.period]);

  useEffect(() => {
    if (visible) setMounted(true);
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 260 : 200,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
    return () => animation.stop();
  }, [visible, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight + spacing[10], 0],
  });

  const measureSheet = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setSheetHeight((current) => (Math.abs(current - height) < 1 ? current : height));
  };

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]} pointerEvents="none">
          <BlurView
            intensity={20}
            tint="dark"
            // See ModalSheet's own note: expo-blur's default Android
            // renderer doesn't produce a real blur without this.
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, styles.scrim]} />
        </Animated.View>

        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('timerPickerModal.closeSelectTime')}>
          <Animated.View style={[styles.sheetWrap, { transform: [{ translateY }] }]}>
            <Pressable style={styles.sheet} onPress={() => {}} onLayout={measureSheet}>
              <View style={styles.header}>
                <Text style={[typography.subtext, styles.title]}>{t('timerPickerModal.title')}</Text>
                <IconButton accessibilityLabel={t('timerPickerModal.close')} onPress={onClose} style={styles.closeButton}>
                  <IcCross size={24} color={colors.textOnDark} />
                </IconButton>
              </View>

              <View style={styles.content}>
                <View style={styles.wheels}>
                  <WheelColumn
                    key={`hour-${openId}`}
                    items={HOURS}
                    selectedIndex={draftHour - 1}
                    onChange={(index) => setDraftHour(index + 1)}
                    width={44}
                  />
                  <Text style={styles.separator}>:</Text>
                  <WheelColumn
                    key={`minute-${openId}`}
                    items={MINUTES}
                    selectedIndex={draftMinute}
                    onChange={setDraftMinute}
                    width={44}
                  />
                  <View style={styles.periodGap} />
                  <WheelColumn
                    key={`period-${openId}`}
                    items={periodLabels}
                    selectedIndex={PERIODS.indexOf(draftPeriod)}
                    onChange={(index) => setDraftPeriod(PERIODS[index])}
                    width={60}
                  />
                </View>
              </View>

              <View style={styles.actions}>
                <PrimaryButton
                  label={t('timerPickerModal.apply')}
                  tone="accent"
                  onPress={() => onApply({ hour: draftHour, minute: draftMinute, period: draftPeriod })}
                />
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </View>
    </Modal>
  );
}

type WheelColumnProps = {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width: number;
};

/** One scrolling, snap-to-row column of the picker — see this file's own doc comment. */
function WheelColumn({ items, selectedIndex, onChange, width }: WheelColumnProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * ROW_HEIGHT, animated: false });
    // Runs once per mount only — this column remounts (via its `key` in the
    // parent) each time the sheet opens, which is when it should re-sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ROW_HEIGHT);
    onChange(Math.max(0, Math.min(items.length - 1, index)));
  };

  // Tapping one of the dimmed rows above/below center (an "8" or "AM" sitting
  // next to the bold "9"/"PM") is the other half of a real wheel picker's
  // interaction, not just dragging it — scroll that row to center and set
  // the value directly, rather than relying on onMomentumScrollEnd firing
  // after a *programmatic* animated scroll, which Android doesn't reliably
  // fire.
  const handlePress = (index: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    scrollRef.current?.scrollTo({ y: clamped * ROW_HEIGHT, animated: true });
    onChange(clamped);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ width, height: ROW_HEIGHT * VISIBLE_ROWS }}
      contentContainerStyle={styles.wheelContent}
      showsVerticalScrollIndicator={false}
      snapToInterval={ROW_HEIGHT}
      decelerationRate="fast"
      onMomentumScrollEnd={handleMomentumEnd}
    >
      {items.map((label, index) => (
        <Pressable
          key={label}
          style={styles.cell}
          onPress={() => handlePress(index)}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <Text style={index === selectedIndex ? styles.cellTextActive : styles.cellTextInactive}>{label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrim: {
    backgroundColor: colors.backdrop,
  },
  sheetWrap: {
    width: '100%',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing[10],
    paddingHorizontal: spacing.md,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.timerModalBg,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  header: {
    width: '100%',
    paddingTop: spacing[7],
    paddingHorizontal: spacing.md,
    paddingBottom: spacing[7],
  },
  title: {
    color: colors.textOnDark,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.sm,
    top: 8.4, // Figma-exact, matches ModalSheet's own close button offset
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  wheels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContent: {
    paddingVertical: ROW_HEIGHT,
  },
  cell: {
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellTextActive: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: colors.textOnDark,
  },
  cellTextInactive: {
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    color: colors.textSecondary,
  },
  separator: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: colors.textOnDark,
    width: 8,
    textAlign: 'center',
  },
  periodGap: {
    width: spacing[8], // Figma's 24px gap between the H:M wheel group and AM/PM
  },
  actions: {
    width: '100%',
    padding: spacing.md,
  },
});
