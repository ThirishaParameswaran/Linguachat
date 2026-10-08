import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    messageId: { type: String, required: true, unique: true, index: true },
    senderId: { type: String, required: true, index: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String, default: '' },
    receiverId: { type: String, index: true },
    groupId: { type: String, index: true },
    originalText: { type: String, required: true },
    content: { type: String },
    detectedLanguage: { type: String, default: 'en' },
    sourceLanguage: { type: String, default: 'en' },
    translatedText: { type: String, default: '' },
    translatedContent: { type: Map, of: String, default: {} },
    targetLanguage: { type: String, default: 'en' },
    confidenceScore: { type: Number, default: 90 },
    translationConfidence: { type: Number, default: 90 },
    echoChecked: { type: Boolean, default: false },
    echoResult: {
      targetLanguage: String,
      translatedText: String,
      backTranslatedText: String,
      fidelityScore: Number,
      meaningLossNotes: String,
      isConfirmed: Boolean,
    },
    sentimentScore: { type: Number, default: 0.0 },
    sentimentLabel: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    sentimentEmoji: { type: String, default: '😐' },
    radarId: { type: String },
    radarData: { type: mongoose.Schema.Types.Mixed },
    audioUrl: { type: String },
    fileUrl: { type: String },
    messageType: { type: String, enum: ['text', 'voice', 'image', 'file'], default: 'text' },
    isDeleted: { type: Boolean, default: false },
    replyTo: { type: String },
    isVoiceMessage: { type: Boolean, default: false },
    timestamp: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    readBy: [{ type: String }],
    deliveredTo: [{ type: String }],
    debtId: { type: String },
    highlightedWords: [
      {
        word: String,
        translation: String,
        definition: String,
        phonetic: String,
      },
    ],
  },
  { timestamps: true }
);

MessageSchema.pre('save', function (next) {
  if (this.originalText && !this.content) this.content = this.originalText;
  if (this.content && !this.originalText) this.originalText = this.content;
  if (this.confidenceScore && !this.translationConfidence) this.translationConfidence = this.confidenceScore;
  if (this.detectedLanguage && !this.sourceLanguage) this.sourceLanguage = this.detectedLanguage;
  next();
});

MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ groupId: 1 });

export default mongoose.model('Message', MessageSchema);
