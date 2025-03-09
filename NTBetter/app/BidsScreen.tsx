// app/BidsScreen.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import { Colors } from '@/constants/Colors';

// Extended interface with name and optional selfie/photo
interface Bid {
  id: number;
  userName: string;         // The bidder's name
  userSocials: string;      // This will be treated as a link
  bidAmount: number;
  referredBy: string;
  phoneNumber: string;
  creditCard: string;
  photoUri?: string;        // optional selfie or photo
}

export default function BidsScreen() {
  const [bids, setBids] = useState<Bid[]>([
    {
      id: 1,
      userName: 'Alice',
      userSocials: 'instagram.com/bidderOne',
      bidAmount: 30,
      referredBy: 'Alice',
      phoneNumber: '123-456-7890',
      creditCard: '**** 1234',
      photoUri: 'https://example.com/bidderOneSelfie.jpg',
    },
    {
      id: 2,
      userName: 'Bob',
      userSocials: 'facebook.com/bidderTwo',
      bidAmount: 25,
      referredBy: 'Bob',
      phoneNumber: '234-567-8901',
      creditCard: '**** 5678',
      // No photoUri for demonstration
    },
  ]);

  // Convert a userSocials string into a clickable link
  const openLink = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    Linking.openURL(url).catch(() => {
      alert('Unable to open link: ' + url);
    });
  };

  const handleApprove = (bidId: number) => {
    setBids((prev) => prev.filter((bid) => bid.id !== bidId));
  };

  const handleDeny = (bidId: number) => {
    setBids((prev) => prev.filter((bid) => bid.id !== bidId));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bids Received</Text>
      {bids.map((bid) => (
        <View key={bid.id} style={styles.card}>
          {/* Show the bidder's name */}
          <Text style={styles.textStyle}>Name: {bid.userName}</Text>

          {/* userSocials is a link */}
          <Text
            style={[styles.textStyle, styles.linkStyle]}
            onPress={() => openLink(bid.userSocials)}
          >
            {bid.userSocials}
          </Text>
          <Text style={styles.textStyle}>Bid: ${bid.bidAmount}</Text>
          <Text style={styles.textStyle}>Referred By: {bid.referredBy}</Text>
          <Text style={styles.textStyle}>Phone: {bid.phoneNumber}</Text>
          <Text style={styles.textStyle}>Credit: {bid.creditCard}</Text>

          {/* If there's a selfie/photo, show it */}
          {bid.photoUri && (
            <Image
              source={{ uri: bid.photoUri }}
              style={styles.bidderPhoto}
              resizeMode="contain"
            />
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.buttonCommon, styles.approveButton]}
              onPress={() => handleApprove(bid.id)}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonCommon, styles.denyButton]}
              onPress={() => handleDeny(bid.id)}
            >
              <Text style={styles.buttonText}>Deny</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: Colors.backgroundColorBlack, // or Colors.black
  },
  title: {
    fontFamily: 'VerahHumana-Bold',    // Use your bold font
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.gold,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.backgroundColorBlack, // or Colors.black
    borderColor: Colors.gold,
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderRightWidth: 5,
    borderLeftWidth: 5,
    borderTopWidth: 5,
    borderBottomWidth: 5,
  },
  textStyle: {
    fontFamily: 'VerahHumana-Regular', // Use your regular font
    color: Colors.gold,
    marginBottom: 5,
  },
  linkStyle: {
    textDecorationLine: 'underline',
  },
  bidderPhoto: {
    width: '100%',
    height: 150,
    marginTop: 10,
    borderColor: Colors.gold,
    borderWidth: 2,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  buttonCommon: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  approveButton: {
    backgroundColor: Colors.green,
  },
  denyButton: {
    backgroundColor: Colors.red,
  },
  buttonText: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.gold,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});