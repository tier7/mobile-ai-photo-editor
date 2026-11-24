import { Directory, File, Paths } from 'expo-file-system';
import { Asset, requestPermissionsAsync } from 'expo-media-library';
import { Platform } from 'react-native';

async function webImage(uri: string): Promise<string> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('Nie udało się pobrać zdjęcia.');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Trzymamy pliki w documents, a nie w cache – system może wyczyścić cache w każdej chwili
function resultsDir() {
  const dir = new Directory(Paths.document, 'results');
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

function newFile(prefix: string) {
  return new File(resultsDir(), `${prefix}-${Date.now()}.jpg`);
}

// Link z Wavespeed wygasa, więc od razu pobieramy wynik na telefon
export async function downloadResult(url: string): Promise<string> {
  if (Platform.OS === 'web') return webImage(url);
  const file = await File.downloadFileAsync(url, newFile('result'));
  return file.uri;
}

// Skompresowany oryginał leży w cache – do historii robimy trwałą kopię
export async function keepCopy(uri: string): Promise<string> {
  if (Platform.OS === 'web') return webImage(uri);
  const target = newFile('source');
  await new File(uri).copy(target);
  return target.uri;
}

export function deleteFile(uri: string) {
  if (Platform.OS === 'web') return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // plik mógł już zniknąć – nic nie robimy
  }
}

export async function saveToGallery(uri: string): Promise<void> {
  if (Platform.OS === 'web') {
    const link = document.createElement('a');
    link.href = uri;
    link.download = uri.startsWith('data:image/png') ? 'ai-photo.png' : 'ai-photo.jpg';
    document.body.appendChild(link);
    link.click();
    link.remove();
    return;
  }
  // true = prosimy tylko o zapis, bez dostępu do całej galerii
  const permission = await requestPermissionsAsync(true);
  if (!permission.granted) {
    throw new Error('Brak zgody na zapis w galerii. Możesz ją włączyć w ustawieniach telefonu.');
  }
  await Asset.create(uri);
}
