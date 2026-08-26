import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import Text from './Text';
import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import type { ReactNode } from 'react';
import { BlurView } from 'expo-blur';
import IconButton from './IconButton';
import { IcCross } from './icons/AddIcons';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  /** Fills the sheet's "Content" block. */
  children: ReactNode;
  /** Fills the sheet's "Modal actions" block; omit for a sheet with no buttons. */
  actions?: ReactNode;
  /**
   * Rendered on top of the backdrop *and* the sheet, pinned to the screen's
   * top like `HomeScreen`'s own flash banner (`top: 47`) — for a banner that
   * has to appear while this modal stays open (e.g. `LanguageModal`'s "Not
   * supported yet."). RN's `Modal` is a native layer painted in front of the
   * whole app; a sibling `AlertBanner` rendered by the screen underneath
   * this modal would sit *behind* it, dimmed by the backdrop blur along with
   * everything else back there — this slot exists so that content can join
   * the modal's own native layer instead and actually render on top.
   */
  overlay?: ReactNode;
};

/**
 * The bottom-sheet shell every Figma modal shares — Modal/Gallery
 * (3198:4446), Modal/Leave (3233:4557), and the Delete / Language / Timer /
 * Date sheets still to be built all repeat the same skeleton, so it lives
 * here once rather than in each of them:
 *
 *   backdrop — full screen, `colors.backdrop` (G900 @ 30%) over a blur
 *     (Figma effect "Background blur / md"), sheet bottom-aligned,
 *     paddingTop 16 / paddingBottom 40 / paddingHorizontal 16
 *
 * It opens the way a bottom sheet should: the sheet slides up from below
 * while the scrim fades in, rather than both appearing at once. React
 * Native's own `animationType="slide"` would drag the scrim up with the
 * sheet, so the two are animated separately here and the Modal itself is
 * told not to animate. The Modal stays mounted until the closing animation
 * finishes, otherwise it would vanish instead of sliding away.
 *   sheet — white, radius.xl (24), `shadows.xl`
 *     Modal header — title in `typography.subtext`, paddingTop 20 / px 16,
 *       then a 20pt spacer row; close button absolute at right 8 / top 8.4
 *     Content — px 16, paddingTop 20
 *     Modal actions — paddingTop 24, then px 16 / paddingBottom 24, gap 8
 *
 * Figma names the close button Button/Icon/Plain but gives it padding 10 /
 * radius 8 rather than the header's 8 / 16; with a transparent background
 * and a centred 24pt glyph in a 40pt box both render identically, so this
 * reuses `IconButton`.
 */
export default function ModalSheet({ visible, title, onClose, children, actions, overlay }: Props) {
  const { t } = useLanguage();
  // Kept mounted across the closing animation so the sheet can slide out.
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;
  // How far the sheet has to travel. State rather than a ref, because the
  // interpolation below is built during render and has to be rebuilt once
  // the real height is known; until then this generous fallback just starts
  // the sheet further off-screen. Each sheet measures once and keeps that
  // height, so this settles after the first layout pass.
  const [sheetHeight, setSheetHeight] = useState(600);

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

  // The sheet rests `spacing[10]` above the screen bottom (the backdrop's
  // paddingBottom), so it has to travel its own height *plus* that gap to
  // start fully off-screen.
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
          <BlurView intensity={BACKDROP_BLUR_INTENSITY} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, styles.scrim]} />
        </Animated.View>

        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={`${t('common.close')} ${title}`}>
          {/* Taps inside the sheet must not fall through to the backdrop. */}
          <Animated.View style={[styles.sheetWrap, { transform: [{ translateY }] }]}>
            <Pressable style={styles.sheet} onPress={() => {}} onLayout={measureSheet}>
              <View style={styles.header}>
                <View style={styles.headerTitle}>
                  <Text style={[typography.subtext, styles.title]}>{title}</Text>
                </View>
                <View style={styles.headerSpacer} />
                <IconButton accessibilityLabel={t('common.close')} onPress={onClose} style={styles.closeButton}>
                  <IcCross size={24} color={colors.textPrimary} />
                </IconButton>
              </View>

              <View style={styles.content}>{children}</View>

              {actions ? <View style={styles.actions}>{actions}</View> : null}
            </Pressable>
          </Animated.View>
        </Pressable>

        {overlay ? (
          <View style={styles.overlay} pointerEvents="none">
            {overlay}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

/**
 * Figma's backdrop carries "Background blur / md" (radius 16, which the CSS
 * export renders as `backdrop-blur-[8px]`). expo-blur takes a 0-100
 * intensity rather than a pixel radius, so this is the nearest equivalent
 * and the one value here that isn't a direct read from the node.
 */
const BACKDROP_BLUR_INTENSITY = 20;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrim: {
    backgroundColor: colors.backdrop,
  },
  overlay: {
    // Matches HomeScreen's own flash placement — pinned to the screen's top
    // regardless of where the sheet itself has slid to.
    position: 'absolute',
    top: 47,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
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
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  header: {
    width: '100%',
    backgroundColor: colors.background,
  },
  headerTitle: {
    width: '100%',
    paddingTop: spacing[7],
    paddingHorizontal: spacing.md,
  },
  title: {
    color: colors.textPrimary,
  },
  headerSpacer: {
    height: 20, // Figma "Padding bottom" (nodes 3198:4428 / 3233:4543)
  },
  closeButton: {
    position: 'absolute',
    right: spacing.sm,
    top: 8.4, // Figma: exact offset on nodes 3198:4429 / 3233:4544
  },
  content: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingTop: spacing[7],
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
    paddingTop: spacing[8],
    paddingHorizontal: spacing.md,
    paddingBottom: spacing[8],
  },
});
