import express from 'express';
import {
  calculateDebt,
  calculateDebtForMessage,
  getDebtDashboard,
  getDebtQueue,
  remediateDebt,
  getDebtReport,
  debtPrevention,
} from '../controllers/debtController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/calculate', calculateDebt);
router.post('/calculate/:messageId', calculateDebtForMessage);
router.get('/dashboard', protect, getDebtDashboard);
router.get('/queue', protect, getDebtQueue);
router.put('/remediate/:debtId', protect, remediateDebt);
router.get('/report', protect, getDebtReport);
router.post('/prevention', protect, debtPrevention);

export default router;
