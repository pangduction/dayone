import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import * as MediaLibrary from 'expo-media-library/legacy';
import IconButton from './IconButton';
import PrimaryButton from './PrimaryButton';
import { IcCamera, IcCross } from './icons/AddIcons';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

/** How many recent photos the strip pulls from the device library. */
const RECENT_COUNT = 12;

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

/**
 * Figma "Modal/Gallery" (node 3198:4446), shown over the Add screen when
 * "Add Today's Photo" is tapped — see "Add-Image-1" (node 3184:7323).
 *
 * Layout, read off that node:
 *   backdrop (3184:7350) — full screen, `colors.backdrop` (G900 @ 30%) over
 *     a blur (Figma effect "Background blur / md", radius 16), content
 *     bottom-aligned, paddingTop 16 / paddingBottom 40 / px 16
 *   sheet (3198:4446) — white, radius.xl (24), `shadows.xl`
 *     header title (3198:4426) — paddingTop 20, px 16, "Select a Photo"
 *       in `typography.subtext` / `colors.textPrimary`
 *     header padding-bottom spacer (3198:4428) — height 20
 *     close button (3198:4429) — absolute, right 8 / top 8.4, 40x40.
 *       Figma names it Button/Icon/Plain but gives it padding 10 / radius 8
 *       rather than the Add header's 8 / 16; with a transparent background
 *       and a centred 24pt glyph in a 40pt box both render identically, so
 *       this reuses `IconButton`.
 *     content (3198:4431) — px 16, paddingTop 20
 *       tile row (3198:4433) — gap 3, square tiles, radius.sm; first tile
 *         is `colors.surfaceDark` with a 32px ic/camera, the rest are
 *         recent photos with a `colors.borderSubtle` hairline border
 *     actions (3198:4440) — paddingTop 24, then px 16 / paddingBottom 24
 *       around a full-width "Go to Gallery" Button/L/Filled/Primary
 *
 * Figma draws the tile row 404pt wide inside a 326pt-wide content area, so
 * it is deliberately wider than the sheet — it scrolls horizontally. Five
 * tiles across 404 with 3pt gaps gives the 78.4pt tile size below.
 *
 * Figma's mock shows four fixed thumbnails; the real strip is the device's
 * most recent photos via expo-media-library, falling back to just the
 * camera tile + "Go to Gallery" when permission is denied.
 *
 * On iOS `Asset.uri` is a `ph://<id>` PhotoKit identifier, which React
 * Native's <Image> cannot load — it renders an empty tile. `getAssetInfoAsync`
 * resolves each asset to a `file://` `localUri` that <Image> can display and
 * that survives being handed to the Add screen and persisted. Android already
 * hands back a `file://` uri, so the fallback below covers it.
 *
 * The import is `expo-media-library/legacy`, not the package root: in SDK 57
 * the root entry point is the new query-object API (`Query`/`Asset` classes),
 * whose `Asset` has no plain `uri` field and whose `MediaType` has no
 * `photo` member. `getAssetsAsync` + `SortBy` + `MediaType.photo` — the
 * simple "give me the N most recent photos" call this strip needs — are the
 * legacy API, so mixing the two entry points is what produces the type
 * mismatch between the two different `Asset` shapes.
 */
type RecentPhoto = { id: string; uri: string };

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <BlurView intensity={BACKDROP_BLUR_INTENSITY} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close photo picker">
          {/* Taps inside the sheet must not fall through to the backdrop. */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <Text style={[typography.subtext, styles.title]}>Select a Photo</Text>
              </View>
              <View style={styles.headerSpacer} />
              <IconButton accessibilityLabel="Close" onPress={onClose} style={styles.closeButton}>
                <IcCross size={24} color={colors.textPrimary} />
              </IconButton>
            </View>

            <View style={styles.content}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tileRow}
              >
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
            </View>

            <View style={styles.actions}>
              <PrimaryButton label="Go to Gallery" onPress={onOpenGallery} />
            </View>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}

const TILE_SIZE = 78.4; // Figma: (404 row width - 4 gaps x 3) / 5 tiles

/**
 * Figma's backdrop carries "Background blur / md" (radius 16, which the CSS
 * export renders as `backdrop-blur-[8px]`). expo-blur takes a 0-100
 * intensity rather than a pixel radius, so this is the nearest equivalent
 * and the one value here that isn't a direct read from the node.
 */
const BACKDROP_BLUR_INTENSITY = 20;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing[10],
    paddingHorizontal: spacing.md,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  header: {
    width: '100%',
    backgroundColor: colors.background,
  },
  headerTitle: {
    width: '100%',
    paddingTop: spacing[7],
    paddingHorizontal: spacing.md,
  },
  title: {
    color: colors.textPrimary,
  },
  headerSpacer: {
    height: 20, // Figma "Padding bottom" (node 3198:4428)
  },
  closeButton: {
    position: 'absolute',
    right: spacing.sm,
    top: 8.4, // Figma: exact offset on node 3198:4429
  },
  content: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingTop: spacing[7],
  },
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
  actions: {
    width: '100%',
    paddingTop: spacing[8],
    paddingHorizontal: spacing.md,
    paddingBottom: spacing[8],
  },
});
