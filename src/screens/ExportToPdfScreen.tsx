import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { printToFileAsync } from 'expo-print';
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
import { getPostsInRange, parseDateKey } from '../data/posts';
import { getExportFiles, saveExportFile } from '../data/exports';
import type { ExportFile } from '../data/exports';
import { buildExportFilename, buildExportHtml, PAGE_HEIGHT, PAGE_WIDTH } from '../pdf/postPageTemplate';
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
 * "Generate PDF" is a real device feature: it reads the posts in range,
 * builds the same HTML `PostDetailScreen` would show for each
 * (`buildExportHtml`), and hands that to `expo-print`'s `printToFileAsync`.
 * The result is moved into a stable, named file via `saveExportFile`
 * (`src/data/exports.ts`), which also prunes anything past its 30-day
 * "Valid until" — so the Files list below only ever shows what's still real
 * and still valid.
 */
export default function ExportToPdfScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ExportToPdf'>>();

  const [startDate, setStartDate] = useState(params.startDate);
  const [endDate, setEndDate] = useState(params.endDate);
  const [rangeModalVisible, setRangeModalVisible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [files, setFiles] = useState<ExportFile[] | null>(null);

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
      const html = await buildExportHtml(posts);
      const { uri } = await printToFileAsync({ html, width: PAGE_WIDTH, height: PAGE_HEIGHT });
      const filename = buildExportFilename(startDate, endDate);
      await saveExportFile({ sourceUri: uri, filename, startDate, endDate });
      setFiles(await getExportFiles());
    } catch {
      Alert.alert('Couldn’t generate PDF', 'Something went wrong while creating your file. Please try again.');
    } finally {
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
});
