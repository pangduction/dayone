import { Image, Pressable, StyleSheet, View } from 'react-native';
import Text from './Text';
import type { Post } from '../data/posts';
import { parseDateKey } from '../data/posts';
import { formatDuration } from '../utils/duration';
import { IcPlay } from './icons/CommonIcons';
import { useLanguage } from '../i18n/LanguageContext';
import { formatWeekdayShort } from '../i18n/dateFormat';
import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = {
  post: Post;
  onPress?: () => void;
};

/**
 * Figma "Post List Thumbnail" (component set node 3192:9526) — one row of
 * Home-List-Done (3192:9547).
 *
 * A 88-tall card at `radius.sm` with a 1px `colors.borderStrong` outline: a
 * fixed 72-wide Image block holding the weekday over the day-of-month, then a
 * flexible Content block.
 *
 * The set has five variants, and which one applies is decided entirely by
 * what the post holds — no extra prop:
 *
 *   Post Type=Photo and Text    (3192:9523)  photo + text
 *   Post Type=Text and Record   (3192:9524)  text, no photo
 *   Post Type=Only Record       (3192:9525)  neither photo nor text
 *   Post Type=Only Photo        (3192:9527)  photo, nothing else
 *   Post Type=Photo and Record  (3192:9655)  photo + recording, no text
 *
 * Two rules fall out of comparing them:
 *
 *   1. A photo is confined to the 72-wide Image block when the post also has
 *      text, and bleeds across the whole card when it doesn't — there is
 *      nothing else to fill the Content block with. Either way it sits under
 *      `colors.photoScrim` so the white date stays legible.
 *   2. The Content block shows the text if there is any, otherwise the
 *      recording pill, otherwise nothing. Note that "Text and Record" draws
 *      only its text — the recording is not shown next to text anywhere in
 *      the set.
 *
 * Those five cover all seven things a DayOne post can be. The two Figma
 * doesn't draw need no invention: a text-only post is "Text and Record"
 * minus the record it never rendered, and a photo+text+record post is
 * "Photo and Text" for the same reason.
 */
export default function PostListThumbnail({ post, onPress }: Props) {
  const { language, t } = useLanguage();
  const hasPhoto = post.photoUri !== null;
  const hasText = post.text.trim().length > 0;
  const recording = post.recording;

  // Rule 1: the photo only stays inside the Image block when text needs the
  // rest of the card.
  const photoFillsCard = hasPhoto && !hasText;
  const photoInImageBlock = hasPhoto && hasText;
  // The date sits on the photo in every photo variant, so it turns white;
  // with no photo the Image block is plain white and it is G800.
  const onPhoto = hasPhoto;

  const date = parseDateKey(post.date);
  const weekday = formatWeekdayShort(date, language);

  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? t('homeList.openPostFor', { date: post.date }) : undefined}
      style={styles.card}
    >
      {photoFillsCard ? <Photo uri={post.photoUri!} /> : null}

      <View style={styles.imageBlock}>
        {photoInImageBlock ? <Photo uri={post.photoUri!} /> : null}
        <View style={styles.dateField}>
          <Text style={[typography.subtext, onPhoto ? styles.dateOnPhoto : styles.dateOnWhite]}>{weekday}</Text>
          <Text style={[typography.titleSmall, styles.dayNumber, onPhoto ? styles.dateOnPhoto : styles.dateOnWhite]}>
            {date.getDate()}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {hasText ? (
          <Text style={[typography.body, styles.text]} numberOfLines={2} ellipsizeMode="tail">
            {post.text}
          </Text>
        ) : recording ? (
          <View style={styles.recordingPill}>
            <IcPlay size={20} color={photoFillsCard ? colors.textOnDark : colors.textPrimary} />
            <Text
              style={[typography.body, photoFillsCard ? styles.durationOnPhoto : styles.durationOnWhite]}
            >
              {formatDuration(recording.durationMs)}
            </Text>
          </View>
        ) : null}
      </View>
    </Container>
  );
}

/** The photo plus the scrim Figma always lays over it, filling its parent. */
function Photo({ uri }: { uri: string }) {
  return (
    <>
      <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
      <View style={styles.photoScrim} />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  photo: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  photoScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.photoScrim,
  },
  imageBlock: {
    width: 72, // Figma: fixed, the flexible half is Content (node 3192:9493)
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dateField: {
    width: 70, // Figma "Date Field" (node 3192:9494)
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    // Figma's Date text node is 29 tall (node 3192:9496) against Title-Small's
    // own 24 — this instance leaves the leading on auto, which is what makes
    // the Date Field 19 + 29 = 48. Overridden here rather than in the shared
    // token, which other screens use at 24.
    lineHeight: 29,
  },
  dateOnPhoto: {
    color: colors.textOnDark,
  },
  dateOnWhite: {
    color: colors.textStrong, // Figma G800
  },
  content: {
    flex: 1,
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing[8],
  },
  text: {
    width: '100%',
    color: colors.textPrimary,
  },
  recordingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.lg, // Figma gives the pill a radius but no fill (node 3192:9514)
  },
  durationOnWhite: {
    color: colors.textPrimary,
  },
  durationOnPhoto: {
    color: colors.textOnDark,
  },
});
