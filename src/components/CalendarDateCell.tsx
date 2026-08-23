import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../theme/tokens';

type Props = {
  /** Day of the month, or null for a leading/trailing blank in the grid. */
  day: number | null;
  isToday: boolean;
  /** The day's post, if one exists. */
  post?: { photoUri: string | null } | null;
  /** Marks a day with no post as the one the user just tapped. */
  isSelected?: boolean;
  /** Opens the day's post, or selects it when there isn't one. */
  onPress?: () => void;
};

/**
 * Figma "Date" (component node 9:5857; every variant is rendered side by side
 * in assets/Date.svg, and the photo-on-today variant is live on
 * Home-Calendar-Today-Photo, node I3192:8067;3184:3185).
 *
 * A square, fully-rounded cell whose look is the cross of two things: whether
 * the day has a post at all — and if so whether that post has a photo — and
 * whether the day is today.
 *
 *                | no post              | photo post                    | text-only post
 *   -------------|----------------------|-------------------------------|----------------
 *   another day  | transparent, G600    | photo + G900 @ 30%, white     | solid G900, white
 *   today        | Accent @ 8%, Accent  | photo + Accent @ 30% + 1px    | solid Accent, white
 *                |                      | Accent border, white          |
 *
 * The photo variants are why HomeScreen passes the whole post down rather
 * than just a "has a post" boolean.
 *
 * `isSelected` is a seventh state that is **not in Figma** — the Date
 * component (node 9:5941) has no selected variant. It was specified by the
 * product owner for tapping a day that has no post yet: a 1px `colors.accent`
 * ring over a transparent fill, with an Accent label. A ring rather than a
 * filled Accent circle deliberately, because a filled one would be
 * indistinguishable from the existing today + text-only-post state. Treat
 * this as the app's own addition, not something to look up in the file.
 */
export default function CalendarDateCell({ day, isToday, post, isSelected, onPress }: Props) {
  if (day === null) return <View style={styles.cell} />;

  const hasPost = post != null;
  const photoUri = post?.photoUri ?? null;
  const hasPhoto = hasPost && photoUri !== null;
  const isTextOnly = hasPost && photoUri === null;

  // A day with a post opens it; one without is selected instead.
  const showSelectedRing = isSelected && !hasPost;
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={
        onPress ? (hasPost ? `Open the post for day ${day}` : `Select day ${day}`) : undefined
      }
      accessibilityState={onPress && !hasPost ? { selected: isSelected } : undefined}
      style={[
        styles.cell,
        isToday && !hasPost && styles.cellTodayEmpty,
        isTextOnly && (isToday ? styles.cellTextOnlyToday : styles.cellTextOnly),
        (hasPhoto && isToday) || showSelectedRing ? styles.cellAccentRing : null,
      ]}
    >
      {hasPhoto ? (
        <>
          <Image source={{ uri: photoUri! }} style={styles.photo} resizeMode="cover" />
          <View style={[styles.photoTint, isToday ? styles.photoTintToday : styles.photoTintPast]} />
        </>
      ) : null}
      <Text
        style={[
          typography.calendarDate,
          styles.label,
          !hasPost && (isToday || isSelected) && styles.labelAccent,
          hasPost && styles.labelOnFill,
        ]}
      >
        {day}
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cellTodayEmpty: {
    backgroundColor: colors.accentSubtle,
  },
  cellTextOnly: {
    backgroundColor: colors.textPrimary, // Figma G900
  },
  cellTextOnlyToday: {
    backgroundColor: colors.accent,
  },
  /** Today's photo cell, and the not-in-Figma selected state, share this ring. */
  cellAccentRing: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  photo: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.full,
  },
  photoTint: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.full,
  },
  photoTintToday: {
    backgroundColor: colors.overlayAccent,
  },
  photoTintPast: {
    backgroundColor: colors.photoScrim,
  },
  label: {
    color: colors.textSecondary, // Figma G600
  },
  labelAccent: {
    color: colors.accent,
  },
  labelOnFill: {
    color: colors.textOnDark,
  },
});
