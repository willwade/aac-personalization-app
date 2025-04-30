// WARNING: This file uses Node.js modules and can ONLY be used in server-side code (API routes, server actions, or scripts).
// Do NOT import this file from React components or any code that runs on the client.
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const dataDir = path.join(process.cwd(), 'data');
const ENCRYPTION_KEY = process.env.JSON_ENCRYPTION_KEY || 'default_key_32byteslong!'; // 32 bytes for AES-256
const IV_LENGTH = 16;

function getKey() {
  // Always return a 32-byte key
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

export async function readEncryptedJson<T>(filename: string): Promise<T | null> {
  try {
    const filePath = path.join(dataDir, filename);
    const encrypted = await fs.readFile(filePath);
    const iv = encrypted.subarray(0, IV_LENGTH);
    const encryptedText = encrypted.subarray(IV_LENGTH);
    const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString('utf-8'));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

export async function writeEncryptedJson<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(dataDir, filename);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf-8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const out = Buffer.concat([iv, encrypted]);
  await fs.writeFile(filePath, out);
}
