/**
 * Design tokens for the DayOne app, pulled from Figma via Figma MCP.
 *
 * Figma file: https://www.figma.com/design/Fv2MwZPH1NImXNF16W5cxw/DayOne
 * Source: `get_variable_defs` run across the "Design System" page's product
 * flows (Flow 1 Login, Flow 2 Post, Flow 3 Home, Flow 4 Post Detail, Flow 5
 * Report, Flow 6 Home-Share, Flow 7 Setting) plus the core Button/Chip
 * components — i.e. every color & text style actually used in the product,
 * not just one screen. Values cross-checked against `get_design_context`
 * output (rendered px) where available; entries not yet used by an
 * implemented screen are marked below and should be re-verified against a
 * screenshot before shipping.
 */

export const colors = {
  /** Primary grayscale ramp — Figma text styles "G50"–"G900". */
  gray: {
    50: '#F7F7F7',
    100: '#E9E9E9',
    200: '#C9CDD2',
    400: '#9EA4AA',
    500: '#72787F',
    600: '#454C53',
    800: '#26292D',
    900: '#030303',
  },
  /** Secondary neutral ramp — Figma styles "grey 100/400/900", used for filled surfaces/buttons rather than text. */
  neutral: {
    100: '#F4F4F5',
    400: '#A1A1AA',
    900: '#18181B',
  },
  white: '#FFFFFF',
  /** Figma style "Accent" — brand blue, used for selected/active states (e.g. Chip Button). */
  accent: '#0084FF',

  // Semantic aliases used across implemented screens — extend as more screens
  // are implemented rather than guessing ahead.
  background: '#FFFFFF',
  surface: '#F5F5F5',
  textPrimary: '#030303', // gray.900
  textSecondary: '#454C53', // gray.600
  textOnDark: '#FFFFFF',
  buttonDark: '#18181B', // neutral.900
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
  /** Figma "Display" — Login hero title (Jura). Confirmed via get_design_context. */
  display: {
    fontFamily: 'Jura_400Regular',
    fontSize: 80,
    letterSpacing: -6.4,
  },
  /** Figma "Title-Large". Not yet used by an implemented screen — re-verify px on first use. */
  titleLarge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 64,
    letterSpacing: 0,
    lineHeight: 64,
  },
  /** Figma "Title-Medium". Not yet used by an implemented screen — re-verify px on first use. */
  titleMedium: {
    fontFamily: 'Inter_400Regular',
    fontSize: 40,
    letterSpacing: 0,
    lineHeight: 40,
  },
  /** Figma "Title-Small" — e.g. Button / L / Filled / Primary label context, section titles. */
  titleSmall: {
    fontFamily: 'Inter_500Medium',
    fontSize: 24,
    letterSpacing: 0,
    lineHeight: 24,
  },
  /** Figma "Calendar/Title" (Raleway ExtraBold) — month/year heading on calendar views. */
  calendarTitle: {
    fontFamily: 'Raleway_800ExtraBold',
    fontSize: 24,
    letterSpacing: 0,
    lineHeight: 24,
  },
  /** Figma "Overline". Confirmed via get_design_context (Login subtitle, FAB label). */
  overline: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: -0.22,
  },
  /** Figma "Body". Confirmed via get_design_context (button labels, chip labels). */
  body: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    letterSpacing: -0.075,
    lineHeight: 15 * 1.5,
  },
  /** Figma "Subtext". Confirmed via get_design_context (Button / M / Ghost / Secondary). */
  subtext: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: -0.13,
    lineHeight: 13 * 1.45,
  },
  /** Figma "Caption" (Poppins Bold). Not yet used by an implemented screen — re-verify px on first use. */
  caption: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    letterSpacing: 0.01,
    lineHeight: 11 * 1.4,
  },
  /** Figma "Calendar/Day" — weekday header (Sun/Mon/...) in calendar grids. */
  calendarDay: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: -0.22,
    lineHeight: 11,
  },
  /** Figma "Calendar/Date" — day-of-month numerals in calendar grids. */
  calendarDate: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 15,
  },
  /** Figma "Report/Caption". Not yet used by an implemented screen — re-verify px on first use. */
  reportCaption: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0,
    lineHeight: 11 * 1.3,
  },
  /** Figma "Report/Date" (italic). Not yet used by an implemented screen — re-verify px on first use. */
  reportDate: {
    fontFamily: 'Inter_500Medium_Italic',
    fontSize: 9,
    letterSpacing: 0,
    lineHeight: 9 * 1.3,
    fontStyle: 'italic' as const,
  },
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  /** Button / M / Ghost / Secondary corner radius. */
  button: 12,
  /** Button / S / Filled / FAB corner radius (pill). */
  pill: 20,
  full: 999,
};

export const shadow = {
  /** Figma "Shadow/xs" — used on Ghost/Secondary buttons and chips. */
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
};

/** Fonts to load with `useFonts` before rendering any screen. */
export const fontAssets = {
  Jura_400Regular: require('@expo-google-fonts/jura/400Regular/Jura_400Regular.ttf'),
  Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
  Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
  Inter_500Medium_Italic: require('@expo-google-fonts/inter/500Medium_Italic/Inter_500Medium_Italic.ttf'),
  Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  Poppins_700Bold: require('@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf'),
  Raleway_800ExtraBold: require('@expo-google-fonts/raleway/800ExtraBold/Raleway_800ExtraBold.ttf'),
};
