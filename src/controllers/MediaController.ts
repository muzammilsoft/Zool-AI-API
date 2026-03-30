import { Request, Response } from 'express';
import axios from 'axios';
import { getDb } from '../services/db';

export const generateImage = async (req: Request, res: Response) => {
  const { prompt, width, height, seed, model, nologo, source } = req.body;
  const apiKeyData = (req as any).apiKeyData;

  if (!prompt) {
    return res.status(400).json({ status: 'error', message: 'prompt is required.' });
  }

  const params: any = { width, height, seed, model, nologo, key: process.env.POLLINATIONS_API_KEY };
  const queryString = Object.keys(params)
    .filter(k => params[k] !== undefined)
    .map(k => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');

  const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?${queryString}`;

  // Log Usage
  if (apiKeyData && !apiKeyData.is_absolute) {
    const db = getDb();
    await db.run('INSERT INTO usage_stats (key_id, endpoint, status_code) VALUES (?, ?, ?)',
      apiKeyData.id, '/v1/image', 200);
  }

  return res.json({
    status: 'success',
    image_url: imageUrl,
    created_at: new Date().toISOString()
  });
};

export const generateVideo = async (req: Request, res: Response) => {
  const { prompt } = req.body;
  const apiKeyData = (req as any).apiKeyData;

  if (!prompt) {
    return res.status(400).json({ status: 'error', message: 'prompt is required.' });
  }

  const videoUrl = `https://gen.pollinations.ai/video/${encodeURIComponent(prompt)}?key=${process.env.POLLINATIONS_API_KEY}`;

  // Log Usage
  if (apiKeyData && !apiKeyData.is_absolute) {
    const db = getDb();
    await db.run('INSERT INTO usage_stats (key_id, endpoint, status_code) VALUES (?, ?, ?)',
      apiKeyData.id, '/v1/video', 200);
  }

  return res.json({
    status: 'success',
    video_url: videoUrl,
    message: 'تم بدء التوليد، يرجى الانتظار حتى اكتمال الفيديو.',
    created_at: new Date().toISOString()
  });
};

export const textToSpeech = async (req: Request, res: Response) => {
  const { text, voice } = req.body;
  const apiKeyData = (req as any).apiKeyData;

  if (!text) {
    return res.status(400).json({ status: 'error', message: 'text is required.' });
  }

  const audioUrl = `https://gen.pollinations.ai/audio/${encodeURIComponent(text)}?voice=${voice || 'nova'}&key=${process.env.POLLINATIONS_API_KEY}`;

  // Log Usage
  if (apiKeyData && !apiKeyData.is_absolute) {
    const db = getDb();
    await db.run('INSERT INTO usage_stats (key_id, endpoint, status_code) VALUES (?, ?, ?)',
      apiKeyData.id, '/v1/audio/speech', 200);
  }

  return res.json({
    status: 'success',
    audio_url: audioUrl,
    created_at: new Date().toISOString()
  });
};

export const transcribe = async (req: Request, res: Response) => {
  const apiKeyData = (req as any).apiKeyData;

  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'file is required.' });
  }

  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname);
    formData.append('model', req.body.model || 'whisper-1');

    const response = await axios.post('https://gen.pollinations.ai/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${process.env.POLLINATIONS_API_KEY}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    // Log Usage
    if (apiKeyData && !apiKeyData.is_absolute) {
      const db = getDb();
      await db.run('INSERT INTO usage_stats (key_id, endpoint, status_code) VALUES (?, ?, ?)',
        apiKeyData.id, '/v1/audio/transcriptions', 200);
    }

    return res.json({
      status: 'success',
      data: response.data,
      created_at: new Date().toISOString()
    });
  } catch (error: any) {
    const status = error.response?.status || 500;

    // Log Usage
    if (apiKeyData && !apiKeyData.is_absolute) {
      const db = getDb();
      await db.run('INSERT INTO usage_stats (key_id, endpoint, status_code) VALUES (?, ?, ?)',
        apiKeyData.id, '/v1/audio/transcriptions', status);
    }

    return res.status(status).json({
      status: 'error',
      message: 'فشل التعرف على الصوت.',
      details: error.response?.data || error.message
    });
  }
};
