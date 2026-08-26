import { StyleSheet } from 'react-native';
import Text from './Text';
import ModalSheet from './ModalSheet';
import PrimaryButton from './PrimaryButton';
import WhiteButton from './WhiteButton';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, typography } from '../theme/tokens';

type Props = {
  visible: boolean;
  /** Discard the edits and go back. */
  onLeave: () => void;
  /** Dismiss the sheet and stay on the screen — both "Keep Editing" and the X. */
  onKeepEditing: () => void;
};

/**
 * Figma "Modal/Leave" (node 3233:4557), shown over the Add screen when the
 * user tries to go back with unsaved changes — see "Add-Leave" (3233:4558).
 *
 * Title "Leave page?", body in `typography.body` / `colors.textSecondary`,
 * then two full-width buttons 8pt apart: the destructive "Leave" as a
 * Button / L / Filled / Primary in its Accent tone (node 3233:4552), and
 * "Keep Editing" as a Button / L / Filled / White.
 */
export default function LeaveModal({ visible, onLeave, onKeepEditing }: Props) {
  const { t } = useLanguage();
  return (
    <ModalSheet
      visible={visible}
      title={t('leaveModal.title')}
      onClose={onKeepEditing}
      actions={
        <>
          <PrimaryButton label={t('leaveModal.leave')} tone="accent" onPress={onLeave} />
          <WhiteButton label={t('leaveModal.keepEditing')} onPress={onKeepEditing} />
        </>
      }
    >
      <Text style={[typography.body, styles.body]}>{t('leaveModal.body')}</Text>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    width: '100%',
    color: colors.textSecondary,
  },
});
