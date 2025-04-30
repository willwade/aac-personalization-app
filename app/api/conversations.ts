import type { NextApiRequest, NextApiResponse } from 'next';
import { readJson, writeJson } from '../../lib/jsonStore';
import type { ConversationLog } from '../../lib/types';

const FILENAME = 'conversations.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const conversations = await readJson<ConversationLog[]>(FILENAME);
    res.status(200).json(conversations || []);
  } else if (req.method === 'POST') {
    const newConversation: ConversationLog = req.body;
    const conversations = (await readJson<ConversationLog[]>(FILENAME)) || [];
    conversations.push(newConversation);
    await writeJson(FILENAME, conversations);
    res.status(201).json(newConversation);
  } else if (req.method === 'PUT') {
    const conversations: ConversationLog[] = req.body;
    await writeJson(FILENAME, conversations);
    res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
