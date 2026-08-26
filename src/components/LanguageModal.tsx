import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ModalSheet from './ModalSheet';
import ChipButton from './ChipButton';
import PrimaryButton from './PrimaryButton';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../data/language';
import { spacing } from '../theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Figma "Modal/Language" (node 3199:8604, in context on Setting-Language
 * 3199:8605) — built on `ModalSheet.tsx`'s shared shell. Content is two
 * full-width `ChipButton`s stacked at gap 8 (English active/accent-bordered,
 * 한국어 plain), then a dark-tone `PrimaryButton` "Done".
 *
 * Figma's own Setting-Language-Korea frame (node 3267:5909) shows tapping
 * 한국어 as a dead end — no Korean strings existed anywhere in the file, so
 * the modal stayed open with English still active and an "Not supported
 * yet." banner instead. That's no longer the read: DayOne now ships a real
 * Korean translation (`src/i18n/strings.ts`) and a Pretendard font swap
 * (`src/components/Text.tsx`) for it, so both chips are real, selectable
 * options — same draft-then-commit pattern as `MonthPickerModal`/
 * `TimerPickerModal`: picking a chip only updates local state, and "Done"
 * is what actually calls `setLanguage` (`useLanguage()`,
 * `src/i18n/LanguageContext.tsx`), which persists the choice and re-renders
 * every `t()` call in the app live.
 */
export default function LanguageModal({ visible, onClose }: Props) {
  const { language, setLanguage, t } = useLanguage();
  const [draft, setDraft] = useState<Language>(language);

  useEffect(() => {
    if (visible) setDraft(language);
  }, [visible, language]);

  const handleDone = () => {
    setLanguage(draft);
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      title={t('languageModal.title')}
      onClose={onClose}
      actions={<PrimaryButton label={t('common.done')} onPress={handleDone} />}
    >
      <View style={styles.chips}>
        <ChipButton
          label="English"
          status={draft === 'en' ? 'active' : 'enabled'}
          onPress={() => setDraft('en')}
          style={styles.chip}
        />
        <ChipButton
          label="한국어"
          status={draft === 'ko' ? 'active' : 'enabled'}
          onPress={() => setDraft('ko')}
          style={styles.chip}
        />
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
