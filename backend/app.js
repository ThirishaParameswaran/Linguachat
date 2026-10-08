import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import translationRoutes from './routes/translationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import radarRoutes from './routes/radarRoutes.js';
import debtRoutes from './routes/debtRoutes.js';
import vocabRoutes from './routes/vocabRoutes.js';
import learnRoutes from './routes/learnRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';

import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and CORS middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoints
const healthResponse = (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'LinguaChat Backend',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
};
app.get('/health', healthResponse);
app.get('/api/health', healthResponse);

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', translationRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/radar', radarRoutes);
app.use('/api/debt', debtRoutes);
app.use('/api/vocabulary', vocabRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/calendar', calendarRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
