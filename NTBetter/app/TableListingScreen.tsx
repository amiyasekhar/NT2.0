// app/TableListingScreen.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

interface TableData {
  id: number;
  tableName: string;
  minJoiningFee: number;
  clubName: string;
  reservationDate: string;
}

export default function TableListingScreen() {
  const router = useRouter();

  const [tables] = useState<TableData[]>([
    {
      id: 1,
      tableName: 'VIP Table',
      minJoiningFee: 50,
      clubName: 'Club X',
      reservationDate: '2025-03-05',
    },
    {
      id: 2,
      tableName: 'Party Table',
      minJoiningFee: 30,
      clubName: 'Club Y',
      reservationDate: '2025-03-05',
    },
  ]);

  function handleInquire(table: TableData) {
    // Pass table data as query params
    router.push({
      pathname: '/JoiningInquiryScreen',
      params: {
        tableName: table.tableName,
        minJoiningFee: table.minJoiningFee,
        clubName: table.clubName,
        reservationDate: table.reservationDate,
      },
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Table Listings</Text>
      {tables.map((table) => (
        <View key={table.id} style={styles.card}>
          <Text style={[styles.cardText, styles.cardTitle]}>{table.tableName}</Text>
          <Text style={styles.cardText}>Min Fee: ${table.minJoiningFee}</Text>
          <Text style={styles.cardText}>Club: {table.clubName}</Text>
          <Text style={styles.cardText}>Date: {table.reservationDate}</Text>

          <TouchableOpacity
            style={styles.inquireButton}
            onPress={() => handleInquire(table)}
          >
            <Text style={styles.inquireButtonText}>Inquire/Join</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.backgroundColorBlack, // or Colors.black
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.gold,
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: Colors.backgroundColorBlack,
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
  inquireButton: {
    backgroundColor: Colors.buttonColorGold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  inquireButtonText: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.black,
    fontSize: 16,
    textAlign: 'center',
  },
});