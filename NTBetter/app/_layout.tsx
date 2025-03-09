// app/_layout.tsx
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme'; // optional if you want color scheme logic

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme(); // optional

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'VerahHumana-Regular': require('../assets/fonts/VerahHumana-Regular.ttf'),
    'VerahHumana-Bold': require('../assets/fonts/VerahHumana-Bold.ttf'),
  });

  // Hide splash screen once fonts are ready
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // or a loading view
  }

  // Return an Expo Router <Stack>, with NO <Stack.Screen> lines
  return (
    <Stack>
      <StatusBar style="auto" />
    </Stack>
  );
}