import { StyleSheet, Text } from 'react-native';
import ModalSheet from './ModalSheet';
import PrimaryButton from './PrimaryButton';
import WhiteButton from './WhiteButton';
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
 *
 * The title reads "Leave Post?" because that is what the node says, even
 * though the body underneath is about deleting — it looks like a leftover
 * from Modal/Leave, which this sheet was built from. Kept verbatim rather
 * than silently reworded.
 */
export default function DeletePostModal({ visible, onDelete, onCancel }: Props) {
  return (
    <ModalSheet
      visible={visible}
      title="Leave Post?"
      onClose={onCancel}
      actions={
        <>
          <PrimaryButton label="Delete" tone="warning" onPress={onDelete} />
          <WhiteButton label="Cancel" onPress={onCancel} />
        </>
      }
    >
      <Text style={[typography.body, styles.body]}>Are you sure you want to delete this post?</Text>
      <Text style={[typography.body, styles.body]}>This action cannot be undone.</Text>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    width: '100%',
    color: colors.textSecondary,
  },
});
