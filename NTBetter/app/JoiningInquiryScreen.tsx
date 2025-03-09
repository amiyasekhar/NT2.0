// app/JoiningInquiryScreen.tsx
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';

// Hard-coded table/host info for demonstration
const DEFAULT_HOST_NAME = 'Charles'; // Host's name
const DEFAULT_HOST_PHOTO = 'https://example.com/hostPicture.jpg';
const DEFAULT_HOST_SOCIALS = ['instagram.com/host', 'facebook.com/hostProfile'];
const DEFAULT_TABLE_DETAILS = 'VIP Table near the DJ with bottle service.';
const DEFAULT_GROUP_MEMBERS = [
  { name: 'Alice', social: 'instagram.com/member1', photo: 'https://example.com/member1.jpg' },
  { name: 'Bob', social: 'instagram.com/member2', photo: 'https://example.com/member2.jpg' },
];
const DEFAULT_TABLE_NAME = 'VIP Table';
const DEFAULT_MIN_JOINING_FEE = 50;
const DEFAULT_CLUB_NAME = 'Club X';
const DEFAULT_RESERVATION_DATE = '2025-03-10';

export default function JoiningInquiryScreen() {
  const router = useRouter();
  // Check if we are in view-only mode
  const { viewOnly } = useLocalSearchParams();
  const isViewOnly = viewOnly === 'true';

  // Table info
  const safeHostName = DEFAULT_HOST_NAME;
  const safeHostPhoto = DEFAULT_HOST_PHOTO;
  const safeHostSocials = DEFAULT_HOST_SOCIALS;
  const safeTableName = DEFAULT_TABLE_NAME;
  const safeMinFee = DEFAULT_MIN_JOINING_FEE;
  const safeClubName = DEFAULT_CLUB_NAME;
  const safeDate = DEFAULT_RESERVATION_DATE;
  const safeTableDetails = DEFAULT_TABLE_DETAILS;
  const groupMembers = DEFAULT_GROUP_MEMBERS;

  // Initialize form state (only relevant if not view-only)
  const [formData, setFormData] = useState({
    creditCard: '',
    bidAmount: safeMinFee.toString(),
    userSocialLinks: [] as string[],
    referredBy: '',
    phoneNumber: '',
  });

  // For the user’s social link input
  const [currentLink, setCurrentLink] = useState('');
  // For the user’s selfie/photo
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Update form data
  function handleChange(name: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Add a new social link for the user
  function handleAddSocialLink() {
    if (currentLink.trim()) {
      setFormData((prev) => ({
        ...prev,
        userSocialLinks: [...prev.userSocialLinks, currentLink.trim()],
      }));
      setCurrentLink('');
    }
  }

  // Make links clickable
  function openLink(url: string) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open link:', url);
    });
  }

  // Pick a selfie/photo from user’s library
  async function handlePickImage() {
    if (isViewOnly) return; // Do nothing in view-only mode
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissions Required', 'Camera roll permissions are required to upload a selfie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: false,
    });

    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      setPhotoUri(pickedUri);
    }
  }

  // Submit the form
  function handleSubmit() {
    if (isViewOnly) {
      // If in view-only mode, do nothing or just go back
      router.back();
      return;
    }
    const userBid = Number(formData.bidAmount);
    if (userBid < safeMinFee) {
      Alert.alert('Invalid Bid', `Bid must be at least $${safeMinFee}`);
      return;
    }
    console.log('Submitted Inquiry:', {
      ...formData,
      selfiePhoto: photoUri,
    });
    router.push('/InquiriesScreen');
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Table Name */}
        <Text style={styles.title}>Join {safeTableName}</Text>

        {/* Host Info */}
        <View style={styles.section}>
          <Text style={styles.subTitle}>Host Info</Text>
          <Text style={styles.label}>
            Host Name: <Text style={styles.value}>{safeHostName}</Text>
          </Text>

          {/* Host Photo */}
          {safeHostPhoto && (
            <Image
              source={{ uri: safeHostPhoto }}
              style={styles.hostPhoto}
              resizeMode="contain"
            />
          )}

          {/* Host Social Links */}
          {safeHostSocials.length > 0 && (
            <View style={{ marginTop: 5 }}>
              <Text style={styles.label}>Host Social Links:</Text>
              {safeHostSocials.map((link, i) => (
                <Text
                  key={i}
                  style={[styles.linkText, { textDecorationLine: 'underline' }]}
                  onPress={() => openLink(link)}
                >
                  {link}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Table Details */}
        <View style={styles.section}>
          <Text style={styles.subTitle}>Table Details</Text>
          <Text style={[styles.label, { marginBottom: 5 }]}>
            {safeTableDetails}
          </Text>
        </View>

        {/* Group Members */}
        {groupMembers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subTitle}>Members on Table</Text>
            {groupMembers.map((member, i) => (
              <View key={i} style={{ marginBottom: 15 }}>
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
                {member.social && (
                  <Text
                    style={[styles.linkText, { textDecorationLine: 'underline' }]}
                    onPress={() => openLink(member.social)}
                  >
                    {member.social}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Basic Info */}
        <Text style={styles.label}>
          Club: <Text style={styles.value}>{safeClubName}</Text>
        </Text>
        <Text style={styles.label}>
          Minimum Joining Fee: <Text style={styles.value}>${safeMinFee}</Text>
        </Text>
        <Text style={styles.label}>
          Date: <Text style={styles.value}>{safeDate}</Text>
        </Text>

        {/* Only show personal form if not viewOnly */}
        {!isViewOnly && (
          <>
            {/* Credit Card Info */}
            <TextInput
              placeholder="Credit Card Info"
              placeholderTextColor={Colors.greyDark}
              style={styles.input}
              onChangeText={(text) => handleChange('creditCard', text)}
              value={formData.creditCard}
            />

            {/* Bid Amount */}
            <TextInput
              placeholder="Bid Amount"
              placeholderTextColor={Colors.greyDark}
              style={styles.input}
              keyboardType="numeric"
              onChangeText={(text) => handleChange('bidAmount', text)}
              value={formData.bidAmount}
            />

            {/* The user's own social links */}
            <View style={{ width: '100%', marginBottom: 10 }}>
              <Text style={styles.label}>Your Social Links (optional)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  placeholder="Enter your social link (e.g., instagram.com/you)"
                  placeholderTextColor={Colors.greyDark}
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  onChangeText={setCurrentLink}
                  value={currentLink}
                />
                <TouchableOpacity
                  style={[styles.customButton, { marginLeft: 10, alignSelf: 'auto' }]}
                  onPress={handleAddSocialLink}
                >
                  <Text style={styles.customButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Display user's clickable links */}
              <View style={{ marginTop: 10 }}>
                {formData.userSocialLinks.map((link, index) => (
                  <Text
                    key={index}
                    style={[styles.linkText, { textDecorationLine: 'underline' }]}
                    onPress={() => openLink(link)}
                  >
                    {link}
                  </Text>
                ))}
              </View>
            </View>

            {/* Referred By */}
            <TextInput
              placeholder="Referred By"
              placeholderTextColor={Colors.greyDark}
              style={styles.input}
              onChangeText={(text) => handleChange('referredBy', text)}
              value={formData.referredBy}
            />

            {/* Phone Number */}
            <TextInput
              placeholder="Your Phone Number"
              placeholderTextColor={Colors.greyDark}
              style={styles.input}
              keyboardType="phone-pad"
              onChangeText={(text) => handleChange('phoneNumber', text)}
              value={formData.phoneNumber}
            />

            {/* Selfie/Photo Upload */}
            <View style={styles.attachContainer}>
              <TouchableOpacity style={styles.customButton} onPress={handlePickImage}>
                <Text style={styles.customButtonText}>Attach Selfie/Photo</Text>
              </TouchableOpacity>
            </View>
            {photoUri && (
              <Image
                source={{ uri: photoUri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          </>
        )}

        {/* Submit Button (if viewOnly, we do minimal action) */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {isViewOnly ? 'Back' : 'Submit Inquiry'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Style template: dark background, gold text, thick gold borders, custom button
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.backgroundColorBlack,
    padding: 20,
    alignItems: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 15,
  },
  subTitle: {
    fontFamily: 'VerahHumana-Bold',
    fontSize: 18,
    color: Colors.gold,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'VerahHumana-Bold',
    fontSize: 24,
    color: Colors.gold,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontFamily: 'VerahHumana-Regular',
    color: Colors.gold,
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'left',
    width: '100%',
  },
  value: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.gold,
  },
  linkText: {
    fontFamily: 'VerahHumana-Regular',
    color: Colors.gold,
    marginBottom: 5,
  },
  hostPhoto: {
    width: '100%',
    height: 150,
    borderColor: Colors.gold,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 10,
  },
  memberPhoto: {
    width: '100%',
    height: 120,
    borderColor: Colors.gold,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 5,
  },
  input: {
    fontFamily: 'VerahHumana-Regular',
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: Colors.gold,
    borderColor: Colors.gold,
    borderWidth: 2,
  },
  customButton: {
    backgroundColor: Colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  customButtonText: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.black,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  attachContainer: {
    marginVertical: 10,
    width: '100%',
    alignItems: 'flex-start',
  },
  previewImage: {
    width: 200,
    height: 150,
    marginBottom: 10,
    alignSelf: 'center',
    borderColor: Colors.gold,
    borderWidth: 2,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: Colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.gold,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  submitButtonText: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.black,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});