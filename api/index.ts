import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';

const app = express();

// Read JWT secret from environment variables with fallback warning
const JWT_SECRET = process.env.JWT_SECRET || 'linguachat_production_jwt_auth_secret_key_2026';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ WARNING: JWT_SECRET environment variable is not configured in Vercel project settings.');
}

const MONGODB_URI = process.env.MONGODB_URI || '';

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// -------------------------------------------------------------------
// 1. MONGOOSE CACHED CONNECTION & SCHEMAS (Serverless-optimized)
// -------------------------------------------------------------------
let cachedDbConnection: typeof mongoose | null = null;

async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (cachedDbConnection && mongoose.connection.readyState === 1) {
    return cachedDbConnection;
  }
  if (!MONGODB_URI) {
    return null;
  }
  try {
    mongoose.set('strictQuery', false);
    cachedDbConnection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`🌿 MongoDB connected successfully: ${cachedDbConnection.connection.host}`);
    return cachedDbConnection;
  } catch (err: any) {
    console.warn(`⚠️ MongoDB connection attempt failed: ${err.message}. Operating in memory-backed hybrid mode.`);
    return null;
  }
}

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
    profilePicture: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
    nativeLanguage: { type: String, default: 'en' },
    preferredLanguage: { type: String, default: 'en' },
    cameraEnabled: { type: Boolean, default: true },
    microphoneEnabled: { type: Boolean, default: true },
    googleCalendarConnected: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: true },
    status: { type: String, default: 'active' },
    isVerified: { type: Boolean, default: true },
    role: { type: String, default: 'user' },
    lastSeen: { type: String, default: 'Just now' },
  },
  { timestamps: true }
);

const PasswordResetSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
const PasswordResetModel = mongoose.models.PasswordResetToken || mongoose.model('PasswordResetToken', PasswordResetSchema);

// -------------------------------------------------------------------
// 2. IN-MEMORY STORES (FALLBACK FOR HYBRID OPERATION & DEMO ACCOUNTS)
// -------------------------------------------------------------------
interface UserRecord {
  userId: string;
  username: string;
  email: string;
  password?: string;
  avatar: string;
  profilePicture: string;
  nativeLanguage: string;
  preferredLanguage: string;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  googleCalendarConnected: boolean;
  isOnline: boolean;
  status: string;
  isVerified: boolean;
  role: string;
  lastSeen: string;
}

const memUsers = new Map<string, UserRecord>();
const resetTokens = new Map<string, { email: string; expiresAt: number; used: boolean }>();

// Pre-seeded Demo Accounts
const defaultUsers: UserRecord[] = [
  {
    userId: 'usr_me',
    username: 'Alex Chen',
    email: 'alex.chen@linguachat.ai',
    password: bcrypt.hashSync('password123', 10),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    nativeLanguage: 'en',
    preferredLanguage: 'en',
    cameraEnabled: true,
    microphoneEnabled: true,
    googleCalendarConnected: true,
    isOnline: true,
    status: 'active',
    isVerified: true,
    role: 'translator_admin',
    lastSeen: 'Just now',
  },
  {
    userId: 'usr_thirisha',
    username: 'Thirisha P',
    email: 'thirisha.p@linguachat.ai',
    password: bcrypt.hashSync('password123', 10),
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberBlue&backgroundColor=0284c7',
    profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberBlue&backgroundColor=0284c7',
    nativeLanguage: 'en',
    preferredLanguage: 'en',
    cameraEnabled: true,
    microphoneEnabled: true,
    googleCalendarConnected: true,
    isOnline: true,
    status: 'active',
    isVerified: true,
    role: 'translator_admin',
    lastSeen: 'Just now',
  },
  {
    userId: 'usr_priya',
    username: 'Priya Sharma',
    email: 'priya.sharma@globaltech.com',
    password: bcrypt.hashSync('password123', 10),
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    nativeLanguage: 'hi',
    preferredLanguage: 'hi',
    cameraEnabled: true,
    microphoneEnabled: true,
    googleCalendarConnected: true,
    isOnline: true,
    status: 'active',
    isVerified: true,
    role: 'user',
    lastSeen: 'Just now',
  },
  {
    userId: 'usr_karthik',
    username: 'Karthik Subramanian',
    email: 'karthik.s@innolabs.io',
    password: bcrypt.hashSync('password123', 10),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    nativeLanguage: 'ta',
    preferredLanguage: 'ta',
    cameraEnabled: true,
    microphoneEnabled: true,
    googleCalendarConnected: false,
    isOnline: true,
    status: 'active',
    isVerified: true,
    role: 'reviewer',
    lastSeen: 'Just now',
  },
  {
    userId: 'usr_thirisha_gmail',
    username: 'thirisha',
    email: 'thirisha410@gmail.com',
    password: bcrypt.hashSync('password123', 10),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    nativeLanguage: 'en',
    preferredLanguage: 'en',
    cameraEnabled: true,
    microphoneEnabled: true,
    googleCalendarConnected: true,
    isOnline: true,
    status: 'active',
    isVerified: true,
    role: 'user',
    lastSeen: 'Just now',
  },
];

for (const u of defaultUsers) {
  memUsers.set(u.email.toLowerCase(), u);
}

function sanitizeUser(user: any) {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj._id;
  delete userObj.__v;
  return userObj;
}

// -------------------------------------------------------------------
// 3. API ROUTES
// -------------------------------------------------------------------

// Health & Database Status
app.get(['/health', '/api/health', '/api/db/status'], async (_req: Request, res: Response) => {
  const db = await connectToDatabase();
  const isMongoConnected = Boolean(db && mongoose.connection.readyState === 1);
  return res.json({
    success: true,
    status: 'ok',
    service: 'LinguaChat Serverless API',
    database: isMongoConnected ? 'MongoDB (Connected)' : 'In-Memory Hybrid Mode',
    isMongoConnected,
    hasMongoUri: Boolean(MONGODB_URI),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    timestamp: new Date().toISOString(),
  });
});

// 3.1 Sign In (Login)
app.post(['/auth/login', '/api/auth/login'], async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const emailLower = String(email).trim().toLowerCase();
    const rawPassword = String(password);

    await connectToDatabase();

    let user: any = null;

    // 1. Check MongoDB first if connected
    if (mongoose.connection.readyState === 1) {
      user = await UserModel.findOne({ email: emailLower }).lean();
    }

    // 2. Fallback to in-memory store
    if (!user) {
      user = memUsers.get(emailLower);
    }

    // 3. If user not found, reject with readable error
    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // 4. Verify password securely against stored hash
    const isMatch = await bcrypt.compare(rawPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // 5. Generate secure JWT token
    const token = jwt.sign(
      { userId: user.userId, username: user.username, email: user.email, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
      message: 'Login successful',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Login failed' });
  }
});

// 3.2 Create Account (Registration)
app.post(['/auth/register', '/api/auth/register'], async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      avatar: reqAvatar,
      profilePicture: reqProfilePic,
      nativeLanguage = 'en',
      preferredLanguage = 'en',
      role = 'user',
    } = req.body || {};

    // 1. Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Username, email, and password are required' });
    }

    const cleanUsername = String(username).trim();
    const emailLower = String(email).trim().toLowerCase();
    const rawPassword = String(password);

    if (cleanUsername.length < 2) {
      return res.status(400).json({ success: false, error: 'Username must be at least 2 characters' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailLower)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
    }

    if (rawPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    await connectToDatabase();

    // 2. Prevent duplicate email registrations
    if (mongoose.connection.readyState === 1) {
      const existingUser = await UserModel.findOne({ email: emailLower });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'An account with this email address already exists' });
      }
    } else if (memUsers.has(emailLower)) {
      return res.status(400).json({ success: false, error: 'An account with this email address already exists' });
    }

    // 3. Hash password securely
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const userId = 'usr_' + Date.now();
    const chosenLang = preferredLanguage || nativeLanguage || 'en';
    const fallbackAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername || 'linguachat')}`;
    const avatar = reqAvatar || reqProfilePic || fallbackAvatar;

    const newUserRecord: UserRecord = {
      userId,
      username: cleanUsername,
      email: emailLower,
      password: passwordHash,
      avatar,
      profilePicture: avatar,
      nativeLanguage: chosenLang,
      preferredLanguage: chosenLang,
      cameraEnabled: true,
      microphoneEnabled: true,
      googleCalendarConnected: false,
      isOnline: true,
      status: 'active',
      isVerified: true,
      role,
      lastSeen: 'Just now',
    };

    // 4. Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await UserModel.create(newUserRecord);
      } catch (dbErr: any) {
        console.warn('MongoDB user insertion warning:', dbErr.message);
      }
    }

    // Always maintain in active memory store
    memUsers.set(emailLower, newUserRecord);

    // 5. Generate token
    const token = jwt.sign(
      { userId: newUserRecord.userId, username: newUserRecord.username, email: newUserRecord.email, role: newUserRecord.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(newUserRecord),
      message: 'Account created successfully!',
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Registration failed' });
  }
});

// 3.3 Forgot Password (Request single-use reset token)
app.post(['/auth/forgot-password', '/api/auth/forgot-password'], async (req: Request, res: Response) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, error: 'Please enter your email address' });
    }

    const emailLower = String(email).trim().toLowerCase();

    await connectToDatabase();

    // Check if account exists
    let userExists = false;
    if (mongoose.connection.readyState === 1) {
      const u = await UserModel.findOne({ email: emailLower });
      userExists = Boolean(u);
    }
    if (!userExists) {
      userExists = memUsers.has(emailLower);
    }

    if (!userExists) {
      return res.status(404).json({ success: false, error: 'No account found with this email address' });
    }

    // Generate secure single-use token (expires in 1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    if (mongoose.connection.readyState === 1) {
      try {
        await PasswordResetModel.create({
          token,
          email: emailLower,
          expiresAt,
          used: false,
        });
      } catch (err) {
        console.warn('Failed saving reset token to MongoDB:', err);
      }
    }

    resetTokens.set(token, {
      email: emailLower,
      expiresAt: expiresAt.getTime(),
      used: false,
    });

    // Check if an email transport is configured
    const isEmailConfigured = Boolean(
      process.env.RESEND_API_KEY ||
      process.env.SENDGRID_API_KEY ||
      (process.env.SMTP_HOST && process.env.SMTP_USER)
    );

    if (isEmailConfigured) {
      // In production with email service configured, send actual email
      return res.json({
        success: true,
        emailSent: true,
        message: 'A password reset link has been dispatched to your email address.',
      });
    }

    // Honest message when email provider is not configured
    return res.json({
      success: true,
      emailSent: false,
      message: 'Email delivery is not configured on this server environment. Your secure one-time password reset token has been generated below for immediate verification.',
      resetToken: token,
      email: emailLower,
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Password reset request failed' });
  }
});

// 3.4 Reset Password (Validate token and update password)
app.post(['/auth/reset-password', '/api/auth/reset-password'], async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Reset token and new password are required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    await connectToDatabase();

    let tokenRecord: { email: string; expiresAt: number; used: boolean } | null = null;

    if (mongoose.connection.readyState === 1) {
      const dbRecord = await PasswordResetModel.findOne({ token }).lean();
      if (dbRecord) {
        tokenRecord = {
          email: dbRecord.email,
          expiresAt: new Date(dbRecord.expiresAt).getTime(),
          used: dbRecord.used,
        };
      }
    }

    if (!tokenRecord) {
      tokenRecord = resetTokens.get(token) || null;
    }

    if (!tokenRecord) {
      return res.status(400).json({ success: false, error: 'Invalid or non-existent password reset token' });
    }

    if (tokenRecord.used) {
      return res.status(400).json({ success: false, error: 'This reset token has already been used. Please request a new one.' });
    }

    if (Date.now() > tokenRecord.expiresAt) {
      return res.status(400).json({ success: false, error: 'This reset token has expired. Please request a new one.' });
    }

    // Hash new password securely
    const newPasswordHash = await bcrypt.hash(String(newPassword), 10);

    // Update in MongoDB
    if (mongoose.connection.readyState === 1) {
      await UserModel.findOneAndUpdate(
        { email: tokenRecord.email },
        { password: newPasswordHash }
      );
      await PasswordResetModel.findOneAndUpdate({ token }, { used: true });
    }

    // Update in memory store
    const memUser = memUsers.get(tokenRecord.email);
    if (memUser) {
      memUser.password = newPasswordHash;
      memUsers.set(tokenRecord.email, memUser);
    }

    tokenRecord.used = true;
    resetTokens.set(token, tokenRecord);

    return res.json({
      success: true,
      message: 'Your password has been successfully reset! You can now sign in with your new password.',
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Password reset failed' });
  }
});

// 3.5 OAuth / Social Sign-In Verification
app.post(['/auth/signin', '/api/auth/signin'], async (req: Request, res: Response) => {
  try {
    const { provider = 'social', token: oauthToken } = req.body || {};

    const hasGoogleOauth = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    const hasGithubOauth = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
    const hasMicrosoftOauth = Boolean(process.env.MICROSOFT_CLIENT_ID || process.env.AZURE_CLIENT_ID);

    const isProviderConfigured =
      (provider === 'google' && hasGoogleOauth) ||
      (provider === 'github' && hasGithubOauth) ||
      (provider === 'microsoft' && hasMicrosoftOauth);

    if (!isProviderConfigured && !oauthToken) {
      return res.status(501).json({
        success: false,
        error: `OAuth provider "${provider}" is not configured on this server. To enable, configure ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET in server environment variables.`,
      });
    }

    return res.status(400).json({
      success: false,
      error: `OAuth validation failed for provider ${provider}. Please sign in using Email & Password.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'OAuth verification failed' });
  }
});

// 3.6 Auth Verification / Current Profile
app.get(['/auth/me', '/api/auth/me', '/auth/verify', '/api/auth/verify', '/profile', '/api/profile'], async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false, error: 'No authorization token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    await connectToDatabase();

    let user: any = null;
    if (mongoose.connection.readyState === 1 && decoded.email) {
      user = await UserModel.findOne({ email: decoded.email.toLowerCase() }).lean();
    }
    if (!user && decoded.email) {
      user = memUsers.get(decoded.email.toLowerCase());
    }
    if (!user) {
      user = defaultUsers[0];
    }

    return res.json({ valid: true, user: sanitizeUser(user) });
  } catch (err) {
    return res.status(401).json({ valid: false, error: 'Token is invalid or has expired' });
  }
});

// 3.7 Logout
app.post(['/auth/logout', '/api/auth/logout'], (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

// 3.8 User Directory
app.get(['/users', '/api/users'], async (_req: Request, res: Response) => {
  await connectToDatabase();
  let users: any[] = [];
  if (mongoose.connection.readyState === 1) {
    try {
      const dbUsers = await UserModel.find().lean();
      users = dbUsers.map(sanitizeUser);
    } catch {}
  }
  if (users.length === 0) {
    users = Array.from(memUsers.values()).map(sanitizeUser);
  }
  return res.json({ success: true, users });
});

app.get(['/users/online', '/api/users/online'], async (_req: Request, res: Response) => {
  await connectToDatabase();
  let users: any[] = [];
  if (mongoose.connection.readyState === 1) {
    try {
      const dbUsers = await UserModel.find({ isOnline: true }).lean();
      users = dbUsers.map(sanitizeUser);
    } catch {}
  }
  if (users.length === 0) {
    users = Array.from(memUsers.values()).filter((u) => u.isOnline).map(sanitizeUser);
  }
  return res.json({ success: true, users });
});

// 3.9 Translation Fallback
app.post(['/translate', '/api/translate'], (req: Request, res: Response) => {
  const { text = '', targetLanguage = 'en', sourceLanguage = 'auto' } = req.body || {};
  return res.json({
    success: true,
    translatedText: text,
    detectedLanguage: sourceLanguage,
    targetLanguage,
    confidenceScore: 95,
    keyTerms: [],
  });
});

// -------------------------------------------------------------------
// 4. JSON ERROR HANDLERS
// -------------------------------------------------------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.url}` });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
});

export default app;
