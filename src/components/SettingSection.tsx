import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  title: string;
  children: ReactNode;
};

/**
 * Figma "Menu Section" (e.g. node 3198:7118) — an eyebrow title (Section
 * Title, node 3198:7119) over a stack of `SettingMenuRow`s. Recurs on every
 * Setting screen (Setting-Main groups APP/SUPPORT/ACCOUNT this way; Terms of
 * Service and Delete Account's confirmation screen reuse the exact same
 * shape), so it lives here rather than being restated per screen.
 */
export default function SettingSection({ title, children }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <Text style={[typography.caption, styles.title]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
  titleRow: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: 3, // Figma-exact (node 3198:7119), not on the spacing scale
  },
  title: {
    color: colors.textFaint, // Figma G200
  },
});
