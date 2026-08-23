import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daypic</Text>
      <Text style={styles.body}>
        첫 화면 디자인이 아직 연결되지 않았어요. Figma 프레임 링크를 전달해주시면
        이 화면을 실제 디자인대로 구현할게요.
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
