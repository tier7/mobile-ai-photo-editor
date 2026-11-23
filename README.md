# mobile-ai-photo-editor

AI Photo Restyler – aplikacja mobilna (Expo + TypeScript), która przerabia zdjęcie w wybranym stylu
za pomocą modelu Image-to-Image z Wavespeed AI (`wavespeed-ai/wan-2.2/image-to-image`).
Projekt zaliczeniowy z PIM – założenia w pliku `PIM Concept.pdf`.

## Funkcje

- zdjęcie z aparatu lub z galerii (zgoda potrzebna tylko na aparat),
- gotowe style (presety) i własny dopisek do promptu,
- format wyniku: Auto (jak zdjęcie), 1:1 albo 16:9,
- kompresja przed wysyłką (dłuższy bok 1280 px, JPEG 80%),
- podgląd Przed / Po i zapis wyniku w galerii,
- historia ostatnich 30 wyników zapisana na telefonie.

## Uruchomienie

Wymagany Node.js 24 (`.nvmrc`) i aplikacja **Expo Go** (SDK 58) na telefonie.

```bash
npm install
cp .env.example .env
```

W pliku `.env` wpisz klucz z panelu Wavespeed (API Keys):

```
EXPO_PUBLIC_WAVESPEED_API_KEY=twój_klucz
```

Potem:

```bash
npx expo start -c
```

i zeskanuj kod QR w Expo Go. Telefon i komputer muszą być w tej samej sieci Wi-Fi,
w innym wypadku użyj `npx expo start --tunnel`.

Na Windowsie w PowerShellu z zablokowanymi skryptami zamiast `npx` wpisz `npx.cmd`.

## Prompty stylów

Style są w `src/presets.ts`. Dopóki prompt zaczyna się od `TODO`, styl jest widoczny w aplikacji,
ale nie da się go wysłać – wystarczy podmienić tekst w polu `prompt`.

## Struktura

```
App.tsx                           ekran główny
src/api/wavespeed.ts              upload zdjęcia, zlecenie i odpytywanie o wynik
src/config/env.ts                 klucz API z .env
src/presets.ts                    style i budowanie promptu
src/storage/history.ts            historia (AsyncStorage)
src/utils/image.ts                kompresja i rozmiar wyniku
src/utils/files.ts                pobieranie wyniku i zapis do galerii
src/components/                   status generowania, przełączniki, presety, historia
```

## Uwagi

- Każde generowanie to płatne wywołanie API, dlatego aplikacja nie ponawia zleceń automatycznie,
  a przycisk blokuje się od razu po kliknięciu.
- Klucz w zmiennej `EXPO_PUBLIC_…` trafia do kodu aplikacji. W wersji publicznej powinien być
  schowany za własnym backendem.
- W Expo Go część uprawnień (np. zapis do galerii) należy do samej aplikacji Expo Go.
