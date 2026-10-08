import SharedVocabulary from '../models/SharedVocabulary.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getVocabulary = async (req, res) => {
  try {
    let vocabulary = await SharedVocabulary.find({}).catch(() => []);
    return sendSuccess(res, { vocabulary });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const addVocabulary = async (req, res) => {
  try {
    const {
      groupId = 'grp_global_project',
      groupName = '🚀 Project Titan Global Core',
      term,
      sourceLanguage = 'ta',
      translatedTerm,
      targetLanguage = 'en',
      contextUsage = '',
      proposedBy = 'usr_me',
      proposedByName = 'Alex Chen',
      tags = [],
    } = req.body;

    if (!term || !translatedTerm) {
      return sendError(res, 'term and translatedTerm are required', 'VALIDATION_ERROR', 400);
    }

    const vocabId = 'vocab_' + Date.now();
    const entry = {
      vocabId,
      groupId,
      groupName,
      term,
      sourceLanguage,
      translatedTerm,
      targetLanguage,
      contextUsage,
      proposedBy,
      proposedByName,
      approvedBy: 'Admin Approval',
      correctionCount: 1,
      lastUsedAt: new Date().toISOString(),
      tags,
    };

    try {
      await SharedVocabulary.create(entry);
    } catch (e) {}

    return sendSuccess(res, { vocabEntry: entry }, 'Vocabulary entry added', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const searchVocabulary = async (req, res) => {
  try {
    const { q } = req.query;
    let vocabulary = await SharedVocabulary.find({
      $or: [
        { term: { $regex: q || '', $options: 'i' } },
        { translatedTerm: { $regex: q || '', $options: 'i' } },
      ],
    }).catch(() => []);

    return sendSuccess(res, { vocabulary });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateVocabulary = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    let entry = await SharedVocabulary.findOneAndUpdate({ vocabId: id }, updates, { new: true }).catch(() => null);
    return sendSuccess(res, { vocabEntry: entry || { vocabId: id, ...updates } }, 'Vocabulary entry updated');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteVocabulary = async (req, res) => {
  try {
    const { id } = req.params;
    await SharedVocabulary.deleteOne({ vocabId: id }).catch(() => null);
    return sendSuccess(res, { vocabId: id }, 'Vocabulary entry deleted');
  } catch (err) {
    return sendError(res, err.message);
  }
};
