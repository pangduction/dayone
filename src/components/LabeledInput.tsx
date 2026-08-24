import { StyleSheet, Text, TextInput, View } from 'react-native';
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
 * 23pt Body line + 10 — unlike the search field's fixed-height trick, this
 * box is built *around* Body's own lineHeight, so the whole style spreads
 * cleanly per §3 rather than needing the search field's workaround).
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
    ...typography.body,
    ...shadows.xs,
  },
  inputMultiline: {
    // Fixed, not minHeight — an RN multiline TextInput otherwise grows to
    // fit its own content, so the box kept resizing as the user typed past
    // a few lines instead of staying put like Figma's static box. Content
    // past this height scrolls inside the field instead.
    height: 240,
  },
});
