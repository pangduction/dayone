import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

/**
 * Figma "Divider" between Setting screen sections (e.g. node 3198:7132):
 * full-width, 8pt tall, `colors.surface` (G50) — a thicker, filled gap
 * rather than a hairline.
 */
export default function SettingDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surface,
  },
});
