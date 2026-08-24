import { StyleSheet, View } from 'react-native';
import PostDetailBody from './PostDetailBody';
import type { Post } from '../data/posts';
import { PAGE_HEIGHT, PAGE_WIDTH } from '../pdf/postPageTemplate';
import { colors, radius, shadows } from '../theme/tokens';

type Props = {
  post: Post;
  /** Forwarded to `PostDetailBody` — see its own doc comment. */
  onReady?: () => void;
};

/**
 * One post rendered as a print-page-shaped card, used only off-screen by
 * `ExportToPdfScreen.tsx`'s "Generate PDF" — `react-native-view-shot`
 * captures this per post as a real JPEG file, and those exact bytes become
 * both a page of the real PDF (`buildPdf.ts`, embedded directly — no HTML,
 * no WebView) and the saved file `PdfPreviewScreen` shows directly.
 * (`PdfPreviewScreen` itself no longer renders this component: it shows
 * those saved files, which is what keeps the preview and the printed file
 * from ever drifting apart.)
 *
 * The card is locked to the real PDF page's own aspect ratio
 * (`PAGE_WIDTH`/`PAGE_HEIGHT` from `postPageTemplate.ts`), not sized to its
 * content — Figma's own "PDF Image" pages (node `3267:6263`) are every one
 * the same fixed sheet, the way real printed pages are. That fixed height
 * also fixes a second bug it would otherwise cause: `PostDetailBody`'s
 * `RichTextEditor` is a `flex:1` WebView, which only resolves to a sane
 * height once its ancestor chain is actually height-bound — inside a
 * naturally-sized container it was expanding to fill leftover space instead.
 * A post long enough to overflow this fixed page just clips, the same
 * trade-off a real printed page's fixed height makes.
 *
 * `PostDetailBody` renders `interactive={false}` here — this is only ever a
 * *picture* of the post, never a live one, so a recording shows as a static
 * row rather than one with a working play button.
 */
export default function PdfPagePreview({ post, onReady }: Props) {
  return (
    <View style={styles.page}>
      <View style={styles.topInset} />
      <PostDetailBody post={post} interactive={false} onReady={onReady} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    aspectRatio: PAGE_WIDTH / PAGE_HEIGHT,
    backgroundColor: colors.background,
    borderRadius: radius.xs,
    overflow: 'hidden',
    ...shadows.xl,
  },
  topInset: {
    height: 47, // Figma-exact: Post Detail sits at y=47 even with no header drawn (see "PDF Image", node 3267:6263)
  },
});
