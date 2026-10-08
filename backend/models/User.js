import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    username: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },

    profilePicture: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },

    nativeLanguage: {
      type: String,
      default: 'en',
    },

    preferredLanguage: {
      type: String,
      default: 'en',
    },

    cameraEnabled: {
      type: Boolean,
      default: true,
    },

    microphoneEnabled: {
      type: Boolean,
      default: true,
    },

    googleCalendarConnected: {
      type: Boolean,
      default: false,
    },

    isOnline: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      default: 'active',
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    lastSeen: {
      type: String,
      default: 'Just now',
    },

    role: {
      type: String,
      enum: ['user', 'translator_admin', 'reviewer'],
      default: 'user',
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: {
      type: String,
      select: false,
    },

    activeSessions: [
      {
        sessionId: String,
        device: String,
        ip: String,
        lastActive: String,
        status: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);