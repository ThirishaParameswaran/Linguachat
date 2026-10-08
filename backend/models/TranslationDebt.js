import mongoose from 'mongoose';

const TranslationDebtSchema = new mongoose.Schema(
  {
    debtId: { type: String, required: true, unique: true, index: true },
    messageId: { type: String, required: true, index: true },
    originalMessage: { type: String, required: true },
    originalText: { type: String },
    aiTranslation: { type: String, required: true },
    translatedText: { type: String },
    sourceLanguage: { type: String, default: 'ta' },
    targetLanguage: { type: String, default: 'en' },
    confidence: { type: Number, default: 85 },
    context: { type: String, default: '' },
    debtScore: { type: Number, required: true, default: 0 },
    confidenceDebt: { type: Number, default: 0 },
    correctionDebt: { type: Number, default: 0 },
    timeDebt: { type: Number, default: 0 },
    complexityDebt: { type: Number, default: 0 },
    auditApprovalDebt: { type: Number, default: 0 },
    debtCategory: {
      type: String,
      enum: ['quick_fix', 'structural', 'rewrite'],
      default: 'quick_fix',
    },
    riskSeverity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    remediationStatus: {
      type: String,
      enum: ['unassigned', 'in_queue', 'in_progress', 'remediated', 'dismissed'],
      default: 'unassigned',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'dismissed'],
      default: 'pending',
    },
    assignedTo: { type: String },
    assignedToName: { type: String },
    createdBy: { type: String, default: 'usr_me' },
    resolvedBy: { type: String },
    remediatedAt: { type: String },
    remediationNotes: { type: String },
    evaluatedBy: { type: String, default: 'LinguaChat Debt Ledger Engine' },
    evaluatedAt: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  },
  { timestamps: true }
);

TranslationDebtSchema.pre('save', function (next) {
  if (this.originalMessage && !this.originalText) this.originalText = this.originalMessage;
  if (this.aiTranslation && !this.translatedText) this.translatedText = this.aiTranslation;
  if (this.remediationStatus === 'remediated' && this.status !== 'resolved') this.status = 'resolved';
  if (this.status === 'resolved' && this.remediationStatus !== 'remediated') this.remediationStatus = 'remediated';
  next();
});

export default mongoose.model('TranslationDebt', TranslationDebtSchema);
