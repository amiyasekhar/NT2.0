// app/(auth)/login.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

interface CountryData {
  name: string;
  phoneNumberCode: string;
  isoCode: string;
}

export default function LoginScreen() {
  const router = useRouter();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [allCountries, setAllCountries] = useState<CountryData[]>([]);
  const [loadingCodes, setLoadingCodes] = useState<boolean>(true);

  // The selected code (digits only, no +). For example, '1' for USA.
  const [selectedCode, setSelectedCode] = useState<string>('1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  // Fetch country codes from your Node server
  useEffect(() => {
    (async function fetchCodes() {
      try {
        // Replace with your local machine’s IP address if testing on real device
        const response = await fetch('http://172.20.12.66:3000/auth/getCountryCodes');
        const json = await response.json();
        if (json.status && Array.isArray(json.data)) {
          setAllCountries(json.data);
        }
      } catch (err) {
        console.log('Error fetching country codes:', err);
      } finally {
        setLoadingCodes(false);
      }
    })();
  }, []);

  // Request OTP
  const handleRequestOtp = () => {
    const plusPrefixed = selectedCode.startsWith('+')
      ? selectedCode
      : `+${selectedCode}`;
    const fullNumber = plusPrefixed + phoneNumber;
    console.log('Requesting OTP for:', fullNumber);
    // TODO: Call your backend with fullNumber
    setStep('otp');
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    console.log('Verifying OTP:', otp);
    // TODO: Call your backend to verify the OTP
    router.replace('/HomeScreen');
  };

  if (loadingCodes) {
    return (
      <View style={styles.containerCentered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading country codes...</Text>
      </View>
    );
  }

  // Renders the phone step
  if (step === 'phone') {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.containerBetween}>
          {/* Top portion */}
          <View>
            <Text style={styles.title}>Login</Text>

            <View style={styles.phoneRow}>
              {/* Country code picker container */}
              <View style={styles.countryCodeContainer}>
                <Picker
                  selectedValue={selectedCode}
                  onValueChange={(val) => setSelectedCode(val)}
                  style={styles.countryCodePicker}
                  itemStyle={styles.pickerItem}
                  mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
                  dropdownIconColor={Colors.gold}
                >
                  {allCountries.map((c) => {
                    const displayCode = c.phoneNumberCode.startsWith('+')
                      ? c.phoneNumberCode
                      : `+${c.phoneNumberCode}`;
                    const label = `${displayCode} (${c.name})`;
                    return (
                      <Picker.Item
                        key={c.isoCode}
                        label={label}
                        value={c.phoneNumberCode.replace('+', '')}
                      />
                    );
                  })}
                </Picker>
              </View>

              {/* Phone input container */}
              <View style={styles.phoneNumberContainer}>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone number"
                  placeholderTextColor={Colors.greyDark}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>
          </View>

          {/* Bottom portion: Request OTP button */}
          <TouchableOpacity style={styles.button} onPress={handleRequestOtp}>
            <Text style={styles.buttonText}>Request OTP</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  // Renders the OTP step
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.containerBetween}>
        <View>
          <Text style={styles.title}>Enter the OTP</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="123456"
            placeholderTextColor={Colors.greyDark}
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // For loading spinner screen
  containerCentered: {
    flex: 1,
    backgroundColor: Colors.backgroundColorBlack,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // For phone/OTP steps: push top content up and button to the bottom
  containerBetween: {
    flex: 1,
    backgroundColor: Colors.backgroundColorBlack,
    padding: 20,
    justifyContent: 'space-between',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.gold,
    textAlign: 'center',
    fontFamily: 'VerahHumana-Regular',
    fontSize: 16,
  },
  title: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.gold,
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // iOS might clip the picker if we don't have zIndex:
    zIndex: 9999,
  },
  // Make the picker box wider
  countryCodeContainer: {
    width: 160, // Expand to 160 so user can see more text
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: Colors.backgroundColorBlack,
  },
  countryCodePicker: {
    width: '100%',
    height: 50,
    color: Colors.gold,
    fontFamily: 'VerahHumana-Regular',
  },
  pickerItem: {
    fontFamily: 'VerahHumana-Regular',
    fontSize: 16,
    color: Colors.gold,
  },
  phoneNumberContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: 5,
    backgroundColor: Colors.backgroundColorBlack,
  },
  phoneInput: {
    fontFamily: 'VerahHumana-Regular',
    color: Colors.gold,
    padding: 10,
    fontSize: 16,
  },
  otpInput: {
    fontFamily: 'VerahHumana-Regular',
    color: Colors.gold,
    borderColor: Colors.gold,
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.buttonColorGold,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  buttonText: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.black,
    fontSize: 16,
  },
});