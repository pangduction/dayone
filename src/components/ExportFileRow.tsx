import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IcArrowRightL } from './icons/CommonIcons';
import { colors, spacing, typography } from '../theme/tokens';
import type { ExportFile } from '../data/exports';

type Props = {
  file: ExportFile;
  onPress: () => void;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * "D-3", "D-1", "D-DAY" — days left until `expiresAt`, counting whole
 * calendar days rather than raw hours so a file generated at 11pm doesn't
 * read one day shorter than one generated at 7am the same day. Floored at 0
 * ("D-DAY") rather than going negative: `getExportFiles` prunes an expired
 * file (and its bytes) on every read, so this only has to cover the moment
 * before that next read happens, not an actually-expired file sitting here.
 */
function daysLeftLabel(expiresAt: string): string {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const expiryDate = new Date(expiresAt);
  expiryDate.setHours(0, 0, 0, 0);
  const daysLeft = Math.max(0, Math.round((expiryDate.getTime() - startOfToday.getTime()) / MS_PER_DAY));
  return daysLeft === 0 ? 'D-DAY' : `D-${daysLeft}`;
}

/**
 * Figma "File Item" (node 3201:6535) — one row of the Export to PDF screen's
 * Files section: the real filename over its expiry at a tight gap 3
 * (Figma-exact, off the spacing scale — the same gap Share Image's "Created
 * by Dayone" pill uses), then a chevron. Tapping it opens the PDF preview
 * (Figma node 3267:6006).
 *
 * Figma's own mock reads "Valid until Sep 23, 2026" — an absolute date that
 * made sense against the original 30-day window, but reads as needless
 * arithmetic now that a file only lives 7 days: a countdown ("D-3") answers
 * "how much longer do I have" directly, which is the only reason this label
 * exists. Implementer's choice, not a Figma read.
 */
export default function ExportFileRow({ file, onPress }: Props) {
  const label = daysLeftLabel(file.expiresAt);

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${file.filename}, ${label === 'D-DAY' ? 'expires today' : `expires in ${label.slice(2)} days`}`}
    >
      <View style={styles.title}>
        <Text style={[typography.body, styles.filename]} numberOfLines={1}>
          {file.filename}
        </Text>
        <Text style={[typography.caption, styles.validUntil]} numberOfLines={1}>
          {label}
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
