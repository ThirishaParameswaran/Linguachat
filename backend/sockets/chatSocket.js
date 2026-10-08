import logger from '../utils/logger.js';

export const registerChatSocketHandlers = (io, socket) => {
  // Send Message
  socket.on('send-message', (data) => {
    logger.info(`Socket event 'send-message' received from ${socket.id}`);
    const messagePayload = {
      ...data,
      messageId: data.messageId || 'msg_' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    if (data.groupId) {
      io.to(`group_${data.groupId}`).emit('receive-message', messagePayload);
    } else if (data.receiverId) {
      io.to(`user_${data.receiverId}`).emit('receive-message', messagePayload);
      socket.emit('receive-message', messagePayload);
    } else {
      io.emit('receive-message', messagePayload);
    }
  });

  // Typing indicators
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });

  socket.on('stop-typing', (data) => {
    socket.broadcast.emit('stop-typing', data);
  });

  // Message read receipts & deletion
  socket.on('message-read', (data) => {
    io.emit('message-read', data);
  });

  socket.on('message-deleted', (data) => {
    io.emit('message-deleted', data);
  });
};
