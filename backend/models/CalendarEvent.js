import mongoose from 'mongoose';

const CalendarEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    googleEventId: { type: String },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    translatedTitle: { type: String, default: '' },
    translatedDescription: { type: String, default: '' },
    targetLanguage: { type: String, default: 'en' },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    timezone: { type: String, default: 'UTC' },
    attendees: [
      {
        email: String,
        name: String,
        language: String,
      },
    ],
    videoCallLink: { type: String, default: '' },
    meetingTranscriptId: { type: String },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

export default mongoose.model('CalendarEvent', CalendarEventSchema);
