import { Pressable, StyleSheet } from 'react-native';
import Text from './Text';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radius, typography } from '../theme/tokens';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Figma "Button / L / Filled / White" (component node 3202:5778), the quiet
 * companion to `PrimaryButton` in a modal's actions block — Modal/Leave's
 * "Keep Editing". White background, min-height 48, paddingHorizontal 18,
 * paddingVertical 10, radius.lg, centered `typography.body` label in
 * `colors.textTertiary` (G500).
 */
export default function WhiteButton({ label, onPress, disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={[typography.body, styles.label]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    width: '100%',
    paddingHorizontal: 18, // Figma: exact value, doesn't land on the spacing scale
    paddingVertical: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
