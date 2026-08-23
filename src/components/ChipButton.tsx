import { Pressable, StyleSheet } from 'react-native';
import Text from './Text';
import { colors, radius, shadow } from '../theme/tokens';

export type ChipStatus = 'Active' | 'Enabled' | 'Disabled';

type Props = {
  /** e.g. a month label ("Jun") — the Figma component is built around a month chip. */
  label: string;
  status?: ChipStatus;
  onPress?: () => void;
};

/**
 * Maps to Figma's "Chip Button" component (node 3198:4673, Design System page).
 * "Active" = selected (accent border), "Enabled" = selectable (gray border,
 * dark text), "Disabled" = not selectable (gray border, washed-out text).
 */
export default function ChipButton({ label, status = 'Enabled', onPress }: Props) {
  const isActive = status === 'Active';
  const isDisabled = status === 'Disabled';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive, disabled: isDisabled }}
      accessibilityLabel={label}
      style={[styles.base, isActive ? styles.activeBorder : styles.inactiveBorder]}
    >
      <Text variant="body" color={isDisabled ? colors.gray[100] : colors.gray[800]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: 72.5,
    height: 40,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.xs,
  },
  activeBorder: {
    borderColor: colors.accent,
  },
  inactiveBorder: {
    borderColor: colors.gray[200],
  },
});
