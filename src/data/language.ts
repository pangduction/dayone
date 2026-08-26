import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'ko';

const STORAGE_KEY = 'dayone.language.v1';
const DEFAULT_LANGUAGE: Language = 'en';

/** Persisted app language — see `src/i18n/` for the strings this drives and `LanguageContext.tsx` for how a screen reads/changes it live. */
export async function getLanguage(): Promise<Language> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw === 'ko' ? 'ko' : DEFAULT_LANGUAGE;
}

export async function saveLanguage(language: Language): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, language);
}
