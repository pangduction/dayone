import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PhotoSection from './PhotoSection';
import RecordRow from './RecordRow';
import StaticRecordRow from './StaticRecordRow';
import RichTextEditor from './RichTextEditor';
import { parseDateKey } from '../data/posts';
import type { Post } from '../data/posts';
import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = {
  post: Post;
  /**
   * Whether a recording can actually be played from here. `PostDetailScreen`
   * (the real, on-screen post) wants that; the Export-to-PDF preview and the
   * off-screen capture that becomes the real PDF page don't — both are only
   * ever a picture of the post, so a working play button there would be
   * showing a capability that isn't real. Defaults to `true`.
   */
  interactive?: boolean;
  /**
   * Fires once the body has nothing left to settle asynchronously: a photo
   * post waits on `PhotoSection`'s own real-size read, and a post with
   * formatted text waits on `RichTextEditor`'s WebView finishing its load —
   * that WebView renders on its own native surface, so mounting it is not
   * the same as it having painted anything yet, and a capture taken before
   * it has would show a blank text section. The Export-to-PDF capture flow
   * uses this to know when an off-screen page is actually safe to
   * screenshot.
   */
  onReady?: () => void;
};

/**
 * The post detail "column" (Figma section `3192:11364`): Date Written, then
 * whichever of Image Section / Record/View / Text Section the post actually
 * has. Extracted out of `PostDetailScreen.tsx` so the exact same layout can
 * be reused for the Export-to-PDF preview (`PdfPagePreview.tsx` — Figma's
 * "PDF Image", node `3267:6263`, is the same eight post shapes as Post
 * Detail, just drawn as pages) instead of a second, hand-copied version that
 * could drift from the live screen.
 */
export default function PostDetailBody({ post, interactive = true, onReady }: Props) {
  const written = useMemo(() => parseDateKey(post.date), [post.date]);
  // Same formatting the live screen has always used for its own Date Written block.
  const dateLabel = written.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dayLabel = written.toLocaleDateString('en-US', { weekday: 'long' });

  // Two independent things this body can be waiting on before it's safe to
  // capture — a plain-text-only post (or one with neither) has nothing async
  // at all and starts already "ready".
  const hasRichText = !!post.html && post.text.length > 0;
  const [photoReady, setPhotoReady] = useState(!post.photoUri);
  const [textReady, setTextReady] = useState(!hasRichText);

  useEffect(() => {
    if (photoReady && textReady) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoReady, textReady]);

  return (
    <View style={styles.detail}>
      <View style={styles.dateWritten}>
        <Text style={[typography.subtext, styles.dateLabel]}>{dateLabel}</Text>
        {/* Figma switched this line from Caption to Overline (node 3192:12409), matching the same change in Header/Add. */}
        <Text style={[typography.overline, styles.dayLabel]}>{dayLabel}</Text>
      </View>

      {post.photoUri ? (
        <PhotoSection uri={post.photoUri} fitMode={post.fitMode} onLoadSettled={() => setPhotoReady(true)} />
      ) : null}

      {post.recording ? (
        interactive ? (
          <RecordRow recording={post.recording} variant="view" />
        ) : (
          <StaticRecordRow recording={post.recording} />
        )
      ) : null}

      {post.text.length > 0 ? (
        <View style={styles.textSection}>
          <View style={styles.divider} />
          {post.html ? (
            <RichTextEditor
              initialHtml={post.html}
              editable={false}
              onChange={() => {}}
              onLoadEnd={() => setTextReady(true)}
            />
          ) : (
            <Text style={[typography.body, styles.content]}>{post.text}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  detail: {
    flex: 1,
    width: '100%',
    gap: spacing.md,
    padding: spacing.md,
  },
  dateWritten: {
    width: '100%',
    height: 40,
    alignItems: 'center',
  },
  dateLabel: {
    color: colors.textPrimary,
  },
  dayLabel: {
    color: colors.textTertiary,
  },
  textSection: {
    flex: 1,
    width: '100%',
    minHeight: 240,
    gap: spacing.sm,
    paddingHorizontal: spacing[5],
    borderRadius: radius.sm,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.borderSubtle, // Figma: G100, verified via get_variable_defs on node 3192:12438
  },
  content: {
    width: '100%',
    color: colors.textPrimary,
  },
});
