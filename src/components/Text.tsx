import { StyleSheet, Text as RNText } from 'react-native';
import type { TextProps } from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import { koreanFontFor } from '../theme/koreanFonts';

/**
 * Drop-in replacement for RN's own `Text` — every screen/component imports
 * this instead (`import Text from '.../components/Text'` or a relative
 * path), so the Korean font swap happens in exactly one place rather than
 * at every call site that spreads a `typography.*` style.
 *
 * None of `typography`'s fonts (Inter, Poppins, Raleway, Jura) carry Hangul
 * glyphs, so once the app's language is Korean, whatever `fontFamily` the
 * caller's style already asked for gets swapped for its same-weight
 * Pretendard stand-in (`koreanFontFor`, `src/theme/koreanFonts.ts`) — added
 * as the *last* entry in the flattened style array, since RN merges style
 * arrays left-to-right and a later entry wins over an earlier one. English
 * stays untouched: this only overrides anything when `language === 'ko'`
 * *and* the requested font has a mapped Korean stand-in.
 */
export default function Text({ style, ...props }: TextProps) {
  const { language } = useLanguage();

  if (language !== 'ko') return <RNText style={style} {...props} />;

  const koreanFontFamily = koreanFontFor(StyleSheet.flatten(style)?.fontFamily);
  if (!koreanFontFamily) return <RNText style={style} {...props} />;

  return <RNText style={[style, { fontFamily: koreanFontFamily }]} {...props} />;
}
