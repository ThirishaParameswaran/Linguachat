import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema(
  {
    analyticsId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    groupId: { type: String, index: true },
    periodStart: { type: String, default: () => new Date().toISOString() },
    periodEnd: { type: String, default: () => new Date().toISOString() },
    totalMessagesSent: { type: Number, default: 0 },
    translationSuccessRate: { type: Number, default: 95 },
    correctionsSuggested: { type: Number, default: 0 },
    correctionsApproved: { type: Number, default: 0 },
    newWordsLearned: { type: Number, default: 0 },
    codeSwitchingIndex: { type: Number, default: 45 },
    totalDebtScore: { type: Number, default: 0 },
    activeLanguagePairsCount: { type: Number, default: 3 },
    messagesByLanguage: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('Analytics', AnalyticsSchema);
