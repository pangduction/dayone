import { StyleSheet, View } from 'react-native';
import IconButton from './IconButton';
import { IcCross } from './icons/AddIcons';
import { colors, spacing } from '../theme/tokens';

type Props = {
  onClose: () => void;
  accessibilityLabel?: string;
};

/**
 * Figma "Header/X" (node 3184:7855) — the Add header's shell keeping its
 * padding but carrying a single close button pushed to the right, with
 * nothing else in the row.
 *
 * Used by the recording screen and by post search, which is why it lives here
 * rather than being restated in each.
 */
export default function HeaderX({ onClose, accessibilityLabel = 'Close' }: Props) {
  return (
    <View style={styles.header}>
      <IconButton accessibilityLabel={accessibilityLabel} onPress={onClose}>
        <IcCross size={24} color={colors.textPrimary} />
      </IconButton>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: 5,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
  },
});
