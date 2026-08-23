/**
 * Design tokens for the Daypic app, pulled from Figma.
 *
 * Figma file: https://www.figma.com/design/Fv2MwZPH1NImXNF16W5cxw/Daypic-기획-
 * Values below are confirmed against implemented screens (currently: Login).
 * Extend this file as more screens are implemented rather than guessing ahead.
 */

export const colors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  textPrimary: '#030303', // G900
  textSecondary: '#454C53', // G600
  textOnDark: '#FFFFFF',
  buttonDark: '#18181B', // grey 900
  buttonLight: '#F5F5F5',
  kakaoYellow: '#FEE500',
  border: '#E0E0E0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  display: {
    fontFamily: 'Jura_400Regular',
    fontSize: 80,
    letterSpacing: -6.4,
  },
  overline: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: -0.22,
  },
  body: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    letterSpacing: -0.075,
    lineHeight: 15 * 1.5,
  },
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 999,
};

/** Fonts to load with `useFonts` before rendering any screen. */
export const fontAssets = {
  Jura_400Regular: require('@expo-google-fonts/jura/400Regular/Jura_400Regular.ttf'),
  Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
};
