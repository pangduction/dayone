import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import SecondaryButton from './SecondaryButton';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Figma "Button/Icon/Contained" (node 3183:2841) — the Home header's share
 * button.
 *
 * Figma gives it exactly the treatment of Button/Secondary/Default's inline
 * size: paddingHorizontal 8 / paddingVertical 5 at radius.sm, a
 * white-to-transparent gradient over `colors.buttonSecondary`, a 1px
 * `colors.buttonSecondaryRing` border and `shadows.secondary`. Two names in
 * Figma, one treatment — so this delegates rather than restating it, which is
 * how the two had drifted: this button was built as a flat `colors.surface`
 * chip with `shadows.xs` before Button/Secondary/Default existed to compare
 * it against.
 */
export default function IconButtonContained({ children, onPress, accessibilityLabel, style }: Props) {
  return (
    <SecondaryButton accessibilityLabel={accessibilityLabel} onPress={onPress} style={style}>
      {children}
    </SecondaryButton>
  );
}
