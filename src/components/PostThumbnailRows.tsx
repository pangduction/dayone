import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import PostReportThumbnail, { REPORT_THUMBNAIL_WIDTH } from './PostReportThumbnail';
import type { Post } from '../data/posts';
import { spacing } from '../theme/tokens';

type Props = {
  /** The month's posts, oldest first — Figma numbers them left to right. */
  posts: Post[];
  onPressPost?: (post: Post) => void;
  /** Paused while the Lock Paper covers the strip, so it can't drift unseen. */
  autoScroll?: boolean;
};

/** Figma "Thumbnail Section" (node 3196:14206): a fixed 320-tall slot. */
const SECTION_HEIGHT = 320;
/** Figma: 16 between sections — 6 x 120 + 5 x 16 = the strip's 800. */
const SECTION_GAP = spacing.md;

/**
 * How fast the strip drifts, in points per second. Figma says the montage
 * moves on its own but not how fast, so this is our value — slow enough to
 * read a thumbnail as it goes by.
 */
const DRIFT_POINTS_PER_SECOND = 15;
/** Roughly a frame; the drift is applied unanimated at this cadence. */
const DRIFT_INTERVAL_MS = 16;

/**
 * Figma "Post Thumbnail Rows" (node 3196:14205 on Report-Default, 3196:14377
 * on Report-Done) — the month's posts as a horizontal montage.
 *
 * Each post gets a 120-wide Thumbnail Section 320 tall, and the sections
 * alternate their vertical alignment: the first sits at the top of the slot,
 * the second at the bottom, and so on. That alternation is also what decides
 * each thumbnail's `dateUp`, so the day label always ends up on the inner
 * side, nearer the middle of the strip. Both are read off the six sections
 * Figma draws, whose y/height pairs are (0,180) (82,238) (0,238) (140,180)
 * (0,180) (140,180) — every even one topped out at 0, every odd one bottomed
 * out at 320.
 *
 * The strip drifts left to right on its own and can be dragged. Dragging
 * takes over: the drift stops on touch and does not resume, so it never
 * fights the reader. It also stops on reaching the end rather than looping,
 * since a jump back to the start would be more jarring than stopping.
 */
export default function PostThumbnailRows({ posts, onPressPost, autoScroll = true }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const offset = useRef(0);
  const maxOffset = useRef(0);
  const [drifting, setDrifting] = useState(autoScroll);

  // Measurements needed to know where the end is.
  const viewportWidth = useRef(0);
  const contentWidth = useRef(0);

  const recomputeMax = useCallback(() => {
    maxOffset.current = Math.max(0, contentWidth.current - viewportWidth.current);
  }, []);

  const onViewportLayout = (event: LayoutChangeEvent) => {
    viewportWidth.current = event.nativeEvent.layout.width;
    recomputeMax();
  };

  const onContentSizeChange = (width: number) => {
    contentWidth.current = width;
    recomputeMax();
  };

  useEffect(() => {
    setDrifting(autoScroll);
  }, [autoScroll]);

  // A new month means a new strip; start it from the left again.
  useEffect(() => {
    offset.current = 0;
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [posts]);

  useEffect(() => {
    if (!drifting || posts.length === 0) return;
    const step = (DRIFT_POINTS_PER_SECOND * DRIFT_INTERVAL_MS) / 1000;
    const timer = setInterval(() => {
      if (maxOffset.current <= 0) return;
      const next = Math.min(offset.current + step, maxOffset.current);
      if (next === offset.current) {
        setDrifting(false); // reached the end
        return;
      }
      offset.current = next;
      scrollRef.current?.scrollTo({ x: next, animated: false });
    }, DRIFT_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [drifting, posts.length]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      style={styles.strip}
      contentContainerStyle={styles.content}
      showsHorizontalScrollIndicator={false}
      onLayout={onViewportLayout}
      onContentSizeChange={onContentSizeChange}
      scrollEventThrottle={16}
      onScroll={(event) => {
        offset.current = event.nativeEvent.contentOffset.x;
      }}
      onScrollBeginDrag={() => setDrifting(false)}
    >
      {posts.map((post, index) => {
        // Even sections top-align and put the label under the image; odd ones
        // bottom-align and put it above.
        const bottomAligned = index % 2 === 1;
        return (
          <View
            key={post.date}
            style={[styles.section, bottomAligned ? styles.sectionBottom : styles.sectionTop]}
          >
            <PostReportThumbnail
              post={post}
              dateUp={bottomAligned}
              onPress={onPressPost ? () => onPressPost(post) : undefined}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    width: '100%',
  },
  content: {
    gap: SECTION_GAP,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  section: {
    width: REPORT_THUMBNAIL_WIDTH,
    height: SECTION_HEIGHT,
  },
  sectionTop: {
    justifyContent: 'flex-start',
  },
  sectionBottom: {
    justifyContent: 'flex-end',
  },
});
