import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/RootNavigator';
import HeaderTitlePage from '../components/HeaderTitlePage';
import HeaderActionButton from '../components/HeaderActionButton';
import LabeledInput from '../components/LabeledInput';
import GhostButton from '../components/GhostButton';
import FilledFabButton from '../components/FilledFabButton';
import GalleryModal from '../components/GalleryModal';
import { submitContactRequest } from '../data/contact';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, radius, spacing } from '../theme/tokens';

const MAX_PHOTOS = 3;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Figma "Flow 7.4 Help & Support" (section 3201:7418) — reached from
 * Setting-Main's "Help & Support" row. A single screen, not a wizard: its
 * first five frames are all the same form at different fill states (empty
 * -> filled -> photo picker open -> photos attached), not separate pages.
 * The sixth, "sent" frame turned out to actually be Setting-Main again
 * (node 3269:6332) — see this screen's own "Done" handling below.
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
 * calling an email API directly. On success this screen pops back to
 * `SettingScreen` and flashes an `AlertBanner` ("Feedback sent. Thank you
 * for sharing!") there — per Setting-Main's own "sent" state (node
 * 3269:6332), not `HelpSupportScreen`'s own (an earlier, since-corrected
 * read of node 3202:5200). `navigation.navigate('Setting', { flash })`
 * hands the message over as a route param, the same pattern `HomeScreen`'s
 * post-delete flash already uses, rather than this screen showing its own
 * banner and staying put. On failure (no configured endpoint, network
 * error, non-2xx) a native `Alert` explains it instead, the same pattern
 * `ExportToPdfScreen`'s "Generate PDF" already uses for its own failure
 * case — and stays on this screen, since nothing was actually sent.
 */
export default function HelpSupportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [contents, setContents] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = EMAIL_PATTERN.test(email.trim()) && contents.trim() !== '';

  const addPhoto = (uri: string) => {
    setPhotoUris((prev) => (prev.length < MAX_PHOTOS ? [...prev, uri] : prev));
    setGalleryOpen(false);
  };

  const handleOpenCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('helpSupport.cameraAccessTitle'), t('helpSupport.cameraAccessBody'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) addPhoto(result.assets[0].uri);
  };

  const handleOpenGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('helpSupport.photoAccessTitle'), t('helpSupport.photoAccessBody'));
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
      navigation.navigate('Setting', { flash: t('helpSupport.sentFlash') });
    } catch {
      Alert.alert(t('helpSupport.sendFailedTitle'), t('helpSupport.sendFailedBody'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <HeaderTitlePage
        title={t('helpSupport.title')}
        onBack={() => navigation.goBack()}
        action={
          <HeaderActionButton
            label={t('helpSupport.done')}
            active={canSubmit}
            disabled={!canSubmit || submitting}
            onPress={handleSubmit}
          />
        }
      />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        <LabeledInput
          label={t('helpSupport.emailLabel')}
          value={email}
          onChangeText={setEmail}
          placeholder={t('helpSupport.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <LabeledInput
          label={t('helpSupport.contentsLabel')}
          value={contents}
          onChangeText={setContents}
          placeholder={t('helpSupport.contentsPlaceholder')}
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
                        <FilledFabButton label={t('helpSupport.delete')} onPress={() => handleRemovePhoto(index)} />
                      </View>
                    </>
                  ) : null}
                </View>
              );
            })}
          </View>
          {photoUris.length < MAX_PHOTOS ? (
            <GhostButton
              label={t('helpSupport.uploadPhoto')}
              onPress={() => setGalleryOpen(true)}
              style={styles.uploadButton}
            />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingTop/paddingBottom come from useSafeAreaInsets() at render time.
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
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
});
