import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderPdfPage from '../components/HeaderPdfPage';
import { getExportFile } from '../data/exports';
import type { ExportFile } from '../data/exports';
import { PAGE_HEIGHT, PAGE_WIDTH } from '../pdf/postPageTemplate';
import { colors, radius, shadows, spacing } from '../theme/tokens';

/**
 * Figma "Setting-Export to PDF-6" (node 3267:6006) — opened by tapping a
 * generated file in the Export to PDF screen's Files list. Figma's own mock
 * shows a scroll of shadowed page images over a grey (`colors.surface`)
 * background, so that's exactly what this renders: `file.pageUris`, the same
 * PNGs `ExportToPdfScreen`'s "Generate PDF" captured and both (a) printed
 * into the real multi-page PDF and (b) saved here as their own files. This
 * screen just displays them — it doesn't re-render the posts live, so there
 * is no second render path that could ever drift from what the actual file
 * contains. The real, shareable PDF still exists on disk (`ExportFile.uri`)
 * for Share to hand out; this is only ever how it's *previewed*.
 */
export default function PdfPreviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'PdfPreview'>>();

  const [file, setFile] = useState<ExportFile | null>(null);

  useEffect(() => {
    let cancelled = false;
    getExportFile(params.fileId).then((found) => {
      if (!cancelled) setFile(found);
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
        {file?.pageUris.map((uri) => (
          <View key={uri} style={styles.page}>
            <Image source={{ uri }} style={styles.pageImage} resizeMode="contain" />
          </View>
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
  page: {
    width: '100%',
    aspectRatio: PAGE_WIDTH / PAGE_HEIGHT,
    backgroundColor: colors.background,
    borderRadius: radius.xs,
    overflow: 'hidden',
    ...shadows.xl,
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
});
