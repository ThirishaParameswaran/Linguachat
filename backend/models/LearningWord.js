import mongoose from 'mongoose';

const LearningWordSchema = new mongoose.Schema(
  {
    wordId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    word: { type: String, required: true },
    sourceLanguage: { type: String, default: 'auto' },
    translation: { type: String, required: true },
    targetLanguage: { type: String, default: 'en' },
    definition: { type: String, default: '' },
    phonetic: { type: String, default: '' },
    exampleSentence: { type: String, default: '' },
    masteryLevel: { type: Number, default: 1, min: 0, max: 5 },
    nextReviewDate: { type: String, default: () => new Date().toISOString() },
    timesReviewed: { type: Number, default: 0 },
    lastTestedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export default mongoose.model('LearningWord', LearningWordSchema);
