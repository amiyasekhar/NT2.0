// app/HomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Clear any stored tokens or auth state here, if necessary
    // Then navigate or replace to your login screen route
    router.replace('/(auth)/login'); 
    // or `router.replace('/login')` if your login screen is `app/login.tsx`
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Table Split</Text>
      <Text style={styles.subtitle}>
        Your platform to host or join a table at your favorite club.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.customButton}
          onPress={() => router.push('/TableRequestScreen')}
        >
          <Text style={styles.customButtonText}>Host a Table</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.customButton}
          onPress={() => router.push('/TableListingScreen')}
        >
          <Text style={styles.customButtonText}>Join a Table</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons for viewing hosted vs. inquired tables */}
      <View style={[styles.buttonContainer, { marginTop: 20 }]}>
        <TouchableOpacity
          style={styles.customButton}
          onPress={() => router.push('/HostedTablesScreen')}
        >
          <Text style={styles.customButtonText}>View Hosted Tables</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.customButton}
          onPress={() => router.push('/InquiriesScreen')}
        >
          <Text style={styles.customButtonText}>View Inquired Tables</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.customButton, { marginTop: 40 }]}
        onPress={handleLogout}
      >
        <Text style={styles.customButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColorBlack, // black background
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'VerahHumana-Bold',   // Bold font
    color: Colors.gold,
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'VerahHumana-Regular',  // Regular font
    color: Colors.gold,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  customButton: {
    backgroundColor: Colors.buttonColorGold,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  customButtonText: {
    fontFamily: 'VerahHumana-Bold',   // Bold font
    color: Colors.black,              // black text
    fontSize: 16,
    textAlign: 'center',
  },
});