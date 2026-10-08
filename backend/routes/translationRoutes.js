import express from 'express';
import {
  translate,
  detect,
  echoCheck,
  analyzePerception,
  batchTranslate,
} from '../controllers/translationController.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/translate', apiRateLimiter, translate);
router.post('/translate/detect', apiRateLimiter, detect);
router.post('/translate/echo', apiRateLimiter, echoCheck);
router.post('/perception/analyze', apiRateLimiter, analyzePerception);
router.post('/translate/batch', apiRateLimiter, batchTranslate);

export default router;
