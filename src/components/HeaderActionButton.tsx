import { Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = {
  label: string;
  active: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Figma "Button / M / Header Action" — the pill button in a screen header,
 * e.g. the Add screen's "Done" (instance node 3184:5690 on Add-Image-2,
 * master/off-state node 3184:5684 on Header/Add). Both states are now
 * verified against real fetched nodes:
 *   - off:  bg colors.surface (G50 #F7F7F7), text colors.border (G200 #C9CDD2)
 *     — get_design_context on node 3184:5701 ("Header/Add", no photo yet)
 *   - on:   bg colors.accent (#0084FF), text colors.textOnDark (white)
 *     — get_design_context on node 3184:5903 ("Add-Image-2", photo selected)
 * height 40, paddingHorizontal spacing[5] (12), paddingVertical spacing.sm
 * (8), radius.lg (16), label in typography.subtext.
 */
export default function HeaderActionButton({ label, active, onPress, disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, active && styles.buttonActive, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={[typography.subtext, styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 40,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: colors.accent,
  },
  label: {
    color: colors.border,
  },
  labelActive: {
    color: colors.textOnDark,
  },
});
