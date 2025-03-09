// app/TableRequestScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  Linking,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface TableFormData {
  tableName: string;
  hostName: string;         // NEW field for host's name
  clubName: string;
  reservationDate: string;
  availableSpots: string;
  minJoiningFee: string;
  hostSocialLinks: string[];
  hostPhoneNumber: string;
  hostBio: string;
  tableDetails: string;
  reservationConfirmationUri: string | null;
}

export default function TableRequestScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState<TableFormData>({
    tableName: '',
    hostName: '',
    clubName: '',
    reservationDate: '',
    availableSpots: '',
    minJoiningFee: '',
    hostSocialLinks: [],
    hostPhoneNumber: '',
    hostBio: '',
    tableDetails: '',
    reservationConfirmationUri: null,
  });

  const [currentLink, setCurrentLink] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (name: keyof TableFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit the form and navigate to the HostedTables screen
  const handleSubmit = () => {
    console.log('Submitted Table Request:', formData);
    // Perform any form validation or API calls here, then navigate:
    router.push('/HostedTablesScreen');
  };

  const handleAddSocialLink = () => {
    if (currentLink.trim()) {
      setFormData((prev) => ({
        ...prev,
        hostSocialLinks: [...prev.hostSocialLinks, currentLink.trim()],
      }));
      setCurrentLink('');
    }
  };

  const openLink = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    Linking.openURL(url).catch(() => {
      alert('Unable to open link: ' + url);
    });
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: false,
    });
    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      setFormData((prev) => ({ ...prev, reservationConfirmationUri: pickedUri }));
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      const isoString = selectedDate.toISOString().split('T')[0];
      setFormData((prev) => ({ ...prev, reservationDate: isoString }));
    }
    setShowDatePicker(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create a Table Request</Text>

        {/* Table Name */}
        <TextInput
          placeholder="Table Name"
          placeholderTextColor={Colors.greyDark}
          style={styles.input}
          onChangeText={(text) => handleChange('tableName', text)}
          value={formData.tableName}
        />

        {/* Host Name */}
        <TextInput
          placeholder="Host Name"
          placeholderTextColor={Colors.greyDark}
          style={styles.input}
          onChangeText={(text) => handleChange('hostName', text)}
          value={formData.hostName}
        />

        {/* Club Name */}
        <TextInput
          placeholder="Club Name"
          placeholderTextColor={Colors.greyDark}
          style={styles.input}
          onChangeText={(text) => handleChange('clubName', text)}
          value={formData.clubName}
        />

        {/* Reservation Date Picker */}
        <View style={styles.datePickerContainer}>
          <Text style={styles.label}>Reservation Date:</Text>
          <Text style={styles.dateText}>
            {formData.reservationDate || 'No date selected'}
          </Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerButtonText}>Pick a Date</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.reservationDate ? new Date(formData.reservationDate) : new Date()}
            mode="date"
            display="spinner"
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}

        {/* Available Spots */}
        <TextInput
          placeholder="Available Spots"
          placeholderTextColor={Colors.greyDark}
          style={styles.input}
          keyboardType="numeric"
          onChangeText={(text) => handleChange('availableSpots', text)}
          value={formData.availableSpots}
        />

        {/* Minimum Joining Fee */}
        <TextInput
          placeholder="Minimum Joining Fee US$"
          placeholderTextColor={Colors.greyDark}
          style={styles.input}
          keyboardType="numeric"
          onChangeText={(text) => handleChange('minJoiningFee', text)}
          value={formData.minJoiningFee}
        />

        {/* Host Social Links */}
        <View style={{ width: '100%', marginBottom: 10 }}>
          <Text style={styles.label}>Host Social Links (optional)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              placeholder="Enter a social link (e.g., instagram.com/host)"
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

          {/* Display host's social links */}
          <View style={{ marginTop: 15 }}>
            {formData.hostSocialLinks.map((link, index) => (
              <Text
                key={index}
                style={styles.linkText}
                onPress={() => openLink(link)}
              >
                {link}
              </Text>
            ))}
          </View>
        </View>

        {/* Host Phone Number */}
        <TextInput
          placeholder="Host Phone Number: + (Country Code)"
          placeholderTextColor={Colors.greyDark}
          style={styles.input}
          keyboardType="phone-pad"
          onChangeText={(text) => handleChange('hostPhoneNumber', text)}
          value={formData.hostPhoneNumber}
        />

        {/* Host Bio */}
        <TextInput
          placeholder="Host Bio (optional)"
          placeholderTextColor={Colors.greyDark}
          style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
          multiline
          onChangeText={(text) => handleChange('hostBio', text)}
          value={formData.hostBio}
        />

        {/* Table Details */}
        <TextInput
          placeholder="Table Details (optional)"
          placeholderTextColor={Colors.greyDark}
          style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
          multiline
          onChangeText={(text) => handleChange('tableDetails', text)}
          value={formData.tableDetails}
        />

        {/* Attach Reservation Confirmation */}
        <View style={styles.attachContainer}>
          <TouchableOpacity style={styles.customButton} onPress={handlePickImage}>
            <Text style={styles.customButtonText}>Attach Reservation Confirmation</Text>
          </TouchableOpacity>
        </View>

        {/* Preview the picked image if any */}
        {formData.reservationConfirmationUri && (
          <Image
            source={{ uri: formData.reservationConfirmationUri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        )}

        {/* Submit */}
        <TouchableOpacity style={styles.customButton} onPress={handleSubmit}>
          <Text style={styles.customButtonText}>Submit Table Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.backgroundColorBlack,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'VerahHumana-Bold',
    fontSize: 24,
    color: Colors.gold,
    marginBottom: 20,
    textAlign: 'center',
  },
  datePickerContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontFamily: 'VerahHumana-Regular',
    color: Colors.gold,
    marginBottom: 5,
    fontSize: 16,
  },
  dateText: {
    fontFamily: 'VerahHumana-Regular',
    color: Colors.gold,
    marginBottom: 10,
    fontSize: 16,
  },
  datePickerButton: {
    backgroundColor: Colors.buttonColorGold,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  datePickerButtonText: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.black,
    textAlign: 'center',
    fontSize: 16,
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
  attachContainer: {
    marginVertical: 10,
    width: '100%',
  },
  customButton: {
    backgroundColor: Colors.buttonColorGold,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  customButtonText: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.black,
    textAlign: 'center',
    fontSize: 16,
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
  linkText: {
    fontFamily: 'VerahHumana-Regular',
    color: Colors.gold,
    textDecorationLine: 'underline',
    marginBottom: 10,
    fontSize: 14,
  },
});