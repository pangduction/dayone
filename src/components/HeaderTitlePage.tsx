import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import IconButton from './IconButton';
import { IcArrowLeft } from './icons/AddIcons';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  title: string;
  onBack: () => void;
  /** Figma's own `buttonShow` variant (a trailing "Done" HeaderActionButton) — used by `HelpSupportScreen`'s own "Done". */
  action?: ReactNode;
};

/**
 * Figma "Header/Title Page" (node 3198:7683) — a plain back button and a
 * centered title, with room for one trailing action. Used by the Export to
 * PDF list screen (title "Export to PDF") and `TermsOfServiceScreen`, since
 * both are plain "back + title" pages.
 *
 * Same centering technique as `HomeListScreen`'s own header: the title lives
 * in an absolutely positioned layer so the back button keeps the row's real
 * left edge regardless of title length.
 */
export default function HeaderTitlePage({ title, onBack, action }: Props) {
  return (
    <View style={styles.header}>
      <IconButton accessibilityLabel="Back" onPress={onBack}>
        <IcArrowLeft size={24} color={colors.textPrimary} />
      </IconButton>
      {action}
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
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 5,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
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
