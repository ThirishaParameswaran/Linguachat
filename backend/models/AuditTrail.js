import mongoose from 'mongoose';

const AuditTrailSchema = new mongoose.Schema(
  {
    auditId: { type: String, required: true, unique: true, index: true },
    messageId: { type: String, required: true, index: true },
    originalMessage: { type: String, required: true },
    aiTranslation: { type: String, required: true },
    sourceLanguage: { type: String, required: true },
    targetLanguage: { type: String, required: true },
    correctedTranslation: { type: String },
    correctionStatus: {
      type: String,
      enum: ['pending', 'proposed', 'approved', 'rejected'],
      default: 'proposed',
    },
    proposedBy: { type: String, required: true },
    proposedByName: { type: String, required: true },
    approvedBySender: { type: Boolean, default: false },
    approvedByReceiver: { type: Boolean, default: false },
    proposedAt: { type: String, default: () => new Date().toISOString() },
    approvedAt: { type: String },
    addedToGlossary: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('AuditTrail', AuditTrailSchema);
