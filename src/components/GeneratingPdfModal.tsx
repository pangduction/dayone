import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, View } from 'react-native';
import Text from './Text';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, spacing, typography } from '../theme/tokens';

const SPINNER_SIZE = 60;
const STROKE_WIDTH = 5;
const RADIUS = (SPINNER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Figma's static frame shows roughly a quarter of the ring lit — a real spin
// needs some arc length; this is the implementer's choice, not a measured one.
const ARC_FRACTION = 0.25;

type Props = {
  visible: boolean;
};

/**
 * Figma "Modal" over Setting-Export to PDF-2 (node 3201:6624) — a full-screen
 * blurred backdrop with a spinner and "You're almost done! We're generating
 * your PDF", shown while the real PDF is being built. Unlike every other
 * sheet in the app this isn't `ModalSheet` — Figma draws no card, just the
 * scrim with content centered directly on it.
 *
 * Figma's spinner is a single static image — one frame of what's clearly
 * meant to be spinning, styled with `colors.border` (track) and
 * `colors.accent` (arc), both confirmed via get_design_context. This draws
 * the same two-tone ring for real with a looping rotation, since a frozen
 * spinner would read as broken during the seconds a real PDF takes to
 * generate. (Figma's copy has "alomost" for "almost" — read as an authoring
 * typo, not a design value, and corrected here.)
 */
export default function GeneratingPdfModal({ visible }: Props) {
  const { t } = useLanguage();
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    rotation.setValue(0);
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, rotation]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.root}>
        <BlurView
          intensity={20}
          tint="dark"
          // See ModalSheet's own note: expo-blur's default Android renderer
          // doesn't produce a real blur without this.
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, styles.scrim]} />
        <View style={styles.content}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Svg width={SPINNER_SIZE} height={SPINNER_SIZE}>
              <Circle
                cx={SPINNER_SIZE / 2}
                cy={SPINNER_SIZE / 2}
                r={RADIUS}
                stroke={colors.border}
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              <Circle
                cx={SPINNER_SIZE / 2}
                cy={SPINNER_SIZE / 2}
                r={RADIUS}
                stroke={colors.accent}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={`${CIRCUMFERENCE * ARC_FRACTION} ${CIRCUMFERENCE}`}
                fill="none"
              />
            </Svg>
          </Animated.View>
          <Text style={[typography.subtext, styles.label]}>{t('generatingPdfModal.body')}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrim: {
    backgroundColor: colors.backdrop,
  },
  content: {
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    color: colors.textOnDark,
    textAlign: 'center',
  },
});
