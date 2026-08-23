import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../theme/tokens';
import { IcFilled, IcFit } from './icons/AddIcons';
import type { PhotoFit } from '../data/posts';

/**
 * Same union as the stored `PhotoFit` — aliased rather than redeclared so the
 * toggle and the persisted post can never drift apart.
 */
export type FitMode = PhotoFit;

type Props = {
  value: FitMode;
  onChange: (mode: FitMode) => void;
};

/**
 * Figma "SegmentedButton" (node 3192:12065, on Add-Image-2 3184:5903): the
 * Fit/Filled toggle overlaid top-center on the Add screen's selected photo,
 * controlling the image's resizeMode. Container bg = colors.overlayContainer
 * (G800 @ 70%); the active segment gets colors.overlaySolid (G900 @ 70%)
 * plus a white icon/label, the inactive segment is transparent with
 * colors.textPlaceholder icon/label. Verified via get_design_context.
 */
export default function SegmentedButton({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange('fit')}
        style={[styles.segment, value === 'fit' && styles.segmentActive]}
        accessibilityRole="button"
        accessibilityLabel="Fit"
        accessibilityState={{ selected: value === 'fit' }}
      >
        <IcFit size={12} color={value === 'fit' ? colors.textOnDark : colors.textPlaceholder} />
        <Text style={[typography.overline, styles.label, value === 'fit' && styles.labelActive]}>Fit</Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('filled')}
        style={[styles.segment, value === 'filled' && styles.segmentActive]}
        accessibilityRole="button"
        accessibilityLabel="Filled"
        accessibilityState={{ selected: value === 'filled' }}
      >
        <IcFilled size={12} color={value === 'filled' ? colors.textOnDark : colors.textPlaceholder} />
        <Text style={[typography.overline, styles.label, value === 'filled' && styles.labelActive]}>Filled</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 32,
    padding: 2,
    borderRadius: 17, // Figma: SegmentedButton outer radius — doesn't land on the radius scale
    backgroundColor: colors.overlayContainer,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: 80,
    paddingHorizontal: 13,
    paddingVertical: 3,
    borderRadius: radius.lg,
  },
  segmentActive: {
    backgroundColor: colors.overlaySolid,
  },
  label: {
    color: colors.textPlaceholder,
  },
  labelActive: {
    color: colors.textOnDark,
  },
});
