import { processTranslation, processLanguageDetection, processBatchTranslation } from '../services/translationService.js';
import { processEchoCheck } from '../services/echoService.js';
import { processPerceptionAnalysis } from '../services/perceptionService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const translate = async (req, res) => {
  try {
    const { text, targetLanguage = 'en', sourceLanguage } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return sendError(res, 'Text parameter is required', 'VALIDATION_ERROR', 400);
    }
    const result = await processTranslation(text, targetLanguage, sourceLanguage);
    return res.json({ success: true, ...result });
  } catch (err) {
    return sendError(res, err.message || 'Translation service unavailable', 'TRANSLATION_ERROR', 503);
  }
};

export const detect = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return sendError(res, 'Text parameter is required', 'VALIDATION_ERROR', 400);
    }
    const result = await processLanguageDetection(text);
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const echoCheck = async (req, res) => {
  try {
    const { text, targetLanguage = 'en', sourceLanguage = 'auto' } = req.body;
    if (!text) {
      return sendError(res, 'Text parameter is required', 'VALIDATION_ERROR', 400);
    }
    const echoResult = await processEchoCheck(text, targetLanguage, sourceLanguage);
    return sendSuccess(res, { echoResult });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const analyzePerception = async (req, res) => {
  try {
    const { text, targetLanguage = 'en' } = req.body;
    if (!text) {
      return sendError(res, 'Text parameter is required', 'VALIDATION_ERROR', 400);
    }
    const perception = await processPerceptionAnalysis(text, targetLanguage);
    return sendSuccess(res, { perception });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const batchTranslate = async (req, res) => {
  try {
    const { texts, targetLanguage = 'en', sourceLanguage } = req.body;
    if (!Array.isArray(texts)) {
      return sendError(res, 'texts parameter must be an array', 'VALIDATION_ERROR', 400);
    }
    const results = await processBatchTranslation(texts, targetLanguage, sourceLanguage);
    return sendSuccess(res, { results });
  } catch (err) {
    return sendError(res, err.message);
  }
};
