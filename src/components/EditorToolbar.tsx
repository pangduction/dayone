import { Pressable, StyleSheet, View } from 'react-native';
import {
  IcBold,
  IcBulletList,
  IcHorizontalLine,
  IcItalic,
  IcNumberedList,
  IcTextColor,
  IcUnderline,
} from './icons/EditorIcons';
import type { ActiveFormats, EditorCommand } from './RichTextEditor';
import { colors, palette, radius, spacing } from '../theme/tokens';

/**
 * The palette's nine swatches, left to right, exactly as `assets/editor.svg`
 * draws them. The first is the default text colour; the rest are the iOS
 * system swatch set already in `palette`.
 */
const SWATCHES = [
  palette.swatchDefault,
  palette.systemRed,
  palette.systemOrange,
  palette.systemYellow,
  palette.systemGreen,
  palette.systemBlue,
  palette.systemIndigo,
  palette.systemPurple,
  palette.systemPink,
] as const;

type Props = {
  onCommand: (command: EditorCommand) => void;
  activeFormats: ActiveFormats;
  /** Whether the colour palette row is open (Figma's `palette="on"` variant). */
  paletteOpen: boolean;
  onTogglePalette: () => void;
  /** The swatch currently applied, so it can show its check. */
  selectedColor: string;
};

/**
 * Figma "editor" (component node 13:15150, exported whole as
 * `assets/editor.svg`) — the formatting bar that sits directly above the OS
 * keyboard while the story field has focus.
 *
 * Standard row: `colors.editorBar` background, padding 16, seven 24pt icons
 * spread with space-between — text colour, bold, italic, underline, bullet
 * list, numbered list, horizontal rule. That makes the bar 56 tall, matching
 * the `editor` instances on Add-Image-Texting-1/2 (nodes 3184:5987 /
 * 3184:7431).
 *
 * Tapping text colour opens the palette row and the bar becomes 112 tall
 * (nodes 3184:6494 / 3184:6693): a `colors.editorPaletteBar` row of nine
 * 24pt swatches at `radius.sm`, with the active one carrying a white check,
 * and the text-colour button gaining a 48x48 top-rounded background in the
 * same colour so it reads as attached to the row below.
 *
 * The swatches sit at a fixed 16pt gap after a 16pt left inset, which is how
 * Figma draws them — on a 390pt screen that leaves the remainder on the
 * right rather than distributing it.
 */
export default function EditorToolbar({
  onCommand,
  activeFormats,
  paletteOpen,
  onTogglePalette,
  selectedColor,
}: Props) {
  const iconColor = (active: boolean) => (active ? colors.accent : colors.textPrimary);

  return (
    <View>
      <View style={styles.bar}>
        {paletteOpen ? <View style={styles.textColorBackdrop} /> : null}
        <View style={styles.row}>
          <Pressable onPress={onTogglePalette} hitSlop={12} accessibilityRole="button" accessibilityLabel="Text colour">
            <IcTextColor size={24} color={paletteOpen ? colors.textPrimary : iconColor(false)} />
          </Pressable>
          <Pressable
            onPress={() => onCommand({ type: 'bold' })}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Bold"
            accessibilityState={{ selected: activeFormats.bold }}
          >
            <IcBold size={24} color={iconColor(activeFormats.bold)} />
          </Pressable>
          <Pressable
            onPress={() => onCommand({ type: 'italic' })}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Italic"
            accessibilityState={{ selected: activeFormats.italic }}
          >
            <IcItalic size={24} color={iconColor(activeFormats.italic)} />
          </Pressable>
          <Pressable
            onPress={() => onCommand({ type: 'underline' })}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Underline"
            accessibilityState={{ selected: activeFormats.underline }}
          >
            <IcUnderline size={24} color={iconColor(activeFormats.underline)} />
          </Pressable>
          <Pressable
            onPress={() => onCommand({ type: 'insertUnorderedList' })}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Bulleted list"
            accessibilityState={{ selected: activeFormats.unorderedList }}
          >
            <IcBulletList size={24} color={iconColor(activeFormats.unorderedList)} />
          </Pressable>
          <Pressable
            onPress={() => onCommand({ type: 'insertOrderedList' })}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Numbered list"
            accessibilityState={{ selected: activeFormats.orderedList }}
          >
            <IcNumberedList size={24} color={iconColor(activeFormats.orderedList)} />
          </Pressable>
          <Pressable
            onPress={() => onCommand({ type: 'insertHorizontalRule' })}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Divider"
          >
            <IcHorizontalLine size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {paletteOpen ? (
        <View style={styles.paletteRow}>
          {SWATCHES.map((swatch) => (
            <Pressable
              key={swatch}
              onPress={() => onCommand({ type: 'foreColor', color: swatch })}
              style={[styles.swatch, { backgroundColor: swatch }]}
              accessibilityRole="button"
              accessibilityLabel={`Text colour ${swatch}`}
              accessibilityState={{ selected: swatch === selectedColor }}
            >
              {swatch === selectedColor ? <Check /> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** The white tick Figma draws on the selected swatch. */
function Check() {
  return (
    <View style={styles.check}>
      <View style={styles.checkShort} />
      <View style={styles.checkLong} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    padding: spacing.md,
    backgroundColor: colors.editorBar,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textColorBackdrop: {
    // Figma: 48x48 behind the text-colour icon, top corners rounded, running
    // to the bar's bottom edge so it merges with the palette row.
    position: 'absolute',
    left: 4,
    top: 8,
    width: 48,
    height: 48,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    backgroundColor: colors.editorPaletteBar,
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.editorPaletteBar,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 14,
    height: 14,
  },
  checkShort: {
    position: 'absolute',
    left: 0,
    top: 6,
    width: 6,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: colors.textOnDark,
    transform: [{ rotate: '45deg' }],
  },
  checkLong: {
    position: 'absolute',
    left: 3,
    top: 5,
    width: 11,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: colors.textOnDark,
    transform: [{ rotate: '-45deg' }],
  },
});
