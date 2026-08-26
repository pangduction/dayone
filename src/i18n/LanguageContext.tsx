import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { saveLanguage } from '../data/language';
import type { Language } from '../data/language';
import { strings } from './strings';

type LanguageContextValue = {
  language: Language;
  /** Persists the choice (AsyncStorage) and updates every `t()` call live. */
  setLanguage: (language: Language) => void;
  /**
   * Dot-path lookup into `strings.ts`, e.g. `t('setting.help')`. Returns the
   * path itself if a key is missing, so a miss is visibly wrong rather than
   * silently blank. `params` fills in `{name}` placeholders in the found
   * string (e.g. `exportToPdf.expiresInDays`'s `{n}`).
   */
  t: (path: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function lookup(path: string, language: Language): string {
  let node: unknown = strings[language];
  for (const segment of path.split('.')) {
    if (typeof node !== 'object' || node === null) return path;
    node = (node as Record<string, unknown>)[segment];
  }
  return typeof node === 'string' ? node : path;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in params ? String(params[key]) : match));
}

type Props = {
  /** Loaded from `getLanguage()` before the app renders (App.tsx, alongside the font-load gate) — never guessed, so a returning Korean user never flashes English first. */
  initialLanguage: Language;
  children: ReactNode;
};

/**
 * App-wide current language, read by `useLanguage()` and by `Text.tsx` (the
 * Pretendard font swap keys off the same value). `LanguageModal` is this
 * context's only real writer, via `setLanguage`.
 */
export function LanguageProvider({ initialLanguage, children }: Props) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    saveLanguage(next);
  }, []);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>) => interpolate(lookup(path, language), params),
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
