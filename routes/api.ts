import express from 'express';
import * as ChatController from '../controllers/ChatController';
import * as MediaController from '../controllers/MediaController';
import { validateApiKey, validateSource } from '../middleware/auth';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.use(validateApiKey);
router.use(validateSource);

router.post('/chat', ChatController.chat);
router.post('/image', MediaController.generateImage);
router.post('/video', MediaController.generateVideo);
router.post('/audio/speech', MediaController.textToSpeech);
router.post('/audio/transcriptions', upload.single('file'), MediaController.transcribe);

export default router;
