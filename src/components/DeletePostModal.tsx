import { StyleSheet } from 'react-native';
import Text from './Text';
import ModalSheet from './ModalSheet';
import PrimaryButton from './PrimaryButton';
import WhiteButton from './WhiteButton';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, typography } from '../theme/tokens';

type Props = {
  visible: boolean;
  /** Confirm — the post goes for good. */
  onDelete: () => void;
  /** Dismiss and keep the post — both "Cancel" and the X. */
  onCancel: () => void;
};

/**
 * Figma "Modal/Delete-Post" (node 3233:4928), raised by the post detail
 * header's Delete button — see "Post-Common-Delete" (node 3233:4929).
 *
 * Same shell as every other sheet, with the destructive action as a
 * Button / L / Filled / Primary in its Warning tone (node 3233:4923) over a
 * "Cancel" white button.
 */
export default function DeletePostModal({ visible, onDelete, onCancel }: Props) {
  const { t } = useLanguage();
  return (
    <ModalSheet
      visible={visible}
      title={t('deletePostModal.title')}
      onClose={onCancel}
      actions={
        <>
          <PrimaryButton label={t('deletePostModal.delete')} tone="warning" onPress={onDelete} />
          <WhiteButton label={t('deletePostModal.cancel')} onPress={onCancel} />
        </>
      }
    >
      <Text style={[typography.body, styles.body]}>{t('deletePostModal.body1')}</Text>
      <Text style={[typography.body, styles.body]}>{t('deletePostModal.body2')}</Text>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    width: '100%',
    color: colors.textSecondary,
  },
});
