import { StyleSheet, View } from 'react-native';
import Text from './Text';
import ToggleSwitch from './ToggleSwitch';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

/**
 * Figma "Menu" (e.g. node 3198:7563) — one notification-preference row: a
 * two-line label (title over an explanatory subtitle, gap 3) and a
 * `ToggleSwitch`. Height/padding aren't part of this component — Figma
 * reuses the same row shape both standalone (px16/py12, minHeight 44, e.g.
 * "Notifications"/"Monthly Report") and nested inside the expanded Daily
 * Reminder block (no padding of its own, since that block already carries
 * it — node 3199:8123), so this only ever renders its own content and the
 * caller supplies the wrapper.
 */
export default function NotificationToggleRow({ title, subtitle, value, onValueChange, disabled }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={[typography.subtext, styles.title]}>{title}</Text>
        <Text style={[typography.overline, styles.subtitle]}>{subtitle}</Text>
      </View>
      <ToggleSwitch value={value} onValueChange={onValueChange} accessibilityLabel={title} disabled={disabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    width: '100%',
  },
  text: {
    flex: 1,
    gap: 3, // Figma-exact (node 3198:7698), not on the spacing scale
  },
  title: {
    color: colors.textStrong,
  },
  subtitle: {
    color: colors.textTertiary,
  },
});
