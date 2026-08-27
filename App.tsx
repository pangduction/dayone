import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import RootNavigator from './src/navigation/RootNavigator';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { getLanguage } from './src/data/language';
import type { Language } from './src/data/language';
import { fontAssets } from './src/theme/tokens';

// Without a handler, a notification that fires while the app happens to be
// open is silently swallowed rather than shown — Daily Reminder and Monthly
// Report (src/data/notificationSettings.ts) are real scheduled
// notifications, so they should still show as a banner in that case.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);
  // Loaded once up front, alongside fonts, rather than inside LanguageProvider
  // itself — a returning Korean-language user should never see a flash of
  // English while AsyncStorage answers.
  const [language, setLanguage] = useState<Language | null>(null);

  useEffect(() => {
    getLanguage().then(setLanguage);
  }, []);

  if (!fontsLoaded || language === null) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider initialLanguage={language}>
        <RootNavigator />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
