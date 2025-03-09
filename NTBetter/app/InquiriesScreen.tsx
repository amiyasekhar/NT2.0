// app/InquiriesScreen.tsx
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

interface GroupMember {
  name: string;
  social: string;
  photo?: string;
}

interface Inquiry {
  id: number;
  tableName: string;
  userBid: number;
  clubName: string;
  reservationDate: string;
  phoneNumber: string;
  creditCard: string;
  socialLinks: string[];
  photoUri?: string; // optional selfie or photo
  referredBy?: string;
  status: 'pending' | 'accepted';
  hostName: string;           // Host's name
  groupMembers: GroupMember[]; // People already at the table
  joinerName: string;         // The inquirer’s name
}

export default function InquiriesScreen() {
  const router = useRouter();

  // Example "inquiries" array with at least one accepted inquiry
  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: 1,
      tableName: 'VIP Table',
      userBid: 60,
      clubName: 'Club X',
      reservationDate: '2025-03-05',
      phoneNumber: '123-456-7890',
      creditCard: '**** 1234',
      socialLinks: ['instagram.com/myprofile', 'facebook.com/myprofile'],
      photoUri: 'https://example.com/mySelfie.jpg',
      referredBy: 'Alice',
      status: 'pending',
      hostName: 'Charles',
      groupMembers: [
        {
          name: 'Dave',
          social: 'instagram.com/daveParty',
          photo: 'https://example.com/davePhoto.jpg',
        },
        {
          name: 'Eve',
          social: 'instagram.com/eveClub',
        },
      ],
      joinerName: 'Bob',
    },
    {
      id: 2,
      tableName: 'Party Table',
      userBid: 35,
      clubName: 'Club Y',
      reservationDate: '2025-03-10',
      phoneNumber: '234-567-8901',
      creditCard: '**** 5678',
      socialLinks: [],
      photoUri: undefined,
      referredBy: 'Tom',
      status: 'accepted', // user is already on the table
      hostName: 'Helen',
      groupMembers: [
        {
          name: 'Frank',
          social: 'instagram.com/frankieFun',
          photo: 'https://example.com/frankie.jpg',
        },
      ],
      joinerName: 'Sarah',
    },
  ]);

  // Separate inquiries into "pending" vs. "accepted"
  const pendingInquiries = inquiries.filter((i) => i.status === 'pending');
  const acceptedInquiries = inquiries.filter((i) => i.status === 'accepted');

  // Make links clickable
  function openLink(url: string) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open link:', url);
    });
  }

  // Remove inquiry (only for pending)
  function handleRemoveInquiry(id: number) {
    setInquiries((prev) => prev.filter((inquiry) => inquiry.id !== id));
  }

  // View table in read-only mode
  function handleViewTable() {
    router.push('/JoiningInquiryScreen?viewOnly=true');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Inquiries</Text>

      {/* Pending Inquiries */}
      {pendingInquiries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Inquiries</Text>
          {pendingInquiries.map((inquiry) => (
            <View key={inquiry.id} style={styles.card}>
              <Text style={[styles.cardText, styles.cardTitle]}>
                {inquiry.tableName}
              </Text>
              <Text style={styles.cardText}>Host: {inquiry.hostName}</Text>
              <Text style={styles.cardText}>Your Name: {inquiry.joinerName}</Text>
              <Text style={styles.cardText}>Bid: ${inquiry.userBid}</Text>
              <Text style={styles.cardText}>Club: {inquiry.clubName}</Text>
              <Text style={styles.cardText}>Date: {inquiry.reservationDate}</Text>
              <Text style={styles.cardText}>Phone: {inquiry.phoneNumber}</Text>
              <Text style={styles.cardText}>Credit: {inquiry.creditCard}</Text>
              {inquiry.referredBy && (
                <Text style={styles.cardText}>Referred By: {inquiry.referredBy}</Text>
              )}

              {/* Group members */}
              {inquiry.groupMembers.length > 0 && (
                <View style={{ marginTop: 5 }}>
                  <Text style={styles.cardText}>Group Members:</Text>
                  {inquiry.groupMembers.map((member, idx) => (
                    <View key={idx} style={{ marginBottom: 5 }}>
                      <Text style={styles.cardText}>- {member.name}</Text>
                      <Text
                        style={[styles.cardText, styles.linkStyle]}
                        onPress={() => openLink(member.social)}
                      >
                        {member.social}
                      </Text>
                      {member.photo && (
                        <Image
                          source={{ uri: member.photo }}
                          style={styles.memberPhoto}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Joiner’s Social links */}
              {inquiry.socialLinks.length > 0 && (
                <View style={{ marginTop: 5 }}>
                  <Text style={styles.cardText}>Your Social Links:</Text>
                  {inquiry.socialLinks.map((link, i) => (
                    <Text
                      key={i}
                      style={[styles.cardText, styles.linkStyle]}
                      onPress={() => openLink(link)}
                    >
                      {link}
                    </Text>
                  ))}
                </View>
              )}

              {/* Photo preview if available */}
              {inquiry.photoUri && (
                <Image
                  source={{ uri: inquiry.photoUri }}
                  style={styles.photoPreview}
                  resizeMode="contain"
                />
              )}

              {/* Buttons row */}
              <View style={styles.buttonRow}>
                {/* Remove Inquiry Button for pending only */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveInquiry(inquiry.id)}
                >
                  <Text style={styles.removeButtonText}>Remove Inquiry</Text>
                </TouchableOpacity>

                {/* View Table Button */}
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={handleViewTable}
                >
                  <Text style={styles.viewButtonText}>View Table</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Accepted Inquiries */}
      {acceptedInquiries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accepted Inquiries</Text>
          {acceptedInquiries.map((inquiry) => (
            <View key={inquiry.id} style={styles.card}>
              <Text style={[styles.cardText, styles.cardTitle]}>
                {inquiry.tableName}
              </Text>
              <Text style={styles.cardText}>Host: {inquiry.hostName}</Text>
              <Text style={styles.cardText}>Your Name: {inquiry.joinerName}</Text>
              <Text style={styles.cardText}>Bid: ${inquiry.userBid}</Text>
              <Text style={styles.cardText}>Club: {inquiry.clubName}</Text>
              <Text style={styles.cardText}>Date: {inquiry.reservationDate}</Text>
              <Text style={styles.cardText}>Phone: {inquiry.phoneNumber}</Text>
              <Text style={styles.cardText}>Credit: {inquiry.creditCard}</Text>
              {inquiry.referredBy && (
                <Text style={styles.cardText}>Referred By: {inquiry.referredBy}</Text>
              )}

              {/* Group members */}
              {inquiry.groupMembers.length > 0 && (
                <View style={{ marginTop: 5 }}>
                  <Text style={styles.cardText}>Group Members:</Text>
                  {inquiry.groupMembers.map((member, idx) => (
                    <View key={idx} style={{ marginBottom: 5 }}>
                      <Text style={styles.cardText}>- {member.name}</Text>
                      <Text
                        style={[styles.cardText, styles.linkStyle]}
                        onPress={() => openLink(member.social)}
                      >
                        {member.social}
                      </Text>
                      {member.photo && (
                        <Image
                          source={{ uri: member.photo }}
                          style={styles.memberPhoto}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Joiner’s Social links */}
              {inquiry.socialLinks.length > 0 && (
                <View style={{ marginTop: 5 }}>
                  <Text style={styles.cardText}>Your Social Links:</Text>
                  {inquiry.socialLinks.map((link, i) => (
                    <Text
                      key={i}
                      style={[styles.cardText, styles.linkStyle]}
                      onPress={() => openLink(link)}
                    >
                      {link}
                    </Text>
                  ))}
                </View>
              )}

              {/* Photo preview if available */}
              {inquiry.photoUri && (
                <Image
                  source={{ uri: inquiry.photoUri }}
                  style={styles.photoPreview}
                  resizeMode="contain"
                />
              )}

              {/* Buttons row */}
              <View style={styles.buttonRow}>
                {/* Omit the Remove Inquiry button for accepted */}
                {/* Only the "View Table" button remains */}
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={handleViewTable}
                >
                  <Text style={styles.viewButtonText}>View Table</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* If no inquiries at all */}
      {inquiries.length === 0 && (
        <Text style={styles.noInquiriesText}>No inquiries found.</Text>
      )}
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
    fontFamily: 'VerahHumana-Bold',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.gold,
  },
  section: {
    width: '100%',
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: 'VerahHumana-Bold',
    fontSize: 20,
    color: Colors.gold,
    marginBottom: 10,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.backgroundColorBlack, // or Colors.black
    borderColor: Colors.gold,
    borderWidth: 2,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  cardText: {
    fontFamily: 'VerahHumana-Regular',
    color: Colors.gold,
    marginBottom: 5,
  },
  cardTitle: {
    fontFamily: 'VerahHumana-Bold',
    fontSize: 18,
    marginBottom: 5,
  },
  linkStyle: {
    textDecorationLine: 'underline',
  },
  memberPhoto: {
    width: 100,
    height: 80,
    borderColor: Colors.gold,
    borderWidth: 2,
    borderRadius: 8,
    marginTop: 5,
  },
  photoPreview: {
    width: '100%',
    height: 150,
    marginTop: 10,
    borderColor: Colors.gold,
    borderWidth: 2,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  removeButton: {
    backgroundColor: Colors.buttonColorGold,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  removeButtonText: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.black,
    fontSize: 16,
    textAlign: 'center',
  },
  viewButton: {
    backgroundColor: Colors.buttonColorGold,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  viewButtonText: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.black,
    fontSize: 16,
    textAlign: 'center',
  },
  noInquiriesText: {
    fontFamily: 'VerahHumana-Regular',
    color: Colors.gold,
    fontSize: 16,
    marginTop: 20,
  },
});