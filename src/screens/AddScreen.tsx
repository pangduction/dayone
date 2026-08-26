import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text from '../components/Text';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationAction, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { dateKey, getPostByDate, parseDateKey, savePost } from '../data/posts';
import type { Recording } from '../data/posts';
import IconButton from '../components/IconButton';
import HeaderActionButton from '../components/HeaderActionButton';
import SegmentedButton, { type FitMode } from '../components/SegmentedButton';
import FilledFabButton from '../components/FilledFabButton';
import GalleryModal from '../components/GalleryModal';
import PhotoSection from '../components/PhotoSection';
import RecordRow from '../components/RecordRow';
import LeaveModal from '../components/LeaveModal';
import RichTextEditor from '../components/RichTextEditor';
import type { ActiveFormats, EditorCommand, RichTextEditorHandle } from '../components/RichTextEditor';
import EditorToolbar from '../components/EditorToolbar';
import { palette } from '../theme/tokens';
import { IcArrowLeft, IcImage, IcMicrophone } from '../components/icons/AddIcons';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { useLanguage } from '../i18n/LanguageContext';
import { formatLongDate, formatWeekdayShort } from '../i18n/dateFormat';

/**
 * Figma flow "Flow 2.1 이미지 삽입하기" (section 3196:14539):
 *   Add-Default  (3184:5508) — empty state, "Add Today's Photo" button
 *   Add-Image-1  (3184:7323) — Modal/Gallery sheet over the empty state
 *   Add-Image-2  (3184:5903) — photo chosen, "Fit"    (whole photo)
 *   Add-Image-3  (3192:12212) — photo chosen, "Filled" (cropped to a square)
 *
 * A post holds up to three things: text, one image, and one voice recording.
 * Any single one of them is enough to publish, which is what drives the Done
 * pill's enabled state. The mic button opens the recorder (Figma's "Flow 2.3
 * 녹음하기", section 3196:14542), which hands its take back through a callback
 * so nothing is written until Done — and the finished recording shows here as
 * a Record/Edit row between the photo and the story.
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
 * That scroll area is why the body is a ScrollView whose viewport shrinks by
 * the keyboard and toolbar while typing (node 3184:5959: a 450pt viewport
 * over 691pt of content, scrolled 241 so the story field clears the
 * keyboard). Scrolling to the end reproduces that offset on its own, because
 * 691 - 450 is exactly the 241 Figma shows — the field is a fixed 240 tall,
 * as Figma draws it, rather than stretching to fill.
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
  const { language, t } = useLanguage();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [fitMode, setFitMode] = useState<FitMode>('fit');
  const [text, setText] = useState('');
  const [html, setHtml] = useState<string | null>(null);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [initialHtml, setInitialHtml] = useState<string | null>(null);
  // The editor builds its document once, on mount, so it must not mount until
  // the stored post has arrived — otherwise it freezes as an empty document
  // and the post's text is invisible (and the first keystroke would overwrite
  // it with nothing).
  const [loaded, setLoaded] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
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
    recording: Recording | null;
  }>({ photoUri: null, fitMode: 'fit', text: '', html: null, recording: null });
  // Set just before a navigation we mean to allow — saving, or confirming
  // Leave — so the guard below doesn't re-prompt on our own goBack.
  const bypassLeaveGuard = useRef(false);
  const pendingNavigation = useRef<NavigationAction | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    getPostByDate(targetKey).then((existing) => {
      if (cancelled) return;
      if (existing) {
        setPhotoUri(existing.photoUri);
        setFitMode(existing.fitMode);
        setText(existing.text);
        setHtml(existing.html);
        setRecording(existing.recording);
        // A post written before the rich editor has no `html`; render its
        // plain text as the document instead.
        setInitialHtml(existing.html ?? escapeHtml(existing.text));
        setBaseline({
          photoUri: existing.photoUri,
          fitMode: existing.fitMode,
          text: existing.text,
          html: existing.html,
          recording: existing.recording,
        });
      } else {
        setInitialHtml('');
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [targetKey]);

  const canSave = photoUri !== null || text.trim().length > 0 || recording !== null;
  const isDirty =
    photoUri !== baseline.photoUri ||
    fitMode !== baseline.fitMode ||
    text !== baseline.text ||
    html !== baseline.html ||
    recording?.uri !== baseline.recording?.uri;

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

  // Figma's editor is 56 tall, 112 with the palette open (nodes 3184:5987
  // and 3184:6494) — the height the body has to give up along with the
  // keyboard's.
  const dockHeight = paletteOpen ? 112 : 56;

  // Bring the story field above the keyboard once both it and the dock have
  // settled, and again when the palette changes the dock's height.
  useEffect(() => {
    if (!editorFocused || keyboardHeight === 0) return;
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [editorFocused, keyboardHeight, dockHeight]);

  // Tapping away from the field ends editing, the way an iOS text input
  // behaves. Both halves are needed: `blur` releases the caret inside the
  // WebView (which is what hides the toolbar), `dismiss` closes the keyboard.
  const dismissEditor = () => {
    editorRef.current?.blur();
    Keyboard.dismiss();
  };

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
      Alert.alert(t('add.cameraAccessTitle'), t('add.cameraAccessBody'));
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
      Alert.alert(t('add.photoAccessTitle'), t('add.photoAccessBody'));
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
    await savePost({ date: targetKey, photoUri, fitMode, text: text.trim(), html, recording });
    bypassLeaveGuard.current = true;
    navigation.goBack();
  };

  const dateLabel = formatLongDate(targetDate, language);
  const weekdayLabel = formatWeekdayShort(targetDate, language);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton accessibilityLabel={t('add.back')} onPress={() => navigation.goBack()}>
          <IcArrowLeft size={24} color={colors.textPrimary} />
        </IconButton>

        <View style={styles.dateInfo} pointerEvents="none">
          <Text style={[typography.caption, styles.dateLabel]}>{dateLabel}</Text>
          {/* Figma switched this line from Caption to Overline (node 3184:5697);
              the date above it is still Caption. */}
          <Text style={[typography.overline, styles.weekdayLabel]}>{weekdayLabel}</Text>
        </View>

        <HeaderActionButton label={t('common.done')} active={canSave} disabled={!canSave} onPress={handleDone} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={[styles.body, editorFocused ? { marginBottom: keyboardHeight + dockHeight } : null]}
        contentContainerStyle={styles.bodyScroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {/* Wrapping the body rather than the screen keeps the tap-to-dismiss
            target off the header, and `flexGrow` stretches it over the empty
            space under the story field so tapping there counts too. Child
            buttons still win the touch. */}
        <Pressable style={styles.bodyContent} onPress={dismissEditor} accessible={false}>
        <View style={styles.labelRow}>
          <Text style={[typography.subtext, styles.storyLabel]}>{t('add.todaysStory')}</Text>
          <IconButton
            accessibilityLabel={t('add.recordVoice')}
            onPress={() => navigation.navigate('Recording', { onFinish: setRecording })}
          >
            <IcMicrophone size={24} color={colors.textPrimary} />
          </IconButton>
        </View>

        {photoUri ? (
          <PhotoSection uri={photoUri} fitMode={fitMode}>
            <View style={styles.photoOverlayTop} pointerEvents="box-none">
              <SegmentedButton value={fitMode} onChange={setFitMode} />
            </View>
            <View style={styles.photoOverlayBottom} pointerEvents="box-none">
              <FilledFabButton label={t('add.delete')} onPress={() => setPhotoUri(null)} />
            </View>
          </PhotoSection>
        ) : (
          <Pressable onPress={() => setGalleryOpen(true)} style={styles.photoButton}>
            <IcImage size={24} color={colors.accent} />
            <Text style={[typography.subtext, styles.photoButtonLabel]}>{t('add.addTodaysPhoto')}</Text>
          </Pressable>
        )}

        {recording ? (
          <RecordRow recording={recording} variant="edit" onRemove={() => setRecording(null)} />
        ) : null}

        <View style={styles.textField}>
          {loaded ? (
            <RichTextEditor
              ref={editorRef}
              initialHtml={initialHtml ?? ''}
              placeholder={t('add.storyPlaceholder')}
              onChange={({ html: nextHtml, text: nextText }) => {
                setHtml(nextHtml);
                setText(nextText);
              }}
              onActiveFormatsChange={setActiveFormats}
              onFocus={() => setEditorFocused(true)}
              onBlur={() => setEditorFocused(false)}
            />
          ) : null}
        </View>
        </Pressable>
      </ScrollView>

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
  },
  bodyScroll: {
    flexGrow: 1,
  },
  bodyContent: {
    flexGrow: 1,
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
    // Figma draws the story field at a fixed 240 (node 3184:7406) rather than
    // stretching it, which is also what gives the scroll area something to
    // scroll.
    height: 240,
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
