import mongoose from 'mongoose';

const SharedVocabularySchema = new mongoose.Schema(
  {
    vocabId: { type: String, required: true, unique: true, index: true },
    groupId: { type: String, required: true, index: true },
    groupName: { type: String, default: '' },
    term: { type: String, required: true },
    sourceLanguage: { type: String, required: true },
    translatedTerm: { type: String, required: true },
    targetLanguage: { type: String, required: true },
    contextUsage: { type: String, default: '' },
    sourceAuditId: { type: String },
    proposedBy: { type: String, required: true },
    proposedByName: { type: String, default: '' },
    approvedBy: { type: String, default: '' },
    correctionCount: { type: Number, default: 1 },
    lastUsedAt: { type: String, default: () => new Date().toISOString() },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('SharedVocabulary', SharedVocabularySchema);
