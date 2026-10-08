import express from 'express';
import {
  initiateCall,
  answerCall,
  endCall,
  getCallHistory,
  recordingConsent,
  toggleScreenShare,
} from '../controllers/videoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/call/initiate', protect, initiateCall);
router.post('/call/answer', protect, answerCall);
router.post('/call/end', protect, endCall);
router.get('/call/history', protect, getCallHistory);
router.post('/call/recording', protect, recordingConsent);
router.post('/screen/share', protect, toggleScreenShare);

export default router;
