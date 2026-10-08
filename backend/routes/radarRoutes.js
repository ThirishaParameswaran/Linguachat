import express from 'express';
import {
  analyzeCodeSwitching,
  getRadarForMessage,
  getRadarForGroup,
} from '../controllers/radarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze', analyzeCodeSwitching);
router.get('/message/:messageId', getRadarForMessage);
router.get('/group/:groupId', getRadarForGroup);

export default router;
