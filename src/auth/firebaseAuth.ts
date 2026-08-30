import {
  deleteUser,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from 'firebase/auth';
import type { AuthCredential, User } from 'firebase/auth';
import { auth } from '../data/firebase';

export type { User };

/** `AuthContext`'s only real subscription — fires once immediately with whatever session Firebase's AsyncStorage persistence already restored, then again on every sign-in/out. */
export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/** Completes sign-in with a Google or Apple credential already obtained by the caller (`LoginScreen.tsx`) — this file has no UI/browser-flow code of its own. */
export async function signInWithFirebaseCredential(credential: AuthCredential): Promise<void> {
  await signInWithCredential(auth, credential);
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Setting → Delete Account's Firebase half (the local half is
 * `src/data/account.ts`'s `deleteAllAppData`). Firebase can refuse this with
 * `auth/requires-recent-login` if the session is old — DayOne's sign-in is
 * always a fresh social credential, not a long-lived password session, so
 * this is rare, but `SettingScreen.tsx` falls back to a plain sign-out
 * rather than leaving the user stuck if it happens: the local data is
 * already gone either way, and the account itself is merely orphaned rather
 * than lost.
 */
export async function deleteFirebaseAccount(): Promise<void> {
  if (!auth.currentUser) return;
  await deleteUser(auth.currentUser);
}
