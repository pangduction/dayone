import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PhotoSection from './PhotoSection';
import RecordRow from './RecordRow';
import RichTextEditor from './RichTextEditor';
import { parseDateKey } from '../data/posts';
import type { Post } from '../data/posts';
import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = {
  post: Post;
  /**
   * Fires once the body has nothing left to settle asynchronously — a photo
   * post waits on `PhotoSection`'s own real-size read, a photo-less post
   * fires immediately. The Export-to-PDF capture flow uses this to know when
   * an off-screen page is actually safe to screenshot.
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
export default function PostDetailBody({ post, onReady }: Props) {
  const written = useMemo(() => parseDateKey(post.date), [post.date]);
  // Same formatting the live screen has always used for its own Date Written block.
  const dateLabel = written.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dayLabel = written.toLocaleDateString('en-US', { weekday: 'long' });

  // A photo-less post has nothing async to wait on — PhotoSection's own
  // onLoadSettled covers the other case.
  useEffect(() => {
    if (!post.photoUri) onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.photoUri]);

  return (
    <View style={styles.detail}>
      <View style={styles.dateWritten}>
        <Text style={[typography.subtext, styles.dateLabel]}>{dateLabel}</Text>
        {/* Figma switched this line from Caption to Overline (node 3192:12409), matching the same change in Header/Add. */}
        <Text style={[typography.overline, styles.dayLabel]}>{dayLabel}</Text>
      </View>

      {post.photoUri ? (
        <PhotoSection uri={post.photoUri} fitMode={post.fitMode} onLoadSettled={onReady} />
      ) : null}

      {post.recording ? <RecordRow recording={post.recording} variant="view" /> : null}

      {post.text.length > 0 ? (
        <View style={styles.textSection}>
          <View style={styles.divider} />
          {post.html ? (
            <RichTextEditor initialHtml={post.html} editable={false} onChange={() => {}} />
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
