import express from 'express';
import {
  getVocabulary,
  addVocabulary,
  searchVocabulary,
  updateVocabulary,
  deleteVocabulary,
} from '../controllers/vocabController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getVocabulary);
router.post('/', protect, addVocabulary);
router.get('/search', protect, searchVocabulary);
router.put('/:id', protect, updateVocabulary);
router.delete('/:id', protect, deleteVocabulary);

export default router;
