
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Linking } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import SplashScreen from './splash';
import { useUserStore } from '@/store/userStore';
import { useArenaStore } from '@/store/arenaStore';
import { authService, UserProfile, api, getToken } from '@/services/api';
// import { useKeepAwake } from 'expo-keep-awake'; // Replaced with dynamic import
import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications'; // Removed to prevent crash
import { registerForPushNotificationsAsync, getNotificationsModule } from '@/services/notificationService';
import userService from '@/services/api/userService';

// Create authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => { },
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export default function RootLayout() {
  // Explicitly manage KeepAwake to suppress emulator errors
  useEffect(() => {
    if (Device.isDevice) {
      import('expo-keep-awake').then(({ activateKeepAwakeAsync }) => {
        activateKeepAwakeAsync().catch(() => {
          // Ignore keep-awake errors on emulator
        });
      });
    }
  }, []);

  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const { user, setUser } = useUserStore();
  const router = useRouter();
  const segments = useSegments();

  // Notification refs
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);



  // Global Error Handling
  // Global Error Handling & Auth Persistence
  useEffect(() => {
    // Auto-logout on 401 (Not Authorized)
    api.setUnauthorizedCallback(() => {
      console.log('Session expired, logging out...');
      const { logout } = useUserStore.getState();
      logout();
      router.replace('/auth/login');
    });

    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          // We have a token, restore session state
          // The user store might already be hydrated, but we need to sync local isAuthenticated state
          setIsAuthenticated(true);

          // Optionally refresh profile in background
          // authService.getMe().then(res => {
          //     if (res.data) setUser(res.data);
          // }).catch(() => {});
        }
      } catch (e) {
        console.log('Failed to restore auth session');
      } finally {
        setIsAuthChecked(true);
      }
    };

    checkAuth();

    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Boss Room Deep Link Handler - receives battle results
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log('[DeepLink] Received:', url);

      if (url.startsWith('utopia://battle-result')) {
        handleBattleResult(url);
      }
    };

    const handleBattleResult = (url: string) => {
      try {
        const params = new URLSearchParams(url.split('?')[1]);

        const result = {
          won: params.get('won') === 'true',
          myScore: parseInt(params.get('myScore') || '0', 10),
          opponentScore: parseInt(params.get('opponentScore') || '0', 10),
          duration: parseInt(params.get('duration') || '0', 10),
          xpEarned: parseInt(params.get('xpEarned') || '0', 10),
          coinsEarned: parseInt(params.get('coinsEarned') || '0', 10),
          wasClutch: params.get('wasClutch') === 'true',
          isRevenge: params.get('isRevenge') === 'true',
          streakMultiplier: parseFloat(params.get('streakMultiplier') || '1'),
          sessionId: params.get('sessionId') || '',
          challengeId: params.get('challengeId') || '',
        };

        console.log('[DeepLink] Battle result:', result);

        // Navigate to results screen with the battle data
        router.push({
          pathname: '/arena/results' as any,
          params: {
            won: result.won ? 'true' : 'false',
            myScore: result.myScore.toString(),
            opponentScore: result.opponentScore.toString(),
            xpEarned: result.xpEarned.toString(),
            coinsEarned: result.coinsEarned.toString(),
            wasClutch: result.wasClutch ? 'true' : 'false',
            isRevenge: result.isRevenge ? 'true' : 'false',
          },
        });
      } catch (e) {
        console.error('[DeepLink] Failed to parse battle result:', e);
      }
    };

    // Listen for incoming deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then(url => {
      if (url && url.startsWith('utopia://battle-result')) {
        handleBattleResult(url);
      }
    });

    return () => subscription.remove();
  }, [router]);

  // Notification Setup
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token && isAuthenticated) {
        // Send token to backend
        userService.updatePushToken(token).catch(err =>
          console.error('Failed to update push token:', err)
        );

        if (token.includes('TestToken')) {
          alert('Note: Using Mock Push Token (Expo Go limitation). Notifications will appear as sent in history but wont arrive on device.');
        }
      }
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    const Notifications = getNotificationsModule();
    if (Notifications) {
      try {
        notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
          console.log('Notification Received:', notification);
        });
      } catch (e) {
        console.log('Notification listener not supported in this environment');
      }

      // This listener is fired whenever a user taps on or interacts with a notification
      try {
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
          console.log('Notification Interaction:', response);
          // TODO: Handle deep linking based on notification data
        });
      } catch (e) {
        console.log('Response listener not supported in this environment');
      }
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated]); // Re-run when auth state changes to sync token

  useEffect(() => {
    if (showSplash || !isAuthChecked) return;

    const inAuthGroup = segments[0] === 'auth';
    console.log(`[RootLayout] Check: Auth=${isAuthenticated}, Segment=${segments[0]}, inAuthGroup=${inAuthGroup}`);

    if (!isAuthenticated && !inAuthGroup) {
      console.log('[RootLayout] Redirecting to Login (Not Authenticated)');
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      console.log('[RootLayout] Redirecting to Home (Already Authenticated)');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, showSplash, isAuthChecked]);

  const login = async () => {
    try {
      const response = await authService.getMe();
      if (response.data) {
        setUser(response.data);
        setIsAuthenticated(true);

        // Register for push notifications on login
        const token = await registerForPushNotificationsAsync();
        if (token) {
          userService.updatePushToken(token).catch(console.error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile', error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {showSplash ? (
        <SplashScreen />
      ) : (
        <Stack screenOptions={{ headerShown: false }} />
      )}
    </AuthContext.Provider>
  );
}
