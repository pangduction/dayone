import { StyleSheet, Text, View } from 'react-native';
import { IcCheck } from './icons/CommonIcons';
import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = {
  message: string;
};

/**
 * Figma "Alert" (node 3233:5183, in context on Post-Common-Delete-Done
 * 3233:5040): a success banner pinned over the top of the screen —
 * `colors.success` background, radius.sm, paddingHorizontal 20 /
 * paddingVertical 8, a 24pt white ic/check, then the message.
 *
 * Named AlertBanner rather than Alert so it can't be confused with React
 * Native's own `Alert`, which the Add screen uses for permission prompts.
 *
 * Positioning belongs to the screen showing it — Figma places it at top 47
 * with 16 of horizontal padding, overlapping the header.
 */
export default function AlertBanner({ message }: Props) {
  return (
    <View style={styles.alert} accessibilityLiveRegion="polite">
      <IcCheck size={24} color={colors.textOnDark} />
      <Text style={[typography.alert, styles.message]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    paddingHorizontal: spacing[7],
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.success,
  },
  message: {
    flex: 1,
    color: colors.textOnDark,
  },
});
