import express from 'express';
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  sendInvite,
  downloadICS,
} from '../controllers/calendarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/events', protect, createEvent);
router.get('/events', protect, getEvents);
router.put('/events/:id', protect, updateEvent);
router.delete('/events/:id', protect, deleteEvent);
router.post('/invite', protect, sendInvite);
router.get('/ics/:eventId', downloadICS);

export default router;
