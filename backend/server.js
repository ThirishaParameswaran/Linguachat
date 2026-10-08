import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initRedis } from './config/redis.js';
import { initializeSocketIO } from './sockets/socketHandler.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Connect MongoDB Atlas & Redis Cache
  await connectDB();
  await initRedis();

  const server = http.createServer(app);

  // Initialize Socket.IO Server
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  initializeSocketIO(io);

  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`LinguaChat Production Backend running on http://0.0.0.0:${PORT}`);
    logger.info(`Health check available at http://localhost:${PORT}/health`);
  });

  // Graceful shutdown handling
  const shutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down server gracefully...`);
    server.close(() => {
      logger.info('HTTP and Socket server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  logger.error('Fatal error during server startup:', err);
});
