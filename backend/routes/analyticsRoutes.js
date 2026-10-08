import express from 'express';
import {
  getUserAnalytics,
  getGroupAnalytics,
  getTranslationAnalytics,
  getLearningAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/user', protect, getUserAnalytics);
router.get('/group/:groupId', protect, getGroupAnalytics);
router.get('/translation', protect, getTranslationAnalytics);
router.get('/learning', protect, getLearningAnalytics);

export default router;
