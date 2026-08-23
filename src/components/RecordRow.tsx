import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import IconButton from './IconButton';
import SecondaryButton from './SecondaryButton';
import Waveform from './Waveform';
import { IcCross } from './icons/AddIcons';
import { IcPause, IcPlay } from './icons/CommonIcons';
import { formatDuration } from '../utils/duration';
import type { Recording } from '../data/posts';
import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = {
  recording: Recording;
  /**
   * Figma draws two variants of the same row: Record/Edit (node 3192:12499)
   * on the Add screen, which has a G50 background and a remove button, and
   * Record/View (node 3192:12570) on the post detail, which is transparent,
   * inset further, and has neither.
   */
  variant: 'edit' | 'view';
  /** Only meaningful for the edit variant. */
  onRemove?: () => void;
};

/**
 * A post's voice recording as a row: play/pause, waveform, duration — and on
 * the Add screen a button to drop it.
 *
 * Playback is real: the play button toggles an `expo-audio` player over the
 * stored file, and the glyph follows what the player is actually doing rather
 * than a local flag, so reaching the end resets it on its own.
 */
export default function RecordRow({ recording, variant, onRemove }: Props) {
  const player = useAudioPlayer({ uri: recording.uri });
  const status = useAudioPlayerStatus(player);
  const isPlaying = status.playing;

  // Playing again after the clip finished would otherwise resume from the end.
  useEffect(() => {
    if (status.didJustFinish) player.seekTo(0);
  }, [status.didJustFinish, player]);

  const toggle = () => {
    if (isPlaying) player.pause();
    else player.play();
  };

  return (
    <View style={[styles.row, variant === 'edit' ? styles.edit : styles.view]}>
      <SecondaryButton accessibilityLabel={isPlaying ? 'Pause recording' : 'Play recording'} onPress={toggle}>
        {isPlaying ? (
          <IcPause size={24} color={colors.textPrimary} />
        ) : (
          <IcPlay size={24} color={colors.textPrimary} />
        )}
      </SecondaryButton>

      <Waveform samples={recording.samples} height={14} />

      <View style={styles.tail}>
        <Text
          style={[
            typography.body,
            variant === 'edit' ? styles.durationEdit : styles.durationView,
          ]}
        >
          {formatDuration(recording.durationMs)}
        </Text>
        {variant === 'edit' && onRemove ? (
          <IconButton accessibilityLabel="Remove recording" onPress={onRemove}>
            <IcCross size={24} color={colors.textPrimary} />
          </IconButton>
        ) : null}
      </View>
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
  },
  edit: {
    backgroundColor: colors.surface,
    // Figma: the remove button's own padding carries the right edge in.
    paddingLeft: spacing[5],
    paddingRight: 3,
    paddingVertical: spacing.sm,
  },
  view: {
    paddingHorizontal: spacing[10],
    paddingVertical: spacing.sm,
  },
  tail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationEdit: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  durationView: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
