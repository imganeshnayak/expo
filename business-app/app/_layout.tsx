import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Belanosima_400Regular, Belanosima_600SemiBold, Belanosima_700Bold } from '@expo-google-fonts/belanosima';
import { EricaOne_400Regular } from '@expo-google-fonts/erica-one';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import CustomSplashScreen from './splash';

SplashScreen.preventAutoHideAsync();

import { useAuthStore } from '../store/authStore';

// ... imports ...

export default function RootLayout() {
  const loadUser = useAuthStore((state) => state.loadUser);
  const theme = useAppTheme();
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [loaded, error] = useFonts({
    Belanosima: Belanosima_400Regular,
    'Belanosima-SemiBold': Belanosima_600SemiBold,
    'Belanosima-Bold': Belanosima_700Bold,
    EricaOne: EricaOne_400Regular,
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowCustomSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  if (showCustomSplash) {
    return <CustomSplashScreen />;
  }

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
