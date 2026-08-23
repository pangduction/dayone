import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { dateKey, getPostByDate, savePost } from '../data/posts';
import { colors, radius, spacing, typography } from '../theme/tokens';

/**
 * Figma: "Add-Default" (node 3184:5508), reached from Home's bottom
 * Navigation "Add" tab (node 3184:3528).
 *
 * DayOne allows exactly one post per calendar day and exactly one photo per
 * post. This screen always targets *today* (no date picker here — the Home
 * calendar's day cells are a separate, not-yet-built way to view/edit past
 * days), so opening it when today already has a post loads that post for
 * editing instead of starting a blank one.
 *
 * The "on" (enabled) visual for the Done pill wasn't in the fetched Figma
 * node (only `active="off"` was) — its filled/accent style below is an
 * inferred default, not a pixel-perfect port.
 */
export default function AddScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => dateKey(today), [today]);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [text, setText] = useState('');

  useEffect(() => {
    let cancelled = false;
    getPostByDate(todayKey).then((existing) => {
      if (cancelled || !existing) return;
      setPhotoUri(existing.photoUri);
      setText(existing.text);
    });
    return () => {
      cancelled = true;
    };
  }, [todayKey]);

  const canSave = photoUri !== null || text.trim().length > 0;

  const handlePickPhoto = async () => {
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
    }
  };

  const handleDone = async () => {
    if (!canSave) return;
    await savePost({ date: todayKey, photoUri, text: text.trim() });
    navigation.goBack();
  };

  const dateLabel = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const weekdayLabel = today.toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerIconButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.dateInfo} pointerEvents="none">
          <Text style={[typography.caption, styles.dateLabel]}>{dateLabel}</Text>
          <Text style={[typography.caption, styles.weekdayLabel]}>{weekdayLabel}</Text>
        </View>

        <Pressable
          onPress={handleDone}
          disabled={!canSave}
          style={[styles.doneButton, canSave && styles.doneButtonActive]}
        >
          <Text style={[typography.subtext, styles.doneLabel, canSave && styles.doneLabelActive]}>Done</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.labelRow}>
          <Text style={[typography.subtext, styles.storyLabel]}>Today's Story</Text>
          {/* TODO: voice-to-text dictation isn't implemented yet — button is a stub. */}
          <Pressable style={styles.micButton} hitSlop={8}>
            <Ionicons name="mic-outline" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        {photoUri ? (
          <View style={styles.photoPreview}>
            <Image source={{ uri: photoUri }} style={styles.photoImage} resizeMode="cover" />
            <Pressable onPress={() => setPhotoUri(null)} style={styles.photoRemoveButton} hitSlop={8}>
              <Ionicons name="close-circle" size={24} color={colors.buttonDark} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={handlePickPhoto} style={styles.photoButton}>
            <Ionicons name="image-outline" size={24} color={colors.accent} />
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
  headerIconButton: {
    width: 40,
    height: 40,
    padding: spacing.sm,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
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
  doneButton: {
    height: 40,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonActive: {
    backgroundColor: colors.accent,
  },
  doneLabel: {
    color: colors.border,
  },
  doneLabelActive: {
    color: colors.textOnDark,
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
  micButton: {
    width: 40,
    height: 40,
    padding: spacing.sm,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
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
    height: 200,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoRemoveButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.full,
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
