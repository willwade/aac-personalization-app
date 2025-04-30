import type { NextApiRequest, NextApiResponse } from 'next';
import { readJson } from '../../lib/jsonStore';
import type { Person } from '../../lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
  try {
    const partners = await readJson<Person[]>("partners.json");
    const answers = await readJson<Record<number, string>>("passport-answers.json");
    res.status(200).json({ partners: partners || [], answers: answers || {} });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load passport data' });
  }
}
