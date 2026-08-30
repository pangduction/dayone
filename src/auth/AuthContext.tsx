import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from './firebaseAuth';
import { subscribeToAuthState } from './firebaseAuth';
import { isFirebaseConfigured } from '../data/firebase';

type AuthContextValue = {
  user: User | null;
  /**
   * True until the first real auth-state check resolves. `RootNavigator`
   * blocks on this so a signed-in user (Firebase's AsyncStorage persistence
   * restoring their session) never flashes the Login screen first, and a
   * signed-out one never flashes Home.
   */
  initializing: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * App-wide sign-in state. `RootNavigator` is this context's only reader —
 * it renders the "signed in" screen group or just `Login` based on `user`,
 * so signing in or out (or Setting → Delete Account, which signs out as
 * part of deleting the Firebase user) swaps the whole stack on its own,
 * with no manual `navigation.reset` needed anywhere.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // No real Firebase project configured (see .env.example) — RootNavigator
    // doesn't gate on `user` at all in that case, so there's nothing to wait
    // for. Skipping the subscription avoids depending on an unconfigured
    // Firebase project's `onAuthStateChanged` ever actually resolving.
    if (!isFirebaseConfigured) {
      setInitializing(false);
      return;
    }
    const unsubscribe = subscribeToAuthState((nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ user, initializing }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
