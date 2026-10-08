export const registerRadarSocketHandlers = (io, socket) => {
  socket.on('code-switch-update', (data) => {
    io.emit('code-switch-update', data);
  });
};
