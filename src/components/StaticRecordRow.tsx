import { StyleSheet, View } from 'react-native';
import Text from './Text';
import SecondaryButton from './SecondaryButton';
import Waveform from './Waveform';
import { IcPlay } from './icons/CommonIcons';
import { formatDuration } from '../utils/duration';
import type { Recording } from '../data/posts';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = {
  recording: Recording;
};

/**
 * The non-interactive twin of `RecordRow`'s "view" variant (node 3192:12570),
 * for contexts that only ever show a *picture* of a recording — the
 * Export-to-PDF preview and the off-screen capture that becomes the real PDF
 * page. `RecordRow` wires up a real `expo-audio` player so the live post
 * detail screen can actually play a recording back; reusing it here would
 * spin up a real player (and a pressable, seemingly-working play button) for
 * something that's either a screenshot-in-waiting or literally already a
 * flat image inside a PDF file — neither can play anything, so nothing here
 * should look like it can either. Same play glyph, waveform, and stored
 * duration; no player, no `onPress`.
 */
export default function StaticRecordRow({ recording }: Props) {
  const { t } = useLanguage();
  return (
    <View style={styles.row}>
      <SecondaryButton accessibilityLabel={t('recordRow.recording')}>
        <IcPlay size={24} color={colors.textPrimary} />
      </SecondaryButton>
      <Waveform samples={recording.samples} height={14} />
      <Text style={[typography.body, styles.duration]}>{formatDuration(recording.durationMs)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    minHeight: 56,
    borderRadius: radius.sm,
    overflow: 'hidden',
    paddingHorizontal: spacing[10],
    paddingVertical: spacing.sm,
  },
  duration: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
