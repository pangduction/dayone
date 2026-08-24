import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderPdfPage from '../components/HeaderPdfPage';
import { getExportFile } from '../data/exports';
import type { ExportFile } from '../data/exports';
import { colors } from '../theme/tokens';

/**
 * Figma "Setting-Export to PDF-6" (node 3267:6006) — opened by tapping a
 * generated file in the Export to PDF screen's Files list. Figma's own mock
 * shows a scrollable stack of rendered page images; this shows the real PDF
 * instead, via `react-native-webview` pointed at its `file://` URI —
 * WKWebView renders a local PDF natively on iOS. (Android's system WebView
 * doesn't render local PDFs the same way; this is the one place in the app
 * where the two platforms genuinely differ, short of adding a dedicated
 * PDF-rendering dependency.)
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
      {file ? <WebView source={{ uri: file.uri }} style={styles.web} originWhitelist={['*']} /> : null}
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
  web: {
    flex: 1,
    width: '100%',
  },
});
