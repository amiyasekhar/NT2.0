// app/+not-found.tsx (recommended file name for a 404 route)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oops! Page not found.</Text>
      <Link href="/" style={styles.link}>
        Go Home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // dark background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    color: '#0af',
  },
});