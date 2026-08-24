/**
 * Design tokens for the DayOne app, extracted from the Figma design system.
 *
 * Figma file: https://www.figma.com/design/Fv2MwZPH1NImXNF16W5cxw/DayOne
 * Design System page: node 27:24771 ("Design System")
 *
 * This file mirrors every color, type style, spacing, corner-radius and
 * shadow value pulled from the Design System page's components (buttons,
 * inputs, headers, modals, chips, alerts, calendar, etc.) via the Figma
 * MCP `get_variable_defs` / `get_design_context` tools. Components should
 * always pull values from here instead of hardcoding hex codes or font
 * sizes — see DESIGN_SYSTEM.md at the repo root for the full rules.
 *
 * Extend this file (don't fork it) whenever Figma introduces a token that
 * isn't captured yet.
 */

// ---------------------------------------------------------------------------
// Palette — raw color values, named the way Figma names them. Prefer the
// semantic `colors` export below in component code; reach for `palette`
// directly only when no semantic alias fits yet.
// ---------------------------------------------------------------------------
export const palette = {
  white: '#FFFFFF',
  black: '#000000',

  // Canonical grayscale ("G_" in Figma) — used by nearly every component.
  g50: '#F7F7F7',
  g100: '#E9E9E9',
  g200: '#C9CDD2',
  g400: '#9EA4AA',
  g500: '#72787F',
  g600: '#454C53',
  g800: '#26292D',
  g900: '#030303',

  // Legacy grayscale — still referenced by a handful of older components
  // (icons, a couple of headers) in the Figma file. Prefer the G_ scale
  // above for anything new; these exist only so we can match those nodes
  // exactly if we ever port them.
  grey400: '#A1A1AA',
  grey900: '#18181B',
  gray600: '#52525B',
  gray900: '#18181B',
  neutral700: '#404040',
  neutral900: '#171717',

  // Brand / semantic
  accent: '#0084FF',
  warning: '#D92D20',
  success: '#19AF66',
  kakaoYellow: '#FEE500',
  buttonLightFill: '#F5F5F5', // Figma: local fill on Button/Google (not a bound variable)
  progressTrack: '#D1D5DB', // Figma: local fill on Home-Calendar's Progress Box background (not a bound variable)
  accentSubtle: 'rgba(0, 132, 255, 0.08)', // Figma: Accent at 8% opacity — today's calendar cell highlight
  overlayContainer: 'rgba(38, 41, 45, 0.7)', // Figma: G800 at 70% opacity — SegmentedButton container bg (Add-Image-2, node 3192:12065)
  overlaySolid: 'rgba(3, 3, 3, 0.7)', // Figma: G900 at 70% opacity — SegmentedButton active segment + Button/S/Filled/FAB bg (nodes 3192:11941, 3192:11841)
  backdrop: 'rgba(3, 3, 3, 0.3)', // Figma: G900 at 30% opacity — modal scrim, and the tint over a photo calendar cell (nodes 3184:7350, 3184:3185)
  editorBar: '#E8EAED', // Figma: editor toolbar background (node 13:15150) — a keyboard-accessory grey, outside the G_ scale
  editorPaletteBar: '#F2F2F2', // Figma: the colour-palette row that opens under the toolbar, and the active Text Color button behind it
  swatchDefault: '#282828', // Figma: the palette's first ("default" text colour) swatch — not G900
  buttonSecondaryFill: '#F2F2F2', // Figma: Button/Secondary/Default's fill (node 3184:7871) — same value as the editor palette row, different role
  buttonSecondaryRing: '#EEEEEE', // Figma: that button's 1px ring, the second half of its shadow stack
  overlayAccent: 'rgba(0, 132, 255, 0.3)', // Figma: Accent at 30% opacity — tint over today's photo calendar cell (node 3184:3185)
  lockPaper: 'rgba(255, 255, 255, 0.7)', // Figma: white at 70% over a background blur — the Report's Lock Paper (node 3196:14417)
  emptyStateText: '#929DAD', // Figma: local fill on Home-List-Default's "You haven't written anything yet." (node 3192:9215) — get_variable_defs shows it binds no colour variable, and it is NOT G400 (#9EA4AA)
  toggleTrackOff: '#EFEFEF', // Figma: the "toggle" switch's off-state track fill (node 9:6902) — not a bound variable, and distinct from G50/G100
  toggleOn: '#00E585', // Figma: the "toggle" switch's on-state track fill (node 9:6905) — not a bound variable

  // iOS-style system color set (color picker / palette swatch components).
  systemRed: '#FF3B30',
  systemOrange: '#FF9500',
  systemYellow: '#FFCC00',
  systemGreen: '#34C759',
  systemBlue: '#007AFF',
  systemIndigo: '#5856D6',
  systemPurple: '#AF52DE',
  systemPink: '#FF2D55',
} as const;

// ---------------------------------------------------------------------------
// Semantic colors — what screens/components should actually import.
// ---------------------------------------------------------------------------
export const colors = {
  background: palette.white,
  surface: palette.g50,
  border: palette.g200,
  borderSubtle: palette.g100,
  borderStrong: palette.g600, // Figma G600 — the Post List Thumbnail card's 1px outline (node 3192:9523); much darker than `border`

  textPrimary: palette.g900,
  textSecondary: palette.g600,
  textTertiary: palette.g500,
  textStrong: palette.g800, // Figma G800 — calendar weekday labels, chip labels; darker than secondary, short of primary
  textPlaceholder: palette.g400,
  textOnDark: palette.white,

  buttonDark: palette.grey900, // Figma "grey 900" — used on filled/primary buttons
  buttonLight: palette.buttonLightFill,
  kakaoYellow: palette.kakaoYellow,

  accent: palette.accent,
  accentSubtle: palette.accentSubtle,
  warning: palette.warning,
  success: palette.success,
  progressTrack: palette.progressTrack,
  overlayContainer: palette.overlayContainer,
  overlaySolid: palette.overlaySolid,
  backdrop: palette.backdrop,
  photoScrim: palette.backdrop, // same G900 @ 30% as `backdrop`, but darkening a photo thumbnail rather than the whole screen
  overlayAccent: palette.overlayAccent,
  editorBar: palette.editorBar,
  editorPaletteBar: palette.editorPaletteBar,
  swatchDefault: palette.swatchDefault,
  buttonSecondary: palette.buttonSecondaryFill,
  buttonSecondaryRing: palette.buttonSecondaryRing,
  yearLabel: palette.neutral900, // Figma "Neutral/900" — the month picker's year (node 3229:4220)
  surfaceDark: palette.g600, // Figma G600 — filled tile on a light sheet (Modal/Gallery's camera tile, node 3198:4434)
  textEmpty: palette.emptyStateText, // the empty-list message (node 3192:9215)
  lockPaper: palette.lockPaper, // the veil over an unfinished month's report (node 3196:14417)
  textFaint: palette.g200, // Setting screen's section eyebrow labels (APP/SUPPORT/ACCOUNT, node 3198:7120) — lighter than textPlaceholder (G400)
  monthLabel: palette.neutral700, // Figma "Neutral/700" — the Export-to-PDF date range picker's month label (node 3201:5617), verified via get_variable_defs
  toggleTrackOff: palette.toggleTrackOff,
  toggleOn: palette.toggleOn,
  timerModalBg: palette.g900, // Figma G900 — Modal/Timer's dark sheet (node 3199:7894), the one dark-themed modal in the app
};

// ---------------------------------------------------------------------------
// Spacing — numeric scale plus the semantic aliases existing screens use.
// ---------------------------------------------------------------------------
export const spacing = {
  0: 0,
  1: 2,
  2: 4,
  3: 8,
  4: 10,
  5: 12,
  6: 16,
  7: 20,
  8: 24,
  9: 32,
  10: 40,

  // Semantic aliases (used throughout src/screens and src/components).
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// ---------------------------------------------------------------------------
// Layout — screen-level offsets that aren't part of the visual language, but
// have to agree between screens. Not design tokens; they live here so two
// screens can't drift apart.
// ---------------------------------------------------------------------------
export const layout = {
  /**
   * Figma: the gap between a screen's header and the Calendar Title under it.
   * The header ends at y 119 on both screens, and both put the title at
   * 143.87 — Home-Calendar-Default's Calendar sits at 119 with its title
   * 24.87 inside it (node 3192:9061), and Report Content does exactly the
   * same (node 3196:13480).
   *
   * An older Home frame (3184:4117) disagrees: there the Calendar is pinned
   * at 135.58 and is 447.26 tall, its exact content height, so the title sits
   * flush at the top. 3192:9057 instead stretches the Calendar to 497 and
   * centres the same content inside it — and 497 - 447.26 is 49.74, whose
   * half is this 24.87. The stretched frame is the one to follow; taking the
   * older one is what pulled the title 8.29 too high.
   */
  headerToTitle: 24.87,
} as const;

// ---------------------------------------------------------------------------
// Corner radius
// ---------------------------------------------------------------------------
export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24, // Figma: Modal/Gallery sheet corner (node 3198:4446)
  full: 999,
} as const;

// ---------------------------------------------------------------------------
// Typography — one entry per Figma text style found on the Design System
// page. `letterSpacing` and `lineHeight` are pre-converted to points
// (Figma stores letter-spacing as a percentage of font size).
// ---------------------------------------------------------------------------
export const typography = {
  display: {
    fontFamily: 'Jura_400Regular',
    fontSize: 80,
    letterSpacing: -6.4,
  },
  titleLarge: {
    // Figma: "Title-Large" — the recording screen's timer (node 3184:7866)
    fontFamily: 'Inter_400Regular',
    fontSize: 64,
    letterSpacing: 0,
    lineHeight: 64,
  },
  titleMedium: {
    // Figma: "Title-Medium"
    fontFamily: 'Inter_400Regular',
    fontSize: 40,
    letterSpacing: 0,
    lineHeight: 40,
  },
  titleSmall: {
    // Figma: "Title-Small"
    fontFamily: 'Inter_500Medium',
    fontSize: 24,
    letterSpacing: 0,
    lineHeight: 24,
  },
  calendarTitle: {
    // Figma: "Calendar/Title"
    fontFamily: 'Raleway_800ExtraBold',
    fontSize: 24,
    letterSpacing: 0,
    lineHeight: 24,
  },
  calendarDate: {
    // Figma: "Calendar/Date"
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 15,
  },
  calendarDay: {
    // Figma: "Calendar/Day"
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: -0.22,
    lineHeight: 11,
  },
  body: {
    // Figma: "Body"
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    letterSpacing: -0.075,
    lineHeight: 15 * 1.5,
  },
  subtext: {
    // Figma: "Subtext" — button labels, input labels
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: -0.13,
    lineHeight: 13 * 1.45,
  },
  caption: {
    // Figma: "Caption"
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    letterSpacing: 0.012,
    lineHeight: 11 * 1.4,
  },
  overline: {
    // Figma: "Overline"
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: -0.22,
    lineHeight: 11,
  },
  reportDate: {
    // Figma: "Report/Date" — the day label under a report thumbnail. The only
    // italic in the system.
    fontFamily: 'Inter_500Medium_Italic',
    fontSize: 9,
    letterSpacing: 0,
    lineHeight: 9 * 1.3,
  },
  reportCaption: {
    // Figma: "Report/Caption" — a report thumbnail's text excerpt
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0,
    lineHeight: 11 * 1.3,
  },
  alert: {
    // Not a named Figma text style — a local override on the Alert component
    // (node 3233:5183), which sets Inter Medium at 13/20 rather than reusing
    // Body (15) or Subtext (bold 13).
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 20,
  },
};

// ---------------------------------------------------------------------------
// Shadows — Figma effect styles, converted to React Native's shadow* props.
// `elevation` is the Android fallback; iOS/web use the shadow* props.
// ---------------------------------------------------------------------------
export const shadows = {
  xs: {
    // Figma "Shadow/xs": drop shadow #0000000D, offset (0, 1), blur 2
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  secondary: {
    // Figma "Button/Secondary/Default" stacks a drop shadow with a 1px ring:
    //   #0000001F offset(0, 6) blur 10 spread -4
    //   #EEEEEE   offset(0, 0) blur 0  spread 1
    // RN has no spread, so the ring is drawn as a 1px border on the component
    // and only the drop shadow lives here.
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  xl: {
    // Figma "Shadow/xl" stacks two drop shadows:
    //   #0000000A offset(0, 8) blur 8 spread -4
    //   #0000001A offset(0, 20) blur 24 spread -4
    // RN only supports one shadow per view, so this approximates the pair
    // with a single deeper shadow; use the two values above directly for
    // web (CSS `box-shadow`) if pixel-perfect fidelity is needed there.
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  toggleThumbOff: {
    // Figma "Switch-in shadow" on the off-state thumb: #00000040 offset(2, 1) blur 6.
    // The track's own inset shadow (Figma "Switch - in shadow") isn't reproduced —
    // RN has no inset shadow, and at 40x18 it's not visually load-bearing.
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  toggleThumbOn: {
    // Figma "Switch-out shadow" on the on-state thumb: #00000040 offset(-2, 1) blur 6 — the same shadow, flipped, since the thumb sits on the opposite side.
    shadowColor: '#000000',
    shadowOffset: { width: -2, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;

/** Fonts to load with `useFonts` before rendering any screen. */
export const fontAssets = {
  Jura_400Regular: require('@expo-google-fonts/jura/400Regular/Jura_400Regular.ttf'),
  Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
  Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
  Inter_500Medium_Italic: require('@expo-google-fonts/inter/500Medium_Italic/Inter_500Medium_Italic.ttf'),
  Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
  Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  Raleway_800ExtraBold: require('@expo-google-fonts/raleway/800ExtraBold/Raleway_800ExtraBold.ttf'),
  Poppins_700Bold: require('@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf'),
};
