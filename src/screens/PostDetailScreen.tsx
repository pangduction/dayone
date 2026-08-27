import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { deletePost, getPostByDate } from '../data/posts';
import type { Post } from '../data/posts';
import IconButton from '../components/IconButton';
import GhostButton from '../components/GhostButton';
import { IcArrowLeft } from '../components/icons/AddIcons';
import PostDetailBody from '../components/PostDetailBody';
import DeletePostModal from '../components/DeletePostModal';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, spacing } from '../theme/tokens';

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
 * `html`, so their plain `text` is rendered directly. All of that section
 * logic lives in `PostDetailBody.tsx`, shared with the Export-to-PDF preview
 * (`PdfPagePreview.tsx`) so the two can never drift apart.
 *
 * The header's Delete raises Figma's Modal/Delete-Post (node 3233:4928, in
 * context as "Post-Common-Delete" 3233:4929) and, once confirmed, removes the
 * post and returns to the calendar.
 */
export default function PostDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'PostDetail'>>();
  const { date } = params;
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

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
    // Back to the calendar — which reloads its posts on focus, so the day's
    // cell drops straight back to its empty state — carrying the banner
    // Figma shows there afterwards (node 3233:5040).
    navigation.navigate('Home', { flash: t('home.deletedFlash') });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <IconButton accessibilityLabel={t('postDetail.back')} onPress={() => navigation.goBack()}>
          <IcArrowLeft size={24} color={colors.textPrimary} />
        </IconButton>
        <View style={styles.headerActions}>
          <GhostButton label={t('postDetail.edit')} onPress={() => navigation.navigate('Add', { date })} />
          <GhostButton label={t('postDetail.delete')} onPress={() => setDeleteOpen(true)} />
        </View>
      </View>

      {post ? <PostDetailBody post={post} /> : null}

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
    // paddingTop/paddingBottom come from useSafeAreaInsets() at render time.
    flex: 1,
    backgroundColor: colors.background,
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
});
