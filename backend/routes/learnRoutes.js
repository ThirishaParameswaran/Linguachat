import express from 'express';
import {
  getLearningWords,
  addLearningWord,
  getLearningProgress,
} from '../controllers/learnController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/words', protect, getLearningWords);
router.post('/words', protect, addLearningWord);
router.get('/progress', protect, getLearningProgress);

export default router;
