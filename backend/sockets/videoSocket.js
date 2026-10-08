import logger from '../utils/logger.js';

export const registerVideoSocketHandlers = (io, socket) => {
  socket.on('call-user', (data) => {
    logger.info(`Video call initiated to target ${data.userToCall}`);
    io.emit('incoming-call', data);
  });

  socket.on('call-answered', (data) => {
    io.emit('call-answered', data);
  });

  socket.on('call-rejected', (data) => {
    io.emit('call-rejected', data);
  });

  socket.on('call-ended', (data) => {
    io.emit('call-ended', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.broadcast.emit('ice-candidate', data);
  });

  socket.on('screen-share', (data) => {
    io.emit('screen-share', data);
  });
};
