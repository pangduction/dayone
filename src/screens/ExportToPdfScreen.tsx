import { useCallback, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { printToFileAsync } from 'expo-print';
import { captureRef } from 'react-native-view-shot';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderTitlePage from '../components/HeaderTitlePage';
import SettingMenuRow from '../components/SettingMenuRow';
import SettingSection from '../components/SettingSection';
import SettingDivider from '../components/SettingDivider';
import GhostButton from '../components/GhostButton';
import ExportFileRow from '../components/ExportFileRow';
import DateRangeModal from '../components/DateRangeModal';
import GeneratingPdfModal from '../components/GeneratingPdfModal';
import PdfPagePreview from '../components/PdfPagePreview';
import { getPostsInRange, parseDateKey } from '../data/posts';
import type { Post } from '../data/posts';
import { getExportFiles, saveExportFile } from '../data/exports';
import type { ExportFile } from '../data/exports';
import { buildExportFilename, buildImagePagesHtml, PAGE_HEIGHT, PAGE_WIDTH } from '../pdf/postPageTemplate';
import { colors, spacing, typography } from '../theme/tokens';

/** "Aug 6 - 13, 2026" within one month; "Aug 6 - Sep 3, 2026" across months (Figma only shows the former, node 3201:6515). */
function formatRangeLabel(startDate: string, endDate: string): string {
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);
  const sameMonth = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (sameMonth) return `${startLabel} - ${end.getDate()}, ${end.getFullYear()}`;
  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startLabel} - ${endLabel}`;
}

/**
 * Figma "Setting-Export to PDF-2" (node 3201:5947) — the real Export to PDF
 * screen, reached only after applying a range on the date-range modal that
 * opens directly over Setting-Main (per the confirmed entry flow). Its own
 * "Date Range" row reopens that same modal to change the range without
 * leaving the screen.
 *
 * "Generate PDF" is a real device feature, and its output is guaranteed to
 * match the in-app PDF preview (`PdfPreviewScreen.tsx`) exactly, because it
 * *is* that preview: each post's `PdfPagePreview` is rendered off-screen and
 * captured with `react-native-view-shot`, and those screenshots are what
 * `expo-print`'s `printToFileAsync` turns into the real multi-page PDF
 * (`buildImagePagesHtml`) — not a second, hand-authored HTML reconstruction
 * that could drift from what the preview actually shows. The result is moved
 * into a stable, named file via `saveExportFile` (`src/data/exports.ts`),
 * which also prunes anything past its 30-day "Valid until" — so the Files
 * list below only ever shows what's still real and still valid.
 */
export default function ExportToPdfScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ExportToPdf'>>();

  const [startDate, setStartDate] = useState(params.startDate);
  const [endDate, setEndDate] = useState(params.endDate);
  const [rangeModalVisible, setRangeModalVisible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [files, setFiles] = useState<ExportFile[] | null>(null);
  // The batch of posts currently rendered off-screen for capture, and where
  // each one's real `View` lands once mounted — a callback ref per post
  // rather than a single ref, since the batch size varies with the range.
  const [captureBatch, setCaptureBatch] = useState<Post[] | null>(null);
  const captureRefs = useRef<Record<string, View | null>>({});
  // Sidesteps a closure problem: `onReady` callbacks handed to JSX below have
  // to reach whichever "mark this date ready" function the *current*
  // `handleGenerate` call created, and that function only exists once
  // generation is actually running.
  const onPageReadyRef = useRef<(date: string) => void>(() => {});

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getExportFiles().then((found) => {
        if (!cancelled) setFiles(found);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const posts = await getPostsInRange(startDate, endDate);
      if (posts.length === 0) {
        Alert.alert('Nothing to export', 'There are no posts in this date range.');
        return;
      }

      captureRefs.current = {};
      const ready = new Set<string>();
      let resolveAllReady: () => void = () => {};
      const allReady = new Promise<void>((resolve) => {
        resolveAllReady = resolve;
      });
      onPageReadyRef.current = (date) => {
        ready.add(date);
        if (ready.size === posts.length) resolveAllReady();
      };

      setCaptureBatch(posts);
      await allReady;
      // One more frame so every page's fully-settled layout has actually
      // been committed natively before it gets screenshotted.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const pageDataUris: string[] = [];
      for (const post of posts) {
        const ref = captureRefs.current[post.date];
        if (!ref) continue;
        const dataUri = await captureRef(ref, { format: 'png', quality: 1, result: 'data-uri' });
        pageDataUris.push(dataUri);
      }

      const html = buildImagePagesHtml(pageDataUris);
      const { uri } = await printToFileAsync({ html, width: PAGE_WIDTH, height: PAGE_HEIGHT });
      const filename = buildExportFilename(startDate, endDate);
      await saveExportFile({ sourceUri: uri, filename, startDate, endDate });
      setFiles(await getExportFiles());
    } catch {
      Alert.alert('Couldn’t generate PDF', 'Something went wrong while creating your file. Please try again.');
    } finally {
      setCaptureBatch(null);
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderTitlePage title="Export to PDF" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.menu} contentContainerStyle={styles.menuContent}>
        <View style={styles.rangeSection}>
          <SettingMenuRow
            label="Date Range"
            value={formatRangeLabel(startDate, endDate)}
            valueColor={colors.accent}
            onPress={() => setRangeModalVisible(true)}
          />
          <View style={styles.rangeBody}>
            <View style={styles.divider} />
            <View style={styles.disclaimer}>
              <Text style={[typography.body, styles.disclaimerLine]}>
                •  Exported files are saved locally. Back them up to prevent data loss.
              </Text>
              <Text style={[typography.body, styles.disclaimerLine]}>
                •  Large date ranges may cause crashes. Select a shorter period if needed.
              </Text>
            </View>
            <GhostButton label="Generate PDF" onPress={handleGenerate} style={styles.generateButton} />
          </View>
        </View>

        {files && files.length > 0 ? (
          <>
            <SettingDivider />
            <SettingSection title="Files">
              {files.map((file) => (
                <ExportFileRow
                  key={file.id}
                  file={file}
                  onPress={() => navigation.navigate('PdfPreview', { fileId: file.id })}
                />
              ))}
            </SettingSection>
          </>
        ) : null}
      </ScrollView>

      <DateRangeModal
        visible={rangeModalVisible}
        startDate={startDate}
        endDate={endDate}
        onClose={() => setRangeModalVisible(false)}
        onApply={(range) => {
          setStartDate(range.startDate);
          setEndDate(range.endDate);
          setRangeModalVisible(false);
        }}
      />

      <GeneratingPdfModal visible={generating} />

      {/* Off-screen on purpose (see HomeScreen's own share capture for the
          same pattern): rendered only while generating, so each page can be
          screenshotted at its real size without ever being visible. */}
      {captureBatch ? (
        <View style={styles.captureHost} pointerEvents="none">
          {captureBatch.map((post) => (
            <View
              key={post.date}
              collapsable={false}
              style={styles.capturePage}
              ref={(node) => {
                captureRefs.current[post.date] = node;
              }}
            >
              <PdfPagePreview post={post} onReady={() => onPageReadyRef.current(post.date)} />
            </View>
          ))}
        </View>
      ) : null}
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
  menu: {
    flex: 1,
    width: '100%',
  },
  menuContent: {
    gap: spacing.md,
  },
  rangeSection: {
    width: '100%',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rangeBody: {
    width: '100%',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  disclaimer: {
    width: '100%',
    gap: spacing.xs,
  },
  disclaimerLine: {
    color: colors.textPlaceholder,
  },
  generateButton: {
    width: '100%',
  },
  captureHost: {
    position: 'absolute',
    left: -1000,
    top: 0,
  },
  capturePage: {
    width: PAGE_WIDTH,
  },
});
