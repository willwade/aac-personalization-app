import type { NextApiRequest, NextApiResponse } from 'next';
import { readJson, writeJson } from '../../lib/jsonStore';
import type { Person } from '../../lib/types';

const FILENAME = 'people.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return all people
    const people = await readJson<Person[]>(FILENAME);
    res.status(200).json(people || []);
  } else if (req.method === 'POST') {
    // Add a new person
    const newPerson: Person = req.body;
    const people = (await readJson<Person[]>(FILENAME)) || [];
    people.push(newPerson);
    await writeJson(FILENAME, people);
    res.status(201).json(newPerson);
  } else if (req.method === 'PUT') {
    // Update all people (replace array)
    const people: Person[] = req.body;
    await writeJson(FILENAME, people);
    res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
