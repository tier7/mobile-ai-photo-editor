import { File } from 'expo-file-system';
import { fetch } from 'expo/fetch';
import { Platform } from 'react-native';
import { env } from '../config/env';
import type { Aspect } from '../utils/image';

const API_URL = 'https://api.wavespeed.ai/api/v3';
export const MODELS = [
  { value: 'wavespeed-ai/wan-2.2/image-to-image', label: 'Wan 2.2' },
  { value: 'google/nano-banana-2.1/edit', label: 'Nano Banana 2.1' },
] as const;
export type Model = typeof MODELS[number]['value'];

const STRENGTH = 0.6;
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 180_000;

export type Step = 'upload' | 'submit' | 'processing';

export class WavespeedError extends Error {}

type ApiResponse<T> = { code?: number; message?: string; data?: T };

function authHeaders() {
  if (!env.wavespeedApiKey) {
    throw new WavespeedError('Brak klucza API. Uzupełnij plik .env i uruchom Expo ponownie (npx expo start -c).');
  }
  return { Authorization: `Bearer ${env.wavespeedApiKey}` };
}

function messageForStatus(status: number, apiMessage?: string) {
  if (status === 401 || status === 403) return 'Nieprawidłowy klucz API Wavespeed.';
  if (status === 402) return 'Brak środków na koncie Wavespeed.';
  if (status === 429) return 'Za dużo zapytań. Odczekaj chwilę i spróbuj ponownie.';
  if (status >= 500) return 'Serwer Wavespeed ma problem. Spróbuj ponownie za chwilę.';
  return apiMessage || `Błąd API (HTTP ${status}).`;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let res: Awaited<ReturnType<typeof fetch>>;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new WavespeedError('Brak połączenia z serwerem. Sprawdź internet.');
  }

  let body: ApiResponse<T> | null = null;
  try {
    body = await res.json();
  } catch {
    // niektóre błędy wracają bez JSON-a
  }

  if (!res.ok || (body?.code && body.code !== 200)) {
    throw new WavespeedError(messageForStatus(res.ok ? body?.code ?? 0 : res.status, body?.message));
  }
  if (!body?.data) {
    throw new WavespeedError('Serwer zwrócił pustą odpowiedź.');
  }
  return body.data;
}

async function uploadImage(uri: string): Promise<string> {
  const form = new FormData();
  if (Platform.OS === 'web') {
    form.append('file', await (await fetch(uri)).blob(), 'photo.jpg');
  } else {
    form.append('file', new File(uri) as unknown as Blob);
  }

  const data = await request<{ download_url?: string }>('/media/upload/binary', {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  if (!data.download_url) throw new WavespeedError('Nie udało się wysłać zdjęcia.');
  return data.download_url;
}

// Każde zlecenie jest płatne, więc nie ponawiamy go automatycznie.
async function submitTask(image: string, prompt: string, size: string, model: Model, aspect: Aspect): Promise<string> {
  const body = model === 'google/nano-banana-2.1/edit'
    ? { images: [image], prompt, ...(aspect !== 'auto' && { aspect_ratio: aspect }), resolution: '1k', output_format: 'jpeg' }
    : { image, prompt, size, strength: STRENGTH, seed: -1 };
  const data = await request<{ id?: string }>(`/${model}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!data.id) throw new WavespeedError('Serwer nie przyjął zlecenia.');
  return data.id;
}

type Prediction = {
  status?: string;
  outputs?: (string | { url?: string })[];
  error?: string;
};

const FAILED_STATUSES = ['failed', 'cancelled', 'timeout', 'deleted'];

const sleep =(ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForResult(id: string): Promise<string> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);

    let result: Prediction;
    try {
      result = await request<Prediction>(`/predictions/${id}/result`, {
        method: 'GET',
        headers: authHeaders(),
      });
    } catch (e) {
      // Zadanie jest już opłacone i liczy się na serwerze – chwilowy brak sieci
      // przy sprawdzaniu wyniku nie powinien go przekreślać.
      if (e instanceof WavespeedError && e.message.startsWith('Brak połączenia')) continue;
      throw e;
    }

    if (result.status === 'completed') {
      const output = result.outputs?.[0];
      const url = typeof output === 'string' ? output : output?.url;
      if (!url) throw new WavespeedError('Zadanie zakończone, ale bez obrazu.');
      return url;
    }
    if (result.status && FAILED_STATUSES.includes(result.status)) {
      throw new WavespeedError(result.error ? `Generowanie nie powiodło się: ${result.error}` : 'Generowanie nie powiodło się.');
    }
  }

  throw new WavespeedError('Generowanie trwa zbyt długo (ponad 3 minuty). Spróbuj ponownie później.');
}

export async function restyle(
  imageUri: string,
  prompt: string,
  size: string,
  model: Model,
  aspect: Aspect,
  onStep: (step: Step) => void,
): Promise<string> {
  onStep('upload');
  const imageUrl = await uploadImage(imageUri);

  onStep('submit');
  const taskId = await submitTask(imageUrl, prompt, size, model, aspect);

  onStep('processing');
  return waitForResult(taskId);
}
