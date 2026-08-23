import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../theme/tokens';

type Props = {
  /** Day of the month, or null for a leading/trailing blank in the grid. */
  day: number | null;
  isToday: boolean;
  /** The day's post, if one exists. */
  post?: { photoUri: string | null } | null;
  /** Opens the day's post, or starts one when the day is empty. */
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
 */
export default function CalendarDateCell({ day, isToday, post, onPress }: Props) {
  if (day === null) return <View style={styles.cell} />;

  const hasPost = post != null;
  const photoUri = post?.photoUri ?? null;
  const hasPhoto = hasPost && photoUri !== null;
  const isTextOnly = hasPost && photoUri === null;

  // A day with a post opens it; an empty one starts a post for that date.
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={
        onPress ? (hasPost ? `Open the post for day ${day}` : `Write a post for day ${day}`) : undefined
      }
      style={[
        styles.cell,
        isToday && !hasPost && styles.cellTodayEmpty,
        isTextOnly && (isToday ? styles.cellTextOnlyToday : styles.cellTextOnly),
        hasPhoto && isToday && styles.cellPhotoToday,
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
          isToday && !hasPost && styles.labelToday,
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
  cellPhotoToday: {
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
  labelToday: {
    color: colors.accent,
  },
  labelOnFill: {
    color: colors.textOnDark,
  },
});
