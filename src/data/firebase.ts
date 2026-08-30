import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
// `getReactNativePersistence` is real at runtime — Metro resolves the
// `react-native` package-export condition and this package's own React
// Native build genuinely has it (see @firebase/auth/dist/rn/index.rn.d.ts)
// — but `firebase/auth`'s published .d.ts is the platform-generic surface
// and doesn't declare it, a known gap in Firebase's own type packaging, not
// a real missing export. Reached with a plain require + ts-expect-error
// rather than a second import line so there's exactly one place this
// workaround lives.
// @ts-expect-error — see the comment above.
import { getReactNativePersistence } from 'firebase/auth';

/**
 * DayOne's one Firebase project, used only for sign-in (Login-1, Figma node
 * 3177:2606) — there is no Firestore/Realtime Database here, since every
 * post/photo/recording stays local (see DESIGN_SYSTEM.md's "Where things
 * live"). Config is read from `EXPO_PUBLIC_FIREBASE_*` env vars (see
 * .env.example), the same client-safe-env-var pattern `contact.ts` already
 * uses — a Firebase *client* config is meant to be public (it's not a
 * secret; every web/app Firebase project ships it inside the bundle), so
 * this is just keeping the repo working without a project of its own.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** Whether a real Firebase project is actually wired up yet — `LoginScreen` checks this before letting a button do anything, so a missing config reads as "not set up yet" rather than a confusing native error. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
try {
  // AsyncStorage persistence so a signed-in user stays signed in across app
  // restarts — Firebase's web SDK defaults to in-memory persistence, which
  // would sign everyone out every time the app is closed.
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  // initializeAuth can only run once per app instance; Fast Refresh during
  // development re-runs this module without a fresh app instance, so the
  // second call throws. Falling back to getAuth reuses the one already made.
  auth = getAuth(app);
}

export { auth };
