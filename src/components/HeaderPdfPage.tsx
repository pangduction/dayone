import { StyleSheet, View } from 'react-native';
import Text from './Text';
import IconButton from './IconButton';
import IconButtonContained from './IconButtonContained';
import { IcArrowLeft } from './icons/AddIcons';
import { IcShare } from './icons/HomeIcons';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  title: string;
  onBack: () => void;
  onShare: () => void;
};

/**
 * Figma "Header/PDF Page" (node 3267:6298) — the PDF preview screen's header:
 * back and share (Button/Icon/Contained, the same glossy share button Home's
 * header uses) share one flexible row, with the filename centered over them
 * the same way every other title header in the app centers its title.
 */
export default function HeaderPdfPage({ title, onBack, onShare }: Props) {
  const { t } = useLanguage();
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <IconButton accessibilityLabel={t('pdfPreview.back')} onPress={onBack}>
          <IcArrowLeft size={24} color={colors.textPrimary} />
        </IconButton>
        <IconButtonContained accessibilityLabel={t('pdfPreview.sharePdf')} onPress={onShare}>
          <IcShare size={24} color={colors.textPrimary} />
        </IconButtonContained>
      </View>
      <View style={styles.centre} pointerEvents="none">
        <Text style={[typography.subtext, styles.title]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingLeft: 5,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centre: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
  },
});
