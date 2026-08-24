import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderPdfPage from '../components/HeaderPdfPage';
import PdfPagePreview from '../components/PdfPagePreview';
import { getExportFile } from '../data/exports';
import type { ExportFile } from '../data/exports';
import { getPostsInRange } from '../data/posts';
import type { Post } from '../data/posts';
import { colors, spacing } from '../theme/tokens';

/**
 * Figma "Setting-Export to PDF-6" (node 3267:6006) — opened by tapping a
 * generated file in the Export to PDF screen's Files list. Figma's own mock
 * shows a scroll of shadowed page images over a grey (`colors.surface`)
 * background, so that's what this renders: each post in the file's range as
 * a `PdfPagePreview` — live-rendered, not a WebView on the real PDF file
 * (that pulls in the platform's own PDF-viewer chrome, which isn't part of
 * this design at all). The real, shareable multi-page PDF still exists on
 * disk (`ExportFile.uri`, built by `postPageTemplate.ts` +
 * `expo-print`) — Share hands out that actual file, this screen just doesn't
 * render *through* it.
 */
export default function PdfPreviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'PdfPreview'>>();

  const [file, setFile] = useState<ExportFile | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getExportFile(params.fileId).then(async (found) => {
      if (cancelled) return;
      setFile(found);
      if (!found) {
        setPosts([]);
        return;
      }
      const inRange = await getPostsInRange(found.startDate, found.endDate);
      if (!cancelled) setPosts(inRange);
    });
    return () => {
      cancelled = true;
    };
  }, [params.fileId]);

  const handleShare = async () => {
    if (!file) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    }
  };

  return (
    <View style={styles.container}>
      <HeaderPdfPage title={file?.filename ?? 'PDF'} onBack={() => navigation.goBack()} onShare={handleShare} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.pages}>
        {posts?.map((post) => (
          <PdfPagePreview key={post.date} post={post} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
    paddingTop: 47,
    paddingBottom: 34,
  },
  scroll: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.surface,
  },
  pages: {
    padding: spacing.md,
    gap: spacing.sm,
  },
});
