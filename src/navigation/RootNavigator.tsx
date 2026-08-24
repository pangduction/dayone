import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import HomeListScreen from '../screens/HomeListScreen';
import PostSearchScreen from '../screens/PostSearchScreen';
import ReportScreen from '../screens/ReportScreen';
import SettingScreen from '../screens/SettingScreen';
import NotificationScreen from '../screens/NotificationScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import ExportToPdfScreen from '../screens/ExportToPdfScreen';
import PdfPreviewScreen from '../screens/PdfPreviewScreen';
import AddScreen from '../screens/AddScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import RecordingScreen from '../screens/RecordingScreen';
import type { Recording } from '../data/posts';

export type RootStackParamList = {
  Login: undefined;
  /** `flash` shows a one-off Alert banner over the calendar, e.g. after a delete. */
  Home: { flash?: string } | undefined;
  /**
   * The calendar's month as a list (Figma Home-List, node 3192:9547). The
   * month is passed in rather than assumed to be today's, so that browsing
   * the calendar and then tapping ic/rows lists the month on screen.
   * `month` is 0-indexed, matching `Date#getMonth()`.
   */
  HomeList: { year: number; month: number };
  /**
   * Post search, opened from Header/List's ic/search (Figma Home-List-Search,
   * node 3192:10548). Scoped to the same month the list is showing.
   */
  PostSearch: { year: number; month: number };
  /** The month-as-a-montage screen (Figma Report-Default, node 3196:12678). */
  Report: undefined;
  /**
   * Reached from Report's ic/setting (Figma Setting-Main, node 3198:6348).
   * `flash` shows a one-off Alert banner over it, same as Home's — used by
   * Help & Support's "Done" once the real send succeeds.
   */
  Setting: { flash?: string } | undefined;
  /** Flow 7.1 Notification (section 3199:8210), reached from Setting-Main's "Notifications" row. */
  Notification: undefined;
  /** Flow 7.4 Help & Support (section 3201:7418), reached from Setting-Main's "Help & Support" row. */
  HelpSupport: undefined;
  /**
   * The real Export to PDF list (Figma Setting-Export to PDF-2, node
   * 3201:5947). Reached only after applying a range on the date-range modal
   * that opens directly over Setting-Main — the pre-filled range comes along
   * as params rather than being recomputed here.
   */
  ExportToPdf: { startDate: string; endDate: string };
  /** The real generated PDF, shown in place of Figma's page-image mock (node 3267:6006). */
  PdfPreview: { fileId: string };
  /** Omit `date` to write today's post; pass one to edit that day's. */
  Add: { date?: string } | undefined;
  PostDetail: { date: string };
  /**
   * The recorder hands its take straight back to the Add screen through this
   * callback rather than saving anything itself, so the post is still only
   * written when Done is pressed.
   */
  Recording: { onFinish: (recording: Recording) => void };
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
 * Home and Report both have no transition. They are peers reached from the
 * same bottom bar, not one pushed out of the other, so a slide reads as
 * "deeper into the same thing" — and a cross-fade, tried first, still put an
 * animation between two screens that should simply swap.
 *
 * Both need the option, not just Report. Tapping Report pushes it, which its
 * own `animation` governs; tapping Home from there pops back to a Home that
 * is already in the stack, and that transition follows Home's option rather
 * than the departing screen's. Setting only one left the two directions
 * looking different.
 *
 * The one thing this also changes is the return to Home after deleting a
 * post, which is the same pop — it now swaps rather than sliding.
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
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ animation: 'none' }}
        />
        <Stack.Screen name="HomeList" component={HomeListScreen} />
        <Stack.Screen name="PostSearch" component={PostSearchScreen} />
        <Stack.Screen
          name="Report"
          component={ReportScreen}
          options={{ animation: 'none' }}
        />
        <Stack.Screen name="Setting" component={SettingScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="ExportToPdf" component={ExportToPdfScreen} />
        <Stack.Screen name="PdfPreview" component={PdfPreviewScreen} />
        <Stack.Screen name="Add" component={AddScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="Recording" component={RecordingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
