import { StyleSheet } from 'react-native';
import Text from './Text';
import ModalSheet from './ModalSheet';
import PrimaryButton from './PrimaryButton';
import WhiteButton from './WhiteButton';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, typography } from '../theme/tokens';

type Props = {
  visible: boolean;
  /** Confirm — every local post, photo, recording, and export is gone for good. */
  onDelete: () => void;
  /** Dismiss and keep everything — both "Cancel" and the X. */
  onCancel: () => void;
};

/**
 * Setting → Delete Account (Flow 7.6) — no frame for this in Figma, so it's
 * built on the same `Modal/Delete-Post` shell (`DeletePostModal.tsx`) rather
 * than inventing a new one: the destructive action as a Button / L / Filled
 * / Primary in its Warning tone over a "Cancel" white button. See
 * `src/data/account.ts`'s own doc comment for exactly what gets deleted.
 */
export default function DeleteAccountModal({ visible, onDelete, onCancel }: Props) {
  const { t } = useLanguage();
  return (
    <ModalSheet
      visible={visible}
      title={t('deleteAccountModal.title')}
      onClose={onCancel}
      actions={
        <>
          <PrimaryButton label={t('deleteAccountModal.delete')} tone="warning" onPress={onDelete} />
          <WhiteButton label={t('deleteAccountModal.cancel')} onPress={onCancel} />
        </>
      }
    >
      <Text style={[typography.body, styles.body]}>{t('deleteAccountModal.body1')}</Text>
      <Text style={[typography.body, styles.body]}>{t('deleteAccountModal.body2')}</Text>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    width: '100%',
    color: colors.textSecondary,
  },
});
