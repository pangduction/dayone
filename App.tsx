import { useFonts } from 'expo-font';
import { View } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import { fontAssets } from './src/theme/tokens';

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return <LoginScreen />;
}
