import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Post } from '../data/posts';
import { parseDateKey } from '../data/posts';
import { formatDuration } from '../utils/duration';
import Waveform from './Waveform';
import { colors, radius, spacing, typography } from '../theme/tokens';

/** Figma: the thumbnail column is a fixed 120 wide (node 3196:14379). */
export const REPORT_THUMBNAIL_WIDTH = 120;
/** Figma: the image block is 120x160 — `aspect-[120/160]` on every variant. */
const IMAGE_HEIGHT = 160;

type Props = {
  post: Post;
  /**
   * Whether the day label sits above the image rather than below it. Figma
   * pairs this with the section's alignment — see PostThumbnailRows.
   */
  dateUp: boolean;
  onPress?: () => void;
  /**
   * Fired the instant the finger lands, before any press is decided. The
   * strip uses it to hold its drift, which it must do or the scroll view
   * cancels the press before it fires.
   */
  onPressIn?: () => void;
  onPressOut?: () => void;
};

/**
 * Figma "Post Report Thumbnail" (instances 3196:14379 / 14381 / 14383 /
 * 14385 / 14387 / 14389 across a Post Thumbnail Rows strip) — one post inside
 * the Report's horizontal montage.
 *
 * A 120-wide column of three parts, of which only the image block is always
 * present:
 *
 *   image block  120x160. The post's photo, or — when there is no photo — an
 *                empty box outlined in a 1px dashed `colors.border` with the
 *                post's text inside it at padding 4 (node 3196:13857).
 *   day label    `typography.reportDate` in `colors.textSecondary`, the one
 *                italic in the system, 8 from the image. Reads "(2), Thu".
 *   caption      the post's text at `typography.reportCaption` in
 *                `colors.textStrong`, 16 from the image — but only when the
 *                post has a photo. With no photo the text lives *inside* the
 *                dashed box instead, so it is never drawn twice.
 *
 * `dateUp` mirrors the whole column: the day label hugs the image on one
 * side and the caption sits at the far end, so with the label above the
 * image the caption goes below, and vice versa.
 *
 * A recording is drawn inside the image block, pinned to its bottom, as
 * Figma's Record/View: the waveform over the duration in white (node
 * 3196:13914). Over a photo it sits on `colors.photoScrim`.
 */
export default function PostReportThumbnail({ post, dateUp, onPress, onPressIn, onPressOut }: Props) {
  const date = parseDateKey(post.date);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  // Figma writes the day in brackets before the weekday: "(31), Sat".
  const dateLabel = `(${date.getDate()}), ${weekday}`;

  const hasPhoto = post.photoUri !== null;
  const hasText = post.text.trim().length > 0;
  const recording = post.recording;

  const Container = onPress ? Pressable : View;

  const dayLabel = (
    <Text style={[typography.reportDate, styles.dateLabel]} numberOfLines={1}>
      {dateLabel}
    </Text>
  );

  const imageBlock = (
    <View style={[styles.imageBlock, hasPhoto ? null : styles.imageBlockEmpty]}>
      {hasPhoto ? (
        <>
          <Image source={{ uri: post.photoUri! }} style={styles.photo} resizeMode="cover" />
          {recording ? <View style={styles.photoScrim} /> : null}
        </>
      ) : hasText ? (
        <Text style={[typography.reportCaption, styles.boxedText]}>{post.text}</Text>
      ) : null}

      {recording ? (
        <View style={styles.record}>
          <View style={styles.recordTrack}>
            <Waveform samples={recording.samples} height={14} />
          </View>
          <Text
            style={[typography.reportCaption, hasPhoto ? styles.recordDurationOnPhoto : styles.recordDuration]}
          >
            {formatDuration(recording.durationMs)}
          </Text>
        </View>
      ) : null}
    </View>
  );

  // The label always hugs the image at gap 8; that pair is Figma's
  // "Thumbnail-Gap" (node 3196:14334).
  const imageWithLabel = (
    <View style={styles.imageGroup}>
      {dateUp ? dayLabel : null}
      {imageBlock}
      {dateUp ? null : dayLabel}
    </View>
  );

  // Only a post with a photo shows a separate caption — otherwise the text is
  // already inside the dashed box above.
  const caption =
    hasPhoto && hasText ? (
      <Text style={[typography.reportCaption, styles.caption]} numberOfLines={3} ellipsizeMode="tail">
        {post.text}
      </Text>
    ) : null;

  return (
    <Container
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Open the post for ${post.date}` : undefined}
      style={styles.column}
    >
      {dateUp ? (
        <>
          {imageWithLabel}
          {caption}
        </>
      ) : (
        <>
          {caption}
          {imageWithLabel}
        </>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  column: {
    width: REPORT_THUMBNAIL_WIDTH,
    alignItems: 'flex-start',
    gap: spacing.md, // Figma: 16 between the caption and the image group
  },
  imageGroup: {
    width: '100%',
    alignItems: 'flex-start',
    gap: spacing.sm, // Figma "Thumbnail-Gap": 8 between the label and the image
  },
  imageBlock: {
    width: '100%',
    height: IMAGE_HEIGHT,
    justifyContent: 'flex-end',
    padding: spacing.xs, // Figma: 4 (node 3196:13857 / 3196:13912)
    overflow: 'hidden',
  },
  imageBlockEmpty: {
    // Figma outlines the box only when there is no photo to fill it.
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border, // Figma G200
    justifyContent: 'flex-start',
  },
  photo: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  photoScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.photoScrim,
  },
  boxedText: {
    width: '100%',
    color: colors.textStrong, // Figma G800
  },
  dateLabel: {
    width: '100%',
    color: colors.textSecondary, // Figma G600
  },
  caption: {
    // Figma sets this text node to 147 even though the column is 120, so the
    // caption deliberately runs wider than its own photo (nodes 3196:13893 /
    // 3196:14065). It overhangs the 16 gap into the next column by 11.
    width: 147,
    color: colors.textStrong,
  },
  record: {
    // Figma "Record/View" inside the image block (node 3196:13914): pinned to
    // the bottom, paddingVertical 8, the waveform over the duration.
    width: '100%',
    minHeight: 56,
    justifyContent: 'flex-end',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  recordTrack: {
    width: '100%',
    height: 14,
    overflow: 'hidden',
  },
  recordDuration: {
    textAlign: 'center',
    color: colors.textStrong,
  },
  recordDurationOnPhoto: {
    textAlign: 'center',
    color: colors.textOnDark,
  },
});
