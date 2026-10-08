export const registerAuditSocketHandlers = (io, socket) => {
  socket.on('correction-proposed', (data) => {
    io.emit('correction-proposed', data);
  });

  socket.on('correction-approved', (data) => {
    io.emit('correction-approved', data);
  });

  socket.on('correction-rejected', (data) => {
    io.emit('correction-rejected', data);
  });
};
