import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { deletePost, getPostByDate, parseDateKey } from '../data/posts';
import type { Post } from '../data/posts';
import IconButton from '../components/IconButton';
import GhostButton from '../components/GhostButton';
import { IcArrowLeft } from '../components/icons/AddIcons';
import RichTextEditor from '../components/RichTextEditor';
import PhotoSection from '../components/PhotoSection';
import DeletePostModal from '../components/DeletePostModal';
import { colors, radius, spacing, typography } from '../theme/tokens';

/**
 * Figma "Flow 4. Post Detail Type" (section 3192:11364), reached by tapping a
 * calendar day that has a post.
 *
 * Figma draws eight frames here, but they are one screen: a Header/Post
 * (3192:11899, whose right side now carries Delete alongside Edit) above a
 * Post Detail column (padding 16, gap 16) that stacks
 * Date Written, then whichever of Image Section / Record/View / Text Section
 * the post actually has. The eight frames are just the combinations —
 * Post-Only Photo-Fit (3192:11908), Post-Photo and Text (3192:12419),
 * Post-All (3192:12579) and so on — so this renders the sections
 * conditionally rather than branching into eight layouts.
 *
 * Fit vs Filled is the post's stored `fitMode`, set with the Add screen's
 * toggle. Both go through `PhotoSection`, shared with the Add screen's
 * preview so the two frame a photo the same way.
 *
 * The story renders through the same `RichTextEditor` the Add screen writes
 * with, in read-only mode, so a post's bold / colour / list formatting shows
 * here exactly as it was typed. Posts written before the rich editor have no
 * `html`, so their plain `text` is rendered directly.
 *
 * The header's Delete raises Figma's Modal/Delete-Post (node 3233:4928, in
 * context as "Post-Common-Delete" 3233:4929) and, once confirmed, removes the
 * post and returns to the calendar.
 *
 * TODO: Record/View (instance 3192:12641) is not rendered — voice recording
 * isn't implemented yet. It belongs between the image and the text.
 */
export default function PostDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'PostDetail'>>();
  const { date } = params;

  const [post, setPost] = useState<Post | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getPostByDate(date).then((found) => {
        if (!cancelled) setPost(found);
      });
      return () => {
        cancelled = true;
      };
    }, [date]),
  );

  const handleDelete = async () => {
    await deletePost(date);
    setDeleteOpen(false);
    // Back to the calendar, which reloads its posts on focus, so the day's
    // cell drops straight back to its empty state.
    navigation.goBack();
  };

  const written = useMemo(() => parseDateKey(date), [date]);
  const dateLabel = written.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  // Figma's Date Written spells the weekday out ("Saturday"), unlike the Add
  // header's short form ("Sat").
  const dayLabel = written.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton accessibilityLabel="Back" onPress={() => navigation.goBack()}>
          <IcArrowLeft size={24} color={colors.textPrimary} />
        </IconButton>
        <View style={styles.headerActions}>
          <GhostButton label="Edit" onPress={() => navigation.navigate('Add', { date })} />
          <GhostButton label="Delete" onPress={() => setDeleteOpen(true)} />
        </View>
      </View>

      <View style={styles.detail}>
        <View style={styles.dateWritten}>
          <Text style={[typography.subtext, styles.dateLabel]}>{dateLabel}</Text>
          {/* Figma switched this line from Caption to Overline (node
              3192:12409), matching the same change in Header/Add. */}
          <Text style={[typography.overline, styles.dayLabel]}>{dayLabel}</Text>
        </View>

        {post?.photoUri ? <PhotoSection uri={post.photoUri} fitMode={post.fitMode} /> : null}

        {post && post.text.length > 0 ? (
          <View style={styles.textSection}>
            <View style={styles.divider} />
            {post.html ? (
              <RichTextEditor initialHtml={post.html} editable={false} onChange={() => {}} />
            ) : (
              <Text style={[typography.body, styles.content]}>{post.text}</Text>
            )}
          </View>
        ) : null}
      </View>

      <DeletePostModal
        visible={deleteOpen}
        onDelete={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 47,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 5,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm, // Figma: the Edit/Delete row, node 3233:4663
  },
  detail: {
    flex: 1,
    width: '100%',
    gap: spacing.md,
    padding: spacing.md,
  },
  dateWritten: {
    width: '100%',
    height: 40,
    alignItems: 'center',
  },
  dateLabel: {
    color: colors.textPrimary,
  },
  dayLabel: {
    color: colors.textTertiary,
  },
  textSection: {
    flex: 1,
    width: '100%',
    minHeight: 240,
    gap: spacing.sm,
    paddingHorizontal: spacing[5],
    borderRadius: radius.sm,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.borderSubtle, // Figma: G100, verified via get_variable_defs on node 3192:12438
  },
  content: {
    width: '100%',
    color: colors.textPrimary,
  },
});
