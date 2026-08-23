/**
 * Design tokens for the Daypic app.
 *
 * These are placeholders — replace each value with the real token pulled
 * from the Figma file (Daypic 기획) once a specific screen/frame is
 * implemented. Prefer copying variable names 1:1 from Figma so future
 * screens stay in sync with the design system.
 *
 * Figma file: https://www.figma.com/design/Fv2MwZPH1NImXNF16W5cxw/Daypic-기획-
 */

export const colors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  textPrimary: '#111111',
  textSecondary: '#666666',
  primary: '#000000',
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
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 999,
};
