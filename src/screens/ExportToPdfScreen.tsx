import { useCallback, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import Text from '../components/Text';
import { File } from 'expo-file-system';
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
import { buildExportFilename, PAGE_HEIGHT, PAGE_WIDTH } from '../pdf/postPageTemplate';
import { buildPdfFromJpegPages } from '../pdf/buildPdf';
import { useLanguage } from '../i18n/LanguageContext';
import { formatDateRangeLabel } from '../i18n/dateFormat';
import { colors, spacing, typography } from '../theme/tokens';

/**
 * Figma "Setting-Export to PDF-2" (node 3201:5947) — the real Export to PDF
 * screen, reached only after applying a range on the date-range modal that
 * opens directly over Setting-Main (per the confirmed entry flow). Its own
 * "Date Range" row reopens that same modal to change the range without
 * leaving the screen.
 *
 * "Generate PDF" is a real device feature. Each post's `PdfPagePreview` is
 * rendered off-screen and captured with `react-native-view-shot` as a real
 * temp JPEG file; those exact files both get embedded directly into the PDF
 * (`buildPdfFromJpegPages` — no HTML, no WebView, no `expo-print`) *and*
 * moved into permanent storage (`saveExportFile`'s `pageSourceUris`) for
 * `PdfPreviewScreen` to show. That's what makes the preview and the printed
 * file identical — not a design goal a second render has to keep up with,
 * but the exact same bytes read twice. `saveExportFile`
 * (`src/data/exports.ts`) also prunes anything past its 7-day "Valid
 * until" — kept short on purpose, to minimize how much generated-PDF storage
 * sits on the device — so the Files list below only ever shows what's still
 * real and still valid.
 */
export default function ExportToPdfScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ExportToPdf'>>();
  const { language, t } = useLanguage();

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
        Alert.alert(t('exportToPdf.nothingToExportTitle'), t('exportToPdf.nothingToExportBody'));
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
      // Two more frames: the first lets the render that `onReady` fired
      // inside actually commit (state updates from an async image callback
      // aren't guaranteed to have flushed to native layout yet when
      // `onReady` runs), the second lets that committed layout actually
      // paint before anything gets screenshotted.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      // `result: 'tmpfile'` — a real JPEG on disk for each page, pinned to
      // the exact print page size rather than left at the view's native
      // (device-pixel-ratio-scaled) resolution. Its bytes go straight into
      // the PDF (buildPdfFromJpegPages), and the file itself gets moved into
      // permanent storage below for the preview screen — no base64, no
      // WebView, no intermediate rendering step for either use.
      const pageTmpUris: string[] = [];
      const pageJpegBytes: Uint8Array[] = [];
      for (const post of posts) {
        const ref = captureRefs.current[post.date];
        if (!ref) continue;
        const tmpUri = await captureRef(ref, {
          format: 'jpg',
          quality: 1,
          result: 'tmpfile',
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
        });
        pageTmpUris.push(tmpUri);
        pageJpegBytes.push(await new File(tmpUri).bytes());
      }

      const pdfBytes = buildPdfFromJpegPages(
        pageJpegBytes.map((jpegBytes) => ({ jpegBytes, width: PAGE_WIDTH, height: PAGE_HEIGHT })),
      );
      const filename = buildExportFilename(startDate, endDate);
      await saveExportFile({ pdfBytes, pageSourceUris: pageTmpUris, filename, startDate, endDate });
      setFiles(await getExportFiles());
    } catch {
      Alert.alert(t('exportToPdf.generateFailedTitle'), t('exportToPdf.generateFailedBody'));
    } finally {
      setCaptureBatch(null);
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderTitlePage title={t('exportToPdf.title')} onBack={() => navigation.goBack()} />

      <ScrollView style={styles.menu} contentContainerStyle={styles.menuContent}>
        <View style={styles.rangeSection}>
          <SettingMenuRow
            label={t('exportToPdf.dateRange')}
            value={formatDateRangeLabel(parseDateKey(startDate), parseDateKey(endDate), language)}
            valueColor={colors.accent}
            onPress={() => setRangeModalVisible(true)}
          />
          <View style={styles.rangeBody}>
            <View style={styles.divider} />
            <View style={styles.disclaimer}>
              <Text style={[typography.body, styles.disclaimerLine]}>•  {t('exportToPdf.disclaimer1')}</Text>
              <Text style={[typography.body, styles.disclaimerLine]}>•  {t('exportToPdf.disclaimer2')}</Text>
            </View>
            <GhostButton label={t('exportToPdf.generatePdf')} onPress={handleGenerate} style={styles.generateButton} />
          </View>
        </View>

        {files && files.length > 0 ? (
          <>
            <SettingDivider />
            <SettingSection title={t('exportToPdf.filesSection')}>
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
