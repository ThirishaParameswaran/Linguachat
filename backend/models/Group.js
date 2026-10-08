import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    avatar: { type: String, default: '' },
    members: [
      {
        userId: { type: String, required: true },
        username: { type: String, required: true },
        preferredLanguage: { type: String, default: 'en' },
      },
    ],
    languages: [{ type: String }],
    lastMessage: { type: String, default: '' },
    lastMessageTime: { type: String, default: '' },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Group', GroupSchema);
