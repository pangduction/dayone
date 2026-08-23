import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as MediaLibrary from 'expo-media-library/legacy';
import ModalSheet from './ModalSheet';
import PrimaryButton from './PrimaryButton';
import { IcCamera } from './icons/AddIcons';
import { colors, radius } from '../theme/tokens';

/** How many recent photos the strip pulls from the device library. */
const RECENT_COUNT = 10;

type Props = {
  visible: boolean;
  onClose: () => void;
  /** A photo was chosen from the recents strip. */
  onPickRecent: (uri: string) => void;
  /** The camera tile was tapped. */
  onOpenCamera: () => void;
  /** "Go to Gallery" was tapped — hand off to the OS picker. */
  onOpenGallery: () => void;
};

type RecentPhoto = { id: string; uri: string };

/**
 * Figma "Modal/Gallery" (node 3198:4446), shown over the Add screen when
 * "Add Today's Photo" is tapped — see "Add-Image-1" (node 3184:7323). The
 * sheet shell (backdrop, header, content and actions blocks) is shared with
 * every other modal and lives in `ModalSheet`; what's here is the tile strip
 * and the "Go to Gallery" action.
 *
 * The tile row (3198:4433) is gap 3 with square `radius.sm` tiles, the first
 * being `colors.surfaceDark` with a 32pt ic/camera and the rest recent
 * photos behind a `colors.borderSubtle` hairline. Figma draws that row 404pt
 * wide inside a 326pt content area, so it is meant to overflow and scroll;
 * five tiles across 404 with 3pt gaps gives the 78.4pt tile size.
 *
 * Figma's mock shows four fixed thumbnails; the real strip is the device's
 * most recent photos via expo-media-library, falling back to just the camera
 * tile + "Go to Gallery" when permission is denied.
 *
 * On iOS `Asset.uri` is a `ph://<id>` PhotoKit identifier, which React
 * Native's <Image> cannot load — it renders an empty tile.
 * `getAssetInfoAsync` resolves each asset to a `file://` `localUri` that
 * <Image> can display and that survives being handed to the Add screen and
 * persisted. Android already hands back a `file://` uri, so the fallback
 * below covers it.
 *
 * The import is `expo-media-library/legacy`, not the package root: in SDK 57
 * the root entry point is the new query-object API (`Query`/`Asset` classes),
 * whose `Asset` has no plain `uri` field and whose `MediaType` has no
 * `photo` member. `getAssetsAsync` + `SortBy` + `MediaType.photo` — the
 * simple "give me the N most recent photos" call this strip needs — are the
 * legacy API, so mixing the two entry points is what produces the type
 * mismatch between the two different `Asset` shapes.
 */
export default function GalleryModal({ visible, onClose, onPickRecent, onOpenCamera, onOpenGallery }: Props) {
  const [recent, setRecent] = useState<RecentPhoto[]>([]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    (async () => {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (cancelled || !permission.granted) return;
      const page = await MediaLibrary.getAssetsAsync({
        first: RECENT_COUNT,
        mediaType: [MediaLibrary.MediaType.photo],
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
      const photos = await Promise.all(
        page.assets.map(async (asset): Promise<RecentPhoto> => {
          try {
            const info = await MediaLibrary.getAssetInfoAsync(asset);
            return { id: asset.id, uri: info.localUri ?? asset.uri };
          } catch {
            return { id: asset.id, uri: asset.uri };
          }
        }),
      );
      if (!cancelled) setRecent(photos);
    })();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  return (
    <ModalSheet
      visible={visible}
      title="Select a Photo"
      onClose={onClose}
      actions={<PrimaryButton label="Go to Gallery" onPress={onOpenGallery} />}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tileRow}>
        <Pressable style={[styles.tile, styles.cameraTile]} onPress={onOpenCamera} accessibilityLabel="Take a photo">
          <IcCamera size={32} color={colors.textOnDark} />
        </Pressable>
        {recent.map((photo) => (
          <Pressable
            key={photo.id}
            style={[styles.tile, styles.photoTile]}
            onPress={() => onPickRecent(photo.uri)}
            accessibilityLabel="Use this photo"
          >
            <Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="cover" />
          </Pressable>
        ))}
      </ScrollView>
    </ModalSheet>
  );
}

const TILE_SIZE = 78.4; // Figma: (404 row width - 4 gaps x 3) / 5 tiles

const styles = StyleSheet.create({
  tileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3, // Figma: exact tile gap, not on the spacing scale
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  cameraTile: {
    backgroundColor: colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTile: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});
