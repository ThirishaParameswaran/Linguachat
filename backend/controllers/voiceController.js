import { processSpeechToText, processTextToSpeech } from '../services/voiceService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const voiceToText = async (req, res) => {
  try {
    const { languageCode = 'en-US' } = req.body;
    const result = await processSpeechToText(req.file ? req.file.buffer : null, languageCode);
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const textToVoice = async (req, res) => {
  try {
    const { text, languageCode = 'en-US' } = req.body;
    if (!text) {
      return sendError(res, 'Text is required for TTS conversion', 'VALIDATION_ERROR', 400);
    }
    const result = await processTextToSpeech(text, languageCode);
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, err.message);
  }
};
