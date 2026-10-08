import express from 'express';
import {
  sendMessage,
  getMessagesForUser,
  getMessagesForGroup,
  createGroup,
  getGroups,
  updateMessage,
  deleteMessage,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', protect, sendMessage);
router.get('/messages/:userId', protect, getMessagesForUser);
router.get('/group/:groupId', protect, getMessagesForGroup);
router.post('/group', protect, createGroup);
router.get('/groups', protect, getGroups);
router.put('/message/:id', protect, updateMessage);
router.delete('/message/:id', protect, deleteMessage);

export default router;
