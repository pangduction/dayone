import { StyleSheet, TextInput, View } from 'react-native';
import Text from './Text';
import type { KeyboardTypeOptions } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  /** Switches to Contents' variant: a fixed 240 height (not a minimum — a multiline TextInput grows to fit its content by default, which drifted from Figma's static box as soon as typing wrapped past a few lines), text top-aligned instead of vertically centered. */
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

/**
 * Figma "Input with label" (e.g. node 3201:8013 "Email*" / 3201:8021
 * "Contents*") — a `typography.subtext` label in `colors.textSecondary`
 * over the plain "Input" field (3201:8015 / 3201:8023): white bg, 1px
 * `colors.border`, `radius.sm`, `shadows.xs`, paddingHorizontal 12 /
 * paddingVertical 10 (Figma's 43-tall single-line box is exactly 10 + one
 * 23pt Body line + 10).
 *
 * The single-line box (Email) drops `typography.body`'s own `lineHeight`
 * from its style, same as the search field's own workaround
 * (`PostSearchScreen.tsx`) and for the same reason: with the full style
 * spread, iOS renders the text visibly off-centre in the box despite the
 * padding math lining up on paper. The multiline box (Contents) keeps
 * `lineHeight` — its text is top-aligned rather than centred, which is
 * what the single-line box's bug depends on, and multiple wrapped lines
 * need it for correct line spacing.
 *
 * Figma's own label text already carries the "*" required marker inline
 * ("Email*", "Contents*") rather than as a separate glyph — ported as
 * literal label text for the same reason.
 */
export default function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  autoCapitalize,
}: Props) {
  return (
    <View style={styles.field}>
      <Text style={[typography.subtext, styles.label]}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        selectionColor={colors.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
    gap: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
  },
  input: {
    width: '100%',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    // Body's fields are listed out rather than spread — see this file's own
    // doc comment for why `lineHeight` is dropped here (the single-line
    // iOS centering bug `PostSearchScreen.tsx` already worked around).
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    letterSpacing: typography.body.letterSpacing,
    ...shadows.xs,
  },
  inputMultiline: {
    // Fixed, not minHeight — an RN multiline TextInput otherwise grows to
    // fit its own content, so the box kept resizing as the user typed past
    // a few lines instead of staying put like Figma's static box. Content
    // past this height scrolls inside the field instead.
    height: 240,
    // Restored here (dropped from the base `input` style above): multiple
    // wrapped lines need real line spacing, and this box's text is
    // top-aligned rather than centred, so it doesn't hit the same bug.
    lineHeight: typography.body.lineHeight,
  },
});
