import { Request, Response } from 'express';
import axios from 'axios';
import multer from 'multer';

const upload = multer();

export const generateImage = async (req: Request, res: Response) => {
  const { prompt, width, height, seed, model, nologo, source } = req.body;

  if (!prompt) {
    return res.status(400).json({ status: 'error', message: 'prompt is required.' });
  }

  const params: any = { width, height, seed, model, nologo, key: process.env.POLLINATIONS_API_KEY };
  const queryString = Object.keys(params)
    .filter(k => params[k] !== undefined)
    .map(k => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');

  const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?${queryString}`;

  return res.json({
    status: 'success',
    image_url: imageUrl,
    created_at: new Date().toISOString()
  });
};

export const generateVideo = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ status: 'error', message: 'prompt is required.' });
  }

  const videoUrl = `https://gen.pollinations.ai/video/${encodeURIComponent(prompt)}?key=${process.env.POLLINATIONS_API_KEY}`;

  // Since user wants us to WAIT, and Pollinations might take time
  // we could potentially try a fetch or just return the URL if it's meant to be long polling
  // For now, let's just return the URL, or do a wait loop if Vercel allows (but they have short timeouts)

  return res.json({
    status: 'success',
    video_url: videoUrl,
    message: 'تم بدء التوليد، يرجى الانتظار حتى اكتمال الفيديو.',
    created_at: new Date().toISOString()
  });
};

export const textToSpeech = async (req: Request, res: Response) => {
  const { text, voice } = req.body;

  if (!text) {
    return res.status(400).json({ status: 'error', message: 'text is required.' });
  }

  const audioUrl = `https://gen.pollinations.ai/audio/${encodeURIComponent(text)}?voice=${voice || 'nova'}&key=${process.env.POLLINATIONS_API_KEY}`;

  return res.json({
    status: 'success',
    audio_url: audioUrl,
    created_at: new Date().toISOString()
  });
};

export const transcribe = async (req: Request, res: Response) => {
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

    return res.json({
      status: 'success',
      data: response.data,
      created_at: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(error.response?.status || 500).json({
      status: 'error',
      message: 'فشل التعرف على الصوت.',
      details: error.response?.data || error.message
    });
  }
};
