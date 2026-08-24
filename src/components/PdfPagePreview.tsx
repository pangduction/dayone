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
 * One "page" of the Export-to-PDF preview (Figma "Setting-Export to PDF-6",
 * node 3267:6006, whose "Files" background is `colors.surface` behind
 * shadowed white page images, every one the same size). Rather than a
 * WebView pointed at the real generated file — which on iOS pulls in
 * WKWebView's own PDF viewer chrome (a page-navigator gear button, "1 of N")
 * that doesn't exist anywhere in this design — each page is `PostDetailBody`
 * live-rendered inside a white, `shadows.xl` card.
 *
 * The card is locked to the real PDF page's own aspect ratio
 * (`PAGE_WIDTH`/`PAGE_HEIGHT` from `postPageTemplate.ts`), not sized to its
 * content — every page needs to read as the same fixed sheet while flipping
 * through them, the way real printed pages are. That fixed height also fixes
 * a second bug it would otherwise cause: `PostDetailBody`'s `RichTextEditor`
 * is a `flex:1` WebView, which only resolves to a sane height once its
 * ancestor chain is actually height-bound — inside a `ScrollView`'s
 * naturally-sized content it was expanding to fill leftover space instead,
 * which is where the huge blank gap under short text came from. A post long
 * enough to overflow this fixed page just clips, the same trade-off a real
 * printed page's fixed height makes.
 */
export default function PdfPagePreview({ post, onReady }: Props) {
  return (
    <View style={styles.page}>
      <View style={styles.topInset} />
      <PostDetailBody post={post} onReady={onReady} />
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
    height: 47, // matches PAGE_TOP_INSET in postPageTemplate.ts — the real PDF's own top inset
  },
});
