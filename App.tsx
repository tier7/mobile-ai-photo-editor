import { useRef, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { restyle, Step, WavespeedError } from './src/api/wavespeed';
import { GenerationStatus } from './src/components/GenerationStatus';
import { outputSize } from './src/utils/image';

export default function App() {
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [error, setError] = useState('');
  const [prompt, setPrompt] = useState('');
  const [step, setStep] = useState<Step | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Ref zmienia się od razu, w przeciwieństwie do stanu – chroni przed podwójnym kliknięciem
  const busy = useRef(false);
  const isGenerating = step !== null;

  function selectPhoto(asset: ImagePicker.ImagePickerAsset) {
    setPhoto(asset);
    setResultUrl(null);
  }

  async function pickImage() {
    setError('');

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 1
      });

      if (!result.canceled) {
        selectPhoto(result.assets[0]);
      }
    } catch {
      setError('Nie udało się wczytać zdjęcia.');
    }
  }

  // Galeria (systemowy picker) nie wymaga zgody – pytamy tylko o aparat.
  async function takePhoto() {
    setError('');

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        if (permission.canAskAgain) {
          setError('Bez dostępu do aparatu nie zrobisz zdjęcia. Możesz wybrać je z galerii.');
        } else {
          Alert.alert(
            'Brak dostępu do aparatu',
            'Zgoda została wcześniej odrzucona. Włącz dostęp do aparatu w ustawieniach telefonu.',
            [
              { text: 'Anuluj', style: 'cancel' },
              { text: 'Otwórz ustawienia', onPress: () => Linking.openSettings() },
            ]
          );
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 1
      });

      if (!result.canceled) {
        selectPhoto(result.assets[0]);
      }
    } catch {
      setError('Nie udało się uruchomić aparatu.');
    }
  }

  async function generate() {
    if (!photo || busy.current) return;
    busy.current = true;
    setError('');
    setResultUrl(null);

    try {
      const size = outputSize(photo.width, photo.height);
      const url = await restyle(photo.uri, prompt.trim(), size, setStep);
      setResultUrl(url);
    } catch (e) {
      setError(e instanceof WavespeedError ? e.message : 'Coś poszło nie tak. Spróbuj ponownie.');
    } finally {
      setStep(null);
      busy.current = false;
    }
  }

  const canGenerate = !!photo && !!prompt.trim() && !isGenerating;

  return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

            {/* Nagłówek */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Ionicons name="sparkles" size={22} color="#10b981" />
                <Text style={styles.title}>AI Photo Editor</Text>
              </View>
              <Text style={styles.subtitle}>Przekształć swoje zdjęcie za pomocą AI</Text>
            </View>

            {/* Sekcja wyboru zdjęcia / Podgląd */}
            <TouchableOpacity
                style={styles.imageCard}
                onPress={pickImage}
                activeOpacity={0.8}
                disabled={isGenerating}
            >
              {photo ? (
                  <Image source={{ uri: photo.uri }} style={styles.previewImage} />
              ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name="image-outline" size={40} color="#64748b" style={styles.placeholderIcon} />
                    <Text style={styles.placeholderText}>Dotknij, aby wybrać zdjęcie</Text>
                  </View>
              )}
            </TouchableOpacity>

            {/* Źródło zdjęcia */}
            <View style={styles.sourceRow}>
              <TouchableOpacity style={styles.sourceButton} onPress={takePhoto} activeOpacity={0.8} disabled={isGenerating}>
                <Ionicons name="camera-outline" size={18} color="#e2e8f0" />
                <Text style={styles.sourceButtonText}>Aparat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sourceButton} onPress={pickImage} activeOpacity={0.8} disabled={isGenerating}>
                <Ionicons name="images-outline" size={18} color="#e2e8f0" />
                <Text style={styles.sourceButtonText}>Galeria</Text>
              </TouchableOpacity>
            </View>

            {/* Własny prompt */}
            <Text style={styles.sectionTitle}>Opisz, co AI ma zmienić na zdjęciu</Text>
            <TextInput
                style={styles.input}
                placeholder="np. dodaj cyberpunkowe neony, zmień tło na kosmos..."
                placeholderTextColor="#666"
                value={prompt}
                onChangeText={setPrompt}
                editable={!isGenerating}
                multiline
            />

            {/* Przycisk akcji */}
            <TouchableOpacity
                style={[styles.actionButton, !canGenerate && styles.actionButtonDisabled]}
                disabled={!canGenerate}
                activeOpacity={0.8}
                onPress={generate}
            >
              <Ionicons name="color-wand-outline" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>
                {isGenerating ? 'Generowanie…' : 'Generuj obraz AI'}
              </Text>
            </TouchableOpacity>

            {step && <GenerationStatus step={step} />}

            {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={18} color="#f43f5e" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {resultUrl && (
                <View style={styles.resultSection}>
                  <Text style={styles.sectionTitle}>Wynik</Text>
                  <View style={styles.resultCard}>
                    <Image source={{ uri: resultUrl }} style={styles.previewImage} resizeMode="contain" />
                  </View>
                </View>
            )}

          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a', // Głęboki, nowoczesny granat (Dark Mode)
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  imageCard: {
    height: 260,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderIcon: {
    marginBottom: 8,
  },
  placeholderText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
  },
  sourceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  sourceButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sourceButtonText: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    color: '#f8fafc',
    fontSize: 15,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#10b981', // Soczysta zieleń akcentowa
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonDisabled: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#f43f5e',
    textAlign: 'center',
    fontWeight: '600',
    flexShrink: 1,
  },
  resultSection: {
    marginTop: 28,
  },
  resultCard: {
    height: 360,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
});
