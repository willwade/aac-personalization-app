// lib/clientDb.ts
// IndexedDB utility for secure client-side storage (AAC App)
// Uses idb-keyval for simplicity, but can be extended for more complex needs

import { createStore, get, set, del, update, keys } from 'idb-keyval';

// Create a custom store for AAC data
const aacStore = createStore('aac-personalization-db', 'aac-store');

export async function saveData<T>(key: string, value: T): Promise<void> {
  await set(key, value, aacStore);
}

export async function loadData<T>(key: string): Promise<T | undefined> {
  return get<T>(key, aacStore);
}

export async function deleteData(key: string): Promise<void> {
  await del(key, aacStore);
}

export async function updateData<T>(key: string, updater: (old: T | undefined) => T): Promise<void> {
  await update(key, updater, aacStore);
}

export async function getAllKeys(): Promise<IDBValidKey[]> {
  return keys(aacStore);
}
