// app/(auth)/_layout.tsx
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export default function AuthLayout() {
  const [fontsLoaded] = useFonts({
    'VerahHumana-Regular': require('../../assets/fonts/VerahHumana-Regular.ttf'),
    'VerahHumana-Bold': require('../../assets/fonts/VerahHumana-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // or a loading component
  }

  // Just wrap everything in a Stack; Expo Router will auto-discover screens in (auth)
  return (
    <>
      <Stack />
      <StatusBar style="auto" />
    </>
  );
}