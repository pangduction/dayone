import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import type { PhotoFit } from '../data/posts';

type Props = {
  uri: string;
  fitMode: PhotoFit;
  /** Overlays drawn on top of the photo, e.g. the Add screen's Fit/Filled toggle. */
  children?: ReactNode;
  /**
   * Fires once this section has actually settled into its final size on
   * screen — both the real aspect ratio has been read *and re-rendered*, and
   * the `Image` itself has finished loading at that size — rather than the
   * instant `Image.getSize` merely returns. The Export-to-PDF capture flow
   * (`ExportToPdfScreen.tsx`) uses this to know when an off-screen page is
   * actually safe to screenshot; firing it any earlier captured a page whose
   * photo hadn't finished growing into its real size yet.
   */
  onLoadSettled?: () => void;
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
export default function PhotoSection({ uri, fitMode, children, onLoadSettled }: Props) {
  // Width over height. 1 until the real size is known, so the first paint is
  // the square Figma draws rather than a jump from some other shape.
  const [photoAspect, setPhotoAspect] = useState(1);
  // Two independent async things this section waits on: `Image.getSize`
  // resolving (so `photoAspect` — and the box it drives — is correct) and
  // the `<Image>` element itself finishing loading (so its bitmap has
  // actually been decoded and painted, not just requested). Neither alone
  // means the section looks the way it's about to; `onLoadSettled` only
  // fires once both have.
  const [sizeResolved, setSizeResolved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSizeResolved(false);
    setImageLoaded(false);
    Image.getSize(
      uri,
      (width, height) => {
        if (cancelled) return;
        if (height > 0) setPhotoAspect(width / height);
        setSizeResolved(true);
      },
      () => {
        if (cancelled) return;
        setPhotoAspect(1);
        setSizeResolved(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [uri]);

  useEffect(() => {
    if (sizeResolved && imageLoaded) onLoadSettled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeResolved, imageLoaded]);

  // Never taller than the square: a portrait keeps Figma's framing.
  const aspectRatio = fitMode === 'filled' ? 1 : Math.max(photoAspect, 1);

  return (
    <View style={[styles.section, { aspectRatio }]}>
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode={fitMode === 'fit' ? 'contain' : 'cover'}
        onLoadEnd={() => setImageLoaded(true)}
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
