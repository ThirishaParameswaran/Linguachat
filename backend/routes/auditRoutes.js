import express from 'express';
import {
  proposeCorrection,
  approveCorrection,
  rejectCorrection,
  getAuditForMessage,
  getAuditForUser,
} from '../controllers/auditController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/correction', protect, proposeCorrection);
router.put('/approve/:id', protect, approveCorrection);
router.put('/reject/:id', protect, rejectCorrection);
router.get('/message/:messageId', protect, getAuditForMessage);
router.get('/user/:userId', protect, getAuditForUser);

export default router;
