import AsyncStorage from '@react-native-async-storage/async-storage';

import { deleteFile } from '../utils/files';

const STORAGE_KEY = 'history.v1';
const MAX_ENTRIES = 30;
let pending: Promise<unknown> = Promise.resolve();

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const next = pending.then(operation);
  pending = next.catch(() => undefined);
  return next;
}

export type HistoryEntry = {
  id: string;
  createdAt: number;
  prompt: string;
  style: string | null;
  before: string;
  after: string;
};

function removeFiles(entry: HistoryEntry) {
  deleteFile(entry.before);
  deleteFile(entry.after);
}

async function readHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function loadHistory(): Promise<HistoryEntry[]> {
  return enqueue(readHistory);
}

export function addEntry(entry: HistoryEntry): Promise<HistoryEntry[]> {
  return enqueue(async () => {
    const all = [entry, ...(await readHistory())];
    const kept = all.slice(0, MAX_ENTRIES);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
    // pliki najstarszych wpisów usuwamy dopiero po udanym zapisie listy
    all.slice(MAX_ENTRIES).forEach(removeFiles);
    return kept;
  });
}

export function clearHistory(): Promise<void> {
  return enqueue(async () => {
    const all = await readHistory();
    await AsyncStorage.removeItem(STORAGE_KEY);
    all.forEach(removeFiles);
  });
}
