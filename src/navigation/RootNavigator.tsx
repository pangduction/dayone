import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AddScreen from '../screens/AddScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Add: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * `initialRouteName` is "Home", not "Login" — sign-in has no real
 * authentication wired up yet (planned last), so starting there would block
 * building/testing every other screen. Switch this back to "Login" once
 * pressing a social login button actually does something.
 *
 * All screens render their own custom header (per Figma), so the native
 * stack header is turned off everywhere.
 */
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Add" component={AddScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
