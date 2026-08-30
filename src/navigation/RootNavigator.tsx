import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { isFirebaseConfigured } from '../data/firebase';
import { colors } from '../theme/tokens';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import HomeListScreen from '../screens/HomeListScreen';
import PostSearchScreen from '../screens/PostSearchScreen';
import ReportScreen from '../screens/ReportScreen';
import SettingScreen from '../screens/SettingScreen';
import NotificationScreen from '../screens/NotificationScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import FaqScreen from '../screens/FaqScreen';
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
  /** Flow 7.5 Terms of Service (section 3202:5287), reached from Setting-Main's "Terms of Service" row. */
  TermsOfService: undefined;
  /** No Figma frame for this — reached from Setting-Main's "FAQ" row, which the file drew a chevron for but never gave a destination. */
  Faq: undefined;
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
 * Which screens exist is conditional on `useAuth().user` rather than a
 * fixed `initialRouteName` — the standard React Navigation pattern for
 * auth-gated apps: React swaps the entire `<Stack.Screen>` list when `user`
 * flips between `null` and set, which resets the stack to whichever group
 * is now current with no manual `navigation.reset` call needed anywhere
 * (Setting → Log out and → Delete Account both just end up back at `Login`
 * this way, for free). While `initializing` is true — the moment before
 * Firebase's AsyncStorage-persisted session has been read even once — this
 * renders a blank screen rather than guessing, so a returning signed-in
 * user never flashes `Login` first.
 *
 * The gate is `user || !isFirebaseConfigured` rather than just `user`: no
 * Firebase project is wired up in every environment yet (a fresh clone with
 * an empty `.env` has none — see `.env.example`), and `onAuthStateChanged`
 * on an unconfigured project never resolves to a real user, which would
 * otherwise wall the entire app behind a Login screen nothing can get past.
 * Once a real project's config is set, this starts actually requiring
 * sign-in, matching Figma's real intent for Login-1 (node 3177:2606) rather
 * than the placeholder-config dev build silently working around it forever.
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
  const { user, initializing } = useAuth();

  if (initializing) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const signedIn = user !== null || !isFirebaseConfigured;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {signedIn ? (
          <>
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
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
            <Stack.Screen name="Faq" component={FaqScreen} />
            <Stack.Screen name="ExportToPdf" component={ExportToPdfScreen} />
            <Stack.Screen name="PdfPreview" component={PdfPreviewScreen} />
            <Stack.Screen name="Add" component={AddScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="Recording" component={RecordingScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
