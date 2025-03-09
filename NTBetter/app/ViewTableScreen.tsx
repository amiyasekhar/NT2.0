// app/ViewTableScreen.tsx
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { Colors } from '@/constants/Colors';

// If your fonts are loaded globally (via _layout.tsx or other), you can just use them.
// Otherwise, ensure the fonts are loaded in your root layout.

interface GroupMember {
  name: string;
  social: string;
  photo?: string;
}

interface TableInfo {
  id: number;
  tableName: string;
  hostName: string;
  clubName: string;
  reservationDate: string;
  minJoiningFee: number;
  tableDetails: string;
  groupMembers: GroupMember[];
}

export default function ViewTableScreen() {
  // Hard-coded example data
  const tableData: TableInfo = {
    id: 1,
    tableName: 'VIP Table',
    hostName: 'Charles',
    clubName: 'Club X',
    reservationDate: '2025-03-10',
    minJoiningFee: 50,
    tableDetails: 'VIP Table near the DJ with bottle service. Great for up to 8 guests.',
    groupMembers: [
      {
        name: 'Alice',
        social: 'instagram.com/aliceParty',
        photo: 'https://example.com/alice.jpg',
      },
      {
        name: 'Bob',
        social: 'instagram.com/bobParty',
        photo: 'https://example.com/bob.jpg',
      },
    ],
  };

  // Helper to open clickable links
  function openLink(url: string) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open link:', url);
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>View Table</Text>

      {/* Basic Table Info */}
      <Text style={styles.label}>
        Table Name: <Text style={styles.value}>{tableData.tableName}</Text>
      </Text>
      <Text style={styles.label}>
        Host Name: <Text style={styles.value}>{tableData.hostName}</Text>
      </Text>
      <Text style={styles.label}>
        Club: <Text style={styles.value}>{tableData.clubName}</Text>
      </Text>
      <Text style={styles.label}>
        Date: <Text style={styles.value}>{tableData.reservationDate}</Text>
      </Text>
      <Text style={styles.label}>
        Min Joining Fee: <Text style={styles.value}>${tableData.minJoiningFee}</Text>
      </Text>
      <Text style={styles.label}>
        Details: <Text style={styles.value}>{tableData.tableDetails}</Text>
      </Text>

      {/* Group Members */}
      {tableData.groupMembers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subTitle}>Members on Table</Text>
          {tableData.groupMembers.map((member, i) => (
            <View key={i} style={styles.memberCard}>
              <Text style={styles.label}>
                Name: <Text style={styles.value}>{member.name}</Text>
              </Text>
              {member.photo && (
                <Image
                  source={{ uri: member.photo }}
                  style={styles.memberPhoto}
                  resizeMode="contain"
                />
              )}
              <TouchableOpacity onPress={() => openLink(member.social)}>
                <Text style={[styles.linkText, { textDecorationLine: 'underline' }]}>
                  {member.social}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundColorBlack,
    padding: 20,
    alignItems: 'flex-start', // or 'center'
  },
  title: {
    fontFamily: 'VerahHumana-Bold',
    fontSize: 24,
    color: Colors.gold,
    marginBottom: 20,
    textAlign: 'left',
  },
  label: {
    fontFamily: 'VerahHumana-Regular',
    color: Colors.gold,
    fontSize: 16,
    marginBottom: 4,
  },
  value: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.gold,
  },
  section: {
    width: '100%',
    marginTop: 20,
  },
  subTitle: {
    fontFamily: 'VerahHumana-Bold',
    fontSize: 18,
    color: Colors.gold,
    marginBottom: 10,
  },
  memberCard: {
    borderColor: Colors.gold,
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  memberPhoto: {
    width: '100%',
    height: 120,
    borderColor: Colors.gold,
    borderWidth: 2,
    borderRadius: 8,
    marginVertical: 5,
  },
  linkText: {
    fontFamily: 'VerahHumana-Regular',
    color: Colors.gold,
    fontSize: 14,
  },
});