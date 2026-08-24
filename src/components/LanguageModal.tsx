import { StyleSheet, View } from 'react-native';
import ModalSheet from './ModalSheet';
import ChipButton from './ChipButton';
import PrimaryButton from './PrimaryButton';
import { spacing } from '../theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Fired when the (only tappable, unselectable) 한국어 chip is pressed. */
  onUnsupportedLanguagePress: () => void;
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
 * over the screen underneath instead. The screen holding this modal owns
 * that banner (same split `DateRangeModal`/`GalleryModal` already use
 * between "the modal" and "what the screen does in response").
 */
export default function LanguageModal({ visible, onClose, onUnsupportedLanguagePress }: Props) {
  return (
    <ModalSheet
      visible={visible}
      title="Select Language"
      onClose={onClose}
      actions={<PrimaryButton label="Done" onPress={onClose} />}
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
