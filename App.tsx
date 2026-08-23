import { useFonts } from 'expo-font';
import { View } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { fontAssets } from './src/theme/tokens';

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return <RootNavigator />;
}
