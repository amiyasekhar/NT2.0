import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

// A placeholder function to check if user is logged in.
// Replace with your real auth-check logic (e.g., check AsyncStorage or an API).
async function isUserLoggedIn() {
  // For demonstration, we pretend user is not logged in
  return false; // or true if they are logged in
}

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loggedIn = await isUserLoggedIn();

      if (!loggedIn) {
        // If not logged in, redirect to your OTP login screen
        router.replace('/(auth)/login');
      } else {
        // If logged in, go straight to your main HomeScreen
        router.replace('/HomeScreen');
      }

      setLoading(false);
    })();
  }, []);

  if (loading) {
    // While checking auth, show a loading indicator or splash
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Checking login status...</Text>
      </View>
    );
  }

  // If we’re done checking, we return null because we’ve already replaced the route.
  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundColorBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'VerahHumana-Regular',
    color: Colors.gold,
    marginTop: 10,
    fontSize: 16,
  },
});