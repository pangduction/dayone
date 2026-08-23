import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import type { PhotoFit } from '../data/posts';

type Props = {
  uri: string;
  fitMode: PhotoFit;
  /** Overlays drawn on top of the photo, e.g. the Add screen's Fit/Filled toggle. */
  children?: ReactNode;
};

/**
 * Figma's "Image Section" (nodes 3233:5196 on the post detail, 3184:5912 on
 * the Add screen), shared so the Add screen's preview and the saved post
 * frame a photo identically.
 *
 * Figma draws the section as a 358 square in both modes, but the image inside
 * it is `h-full` — full height, 291 wide (node 3233:5197). Every mock uses a
 * portrait photo, where filling the height happens to fill the square, so the
 * square is really just what a portrait produces rather than a fixed frame.
 * Taking it literally left a landscape photo letterboxed with dead space
 * above and below it, pushing the story text far down the screen.
 *
 * So the section's height follows the photo instead:
 *   - Fit: the whole photo, no dead space. A portrait is capped at the square
 *     and shows side margins, exactly as Figma draws it; a landscape makes the
 *     section shorter than the square rather than padding it out.
 *   - Filled: always the square, with the photo cropped to fill it.
 */
export default function PhotoSection({ uri, fitMode, children }: Props) {
  // Width over height. 1 until the real size is known, so the first paint is
  // the square Figma draws rather than a jump from some other shape.
  const [photoAspect, setPhotoAspect] = useState(1);

  useEffect(() => {
    let cancelled = false;
    Image.getSize(
      uri,
      (width, height) => {
        if (!cancelled && height > 0) setPhotoAspect(width / height);
      },
      () => {
        if (!cancelled) setPhotoAspect(1);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [uri]);

  // Never taller than the square: a portrait keeps Figma's framing.
  const aspectRatio = fitMode === 'filled' ? 1 : Math.max(photoAspect, 1);

  return (
    <View style={[styles.section, { aspectRatio }]}>
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode={fitMode === 'fit' ? 'contain' : 'cover'}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
