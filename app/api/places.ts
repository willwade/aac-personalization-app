import type { NextApiRequest, NextApiResponse } from 'next';
import { readJson, writeJson } from '../../lib/jsonStore';
import type { Place } from '../../lib/types';

const FILENAME = 'places.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const places = await readJson<Place[]>(FILENAME);
    res.status(200).json(places || []);
  } else if (req.method === 'POST') {
    const newPlace: Place = req.body;
    const places = (await readJson<Place[]>(FILENAME)) || [];
    places.push(newPlace);
    await writeJson(FILENAME, places);
    res.status(201).json(newPlace);
  } else if (req.method === 'PUT') {
    const places: Place[] = req.body;
    await writeJson(FILENAME, places);
    res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
