import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

export default function App() {
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [error, setError] = useState('');

  async function pickImage() {
    setError('');

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 1
      });

      if (!result.canceled) {
        setPhoto(result.assets[0]);
      }
    } catch {setError('Nie udało się wczytać zdjęcia.');}
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>AI Photo Editor</Text>
          <Button title="Prześlij zdjęcie" onPress={pickImage} />
          <Text style={styles.info}> {error || (photo ? `Wybrano: ${photo.fileName ?? 'zdjęcie'}` : '')} </Text>
        </View>
      </SafeAreaView>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    position: 'absolute',
    top: 16,
    left: 16,
    fontSize: 22,
    fontWeight: 'bold'
  },
  info: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    textAlign: 'center'
  }});