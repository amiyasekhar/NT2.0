// app/HostedTablesScreen.tsx
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

interface HostedTable {
  id: number;
  tableName: string;
  clubName: string;
  reservationDate: string;
  minJoiningFee: number;
  tablePhotoUri?: string; // optional table photo
}

export default function HostedTablesScreen() {
  const router = useRouter();

  // Example data for demonstration
  const [hostedTables, setHostedTables] = useState<HostedTable[]>([
    {
      id: 1,
      tableName: 'VIP Table',
      clubName: 'Club X',
      reservationDate: '2025-03-05',
      minJoiningFee: 50,
      tablePhotoUri: 'https://example.com/viptable.jpg',
    },
    {
      id: 2,
      tableName: 'Party Table',
      clubName: 'Club Y',
      reservationDate: '2025-03-10',
      minJoiningFee: 30,
      // no photo for demonstration
    },
  ]);

  // Remove a hosted table from the list
  const handleRemoveTable = (tableId: number) => {
    setHostedTables((prev) => prev.filter((table) => table.id !== tableId));
  };

  // Navigate to the Bids screen (or any screen) to manage bids
  const handleManageBids = (tableId: number) => {
    // e.g. router.push(`/BidsScreen?tableId=${tableId}`);
    router.push('/BidsScreen');
  };

  // Navigate to ViewTableScreen to see table details
  const handleViewTable = (tableId: number) => {
    // e.g. router.push(`/ViewTableScreen?tableId=${tableId}`);
    router.push('/ViewTableScreen');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Hosted Tables</Text>

      {hostedTables.length === 0 ? (
        <Text style={styles.noTablesText}>You are not hosting any tables.</Text>
      ) : (
        hostedTables.map((table) => (
          <View key={table.id} style={styles.card}>
            <Text style={styles.cardText}>Table Name: {table.tableName}</Text>
            <Text style={styles.cardText}>Club: {table.clubName}</Text>
            <Text style={styles.cardText}>Date: {table.reservationDate}</Text>
            <Text style={styles.cardText}>Min Joining Fee: ${table.minJoiningFee}</Text>

            {/* If there's a photo, show it */}
            {table.tablePhotoUri && (
              <Image
                source={{ uri: table.tablePhotoUri }}
                style={styles.tablePhoto}
                resizeMode="contain"
              />
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => handleManageBids(table.id)}
              >
                <Text style={styles.buttonText}>Manage Bids</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveTable(table.id)}
              >
                <Text style={styles.buttonText}>Remove Table</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.viewTableButton}
                onPress={() => handleViewTable(table.id)}
              >
                <Text style={styles.buttonText}>View Table</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
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
    color: Colors.gold,
    marginBottom: 20,
    textAlign: 'center',
  },
  noTablesText: {
    fontFamily: 'VerahHumana-Regular',
    color: Colors.gold,
    fontSize: 16,
    marginTop: 20,
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
  tablePhoto: {
    width: '100%',
    height: 150,
    marginTop: 10,
    borderColor: Colors.gold,
    borderWidth: 2,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',       // <-- Allows wrapping to next line
    marginTop: 10,
    justifyContent: 'center',
  },
  manageButton: {
    backgroundColor: Colors.buttonColorGold,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 5,              // <-- A bit of margin on each button
  },
  removeButton: {
    backgroundColor: Colors.red,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 5,              // <-- A bit of margin on each button
  },
  viewTableButton: {
    backgroundColor: Colors.buttonColorGold,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 5,              // <-- A bit of margin on each button
  },
  buttonText: {
    fontFamily: 'VerahHumana-Bold',
    color: Colors.black,
    fontSize: 16,
    textAlign: 'center',
  },
});