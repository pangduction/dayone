import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
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
/** How far a finger must travel before it counts as a drag rather than a tap. */
const DRAG_SLOP = 4;

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
 * The strip is deliberately not a ScrollView, and that is what lets a
 * thumbnail be tapped while it drifts. A scroll view being scrolled — even
 * programmatically, as a drift must — cancels touches that land on its
 * content, so the press died before it could fire. Pausing the drift once JS
 * heard about the touch was never early enough, because the cancelling
 * happens natively.
 *
 * So the row is translated instead, and dragging is a PanResponder that only
 * claims the gesture once a finger has travelled DRAG_SLOP. A tap never moves
 * that far, so it stays with the thumbnail underneath and fires normally; a
 * drag takes the strip over and stops the drift for the rest of the visit.
 *
 * The drift also stops while the screen is not focused, which is what lets a
 * post opened from here come back to the strip where it was left rather than
 * to wherever it would have crept meanwhile. Coming back counts as a new
 * visit, so it resumes — from that same spot, not from the start.
 *
 * It stops on reaching the end rather than looping, since a jump back to the
 * start would be more jarring.
 */
export default function PostThumbnailRows({ posts, onPressPost, autoScroll = true }: Props) {
  const isFocused = useIsFocused();
  const translateX = useRef(new Animated.Value(0)).current;

  /** How far the strip has advanced, in points, always >= 0. */
  const offset = useRef(0);
  const maxOffset = useRef(0);
  const viewportWidth = useRef(0);
  const contentWidth = useRef(0);

  /** Whether the drift is allowed at all — a drag or the end switches it off. */
  const [drifting, setDrifting] = useState(autoScroll);
  /** Bumped when a measurement lands, so the drift can start once sizes are known. */
  const [measureTick, setMeasureTick] = useState(0);
  /** True while a finger rests on the strip, so it holds still under the touch. */
  const touchHeld = useRef(false);

  // The animation is JS-driven on purpose: a native-driven value doesn't
  // report back to JS, and the drag needs to know exactly where the strip is
  // at the moment it takes over.
  useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      offset.current = -value;
    });
    return () => translateX.removeListener(id);
  }, [translateX]);

  const recomputeMax = useCallback(() => {
    const next = Math.max(0, contentWidth.current - viewportWidth.current);
    if (next === maxOffset.current) return;
    maxOffset.current = next;
    setMeasureTick((tick) => tick + 1);
  }, []);

  const onViewportLayout = (event: LayoutChangeEvent) => {
    viewportWidth.current = event.nativeEvent.layout.width;
    recomputeMax();
  };

  const onContentLayout = (event: LayoutChangeEvent) => {
    contentWidth.current = event.nativeEvent.layout.width;
    recomputeMax();
  };

  const stopDrift = useCallback(() => {
    translateX.stopAnimation();
  }, [translateX]);

  const startDrift = useCallback(() => {
    const remaining = maxOffset.current - offset.current;
    if (remaining <= 0) return;
    Animated.timing(translateX, {
      toValue: -maxOffset.current,
      duration: (remaining / DRIFT_POINTS_PER_SECOND) * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setDrifting(false); // reached the end; no loop back
    });
  }, [translateX]);

  // Arriving at the screen starts the drift again — from wherever the strip
  // currently sits, since nothing here touches the offset. Handing the strip
  // over by dragging lasts for that visit; coming back from a post is a new
  // one, and the drift picks up where it was left.
  useEffect(() => {
    if (!isFocused) return;
    setDrifting(autoScroll);
  }, [autoScroll, isFocused]);

  useEffect(() => {
    if (!drifting || !isFocused || touchHeld.current || posts.length === 0) return;
    startDrift();
    return stopDrift;
  }, [drifting, isFocused, posts.length, measureTick, startDrift, stopDrift]);

  // A new month means a new strip; start it from the left again. Keyed on the
  // month rather than the array, because coming back from a post reloads the
  // same posts into a new array and the strip should stay where it was.
  const monthKey = posts.length > 0 ? posts[0].date.slice(0, 7) : '';
  useEffect(() => {
    translateX.stopAnimation();
    offset.current = 0;
    translateX.setValue(0);
  }, [monthKey, translateX]);

  /** Where the strip stood when the current drag began. */
  const dragOrigin = useRef(0);

  const pan = useRef(
    PanResponder.create({
      // Deliberately not claiming on touch-down: that is what leaves a tap
      // with the thumbnail underneath. Only a real sideways drag takes over.
      onMoveShouldSetPanResponder: (_event, gesture) =>
        Math.abs(gesture.dx) > DRAG_SLOP && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: () => {
        translateX.stopAnimation();
        dragOrigin.current = offset.current;
      },
      onPanResponderMove: (_event, gesture) => {
        const next = Math.min(Math.max(dragOrigin.current - gesture.dx, 0), maxOffset.current);
        offset.current = next;
        translateX.setValue(-next);
      },
      // A drag hands the strip over for the rest of this visit.
      onPanResponderRelease: () => setDrifting(false),
      onPanResponderTerminate: () => setDrifting(false),
    }),
  ).current;

  // While a finger rests on a thumbnail the strip holds still, so the tile
  // being pressed doesn't slide out from under it.
  const holdForTouch = () => {
    touchHeld.current = true;
    stopDrift();
  };
  const releaseAfterTouch = () => {
    touchHeld.current = false;
    if (drifting && isFocused) startDrift();
  };

  return (
    <View style={styles.strip} onLayout={onViewportLayout} {...pan.panHandlers}>
      <Animated.View
        style={[styles.content, { transform: [{ translateX }] }]}
        onLayout={onContentLayout}
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
                onPressIn={holdForTouch}
                onPressOut={releaseAfterTouch}
              />
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    width: '100%',
    height: SECTION_HEIGHT,
    // The row is wider than the screen by design (Figma's is 800 across a 390
    // frame), so it has to be clipped at the edges.
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    // Sized by its children rather than stretched to the strip, so the row can
    // run past the screen edge.
    alignSelf: 'flex-start',
    gap: SECTION_GAP,
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
