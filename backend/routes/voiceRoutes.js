import express from 'express';
import multer from 'multer';
import { voiceToText, textToVoice } from '../controllers/voiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();

router.post('/stt', protect, upload.single('audio'), voiceToText);
router.post('/tts', protect, textToVoice);

export default router;
