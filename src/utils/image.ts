// Wan 2.2 przyjmuje od 256 do 1536 px na bok
const MIN_SIDE = 256;
const MAX_SIDE = 1536;
const TARGET_LONG_SIDE = 1280;

const fit = (value: number) => Math.min(MAX_SIDE, Math.max(MIN_SIDE, Math.round(value / 16) * 16));

// Rozmiar wyniku w formacie "W*H", z zachowaniem proporcji zdjęcia
export function outputSize(width: number, height: number): string {
  const scale = TARGET_LONG_SIDE / Math.max(width, height);
  return `${fit(width * scale)}*${fit(height * scale)}`;
}
