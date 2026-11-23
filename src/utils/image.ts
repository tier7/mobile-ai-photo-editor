import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export type Photo = { uri: string; width: number; height: number };
export type Aspect = 'auto' | '1:1' | '16:9';

const MAX_UPLOAD_SIDE = 1280;
const JPEG_QUALITY = 0.8;

// Zdjęcia z S23 mają po kilkanaście MB – przed wysyłką zmniejszamy je do 1280 px
export async function compressPhoto(photo: Photo): Promise<Photo> {
  const context = ImageManipulator.manipulate(photo.uri);

  if (Math.max(photo.width, photo.height) > MAX_UPLOAD_SIDE) {
    context.resize(photo.width >= photo.height ? { width: MAX_UPLOAD_SIDE } : { height: MAX_UPLOAD_SIDE });
  }

  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });
  return { uri: saved.uri, width: saved.width, height: saved.height };
}

// Wan 2.2 przyjmuje od 256 do 1536 px na bok
const MIN_SIDE = 256;
const MAX_SIDE = 1536;
const TARGET_LONG_SIDE = 1280;

const fit = (value: number) => Math.min(MAX_SIDE, Math.max(MIN_SIDE, Math.round(value / 16) * 16));

// Rozmiar wyniku w formacie "W*H" dla wybranego formatu
export function outputSize(aspect: Aspect, photo: Photo): string {
  const [w, h] =
    aspect === '1:1' ? [1, 1] :
    aspect === '16:9' ? [16, 9] :
    [photo.width, photo.height];

  const scale = TARGET_LONG_SIDE / Math.max(w, h);
  return `${fit(w * scale)}*${fit(h * scale)}`;
}
