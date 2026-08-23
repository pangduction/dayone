import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationAction, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { dateKey, getPostByDate, parseDateKey, savePost } from '../data/posts';
import IconButton from '../components/IconButton';
import HeaderActionButton from '../components/HeaderActionButton';
import SegmentedButton, { type FitMode } from '../components/SegmentedButton';
import FilledFabButton from '../components/FilledFabButton';
import GalleryModal from '../components/GalleryModal';
import LeaveModal from '../components/LeaveModal';
import RichTextEditor from '../components/RichTextEditor';
import type { ActiveFormats, EditorCommand, RichTextEditorHandle } from '../components/RichTextEditor';
import EditorToolbar from '../components/EditorToolbar';
import { palette } from '../theme/tokens';
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
 * post detail screen's Edit button or from tapping an empty calendar day.
 *
 * The story field is a `RichTextEditor` rather than a `TextInput`, with the
 * `EditorToolbar` docked above the keyboard while it has focus — Figma's
 * "Flow 2.2 텍스트 입력하기" (section 3196:14541) shows the screen turning
 * into a scroll area whose bottom is the toolbar plus the OS keyboard.
 *
 * Leaving with unsaved edits raises Figma's Modal/Leave (see "Add-Leave",
 * node 3233:4558). The guard hangs off navigation's `beforeRemove` rather
 * than the header button's own handler so that the swipe-back gesture is
 * covered by the same check.
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
  const [html, setHtml] = useState<string | null>(null);
  const [initialHtml, setInitialHtml] = useState<string | null>(null);
  const [editorFocused, setEditorFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(palette.swatchDefault);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>({
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
  });
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  // What was loaded for this date, so "unsaved changes" is a real comparison
  // rather than "the user touched something".
  const [baseline, setBaseline] = useState<{
    photoUri: string | null;
    fitMode: FitMode;
    text: string;
    html: string | null;
  }>({ photoUri: null, fitMode: 'fit', text: '', html: null });
  // Set just before a navigation we mean to allow — saving, or confirming
  // Leave — so the guard below doesn't re-prompt on our own goBack.
  const bypassLeaveGuard = useRef(false);
  const pendingNavigation = useRef<NavigationAction | null>(null);

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
      setHtml(existing.html);
      setInitialHtml(existing.html ?? escapeHtml(existing.text));
      setBaseline({
        photoUri: existing.photoUri,
        fitMode: existing.fitMode,
        text: existing.text,
        html: existing.html,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [targetKey]);

  const canSave = photoUri !== null || text.trim().length > 0 || hasVoice;
  const isDirty =
    photoUri !== baseline.photoUri ||
    fitMode !== baseline.fitMode ||
    text !== baseline.text ||
    html !== baseline.html;

  // The toolbar docks directly on top of the keyboard, so it needs the
  // keyboard's height. `Will` fires before the animation, which keeps the two
  // moving together instead of the bar jumping up afterwards.
  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', (event) =>
      setKeyboardHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
      setPaletteOpen(false);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleCommand = (command: EditorCommand) => {
    if (command.type === 'foreColor') setSelectedColor(command.color);
    editorRef.current?.apply(command);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (bypassLeaveGuard.current || !isDirty) return;
      event.preventDefault();
      pendingNavigation.current = event.data.action;
      setLeaveOpen(true);
    });
    return unsubscribe;
  }, [navigation, isDirty]);

  const handleLeave = () => {
    bypassLeaveGuard.current = true;
    setLeaveOpen(false);
    const action = pendingNavigation.current;
    pendingNavigation.current = null;
    if (action) navigation.dispatch(action);
    else navigation.goBack();
  };

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
    await savePost({ date: targetKey, photoUri, fitMode, text: text.trim(), html });
    bypassLeaveGuard.current = true;
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
          {/* Figma switched this line from Caption to Overline (node 3184:5697);
              the date above it is still Caption. */}
          <Text style={[typography.overline, styles.weekdayLabel]}>{weekdayLabel}</Text>
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

        <View style={styles.textField}>
          <RichTextEditor
            ref={editorRef}
            initialHtml={initialHtml ?? ''}
            placeholder="Enter.."
            onChange={({ html: nextHtml, text: nextText }) => {
              setHtml(nextHtml);
              setText(nextText);
            }}
            onActiveFormatsChange={setActiveFormats}
            onFocus={() => setEditorFocused(true)}
            onBlur={() => setEditorFocused(false)}
          />
        </View>
      </View>

      {editorFocused ? (
        <View style={[styles.editorDock, { bottom: keyboardHeight }]}>
          <EditorToolbar
            onCommand={handleCommand}
            activeFormats={activeFormats}
            paletteOpen={paletteOpen}
            onTogglePalette={() => setPaletteOpen((open) => !open)}
            selectedColor={selectedColor}
          />
        </View>
      ) : null}

      <LeaveModal visible={leaveOpen} onLeave={handleLeave} onKeepEditing={() => setLeaveOpen(false)} />

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
  textField: {
    flex: 1,
    minHeight: 240,
    width: '100%',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },
  editorDock: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});

/** Renders a legacy plain-text post as the editor's initial HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />');
}
