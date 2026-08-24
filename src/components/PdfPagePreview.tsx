import { StyleSheet, View } from 'react-native';
import PostDetailBody from './PostDetailBody';
import type { Post } from '../data/posts';
import { colors, radius, shadows } from '../theme/tokens';

type Props = {
  post: Post;
};

/**
 * One "page" of the Export-to-PDF preview (Figma "Setting-Export to PDF-6",
 * node 3267:6006, whose "Files" background is `colors.surface` behind
 * shadowed white page images). Rather than a WebView pointed at the real
 * generated file — which on iOS pulls in WKWebView's own PDF viewer chrome
 * (a page-navigator gear button, "1 of N") that doesn't exist anywhere in
 * this design — each page is `PostDetailBody` live-rendered inside a white,
 * `shadows.xl` card the same 47pt-top-inset shape `postPageTemplate.ts`
 * gives the real printed page, so what's on screen reads exactly like a
 * captured image of that post filling one sheet.
 */
export default function PdfPagePreview({ post }: Props) {
  return (
    <View style={styles.page}>
      <View style={styles.topInset} />
      <PostDetailBody post={post} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.xs,
    overflow: 'hidden',
    ...shadows.xl,
  },
  topInset: {
    height: 47, // matches PAGE_TOP_INSET in postPageTemplate.ts — the real PDF's own top inset
  },
});
