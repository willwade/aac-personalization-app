// All JSON file operations are encrypted at rest for privacy. See secureJsonStore.ts for implementation.
import { readEncryptedJson, writeEncryptedJson } from './secureJsonStore';

/**
 * Read encrypted JSON from the data directory.
 * @param filename - The file to read (e.g., 'people.json')
 */
export async function readJson<T>(filename: string): Promise<T | null> {
  return readEncryptedJson<T>(filename);
}

/**
 * Write encrypted JSON to the data directory.
 * @param filename - The file to write (e.g., 'people.json')
 * @param data - The data to write
 */
export async function writeJson<T>(filename: string, data: T): Promise<void> {
  return writeEncryptedJson<T>(filename, data);
}

export async function updateJson<T>(filename: string, updater: (oldData: T | null) => T): Promise<void> {
  const oldData = await readJson<T>(filename);
  const newData = updater(oldData);
  await writeJson(filename, newData);
}
