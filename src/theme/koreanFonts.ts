/**
 * Maps every Latin `fontFamily` used in `typography` (tokens.ts) to its
 * same-weight Pretendard stand-in, for `src/components/Text.tsx` to swap in
 * once the app's language is Korean — none of Inter/Poppins/Raleway/Jura
 * carry Hangul glyphs at all.
 *
 * Two families are deliberately left unmapped (returned unchanged):
 *   - `Jura_400Regular` — the "DayOne" wordmark (`typography.display`) is a
 *     brand mark, not translated text, in either language.
 *   - `Inter_500Medium_Italic` — a report thumbnail's day label
 *     (`typography.reportDate`); Pretendard ships no italic style, and this
 *     is minor enough (a short, mostly-numeric string) not to warrant a
 *     synthetic italic transform.
 */
const KOREAN_FONT_MAP: Record<string, string> = {
  Inter_400Regular: 'Pretendard-Regular',
  Inter_500Medium: 'Pretendard-Medium',
  Inter_600SemiBold: 'Pretendard-SemiBold',
  Inter_700Bold: 'Pretendard-Bold',
  Poppins_700Bold: 'Pretendard-Bold',
  Raleway_800ExtraBold: 'Pretendard-ExtraBold',
};

export function koreanFontFor(fontFamily: unknown): string | undefined {
  if (typeof fontFamily !== 'string') return undefined;
  return KOREAN_FONT_MAP[fontFamily];
}
