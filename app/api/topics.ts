import type { NextApiRequest, NextApiResponse } from 'next';
import { readJson, writeJson } from '../../lib/jsonStore';
import type { Topic } from '../../lib/types';

const FILENAME = 'topics.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const topics = await readJson<Topic[]>(FILENAME);
    res.status(200).json(topics || []);
  } else if (req.method === 'POST') {
    const newTopic: Topic = req.body;
    const topics = (await readJson<Topic[]>(FILENAME)) || [];
    topics.push(newTopic);
    await writeJson(FILENAME, topics);
    res.status(201).json(newTopic);
  } else if (req.method === 'PUT') {
    const topics: Topic[] = req.body;
    await writeJson(FILENAME, topics);
    res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
