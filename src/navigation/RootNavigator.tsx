import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AddScreen from '../screens/AddScreen';
import PostDetailScreen from '../screens/PostDetailScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  /** Omit `date` to write today's post; pass one to edit that day's. */
  Add: { date?: string } | undefined;
  PostDetail: { date: string };
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
 *
 * "Add" pushes as an ordinary page rather than a modal sheet: its Figma
 * frame (node 3184:5508) is a full screen with a Header/Add whose
 * ic/arrow-left goes back to the previous page, which is a push, not a
 * modal dismissal.
 */
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Add" component={AddScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
