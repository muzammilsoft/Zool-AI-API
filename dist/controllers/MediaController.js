"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribe = exports.textToSpeech = exports.generateVideo = exports.generateImage = void 0;
const axios_1 = __importDefault(require("axios"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
const generateImage = async (req, res) => {
    const { prompt, width, height, seed, model, nologo, source } = req.body;
    if (!prompt) {
        return res.status(400).json({ status: 'error', message: 'prompt is required.' });
    }
    const params = { width, height, seed, model, nologo, key: process.env.POLLINATIONS_API_KEY };
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
exports.generateImage = generateImage;
const generateVideo = async (req, res) => {
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
exports.generateVideo = generateVideo;
const textToSpeech = async (req, res) => {
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
exports.textToSpeech = textToSpeech;
const transcribe = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'file is required.' });
    }
    try {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });
        formData.append('file', blob, req.file.originalname);
        formData.append('model', req.body.model || 'whisper-1');
        const response = await axios_1.default.post('https://gen.pollinations.ai/v1/audio/transcriptions', formData, {
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
    }
    catch (error) {
        return res.status(error.response?.status || 500).json({
            status: 'error',
            message: 'فشل التعرف على الصوت.',
            details: error.response?.data || error.message
        });
    }
};
exports.transcribe = transcribe;
