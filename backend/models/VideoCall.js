import mongoose from 'mongoose';

const VideoCallSchema = new mongoose.Schema(
  {
    callId: { type: String, required: true, unique: true, index: true },
    callType: { type: String, enum: ['1-on-1', 'group'], default: '1-on-1' },
    groupId: { type: String, index: true },
    title: { type: String, default: 'LinguaChat Video Meeting' },
    participants: [
      {
        userId: String,
        username: String,
        avatar: String,
        preferredLanguage: String,
        isMuted: Boolean,
        isVideoOff: Boolean,
        isScreenSharing: Boolean,
      },
    ],
    initiatorId: { type: String, required: true },
    startedAt: { type: String, default: () => new Date().toISOString() },
    endedAt: { type: String },
    durationSeconds: { type: Number, default: 0 },
    status: { type: String, enum: ['connecting', 'active', 'ended'], default: 'connecting' },
    recordingUrl: { type: String },
    isRecording: { type: Boolean, default: false },
    liveSubtitles: [
      {
        id: String,
        speakerName: String,
        originalText: String,
        sourceLang: String,
        translatedText: String,
        targetLang: String,
        timestamp: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('VideoCall', VideoCallSchema);
