import { registerChatSocketHandlers } from './chatSocket.js';
import { registerTranslationSocketHandlers } from './translationSocket.js';
import { registerVideoSocketHandlers } from './videoSocket.js';
import { registerAuditSocketHandlers } from './auditSocket.js';
import { registerDebtSocketHandlers } from './debtSocket.js';
import { registerRadarSocketHandlers } from './radarSocket.js';
import { registerCalendarSocketHandlers } from './calendarSocket.js';
import logger from '../utils/logger.js';

export const initializeSocketIO = (io) => {
  io.on('connection', (socket) => {
    logger.info(`New Socket.IO client connected: ${socket.id}`);

    // Join room handlers
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      logger.info(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      logger.info(`Socket ${socket.id} left room ${roomId}`);
    });

    // Register modular feature handlers
    registerChatSocketHandlers(io, socket);
    registerTranslationSocketHandlers(io, socket);
    registerVideoSocketHandlers(io, socket);
    registerAuditSocketHandlers(io, socket);
    registerDebtSocketHandlers(io, socket);
    registerRadarSocketHandlers(io, socket);
    registerCalendarSocketHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`Socket ${socket.id} disconnected: ${reason}`);
    });
  });
};
