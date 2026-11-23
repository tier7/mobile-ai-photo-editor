import { Directory, File, Paths } from 'expo-file-system';
import { Asset, requestPermissionsAsync } from 'expo-media-library';

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
  const file = await File.downloadFileAsync(url, newFile('result'));
  return file.uri;
}

export async function saveToGallery(uri: string): Promise<void> {
  // true = prosimy tylko o zapis, bez dostępu do całej galerii
  const permission = await requestPermissionsAsync(true);
  if (!permission.granted) {
    throw new Error('Brak zgody na zapis w galerii. Możesz ją włączyć w ustawieniach telefonu.');
  }
  await Asset.create(uri);
}
