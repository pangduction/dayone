import { StyleSheet, View } from 'react-native';
import ModalSheet from './ModalSheet';
import ChipButton from './ChipButton';
import PrimaryButton from './PrimaryButton';
import AlertBanner from './AlertBanner';
import { spacing } from '../theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Fired when the (only tappable, unselectable) 한국어 chip is pressed. */
  onUnsupportedLanguagePress: () => void;
  /** Non-null shows the "Not supported yet." banner on top of this modal; owned by the caller (the auto-dismiss timer lives there). */
  alertMessage: string | null;
};

/**
 * Figma "Modal/Language" (node 3199:8604, in context on Setting-Language
 * 3199:8605) — built on `ModalSheet.tsx`'s shared shell. Content is two
 * full-width `ChipButton`s stacked at gap 8 (English active/accent-bordered,
 * 한국어 plain), then a dark-tone `PrimaryButton` "Done".
 *
 * English is the only real option: the app has no Korean strings yet, so
 * 한국어 is a real, tappable chip but pressing it never selects it — per
 * Setting-Language-Korea (node 3267:5909), the modal stays open with
 * English still active and an `AlertBanner` ("Not supported yet.") appears
 * on top of it instead. That banner is passed through `ModalSheet`'s
 * `overlay` slot rather than rendered by the screen underneath — this
 * modal is a real native `Modal`, which paints in front of the rest of the
 * screen regardless of sibling JSX order, so a banner rendered by the
 * screen would sit *behind* it, dimmed along with everything else back
 * there. `SettingScreen` still owns the message and its auto-dismiss timer
 * (the same split `DateRangeModal`/`GalleryModal` already use between "the
 * modal" and "what the screen does in response") — only where it paints
 * moves here.
 */
export default function LanguageModal({ visible, onClose, onUnsupportedLanguagePress, alertMessage }: Props) {
  return (
    <ModalSheet
      visible={visible}
      title="Select Language"
      onClose={onClose}
      actions={<PrimaryButton label="Done" onPress={onClose} />}
      overlay={alertMessage !== null ? <AlertBanner message={alertMessage} /> : null}
    >
      <View style={styles.chips}>
        <ChipButton label="English" status="active" style={styles.chip} />
        <ChipButton label="한국어" status="enabled" onPress={onUnsupportedLanguagePress} style={styles.chip} />
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  chips: {
    width: '100%',
    gap: spacing.sm,
  },
  chip: {
    width: '100%',
  },
});
