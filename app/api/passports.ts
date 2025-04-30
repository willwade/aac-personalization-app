import type { NextApiRequest, NextApiResponse } from 'next';
import { readJson, writeJson } from '../../lib/jsonStore';
import type { Passport } from '../../lib/types';

const FILENAME = 'passports.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const passports = await readJson<Passport[]>(FILENAME);
    res.status(200).json(passports || []);
  } else if (req.method === 'POST') {
    const newPassport: Passport = req.body;
    const passports = (await readJson<Passport[]>(FILENAME)) || [];
    passports.push(newPassport);
    await writeJson(FILENAME, passports);
    res.status(201).json(newPassport);
  } else if (req.method === 'PUT') {
    const passports: Passport[] = req.body;
    await writeJson(FILENAME, passports);
    res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
