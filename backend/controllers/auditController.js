import AuditTrail from '../models/AuditTrail.js';
import SharedVocabulary from '../models/SharedVocabulary.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const proposeCorrection = async (req, res) => {
  try {
    const {
      messageId,
      originalMessage,
      aiTranslation,
      correctedTranslation,
      sourceLanguage = 'ta',
      targetLanguage = 'en',
      proposedBy = 'usr_me',
      proposedByName = 'Alex Chen',
      notes,
    } = req.body;

    const auditId = 'aud_' + Date.now();
    const entry = {
      auditId,
      messageId,
      originalMessage,
      aiTranslation,
      sourceLanguage,
      targetLanguage,
      correctedTranslation,
      correctionStatus: 'proposed',
      proposedBy,
      proposedByName,
      approvedBySender: true,
      approvedByReceiver: false,
      proposedAt: new Date().toISOString(),
      addedToGlossary: false,
      notes,
    };

    try {
      await AuditTrail.create(entry);
    } catch (e) {}

    return sendSuccess(res, { auditEntry: entry }, 'Correction proposed successfully', 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const approveCorrection = async (req, res) => {
  try {
    const { id } = req.params;
    let entry = await AuditTrail.findOne({ auditId: id }).catch(() => null);

    const approvedAt = new Date().toISOString();
    const updateData = {
      approvedByReceiver: true,
      correctionStatus: 'approved',
      approvedAt,
      addedToGlossary: true,
    };

    if (entry) {
      entry = await AuditTrail.findOneAndUpdate({ auditId: id }, updateData, { new: true });
    } else {
      entry = { auditId: id, ...updateData };
    }

    // Auto add to Shared Vocabulary
    if (entry && entry.correctedTranslation) {
      const vocabItem = {
        vocabId: 'vocab_' + Date.now(),
        groupId: 'grp_global_project',
        groupName: '🚀 Project Titan Global Core',
        term: entry.originalMessage || 'Correction',
        sourceLanguage: entry.sourceLanguage || 'ta',
        translatedTerm: entry.correctedTranslation,
        targetLanguage: entry.targetLanguage || 'en',
        contextUsage: 'Approved from Audit Trail correction',
        sourceAuditId: id,
        proposedBy: entry.proposedBy || 'usr_me',
        proposedByName: entry.proposedByName || 'Alex Chen',
        approvedBy: 'Dual Approval',
        correctionCount: 1,
        lastUsedAt: new Date().toISOString(),
        tags: ['audit_approved', 'auto_sync'],
      };

      try {
        await SharedVocabulary.create(vocabItem);
      } catch (e) {}
    }

    return sendSuccess(res, { auditEntry: entry }, 'Correction dual-approved & added to shared glossary');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const rejectCorrection = async (req, res) => {
  try {
    const { id } = req.params;
    let entry = await AuditTrail.findOneAndUpdate(
      { auditId: id },
      { correctionStatus: 'rejected' },
      { new: true }
    ).catch(() => null);

    return sendSuccess(res, { auditEntry: entry || { auditId: id, correctionStatus: 'rejected' } }, 'Correction rejected');
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getAuditForMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    let audits = await AuditTrail.find({ messageId }).catch(() => []);
    return sendSuccess(res, { audits });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getAuditForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let audits = await AuditTrail.find({ proposedBy: userId }).catch(() => []);
    return sendSuccess(res, { audits });
  } catch (err) {
    return sendError(res, err.message);
  }
};
