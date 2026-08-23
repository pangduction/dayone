import { Text as RNText, StyleSheet } from 'react-native';
import type { TextProps as RNTextProps } from 'react-native';
import { colors, typography } from '../theme/tokens';

export type TypographyVariant = keyof typeof typography;

type Props = RNTextProps & {
  /** Figma text style to apply — see `typography` in theme/tokens.ts. */
  variant?: TypographyVariant;
  /** Defaults to `colors.textPrimary`; pass any token or raw hex to override. */
  color?: string;
};

/**
 * Renders text using one of the Figma design-system type styles
 * (`typography.*` in theme/tokens.ts, sourced from Figma via
 * `get_variable_defs` across the product's Flow 1–7 screens).
 */
export default function Text({ variant = 'body', color = colors.textPrimary, style, ...rest }: Props) {
  return <RNText style={[styles.base, textVariantStyles[variant], { color }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    // React Native has no separate "letter-spacing in % of font size" unit —
    // typography.* already stores letterSpacing pre-converted to px.
  },
});

const textVariantStyles = Object.fromEntries(
  (Object.keys(typography) as TypographyVariant[]).map((key) => {
    const style = typography[key];
    return [
      key,
      {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        letterSpacing: style.letterSpacing,
        ...('lineHeight' in style ? { lineHeight: style.lineHeight } : null),
        ...('fontStyle' in style ? { fontStyle: style.fontStyle } : null),
      },
    ];
  })
) as Record<TypographyVariant, object>;
