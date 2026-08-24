import { useFonts } from 'expo-font';
import { View } from 'react-native';
import * as Notifications from 'expo-notifications';
import RootNavigator from './src/navigation/RootNavigator';
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

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return <RootNavigator />;
}
