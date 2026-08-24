import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderTitlePage from '../components/HeaderTitlePage';
import HeaderActionButton from '../components/HeaderActionButton';
import LabeledInput from '../components/LabeledInput';
import GhostButton from '../components/GhostButton';
import FilledFabButton from '../components/FilledFabButton';
import GalleryModal from '../components/GalleryModal';
import AlertBanner from '../components/AlertBanner';
import { submitContactRequest } from '../data/contact';
import { colors, radius, spacing } from '../theme/tokens';

const MAX_PHOTOS = 3;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Figma "Flow 7.4 Help & Support" (section 3201:7418) — reached from
 * Setting-Main's "Help & Support" row. A single screen, not a wizard: its
 * six frames are all the same form at different fill states (empty ->
 * filled -> photo picker open -> photos attached -> sent), not separate
 * pages.
 *
 * "Email*" and "Contents*" are `LabeledInput`s; "Photos (up to 3)" is three
 * fixed square tiles (only filled ones show an image + `FilledFabButton`
 * "Delete" overlay, matching Header/Post's own Delete pill) plus a
 * `GhostButton` "Upload Photo" that opens the same `GalleryModal` the Add
 * screen uses — appending here instead of replacing, since up to 3 photos
 * can coexist, and hidden once the cap is reached rather than rendered
 * disabled (Figma never draws a "full" state for it).
 *
 * The header's "Done" is `HeaderActionButton` — Figma's own `buttonShow`
 * variant, off (grey) until Email is a plausible address and Contents isn't
 * empty, on (accent) once both hold. Pressing it while valid is a **real
 * send**: `submitContactRequest` (`src/data/contact.ts`) posts to a
 * serverless function that relays the message to Resend, so an actual email
 * reaches the product owner's inbox — see that function's own doc comment
 * (`api/contact.ts`) for why a server sits in between rather than the app
 * calling an email API directly. On success this screen shows an
 * `AlertBanner` ("Feedback sent. Thank you for sharing!") for 3s (matching
 * `HomeScreen`'s post-delete flash) rather than clearing the form or
 * navigating away — per Setting-Help & Support-6 (node 3202:5200), whose
 * screenshot is exactly this: the same Email/Contents/photo still filled
 * in, with the banner over the header. On failure (no configured endpoint,
 * network error, non-2xx) a native `Alert` explains it instead, the same
 * pattern `ExportToPdfScreen`'s "Generate PDF" already uses for its own
 * failure case.
 */
export default function HelpSupportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState('');
  const [contents, setContents] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const canSubmit = EMAIL_PATTERN.test(email.trim()) && contents.trim() !== '';

  useEffect(() => {
    if (alertMessage === null) return;
    // Figma doesn't say how long the banner stays; matches HomeScreen's flash.
    const timer = setTimeout(() => setAlertMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [alertMessage]);

  const addPhoto = (uri: string) => {
    setPhotoUris((prev) => (prev.length < MAX_PHOTOS ? [...prev, uri] : prev));
    setGalleryOpen(false);
  };

  const handleOpenCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to attach a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) addPhoto(result.assets[0].uri);
  };

  const handleOpenGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo library access to attach a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      selectionLimit: 1,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) addPhoto(result.assets[0].uri);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await submitContactRequest({ email: email.trim(), contents: contents.trim(), photoUris });
      setAlertMessage('Feedback sent. Thank you for sharing!');
    } catch {
      Alert.alert('Couldn’t send', 'Something went wrong while sending your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderTitlePage
        title="Help & Support"
        onBack={() => navigation.goBack()}
        action={
          <HeaderActionButton label="Done" active={canSubmit} disabled={!canSubmit || submitting} onPress={handleSubmit} />
        }
      />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        <LabeledInput
          label="Email*"
          value={email}
          onChangeText={setEmail}
          placeholder="e.g. name@mail.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <LabeledInput
          label="Contents*"
          value={contents}
          onChangeText={setContents}
          placeholder="Have feedback? Let us know how we can improve."
          multiline
        />
        <View style={styles.photosField}>
          <View style={styles.photoRow}>
            {[0, 1, 2].map((index) => {
              const uri = photoUris[index];
              return (
                <View key={index} style={styles.photoTile}>
                  {uri ? (
                    <>
                      <Image source={{ uri }} style={styles.photoImage} resizeMode="cover" />
                      <View style={styles.photoDelete} pointerEvents="box-none">
                        <FilledFabButton label="Delete" onPress={() => handleRemovePhoto(index)} />
                      </View>
                    </>
                  ) : null}
                </View>
              );
            })}
          </View>
          {photoUris.length < MAX_PHOTOS ? (
            <GhostButton label="Upload Photo" onPress={() => setGalleryOpen(true)} style={styles.uploadButton} />
          ) : null}
        </View>
      </ScrollView>

      <GalleryModal
        visible={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onPickRecent={addPhoto}
        onOpenCamera={handleOpenCamera}
        onOpenGallery={handleOpenGallery}
      />

      {alertMessage !== null ? (
        <View style={styles.flash} pointerEvents="none">
          <AlertBanner message={alertMessage} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
    paddingTop: 47,
    paddingBottom: 34,
  },
  body: {
    flex: 1,
    width: '100%',
  },
  bodyContent: {
    padding: spacing.md,
    gap: spacing[8],
  },
  photosField: {
    width: '100%',
    gap: spacing.sm,
  },
  photoRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 3, // Figma-exact tile gap, not on the spacing scale (same as GalleryModal's tile row)
  },
  photoTile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoDelete: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  uploadButton: {
    width: '100%',
  },
  flash: {
    // Matches HomeScreen's own flash placement (top 47, over the header).
    position: 'absolute',
    top: 47,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
  },
});
