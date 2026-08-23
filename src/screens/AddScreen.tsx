import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { dateKey, getPostByDate, parseDateKey, savePost } from '../data/posts';
import IconButton from '../components/IconButton';
import HeaderActionButton from '../components/HeaderActionButton';
import SegmentedButton, { type FitMode } from '../components/SegmentedButton';
import FilledFabButton from '../components/FilledFabButton';
import GalleryModal from '../components/GalleryModal';
import { IcArrowLeft, IcImage, IcMicrophone } from '../components/icons/AddIcons';
import { colors, radius, spacing, typography } from '../theme/tokens';

/**
 * Figma flow "Flow 2.1 이미지 삽입하기" (section 3196:14539):
 *   Add-Default  (3184:5508) — empty state, "Add Today's Photo" button
 *   Add-Image-1  (3184:7323) — Modal/Gallery sheet over the empty state
 *   Add-Image-2  (3184:5903) — photo chosen, "Fit"    (image letterboxed)
 *   Add-Image-3  (3192:12212) — photo chosen, "Filled" (image fills 358x358)
 *
 * A post holds up to three things: text, one image, and one voice recording.
 * Any single one of them is enough to publish, which is what drives the Done
 * pill's enabled state. Voice recording isn't built yet — the mic button is
 * still a stub — so `hasVoice` is wired in as a constant to keep that rule in
 * one place rather than having to rediscover it later.
 *
 * DayOne allows exactly one post per calendar day, so this screen targets one
 * date and upserts it: opening it on a day that already has a post loads that
 * post for editing rather than starting a blank one. It defaults to today
 * (the bottom nav's Add tab) and takes a `date` param when reached from a
 * post detail screen's Edit button.
 */
export default function AddScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Add'>>();
  const today = useMemo(() => new Date(), []);
  const targetKey = params?.date ?? dateKey(today);
  const targetDate = useMemo(() => parseDateKey(targetKey), [targetKey]);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [fitMode, setFitMode] = useState<FitMode>('fit');
  const [text, setText] = useState('');
  const [galleryOpen, setGalleryOpen] = useState(false);

  // TODO: voice recording (one per post) isn't implemented yet — see the mic
  // button below. Publishing already accounts for it so the Done rule doesn't
  // have to be rewritten when it lands.
  const hasVoice = false;

  useEffect(() => {
    let cancelled = false;
    getPostByDate(targetKey).then((existing) => {
      if (cancelled || !existing) return;
      setPhotoUri(existing.photoUri);
      setFitMode(existing.fitMode);
      setText(existing.text);
    });
    return () => {
      cancelled = true;
    };
  }, [targetKey]);

  const canSave = photoUri !== null || text.trim().length > 0 || hasVoice;

  const handleOpenCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to take today’s photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setGalleryOpen(false);
    }
  };

  const handleOpenGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo library access to add a picture to your post.');
      return;
    }
    // One photo per post: no multi-select.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      selectionLimit: 1,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setGalleryOpen(false);
    }
  };

  const handlePickRecent = (uri: string) => {
    // Replaces whatever was there — one photo per post.
    setPhotoUri(uri);
    setGalleryOpen(false);
  };

  const handleDone = async () => {
    if (!canSave) return;
    await savePost({ date: targetKey, photoUri, fitMode, text: text.trim() });
    navigation.goBack();
  };

  const dateLabel = targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const weekdayLabel = targetDate.toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton accessibilityLabel="Back" onPress={() => navigation.goBack()}>
          <IcArrowLeft size={24} color={colors.textPrimary} />
        </IconButton>

        <View style={styles.dateInfo} pointerEvents="none">
          <Text style={[typography.caption, styles.dateLabel]}>{dateLabel}</Text>
          <Text style={[typography.caption, styles.weekdayLabel]}>{weekdayLabel}</Text>
        </View>

        <HeaderActionButton label="Done" active={canSave} disabled={!canSave} onPress={handleDone} />
      </View>

      <View style={styles.body}>
        <View style={styles.labelRow}>
          <Text style={[typography.subtext, styles.storyLabel]}>Today's Story</Text>
          {/* TODO: voice recording (one per post) isn't implemented yet. */}
          <IconButton accessibilityLabel="Record voice">
            <IcMicrophone size={24} color={colors.textPrimary} />
          </IconButton>
        </View>

        {photoUri ? (
          <View style={styles.photoPreview}>
            <Image
              source={{ uri: photoUri }}
              style={styles.photoImage}
              resizeMode={fitMode === 'fit' ? 'contain' : 'cover'}
            />
            <View style={styles.photoOverlayTop} pointerEvents="box-none">
              <SegmentedButton value={fitMode} onChange={setFitMode} />
            </View>
            <View style={styles.photoOverlayBottom} pointerEvents="box-none">
              <FilledFabButton label="Delete" onPress={() => setPhotoUri(null)} />
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setGalleryOpen(true)} style={styles.photoButton}>
            <IcImage size={24} color={colors.accent} />
            <Text style={[typography.subtext, styles.photoButtonLabel]}>Add Today's Photo</Text>
          </Pressable>
        )}

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Enter.."
          placeholderTextColor={colors.textPlaceholder}
          multiline
          textAlignVertical="top"
          style={[typography.body, styles.textInput]}
        />
      </View>

      <GalleryModal
        visible={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onPickRecent={handlePickRecent}
        onOpenCamera={handleOpenCamera}
        onOpenGallery={handleOpenGallery}
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
  dateInfo: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabel: {
    color: colors.textPrimary,
  },
  weekdayLabel: {
    color: colors.textPlaceholder,
  },
  body: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyLabel: {
    color: colors.textSecondary,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  photoButtonLabel: {
    color: colors.accent,
  },
  photoPreview: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlayTop: {
    position: 'absolute',
    top: spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  photoOverlayBottom: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 240,
    width: '100%',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
  },
});
