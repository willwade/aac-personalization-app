// lib/clientDb.ts
// IndexedDB utility for secure client-side storage (AAC App)
// Uses idb-keyval for simplicity, but can be extended for more complex needs

import { createStore, get, set, del, update, keys } from 'idb-keyval';

// SSR-safe: only create the store in the browser
const isBrowser = typeof window !== "undefined" && typeof indexedDB !== "undefined";
const aacStore = isBrowser ? createStore('aac-personalization-db', 'aac-store') : undefined;

function assertBrowser() {
  if (!isBrowser) throw new Error("IndexedDB is only available in the browser (client-side). This function cannot be called on the server.");
}

export async function saveData<T>(key: string, value: T): Promise<void> {
  assertBrowser();
  await set(key, value, aacStore!);
}

export async function loadData<T>(key: string): Promise<T | undefined> {
  assertBrowser();
  return get<T>(key, aacStore!);
}

export async function deleteData(key: string): Promise<void> {
  assertBrowser();
  await del(key, aacStore!);
}

export async function updateData<T>(key: string, updater: (old: T | undefined) => T): Promise<void> {
  assertBrowser();
  await update(key, updater, aacStore!);
}

export async function getAllKeys(): Promise<IDBValidKey[]> {
  assertBrowser();
  return keys(aacStore!);
}
