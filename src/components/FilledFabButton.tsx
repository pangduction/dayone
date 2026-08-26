import { Pressable, StyleSheet } from 'react-native';
import Text from './Text';
import { colors, typography } from '../theme/tokens';
import { IcCross } from './icons/AddIcons';

type Props = {
  label: string;
  onPress?: () => void;
};

/**
 * Figma "Button / S / Filled / FAB" (node 3192:11841): a small pill button
 * used as the Add screen's photo "Delete" action, overlaid bottom-center on
 * the selected photo. bg colors.overlaySolid (G900 @ 70%), white
 * typography.overline label, trailing 16x16 ic/cross.
 */
export default function FilledFabButton({ label, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.button} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={[typography.overline, styles.label]}>{label}</Text>
      <IcCross size={16} color={colors.textOnDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 3,
    borderRadius: 20, // Figma: Button/S/Filled/FAB radius — doesn't land on the radius scale
    backgroundColor: colors.overlaySolid,
  },
  label: {
    color: colors.textOnDark,
  },
});
