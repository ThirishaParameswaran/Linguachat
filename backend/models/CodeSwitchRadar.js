import mongoose from 'mongoose';

const CodeSwitchRadarSchema = new mongoose.Schema(
  {
    radarId: { type: String, required: true, unique: true, index: true },
    messageId: { type: String, required: true, index: true },
    isCodeMixed: { type: Boolean, default: false },
    primaryLanguage: { type: String, default: 'en' },
    detectedLanguages: [{ type: String }],
    tokens: [
      {
        token: String,
        language: String,
        confidence: Number,
        isSwitchPoint: Boolean,
      },
    ],
    switchPoints: { type: Number, default: 0 },
    languageDistribution: { type: mongoose.Schema.Types.Mixed, default: {} },
    switchCount: { type: Number, default: 0 },
    complexityScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('CodeSwitchRadar', CodeSwitchRadarSchema);
