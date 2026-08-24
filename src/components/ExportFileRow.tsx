import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IcArrowRightL } from './icons/CommonIcons';
import { colors, spacing, typography } from '../theme/tokens';
import type { ExportFile } from '../data/exports';

type Props = {
  file: ExportFile;
  onPress: () => void;
};

/**
 * Figma "File Item" (node 3201:6535) — one row of the Export to PDF screen's
 * Files section: the real filename over its "Valid until" expiry date at a
 * tight gap 3 (Figma-exact, off the spacing scale — the same gap Share
 * Image's "Created by Dayone" pill uses), then a chevron. Tapping it opens
 * the PDF preview (Figma node 3267:6006).
 */
export default function ExportFileRow({ file, onPress }: Props) {
  const validUntil = new Date(file.expiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${file.filename}, valid until ${validUntil}`}
    >
      <View style={styles.title}>
        <Text style={[typography.body, styles.filename]} numberOfLines={1}>
          {file.filename}
        </Text>
        <Text style={[typography.caption, styles.validUntil]} numberOfLines={1}>
          Valid until {validUntil}
        </Text>
      </View>
      <IcArrowRightL size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing[5],
  },
  title: {
    flex: 1,
    gap: 3, // Figma-exact (node 3201:6536), not on the spacing scale
  },
  filename: {
    color: colors.textPrimary,
  },
  validUntil: {
    color: colors.textTertiary,
  },
});
