import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { BlurView } from 'expo-blur';
import IconButton from './IconButton';
import { IcCross } from './icons/AddIcons';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  /** Fills the sheet's "Content" block. */
  children: ReactNode;
  /** Fills the sheet's "Modal actions" block; omit for a sheet with no buttons. */
  actions?: ReactNode;
};

/**
 * The bottom-sheet shell every Figma modal shares — Modal/Gallery
 * (3198:4446), Modal/Leave (3233:4557), and the Delete / Language / Timer /
 * Date sheets still to be built all repeat the same skeleton, so it lives
 * here once rather than in each of them:
 *
 *   backdrop — full screen, `colors.backdrop` (G900 @ 30%) over a blur
 *     (Figma effect "Background blur / md"), sheet bottom-aligned,
 *     paddingTop 16 / paddingBottom 40 / paddingHorizontal 16
 *   sheet — white, radius.xl (24), `shadows.xl`
 *     Modal header — title in `typography.subtext`, paddingTop 20 / px 16,
 *       then a 20pt spacer row; close button absolute at right 8 / top 8.4
 *     Content — px 16, paddingTop 20
 *     Modal actions — paddingTop 24, then px 16 / paddingBottom 24, gap 8
 *
 * Figma names the close button Button/Icon/Plain but gives it padding 10 /
 * radius 8 rather than the header's 8 / 16; with a transparent background
 * and a centred 24pt glyph in a 40pt box both render identically, so this
 * reuses `IconButton`.
 */
export default function ModalSheet({ visible, title, onClose, children, actions }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <BlurView intensity={BACKDROP_BLUR_INTENSITY} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={`Close ${title}`}>
          {/* Taps inside the sheet must not fall through to the backdrop. */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <Text style={[typography.subtext, styles.title]}>{title}</Text>
              </View>
              <View style={styles.headerSpacer} />
              <IconButton accessibilityLabel="Close" onPress={onClose} style={styles.closeButton}>
                <IcCross size={24} color={colors.textPrimary} />
              </IconButton>
            </View>

            <View style={styles.content}>{children}</View>

            {actions ? <View style={styles.actions}>{actions}</View> : null}
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}

/**
 * Figma's backdrop carries "Background blur / md" (radius 16, which the CSS
 * export renders as `backdrop-blur-[8px]`). expo-blur takes a 0-100
 * intensity rather than a pixel radius, so this is the nearest equivalent
 * and the one value here that isn't a direct read from the node.
 */
const BACKDROP_BLUR_INTENSITY = 20;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing[10],
    paddingHorizontal: spacing.md,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  header: {
    width: '100%',
    backgroundColor: colors.background,
  },
  headerTitle: {
    width: '100%',
    paddingTop: spacing[7],
    paddingHorizontal: spacing.md,
  },
  title: {
    color: colors.textPrimary,
  },
  headerSpacer: {
    height: 20, // Figma "Padding bottom" (nodes 3198:4428 / 3233:4543)
  },
  closeButton: {
    position: 'absolute',
    right: spacing.sm,
    top: 8.4, // Figma: exact offset on nodes 3198:4429 / 3233:4544
  },
  content: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingTop: spacing[7],
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
    paddingTop: spacing[8],
    paddingHorizontal: spacing.md,
    paddingBottom: spacing[8],
  },
});
