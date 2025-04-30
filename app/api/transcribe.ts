import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOAD_DIR = path.join(process.cwd(), 'data');

async function parseForm(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false, uploadDir: UPLOAD_DIR, keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      const file = files.audio as formidable.File;
      if (!file || !file.filepath) return reject(new Error('No audio file uploaded'));
      resolve(file.filepath);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const audioPath = await parseForm(req);
    // Run Whisper CLI on uploaded audio
    const whisper = spawn('whisper', [audioPath, '--model', 'base', '--language', 'en', '--output_format', 'txt', '--output_dir', UPLOAD_DIR]);

    whisper.on('error', (err) => {
      res.status(500).json({ error: 'Whisper process failed', details: err.message });
    });

    whisper.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: `Whisper exited with code ${code}` });
      }
      // Read transcription from output file
      const txtPath = audioPath.replace(path.extname(audioPath), '.txt');
      fs.readFile(txtPath, 'utf-8', (err, transcript) => {
        if (err) return res.status(500).json({ error: 'Could not read transcript' });
        res.status(200).json({ transcript });
        // Clean up files
        fs.unlink(audioPath, () => {});
        fs.unlink(txtPath, () => {});
      });
    });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message || "Transcription failed" });
  }
}
